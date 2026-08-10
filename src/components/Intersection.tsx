import { Link } from 'react-router-dom';
import { usePrefs } from '../app/prefs';
import { positionPath } from '../graph/slugs';
import { graph } from '../app/graph';
import { Gloss } from './Gloss';
import type { ConvergenceType } from '../graph/types';
import type { IntersectionSide, IntersectionView } from '../graph/views';

/**
 * The intersection card, rebuilt.
 *
 * The sentence a reader must be able to finish within five seconds of arriving:
 *
 *   "These two, who never met, gave the same answer to this question — and here is
 *    whether that sameness is real."
 *
 * Why the Phase 1 confluence failed. The verdict was carried by the geometry of a joint
 * in an SVG, and the two descent chains were laid out as `<text>` at fixed centres with
 * no length bound. That is fine for "al-Ashʿarī" and fatal for "The Euthyphro dilemma,
 * and the horrible-commands objection", which at 58 characters overprinted the opposite
 * label and rendered, literally, as `horrible-com|hasnswabjebhi|ondivine command`. Text
 * of unbounded length inside a fixed-coordinate SVG cannot be made safe by nudging
 * coordinates — the layout has no way to reflow.
 *
 * So the text left the SVG. All of it. Names, schools, traditions and formulations are
 * now HTML in a two-column grid that wraps and reflows like text, and the SVG keeps only
 * what it was actually good at: the verdict as geometry, in a 64×48 glyph with no text
 * in it at all. A glyph with no text cannot collide.
 *
 * The verdict also stopped being a term of art. "Translation artifact" means nothing to
 * a newcomer, so each verdict leads with a plain sentence — "These look like the same
 * position. They are not." — and the technical term follows it as a label.
 */

const GLYPH_LABEL: Record<ConvergenceType, string> = {
  genuine: 'Two lines meeting and continuing as one.',
  superficial: 'Two lines crossing and continuing apart.',
  translation_artifact: 'Two lines meeting across a visible break.',
};

/** Pure geometry, no text — the one thing the SVG was good at. */
function VerdictGlyph({ type }: { type: ConvergenceType }) {
  return (
    <svg className={`vglyph vglyph--${type}`} viewBox="0 0 64 48" role="img" aria-label={GLYPH_LABEL[type]}>
      {type === 'superficial' ? (
        <>
          <path d="M6 8 C 6 30, 58 18, 58 40" className="vglyph__stem" />
          <path d="M58 8 C 58 30, 6 18, 6 40" className="vglyph__stem" />
        </>
      ) : (
        <>
          <path d="M6 8 C 6 22, 32 18, 32 26" className="vglyph__stem" />
          <path d="M58 8 C 58 22, 32 18, 32 26" className="vglyph__stem" />
          <path
            d="M32 26 V 42"
            className={`vglyph__stem${type === 'translation_artifact' ? ' vglyph__stem--broken' : ''}`}
          />
          {type === 'translation_artifact' && <line x1="20" y1="26" x2="44" y2="26" className="vglyph__seam" />}
        </>
      )}
      <circle cx={type === 'superficial' ? 32 : 32} cy={type === 'superficial' ? 24 : 26} r="3.5" className="vglyph__joint" />
    </svg>
  );
}

