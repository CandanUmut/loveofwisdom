import { NavLink, Outlet, Link } from 'react-router-dom';
import { usePrefs } from './prefs';
import type { Locale } from '../graph/types';
import type { DiacriticMode } from '../lib/diacritics';

export function Layout() {
  const { s, locale, setLocale, diacritics, setDiacritics } = usePrefs();

  return (
    <>
      <a className="skip" href="#main">{s.skipToContent}</a>
      <div className="shell">
        <header className="masthead">
          <Link to="/" className="masthead__name">{s.siteName}</Link>
          <nav aria-label={s.navQuestions}>
            <NavLink to="/">{s.navQuestions}</NavLink>
            <NavLink to="/intersections">{s.navIntersections}</NavLink>
            <NavLink to="/terms">{s.navTerms}</NavLink>
            <NavLink to="/yours">{s.navYours}</NavLink>
            <NavLink to="/about">{s.navAbout}</NavLink>
          </nav>

          <div className="masthead__prefs">
            <div className="toggle">
              <span id="dia-label">{s.diacritics}</span>
              <div className="toggle__group" role="group" aria-labelledby="dia-label">
                {(['light', 'full'] as DiacriticMode[]).map((m) => (
                  <button
                    key={m} type="button"
                    aria-pressed={diacritics === m}
                    onClick={() => setDiacritics(m)}
                  >
                    {m === 'light' ? s.diacriticsLight : s.diacriticsFull}
                  </button>
                ))}
              </div>
            </div>
            <div className="toggle">
              <span id="lang-label" className="visually-hidden">{s.language}</span>
              <div className="toggle__group" role="group" aria-labelledby="lang-label">
                {(['en', 'tr'] as Locale[]).map((l) => (
                  <button
                    key={l} type="button" lang={l}
                    aria-pressed={locale === l}
                    onClick={() => setLocale(l)}
                  >
                    {l === 'en' ? 'EN' : 'TR'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main id="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
