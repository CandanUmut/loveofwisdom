import { Link } from 'react-router-dom';
import { usePrefs } from '../app/prefs';
import { EpistemicMark } from './Epistemic';
import { Sigil } from './Apparatus';
import type { ScriptTerm as ScriptTermT, Tradition } from '../graph/types';
import type { HoldingView } from '../graph/views';

/** Source script alongside transliteration, with correct bidi isolation. */
export function ScriptTerm({ term, showRendering = true }: { term: ScriptTermT; showRendering?: boolean }) {
  const { s, d } = usePrefs();
  const rtl = term.script === 'Arab' || term.script === 'Hebr';
  const cls = term.script ? `script-${term.script.toLowerCase()}` : undefined;
  return (
    <span>
      {term.sourceScript && (
        <>
          <span className={cls} lang={term.lang} dir={rtl ? 'rtl' : 'ltr'}>{term.sourceScript}</span>{' '}
        </>
      )}
      <span className="translit">{d(term.translit)}</span>
      {showRendering && term.standardRendering && (
        <span className="term-gloss">{' — '}{s.usuallyRendered.toLowerCase()}: {term.standardRendering}</span>
      )}
    </span>
  );
}

export function CoverageNote({ tradition }: { tradition: Tradition }) {
  const { s, t, text } = usePrefs();
  if (!tradition.coverageFlag) return null;
  const thin = tradition.coverageFlag === 'thin' || tradition.coverageFlag === 'moderate';
  return (
    <p className="prose-note" style={thin ? { color: 'var(--orpiment)' } : undefined}>
      {s.coverage}: {tradition.coverageFlag}
      {tradition.coverageNote && ` — ${t(tradition.coverageNote)}`}
      {tradition.coverageNote && text(tradition.coverageNote).fellBack && ` (${s.notTranslated})`}
    </p>
  );
}

/**
 * One attribution. The reified `holds` object is what makes this row possible:
 * name, dates, school, the qualification, the epistemic mark with its sides, and
 * an explicit statement when nothing sources it.
 */
export function HolderRow({ holding }: { holding: HoldingView }) {
  const { s, t, d } = usePrefs();
  const { holds, thinker, school, passages, evidence } = holding;
  return (
    <li>
      <span className="holder__name">
        <Link to={`/thinkers/${thinker.id}`}>{d(thinker.name)}</Link>
      </span>
      {thinker.nameSourceScript && (
        <span
          className={thinker.script === 'Arab' ? 'script-arab' : undefined}
          lang={thinker.script === 'Arab' ? 'ar' : undefined}
          dir={thinker.script === 'Arab' ? 'rtl' : undefined}
        >
          {thinker.nameSourceScript}
        </span>
      )}
      <span className="holder__dates">{thinker.died ?? thinker.born ?? s.datesUnknown}</span>
      {school && <span className="holder__school">{t(school.label)}</span>}
      <Sigil passageIds={holds.sourcePassages} />
      <EpistemicMark
        status={holds.epistemicStatus}
        qualification={holds.qualification}
        dispute={holds.scholarlyDispute}
        sides={holds.sides}
      />
      {holds.careerPhase && (
        <span className="holder__qual">{t(holds.careerPhase)}</span>
      )}
      {evidence === 'none' && (
        <span className="holder__qual" style={{ color: 'var(--orpiment)' }}>{s.noSourcePassage}</span>
      )}
      {evidence === 'unverified-locus' && passages.length > 0 && (
        <span className="holder__qual" style={{ color: 'var(--orpiment)' }}>{s.locusUnverified}</span>
      )}
    </li>
  );
}
