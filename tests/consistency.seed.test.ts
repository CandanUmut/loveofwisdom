/**
 * The site content is a superset of the F.5 seed. This test enforces that it never
 * drifts from it: for every field the seed supplies, the site content must carry the
 * same value. Without this, "the seed loads unmodified" would be true of a fixture
 * nobody looks at while the shipped page quietly said something else.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { InMemoryGraph } from '../src/graph/query';
import type { GraphFragment } from '../src/graph/types';
import { diacriticLight } from '../src/lib/diacritics';

const root = fileURLToPath(new URL('..', import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const p = path.join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [];
  });
}

const seed: GraphFragment = JSON.parse(
  readFileSync(path.join(root, 'content/_acceptance/f5-seed.json'), 'utf8'),
);
const siteFiles = walk(path.join(root, 'content')).filter((f) => !f.includes('_acceptance'));
const site = InMemoryGraph.fromFragments(
  siteFiles.map((f) => ({ name: path.relative(root, f), data: JSON.parse(readFileSync(f, 'utf8')) })),
);

/** English text of a possibly-localised field. */
const en = (v: unknown) => (typeof v === 'string' ? v : (v as { en?: string })?.en);

/**
 * Compare under the diacritic-light transform. The site stores the fully diacriticized
 * canonical form ("ḥusn wa qubḥ") per research D's storage policy, while F.5 prints the
 * light form. Those are the same string; anything else is a real divergence.
 * Quotations are exempt from this — a quoted passage is compared byte-for-byte below.
 */
const sameText = (a: unknown, b: unknown) =>
  expect(diacriticLight(String(en(a)))).toBe(diacriticLight(String(en(b))));

describe('site content is a faithful superset of the F.5 seed', () => {
  it('carries the seed question with the same canonical, plain and technical text', () => {
    const s = seed.questions![0];
    const q = site.question(s.id)!;
    expect(q).toBeDefined();
    sameText(q.canonical, s.canonical);
    sameText(q.plain, s.plain);
    sameText(q.technicalName, s.technicalName);
    sameText(q.whyItMatters, s.whyItMatters);
    sameText(q.domain, s.domain);
    expect(q.westernFramedMismatch).toBe(s.westernFramedMismatch);
    expect(q.provenance).toEqual(s.provenance);
  });

  it('carries the seed positions with the same definitions', () => {
    for (const s of seed.positions!) {
      const p = site.position(s.id)!;
      expect(p, `position ${s.id} missing from site content`).toBeDefined();
      sameText(p.label, s.label);
      sameText(p.definition, s.definition);
      expect(p.answersQuestion).toBe(s.answersQuestion);
    }
  });

  it('carries the seed attributions with the same epistemic status and qualification', () => {
    for (const s of seed.holds!) {
      const h = site.holding(s.position, s.thinker)!;
      expect(h, `holds ${s.thinker}->${s.position} missing from site content`).toBeDefined();
      expect(h.epistemicStatus).toBe(s.epistemicStatus);
      if (s.qualification) sameText(h.qualification, s.qualification);
      for (const p of s.sourcePassages ?? []) expect(h.sourcePassages).toContain(p);
    }
  });

  it('carries the seed intersections with the same verdict and evidence, verbatim', () => {
    for (const s of seed.equivalences!) {
      const e = site.equivalences().find(
        (x) => x.positionA === s.positionA && x.positionB === s.positionB,
      )!;
      expect(e, `equivalence ${s.positionA}~${s.positionB} missing from site content`).toBeDefined();
      expect(e.convergenceType).toBe(s.convergenceType);
      sameText(e.evidence, s.evidence);
    }
  });

  it('carries the seed passages with the same text and citation, verbatim', () => {
    for (const s of seed.passages!) {
      const p = site.passage(s.id)!;
      expect(p, `passage ${s.id} missing from site content`).toBeDefined();
      expect(p.text).toBe(s.text);
      expect(p.citation).toBe(s.citation);
      expect(p.locator).toBe(s.locator);
      expect(p.license).toBe(s.license);
    }
  });

  it('ships no placeholder nodes', () => {
    expect(site.issues().filter((i) => i.code.startsWith('placeholder-'))).toEqual([]);
  });

  it('ships no integrity errors', () => {
    expect(site.issues().filter((i) => i.severity === 'error')).toEqual([]);
  });
});
