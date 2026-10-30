import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { en, type Translations } from './en';
import { fa } from './fa';

export type Locale = 'fa' | 'en';

const dictionaries: Record<Locale, Translations> = { en, fa };

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

type I18nContextType = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  t: Translations;
  brandName: string;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  digits: (s: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

function toFaDigits(s: string): string {
  return s.replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem('arshnet-locale');
    if (stored === 'fa' || stored === 'en') return stored;
  } catch {
    // localStorage may be unavailable
  }
  return 'fa'; // default Persian
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === 'undefined' ? 'fa' : getStoredLocale(),
  );

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('arshnet-locale', l);
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setLocale(locale === 'en' ? 'fa' : 'en');
  }, [locale, setLocale]);

  const digits = useCallback(
    (s: string) => (locale === 'fa' ? toFaDigits(s) : s),
    [locale],
  );

  useEffect(() => {
    const dir = locale === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      dir: locale === 'fa' ? 'rtl' : 'ltr',
      t: dictionaries[locale],
      brandName: locale === 'fa' ? 'عرش نت' : 'Arshnet',
      setLocale,
      toggle,
      digits,
    }),
    [locale, setLocale, toggle, digits],
  );

  return (
    <I18nContext.Provider value={value}>
      <div key={locale} className="lang-fade">
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
