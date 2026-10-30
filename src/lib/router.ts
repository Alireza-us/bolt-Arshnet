import { useEffect, useState, useCallback } from 'react';

export type Route =
  | '/'
  | '/cameras'
  | '/voip'
  | '/network'
  | '/pricing'
  | '/case-studies'
  | '/about'
  | '/contact';

const ROUTES: Route[] = [
  '/',
  '/cameras',
  '/voip',
  '/network',
  '/pricing',
  '/case-studies',
  '/about',
  '/contact',
];

function parse(hash: string): Route {
  const clean = hash.replace(/^#/, '') as Route;
  return ROUTES.includes(clean) ? clean : '/';
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

  const navigate = useCallback((to: Route) => {
    window.location.hash = to;
  }, []);

  return { route, navigate };
}
