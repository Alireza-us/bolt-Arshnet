import { useEffect } from 'react';
import { useI18n } from './i18n/index.tsx';

export function useDir() {
  const { dir, locale } = useI18n();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [dir, locale]);
}
