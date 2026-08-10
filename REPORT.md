# Build report

Answering the four questions in §8 of the build brief.

---

## 1. The design plan, and what pass 2 changed

The plan and its self-critique are in [`design/DESIGN.md`](design/DESIGN.md). Summary of
what changed and why:

| # | Pass 1 | Why it failed the brief | Pass 2 |
|---|---|---|---|
| 1 | Text column + apparatus sidebar | "Column plus sidebar" is what any documentation site does. The rail was decorative. | Sigla in the running text are focusable buttons that key into rail entries and mark them; neither column works alone. Below 62rem the rail moves under the text and the keying survives. |
| 2 | Manuscript pigments on a warm ground | A short walk from the cream + terracotta default. | Cool green-grey ground, no terracotta, and — the real change — **colour is a taxonomy, not a brand**: lapis = positions, madder = objections, orpiment = contested, verdigris = settled. Four hues that each mean one thing, rather than one accent. |
| 3 | Coloured epistemic badges | Pills read as alerts, and the brief is explicit that contested must not look like a warning. | No pills. Apparatus marks: `†` contested, `‡` uncertain, **nothing for settled**. Absence is the signal for the ordinary case. Each mark expands to the named sides. |
| 4 | Newsreader as the display face | Verified against its cmap: it contains **none** of `ḥ ḍ ṣ ṭ ẓ ṇ ṛ ṃ` and neither `ʿ` nor `ʾ`. Every question heading here contains at least one. | **Young Serif**, screened against 28 candidates by reading their actual font binaries. Self-hosted, because the CDN's `latin-ext` subset stops at U+02BA. |
| 5 | Confluence animates on entry | Spends the one allowed moment on nothing — by the time you reach the intersection view you already know what it says. | Static everywhere; animates **only** in tracer step 3, right after the reader commits and is shown the strongest objection. |
| 6 | Big question + list of questions | That is a blog index wearing a hero. | An **index locorum** with a sourcing ledger: how many attributions cite a source passage against how many do not. The front page says out loud that three of four questions are stubs. |

**A note on how #4 was caught, because the obvious check is wrong.** Google Fonts'
`css2?...&text=` endpoint *echoes back the codepoints you asked for* in `unicode-range`
whether or not the font contains them — asking Gentium, a Latin-only face, for `仁`
returns `U+4EC1`. Every family I probed that way looked perfect. The only sound check is
to read the cmap of the actual binary, which is what `scripts/verify-fonts.mjs` does, and
it now runs in `npm run validate`.

Signature element: the **confluence**. Two descent chains (thinker → school → tradition)
meet at a joint, and the convergence verdict is carried by the geometry of the joint —
stems fusing for `genuine`, crossing and continuing separately for `superficial`, meeting
across a visible seam with a broken shared stem for `translation_artifact`.

---

## 2. The schema, and the acceptance test

`schema.json` is research F.5 lifted and extended: the five `$defs` it gives, plus
`Thinker`, `School`, `Tradition`, `Argument`, `Objection`, `Text`, `Concept`,
`RealWorldCase`, `Influence` and `Tracer`, and the CIDOC-CRM / SKOS mapping from F.3
carried in `x-ontologyMapping` so the store choice stays reversible.

**The acceptance test passes.** `content/_acceptance/f5-seed.json` is byte-for-byte the
JSON printed in research F.5, loaded through the same loader, query layer and view
projections the site renders from:

```
✓ tests/acceptance.f5.test.ts    (7 tests)
✓ tests/consistency.seed.test.ts (7 tests)
✓ tests/behaviour.test.ts       (20 tests)
  34 passed
```

It asserts that the seed validates unmodified, loads with no integrity errors, produces
the *ḥusn wa qubḥ* question page with both positions and their holders, produces **both**
intersection cards with their `genuine` and `translation_artifact` verdicts, and puts a
`contested` badge on the Ockham attribution with Osborne named. It also asserts the two
things that could have been faked: that `PSG_ockham_sent` — which the seed cites but never
defines — renders as an unverified locus with no text, and that the four thinkers the seed
names but never describes become explicit placeholders with `wikidata: null`.

