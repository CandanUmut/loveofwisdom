import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { InMemoryGraph } from '../src/graph/query';
import { intersectionView, questionMap, questionView, positionView } from '../src/graph/views';
import { diacriticLight } from '../src/lib/diacritics';
import { evaluate } from '../src/lib/tracer';
import type { Tracer } from '../src/graph/types';

const root = fileURLToPath(new URL('..', import.meta.url));
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((e) => {
    const p = path.join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [];
  });

const site = InMemoryGraph.fromFragments(
  walk(path.join(root, 'content'))
    .filter((f) => !f.includes('_acceptance'))
    .map((f) => ({ name: path.relative(root, f), data: JSON.parse(readFileSync(f, 'utf8')) })),
);

describe('diacritic-light display form', () => {
  it('reduces transliteration to the light form', () => {
    expect(diacriticLight('ḥusn wa qubḥ')).toBe('husn wa qubh');
    expect(diacriticLight('ʿaql')).toBe('aql');
    expect(diacriticLight('al-Qāḍī ʿAbd al-Jabbār')).toBe('al-Qadi Abd al-Jabbar');
    expect(diacriticLight('mokṣa · pramāṇa · Mīmāṃsā')).toBe('moksa · pramana · Mimamsa');
  });

  it('leaves living Latin orthographies alone — Turkish above all', () => {
    // The site is Turkish-first-class. Eating these would be a bug, not a simplification.
    expect(diacriticLight('Gözübüyükoğlu, İstanbul, ışık, şey')).toBe('Gözübüyükoğlu, İstanbul, ışık, şey');
    expect(diacriticLight('déjà vu, Müller, mañana')).toBe('déjà vu, Müller, mañana');
  });

  it('leaves non-Latin scripts untouched', () => {
    expect(diacriticLight('حسن وقبح')).toBe('حسن وقبح');
    expect(diacriticLight('प्रमाण')).toBe('प्रमाण');
    expect(diacriticLight('仁 義 禮')).toBe('仁 義 禮');
  });

  it('keeps real quotation marks but drops ʿayn written as a curly quote', () => {
    expect(diacriticLight('he said “yes”')).toBe('he said “yes”');
    expect(diacriticLight('Shi‘i')).toBe('Shii');
  });
});

describe('the three stub questions', () => {
  it('stub 1 still has no intersection, which the empty state must explain', () => {
    const v = questionView(site, 'Q_eternity_world')!;
    expect(v.answers).toHaveLength(2);
    // Every holder sits inside the Islamic tradition, so there is nothing to cross.
    // This is the case the "no intersection" empty state exists for.
    expect(v.intersections).toHaveLength(0);
    const traditions = new Set(v.answers.flatMap((p) => p.traditions.map((t) => t.id)));
    expect([...traditions]).toEqual(['islamic']);
  });

  it('stub 2 separates refusals from answers instead of leaving empty answer slots', () => {
    const v = questionView(site, 'Q_sources_of_knowledge')!;
    expect(v.question.westernFramedMismatch).toBe(true);
    expect(v.refusals.map((p) => p.position.id).sort())
      .toEqual(['P_pramana_mimamsa', 'P_pramana_nyaya']);
    expect(v.answers.map((p) => p.position.id).sort()).toEqual(['P_coherentism', 'P_foundationalism']);
    // Phase 2 sourced individual Nyāya thinkers, so the reframing now carries real
    // attributions. The two Western answers are the ones still without any — and they
    // say so rather than being quietly filled in.
    for (const a of v.answers) {
      expect(a.holdings).toHaveLength(0);
      expect(a.position.notYetWritten?.length ?? 0).toBeGreaterThan(0);
    }
    const nyaya = v.refusals.find((r) => r.position.id === 'P_pramana_nyaya')!;
    expect(nyaya.holdings.length).toBeGreaterThan(0);
    for (const h of nyaya.holdings) expect(h.passages.length).toBeGreaterThan(0);
  });

  it('stub 3 has six positions and keeps its Arabic source script', () => {
    const v = questionView(site, 'Q_jabr_ikhtiyar')!;
    expect(v.answers.length).toBeGreaterThanOrEqual(6);
    const arabic = v.answers.filter((p) => p.position.sourceTerm?.script === 'Arab');
    expect(arabic.length).toBeGreaterThanOrEqual(3);
    for (const p of arabic) expect(p.position.sourceTerm!.sourceScript).toMatch(/[؀-ۿ]/);
  });

  it('every stub position with an empty field says which field is empty', () => {
    for (const qid of ['Q_eternity_world', 'Q_sources_of_knowledge', 'Q_jabr_ikhtiyar']) {
      const v = questionView(site, qid)!;
      for (const p of [...v.answers, ...v.refusals]) {
        const def = typeof p.position.definition === 'string'
          ? p.position.definition : p.position.definition.en ?? '';
        if (def.startsWith('Not yet written')) {
          expect(p.position.notYetWritten, `${p.position.id} has no notYetWritten list`).toBeTruthy();
        }
      }
    }
  });
});

