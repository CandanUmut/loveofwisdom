import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { usePrefs } from './prefs';
import { Mark } from '../components/Mark';
import type { Locale } from '../graph/types';
import type { DiacriticMode } from '../lib/diacritics';

export function Layout() {
  const { s, locale, setLocale, diacritics, setDiacritics } = usePrefs();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  return (
    <>
      <a className="skip" href="#main">{s.skipToContent}</a>

      <header className="masthead">
        <div className="masthead__inner">
          <Link to="/" className="masthead__name">
            <Mark size={26} title={s.siteName} />
            <span>{s.siteName}</span>
          </Link>

          <nav aria-label={s.primaryNav}>
            <NavLink to="/questions">{s.navQuestions}</NavLink>
            <NavLink to="/intersections">{s.navIntersections}</NavLink>
            <NavLink to="/terms">{s.navTerms}</NavLink>
            <NavLink to="/positions/mine">{s.navYours}</NavLink>
            <NavLink to="/about">{s.navAbout}</NavLink>
          </nav>

          <form
            className="masthead__search"
            onSubmit={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(q)}`); }}
            role="search"
          >
            <label className="visually-hidden" htmlFor="site-search">{s.searchTitle}</label>
            <input
              id="site-search" type="search" value={q} placeholder={s.searchPlaceholderShort}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          <div className="masthead__prefs">
            <div className="toggle">
              <span id="dia-label">{s.diacritics}</span>
              <div className="toggle__group" role="group" aria-labelledby="dia-label">
                {(['light', 'full'] as DiacriticMode[]).map((m) => (
                  <button key={m} type="button" aria-pressed={diacritics === m} onClick={() => setDiacritics(m)}>
                    {m === 'light' ? s.diacriticsLight : s.diacriticsFull}
                  </button>
                ))}
              </div>
            </div>
            <div className="toggle">
              <span id="lang-label" className="visually-hidden">{s.language}</span>
              <div className="toggle__group" role="group" aria-labelledby="lang-label">
                {(['en', 'tr'] as Locale[]).map((l) => (
                  <button key={l} type="button" lang={l} aria-pressed={locale === l} onClick={() => setLocale(l)}>
                    {l === 'en' ? 'EN' : 'TR'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="shell">
        <Outlet />
      </main>
    </>
  );
}
