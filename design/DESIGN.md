# Design plan

Two passes, as the brief asks. Pass 1 is the plan. Pass 2 is the critique of that plan
against the brief, and what changed. The code derives from the revised plan, not from pass 1.

---

## Pass 1 — the plan

### Grounding

A site about positions and their objections has an obvious structural precedent: the page
of a critical edition. *Matn* and *sharḥ*. Marginal *ḥāshiya*. Superscript sigla resolving
to an *apparatus criticus* at the foot. The Talmudic page, where the disagreement physically
surrounds the text. For a thousand years, philosophical texts have carried their own
disputes in the margins, and the margin is a solved interface problem: it holds contested
readings adjacent to, but typographically subordinate to, the claim they contest.

So: **the margin is a first-class column**, not a sidebar of related links.

### Palette — pigments, six values

Manuscript pigments rather than a brand accent:

| token | light | dark | channel |
|---|---|---|---|
| `--paper` | `#E8ECEA` | `#131A19` | limewash ground, cool grey-green |
| `--ink` | `#16211F` | `#DEE5E2` | main text |
| `--lapis` | `#2A4A8B` | `#93B4EC` | positions, structure, links |
| `--madder` | `#8A3A3C` | `#E8A19E` | objections |
| `--orpiment` | `#7A5C10` | `#D9B65E` | contested attribution |
| `--verdigris` | `#25605A` | `#78C9B8` | settled attribution, genuine convergence |

### Type — three roles

- **Display:** Young Serif — blunt, incised, single weight. Titles and question text.
- **Body:** Gentium Book Plus — SIL, built for extended-Latin transliteration.
- **Apparatus:** Noto Sans Mono — citations, loci, sigla, epistemic labels.
- **Arabic:** Amiri — Naskh, for source-script terms.

### Layout

Two columns: a 62ch text column and a ~22rem apparatus rail, divided by a hairline.

### Signature element

The intersection view, drawn as a **confluence**: two descent chains
(thinker → school → tradition) as vertical stems from opposite margins, meeting at a joint.

### Motion

The confluence stems draw in when the intersection view enters.

---

## Pass 2 — critique, and what changed

I went through pass 1 asking of each decision: *would I produce this for any comparative-content
site?* Six things failed that test.

### 1. "Text column plus sidebar" is the generic answer — the rail was decorative

Every documentation site has a right rail. What makes a margin *a margin* rather than a
sidebar is that it is **keyed**: the text carries sigla, the sigla resolve into the rail, and
neither column is usable alone.

**Changed.** Sigla (`ᵃ ᵇ ᶜ`) are real focusable buttons in the running text. Focusing or
hovering one marks its rail entry, and the reverse. Every rail entry states its citation,
locator, licence, and — where the claim is contested — the named sides. Contested
attributions push their mark into the margin rather than inline, because that is where a
gloss historically lives. On narrow screens the rail does not vanish; each sigil becomes an
inline disclosure holding the same content.

### 2. The palette was drifting toward the cream-and-terracotta default

"Manuscript pigments" is a short walk from `#F4F1EA` plus `#D97757`. Two changes pull it back.
First, the ground is **cool** — a green-grey limewash, not paper-cream — and there is no
terracotta anywhere. Second, and more important: **colour here is a taxonomy, not a brand.**
The three looks the brief names all run one accent against a neutral. This palette runs four
hues that each mean exactly one thing — lapis for positions, madder for objections, orpiment
for contested attribution, verdigris for settled — which is the brief's own requirement that
epistemic status be visible rather than buried, discharged in colour rather than in badges.
A reader who learns four hues can read the epistemic state of a page at a glance.

Every pairing was checked, not eyeballed: the lowest ratio in either theme is 4.85:1 against
the recessed panel, above the 4.5:1 AA threshold for body text.

### 3. Coloured pills would have made every contested claim look broken

The default badge system is a row of pills, and pills read as alerts. The brief is explicit
that contested must not look like a warning — contested is the *interesting* part.

**Changed.** No pills. The apparatus supplies the marks: **`†` for contested, `‡` for
uncertain, and nothing at all for settled.** Absence is the signal for the ordinary case,
so a well-attested page is visually quiet and a disputed one is annotated rather than
alarmed. Each mark expands to the named sides — "Osborne reads Ockham this way; much recent
scholarship denies it" — because a status with no sides is a defect, and a status with sides
is content.

### 4. The display face could not set the site's own vocabulary

Pass 1 named Newsreader. Reading its cmap: it contains **none** of `ḥ ḍ ṣ ṭ ẓ ṇ ṛ ṃ` and
neither `ʿ` nor `ʾ`. Every question heading on this site contains at least one of those.
Newsreader would have rendered *ḥusn wa qubḥ* by silently substituting a system font
mid-word.

Worth recording how that was caught, because the obvious check is wrong: Google Fonts'
`css2?...&text=` endpoint **echoes back the codepoints you asked for** in `unicode-range`
whether or not the font has them. Asking Gentium — a Latin-only face — for `仁` returns
`U+4EC1` in the range. The only sound check is to read the cmap of the actual binary.

