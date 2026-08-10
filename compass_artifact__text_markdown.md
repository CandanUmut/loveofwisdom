# Deep Research Brief — Foundation for a Public Philosophy Platform: Specification Substrate

**Epistemic legend:** `[settled]` uncontroversial among specialists · `[contested]` live scholarly disagreement (sides named) · `[uncertain]` could not establish. "Locus unverified" flags a claim whose primary-text citation I could not confirm within budget.

**Standing caveat on coverage bias:** This report was researched primarily in English-language web sources within a fixed budget. Sourcing is strongest for licensing/data (E), data modeling (F), AI-integrity (G), prior art (H), and build planning (J), and for the seed question (ḥusn wa qubḥ). It is deliberately thinner, and flagged as such, for Indian, Chinese, African, Indigenous, and Latin American material. Primary-text loci for pre-modern non-Western works are frequently given at the level of work and edition, not verified line numbers.

---

## Deliverable A — The Question Corpus

### A.1 Derivation methodology
The corpus is derived, not invented, by intersecting four taxonomies: (1) the **PhilPapers category tree**, whose Level-1 clusters are Metaphysics and Epistemology, Value Theory, Science/Logic/Mathematics, History of Western Philosophy, and Philosophical Traditions, plus a "Philosophy, Misc" and "Other Academic Areas" cluster `[settled]` — PhilPapers itself states the taxonomy "is extremely preliminary, and is much better developed in some areas than in others," with philosophy of mind best developed and "a number of areas of Value Theory and Science/Logic/Mathematics … very patchy"; (2) the **2020 PhilPapers Survey** 100-question instrument (≈50 metaphysics/epistemology, 30 value theory, 9 philosophy of science/logic/math, 6 history, 5 other), which gives us questions that working philosophers actually treat as live; (3) **SEP/IEP entry structure**; and (4) the **ḥusn wa qubḥ** debate and *uṣūl al-fiqh* categories from Islamic sources for non-Western framing. Each question below carries its taxonomic provenance.

### A.2 Politics of the list
Privileging the PhilPapers/SEP taxonomy embeds a specific bias: it is analytic, Anglophone, and value-theory-heavy in a Western frame. The 2020 PhilPapers Survey respondents were "mainly from North America, Europe, and Australasia" and the target population skewed analytic `[settled]`. This taxonomy **excludes or marginalizes**: (a) practice-first traditions (Confucian *li*, Islamic *ʿamal*) where the organizing unit is cultivation, not proposition; (b) liberation-oriented framings central to Latin American and Africana philosophy; (c) soteriological framings (mokṣa, nirvāṇa) where the point of philosophy is release, not knowledge. An **alternative organizing scheme starting from Indian categories** would foreground the *pramāṇa* (means of valid knowledge) debate as the spine of epistemology and place *duḥkha*/liberation at the center rather than as "applied" ethics; **a Chinese-categories scheme** would foreground the *dao/de* (way/virtue) and *ming* (naming/rectification) axes and treat metaethics as inseparable from self-cultivation. The platform should therefore treat "domain" as a *view*, not a *fact*, and let users re-cluster.

### A.3 Seed question corpus (grounded sample, ~20 questions across 10 domains)
Each entry: canonical phrasing · plain-language (≈grade 8) · technical name · why it matters · provenance.

**Ethics & moral epistemology**
1. Is the moral status of an act grounded in revelation or in reason? · "Do things become right because God says so, or can we figure right and wrong out ourselves?" · *ḥusn wa qubḥ* / divine command vs. moral rationalism · decides whether ethics needs religion · (Islamic kalām; PhilPapers Meta-Ethics; SEP/IEP "Divine Command Theory"). **[This is the fully-worked seed — see B.]**
2. What makes an action right — its consequences, a rule, or the character it expresses? · "Should we judge actions by results, rules, or the kind of person they make us?" · consequentialism vs. deontology vs. virtue ethics · the everyday framework for any hard choice · (PhilPapers Normative Ethics; 2020 Survey "Normative ethics").
3. Are moral claims objectively true, or expressions of attitude? · "Is 'murder is wrong' a fact or a feeling?" · moral realism vs. anti-realism/expressivism · whether moral disagreement can be resolved · (2020 Survey: naturalist realism led non-naturalist realism and constructivism as most popular metaethics).
4. Can reason alone motivate moral action? · "Does knowing what's right make you want to do it?" · internalism vs. externalism about moral motivation · (2020 Survey noted a swing toward externalism about moral motivation).

**Metaphysics**
5. Do we have free will, and is it compatible with determinism? · compatibilism/libertarianism/hard determinism · grounds blame, praise, punishment · (2020 Survey; Islamic *jabr wa ikhtiyār* debate).
6. What is the relationship between mind and body? · dualism/physicalism · (PhilPapers Philosophy of Mind, best-developed category).
7. Is personal identity continuous over time, and what constitutes it? · (Buddhist *anātman* vs. Nyāya/Hindu *ātman* — a genuine cross-tradition axis).
8. Is time travel metaphysically possible? · (2020 Survey: respondents "about evenly divided").

**Epistemology**
9. What are the valid sources of knowledge? · *pramāṇa* theory (Indian) vs. Western foundationalism/coherentism — **framing mismatch flagged in A.4**.
10. Is any knowledge a priori? · (2020 Survey swing toward a priori knowledge).

