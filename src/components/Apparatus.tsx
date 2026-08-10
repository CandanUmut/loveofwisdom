import { createContext, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { usePrefs } from '../app/prefs';
import type { Passage } from '../graph/types';

/**
 * The keyed apparatus (design pass 2, §1).
 *
 * Sigla in the running text and entries in the margin are one mechanism, not two
 * columns that happen to sit next to each other. A sigil is a focusable button; it
 * marks its entry and scrolls to it. Below 62rem the rail moves under the text but
 * the keying is unchanged, so the relationship survives on a phone.
 */

const SIGLA = 'abcdefghijklmnopqrstuvwxyz';

interface ApparatusEntry {
  id: string;
  sigil: string;
  passage: Passage;
}

interface ApparatusCtx {
  /** Register a passage and get back its sigil. Stable across renders. */
  key: (passageId: string) => string;
  entries: ApparatusEntry[];
  active: string | null;
  setActive: (id: string | null) => void;
  domId: (passageId: string) => string;
}

const Ctx = createContext<ApparatusCtx | null>(null);

export function ApparatusProvider({
  passages, children,
}: { passages: Passage[]; children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const idBase = useRef(`app-${Math.random().toString(36).slice(2, 8)}`).current;

  const value = useMemo<ApparatusCtx>(() => {
    const order = new Map<string, number>();
    passages.forEach((p, i) => order.set(p.id, i));
    const entries: ApparatusEntry[] = passages.map((p, i) => ({
      id: p.id,
      sigil: SIGLA[i] ?? String(i + 1),
      passage: p,
    }));
    return {
      key: (pid) => {
        const i = order.get(pid);
        return i === undefined ? '?' : (SIGLA[i] ?? String(i + 1));
      },
      entries,
      active,
      setActive,
      domId: (pid) => `${idBase}-${pid}`,
    };
  }, [passages, active, idBase]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useApparatus() {
  return useContext(Ctx);
}

/** A superscript sigil in the running text, keyed to a rail entry. */
export function Sigil({ passageIds }: { passageIds: string[] | undefined }) {
  const app = useApparatus();
  if (!app || !passageIds?.length) return null;
  return (
    <>
      {passageIds.map((pid) => {
        const sigil = app.key(pid);
        if (sigil === '?') return null;
        return (
          <a
            key={pid}
            href={`#${app.domId(pid)}`}
            className={`sigil${app.active === pid ? ' is-active' : ''}`}
            onMouseEnter={() => app.setActive(pid)}
            onMouseLeave={() => app.setActive(null)}
            onFocus={() => app.setActive(pid)}
            onBlur={() => app.setActive(null)}
          >
            <span aria-hidden="true">{sigil}</span>
            <span className="visually-hidden">{` (source ${sigil})`}</span>
          </a>
        );
      })}
    </>
  );
}

/** The margin itself. */
export function ApparatusRail() {
  const app = useApparatus();
  const { s, text } = usePrefs();
  if (!app) return null;

  return (
    <aside className="folio__rail" aria-labelledby="apparatus-heading">
      <h2 id="apparatus-heading" className="section-label">{s.apparatus}</h2>
      {app.entries.length === 0 ? (
        <p className="empty">{s.apparatusEmpty}</p>
      ) : (
        <div>
          {app.entries.map(({ id, sigil, passage }) => (
            <div
              key={id}
              id={app.domId(id)}
              className={`apparatus__entry${app.active === id ? ' is-active' : ''}`}
              onMouseEnter={() => app.setActive(id)}
              onMouseLeave={() => app.setActive(null)}
            >
              <span className="apparatus__sigil" aria-hidden="true">{sigil}</span>
              <div className="apparatus__body">
                {passage.text ? (
                  <blockquote className="apparatus__quote">“{passage.text}”</blockquote>
                ) : (
                  <p className="apparatus__cite" style={{ color: 'var(--orpiment)' }}>
                    {s.locusUnverified} {s.locusUnverifiedLong}
                  </p>
                )}
                {/* Citations are never diacritic-lightened: mangling a bibliographic
                    string would make it harder to find, which defeats the point. */}
                <p className="apparatus__cite">{passage.citation}</p>
                <p className="apparatus__meta">
                  {passage.locator && <span>{passage.locator}</span>}
                  {passage.license && <span>{s.licence}: {passage.license}</span>}
                </p>
                {passage.perspectiveFlag && (
                  <p className="apparatus__meta" style={{ color: 'var(--orpiment)' }}>
                    {s.perspective}: {text(passage.perspectiveFlag).text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
