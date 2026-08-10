import { parseHoldingRef } from './load';
import { evidenceLevel, type EvidenceLevel, type GraphQuery } from './query';
import type {
  Argument, Concept, Equivalence, HoldsRelation, IntersectionSideKind, LocalizedString,
  Objection, Passage, Position, Question, RealWorldCase, School, Thinker, Tracer, Tradition,
} from './types';

/** Research F.4: five projections, one graph. Everything below is a query, never a copy. */

export interface HoldingView {
  holds: HoldsRelation;
  thinker: Thinker;
  school?: School;
  tradition?: Tradition;
  position: Position;
  passages: Passage[];
  evidence: EvidenceLevel;
}

export interface ClaimView<T> {
  claim: T;
  passages: Passage[];
  evidence: EvidenceLevel;
  attributedTo: Thinker[];
}

export interface PositionView {
  position: Position;
  holdings: HoldingView[];
  traditions: Tradition[];
  arguments: Array<ClaimView<Argument>>;
  objections: Array<ClaimView<Objection>>;
  strongestObjection?: ClaimView<Objection>;
  intersections: IntersectionView[];
  case?: RealWorldCase;
  /** True when every recorded holding is contested or uncertain. */
  allAttributionsQualified: boolean;
}

export interface IntersectionSide {
  ref: string;
  kind: IntersectionSideKind;
  /** Present when the side names a Position (the F.5 case). */
  position?: Position;
  /** Present when the side names a whole debate rather than a position (research B.2, intersection 3). */
  question?: Question;
  /** Present when the side names a dilemma held as an Objection node. */
  objection?: Objection;
  holding?: HoldingView;
  /** What to call this side. */
  label: LocalizedString;
  /** Chain from the person outward: thinker → school → tradition. The confluence diagram draws this. */
  chain: string[];
}

export interface IntersectionView {
  equivalence: Equivalence;
  a: IntersectionSide;
  b: IntersectionSide;
  crossesTraditions: boolean;
  question?: Question;
}

export interface QuestionView {
  question: Question;
  /** Positions that answer the question. */
  answers: PositionView[];
  /** Positions that reject the question's framing (research A.4). Never rendered as an empty answer slot. */
  refusals: PositionView[];
  intersections: IntersectionView[];
  cases: RealWorldCase[];
  tracer?: Tracer;
  /** Every passage cited anywhere on the page, in first-reference order — the critical-edition apparatus. */
  apparatus: Passage[];
}

export function holdingView(g: GraphQuery, h: HoldsRelation): HoldingView | undefined {
  const thinker = g.thinker(h.thinker);
  const position = g.position(h.position);
  if (!thinker || !position) return undefined;
  const school = thinker.school ? g.school(thinker.school) : undefined;
  return {
    holds: h,
    thinker,
    school,
    tradition: g.traditionOf(thinker.id),
    position,
    passages: g.passages(h.sourcePassages),
    evidence: evidenceLevel(g, h.sourcePassages),
  };
}

function claimView<T extends { sourcePassages?: string[]; attributedTo?: string[] }>(
  g: GraphQuery, claim: T,
): ClaimView<T> {
  return {
    claim,
    passages: g.passages(claim.sourcePassages),
    evidence: evidenceLevel(g, claim.sourcePassages),
    attributedTo: (claim.attributedTo ?? []).map((id) => g.thinker(id)).filter((t): t is Thinker => !!t),
  };
}

export function positionView(g: GraphQuery, positionId: string): PositionView | undefined {
  const position = g.position(positionId);
  if (!position) return undefined;

  const holdings = g.holdingsOf(positionId)
    .map((h) => holdingView(g, h))
    .filter((h): h is HoldingView => !!h);

  const traditions: Tradition[] = [];
  for (const h of holdings) {
    if (h.tradition && !traditions.some((t) => t.id === h.tradition!.id)) traditions.push(h.tradition);
  }

  const args = g.argumentsFor(positionId).map((a) => claimView(g, a));
  const objs = g.objectionsTo(positionId).map((o) => claimView(g, o));
  const strongest = g.strongestObjectionTo(positionId);

  return {
    position,
    holdings,
    traditions,
    arguments: args,
    objections: objs,
    strongestObjection: strongest ? claimView(g, strongest) : undefined,
    intersections: g.equivalencesTouching(positionId).map((e) => intersectionView(g, e)),
    case: g.caseForPosition(positionId),
    allAttributionsQualified:
      holdings.length > 0 && holdings.every((h) => h.holds.epistemicStatus !== 'settled'),
  };
}

