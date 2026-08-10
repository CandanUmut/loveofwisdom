import { loadGraph, parseHoldingRef, type LoadedGraph } from './load';
import type {
  Argument, Concept, Equivalence, GraphFragment, HoldsRelation, Objection,
  Passage, Position, Question, RealWorldCase, School, Thinker, Tracer, Tradition,
} from './types';

/**
 * The whole application talks to the graph through this interface and never
 * touches the loaded maps. Research F.4: every view is a query over one graph,
 * never a copy. Swapping the in-memory implementation for Neo4j or an RDF store
 * later means writing another class here — components do not change.
 */
export interface GraphQuery {
  questions(): Question[];
  question(id: string): Question | undefined;
  positions(): Position[];
  position(id: string): Position | undefined;
  positionsFor(questionId: string): Position[];
  thinker(id: string): Thinker | undefined;
  thinkers(): Thinker[];
  school(id: string): School | undefined;
  tradition(id: string): Tradition | undefined;
  traditionOf(thinkerId: string): Tradition | undefined;
  holdingsOf(positionId: string): HoldsRelation[];
  holdingsBy(thinkerId: string): HoldsRelation[];
  holding(positionId: string, thinkerId: string): HoldsRelation | undefined;
  argumentsFor(positionId: string): Argument[];
  objection(id: string): Objection | undefined;
  objectionsTo(targetId: string): Objection[];
  strongestObjectionTo(positionId: string): Objection | undefined;
  equivalences(): Equivalence[];
  equivalencesFor(questionId: string): Equivalence[];
  equivalencesTouching(positionId: string): Equivalence[];
  passage(id: string): Passage | undefined;
  passages(ids: string[] | undefined): Passage[];
  concept(id: string): Concept | undefined;
  concepts(): Concept[];
  casesFor(questionId: string): RealWorldCase[];
  caseForPosition(positionId: string): RealWorldCase | undefined;
  tracerFor(questionId: string): Tracer | undefined;
  issues(): LoadedGraph['issues'];
}

/** How well a claim is evidenced. Drives the apparatus mark the reader sees. */
export type EvidenceLevel = 'quoted' | 'unverified-locus' | 'none';

export function evidenceLevel(g: GraphQuery, ids: string[] | undefined): EvidenceLevel {
  const list = g.passages(ids);
  if (list.length === 0) return 'none';
  return list.some((p) => typeof p.text === 'string' && p.text.length > 0) ? 'quoted' : 'unverified-locus';
}

export class InMemoryGraph implements GraphQuery {
  private g: LoadedGraph;
  private holdsByPosition = new Map<string, HoldsRelation[]>();
  private holdsByThinker = new Map<string, HoldsRelation[]>();
  private argsByPosition = new Map<string, Argument[]>();
  private objByTarget = new Map<string, Objection[]>();

  constructor(g: LoadedGraph) {
    this.g = g;
    for (const h of g.holds) {
      push(this.holdsByPosition, h.position, h);
      push(this.holdsByThinker, h.thinker, h);
    }
    for (const a of g.arguments.values()) push(this.argsByPosition, a.supports, a);
    for (const o of g.objections.values()) push(this.objByTarget, o.targets, o);
  }

  static fromFragments(fragments: Array<{ name: string; data: GraphFragment }>) {
    return new InMemoryGraph(loadGraph(fragments));
  }

  questions() { return [...this.g.questions.values()]; }
  question(id: string) { return this.g.questions.get(id); }
  positions() { return [...this.g.positions.values()]; }
  position(id: string) { return this.g.positions.get(id); }
  positionsFor(questionId: string) {
    return this.positions().filter((p) => p.answersQuestion === questionId);
  }
  thinker(id: string) { return this.g.thinkers.get(id); }
  thinkers() { return [...this.g.thinkers.values()]; }
  school(id: string) { return this.g.schools.get(id); }
  tradition(id: string) { return this.g.traditions.get(id); }
  traditionOf(thinkerId: string) {
    const t = this.thinker(thinkerId);
    if (!t) return undefined;
    if (t.tradition) return this.tradition(t.tradition);
    if (t.school) return this.tradition(this.school(t.school)?.within ?? '');
    return undefined;
  }
  holdingsOf(positionId: string) { return this.holdsByPosition.get(positionId) ?? []; }
  holdingsBy(thinkerId: string) { return this.holdsByThinker.get(thinkerId) ?? []; }
  holding(positionId: string, thinkerId: string) {
    return this.holdingsOf(positionId).find((h) => h.thinker === thinkerId);
  }
  argumentsFor(positionId: string) { return this.argsByPosition.get(positionId) ?? []; }
  objection(id: string) { return this.g.objections.get(id); }
  objectionsTo(targetId: string) { return this.objByTarget.get(targetId) ?? []; }

  /**
   * The single best-attributed objection (research I.3b). "Best attributed" is
   * decided by the graph, not by an editor's ordering: an explicit `strongest`
   * flag wins, then a quoted passage beats an unverified locus, then a named
   * attribution beats an anonymous one. Objections to the position's supporting
   * arguments count too — an objection that dismantles the best argument for a
   * view is an objection to the view.
   */
  strongestObjectionTo(positionId: string): Objection | undefined {
    const direct = this.objectionsTo(positionId);
    const viaArgs = this.argumentsFor(positionId).flatMap((a) => this.objectionsTo(a.id));
    const all = [...direct, ...viaArgs];
    if (all.length === 0) return undefined;
    const score = (o: Objection) =>
      (o.strongest ? 100 : 0) +
      ({ quoted: 20, 'unverified-locus': 10, none: 0 } as const)[evidenceLevel(this, o.sourcePassages)] +
      ((o.attributedTo ?? []).length > 0 ? 5 : 0) +
      (direct.includes(o) ? 2 : 0);
    return [...all].sort((a, b) => score(b) - score(a))[0];
  }

  equivalences() { return this.g.equivalences; }
  equivalencesFor(questionId: string) {
    return this.g.equivalences.filter((e) => {
      if (e.question) return e.question === questionId;
      const a = this.position(parseHoldingRef(e.positionA).position);
      const b = this.position(parseHoldingRef(e.positionB).position);
      return a?.answersQuestion === questionId || b?.answersQuestion === questionId;
    });
  }
  equivalencesTouching(positionId: string) {
    return this.g.equivalences.filter((e) =>
      parseHoldingRef(e.positionA).position === positionId ||
      parseHoldingRef(e.positionB).position === positionId);
  }
  passage(id: string) { return this.g.passages.get(id); }
  passages(ids: string[] | undefined) {
    return (ids ?? []).map((id) => this.passage(id)).filter((p): p is Passage => !!p);
  }
  concept(id: string) { return this.g.concepts.get(id); }
  concepts() { return [...this.g.concepts.values()]; }
  casesFor(questionId: string) {
    return [...this.g.cases.values()].filter((c) => c.question === questionId);
  }
  caseForPosition(positionId: string) {
    return [...this.g.cases.values()].find((c) => c.implications.some((i) => i.position === positionId));
  }
  tracerFor(questionId: string) {
    return [...this.g.tracers.values()].find((t) => t.question === questionId);
  }
  issues() { return this.g.issues; }
}

function push<K, V>(m: Map<K, V[]>, k: K, v: V) {
  const cur = m.get(k);
  if (cur) cur.push(v);
  else m.set(k, [v]);
}
