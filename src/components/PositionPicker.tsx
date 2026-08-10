import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { usePrefs } from '../app/prefs';
import { positionSlug, questionSlug } from '../graph/slugs';
import type { PositionView, QuestionView } from '../graph/views';
import type { Tradition } from '../graph/types';

/**
 * Positions as a selectable set, not a scroll-through.
 *
 * Phase 1 stacked every position in the reading column: on the free-will question all
 * six rendered at once and the sixth began 2324px down a 2948px page, so the only way
 * to reach it was to scroll past the other five. The reader could not see how many
 * positions existed, and could not go to one directly.
 *
 * Each entry is a link, not a tab, because selecting a position changes the route and
 * the URL must be shareable. `aria-current="page"` marks the active one — the correct
 * semantic for navigation, where `aria-selected` would claim a tab widget that does not
 * exist here.
 */
export function PositionPicker({ view, activeId }: { view: QuestionView; activeId?: string }) {
  const { s, t, d } = usePrefs();
  const [tradition, setTradition] = useState<string>('all');
  const qs = questionSlug(view.question);

  const all = [...view.answers, ...view.refusals];

  const traditions = useMemo(() => {
    const seen = new Map<string, Tradition>();
    for (const p of all) for (const tr of p.traditions) seen.set(tr.id, tr);
    return [...seen.values()];
  }, [view]);

  const matches = (p: PositionView) =>
    tradition === 'all' || p.traditions.some((tr) => tr.id === tradition);

  const shown = all.filter(matches);
  const hidden = all.length - shown.length;

  const entry = (p: PositionView, n: number) => (
    <li key={p.position.id}>
      <NavLink
        to={`/questions/${qs}/${positionSlug(p.position)}`}
        className={({ isActive }) => `pick${isActive || p.position.id === activeId ? ' pick--on' : ''}`}
        aria-current={p.position.id === activeId ? 'page' : undefined}
      >
        <span className="pick__n">{String(n).padStart(2, '0')}</span>
        <span className="pick__body">
          <span className="pick__label">{t(p.position.shortLabel ?? p.position.label)}</span>
          <span className="pick__meta">
            {p.position.refusesQuestion && <em>{s.pickRefuses}</em>}
            {p.holdings.length > 0
              ? s.pickHeldBy(p.holdings.length)
              : <span className="pick__none">{s.pickNoHolders}</span>}
          </span>
          {p.traditions.length > 0 && (
            <span className="pick__trads">
              {p.traditions.map((tr) => (
                <span key={tr.id} className="pick__trad">{d(t(tr.label))}</span>
              ))}
            </span>
          )}
        </span>
      </NavLink>
    </li>
  );

  return (
    <nav className="picker" aria-labelledby="picker-heading">
      <h2 className="section-label" id="picker-heading">
        {s.positions} <span className="picker__count">{all.length}</span>
      </h2>

      {traditions.length > 1 && (
        <div className="picker__filter">
          <label className="section-label" htmlFor="trad-filter">{s.filterByTradition}</label>
          <select
            id="trad-filter" value={tradition}
            onChange={(e) => setTradition(e.target.value)}
          >
            <option value="all">{s.allTraditions}</option>
            {traditions.map((tr) => (
              <option key={tr.id} value={tr.id}>{t(tr.label)}</option>
            ))}
          </select>
        </div>
      )}

      <ol className="picker__list">
        {view.answers.filter(matches).map((p) => entry(p, all.indexOf(p) + 1))}
      </ol>

      {view.refusals.filter(matches).length > 0 && (
        <>
          <h3 className="section-label picker__sub">{s.refusalHeading}</h3>
          <ol className="picker__list picker__list--refusal">
            {view.refusals.filter(matches).map((p) => entry(p, all.indexOf(p) + 1))}
          </ol>
        </>
      )}

      {hidden > 0 && (
        <p className="picker__hidden" aria-live="polite">{s.hiddenByFilter(hidden)}</p>
      )}

      <p className="picker__actions">
        <NavLink className="btn btn--sm" to={`/questions/${qs}/compare`}>{s.compareTwo}</NavLink>
      </p>
    </nav>
  );
}
