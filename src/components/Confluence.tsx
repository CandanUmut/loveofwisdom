import { useId } from 'react';
import { usePrefs } from '../app/prefs';
import type { ConvergenceType } from '../graph/types';
import type { IntersectionView } from '../graph/views';

/**
 * The confluence — the site's signature element (design pass 2, §5).
 *
 * Two descent chains (thinker → school → tradition) come down from opposite margins and
 * meet at a joint. The convergence verdict is carried by the *geometry of the joint*,
 * not by a label sitting next to it:
 *
 *   genuine               the two stems fuse; one solid stem continues below
 *   superficial           the stems cross and continue separately — they touch, nothing joins
 *   translation_artifact  they appear to meet, but a seam runs through the joint and
 *                         the shared stem below is dashed
 *
 * Accessibility: this is never a canvas-only graph. The SVG is role="img" with a title
 * and a full text description of the cluster, and the same nodes and edges are rendered
 * as a table immediately below — in the DOM, not behind a toggle, and keyboard-reachable
 * like any other table.
 */

const X_L = 110;
const X_R = 370;
const Y_NODE = 62;
const Y_JOINT = 112;
const Y_FOOT = 152;

export function Confluence({ view, reveal = false }: { view: IntersectionView; reveal?: boolean }) {
  const { s, t, d } = usePrefs();
  const uid = useId().replace(/:/g, '');
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const type = view.equivalence.convergenceType;

  const verdictWord =
    type === 'genuine' ? s.convergenceGenuine
      : type === 'superficial' ? s.convergenceSuperficial
        : s.convergenceArtifact;

  const chainA = view.a.chain.map(d);
  const chainB = view.b.chain.map(d);
  const labelA = t(view.a.label);
  const labelB = t(view.b.label);

  const description =
    `${verdictWord}. ` +
    `${chainA.join(' — ') || labelA} on one side; ${chainB.join(' — ') || labelB} on the other. ` +
    (type === 'genuine'
      ? 'The two chains meet and continue as one.'
      : type === 'superficial'
        ? 'The two chains cross and continue separately.'
        : 'The two chains appear to meet, but a seam runs through the joint and the shared stem is broken.') +
    ` ${view.crossesTraditions ? s.crossesTraditions : s.withinOneTradition}.`;

  const stemClass = (extra = '') =>
    `confluence__stem${extra}${reveal ? ' reveal-stem' : ''}`;

  return (
    <figure className="confluence">
      <svg
        viewBox="0 0 480 176"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={titleId}>{s.confluenceAlt}</title>
        <desc id={descId}>{description}</desc>

        {[{ x: X_L, chain: chainA, fallback: labelA }, { x: X_R, chain: chainB, fallback: labelB }].map(
          ({ x, chain, fallback }, i) => {
            const rows = chain.length ? chain : [fallback];
            return (
              <g key={i} className={reveal ? 'reveal-label' : undefined}>
                {rows.slice(0, 3).map((row, j) => (
                  <text
                    key={j}
                    x={x}
                    y={18 + j * 15}
                    textAnchor="middle"
                    className={`confluence__label${j > 0 ? ' confluence__label--muted' : ''}`}
                  >
                    {row}
                  </text>
                ))}
              </g>
            );
          },
        )}

        <circle cx={X_L} cy={Y_NODE} r="3.5" className="confluence__node" />
        <circle cx={X_R} cy={Y_NODE} r="3.5" className="confluence__node" />

        {type === 'superficial' ? (
          <>
            {/* they cross, and continue separately */}
            <path
              d={`M ${X_L} ${Y_NODE + 5} C ${X_L} ${Y_JOINT}, ${X_R} ${Y_JOINT}, ${X_R} ${Y_FOOT}`}
              className={stemClass()} style={{ ['--len' as string]: 340 }}
            />
            <path
              d={`M ${X_R} ${Y_NODE + 5} C ${X_R} ${Y_JOINT}, ${X_L} ${Y_JOINT}, ${X_L} ${Y_FOOT}`}
              className={stemClass()} style={{ ['--len' as string]: 340 }}
            />
            <circle
              cx="240" cy={(Y_NODE + Y_FOOT) / 2} r="4"
              className={`confluence__joint confluence__joint--superficial${reveal ? ' reveal-joint' : ''}`}
            />
          </>
        ) : (
          <>
            <path
              d={`M ${X_L} ${Y_NODE + 5} C ${X_L} ${Y_JOINT - 10}, 240 ${Y_JOINT - 22}, 240 ${Y_JOINT}`}
              className={stemClass()} style={{ ['--len' as string]: 160 }}
            />
            <path
              d={`M ${X_R} ${Y_NODE + 5} C ${X_R} ${Y_JOINT - 10}, 240 ${Y_JOINT - 22}, 240 ${Y_JOINT}`}
              className={stemClass()} style={{ ['--len' as string]: 160 }}
            />
            <path
              d={`M 240 ${Y_JOINT} V ${Y_FOOT}`}
              className={stemClass(type === 'translation_artifact' ? ' confluence__stem--dashed' : '')}
              style={{ ['--len' as string]: 40 }}
            />
            {type === 'translation_artifact' && (
              <line
                x1="212" y1={Y_JOINT} x2="268" y2={Y_JOINT}
                className={`confluence__seam${reveal ? ' reveal-joint' : ''}`}
              />
            )}
            <circle
              cx="240" cy={Y_JOINT} r="4"
              className={`confluence__joint${type === 'translation_artifact' ? ' confluence__joint--artifact' : ''}${reveal ? ' reveal-joint' : ''}`}
            />
          </>
        )}

        <text
          x="240" y={Y_FOOT + 18} textAnchor="middle"
          className={`confluence__label${reveal ? ' reveal-label' : ''}`}
        >
          {verdictWord.toLowerCase()}
        </text>
      </svg>

      <figcaption className="visually-hidden">{description}</figcaption>

      <div className="table-scroll" tabIndex={0} role="region" aria-label={s.confluenceTable}>
      <table className="graph-table">
        <caption>{s.confluenceTable}</caption>
        <thead>
          <tr>
            <th scope="col">{s.colSide}</th>
            <th scope="col">{s.colChain}</th>
            <th scope="col">{s.colTradition}</th>
          </tr>
        </thead>
        <tbody>
          {[{ side: view.a, chain: chainA, label: labelA }, { side: view.b, chain: chainB, label: labelB }].map(
            ({ side, chain, label }) => (
              <tr key={side.ref}>
                <th scope="row" style={{ fontFamily: 'var(--body)', textTransform: 'none', color: 'var(--ink)' }}>
                  {label}
                </th>
                <td>{chain.length ? chain.join(' → ') : '—'}</td>
                <td>{side.holding?.tradition ? t(side.holding.tradition.label) : '—'}</td>
              </tr>
            ),
          )}
          <tr>
            <th scope="row" style={{ fontFamily: 'var(--body)', textTransform: 'none', color: 'var(--ink)' }}>
              {s.verdict}
            </th>
            <td colSpan={2}>
              {verdictWord}
              {' — '}
              {view.crossesTraditions ? s.crossesTraditions : s.withinOneTradition}
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </figure>
  );
}

export function verdictClass(type: ConvergenceType) {
  return `intersection intersection--${type}`;
}
