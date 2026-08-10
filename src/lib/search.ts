import { graph } from '../app/graph';
import { conceptSlug, positionPath, positionSlug, questionSlug, thinkerSlug } from '../graph/slugs';
import { diacriticLight } from '../lib/diacritics';
import type { Locale, LocalizedString } from '../graph/types';

/**
 * Search over plain-language phrasings, not only canonical ones.
 *
 * Someone types "does god decide what's right" and must land on ḥusn wa qubḥ. The
 * `plain` field exists for exactly this and is weighted above the canonical phrasing,
 * because the canonical phrasing is the one a newcomer will not think of.
 *
 * Everything is normalised through the diacritic-light transform, so "husn wa qubh"
 * finds ḥusn wa qubḥ and "abd al-jabbar" finds ʿAbd al-Jabbār — a reader cannot be
 * expected to type an ʿayn.
 */

export type ResultKind = 'question' | 'position' | 'thinker' | 'term';

export interface SearchResult {
  kind: ResultKind;
  title: string;
  subtitle: string;
  path: string;
  score: number;
}

interface Doc extends Omit<SearchResult, 'score'> {
  fields: Array<{ text: string; weight: number }>;
}

const norm = (s: string) => diacriticLight(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

function loc(v: LocalizedString | undefined, l: Locale): string {
  if (!v) return '';
  return typeof v === 'string' ? v : (v[l] ?? v.en ?? v.tr ?? '');
}

export function buildIndex(locale: Locale): Doc[] {
  const docs: Doc[] = [];

  for (const q of graph.questions()) {
    docs.push({
      kind: 'question',
      title: loc(q.canonical, locale),
      subtitle: loc(q.plain, locale),
      path: `/questions/${questionSlug(q)}`,
      fields: [
        // The plain-language phrasing outranks the canonical one on purpose.
        { text: loc(q.plain, locale), weight: 5 },
        { text: loc(q.plain, 'en'), weight: 4 },
        { text: loc(q.canonical, locale), weight: 3 },
        { text: loc(q.technicalName, locale), weight: 3 },
        { text: loc(q.whyItMatters, locale), weight: 2 },
        { text: loc(q.domain, locale), weight: 1 },
      ],
    });
  }

  for (const p of graph.positions()) {
    const q = p.answersQuestion ? graph.question(p.answersQuestion) : undefined;
    docs.push({
      kind: 'position',
      title: loc(p.label, locale),
      subtitle: q ? loc(q.canonical, locale) : '',
      path: positionPath(graph, p),
      fields: [
        { text: loc(p.label, locale), weight: 4 },
        { text: loc(p.shortLabel, locale), weight: 4 },
        { text: loc(p.definition, locale), weight: 3 },
        { text: p.sourceTerm?.translit ?? '', weight: 3 },
        { text: positionSlug(p).replace(/-/g, ' '), weight: 2 },
      ],
    });
  }

  for (const t of graph.thinkers()) {
    docs.push({
      kind: 'thinker',
      title: t.name,
      subtitle: [t.died, loc(graph.traditionOf(t.id)?.label, locale)].filter(Boolean).join(' · '),
      path: `/thinkers/${thinkerSlug(t)}`,
      fields: [
        { text: t.name, weight: 5 },
        { text: t.nameSourceScript ?? '', weight: 3 },
        { text: loc(t.summary, locale), weight: 1 },
      ],
    });
  }

  for (const c of graph.concepts()) {
    docs.push({
      kind: 'term',
      title: c.term.translit,
      subtitle: c.commonRendering ?? '',
      path: `/terms/${conceptSlug(c)}`,
      fields: [
        { text: c.term.translit, weight: 5 },
        { text: (c.surfaceForms ?? []).join(' '), weight: 4 },
        { text: c.term.sourceScript ?? '', weight: 4 },
        { text: c.commonRendering ?? '', weight: 3 },
        { text: loc(c.semanticRange, locale), weight: 1 },
      ],
    });
  }

  return docs;
}

export function search(query: string, locale: Locale, limit = 20): SearchResult[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const terms = q.split(' ').filter((t) => t.length > 1);
  if (!terms.length) return [];

  const out: SearchResult[] = [];
  for (const doc of buildIndex(locale)) {
    let score = 0;
    for (const f of doc.fields) {
      if (!f.text) continue;
      const hay = norm(f.text);
      for (const term of terms) {
        if (hay.includes(term)) {
          score += f.weight;
          // A whole-word hit beats a substring one.
          if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(hay)) score += f.weight;
        }
      }
      if (hay.includes(q)) score += f.weight * 2; // full phrase
    }
    if (score > 0) out.push({ ...doc, score });
  }
  return out.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}
