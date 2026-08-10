import type { Tracer, TracerOption } from '../graph/types';

/**
 * Research I.3a, modelled on Battleground God's consistency instrument.
 *
 * This is a commitment tracer, not a personality quiz. It does not score, rank or
 * "match" you. It reads your answers as a set of commitments and reports two things:
 *
 *   entailed  — positions every one of your answers is consistent with, and at least
 *               one of your answers requires
 *   hits      — positions one answer requires and another rules out. Battleground God
 *               calls these direct hits, and they are the interesting output: they mean
 *               two things you said cannot both be true.
 */

export type Answers = Record<string, string>; // itemId -> optionId

export interface TracerResult {
  entailed: string[];
  /** Positions both entailed and ruled out by your own answers. */
  hits: Array<{ position: string; byItems: string[] }>;
  /** Positions ruled out and never entailed — quietly excluded, not reported as a result. */
  excluded: string[];
  answeredCount: number;
  skippedCount: number;
}

function optionOf(tracer: Tracer, itemId: string, optionId: string): TracerOption | undefined {
  return tracer.items.find((i) => i.id === itemId)?.options.find((o) => o.id === optionId);
}

export function evaluate(tracer: Tracer, answers: Answers): TracerResult {
  const entailedBy = new Map<string, string[]>();
  const conflictedBy = new Map<string, string[]>();
  let answered = 0;

  for (const item of tracer.items) {
    const chosen = answers[item.id];
    if (!chosen) continue;
    const opt = optionOf(tracer, item.id, chosen);
    if (!opt || opt.abstain) continue;
    answered++;
    for (const p of opt.entails ?? []) push(entailedBy, p, item.id);
    for (const p of opt.conflictsWith ?? []) push(conflictedBy, p, item.id);
  }

  const entailed: string[] = [];
  const hits: TracerResult['hits'] = [];
  const excluded: string[] = [];

  for (const [position, items] of entailedBy) {
    const against = conflictedBy.get(position);
    if (against?.length) hits.push({ position, byItems: [...new Set([...items, ...against])] });
    else entailed.push(position);
  }
  for (const [position] of conflictedBy) {
    if (!entailedBy.has(position)) excluded.push(position);
  }

  return {
    entailed,
    hits,
    excluded,
    answeredCount: answered,
    skippedCount: tracer.items.length - answered,
  };
}

function push(m: Map<string, string[]>, k: string, v: string) {
  const cur = m.get(k);
  if (cur) cur.push(v);
  else m.set(k, [v]);
}

/* ---------------------------------------------------------------------------
 * The personal position map. Research F.4 calls it a per-user overlay of
 * `User —commits_to→ Position` edges over the same graph — so that is exactly what
 * is stored: edges, not a copy of any content. Kept in localStorage; there are no
 * accounts in the MVP and nothing leaves the browser.
 * ------------------------------------------------------------------------- */

export interface Commitment {
  position: string;
  question: string;
  committedAt: string;
  /** What the reader said the position claims, before seeing the objection (retrieval practice). */
  recall?: string;
  /** Their answer to the strongest objection. */
  response?: string;
  /** Whether they held or revised after the objection. */
  outcome?: 'held' | 'revised';
  answers?: Answers;
}

const KEY = 'lw.commitments';

export function loadCommitments(): Commitment[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Commitment[]) : [];
  } catch {
    return [];
  }
}

export function saveCommitment(c: Commitment) {
  const all = loadCommitments().filter((x) => x.position !== c.position);
  all.unshift(c);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearCommitments() {
  localStorage.removeItem(KEY);
}