export function intersectionView(g: GraphQuery, e: Equivalence): IntersectionView {
  const side = (ref: string, traditionHint?: string): IntersectionSide => {
    const { position: nid, thinker: tid } = parseHoldingRef(ref);
    const position = g.position(nid);
    const question = position ? undefined : g.question(nid);
    const objection = position || question ? undefined : g.objection(nid);
    const holds = position && tid ? g.holding(nid, tid) : undefined;
    const holding = holds ? holdingView(g, holds) : undefined;

    const chain: string[] = [];
    if (holding) {
      chain.push(holding.thinker.name);
      if (holding.school) chain.push(labelText(holding.school.label));
      if (holding.tradition) chain.push(labelText(holding.tradition.label));
    } else if (objection) {
      chain.push(labelText(objection.label ?? objection.id));
      for (const t of objection.attributedTo ?? []) {
        const th = g.thinker(t);
        if (th) chain.push(th.name);
      }
    } else if (question) {
      chain.push(labelText(question.technicalName ?? question.canonical));
    }
    const hint = traditionHint ? g.tradition(traditionHint) : undefined;
    if (hint && !chain.includes(labelText(hint.label))) chain.push(labelText(hint.label));

    const kind: IntersectionSideKind =
      position ? 'position' : question ? 'question' : objection ? 'objection' : 'unresolved';
    const label: LocalizedString =
      position?.shortLabel ?? position?.label ?? objection?.label ??
      question?.technicalName ?? question?.canonical ?? ref;

    return { ref, kind, position, question, objection, holding, label, chain };
  };

  const a = side(e.positionA, e.traditions?.[0]);
  const b = side(e.positionB, e.traditions?.[1]);
  const qid = e.question ?? a.position?.answersQuestion ?? b.position?.answersQuestion ??
    a.question?.id ?? b.question?.id;

  const tradA = a.holding?.tradition?.id ?? e.traditions?.[0];
  const tradB = b.holding?.tradition?.id ?? e.traditions?.[1];

  return {
    equivalence: e,
    a,
    b,
    crossesTraditions: !!tradA && !!tradB && tradA !== tradB,
    question: qid ? g.question(qid) : undefined,
  };
}

export function questionView(g: GraphQuery, questionId: string): QuestionView | undefined {
  const question = g.question(questionId);
  if (!question) return undefined;

  const all = g.positionsFor(questionId)
    .map((p) => positionView(g, p.id))
    .filter((p): p is PositionView => !!p);

  const answers = all.filter((p) => !p.position.refusesQuestion);
  const refusals = all.filter((p) => p.position.refusesQuestion);
  const intersections = g.equivalencesFor(questionId).map((e) => intersectionView(g, e));

  const apparatus: Passage[] = [];
  const seen = new Set<string>();
  const collect = (ps: Passage[]) => {
    for (const p of ps) if (!seen.has(p.id)) { seen.add(p.id); apparatus.push(p); }
  };
  for (const p of all) {
    for (const h of p.holdings) collect(h.passages);
    for (const a of p.arguments) collect(a.passages);
    for (const o of p.objections) collect(o.passages);
  }

  return {
    question,
    answers,
    refusals,
    intersections,
    cases: g.casesFor(questionId),
    tracer: g.tracerFor(questionId),
    apparatus,
  };
}

export interface ThinkerView {
  thinker: Thinker;
  tradition?: Tradition;
  school?: School;
  holdings: Array<HoldingView & { question?: Question }>;
}

export function thinkerView(g: GraphQuery, thinkerId: string): ThinkerView | undefined {
  const thinker = g.thinker(thinkerId);
  if (!thinker) return undefined;
  const holdings = g.holdingsBy(thinkerId)
    .map((h) => holdingView(g, h))
    .filter((h): h is HoldingView => !!h)
    .map((h) => ({
      ...h,
      question: h.position.answersQuestion ? g.question(h.position.answersQuestion) : undefined,
    }));
  return {
    thinker,
    tradition: g.traditionOf(thinkerId),
    school: thinker.school ? g.school(thinker.school) : undefined,
    holdings,
  };
}

export interface QuestionMapEntry {
  question: Question;
  positionCount: number;
  refusalCount: number;
  traditions: Tradition[];
  intersectionCount: number;
  crossTraditionIntersectionCount: number;
  sourcedClaimCount: number;
  unsourcedClaimCount: number;
}

/** The home page: the question map (research F.4, "Question map = traverse Question→Position"). */
export function questionMap(g: GraphQuery): QuestionMapEntry[] {
  return g.questions().map((question) => {
    const positions = g.positionsFor(question.id);
    const traditions: Tradition[] = [];
    let sourced = 0, unsourced = 0;
    for (const p of positions) {
      for (const h of g.holdingsOf(p.id)) {
        if ((h.sourcePassages ?? []).length) sourced++; else unsourced++;
        const t = g.traditionOf(h.thinker);
        if (t && !traditions.some((x) => x.id === t.id)) traditions.push(t);
      }
    }
    const ints = g.equivalencesFor(question.id).map((e) => intersectionView(g, e));
    return {
      question,
      positionCount: positions.filter((p) => !p.refusesQuestion).length,
      refusalCount: positions.filter((p) => p.refusesQuestion).length,
      traditions,
      intersectionCount: ints.length,
      crossTraditionIntersectionCount: ints.filter((i) => i.crossesTraditions).length,
      sourcedClaimCount: sourced,
      unsourcedClaimCount: unsourced,
    };
  });
}

export interface ConceptView {
  concept: Concept;
  cluster: Concept[];
  tradition?: Tradition;
}

export function conceptView(g: GraphQuery, id: string): ConceptView | undefined {
  const concept = g.concept(id);
  if (!concept) return undefined;
  return {
    concept,
    cluster: (concept.cluster ?? []).map((c) => g.concept(c)).filter((c): c is Concept => !!c),
    tradition: concept.tradition ? g.tradition(concept.tradition) : undefined,
  };
}

/** Minimal, locale-agnostic label read used inside the graph layer only. Components use i18n instead. */
function labelText(v: string | Partial<Record<'en' | 'tr', string>>): string {
  return typeof v === 'string' ? v : (v.en ?? v.tr ?? '');
}