function SideColumn({ side }: { side: IntersectionSide }) {
  const { t, d } = usePrefs();
  const holding = side.holding;
  const name = holding ? d(holding.thinker.name) : d(String(t(side.label)));
  const path = side.position ? positionPath(graph, side.position) : undefined;

  return (
    <div className="ixn__side">
      <p className="ixn__who">
        {holding
          ? <Link to={`/thinkers/${holding.thinker.id}`}>{name}</Link>
          : name}
      </p>
      {holding?.thinker.nameSourceScript && (
        <p
          className={holding.thinker.script === 'Arab' ? 'script-arab' : undefined}
          lang={holding.thinker.script === 'Arab' ? 'ar' : undefined}
          dir={holding.thinker.script === 'Arab' ? 'rtl' : undefined}
        >
          {holding.thinker.nameSourceScript}
        </p>
      )}
      <p className="ixn__chain">
        {(holding
          ? [holding.school && t(holding.school.label), holding.tradition && t(holding.tradition.label)]
          : side.chain.slice(1)
        ).filter(Boolean).map((x) => d(String(x))).join(' · ') || '—'}
      </p>
      {side.position && path && (
        <p className="ixn__pos">
          <Link to={path}>{t(side.position.shortLabel ?? side.position.label)}</Link>
        </p>
      )}
      {holding?.holds.qualification && (
        <p className="ixn__qual">{t(holding.holds.qualification)}</p>
      )}

    </div>
  );
}

export function IntersectionCard({ view, compact = false }: { view: IntersectionView; compact?: boolean }) {
  const { s, t } = usePrefs();
  const e = view.equivalence;
  const type = e.convergenceType;

  const headline = {
    genuine: s.verdictGenuineLead,
    superficial: s.verdictSuperficialLead,
    translation_artifact: s.verdictArtifactLead,
  }[type];
  const term = {
    genuine: s.convergenceGenuine,
    superficial: s.convergenceSuperficial,
    translation_artifact: s.convergenceArtifact,
  }[type];

  return (
    <article className={`ixn ixn--${type}`} aria-labelledby={`ixn-${e.id ?? view.a.ref}`}>
      <header className="ixn__head">
        <VerdictGlyph type={type} />
        <div>
          <p className="ixn__term">
            {term}
            {' · '}
            <span className="ixn__scope">
              {view.crossesTraditions ? s.crossesTraditions : s.withinOneTradition}
            </span>
          </p>
          <h3 className="ixn__lead" id={`ixn-${e.id ?? view.a.ref}`}>{headline}</h3>
        </div>
      </header>

      <div className="ixn__sides">
        <SideColumn side={view.a} />
        <div className="ixn__join" aria-hidden="true" />
        <SideColumn side={view.b} />
      </div>
      {/* Stated once for the card, not once per column: repeating it on both sides read
          as two separate caveats when it is one fact about the intersection. */}
      {(!view.a.holding || !view.b.holding) && (
        <p className="ixn__note">{s.ixnNotAPerson}</p>
      )}

      <dl className="ixn__claims">
        {e.convergesOn && (
          <div className="ixn__claim ixn__claim--same">
            <dt>{s.bothHold}</dt>
            <dd><Gloss>{t(e.convergesOn)}</Gloss></dd>
          </div>
        )}
        {e.partsWaysOn && (
          <div className="ixn__claim ixn__claim--diff">
            <dt>{s.butDiffer}</dt>
            <dd><Gloss>{t(e.partsWaysOn)}</Gloss></dd>
          </div>
        )}
      </dl>

      {!compact && (
        <>
          {e.verdict && (
            <div className="ixn__verdict">
              <p className="section-label">{s.verdict}</p>
              <p><Gloss>{t(e.verdict)}</Gloss></p>
            </div>
          )}
          {e.transmissionLink === 'uncertain' && (
            <p className="ixn__note">{s.transmission}: {s.transmissionUncertain}</p>
          )}
          {!!e.sources?.length && (
            <ul className="ixn__sources">
              {e.sources.map((src, i) => (
                <li key={i}>
                  {src.url
                    ? <a href={src.url} rel="noreferrer noopener">{src.citation}</a>
                    : src.citation}
                  {src.doi && <> · <a href={`https://doi.org/${src.doi}`} rel="noreferrer noopener">doi:{src.doi}</a></>}
                  {src.perspectiveFlag && <span className="ixn__flag"> · {src.perspectiveFlag}</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {view.question && (
        <p className="ixn__foot">
          <Link to={`/questions/${view.question.slug ?? view.question.id}`}>
            {t(view.question.canonical)}
          </Link>
        </p>
      )}
    </article>
  );
}
