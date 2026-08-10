import { Fragment, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { conceptSlug } from '../graph/slugs';
import { diacriticLight } from '../lib/diacritics';
import type { Concept } from '../graph/types';

/**
 * Inline term glossing.
 *
 * A non-specialist should be able to read a sentence containing *ḥusn wa qubḥ* without
 * leaving the page. Tapping the term opens a short gloss in place, with a link to the
 * full entry — the Genius mechanic: the annotation comes to the reader rather than
 * sending the reader to the annotation.
 *
 * Matching is deliberately conservative, because the failure mode of an over-eager
 * glosser is worse than no glosser at all:
 *
 *  - only strings a term explicitly declares in `surfaceForms` are matched, never the
 *    transliteration by itself. Matching `li` on its own would gloss "political", and
 *    matching only `ḥusn wa qubḥ` would miss the diacritic-light `husn wa qubh` that
 *    the reader sees by default;
 *  - matches are whole-word and diacritic-insensitive on both sides, so one surface
 *    form covers both display modes;
 *  - longest form wins, so `ḥusn wa qubḥ` beats a bare `ḥusn`;
 *  - only the first occurrence in a block is glossed. Marking every instance turns a
 *    paragraph into a field of underlines and stops reading as prose.
 */

interface Surface { form: string; norm: string; concept: Concept }

const SURFACES: Surface[] = (() => {
  const out: Surface[] = [];
  for (const c of graph.concepts()) {
    for (const form of c.surfaceForms ?? []) {
      out.push({ form, norm: diacriticLight(form).toLowerCase(), concept: c });
    }
  }
  // Longest first so the greedy scan prefers the most specific term.
  return out.sort((a, b) => b.norm.length - a.norm.length);
})();

const WORD = /[\p{L}\p{M}]/u;

function findMatches(text: string) {
  const norm = diacriticLight(text).toLowerCase();
  const hits: Array<{ start: number; end: number; concept: Concept }> = [];
  const used: boolean[] = new Array(text.length).fill(false);
  const seen = new Set<string>();

  for (const s of SURFACES) {
    if (seen.has(s.concept.id)) continue; // first occurrence per block, per concept
    let from = 0;
    for (;;) {
      const i = norm.indexOf(s.norm, from);
      if (i === -1) break;
      const end = i + s.norm.length;
      const beforeOk = i === 0 || !WORD.test(text[i - 1]);
      const afterOk = end >= text.length || !WORD.test(text[end]);
      const free = !used.slice(i, end).some(Boolean);
      if (beforeOk && afterOk && free) {
        hits.push({ start: i, end, concept: s.concept });
        for (let k = i; k < end; k++) used[k] = true;
        seen.add(s.concept.id);
        break;
      }
      from = i + 1;
    }
  }
  return hits.sort((a, b) => a.start - b.start);
}

function Term({ concept, children }: { concept: Concept; children: string }) {
  const { s, t, d } = usePrefs();
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="gloss">
      <button
        type="button"
        className="gloss__trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>
      {open && (
        <span className="gloss__pop" id={id} role="note">
          <span className="gloss__term">
            {concept.term.sourceScript && (
              <span
                className={concept.term.script === 'Arab' ? 'script-arab' : undefined}
                lang={concept.term.lang}
                dir={concept.term.script === 'Arab' ? 'rtl' : 'ltr'}
              >
                {concept.term.sourceScript}
              </span>
            )}
            <em>{d(concept.term.translit)}</em>
          </span>
          {concept.commonRendering && (
            <span className="gloss__rendering">{s.usuallyRendered}: {concept.commonRendering}</span>
          )}
          {concept.distortion && <span className="gloss__body">{t(concept.distortion)}</span>}
          <Link className="gloss__more" to={`/terms/${conceptSlug(concept)}`}>{s.fullEntry}</Link>
        </span>
      )}
    </span>
  );
}

/**
 * Wrap body text to gloss the terms in it. Accepts a string, or children whose string
 * parts get scanned; non-string children pass through untouched so nested markup and
 * already-linked text are never rewritten.
 */
export function Gloss({ children }: { children: ReactNode }) {
  const parts = useMemo(() => {
    if (typeof children !== 'string') return null;
    const hits = findMatches(children);
    if (!hits.length) return null;
    const out: ReactNode[] = [];
    let at = 0;
    hits.forEach((h, i) => {
      if (h.start > at) out.push(<Fragment key={`t${i}`}>{children.slice(at, h.start)}</Fragment>);
      out.push(
        <Term key={`g${i}`} concept={h.concept}>{children.slice(h.start, h.end)}</Term>,
      );
      at = h.end;
    });
    if (at < children.length) out.push(<Fragment key="tail">{children.slice(at)}</Fragment>);
    return out;
  }, [children]);

  return <>{parts ?? children}</>;
}

/** How many terms the glosser can currently recognise — surfaced in the terms index. */
export const glossableTermCount = new Set(SURFACES.map((s) => s.concept.id)).size;
