import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { en, type Translations } from './en';
import { fa } from './fa';

export type Locale = 'en' | 'fa';

const dictionaries: Record<Locale, Translations> = { en, fa };

type I18nContextType = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  t: Translations;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem('arshnet-locale');
    return stored === 'fa' || stored === 'en' ? stored : 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('arshnet-locale', l);
  }, []);

  const toggle = useCallback(() => {
    setLocale(locale === 'en' ? 'fa' : 'en');
  }, [locale, setLocale]);

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      dir: locale === 'fa' ? 'rtl' : 'ltr',
      t: dictionaries[locale],
      setLocale,
      toggle,
    }),
    [locale, setLocale, toggle],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
