/**
 * The acceptance test from the build brief §3, restated:
 *
 *   "The seed instance from research §F.5 loads unmodified and produces the full
 *    husn wa qubh question page, both intersection cards, and a visible `contested`
 *    badge on the Ockham attribution. If it doesn't, the schema is wrong, not the seed."
 *
 * So: no fixture massaging. `content/_acceptance/f5-seed.json` is byte-for-byte the
 * JSON printed in research F.5. It is loaded through the same loader, the same query
 * layer and the same view projections the site renders from.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import { InMemoryGraph } from '../src/graph/query';
import { questionView, positionView } from '../src/graph/views';

const read = (p: string) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8'));

const seed = read('../content/_acceptance/f5-seed.json');
const schema = read('../schema.json');

const graph = InMemoryGraph.fromFragments([{ name: 'f5-seed', data: seed }]);

describe('research F.5 seed — acceptance', () => {
  it('validates against schema.json unmodified', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const ok = validate(seed);
    if (!ok) console.error(validate.errors);
    expect(ok).toBe(true);
  });

  it('loads with no integrity errors', () => {
    const errors = graph.issues().filter((i) => i.severity === 'error');
    expect(errors).toEqual([]);
  });

  it('produces the husn wa qubh question page', () => {
    const view = questionView(graph, 'Q_husn_qubh')!;
    expect(view).toBeDefined();
    expect(view.question.canonical).toBe(
      'Is the moral status of an act grounded in revelation or in reason?',
    );
    expect(view.question.westernFramedMismatch).toBe(true);
    expect(view.answers.map((a) => a.position.id).sort()).toEqual(['P_DCT', 'P_rationalism']);
    // Both positions carry their holders, resolved through the reified `holds` object.
    const dct = view.answers.find((a) => a.position.id === 'P_DCT')!;
    expect(dct.holdings.map((h) => h.holds.thinker).sort()).toEqual(['Ockham', 'al_Ashari']);
    // Every quoted claim on the page resolves to a passage with a citation.
    for (const p of view.apparatus) expect(p.citation).toBeTruthy();
  });

  it('produces both intersection cards with their convergence verdicts', () => {
    const view = questionView(graph, 'Q_husn_qubh')!;
    expect(view.intersections).toHaveLength(2);

    const ashariOckham = view.intersections.find(
      (i) => i.a.ref === 'P_DCT@al_Ashari' && i.b.ref === 'P_DCT@Ockham',
    )!;
    expect(ashariOckham.equivalence.convergenceType).toBe('genuine');
    expect(ashariOckham.a.holding?.thinker.id).toBe('al_Ashari');
    expect(ashariOckham.b.holding?.thinker.id).toBe('Ockham');

    const jabbarKant = view.intersections.find(
      (i) => i.a.ref === 'P_rationalism@Abd_al_Jabbar' && i.b.ref === 'P_rationalism@Kant',
    )!;
    expect(jabbarKant.equivalence.convergenceType).toBe('translation_artifact');
    // A translation_artifact verdict must not read like a genuine one: the evidence
    // field carries the reason, and the UI keys its whole treatment off this value.
    expect(String(jabbarKant.equivalence.evidence)).toMatch(/value-realist/);
  });

  it('surfaces a contested badge on the Ockham attribution, with the sides named', () => {
    const dct = positionView(graph, 'P_DCT')!;
    const ockham = dct.holdings.find((h) => h.thinker.id === 'Ockham')!;
    expect(ockham.holds.epistemicStatus).toBe('contested');
    expect(ockham.holds.qualification).toBe('denied by much recent scholarship');
    expect(String(ockham.holds.scholarlyDispute)).toMatch(/Osborne/);

    const ashari = dct.holdings.find((h) => h.thinker.id === 'al_Ashari')!;
    expect(ashari.holds.epistemicStatus).toBe('settled');
  });

  it('never invents a passage it was not given', () => {
    // The seed cites PSG_ockham_sent but never defines it. The honest rendering is
    // an unverified locus, not a fabricated quotation.
    const p = graph.passage('PSG_ockham_sent')!;
    expect(p.text).toBeUndefined();
    expect(p.locusUnverified).toBe(true);
    const ockham = graph.holding('P_DCT', 'Ockham')!;
    expect(
      positionView(graph, 'P_DCT')!.holdings.find((h) => h.holds === ockham)!.evidence,
    ).toBe('unverified-locus');
  });

  it('synthesises placeholder thinkers rather than dropping the attribution', () => {
    // The seed names four thinkers and describes none of them.
    for (const id of ['al_Ashari', 'Ockham', 'Abd_al_Jabbar', 'Kant']) {
      const t = graph.thinker(id)!;
      expect(t.placeholder).toBe(true);
      expect(t.wikidata).toBeNull(); // unresolved, never guessed
    }
    expect(graph.issues().some((i) => i.code === 'placeholder-thinker')).toBe(true);
  });
});
