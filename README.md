# loveofwisdom

A question-first map of philosophical positions across traditions. The unit is the
**position**, not the thinker and not the tradition, and the distinctive surface is the
**intersection view**: where thinkers from traditions that never met turn out to have
landed on the same answer — and where that resemblance turns out to be an artifact of the
English word used for both.

MVP scope: one question worked end to end (*ḥusn wa qubḥ* — is the moral status of an act
grounded in revelation or in reason?), three deliberately awkward stubs, and the four-step
interaction that takes a reader from locating their own position, to the strongest
objection to it, to the tradition they have joined, to what it asks of them on a Tuesday.

See [`REPORT.md`](REPORT.md) for the build report and [`design/DESIGN.md`](design/DESIGN.md)
for the design plan and its self-critique.

## Running it

```bash
npm install
npm run dev        # vite dev server
npm run validate   # schema + graph integrity + font glyph coverage
npm test           # acceptance, consistency and behaviour suites
npm run build      # validate, typecheck, static build to dist/
```

Fonts are self-hosted in `public/fonts` and committed. To refetch and re-verify them:

```bash
bash scripts/fetch-fonts.sh
```

## Layout

```
content/                 flat JSON, loaded at build time — no CMS, no runtime database
  questions/             Question + its Positions, holds, arguments, objections
  thinkers/              people, with dates only where a source gives them
  passages/              every quotation, with citation, locator and licence
  concepts/              terms that do not translate (research D)
  cases/                 editorial scenarios linking a position to an ordinary decision
  intersections/         the cross-tradition convergence edges
  tracers/               the commitment tracer
  _acceptance/           the verbatim research F.5 seed, used only as a test fixture
schema.json              the content contract, with the CIDOC-CRM / SKOS mapping
src/graph/               loader, query interface, view projections
src/components/          apparatus rail, epistemic marks, the confluence
src/pages/               home, question, position, intersections, thinker, terms, tracer
scripts/                 content validation, font verification, Wikidata resolution
tests/                   acceptance (F.5), seed consistency, behaviour
```

## Rules the content follows

These are enforced by `npm run validate` and by the test suite, not just by convention.

- **No citation, passage, page number, date or attribution is ever invented.** A field
  with no source renders as "Not yet written" with the missing fields named. Dates appear
  only where a source supplies them; absent ones render as "not recorded".
- **A passage either quotes a verified text or says its locus could not be verified.**
  It never shows an unattributed quotation. `PSG_ockham_sent`, `PSG_euthyphro_10a` and
  `PSG_mughni_locus` are all in the second state.
- **`holds` is a reified relation object**, never a bare edge. It carries the
  qualification, the epistemic status, the career phase, the source passages, and the
  named sides of any scholarly dispute.
- **Contested claims surface the sides.** A contested attribution with no named sides is
  reported as a warning by the validator.
- **Cross-tradition convergences carry a verdict** — `genuine`, `superficial` or
  `translation_artifact` — and a statement of where the two part ways. A "genuine"
  convergence with no divergence is flagged: it would be an identity claim.
- **Wikidata Q-IDs are the primary key for people.** They are resolved against
  wikidata.org (`scripts/resolve-wikidata.mjs`) or left `null`. They are never recalled
  from memory. They are all currently `null` — see `REPORT.md`.
- **Encyclopedia text is linked and cited, never ingested.** No SEP or IEP article text
  exists in this repository.

## Adding a question

Add a fragment under `content/questions/`. A fragment is any object carrying a subset of
the top-level collections in `schema.json`; the loader merges them all into one graph, so
you can split content across files however reads best. Then:

```bash
npm run validate
```

The validator fails on schema violations, integrity errors, and any *placeholder* node —
a thinker or passage that something references but nothing defines.
