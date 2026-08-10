# Phase 2 report

Answering the six questions in §11, plus the eight defects in §1.

---

## 0. Diagnosis before styling

Each reported defect was reproduced against the deployed build before anything was
changed (`scripts` used for this are in the session, not committed). All eight were real.
Two were more specific than reported, and one I had missed in Phase 1:

| # | Reported | What was actually measured |
|---|---|---|
| 1 | No page structure | Routes existed, but only 5 nav links and no `/questions` index. More to the point, the *question* page was one long document — see 3. |
| 2 | Home opens with "Locate your position" | Confirmed: first call to action on `/` was the tracer. |
| 3 | Positions are one undifferentiated block | Confirmed: on the free-will question all 6 rendered at once and the sixth began **2324px** down a 2948px page. No selector element in the DOM. |
| 4 | Apparatus does not scroll independently | Confirmed and diagnosed: `position: sticky` with no `max-height` or `overflow`. Rail height **2479px** in an **800px** viewport, `scrollHeight === clientHeight` — no scroll context at all. |
| 5 | Text overlaps into gibberish | Confirmed, and **narrower than reported**: cards 1 and 2 were fine at every width; card 3 overprinted. A 58-character label centred at a fixed SVG coordinate collided with the opposite label, rendering `horrible-com`**`hasnswabjebhi`**`ondivine command`. My Phase 1 check screenshotted `.intersection` — the *first* match — and never looked at card 3. |
| 6 | Intersections unclear | Confirmed by inspection: the verdict was a lowercase word under a diagram, and "translation artifact" is jargon. |
| 7 | Empty content | Confirmed: 3 of 4 questions were stubs, all Wikidata IDs null. |
| 8 | Logo reads as a cross | Confirmed: the favicon was a vertical bar crossed by a horizontal one. |

---

## 1. Routes as built, and position selection

```
/                                    Home — a question, then a worked intersection
/questions                           Index, grouped by domain
/questions/:slug                     Framing: what is asked, why, how to read it
/questions/:slug/:position           A position in the reading column
/questions/:slug/compare?a=&b=       Two positions side by side
/questions/:slug/locate              The four-step interaction
/intersections                       Cross-tradition first, same-tradition labelled
/thinkers/:slug                      Positions held, qualifications visible
/terms  ·  /terms/:slug              Terminology index and entries
/positions/mine                      The personal map
/search?q=                           Plain-language search
/about                               Editorial stance and the integrity report
```

Slugs are authored in content (`husn-wa-qubh`, `divine-command`), not derived from ids.
Phase 1 URLs still resolve: `/positions/:id` redirects to the position under its question,
and `/yours` still reaches the personal map.

**Position selection** is in the left pane: a numbered list showing, per position, its
short label, holder count, and tradition pills, with the active one marked
`aria-current="page"`. Each is a link, not a tab, because selecting one changes the route
and the URL has to be shareable. Selecting a position swaps the reading column *and* the
apparatus together — the apparatus shows sources for the selected position alone, and for
the whole question when none is selected.

Screenshot: `design/shots/question-position-selection.png` (committed alongside this
report), showing the six-position free-will question with position 01 selected, the
tradition filter above the list, and the apparatus keyed to that position.

---

## 2. What I took from each reference site

