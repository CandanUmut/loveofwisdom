import { diacriticLight } from '../lib/diacritics';
import type { GraphQuery } from './query';
import type { Concept, Position, Question, Thinker } from './types';

/**
 * URL identity. Ids stay internal (`Q_husn_qubh`); URLs use slugs (`husn-wa-qubh`).
 *
 * Every lookup accepts either, so an old id-based link keeps working and a hand-typed
 * slug resolves. Where content supplies no slug one is derived — diacritics stripped
 * first, because `/terms/ʿaql` is not a URL anyone can type.
 */
export function derivedSlug(input: string): string {
  return diacriticLight(input)
    .replace(/^[QP]_/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const questionSlug = (q: Question) => q.slug ?? derivedSlug(q.id);
export const positionSlug = (p: Position) => p.slug ?? derivedSlug(p.id);
export const conceptSlug = (c: Concept) => c.slug ?? derivedSlug(c.id);
export const thinkerSlug = (t: Thinker) => derivedSlug(t.id);

function find<T extends { id: string }>(rows: T[], key: string, slugOf: (r: T) => string) {
  return rows.find((r) => r.id === key) ?? rows.find((r) => slugOf(r) === key);
}

export const questionBySlug = (g: GraphQuery, key: string) => find(g.questions(), key, questionSlug);
export const positionBySlug = (g: GraphQuery, key: string) => find(g.positions(), key, positionSlug);
export const conceptBySlug = (g: GraphQuery, key: string) => find(g.concepts(), key, conceptSlug);
export const thinkerBySlug = (g: GraphQuery, key: string) => find(g.thinkers(), key, thinkerSlug);

/** Canonical path for a position, always nested under its question. */
export function positionPath(g: GraphQuery, p: Position): string {
  const q = p.answersQuestion ? g.question(p.answersQuestion) : undefined;
  return q ? `/questions/${questionSlug(q)}/${positionSlug(p)}` : `/questions/-/${positionSlug(p)}`;
}