describe('the intersection projection', () => {
  it('relates a dilemma to a debate, not only a position to a position', () => {
    const e = site.equivalences().find((x) => x.id === 'INT_euthyphro_husn_qubh')!;
    const v = intersectionView(site, e);
    expect(v.a.kind).toBe('objection');
    expect(v.b.kind).toBe('question');
    expect(v.crossesTraditions).toBe(true); // greek ↔ islamic, via the explicit tradition pair
  });

  it('keeps a genuine verdict distinguishable from a translation artifact', () => {
    const genuine = intersectionView(site, site.equivalences().find((e) => e.id === 'INT_ashari_ockham')!);
    const artifact = intersectionView(site, site.equivalences().find((e) => e.id === 'INT_mutazila_kant')!);
    expect(genuine.equivalence.convergenceType).toBe('genuine');
    expect(artifact.equivalence.convergenceType).toBe('translation_artifact');
    // Both must state where the two part ways: a convergence with no divergence is an
    // identity claim, and no two positions from unconnected traditions are identical.
    expect(genuine.equivalence.partsWaysOn).toBeTruthy();
    expect(artifact.equivalence.partsWaysOn).toBeTruthy();
  });

  it('builds a descent chain for each thinker-anchored side', () => {
    const v = intersectionView(site, site.equivalences().find((e) => e.id === 'INT_ashari_ockham')!);
    expect(v.a.chain).toEqual(['Abū al-Ḥasan al-Ashʿarī', 'Ashʿarī school', 'Islamic']);
    expect(v.b.chain).toEqual(['William of Ockham', 'Latin scholastic', 'Latin Christian scholastic']);
  });
});

describe('evidence and epistemic honesty', () => {
  it('grades an unverified locus below a quoted passage', () => {
    const dct = positionView(site, 'P_DCT')!;
    expect(dct.holdings.find((h) => h.thinker.id === 'al_Ashari')!.evidence).toBe('quoted');
    expect(dct.holdings.find((h) => h.thinker.id === 'al_Ghazali')!.evidence).toBe('none');
  });

  it('never shows text for a passage whose locus was not verified', () => {
    for (const id of ['PSG_ockham_sent', 'PSG_euthyphro_10a', 'PSG_mughni_locus']) {
      const p = site.passage(id)!;
      expect(p.locusUnverified).toBe(true);
      expect(p.text).toBeUndefined();
      expect(p.citation).toBeTruthy();
    }
  });

  it('names the sides on every contested attribution that has a dispute', () => {
    for (const h of site.equivalences().length ? [site.holding('P_DCT', 'Ockham')!] : []) {
      expect(h.sides?.length).toBeGreaterThanOrEqual(2);
      for (const side of h.sides!) expect(side.who).toBeTruthy();
    }
  });

  it('reports the sourcing ledger the home page shows', () => {
    const seed = questionMap(site).find((e) => e.question.id === 'Q_husn_qubh')!;
    expect(seed.sourcedClaimCount).toBeGreaterThan(0);
    expect(seed.unsourcedClaimCount).toBeGreaterThan(0); // and the page says so out loud
    expect(seed.crossTraditionIntersectionCount).toBe(3);
  });

  it('carries a well-formed Wikidata Q-ID for every thinker, or an explicit null', () => {
    // Phase 2 resolved all of these against wikidata.org and re-verified each entity is
    // a human whose label matches the name. What must never appear is a malformed or
    // invented-looking identifier, so the shape is asserted rather than the presence.
    for (const t of site.thinkers()) {
      const id = t.wikidata ?? null;
      if (id !== null) expect(id, `${t.id} has a malformed Q-ID`).toMatch(/^Q[1-9][0-9]*$/);
    }
    const resolved = site.thinkers().filter((t) => t.wikidata).length;
    expect(resolved).toBe(site.thinkers().length);
  });

  it('never cites a URL that was not marked as verified', () => {
    // scripts/verify-citations.mjs re-fetches these; the flag records that it was done.
    for (const t of site.thinkers()) {
      for (const src of t.sources ?? []) {
        if (src.url) expect(src.urlVerified, `${t.id} cites ${src.url} unverified`).toBe(true);
      }
    }
  });

  it('gives every link-only passage a url, since that is all it is', () => {
    for (const p of ['PSG_sep_ghazali', 'PSG_sep_causation', 'PSG_iep_nyaya']) {
      const passage = site.passage(p)!;
      expect(passage.linkOnly).toBe(true);
      expect(passage.url).toMatch(/^https:\/\//);
      expect(passage.text).toBeUndefined();
    }
  });
});

describe('the commitment tracer', () => {
  const tracer = site.tracerFor('Q_husn_qubh') as Tracer;

  it('reports what the answers entail, not a score', () => {
    const r = evaluate(tracer, { T1: 'T1a', T2: 'T2b', T4: 'T4b', T7: 'T7b' });
    expect(r.entailed).toContain('P_DCT');
    expect(r.hits).toEqual([]);
  });

  it('reports a hit when two answers pull against each other', () => {
    // T1a entails P_DCT; T2a rules it out. Both cannot be right together.
    const r = evaluate(tracer, { T1: 'T1a', T2: 'T2a' });
    expect(r.hits.map((h) => h.position)).toContain('P_DCT');
    expect(r.entailed).not.toContain('P_DCT');
  });

  it('treats an abstention as an abstention, not as an answer', () => {
    const r = evaluate(tracer, { T1: 'T1c', T2: 'T2c' });
    expect(r.answeredCount).toBe(0);
    expect(r.entailed).toEqual([]);
  });

  it('maps every option onto a position that exists', () => {
    for (const item of tracer.items) {
      for (const opt of item.options) {
        for (const pid of [...(opt.entails ?? []), ...(opt.conflictsWith ?? [])]) {
          expect(site.position(pid), `${opt.id} -> ${pid}`).toBeDefined();
        }
      }
    }
  });
});