Headless Chromium could not reach the open internet in this environment (the agent proxy
serves `curl` but refuses Chromium's `CONNECT`), so these were studied through retrieved
markup and CSS rather than interactively. Where that limits what I could learn, I say so.

| Site | Mechanic taken | Where it now appears |
|---|---|---|
| **Sefaria** | `readerPanelBox > readerPanel > readerContent` — the outer box owns the viewport height and never scrolls; each pane owns its own scroll. Confirmed in their markup. | `src/components/Reader.tsx` and `.reader` in `reader.css`. This is the direct fix for defect 4. |
| **Quran.com** | Per-verse translation layers carrying their own `dir` attribute, with a translation/transliteration toggle as a first-class control rather than a setting. | Every Arabic run carries `dir="rtl"` + `unicode-bidi: isolate` at the element that holds it; the diacritics toggle sits in the masthead beside the language toggle, not in a preferences panel. |
| **Perseus / Scaife** | Canonical reference numbering surfaced *in* the reading interface rather than in a bibliography. | The apparatus rail shows the locator (`Sent. II q.19`, `Stephanus 10a`) next to each citation, and says "locus not verified" where there is one but nobody checked it. |
| **Our World in Data** | Provenance as a feature: sourcing shown as a countable fact about the page. | The sourcing ledger — sourced against unsourced attributions — on the home page, the questions index, and `/about`. |
| **Stripe / Tailwind docs** | Three panes with independent scroll and a persistent masthead outside them, so the chrome never scrolls away. | `--masthead-h` is fixed and the reader box is `100dvh - masthead`; below 60rem the panes collapse to one document. |
| **Genius** | Inline annotation: a click on a phrase surfaces its explanation in place, without moving the reader. | `src/components/Gloss.tsx` — terms open a gloss inline with a link to the full entry. |

---

## 3. Verification pass

`scripts/verify-citations.mjs` re-fetches every URL in the content and checks two things:
that it resolves, and that the page's own `<title>` shares a distinctive word with the
citation. The second check is what catches a URL that resolves to the right site and the
wrong page.

```
48/48 verified, 0 failed.
10 attributions carry neither a source passage nor a URL.
```

**Negative control.** A checker that passes everything is worthless, so I ran it against a
fixture with two deliberate faults. It caught both:

- a real SEP URL (`entries/kant-moral/`) cited as the al-Ghazālī entry → `TITLE-MISMATCH`,
  reporting the actual page title;
- a fabricated URL (`entries/this-does-not-exist/`) → `404`, `Document Not Found`.

**Failures during authoring, and what I did.** Four URLs I expected to exist did not:
`plato.stanford.edu/entries/divine-command/`, `.../nyaya/`, `iep.utm.edu/ashari/` and
`iep.utm.edu/kalam/` all 404. Phase 1 had cited "SEP: Divine Command Theory" as a source
title without a URL; the real entry is **Theological Voluntarism**
(`entries/voluntarism-theological/`). None of those four went into content. This is the
whole reason for the rule: three of the four were slugs that *sound* right.

**Identifiers.** `scripts/resolve-wikidata.mjs --verify` re-fetches each of the 22 Q-IDs
and checks the entity is `P31: Q5` (human) with a label matching the name or an alias.
22/22 pass. Phase 1 shipped all-null because wikidata.org was blocked; that gap is closed,
and dates now come from Wikidata (CC0) where the research gave none.

One identifier is worth flagging as content rather than plumbing: Wikidata carries two
people called Vātsyāyana — the Nyāya commentator Pakṣilasvāmin (Q107348453) and the author
of the Kāmasūtra (Q380234). The site pins the commentator and says on his page that
whether they are the same person is disputed and not settled here.

---

## 4. Every field still marked "Not yet written", and why

**Positions with named empty fields (8):**

| Position | Empty | Why |
|---|---|---|
| `P_compatibilism`, `P_libertarianism`, `P_hard_determinism` | definition, holders, arguments, objections | Encyclopedia treatments exist and are linked. Writing three careful summaries of modern free-will positions is a substantial piece of work I did not do rather than do badly, and the free-will question is a stub by design. |
| `P_foundationalism`, `P_coherentism` | definition, holders, arguments, objections | Same, for the two Western answers on the knowledge-sources question. |
| `P_pramana_mimamsa` | definition, holders, arguments, objections | I found no source setting out the Mīmāṃsā position specifically. Extrapolating it from the Nyāya list would have been exactly the fabrication the protocol forbids. |
| `P_jabr` | definition in proponents' own terms, holders, arguments | Every source I retrieved describes jabr **from the outside**, as al-Ghazālī characterises his opponents. I have no source in which a proponent states it, and no named holder. The page says so. |
| `P_pramana_nyaya` | objections | The position, holders and argument are sourced; I found no stated objection to Nyāya's four-pramāṇa scheme in the sources I retrieved. |

**Attributions with neither a source passage nor a URL (10):** al-Ghazālī, Duns Scotus,
Augustine, Calvin and Adams on divine command; Kant on moral rationalism; al-Māturīdī on
the intermediate position; Aquinas and Ibn Rushd on natural law; Confucius on the
reframing. These are all Phase 1 attributions carried by the research brief's own voice.
They render with a visible "No source passage recorded" mark and are counted as unsourced
in the ledger. Sourcing them properly is the next content job.

**Primary-text loci deliberately left unverified (5):** Ockham *Sent.* II q.19; Plato
*Euthyphro* 10a; ʿAbd al-Jabbār *al-Mughnī*; al-Ghazālī *Tahāfut al-falāsifa* discussion 1;
Ibn Rushd *Tahāfut al-tahāfut* reply to discussion 1. No critical edition was consulted, so
no discussion or page number is asserted. Public-domain translations of the two Tahāfut
texts were looked for and not found at any retrievable URL.

---

## 5. What changed about the intersections view, and why the old one failed

**Why it failed.** The verdict was carried by the geometry of a joint in an SVG, and the
two descent chains were `<text>` elements at fixed coordinates with no length bound. That
works for "al-Ashʿarī" and breaks for "The Euthyphro dilemma, and the horrible-commands
objection". Text of unbounded length inside a fixed-coordinate SVG has no way to reflow, so
the failure is structural — nudging coordinates would move the collision, not remove it.
The second failure was semantic: "translation artifact" is a term of art, and a reader
meeting it for the first time learns nothing from it.

**What changed.**

1. **All text left the SVG.** Names, schools, traditions and formulations are HTML in a
   two-column grid that wraps like text. The SVG retains only a 64×48 verdict glyph with
   no text in it at all. A glyph with no text cannot collide — the bug class is gone by
   construction, not by tuning. Measured: 0 overlapping text pairs and 0 text nodes inside
   any card SVG, at 390/600/768/1024/1280px.
2. **The verdict leads in plain language.** "These look like the same position. They are
   not." for a translation artifact; "They arrived at the same claim independently." for a
   genuine one; "The resemblance does not go deep." for a superficial one. The technical
   term follows as a label rather than carrying the message.
3. **Three channels change together** so a translation artifact can never read like a
   genuine convergence: the headline sentence, the border and glyph colour (verdigris /
   grey / madder), and the joint geometry (fused / crossed / meeting across a seam).
4. **Both claims are always stated**, as a two-row definition list: `BOTH HOLD` (what
   coincides) and `BUT` (where they part ways). A convergence with no divergence would be
   an identity claim, and the loader warns if one is authored.

I dropped the accessible node/edge table that Phase 1 shipped alongside the diagram. It
existed because the diagram was the only place the information lived; now the HTML *is*
the information and the glyph is decoration with an `aria-label`, so a table would have
been a second copy of what a screen reader already reads. Reported here because it is a
removal, not an oversight.

---

## 6. Where I think this prompt is wrong

**§6, "no term appears in content without an entry", is the right rule with a wrong
default.** I implemented it, but conservatively: the glosser matches only strings a term
explicitly declares in `surfaceForms`, and only the first occurrence per block. Matching on
transliterations automatically — the obvious reading — would gloss `li` inside "political"
and `yi` inside "yield", and marking every occurrence turns a paragraph into a field of
dotted underlines that stops reading as prose. The authored-surface-form list is more work
per term and is the only version that stays readable.

**§1.8's diagnosis of the logo was right, and its scope was too narrow.** The cross was a
`†` — the dagger this site uses as its apparatus mark for a contested claim. So the same
glyph was also sitting inline next to every contested attribution, where it reads the same
way. I replaced the favicon *and* left the inline dagger in place, because in running text
next to the word "contested" it is unambiguously an editorial mark. Flagging it so the
decision is visible rather than silent.

**§4's "do not add a fifth question" and "complete the three stubs to the standard of the
seed" pull against each other under §5.** I could complete them to that standard only where
retrievable sources existed. For the eternity-of-the-world question they did, and it is now
`worked`. For the three modern Western free-will positions and the two Western epistemology
positions, completing them to seed standard means writing five careful summaries from
encyclopedia articles, and doing that quickly is precisely how fabrication enters. I left
them empty and named the gaps. Given the choice between the completeness instruction and
the anti-fabrication protocol, I took the protocol as governing — but the tension is real
and it is the reason three questions are still marked `stub`.

**§2's route list omits an intersections detail page.** `/intersections` lists every
convergence in full, which is fine at three and will not be at thirty. There is no
`/intersections/:slug`, so a single convergence cannot be linked to directly — a real gap
for the surface the brief calls the signature one. I did not add it because the route
inventory was specified and adding routes not asked for seemed worse than reporting the
omission.

**One thing I changed in the content because a source contradicted the brief.** The
research document treats the *pramāṇa* traditions as reframing the knowledge question
rather than answering it, and the Phase 1 page asserted that in the site's own voice. The
Stanford Encyclopedia's entry on classical Indian epistemology says that *pramā* — the
output of a knowledge source — matches analytic uses of "knowledge" "practically
perfectly". That cuts against the reframing claim. The page now carries both readings with
sides named, keeps `westernFramedMismatch: true` because the *starting point* really does
differ, and states the refusal as contested rather than as fact. This is the site's own
rule applied to its own brief.

---

## Verification summary

```
schema        14/14 fragments valid
graph         4 questions · 17 positions · 22 thinkers · 25 attributions
              3 intersections · 25 passages · 18 concepts
tests         36 passed (acceptance, seed-consistency, behaviour)
citations     48/48 URLs verified, 0 failed
identifiers   22/22 Wikidata Q-IDs verified as P31:Q5 with matching labels
axe           0 violations · 16 routes · light and dark
overflow      none at 390 / 768 / 1024 / 1440px
keyboard      30 focus stops, 0 without a visible ring
RTL           Arabic runs dir=rtl, unicode-bidi:isolate, Amiri
```
