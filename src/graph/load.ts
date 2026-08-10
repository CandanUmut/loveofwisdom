import type {
  Argument, Concept, Equivalence, GraphFragment, HoldingRef, HoldsRelation, Influence,
  Objection, Passage, Position, Question, RealWorldCase, School, Text, Thinker, Tracer, Tradition,
} from './types';

/** Parse `P_DCT@al_Ashari` (research F.5) or a bare position id. */
export function parseHoldingRef(ref: string): HoldingRef {
  const at = ref.indexOf('@');
  if (at === -1) return { position: ref };
  return { position: ref.slice(0, at), thinker: ref.slice(at + 1) };
}

export function formatHoldingRef(r: HoldingRef): string {
  return r.thinker ? `${r.position}@${r.thinker}` : r.position;
}

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface Issue {
  severity: IssueSeverity;
  code: string;
  message: string;
  where?: string;
}

export interface LoadedGraph {
  questions: Map<string, Question>;
  positions: Map<string, Position>;
  thinkers: Map<string, Thinker>;
  schools: Map<string, School>;
  traditions: Map<string, Tradition>;
  holds: HoldsRelation[];
  arguments: Map<string, Argument>;
  objections: Map<string, Objection>;
  equivalences: Equivalence[];
  influences: Influence[];
  texts: Map<string, Text>;
  passages: Map<string, Passage>;
  concepts: Map<string, Concept>;
  cases: Map<string, RealWorldCase>;
  tracers: Map<string, Tracer>;
  issues: Issue[];
}

const KEYED: Array<keyof LoadedGraph & keyof GraphFragment> = [
  'questions', 'positions', 'thinkers', 'schools', 'traditions',
  'arguments', 'objections', 'texts', 'passages', 'concepts', 'cases', 'tracers',
];

/**
 * Merge any number of fragments into one graph.
 *
 * Dangling `thinker` and `sourcePassages` references become explicit *placeholder*
 * nodes rather than silent holes: the F.5 acceptance seed names four thinkers and a
 * passage (`PSG_ockham_sent`) it never defines, and the honest rendering of that is
 * "referenced but not yet described", not a fabricated record. Site content is linted
 * separately (`npm run validate`) so placeholders never ship unnoticed.
 */
export function loadGraph(fragments: Array<{ name: string; data: GraphFragment }>): LoadedGraph {
  const issues: Issue[] = [];
  const maps: Record<string, Map<string, any>> = {};
  for (const k of KEYED) maps[k] = new Map();

  const holds: HoldsRelation[] = [];
  const equivalences: Equivalence[] = [];
  const influences: Influence[] = [];

  for (const { name, data } of fragments) {
    for (const k of KEYED) {
      const rows = (data as any)[k] as Array<{ id: string }> | undefined;
      if (!rows) continue;
      for (const row of rows) {
        const existing = maps[k].get(row.id);
        if (existing && !(existing as any).placeholder) {
          issues.push({
            severity: 'error', code: 'duplicate-id', where: `${name}:${k}`,
            message: `Duplicate ${k} id "${row.id}". Each entity is defined exactly once; use references instead of copies.`,
          });
          continue;
        }
        maps[k].set(row.id, row);
      }
    }
    if (data.holds) holds.push(...data.holds);
    if (data.equivalences) equivalences.push(...data.equivalences);
    if (data.influences) influences.push(...data.influences);
  }

  const g: LoadedGraph = {
    questions: maps.questions, positions: maps.positions, thinkers: maps.thinkers,
    schools: maps.schools, traditions: maps.traditions, holds,
    arguments: maps.arguments, objections: maps.objections, equivalences, influences,
    texts: maps.texts, passages: maps.passages, concepts: maps.concepts,
    cases: maps.cases, tracers: maps.tracers, issues,
  };

  synthesizePlaceholders(g);
  checkIntegrity(g);
  return g;
}

/** Turn an id like `al_Ashari` into `al Ashari` — a mechanical de-slug, not a guess at a real name. */
function deslug(id: string): string {
  return id.replace(/[_-]+/g, ' ').trim();
}

function synthesizePlaceholders(g: LoadedGraph) {
  const needThinker = new Set<string>();
  const needPassage = new Set<string>();

  for (const h of g.holds) {
    if (!g.thinkers.has(h.thinker)) needThinker.add(h.thinker);
    for (const p of h.sourcePassages ?? []) if (!g.passages.has(p)) needPassage.add(p);
  }
  for (const coll of [g.arguments, g.objections]) {
    for (const row of coll.values()) {
      for (const p of (row as Argument | Objection).sourcePassages ?? []) {
        if (!g.passages.has(p)) needPassage.add(p);
      }
      for (const t of (row as Argument | Objection).attributedTo ?? []) {
        if (!g.thinkers.has(t)) needThinker.add(t);
      }
    }
  }
  for (const e of g.equivalences) {
    for (const ref of [e.positionA, e.positionB]) {
      const { thinker } = parseHoldingRef(ref);
      if (thinker && !g.thinkers.has(thinker)) needThinker.add(thinker);
    }
  }

  for (const id of needThinker) {
    g.thinkers.set(id, { id, name: deslug(id), placeholder: true, wikidata: null });
    g.issues.push({
      severity: 'warning', code: 'placeholder-thinker', where: `thinkers:${id}`,
      message: `Thinker "${id}" is referenced but never described. Rendering as "referenced, not yet described".`,
    });
  }
  for (const id of needPassage) {
    g.passages.set(id, {
      id, placeholder: true, attested: false, locusUnverified: true,
      citation: `${deslug(id)} — passage record not yet written`,
    });
    g.issues.push({
      severity: 'warning', code: 'placeholder-passage', where: `passages:${id}`,
      message: `Passage "${id}" is cited but never defined. Rendering as "locus not verified" — no text is invented.`,
    });
  }
}