**Changed.** Twenty-eight candidate families were screened against their real cmaps.
`ḳ` (U+1E33) and `→` are absent from nearly all of them and appear nowhere in this content,
so they were dropped from the requirement; the rest is non-negotiable. **Young Serif**
survives with full coverage, and is the better choice anyway: blunt, wedge-serifed, single
weight, closer to an inscription than to an editorial serif, and unlike Fraunces or Cormorant
it is not one of the faces the current default look reaches for. `scripts/verify-fonts.mjs`
now runs in `npm run validate`, so a face that cannot set the vocabulary fails the build.

Fonts are self-hosted for the same reason: the CDN's standard `latin-ext` subset stops at
U+02BA and excludes Latin Extended Additional entirely.

### 5. Animating the confluence on every view would have spent the one moment on nothing

The brief allows one orchestrated moment. Pass 1 spent it on page entry, which is decoration:
by the time you have navigated to the intersection view you already know what it says.

**Changed.** The confluence renders statically everywhere on the site. It animates in exactly
one place — **step 3 of the tracer**, immediately after the user has committed to a position
and been shown the strongest objection to it. The stems descend from opposite margins and
the joint resolves under them. That is the sentence *"here is who else holds this, across
traditions that never met"* given as motion, and it is earned because the user just paid for
it. `prefers-reduced-motion` renders the final state immediately.

The verdict is carried by the **geometry of the joint**, not by a label beside it:

```
   genuine                superficial            translation_artifact
   al-Ashʿarī  Ockham     A          B           ʿAbd al-Jabbār   Kant
       │         │        │          │                 │           │
       ╰────┬────╯         ╲        ╱                  ╰─ ─ ─┬─ ─ ─╯
            │               ╳                            ╌╌╌╌┆╌╌╌╌
            │              ╱ ╲                               ┆
       one stem         they cross,             they appear to meet; a seam
       continues        then continue           runs through the joint and
                        separately              the shared stem is dashed
```

### 6. The home page was a blog index wearing a hero

Pass 1 had a big question followed by a list of questions. That is every content site.

**Changed.** The home page is an **index locorum** — the front matter of a reference volume.
One question is set large and entered directly, and beneath it the corpus is a dense table
with real columns: positions, traditions represented, cross-tradition intersections, and
**how many claims are passage-sourced against how many are not**.

That last column is the addition I would defend hardest. This project's failure mode is
breadth-first shallowness dressed up as coverage. A table that states on the front page that
three of four questions are stubs, and that *n* attributions carry no source passage, is more
useful than any hero copy, and it is the only honest way to open a site whose whole claim is
that it does not fabricate. It also gives the empty states somewhere to point.

---

## Resulting layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  loveofwisdom            questions  intersections  terms  your positions│
│                                          [diacritics: light|full] [EN|TR]│
├────────────────────────────────────────────────────────────────────────┤
│  ETHICS & MORAL EPISTEMOLOGY · husn wa qubh                             │
│                                                                          │
│  Is the moral status of an act grounded in                              │
│  revelation or in reason?                        ← Young Serif, 44px     │
│  Do things become right because God says so, or can we work out         │
│  right and wrong ourselves?                                              │
│                                                                          │
├──────────────────────────────────────┬─────────────────────────────────┤
│  POSITIONS                    (matn) │  APPARATUS            (ḥāshiya)  │
│                                      │                                  │
│  ① Divine Command Theory             │  ᵃ  M. Abdul Hye, 'Ashʿarism',   │
│     An act's moral status is …       │     A History of Muslim Phil.    │
│     ─────────────────────────        │     vol. 1 · ch. 11 · fair use   │
│     held by                          │                                  │
│       al-Ashʿarī  d. 324/936      ᵃ  │  ᵇ  † contested                  │
│       Ockham    † d. 1347         ᵇ  │     Osborne (Religious Studies   │
│                                      │     41:1, 2005) reads Ockham as  │
│  ② Moral rationalism                 │     a divine-command theorist;   │
│     Acts have intrinsic ḥusn/qubḥ …  │     much recent scholarship      │
│       ʿAbd al-Jabbār  d. 415/1025 ᶜ  │     denies it.                   │
│       Kant          † d. 1804        │     → primary locus not verified │
├──────────────────────────────────────┴─────────────────────────────────┤
│  WHERE TRADITIONS MEET                                    2 intersections│
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐    │
│  │  al-Ashʿarī ─┬─ Ockham       │  │ ʿAbd al-Jabbār ╌┆╌ Kant      │    │
│  │        genuine convergence   │  │   translation artifact       │    │
│  └──────────────────────────────┘  └──────────────────────────────┘    │
├────────────────────────────────────────────────────────────────────────┤
│  ⌀ WHERE THE QUESTION IS REFUSED                                        │
│    Confucian ethics does not answer this question. It rejects the       │
│    dichotomy …                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

## Quality floor

WCAG 2.2 AA. Every graph rendering ships a table equivalent in the same DOM, not behind a
toggle. Keyboard traversal on the confluence. RTL and bidi isolation for Arabic. EN and TR
from the first commit. Diacritic-light by default with a toggle. `prefers-reduced-motion`
honoured. Visible focus everywhere.
