import { useEffect, useState, useCallback } from 'react';

export type Route = string;

export const ROUTE_PATTERNS = [
  '/',
  '/cameras',
  '/voip',
  '/network',
  '/pricing',
  '/case-studies',
  '/about',
  '/contact',
  '/articles',
];

function parse(hash: string): Route {
  const clean = hash.replace(/^#/, '');
  if (clean === '') return '/';
  return clean;
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? '/' : parse(window.location.hash),
  );

  useEffect(() => {
    const onHash = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return { route, navigate };
}
