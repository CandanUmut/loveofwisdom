import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Locale, LocalizedString } from '../graph/types';
import { STRINGS, type Strings } from '../i18n/strings';
import { applyDiacritics, type DiacriticMode } from '../lib/diacritics';

interface Prefs {
  locale: Locale;
  setLocale: (l: Locale) => void;
  diacritics: DiacriticMode;
  setDiacritics: (d: DiacriticMode) => void;
  /** UI strings for the active locale. */
  s: Strings;
  /**
   * Resolve a content string. Returns the text plus whether it fell back to English,
   * so the caller can mark it — a missing Turkish translation is shown as English with
   * a visible note, never machine-translated and never silently swapped.
   */
  text: (v: LocalizedString | undefined) => { text: string; fellBack: boolean };
  /** Resolve and apply the diacritic mode. For prose and labels — never for citations. */
  t: (v: LocalizedString | undefined) => string;
  /** Apply the diacritic mode to an already-plain string. */
  d: (v: string) => string;
}

const PrefsContext = createContext<Prefs | null>(null);

const KEY_LOCALE = 'lw.locale';
const KEY_DIA = 'lw.diacritics';

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  const v = localStorage.getItem(key) as T | null;
  return v && allowed.includes(v) ? v : fallback;
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStored(KEY_LOCALE, ['en', 'tr'] as const, 'en'));
  const [diacritics, setDiaState] = useState<DiacriticMode>(
    () => readStored(KEY_DIA, ['light', 'full'] as const, 'light'),
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(KEY_LOCALE, locale);
  }, [locale]);
  useEffect(() => { localStorage.setItem(KEY_DIA, diacritics); }, [diacritics]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const setDiacritics = useCallback((d: DiacriticMode) => setDiaState(d), []);

  const value = useMemo<Prefs>(() => {
    const text = (v: LocalizedString | undefined) => {
      if (v === undefined) return { text: '', fellBack: false };
      if (typeof v === 'string') return { text: v, fellBack: false };
      const own = v[locale];
      if (own) return { text: own, fellBack: false };
      return { text: v.en ?? v.tr ?? '', fellBack: true };
    };
    return {
      locale, setLocale, diacritics, setDiacritics,
      s: STRINGS[locale],
      text,
      t: (v) => applyDiacritics(text(v).text, diacritics),
      d: (v) => applyDiacritics(v, diacritics),
    };
  }, [locale, diacritics, setLocale, setDiacritics]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider');
  return ctx;
}