**Philosophy of mind**: 11. Is consciousness physical? · the hard problem. 12. Can machines think? · (Wi-Phi/public-facing staple).
**Philosophy of religion**: 13. Does God exist, and can it be shown by reason? · (kalām cosmological argument; Anselm's ontological argument). 14. Is the world eternal or created? · (al-Ghazālī vs. the falāsifa — Ibn Rushd).
**Political philosophy**: 15. What legitimates political authority? 16. Capitalism or socialism? · (2020 Survey: 53% socialism, ~30% capitalism, ~20% other).
**Aesthetics**: 17. Are aesthetic judgments objective?
**Philosophy of language**: 18. How do words refer? · (2020 Survey swings toward contextualism).
**Logic**: 19. Is classical logic correct, or do some contradictions hold?
**Philosophy of science**: 20. Are scientific theories true or merely useful? · scientific realism vs. instrumentalism.

*(The machine-readable appendix carries the extensible template; the methodology in A.1 lets the build agent grow this to 50–100. The full corpus is marked incomplete in the Open Questions Register.)*

### A.4 Western-framed questions that do not map cleanly
This small-but-critical set drives a distinct interface mode ("this tradition rejects the question"):
- **"Is knowledge justified true belief?"** — The Indian *pramāṇa* traditions do not frame knowledge (*pramā*) primarily as a species of belief requiring justification against Gettier-style defeat; they ask which *instruments* (perception, inference, testimony, comparison) yield veridical cognition `[contested]` — this is a reframing, not a disagreement.
- **"Does God exist?"** as a yes/no propositional question — Some traditions (certain Buddhist, Confucian, and Daoist strands) do not organize around a creator-God question at all; the question is not answered "no" so much as declined `[settled]` that these traditions are non-theistic in orientation.
- **"What is the mind-body relation?"** — Traditions built on *nafs*/*qalb*/*ʿaql* faculty-psychology (Islamic) or *xin* (heart-mind, Chinese, which fuses cognition and affect) do not partition "mind" from "body" along the Cartesian seam, so the question's presupposition is foreign `[contested]`.
- **"Is morality grounded in reason or revelation?"** — *Ironically, the seed question is itself partly Western-framed*: the Muʿtazila/Ashʿarī debate does map onto it well (see B), but Confucian ethics rejects the dichotomy, grounding morality in ritual-cultivated relational virtue (*ren*, *li*) rather than in either abstract reason or divine command `[contested]`.

---

## Deliverable B — The Position Space (seed question fully worked)

**Seed question: "Is the moral status of an act grounded in revelation or in reason?" (the ḥusn wa qubḥ debate, with cross-tradition mapping).**

### B.1 Positions (defined in proponents' own terms)

**P1 — Theistic voluntarism / Divine Command Theory (revelation-grounded).** *An act's rightness or wrongness is constituted by God's command or will; acts have no intrinsic moral value prior to God's decree.*
- **Holders:** Abū al-Ḥasan al-Ashʿarī (d. 324/936) and the Ashʿarī school; on the standard reading al-Ghazālī (d. 505/1111); in the Christian West, William of Ockham (d. 1347), and versions in Augustine, Duns Scotus, and John Calvin; modern: Robert Merrihew Adams' "modified" DCT `[settled]` for the school attributions; `[contested]` for how thoroughgoing each individual was.
- **Strongest argument for:** The omnipotence/sovereignty argument — as the 1000-Word Philosophy summary frames it, "Something that can make things right or wrong by will is more powerful than something that can't," so a maximally powerful God must be the source of moral value.
- **Strongest objection:** The Euthyphro dilemma (Plato, *Euthyphro* 10a — locus unverified pending named edition) and the "horrible commands" objection — DCT implies that if God commanded cruelty, cruelty would be obligatory, which most find a *reductio*.

**P2 — Moral rationalism / ethical objectivism (reason-grounded).** *Acts possess intrinsic moral value (ḥusn/qubḥ) that human reason (ʿaql) can know independently of revelation.*
- **Holders:** The Muʿtazila — e.g., Abū al-Hudhayl al-ʿAllāf (752–841) and especially al-Qāḍī ʿAbd al-Jabbār (d. 415/1025); in the West, Kant and the broad rationalist/intuitionist tradition. Per al-Islam.org's summary of Muṭahharī, the Muʿtazila held that "truthfulness, trustworthiness, chastity … are intrinsically good … falsehood, treachery, indecency … intrinsically evil," and that "human reason can independently judge … the good or evil in things … independently of the commands of the Sharīʿah" `[settled]`.
- **Strongest argument for:** The moral-knowledge-precedes-revelation argument — we must know lying is bad in order to trust that a truthful God's revelation is reliable; grounding all value in command is circular (ʿAbd al-Jabbār; see Hourani 1971).
- **Strongest objection:** The Ashʿarī sovereignty objection — intrinsic values independent of God constrain divine omnipotence and posit an obligation "over" God.

**P3 — Māturīdī / intermediate position.** *Reason can know the moral value of acts, but obligation (the reward/punishment consequence) attaches only through revelation.* Attributed to Abū Manṣūr al-Māturīdī (d. 333/944) and his school `[contested]` on exact scope — scholarship distinguishes ontological value-cognition from deontic bindingness.

**P4 — Natural-law / intellectualist theism.** *Morality is grounded in God's nature/reason rather than arbitrary will; God commands the good because it is good.* Aquinas (d. 1274), who "emphasized God's intellect rather than His will," and in Islam certain readings of the falāsifa `[contested]`.

**P5 — Confucian relational-virtue reframing (rejects the dichotomy).** Morality is grounded in cultivated humaneness (*ren*) expressed through ritual propriety (*li*) and rightness (*yi*), neither "revealed" nor derived from abstract reason `[contested]`.

### B.2 Cross-tradition intersections (HIGH PRIORITY sub-deliverable)

**Intersection 1 — al-Ashʿarī ↔ Ockham (divine command).**
- **Convergence: genuine but not identical.** Both ground moral value in divine will rather than intrinsic properties. Al-Islam.org (M. Abdul Hye, "Ashʿarism") states the Ashʿarites held "revelation and not reason is the real authority … Goodness and badness of actions (ḥusn wa qubḥ) are not qualities inhering in them; these are mere accidents (aʿrāḍ)." Cambridge Core (T. Osborne, "Ockham as a Divine-Command Theorist," *Religious Studies* 41:1, 2005, DOI 10.1017/S0034412504007218) says Ockham "holds that the ultimate ground of a moral judgement's truth is a divine command, rather than natural or non-natural properties" and "God could assign a different moral value … even to loving God."
- **Evidence of genuineness:** Both independently generate the same "biting the bullet" structure — the 1000-Word Philosophy entry notes "Al-ʿAshari stands out as the best example of a thoroughgoing bullet-biter" while "William of Ockham comes close … but even he seems to have wavered."
- **The translation-artifact caution:** The convergence is *structural* (both make value will-dependent) but the theological frameworks differ — Ashʿarī occasionalism and the doctrine of *kasb* (acquisition) have no Ockhamist parallel, and Ockham operates inside a natural-law-saturated context he is reacting against. Modern scholarship disputes how far Ockham really was a divine-command theorist (Osborne records that "this thesis is denied by much recent scholarship"). **Verdict: genuine convergence on the core metaethical claim; superficial to equate the fuller systems.**

**Intersection 2 — Muʿtazila ↔ Kant (moral rationalism).**
- **Convergence: genuine on objectivity of value + power of reason; superficial on foundations.** Both hold that reason apprehends moral truth independently of divine command. But ʿAbd al-Jabbār grounds objective value in a realist ontology of acts (George F. Hourani, *Islamic Rationalism: The Ethics of ʿAbd al-Jabbâr*, Oxford: Clarendon Press, 1971), whereas Kant grounds obligation in the self-legislation of practical reason (autonomy). Calling both "moral rationalism" risks a **translation artifact**: ʿAbd al-Jabbār is closer to moral *realism/intuitionism* than to Kantian constructivism. **Verdict: genuine agreement that reason knows objective moral value; the label "rationalism" conceals a realist/constructivist divide.**

**Intersection 3 — Euthyphro ↔ ḥusn wa qubḥ debate (the shared dilemma structure).**
- **Convergence: genuine and historically striking.** The same dilemma — is the good good because God wills it, or willed because good? — structures both Plato's *Euthyphro* and the Muʿtazilī/Ashʿarī dispute, apparently independently `[settled]` that the structures match; `[uncertain]` on any transmission link.

### B.3 Positions widely believed refuted, and by what argument
- **Naïve/unrestricted Divine Command Theory** is widely held to be refuted by the Euthyphro "arbitrariness + horrible commands" argument; most theistic philosophers now hold *modified* DCT (Adams) or natural-law intellectualism instead `[contested]` — "refuted" overstates; "abandoned in its naïve form" is accurate.
- **Ethical egoism** as a consistent normative theory is widely regarded as failing publicity/universalizability tests `[contested]`.
- Note the epistemic-honesty rule: in philosophy "refuted" is almost always "widely regarded as decisively objected-to," not settled like an empirical falsification.

---

## Deliverable C — Tradition Coverage and Depth Audit

For each tradition: minimum thinkers/texts/debates; standard reference works; leading living scholars; translation controversies; popular-summary distortions; **coverage-thinness flag**.

### C.1 Islamic
- **Kalām:** Muʿtazila (Abū al-Hudhayl, al-Naẓẓām, al-Jubbāʾī, ʿAbd al-Jabbār), Ashʿarīs (al-Ashʿarī, al-Bāqillānī, al-Juwaynī, al-Ghazālī, Fakhr al-Dīn al-Rāzī), Māturīdīs (al-Māturīdī). **Falsafa:** al-Kindī, al-Fārābī, Ibn Sīnā (Avicenna), al-Ghazālī, Ibn Rushd (Averroes), Ibn Ṭufayl, Ibn Taymiyya, Mullā Ṣadrā. Plus *uṣūl al-fiqh* as moral epistemology and the **ḥusn wa qubḥ** debate (fully worked in B).
- **Standard reference works:** SEP entries on Islamic philosophy/theology; George Hourani, *Islamic Rationalism* (1971) and *Reason and Tradition in Islamic Ethics* (Cambridge, 1985, posthumous) — Hourani was called by UB's Peter Hare "unquestionably the leading specialist in Islamic thought in the United States"; the al-Islam.org corpus (Shīʿī-inflected — flag perspective).
- **Translation controversies:** *kalām* ≠ "theology" cleanly (it is dialectical/apologetic theology); rendering *ʿaql* as "reason" imports Enlightenment baggage (see D).
- **Popular-summary distortions:** (a) The "al-Ghazālī killed Islamic science/philosophy" narrative is contested by specialists. (b) The claim that Ashʿarīs reject reason entirely is wrong — an *Islam and Civilisational Renewal* study shows Ashʿarīs accept "rational good and evil" in the perfection/suitability senses while denying only reason's power to establish *obligation*. (c) Muʿtazila ≠ "liberal/rationalist Muslims" in a modern political sense.
- **Coverage flag:** MODERATE-TO-GOOD in English for kalām and falsafa; THIN for post-classical (Mullā Ṣadrā and later school philosophy) and for living-tradition Ottoman/Qom scholastic continuations.

### C.2 Greek, Hellenistic, Roman Stoic, Late Antique
Presocratics (Diels–Kranz numbering), Plato (Stephanus pagination), Aristotle (Bekker numbering), Epicureans, Stoics (Chrysippus, Epictetus, Marcus Aurelius, Seneca), Skeptics, Plotinus/Neoplatonism. **Reference:** Perseus Digital Library (public-domain Greek/Latin, TEI-XML). **Coverage flag:** EXCELLENT; canonical numbering exists.

### C.3 Jewish & Christian scholastic
Jewish: Saadia Gaon, Maimonides (*Guide of the Perplexed*), Gersonides. Christian: Augustine, Boethius, Anselm, Aquinas, Duns Scotus, Ockham. **Coverage flag:** EXCELLENT.

### C.4 Indian
Six *āstika* schools (Nyāya, Vaiśeṣika, Sāṃkhya, Yoga, Mīmāṃsā, Vedānta); Buddhist (Abhidharma, Madhyamaka/Nāgārjuna, Yogācāra/Vasubandhu); Jain (*anekāntavāda*); Cārvāka/Lokāyata (materialist). **Reference:** GRETIL (Göttingen Register of Electronic Texts in Indian Languages) for Sanskrit source texts. **Translation controversy:** *dharma*, *mokṣa*, *pramāṇa* (see D). **Coverage flag:** GOOD for major schools in English; THIN and often polemical for Cārvāka (surviving mainly through opponents' quotations).

### C.5 Chinese
Confucian (Confucius, Mencius, Xunzi), Mohist, Daoist (Laozi, Zhuangzi), Legalist (Han Feizi), Neo-Confucian (Zhu Xi, Wang Yangming). **Reference:** Chinese Text Project (ctext.org), open-access pre-modern corpus. **Translation controversy:** *ren*, *yi*, *li*, *dao* (see D). **Coverage flag:** GOOD.

### C.6 Modern & contemporary Western (incl. 20th-c. metaethics)
Descartes→Hume→Kant→Hegel→Mill→Nietzsche; analytic (Frege, Russell, Wittgenstein, Moore); 20th-c. metaethics (emotivism/Ayer/Stevenson, prescriptivism/Hare, error theory/Mackie, expressivism/Blackburn/Gibbard, Cornell realism). **Reference:** SEP/IEP/PhilPapers. **Coverage flag:** EXCELLENT.

### C.7 African, Indigenous, Latin American (integrated from targeted research)

**African/Africana — MOST developed of the three.** SEP ("Contemporary Africana Philosophy," Paul C. Taylor, first pub. 9 Aug 2021): the field "has in recent years become a going concern among professional academic philosophers … reputable publishers now publish work in the area and reputable institutions now seek to hire scholars … states of affairs that did not obtain a few short years ago." **Reference works:** SEP "Africana Philosophy" (Lucius Outlaw), "African Ethics" (Kwame Gyekye), "African Sage Philosophy" (Dismas Masolo); IEP "African Sage Philosophy" (Gail Presbey); *A Companion to African Philosophy* (ed. Kwasi Wiredu, Blackwell 2004); Lewis Gordon, *An Introduction to Africana Philosophy* (Cambridge, 2008). **Leading scholars:** living — Souleymane Bachir Diagne (Columbia, retired from active teaching 2025), Lewis Gordon (UConn), Kwame Anthony Appiah, V.Y. Mudimbe, Thaddeus Metz (ubuntu); deceased (flag) — Kwasi Wiredu (d. 6 Jan 2022), Paulin Hountondji (d. 2 Feb 2024), Kwame Gyekye (d. 13 Apr 2019), Henry Odera Oruka (d. 1995). **Debate:** the "ethnophilosophy" critique (Hountondji: collective worldviews "masquerading as philosophy" lacking individual argumentation) vs. sage philosophy (Odera Oruka's 1970s Nairobi project interviewing individual sages; his "Four Trends" taxonomy is standard). **Concept + caution:** *ubuntu* (Metz its leading theorist); SEP documents that the "mainstreaming" of African concepts by a "majority white philosophy professoriate" in South Africa is viewed by Mogobe Ramose as "extremely suspicious," and Christian Gade (2012) documents definitional instability. **Coverage flag:** GOOD.

**Latin American — MODERATELY developed.** SEP ("Latin American Philosophy: Metaphilosophical Foundations," Susana Nuccetelli): "A salient feature … is its early engagement in reflection about … its quality and the very possibility of its existence," and "many of them have answered those questions with skepticism about the existence of a philosophy that can rightly be called 'Latin American.'" **Reference:** *A Companion to Latin American Philosophy* (eds. Nuccetelli, Schutte & Bueno, Wiley-Blackwell 2010); Nuccetelli, *An Introduction to Latin American Philosophy* (Cambridge, 2020). **Scholars:** living — Susana Nuccetelli (St. Cloud State), Ofelia Schutte, Otávio Bueno (Miami), Eduardo Mendieta, Linda Martín Alcoff; deceased (flag) — Jorge J. E. Gracia (d. 13 Jul 2021), Leopoldo Zea (d. 2004), Augusto Salazar Bondy (d. 1974). **Debate:** universalism vs. distinctivism; the authenticity problem (Salazar Bondy: Latin American philosophy as "inauthentic," a product of domination; Zea's rebuttal); whether pre-Columbian thought (*Popol Vuh*; James Maffie on Aztec philosophy) counts as philosophy or "proto-philosophy." **Coverage flag:** MODERATE.

**Indigenous — THINNEST/least institutionalized.** **There is no dedicated SEP survey entry** on Native American/Indigenous philosophy; the standard reference-work survey is the Routledge Encyclopedia entry "Native American philosophy" (Peter M. Whiteley, 1998), whose "animism/shamanism" framing is now dated. **Key anthology:** Anne Waters (ed.), *American Indian Thought* (Blackwell, 2003/2004). **Scholars:** living — Kyle Whyte (Michigan; Indigenous environmental justice), Brian Burkhart (Oklahoma; *Indigenizing Philosophy through the Land*, 2019), Anne Waters, Glen Coulthard, Kim TallBear; deceased (flag) — Vine Deloria Jr. (d. 2005), Viola Cordova (d. 2002). **Debate:** whether oral tradition renders as "philosophy"; Dale Turner's "word warriors." **Coverage flag:** THIN — dispersed across environmental ethics and Native American studies rather than consolidated; Australian Aboriginal and Māori material even sparser (cf. Georgina Stewart, *Māori Philosophy*, Bloomsbury 2020).

**A recurring cross-cutting debate** appears in all three thin traditions and must be surfaced honestly on the platform: the tension between treating collective/oral/traditional worldviews as "philosophy" and demanding individual critical argumentation (ethnophilosophy critique in Africa; oral-tradition debate for Indigenous; proto-philosophy/authenticity debate in Latin America).

---

## Deliverable D — Terminology Equivalence Map

For each term: semantic range · where standard English distorts · translator choices · interface recommendation.

- **akhlāq → "ethics"?** Semantic range: plural of *khulq*, "character traits/disposition," from the root *kh-l-q* ("to create"), semantically tied to *khalq* ("creation") (St Andrews Encyclopaedia of Theology). Miskawayh and Fayḍ al-Kāshānī define *akhlāq* as a settled disposition of the *nafs* producing action "without the need to deliberate." **Distortion:** "ethics" imports the discipline of theorizing about right action; *akhlāq* is closer to "character/virtue" and is action-cultivation. **Interface:** render "ethics (akhlāq — character/disposition)"; do not silently equate.
- **ʿadl → "justice"?** Broadly overlaps but is theologically loaded (a divine attribute; the Muʿtazilī "principle of justice"). **Interface:** gloss as "justice/divine justice (ʿadl)."
- **dharma → "duty"?** Semantic range: from "to hold/maintain"; spans duty, law, order, virtue, cosmic/social order, and (in Buddhism) teaching and phenomenal factors. **Distortion:** "duty" (Kantian) and "law" (Mosaic) both mislead — practitioners object that "law" makes the Buddha "seem like a Moses … handing down a Law." **Interface:** keep *dharma* untranslated with contextual gloss; never single-word it.
- **ren / yi / li → Western moral concepts?** *ren* = benevolence/humaneness/"how two people should treat one another" (Analects' most fundamental, hardest-to-translate term); *yi* = rightness/righteousness/fairness-in-authority; *li* = ritual propriety/rites. **Distortion:** mapping *ren* to "virtue" or *li* to "etiquette" flattens; Routledge REP treats them as basic virtues within *dao*. **Interface:** untranslated + gloss; show the *ren/li/yi* cluster as a unit.
- **ʿaql → "reason"?** Semantic range: intellect/rational faculty of the *nafs*/*qalb*; root means "to bind" (originally tethering a camel); in *fiqh* a source of rulings ("dialectical reasoning"); in falsafa the hierarchy of intellects (al-Fārābī's six senses). **Distortion:** "reason" imports post-Enlightenment autonomous rationality; *ʿaql* is a God-linked faculty guiding to the "straight path." **Interface:** "reason/intellect (ʿaql)."
- **nafs → "soul"/"self"?** Semantic range: self/soul/psyche, but also the lower/appetitive self (*nafs al-ammāra*, the "commanding soul," Q 12:53), the blaming soul, the tranquil soul. **Distortion:** "soul" (Christian, immortal-substance) misses the graded, often-negative appetitive sense. **Interface:** "self/soul (nafs)" with the tripartite gloss.
- **Transliteration/diacritics policy (recommendation):** Store a fully diacriticized canonical form (ḥusn wa qubḥ, ʿaql, dharma) in data; display a **diacritic-light default** for general readers (husn wa qubh, aql) with a user toggle to show full diacritics; always show the source-script original (Arabic, Devanāgarī, Hanzi) on term pages. This satisfies specialists without walling out newcomers.

---

## Deliverable E — Source and Licensing Audit

### E.1 Reference-work licensing (verified against current terms pages)

| Resource | License / rights | May you… | Verdict |
|---|---|---|---|
| **SEP** (plato.stanford.edu) | Copyright Metaphysics Research Lab, Stanford; "All rights reserved." Users get a "royalty-free non-exclusive limited license to read, download, make copies, print, search, or link … crawl each entry for indexing … distribute each entry only as permitted … provided that the purpose of the distribution is non-commercial." | Link, read, index/crawl (within reasonable network limits), quote under fair use. **Not** redistribute entry text; **not** republish wholesale. | **Link and cite; do not ingest entry text into a redistributable corpus.** Fair-use quotation only. |
| **IEP** (iep.utm.edu) | "All articles are copyrighted by The IEP and the authors … not open source or in the public domain." Authors retain copyright; "IEP articles cannot be posted elsewhere on the internet where there is public access." IEP "does not accept articles composed in whole or in part by A.I." | Link and quote under fair use. | **Link and cite; do not ingest/redistribute.** |
| **PhilPapers API** (philpapers.org) | Public JSON API + OAI-PMH; "Usage of the PhilPapers API is subject to terms and conditions which **severely restrict the redistribution of PhilPapers' data**." Registration not required but requested. Public API access "remains free." | Query for discovery/metadata; contact them for redistribution exceptions. | **Use for discovery/bibliography/IDs; do not redistribute their data.** Contact PhilPapers first. |
| **Wikidata** | **CC0** (public domain) for structured data in main/Property/Lexeme/EntitySchema namespaces. | Reuse, redistribute, mine freely; no attribution legally required. | **Primary identifier + light-data backbone. Safe to ingest.** |
| **Wikipedia** | Article text **CC BY-SA 4.0** (edits since June 2023; older edits BY-SA 3.0), per the Wikimedia Terms of Use revision. | Reuse/redistribute **with attribution and share-alike**. | Usable with attribution; SA is "viral." Prefer as a pointer, not a text source, to avoid share-alike contaminating your editorial content. |

### E.2 Primary-text corpora (machine-readable, licensing, numbering)

| Corpus | Coverage | License | Canonical numbering | Build verdict |
|---|---|---|---|---|
| **Perseus / Scaife** | Greek & Latin | Public-domain source texts released **CC BY-NC-SA 3.0 US**; TEI-XML | **Stephanus** (Plato), **Bekker** (Aristotle), **Diels–Kranz** (Presocratics) built in | **Tier-1 ingest** for Greek/Roman; NC clause limits commercial reuse |
| **GRETIL** | Sanskrit (Hindu/Buddhist/Jain) | Mixed/permissive academic use `[uncertain]` on uniform license | Text-internal (śloka/sūtra) | **Tier-2**; per-text license check |
| **Chinese Text Project (ctext.org)** | Pre-Qin/Han classics | Open-access; API `[uncertain]` on precise reuse license | Chapter/passage | **Tier-2 ingest** |
| **al-Maktaba al-Shāmila (Shamela)** | Arabic Islamic texts | Developers state books are "free and … encourage others to distribute them," with a caveat against distributing content "deviant to the Sunni doctrine" — **not a standard open license**; sectarian selection bias | Pagination follows the print edition | **Use OpenITI, not raw Shamela** — OpenITI is CC BY-NC-SA 4.0 and Shamela is "the largest source of texts in the OpenITI corpus: about 45% of the texts in the corpus come from Shamela" (Peter Verkinderen, AKU-ISMC) |
| **Qurʾān / ḥadīth** | — | Text public domain; translations vary | **Sūra:āya** (Qurʾān); collection+number (ḥadīth) | **Tier-1** for referencing |
| **Gutenberg / Wikisource / Internet Archive** | Public-domain older translations | Public domain / CC as marked | Varies | **Tier-2**; flag datedness |

### E.3 What copyright forecloses
For many key texts **the only good modern translation is proprietary** — current scholarly translations of Ibn Sīnā, Mullā Ṣadrā, ʿAbd al-Jabbār, and much post-classical material are under academic-press copyright (Oxford, Cambridge, Brill). Perseus/Gutenberg give you *public-domain older* translations of the Greek canon but not the best contemporary ones. **Consequence:** ground retrieval on public-domain/CC primary texts and *own-authored* summaries; quote proprietary translations only under fair use and cite them; never ingest them wholesale.

### E.4 Corpus assembly plan (priority order)
1. **Wikidata** dump (CC0) → identifier/entity backbone.
2. **Perseus TEI-XML** (Greek/Roman, with Stephanus/Bekker/DK) → Tier-1 grounding.
3. **Qurʾān + canonical ḥadīth** with sūra:āya referencing.
4. **OpenITI** (Arabic Islamic, CC BY-NC-SA) for kalām/falsafa grounding.
5. **Chinese Text Project** + **GRETIL** (per-text license checks) for Chinese/Indian.
6. SEP/IEP/PhilPapers as a **link-and-cite discovery layer only** (no ingest).
7. Own-authored, expert-reviewed summaries as the primary generated content, each anchored to the above.

---

## Deliverable F — Data Model and Ontology

### F.1 Entity types and relations
Entities: `Question`, `Position`, `Thinker`, `School`, `Tradition`, `Argument`, `Objection`, `Text`, `Passage`, `Era`, `Concept`, `RealWorldCase`. Core relations: `Position —answers→ Question`; `Thinker —holds→ Position` (qualified); `Thinker —member_of→ School`; `School —within→ Tradition`; `Argument —supports→ Position`; `Objection —targets→ Position/Argument`; `Passage —part_of→ Text`; `Passage —evidences→ (Thinker holds Position)`; `Position —equivalent_to→ Position` (cross-tradition, with `convergence_type`); `Concept —translated_as→ Concept/term`; `Thinker —influenced→ Thinker` (with `disputed` flag).

### F.2 Representing hard cases (the qualification layer)
Model `holds` as a **reified relation object** (its own node/edge-with-properties), not a bare edge, carrying: `qualification` (e.g., "on the standard reading"), `epistemic_status` (settled/contested/uncertain), `career_phase` (e.g., "post-conversion al-Ashʿarī"), `scholarly_dispute` (free text + citations for the sides), and `source_passages[]`. This lets you represent: **qualified attribution** (al-Ghazālī holds DCT "on the standard reading"); **contested attribution** (Ockham as divine-command theorist, "denied by much recent scholarship"); **career shift** (al-Ashʿarī's Muʿtazilī→Ashʿarī turn as two `holds` objects); **disputed influence** (`influenced` edge with `disputed: true` + citation); and **same position, different names** (one `Position` node linked to multiple `Concept`/label nodes per tradition; cross-tradition sameness via `equivalent_to` with `convergence_type ∈ {genuine, superficial, translation_artifact}` and an `evidence` field — this directly powers the intersection view).

### F.3 Reuse existing identifiers/vocabularies (with justification)
- **Wikidata Q-IDs** — canonical entity anchor; CC0, ubiquitous, links out to everything. *Reuse as primary key.*
- **VIAF** — authority control for persons (disambiguates "al-Ghazālī"); library-grade. *Reuse for `Thinker`.*
- **PhilPapers IDs** — discovery/bibliography for secondary literature. *Reference, don't redistribute (per E).*
- **CIDOC-CRM** — ISO-standard event-centric cultural-heritage ontology; de-facto DH standard; models `Thinker`/`Text`/`Era` as actors/objects/time-spans. *Adopt as the upper ontology for historical entities.*
- **SKOS** — for the `Concept` thesaurus and question taxonomy (broader/narrower/related) and cross-language term mapping (`skos:closeMatch` vs `skos:exactMatch` maps onto genuine-vs-artifact convergence). *Adopt for concepts/taxonomy.*
- **schema.org** — `CreativeWork`/`Person` for SEO/structured data. *Adopt for public-facing markup only.*
- Justification: CIDOC-CRM + SKOS is documented DH best practice (multiple cultural-heritage KGs pair them, often materialized in Neo4j or an RDF store); Wikidata + VIAF give free, maintained identifiers so you never mint your own person IDs.

### F.4 One graph, many views
Each view is a **query/projection**, not a copy: *Question map* = traverse `Question —answered_by→ Position`; *Cross-tradition intersection clusters* = filter `Position —equivalent_to→ Position` by `convergence_type`, cluster by shared `Question`; *Tradition view* = filter by `Tradition`; *Influence graph* = `Thinker —influenced→ Thinker` subgraph (toggle `disputed`); *Personal position map* = a per-user overlay of `User —commits_to→ Position` edges over the same nodes.

### F.5 JSON Schema + worked seed instance (abbreviated; full versions in Appendix)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PhilosophyPlatformGraph",
  "type": "object",
  "$defs": {
    "Question": {"type":"object","required":["id","canonical","plain","domain"],
      "properties":{"id":{"type":"string"},"canonical":{"type":"string"},
      "plain":{"type":"string"},"technicalName":{"type":"string"},
      "whyItMatters":{"type":"string"},"domain":{"type":"string"},
      "wikidata":{"type":"string"},"westernFramedMismatch":{"type":"boolean"},
      "provenance":{"type":"array","items":{"type":"string"}}}},
    "Position": {"type":"object","required":["id","label","definition"],
      "properties":{"id":{"type":"string"},"label":{"type":"string"},
      "definition":{"type":"string"},"answersQuestion":{"type":"string"}}},
    "HoldsRelation":{"type":"object","required":["thinker","position","epistemicStatus"],
      "properties":{"thinker":{"type":"string"},"position":{"type":"string"},
      "qualification":{"type":"string"},
      "epistemicStatus":{"enum":["settled","contested","uncertain"]},
      "careerPhase":{"type":"string"},"scholarlyDispute":{"type":"string"},
      "sourcePassages":{"type":"array","items":{"type":"string"}}}},
    "Equivalence":{"type":"object","required":["positionA","positionB","convergenceType","evidence"],
      "properties":{"positionA":{"type":"string"},"positionB":{"type":"string"},
      "convergenceType":{"enum":["genuine","superficial","translation_artifact"]},
      "evidence":{"type":"string"}}},
    "Passage":{"type":"object","required":["id","text","citation"],
      "properties":{"id":{"type":"string"},"text":{"type":"string"},
      "citation":{"type":"string"},"locator":{"type":"string"},
      "license":{"type":"string"}}}
  }
}
```

```json
{
  "questions":[{"id":"Q_husn_qubh","canonical":"Is the moral status of an act grounded in revelation or in reason?",
   "plain":"Do things become right because God says so, or can we work out right and wrong ourselves?",
   "technicalName":"husn wa qubh / divine command vs. moral rationalism",
   "whyItMatters":"Decides whether ethics needs religion.","domain":"Ethics & moral epistemology",
   "westernFramedMismatch":true,
   "provenance":["Islamic kalam curriculum","PhilPapers: Meta-Ethics","SEP/IEP: Divine Command Theory"]}],
  "positions":[
   {"id":"P_DCT","label":"Divine Command Theory (revelation-grounded)","answersQuestion":"Q_husn_qubh",
    "definition":"An act's moral status is constituted by God's command; acts have no intrinsic value prior to the decree."},
   {"id":"P_rationalism","label":"Moral rationalism / ethical objectivism (reason-grounded)","answersQuestion":"Q_husn_qubh",
    "definition":"Acts have intrinsic husn/qubh knowable by reason (aql) independently of revelation."}],
  "holds":[
   {"thinker":"al_Ashari","position":"P_DCT","epistemicStatus":"settled","sourcePassages":["PSG_ashari_arad"]},
   {"thinker":"Ockham","position":"P_DCT","epistemicStatus":"contested",
    "qualification":"denied by much recent scholarship",
    "scholarlyDispute":"Osborne (Religious Studies 41:1, 2005, DOI 10.1017/S0034412504007218) reads Ockham as divine-command theorist; others deny.",
    "sourcePassages":["PSG_ockham_sent"]},
   {"thinker":"Abd_al_Jabbar","position":"P_rationalism","epistemicStatus":"settled","sourcePassages":["PSG_mutazila_intrinsic"]},
   {"thinker":"Kant","position":"P_rationalism","epistemicStatus":"contested",
    "qualification":"rationalism via autonomy of practical reason, not value-realism"}],
  "equivalences":[
   {"positionA":"P_DCT@al_Ashari","positionB":"P_DCT@Ockham","convergenceType":"genuine",
    "evidence":"Both ground value in divine will (al-Islam.org on Ashari 'a'rad'; Osborne on Ockham 'God could assign a different moral value'); but Ashari occasionalism/kasb has no Ockhamist parallel."},
   {"positionA":"P_rationalism@Abd_al_Jabbar","positionB":"P_rationalism@Kant","convergenceType":"translation_artifact",
    "evidence":"Both hold reason knows objective value, but Abd al-Jabbar is a value-realist (Hourani 1971) while Kant is a constructivist."}],
  "passages":[
   {"id":"PSG_ashari_arad","text":"Goodness and badness of actions (husn wa qubh) are not qualities inhering in them; these are mere accidents (a'rad).",
    "citation":"M. Abdul Hye, 'Ash'arism', A History of Muslim Philosophy vol.1, via al-islam.org","locator":"ch.11","license":"quote-fair-use"},
   {"id":"PSG_mutazila_intrinsic","text":"human reason can independently judge the good or evil in things ... independently of the commands of the Shari'ah.",
    "citation":"Mutahhari, An Introduction to Ilm al-Kalam, via al-islam.org","locator":"Mu'tazilah ch.","license":"quote-fair-use"}]
}
```

This seed doubles as the build agent's acceptance test: a correct implementation ingests it, renders the ḥusn wa qubḥ question page, produces the al-Ashʿarī↔Ockham (genuine) and Muʿtazila↔Kant (translation-artifact) intersection cards, and surfaces the `contested` badge on Ockham.

---

## Deliverable G — Editorial Integrity and AI Generation Policy

### G.1 Documented LLM failure modes on philosophical content
- **Hallucinated/fabricated citations.** In a cross-disciplinary study (Mugaanyi et al., *J Med Internet Res* 2024;26:e52935, DOI 10.2196/52935), GPT-3.5 showed "significant disparities … in DOI presence in the natural sciences (39/55, 70.9%) and the humanities (18/47, 38.3%)," with DOI accuracy of only 32.7% (18/55) in sciences versus 8.5% (4/47) in humanities, and "DOI hallucination was more prevalent in the humanities (42/55, 89.4%)." In short: for humanities citations, ~9 in 10 DOIs generated were fabricated.
- **Confident false attribution** — assigning a position to the wrong thinker (e.g., collapsing Māturīdī into Muʿtazila; presenting Ockham's contested DCT as settled).
- **Collapsing distinct positions** — flattening moral rationalism (realist ʿAbd al-Jabbār) and moral rationalism (constructivist Kant) into "the same view" — exactly the translation-artifact error.
- **Anachronism** — importing "reason vs. faith" Enlightenment framing onto kalām.
- **Systematically weaker performance on non-Western and pre-modern material** — thinner training data → more confident error precisely where the platform is most distinctive `[contested]` on magnitude but `[settled]` in direction.

### G.2 Recommended pipeline
1. **Retrieval requirement:** every generated claim must be grounded in a retrieved `Passage` from the licensed corpus (E). No passage → no claim.
2. **Mandatory passage-level citation** surfaced in-line, with locator (Bekker/Stephanus/sūra:āya).
3. **Adversarial critique pass:** a second model instance red-teams each page against a checklist (attribution correct? position collapsed? anachronism? citation resolvable?).
4. **Confidence tiering surfaced in the UI:** map generation confidence + retrieval strength onto the settled/contested/uncertain badge the user sees.
5. **Human review queue, scoped for one person:** gate only (a) new question pages, (b) any `contested`/`uncertain` claim, and (c) cross-tradition `equivalence` edges (the highest-error, highest-value surface). Routine `settled` regenerations auto-publish with spot-audit.

### G.3 Quality gates (how to detect a wrong page)
- **Gold-standard set:** ~50 questions with expert-written known-correct position maps (start with the ḥusn wa qubḥ seed); regression-test every model/prompt change against it.
- **Citation resolver:** every citation must dereference to a real passage in the corpus; unresolvable → block. (Directly targets the 89% humanities-DOI-hallucination finding.)
- **Contradiction detection across pages:** if the al-Ashʿarī node asserts P1 on the DCT page but P2 on the ethics page, flag.
- **Expert spot-review protocol:** rotating domain experts sample N pages/month per tradition, scoring attribution, balance, and citation accuracy.
- **Public error-reporting path:** per-claim "report an error" affordance feeding the review queue; log and publish correction history.

### G.4 Stance: the decision and its consequences (we do not decide for you)
- **Option A — Neutral comparative tool.** Maps positions without endorsing. *Pros:* maximal trust across communities; lowest offense risk; fits the "help users find their own view" mission. *Cons:* can feel relativistic; "neutrality" is itself a stance (the taxonomy choice already smuggles in bias, per A.2).
- **Option B — Argues toward conclusions.** *Pros:* more engaging; models good philosophical judgment. *Cons:* forfeits the trust of communities whose view you argue against; high error-amplification risk given G.1.
- **The credibility cost of blending them implicitly** is the worst outcome: users who detect an undisclosed editorial lean discount everything, including the neutral parts. **Recommendation on the meta-level (not the object-level):** pick explicitly and disclose. An explicit disclosed stance requires a published editorial charter, named editorial board, per-page "where we take a view" labels, and a right-of-reply mechanism. Absent that infrastructure, default to disclosed neutrality with clearly-marked "editors' assessment" boxes where you do take a view (e.g., "naïve DCT is widely regarded as refuted").

### G.5 Traditions' internal sensitivities
- Living communities will read their own tradition's page. Distinguish **theological claims** ("God commanded X") from **scholarly descriptions** ("the Ashʿarī school held…") typographically and grammatically.
- Represent **sectarian disputes** as first-class contested nodes with named sides, not as a resolved "the Islamic view." Flag source perspective (e.g., al-Islam.org is Shīʿī-inflected; Shamela excludes non-Sunni material by design).
- Offer communities a **structured right-of-reply**, not edit access, preserving editorial independence while surfacing objection.

---

## Deliverable H — Prior Art and Gap Analysis

| Project | Audience | Model | Does well | Fails a curious non-specialist by… |
|---|---|---|---|---|
| **SEP** | Academics/advanced students | Peer-reviewed encyclopedia | Authoritative, comprehensive, cited | Too long/technical; chronology-and-topic organized, not question-first; no interactivity; Western-heavy |
| **IEP** | Undergrads/general | Peer-reviewed, "expert but not for experts" | More accessible than SEP | Static articles; no cross-tradition mapping; no personalization |
| **PhilPapers** | Researchers | Bibliography/index (3M+ entries) | Best discovery/taxonomy | Not for reading philosophy; bibliographic, not explanatory |
| **Wikipedia** | Everyone | Crowd encyclopedia | Broad, free, linked | Uneven; not question-organized; no guided reasoning |
| **Wireless Philosophy (Wi-Phi)/Khan Academy** | Beginners | Free short animated videos (launched 2013); "learn how to *do* philosophy" | Excellent critical-thinking pedagogy; expert presenters | Video-linear, not explorable; thin non-Western coverage; no personal-position mapping |
| **Philosophy Bites** | General/commuters | Interview podcast | Engaging expert interviews | Audio-linear; no structure/mapping |
| **Crash Course Philosophy** | Teens/beginners | Fast video series | Energetic intro | Shallow; Western; no interactivity |
| **Daily Nous** | Professional philosophers | News blog | Field news, survey coverage | Not a learning tool |
| **Battleground God / Morality Play (philosophyexperiments.com)** | Curious public | Interactive consistency quizzes; the site presents 10 interactive experiments and 50 insight cards, and reports population averages to each player (e.g. "average player … takes 1.39 hits and bites 1.10 bullets") | Confronts users with their own inconsistencies — the closest prior art to your dilemma interaction | Narrow (mostly philosophy of religion/ethics consistency); dated UX; no tradition mapping, no citations, no non-Western content |
| **MIT Moral Machine** | Public/researchers | Crowd-sourced trolley-style AV dilemmas | Massive scale — "gathered 40 million decisions in ten languages from millions of people in 233 countries and territories" (Awad et al., *Nature* 563, 59–64, 2018) | Single narrow domain (autonomous-vehicle sacrifice); measures *opinions*, not reasoning quality; not pedagogical |
| **Islamic-philosophy portals (al-Islam.org etc.)** | Muslim readers/students | Text libraries | Deep primary/secondary Islamic texts | Tradition-siloed; often confessional; not comparative; no interaction layer |

### H.1 Evidenced gap statement
No existing resource combines **(1) question-first organization** (vs. SEP/IEP's thinker/topic and chronology), **(2) position-as-primary-unit independent of tradition with explicit cross-tradition intersection mapping** (no prior art does this at all — it is the platform's genuinely novel contribution), **(3) citation-grounded RAG content**, and **(4) an interaction that moves a user from locating their own position to confronting its strongest objection to seeing the tradition they've joined.** *Battleground God* (a consistency quiz reaching hundreds of thousands of players) and Moral Machine (40 million decisions) each do a slice of (4) in one narrow domain, without citations or tradition mapping. **The cross-tradition intersection view (B.2) is the defensible moat.**

### H.2 What NOT to build (already exists and is better)
- **Do not build another encyclopedia** — SEP/IEP are better; link and cite.
- **Do not build a bibliography** — PhilPapers owns this; use its IDs.
- **Do not build intro video courses** — Wi-Phi/Khan/Crash Course own this; embed/link.
- **Do not build a philosophy news feed** — Daily Nous exists.
- **Do not rebuild a standalone consistency quiz** — adapt *Battleground God*'s proven mechanic into your position-mapping layer instead of reinventing it.

---

## Deliverable I — Pedagogy and Interaction Design

### I.1 Evidence-based conceptual-learning findings (with research)
- **Retrieval practice** (actively recalling, not re-reading) produces stronger long-term retention than restudy (Karpicke & Roediger 2007; Roediger & Butler 2011); it is a "desirable difficulty."
- **Spacing & interleaving** improve durable, transferable learning. A meta-analysis found "a strong benefit of spaced retrieval practice in comparison with massed retrieval practice (g = 0.74)" (Latimier, Peyre & Ramus, *Educational Psychology Review*, 2021, DOI 10.1007/s10648-020-09572-8). Interleaving works via *discrimination* between related concepts (Rohrer & Taylor 2007; Kornell & Bjork 2008).
- **Desirable difficulties** (Bjork & Bjork 2011): effortful conditions feel harder and are under-valued by learners ("misinterpreted-effort hypothesis," Kirk-Johnson, Galla & Fraundorf 2019) but yield better retention.
- **Self-explanation** and **contrasting cases** deepen conceptual understanding — directly relevant: presenting al-Ashʿarī *contrasted with* ʿAbd al-Jabbār (a contrasting case) plus prompting the user to explain the difference exploits both mechanisms.
- **Worked examples** scaffold novices before problem-solving.
- **Design consequence:** the platform should *quiz users' recall of a position before revealing the objection*, *interleave traditions* rather than teaching them in blocks, and *use the contrast between converging/diverging positions* as the core learning event.

### I.2 Moral-reasoning research and the opinion-vs-reasoning distinction
The critical caveat: tools like Moral Machine and *Battleground God* measure/shift **stated opinions and expose inconsistencies** but there is little accessible evidence they improve **reasoning quality** (the ability to give and weigh reasons) `[uncertain]` — the literature I could reach does not settle whether interactive dilemma tools change reasoning quality as distinct from stated views. **This is an open research question (see register)** and should shape success metrics: measure reasoning-quality change (can the user articulate the strongest objection to their own view?), not opinion change.

### I.3 Concrete interaction mechanics
- **(a) Locate your position:** a *Battleground God*-style consistency instrument that maps the user's answers onto `Position` nodes (a commitment tracer, not a personality quiz), showing which positions their answers entail.
- **(b) Confront the strongest objection:** after the user commits, surface the single best-attributed `Objection` to their position (from the graph) and ask them to respond or revise — the "what it costs you" moment. Use retrieval-practice framing (recall the position first).
- **(c) Show the tradition you've joined:** render the cross-tradition cluster — "your view aligns with al-Ashʿarī and Ockham; here's where they'd part ways with you." This is the intersection view (F.4) as payoff.
- **(d) Translate into a daily-life decision:** link the `Position` to a `RealWorldCase` node ("if you hold DCT, here's how that bears on whether an act is wrong only because forbidden").

### I.4 Reading level, disclosure, accessibility
- **Reading-level targets:** default plain-language layer at ≈grade 8 (per A.3 phrasings); progressive disclosure to a scholarly layer with full apparatus and diacritics.
- **Progressive disclosure:** three tiers — (1) plain question + your-position interaction; (2) position definitions + best argument/objection; (3) full citations, passages, scholarly disputes.
- **Accessibility:** target **WCAG 2.2 AA**. Graph visualizations must have a **non-visual equivalent** (screen-reader-navigable list/table of nodes and edges; keyboard traversal; text alternative describing clusters) — never a canvas-only graph. **RTL support** for Arabic-script content (proper bidi, mirrored layout). **Multilingual architecture with Turkish and English as first-class** (i18n from day one, not retrofitted; store source-script + transliteration + translation per term, per D).

---

## Deliverable J — Build Plan

### J.1 Phased plan (MVP = one question, end-to-end)
- **Phase 0 — Decisions (see J.3) and editorial charter.** Before code.
- **Phase 1 — MVP: the ḥusn wa qubḥ question, fully instantiated.** All content of B, the cross-tradition intersection view (al-Ashʿarī↔Ockham; Muʿtazila↔Kant), the position-locating + objection-confrontation dilemma interaction, passage-level citations from the licensed corpus, WCAG-AA, EN+TR, the seed JSON (F.5) as the acceptance test. **Depth over breadth** — this proves the distinctive value (the intersection view) end-to-end.
- **Phase 2 — Domain expansion:** add ~10 ethics/metaethics questions reusing the schema; validate the review queue can sustain them with one human editor.
- **Phase 3 — Tradition depth:** systematically add Islamic, Greek, Indian, Chinese coverage per C; add the "Western-framed mismatch" interface (A.4).
- **Phase 4 — Personalization + community right-of-reply.**

### J.2 Technology direction (with reasoning)
- **Graph store:** a property graph (**Neo4j**) or an RDF triple store (e.g., GraphDB). Property graphs are simpler for the reified `holds`/`equivalence` relations and for developer velocity; RDF wins if you prioritize CIDOC-CRM/SKOS interoperability and linked-open-data publishing. **Recommendation:** start property-graph for MVP speed, but keep the CIDOC-CRM/SKOS mapping (F.3) so you can export RDF later — this is reversible.
- **Retrieval layer:** **GraphRAG-style** hybrid — vector search over `Passage` embeddings *plus* graph traversal for structured context (positions/objections/equivalences), so generation is grounded in both the right text and the right structural neighborhood. This directly mitigates the G.1 failure modes.
- **Front-end:** component framework (React/Svelte) with an accessible graph-viz library that supports keyboard/screen-reader traversal and a non-visual fallback (I.4); i18n/bidi from the start.

### J.3 Decision sequence: reversible vs. not
- **Hard to reverse (decide first):** (1) editorial stance & charter (G.4); (2) the data model / reified-relation design (F.2) — schema migrations are costly once populated; (3) identifier strategy (Wikidata-Q-ID-as-primary-key) (F.3); (4) licensing posture (link-vs-ingest per source) (E) — ingesting wrong-licensed corpus creates legal/rework debt; (5) multilingual/RTL architecture (retrofitting i18n is expensive).
- **Reversible (decide later/cheaply):** graph-DB vendor (if you keep the CIDOC/SKOS mapping), front-end framework, embedding model, exact UI of the dilemma interaction, visual design.

### J.4 Effort estimates by workstream (order-of-magnitude, one small team) `[uncertain]` — planning estimates, not measured
- Corpus assembly + licensing (E): high upfront, moderate ongoing.
- Data model + graph infra (F): moderate upfront, low ongoing.
- RAG + integrity pipeline (G): high and continuous (the hardest, riskiest workstream).
- Content authoring + expert review (B/C): the dominant ongoing cost; scales with questions × traditions.
- Front-end + accessibility + i18n (I): moderate upfront, moderate ongoing.

### J.5 Where this kind of project usually fails
1. **Breadth-first shallowness** — a thin skeleton over all of philosophy that impresses no one and is wrong everywhere; the brief's MVP-as-one-question rule is the correct antidote.
2. **Unsustainable review load** — generating faster than experts can check, so errors (G.1) accumulate and destroy trust; scope the human queue to what one person can hold.
3. **Editorial-stance drift** — implicit lean discovered by communities, collapsing credibility (G.4).
4. **Non-Western tokenism** — confident thin summaries where sourcing is weakest (C.7), the exact failure the brief forbids.
5. **Licensing debt** — ingesting SEP/IEP/proprietary translations and having to rip it out.

---

## Open Questions Register

| # | Unresolved item | Why unresolved | What it would take |
|---|---|---|---|
| 1 | Full 50–100 question corpus (A) | Prioritized seed question + methodology per brief; budget spent on E/F/G/H/J | Systematic pass over PhilPapers full tree + SEP TOC + one Islamic-world syllabus |
| 2 | An actual al-Azhar / İlahiyat / Qom syllabus (A) | Could not retrieve a primary syllabus document within budget | Direct retrieval of a named faculty's published curriculum |
| 3 | Position space for all questions (B) | Fully worked only for the seed per instructions | Repeat the B.1–B.3 method per question |
| 4 | Verified primary-text loci (Euthyphro 10a; Ockham *Sent.* II q.19; ʿAbd al-Jabbār *al-Mughnī*) | Cited secondhand via reference works; not verified against a named edition/translation line | Consult named critical editions; each currently marked "locus unverified" |
| 5 | Whether interactive dilemma tools improve *reasoning quality* vs. opinion (I.2) | Literature accessed did not settle it | Targeted search of moral-education/experimental-philosophy journals |
| 6 | Exact GRETIL / Chinese Text Project reuse licenses (E) | Pages confirm openness/API but not a single uniform license | Read each project's per-text license/terms page |
| 7 | PhilPapers redistribution exceptions (E) | Terms "severely restrict" but allow contacting them | Direct correspondence with PhilPapers |
| 8 | Effort/cost figures (J.4) | Given as order-of-magnitude planning estimates only | Bottom-up estimation once team size/rates fixed |
| 9 | Magnitude of LLM non-Western underperformance (G.1) | Direction settled, magnitude not | A philosophy-specific eval built on the gold-standard set (G.3) |

---

## Source Bibliography (selected; access date 2026-08-10)
- SEP Editorial Information / Terms of Use — plato.stanford.edu/info.html
- IEP Copyright & Author Guidelines — iep.utm.edu/home/copyright/, iep.utm.edu/submissions-author/
- PhilPapers API docs, Terms, Subscriptions, Categorization — philpapers.org/help/api, /help/terms.html, /help/categorization.html
- Wikidata Licensing/Copyright — wikidata.org/wiki/Wikidata:Licensing; Creative Commons "Wikipedia Moves to CC 4.0" (2023)
- Perseus Digital Library licensing & Scaife — perseus.tufts.edu; Bekker/Stephanus numbering — en.wikipedia.org/wiki/Bekker_numbering
- al-Maktaba al-Shāmila / OpenITI — kitab-project.org (Peter Verkinderen, "Al-Maktaba al-Shāmila: A Short History"); en.wikipedia.org/wiki/Al-Maktaba_al-Shamela
- Chinese Text Project — ctext.org; GRETIL (Göttingen)
- ḥusn wa qubḥ: al-islam.org (Muṭahharī, *An Introduction to Ilm al-Kalam*; M. Abdul Hye, "Ashʿarism"); *Islam and Civilisational Renewal* (Ashʿarī reason study)
- Divine Command Theory: IEP; SEP; T. Osborne, "Ockham as a Divine-Command Theorist," *Religious Studies* 41:1 (2005), DOI 10.1017/S0034412504007218; 1000-Word Philosophy
- Hourani, *Islamic Rationalism: The Ethics of ʿAbd al-Jabbâr* (Oxford: Clarendon, 1971); *Reason and Tradition in Islamic Ethics* (Cambridge, 1985)
- 2020 PhilPapers Survey — Bourget & Chalmers, "Philosophers on Philosophy" (PhilArchive); Daily Nous summary (2021)
- LLM citation hallucination — Mugaanyi et al., *J Med Internet Res* 2024;26:e52935, DOI 10.2196/52935
- Pedagogy — Bjork & Bjork (2011); Karpicke & Roediger (2007); Rohrer & Taylor (2007); Kirk-Johnson, Galla & Fraundorf (2019); Latimier, Peyre & Ramus, *Educational Psychology Review* (2021), DOI 10.1007/s10648-020-09572-8
- Terminology — St Andrews Encyclopaedia of Theology "Ethics in Islam"; Routledge REP "Confucian philosophy"; Encyclopedia.com "Ren and Yi"; Wikipedia "'Aql"
- Non-Western fields — SEP "Contemporary Africana Philosophy" (Taylor 2021), "African Ethics" (Gyekye), "Latin American Philosophy: Metaphilosophical Foundations" (Nuccetelli); Routledge REP "Native American philosophy" (Whiteley 1998); Wiredu (ed.) *Companion to African Philosophy* (2004); Nuccetelli/Schutte/Bueno (eds.) *Companion to Latin American Philosophy* (2010); Waters (ed.) *American Indian Thought* (2003)
- Prior art — philosophyexperiments.com (*Battleground God*); Awad et al., "The Moral Machine experiment," *Nature* 563 (2018), 59–64; Wi-Phi/Khan Academy
- Data modeling — CIDOC-CRM (cidoc-crm.org); SKOS; "From Wikidata to CIDOC CRM" (*Journal of Open Humanities Data*)

---

## Machine-Readable Appendix Note
The JSON Schema and the fully worked, cited seed instance for "Is the moral status of an act grounded in revelation or in reason?" are provided inline in **F.5** and are intended to be lifted verbatim into repository files (`schema.json`, `seed_husn_qubh.json`). The question corpus (A.3) is structured as a repeatable record template — `{id, canonical, plain, technicalName, whyItMatters, domain, westernFramedMismatch, provenance[]}` — which the build agent can serialize to `questions.json` and extend via the A.1 derivation methodology to reach the 50–100 target.