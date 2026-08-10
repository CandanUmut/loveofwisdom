import type { ReactNode } from 'react';

/**
 * The reading surface: up to three panes that scroll independently.
 *
 * Taken from Sefaria's `readerPanelBox > readerPanel > readerContent` nesting — the
 * outer box owns the viewport height and never scrolls, each pane owns its own scroll.
 * Phase 1 used `position: sticky` on the rail instead, which pins the top of the rail
 * but gives it no scroll context of its own: with 13 passages the rail stood 2479px tall
 * in an 800px viewport, so the only way to reach the last citation was to scroll the
 * main column to its end. Sticky positions a pane; it does not make it scrollable.
 *
 * Below 60rem the panes stop being panes: the page scrolls as one document, the picker
 * moves above the reading column, and the apparatus becomes an inline section beneath
 * the content it annotates. Deliberately not a drawer — a reader who cannot see the
 * apparatus will not go looking for it.
 */
export function Reader({
  aside, children, apparatus, label, asideLabel, apparatusLabel,
}: {
  /** Left pane: the position picker. Omitted on pages that have nothing to select. */
  aside?: ReactNode;
  /** Centre pane: the reading column. */
  children: ReactNode;
  /** Right pane: the apparatus. Omitted when nothing is cited. */
  apparatus?: ReactNode;
  label: string;
  asideLabel: string;
  apparatusLabel: string;
}) {
  const cols = [aside ? 'aside' : '', 'main', apparatus ? 'app' : ''].filter(Boolean).join(' ');
  // Each pane is a scroll container, and a scroll container that cannot be focused
  // cannot be scrolled by keyboard — axe flags this as a serious failure and it is one.
  // Making them named regions with tabIndex 0 gives a keyboard user somewhere to land
  // before arrowing through, and gives a screen-reader user a landmark to jump to.
  return (
    <div className={`reader reader--${cols.replace(/ /g, '-')}`} aria-label={label}>
      {aside && (
        <div className="reader__pane reader__pane--aside" role="region" aria-label={asideLabel} tabIndex={0}>
          {aside}
        </div>
      )}
      <div className="reader__pane reader__pane--main" role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
      {apparatus && (
        <div className="reader__pane reader__pane--app" role="region" aria-label={apparatusLabel} tabIndex={0}>
          {apparatus}
        </div>
      )}
    </div>
  );
}
