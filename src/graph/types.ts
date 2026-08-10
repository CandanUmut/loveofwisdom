/**
 * TypeScript mirror of schema.json. The JSON Schema is the contract; this file
 * is the compile-time view of it. Keep them in step — `npm run validate` checks
 * every content fragment against schema.json, so drift shows up there.
 */

export type Locale = 'en' | 'tr';
export type LocalizedString = string | Partial<Record<Locale, string>>;
export type EpistemicStatus = 'settled' | 'contested' | 'uncertain';
export type ConvergenceType = 'genuine' | 'superficial' | 'translation_artifact';
export type ScriptCode = 'Arab' | 'Deva' | 'Hani' | 'Grek' | 'Latn' | 'Hebr';

export interface ScriptTerm {
  sourceScript?: string;
  script?: ScriptCode;
  lang?: string;
  /** Fully diacriticized canonical form. The diacritic-light form is derived, never stored. */
  translit: string;
  standardRendering?: string;
}

export interface SourceRef {
  citation: string;
  kind?: 'reference-work' | 'journal-article' | 'monograph' | 'primary-text' | 'web' | 'survey';
  doi?: string;
  url?: string;
  urlVerified?: boolean;
  perspectiveFlag?: string;
}

export interface Side {
  who?: string;
  reading: LocalizedString;
  citation?: string;
}

export interface Question {
  id: string;
  slug?: string;
  canonical: LocalizedString;
  plain: LocalizedString;
  technicalName?: LocalizedString;
  whyItMatters?: LocalizedString;
  domain: LocalizedString;
  wikidata?: string | null;
  westernFramedMismatch?: boolean;
  provenance?: string[];
  completeness?: 'worked' | 'stub';
  sources?: SourceRef[];
}

export interface Position {
  id: string;
  slug?: string;
  label: LocalizedString;
  definition: LocalizedString;
  answersQuestion?: string;
  shortLabel?: LocalizedString;
  sourceTerm?: ScriptTerm;
  refusesQuestion?: boolean;
  epistemicStatus?: EpistemicStatus;
  notYetWritten?: string[];
  sources?: SourceRef[];
}

export interface Thinker {
  id: string;
  name: string;
  nameSourceScript?: string;
  searchAliases?: string[];
  script?: ScriptCode;
  died?: string;
  born?: string;
  tradition?: string;
  school?: string;
  wikidata?: string | null;
  viaf?: string | null;
  summary?: LocalizedString;
  sources?: SourceRef[];
  /** Set by the loader when a fragment referenced this thinker but never described one. */
  placeholder?: boolean;
}

export interface School {
  id: string;
  label: LocalizedString;
  sourceTerm?: ScriptTerm;
  within?: string;
  summary?: LocalizedString;
}

export interface Tradition {
  id: string;
  label: LocalizedString;
  coverageFlag?: 'excellent' | 'good' | 'moderate' | 'moderate-to-good' | 'thin';
  coverageNote?: LocalizedString;
  dir?: 'ltr' | 'rtl';
}

/** Research F.2: reified, never a bare edge. */
export interface HoldsRelation {
  id?: string;
  thinker: string;
  position: string;
  qualification?: LocalizedString;
  epistemicStatus: EpistemicStatus;
  careerPhase?: LocalizedString;
  scholarlyDispute?: LocalizedString;
  sides?: Side[];
  sourcePassages?: string[];
  sources?: SourceRef[];
}

export interface Argument {
  id: string;
  supports: string;
  label?: LocalizedString;
  statement: LocalizedString;
  attributedTo?: string[];
  epistemicStatus?: EpistemicStatus;
  sourcePassages?: string[];
  sources?: SourceRef[];
}

export interface Objection {
  id: string;
  targets: string;
  label?: LocalizedString;
  statement: LocalizedString;
  strongest?: boolean;
  attributedTo?: string[];
  epistemicStatus?: EpistemicStatus;
  standardReplies?: LocalizedString[];
  sourcePassages?: string[];
  sources?: SourceRef[];
}

export interface Equivalence {
  id?: string;
  positionA: string;
  positionB: string;
  convergenceType: ConvergenceType;
  evidence: LocalizedString;
  question?: string;
  title?: LocalizedString;
  convergesOn?: LocalizedString;
  partsWaysOn?: LocalizedString;
  verdict?: LocalizedString;
  traditions?: [string, string];
  transmissionLink?: EpistemicStatus;
  epistemicStatus?: EpistemicStatus;
  sources?: SourceRef[];
}

export interface Influence {
  from: string;
  to: string;
  disputed?: boolean;
  note?: LocalizedString;
  sources?: SourceRef[];
}

export interface Text {
  id: string;
  title: string;
  titleSourceScript?: string;
  author?: string;
  numbering?: string;
  license?: string;
}

export interface Passage {
  id: string;
  text?: string;
  textSourceScript?: string;
  citation: string;
  locator?: string;
  license?: string;
  attested?: boolean;
  locusUnverified?: boolean;
  url?: string;
  urlVerified?: boolean;
  /** Cited and linked, text deliberately not reproduced (SEP/IEP licensing). */
  linkOnly?: boolean;
  tier?: 'primary' | 'secondary' | 'reference-work';
  perspectiveFlag?: string;
  partOf?: string;
  /** Set by the loader when a fragment referenced this passage id but never defined it. */
  placeholder?: boolean;
}

export interface Concept {
  id: string;
  slug?: string;
  /** Exact strings to auto-gloss in body text. Authored, not inferred. */
  surfaceForms?: string[];
  term: ScriptTerm;
  commonRendering?: string;
  semanticRange?: LocalizedString;
  distortion?: LocalizedString;
  interfaceRecommendation?: LocalizedString;
  cluster?: string[];
  tradition?: string;
  sources?: SourceRef[];
}

export interface CaseImplication {
  position: string;
  implication: LocalizedString;
  cost?: LocalizedString;
}

export interface RealWorldCase {
  id: string;
  title: LocalizedString;
  scenario: LocalizedString;
  question?: string;
  editorial: true;
  implications: CaseImplication[];
}

export interface TracerOption {
  id: string;
  label: LocalizedString;
  entails?: string[];
  conflictsWith?: string[];
  abstain?: boolean;
}

export interface TracerItem {
  id: string;
  prompt: LocalizedString;
  note?: LocalizedString;
  options: TracerOption[];
}

export interface Tracer {
  id: string;
  question: string;
  items: TracerItem[];
}

export interface GraphFragment {
  $fragment?: string;
  questions?: Question[];
  positions?: Position[];
  thinkers?: Thinker[];
  schools?: School[];
  traditions?: Tradition[];
  holds?: HoldsRelation[];
  arguments?: Argument[];
  objections?: Objection[];
  equivalences?: Equivalence[];
  influences?: Influence[];
  texts?: Text[];
  passages?: Passage[];
  concepts?: Concept[];
  cases?: RealWorldCase[];
  tracers?: Tracer[];
}

/**
 * A holding reference: `P_DCT`, `P_DCT@al_Ashari` (research F.5), or — widened here —
 * a Question or Objection id, for intersections between two debates rather than two positions.
 */
export interface HoldingRef {
  position: string;
  thinker?: string;
}

export type IntersectionSideKind = 'position' | 'question' | 'objection' | 'unresolved';