A second suite enforces that the shipped content is a faithful **superset** of the seed:
for every field F.5 supplies, the site content carries the same value. Without it, "the
seed loads unmodified" would be true of a fixture nobody looks at while the live page
quietly said something else. Prose is compared under the diacritic-light transform (the
site stores `ḥusn wa qubḥ` per research D's storage policy, F.5 prints `husn wa qubh`);
**quotations are compared byte-for-byte**, because a quotation is not ours to normalise.

`npm run validate` reports the live graph: 4 questions, 17 positions, 17 thinkers,
17 attributions, 3 intersections, 13 passages, 8 concepts. It exits non-zero on schema
violations, integrity errors, or any placeholder node reaching site content.

---

## 3. What the three stubs broke, and how it was fixed

This was the most useful part of the build. Six things broke.

**Stub 1** — *Is the world eternal, or created?* Two positions, both Islamic, no
intersection, no passages.

1. **The intersection view's empty state was a blank section.** Nothing said whether that
   meant "we checked and there is none" or "nobody has written this yet". Fixed with an
   empty state that says which it is: *"Every position recorded here sits inside a single
   tradition, so there is nothing yet to cross. That is a fact about how far this page has
   been written, not a finding about the question."*
2. **The apparatus rail became a dead column.** With no passages, the folio rendered a
   near-empty 20rem rail and 60% of the page was blank. Fixed with `.folio--solo`: no
   passages, no rail, and the text column takes the width.

**Stub 2** — *What are the valid sources of knowledge?*, `westernFramedMismatch: true`.

3. **The refusal panel needed the position model to admit non-answers.** A *pramāṇa*
   theorist is not choosing between foundationalism and coherentism. Fixed with
   `Position.refusesQuestion`, which splits `questionView` into `answers` and `refusals`;
   refusals render in their own panel with their own framing and are counted separately in
   the home ledger ("+ 2 reframings"), never as empty answer slots.
4. **Empty states stacked three deep and read as broken rather than candid.** Each stub
   position showed an empty definition, then a full-paragraph "Not yet written"
   explanation, then "No attributions recorded yet" — three dashed boxes per position.
   Fixed with a compact variant that names the missing fields on one line, keeping the
   long explanation for genuinely empty sections.

**Stub 3** — *jabr wa ikhtiyār*, six positions, heavy Arabic.

5. **`text-transform: uppercase` mangled Turkish.** The page kicker carries content (the
   domain and the technical name) and was uppercased. Under `lang="tr"` the browser
   correctly applies Turkish casing to it, so the English "free will and determinism"
   came out "FREE WİLL AND DETERMİNİSM". Fixed by removing the transform from the kicker:
   **chrome may uppercase, content may not.** Letterspacing carries the same hierarchy.
6. **`domain` was a bare string and could not be translated.** Six positions with
   `Metaphysics` sitting in Turkish prose made it obvious. Fixed by making `domain` a
   `LocalizedString` in the schema — a plain string still validates, so F.5 is unaffected —
   and translating the four domains.

Two more things broke that the stubs did not cause but that finishing them exposed:

7. **The home table overflowed the viewport on a 390px phone.** The first fix, stacked
   cards, worked visually but `display: block` strips the table roles from the
   accessibility tree, and a sourcing ledger only makes sense read as columns. Replaced
   with a keyboard-focusable `overflow-x: auto` region that keeps the table semantics.
8. **The tracer's own consistency check caught an error in my content.** A reader taking
   the divine-command line on every proposition was reported as inconsistent about natural
   law. The cause was that `entails` had been used for "consistent with" — answering
   *"nothing stands over God"* is shared by divine command and natural law and entails
   neither. Retightened so `entails` means a *distinctive* commitment and `conflictsWith`
   means incompatibility. There is now a regression test for both the clean path and the
   deliberate contradiction.

---

## 4. Where the research was insufficient, and what I decided

Nothing here was papered over with invented content.

### 4.1 Wikidata Q-IDs could not be resolved — all are `null`

Research F.3 makes the Q-ID the primary entity key. **wikidata.org is blocked by this
environment's network egress proxy**, as are plato.stanford.edu, iep.utm.edu,
philpapers.org, al-islam.org and 1000wordphilosophy.com.

I know several of these Q-IDs approximately well enough to type one. That is exactly the
failure mode to avoid: a plausible wrong Q-ID silently links to the wrong person and is
much worse than an absent one. **Decision: every `wikidata` field is `null`**, thinker
pages say "Not yet resolved… never guessed", the validator emits an info for each, and
`scripts/resolve-wikidata.mjs` will fill them in from a network-enabled machine. It
auto-writes only unambiguous person-shaped single matches and leaves ambiguous names —
"al-Ghazālī" matches several people — for a human.

Same reasoning for URLs: `SourceRef.url` has a companion `urlVerified` flag and **no
source in this repository carries a URL**, because none could be checked. Sources are
cited bibliographically instead. DOIs are rendered as links, since a DOI link is a
mechanical construction from a DOI string the research supplies.

### 4.2 F.5's `Equivalence` cannot express research B.2's third intersection

F.5 types both ends of an `Equivalence` as positions. B.2's third intersection relates
Plato's Euthyphro **dilemma** to the *ḥusn wa qubḥ* **debate** — neither end is a
position, and forcing them into position slots would have meant inventing two positions
nobody holds.

**Decision:** widen the intersection reference to resolve against positions first, then
questions, then objections, and add an optional explicit `traditions` pair for sides that
have no thinker to derive a tradition from. The F.5 seed is unaffected; the acceptance
test still passes on it unmodified. This is the one place the research's data model was
insufficient rather than merely thin.

### 4.3 The seed cites a passage it never defines

`PSG_ockham_sent` is referenced by the Ockham attribution and absent from F.5's `passages`
array. The Open Questions Register (#4) explains why: the Ockham *Sent.* II q.19 locus was
never verified against a named edition.

**Decision:** define it as a real record with a citation, `locusUnverified: true` and no
`text`. The loader also synthesises such a record for any cited-but-undefined passage
rather than dropping the reference, so the honest failure mode is "locus not verified"
rather than a silent hole or a fabricated quotation. `PSG_euthyphro_10a` and
`PSG_mughni_locus` are in the same state for the same reason.

### 4.4 "Never invent a citation" versus "a claim with no passage does not render"

Taken strictly, the second rule would delete most of research B.1: the Aquinas, Duns
Scotus, Augustine, Calvin and al-Ghazālī attributions are all given by the research
without a quotable passage.

**Decision:** the rule is enforced strictly for *quotations* — no passage, no quotation,
ever. Attributions without a passage still render, but carry a visible "No source passage
recorded" mark and are counted in the home page's sourcing ledger as unsourced (the seed
question shows 4 sourced of 14). The validator warns on every `settled` attribution with
no passage. Hiding those attributions would have made the page look better sourced than it
is, which is the opposite of the goal.

### 4.5 Claims the research asserts without naming its own source

Several B.1 characterisations are in the research's own voice — Aquinas "emphasized God's
intellect rather than His will", Scotus holding "versions" of divine command theory.

**Decision:** cite them as `Research brief, Deliverable B.1` rather than attributing them
to a source that was never named. It is honest, it is true, and it shows the reader the
chain is one link short of a primary text. Their epistemic status is `contested` or
`uncertain` accordingly, with the reason stated.

### 4.6 Dates the research does not give

The research gives dates for al-Ashʿarī, al-Ghazālī, al-Māturīdī, ʿAbd al-Jabbār,
Abū al-Hudhayl, Ockham and Aquinas, and for nobody else. Kant, Plato, Ibn Rushd, Scotus,
Augustine, Calvin and Confucius have well-known dates I could type from memory.

**Decision:** omit them. The brief lists dates among the things never to invent, and
"well known" is not the same as sourced. Those thinker pages render "Not recorded in the
sources used." The empty-state machinery is visible on real pages as a result, which is
the point.

### 4.7 Stub content the research names but does not describe

The research names compatibilism, libertarianism, hard determinism, foundationalism,
coherentism, *jabr*, *ikhtiyār* and *kasb* without defining any of them. These are famous
positions; writing a serviceable definition from memory would take a minute.

**Decision:** don't. Each renders "Not yet written" with the missing fields named and a
source line saying exactly what the research does and does not supply. A stub that is
honest about its gaps is the whole reason the brief asked for stubs.

### 4.8 Real-world cases have no basis in the research

Research I.3d asks for a `RealWorldCase` and sketches one line of one. There is no
sourced scenario to draw on.

**Decision:** author one — *a promise nobody will know you broke* — with implications for
all five positions derived from their definitions. It is marked `editorial: true` in the
data and labelled in the UI: *"Editors' example. This scenario is written for this site;
no thinker is recorded as having discussed it."* A pedagogical scenario is a legitimate
editorial construction; it is not a historical claim, and it is not dressed as one.

### 4.9 Turkish translations

I translated UI chrome, question framings, position labels and definitions, tracer
propositions, case scenarios, and the epistemic vocabulary. I did **not** translate
quotations or bibliographic citations: a quotation is not ours to render into a third
language, and a mangled citation is harder to find.

**Decision:** untranslated content falls back to English with a visible *"Not yet
translated — showing English"* mark rather than being machine-translated or silently
swapped. The fallback is a property of the resolver, so any future field gets it free.

### 4.10 Editorial stance

Research G.4 declines to choose and recommends picking explicitly. The MVP has no
editorial board, no charter and no right-of-reply mechanism, so the disclosed-neutrality
option is the only one it can actually honour.

**Decision:** disclosed neutrality, stated on the "How this is built" page, with the
research's own "editors' assessment" carve-outs kept as content rather than as the site's
voice — where the research says naïve divine command theory is "abandoned in its naïve
form" rather than refuted, that qualification is reproduced, not smoothed over.

---

## Quality floor

- **WCAG 2.2 AA**: axe-core reports **0 violations** across all twelve routes, in both
  light and dark themes. Every colour pairing was measured rather than eyeballed; the
  lowest ratio in either theme is 4.85:1.
- **Non-visual equivalent for the graph**: the confluence ships a `role="img"` with a
  title and a full text description of the cluster, plus the same nodes and edges as a
  table in the DOM — not behind a toggle. Verified by tabbing: 26 consecutive stops, every
  one with a visible focus ring, and focusing a sigil marks its rail entry.
- **RTL and bidi**: Arabic runs in `dir="rtl"` with `unicode-bidi: isolate` and Amiri, and
  renders correctly inline beside Latin. Devanagari and Han likewise.
- **i18n**: EN and TR from the first commit, `<html lang>` follows the choice, and the
  toggle labels themselves localise.
- **Diacritics**: canonical form stored, light form derived at render. Turkish, French,
  German and Spanish diacritics are explicitly preserved — `Gözübüyükoğlu` survives both
  modes — and citations are never lightened.
- **Responsive**: no horizontal overflow at 390px on any route; wide tables scroll inside
  their own focusable region.
- **`prefers-reduced-motion`**: the one animation renders its final state immediately.

## Out of scope, as instructed

No RAG pipeline, no accounts (the position map is `localStorage`), no CMS, no fifty-question
corpus, and no SEP or IEP article text anywhere in this repository.
