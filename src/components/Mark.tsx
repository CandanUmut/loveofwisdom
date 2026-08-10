/**
 * The mark.
 *
 * The Phase 1 favicon was a vertical bar crossed by a horizontal one — a dagger, meant
 * as the apparatus mark for a contested claim. At 16px that reads as a Christian cross,
 * which on a site presenting Islamic, Indian, Chinese, Jewish and Christian traditions
 * as equals quietly privileges one of them. That is a content error wearing a visual
 * costume, and it had to go.
 *
 * The replacement is derived from what the platform argues rather than from anyone's
 * iconography: three strokes arriving from different directions at a single point, and
 * continuing past it as one. Convergence is the thesis; the mark carries the thesis.
 * It is the same figure as the `genuine` verdict glyph on an intersection card, so the
 * logo and the signature surface say the same thing.
 *
 * Tested against the failure modes the brief names:
 *  - not a cross — nothing is orthogonal, and the three inbound strokes are at unequal
 *    angles (−34°, −4°, +30°) with unequal lengths, so no arm pairs with another;
 *  - not a crescent — no arc encloses anything;
 *  - not a star of David — no triangle, no six-fold anything;
 *  - not a dharma wheel or yin-yang — both need radial or rotational symmetry, and this
 *    figure has neither: the whole composition is left-weighted with a single tail;
 *  - not an arrow — the strokes converge to a dot and continue *through* it rather than
 *    terminating in a head.
 *
 * At 16px the three inbound strokes merge into a single wedge and the dot survives,
 * which reads as "many into one" — degraded but still the right idea, and unambiguous.
 */
export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg
      className="mark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* Three arrivals at deliberately unequal angles (−35°, −6°, +41°) and unequal
          lengths. An earlier version spaced them evenly about the horizontal, which made
          the two outer strokes read as a chevron and the whole mark as an arrowhead —
          "send", not "converge". Breaking the symmetry breaks the arrow. */}
      <path d="M4.5 5.5 L16.8 14.2" />
      <path d="M3.2 14.2 L16.2 15.6" />
      <path d="M7.5 26.5 L17 18.2" />
      {/* The single stem that continues past the joint, off the mean axis so it reads as
          a continuation rather than as a point. */}
      <path d="M20.6 16.6 L28 18.4" className="mark__stem" />
      <circle cx="18.4" cy="16.4" r="2.6" className="mark__joint" />
    </svg>
  );
}