function checkIntegrity(g: LoadedGraph) {
  const err = (code: string, where: string, message: string) =>
    g.issues.push({ severity: 'error', code, where, message });
  const warn = (code: string, where: string, message: string) =>
    g.issues.push({ severity: 'warning', code, where, message });
  const info = (code: string, where: string, message: string) =>
    g.issues.push({ severity: 'info', code, where, message });

  for (const p of g.positions.values()) {
    if (p.answersQuestion && !g.questions.has(p.answersQuestion)) {
      err('dangling-question', `positions:${p.id}`, `answersQuestion "${p.answersQuestion}" does not exist.`);
    }
  }

  for (const h of g.holds) {
    const where = `holds:${h.thinker}->${h.position}`;
    if (!g.positions.has(h.position)) err('dangling-position', where, `position "${h.position}" does not exist.`);
    const sourced = (h.sourcePassages ?? []).length > 0;
    if (h.epistemicStatus === 'settled' && !sourced) {
      warn('unsourced-settled-attribution', where,
        'Attribution is marked "settled" but cites no passage. The UI shows it as "no source passage recorded".');
    }
    if (h.epistemicStatus === 'contested' && !h.scholarlyDispute && !(h.sides ?? []).length) {
      warn('contested-without-sides', where,
        'Contested attribution names no sides. A contested claim must show who reads it which way.');
    }
  }

  for (const e of g.equivalences) {
    const where = `equivalences:${e.positionA}~${e.positionB}`;
    for (const ref of [e.positionA, e.positionB]) {
      const { position, thinker } = parseHoldingRef(ref);
      // An intersection side may name a Position, a Question or an Objection: research
      // B.2's third intersection relates a dilemma to a debate, not a position to a position.
      const resolves = g.positions.has(position) || g.questions.has(position) || g.objections.has(position);
      if (!resolves) err('dangling-intersection-side', where,
        `"${position}" is not a position, question or objection.`);
      if (thinker) {
        const held = g.holds.some((h) => h.position === position && h.thinker === thinker);
        if (!held) err('equivalence-without-holding', where,
          `"${ref}" names no recorded holding: there is no holds relation for ${thinker} -> ${position}.`);
      }
    }
    if (e.convergenceType === 'genuine' && !e.partsWaysOn) {
      warn('genuine-without-divergence', where,
        'A "genuine" convergence with no partsWaysOn reads as an identity claim. Name where they part ways.');
    }
  }

  for (const o of g.objections.values()) {
    if (!g.positions.has(o.targets) && !g.arguments.has(o.targets)) {
      err('dangling-target', `objections:${o.id}`, `targets "${o.targets}" is neither a position nor an argument.`);
    }
  }
  for (const a of g.arguments.values()) {
    if (!g.positions.has(a.supports)) {
      err('dangling-position', `arguments:${a.id}`, `supports "${a.supports}" does not exist.`);
    }
  }

  for (const c of g.cases.values()) {
    for (const im of c.implications) {
      if (!g.positions.has(im.position)) {
        err('dangling-position', `cases:${c.id}`, `implication references unknown position "${im.position}".`);
      }
    }
  }

  for (const t of g.tracers.values()) {
    if (!g.questions.has(t.question)) err('dangling-question', `tracers:${t.id}`, `question "${t.question}" does not exist.`);
    for (const item of t.items) {
      for (const opt of item.options) {
        for (const pid of [...(opt.entails ?? []), ...(opt.conflictsWith ?? [])]) {
          if (!g.positions.has(pid)) {
            err('dangling-position', `tracers:${t.id}:${item.id}:${opt.id}`, `option maps onto unknown position "${pid}".`);
          }
        }
      }
    }
  }

  for (const p of g.passages.values()) {
    if (!p.placeholder && p.text === undefined && !p.locusUnverified && !p.linkOnly) {
      err('passage-without-text', `passages:${p.id}`,
        'Passage has no text and is neither locusUnverified nor linkOnly. A passage must quote, say its locus could not be verified, or say its text is deliberately not reproduced.');
    }
    if (p.linkOnly && !p.url) {
      err('link-only-without-url', `passages:${p.id}`,
        'A link-only passage is nothing but its link. It must carry a url.');
    }
  }

  for (const t of g.thinkers.values()) {
    if (!t.placeholder && (t.wikidata === undefined || t.wikidata === null)) {
      info('wikidata-unresolved', `thinkers:${t.id}`,
        'No Wikidata Q-ID. Q-IDs are the primary key (research F.3) and must be resolved against wikidata.org, never guessed. Run scripts/resolve-wikidata.mjs from a network-enabled environment.');
    }
  }
}
