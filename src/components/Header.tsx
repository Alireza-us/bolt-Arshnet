import { useState, useEffect } from 'react';
import { Menu, X, Phone, Globe } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useI18n } from '@/lib/i18n/index.tsx';
import { Logo } from '@/components/Logo';

export function Header({
  route,
  navigate,
}: {
  route: Route;
  navigate: (to: Route) => void;
}) {
  const { t, toggle, locale } = useI18n();
  const [open, setOpen] = useState(false);

  const links: { to: Route; label: string }[] = [
    { to: '/cameras', label: t.nav.cameras },
    { to: '/voip', label: t.nav.voip },
    { to: '/network', label: t.nav.network },
    { to: '/pricing', label: t.nav.pricing },
    { to: '/case-studies', label: t.nav.caseStudies },
    { to: '/articles', label: t.nav.articles },
    { to: '/about', label: t.nav.about },
  ];

  const go = (to: Route) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => go('/')}
          className="flex items-center gap-2.5"
          aria-label="Arshnet home"
        >
          <Logo variant="full" />
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <button
              key={l.to}
              onClick={() => go(l.to)}
              className={`rounded-lg px-3.5 py-2 text-sm font-500 transition-colors ${
                route === l.to
                  ? 'bg-emerald/8 text-emerald'
                  : 'text-ink-500 hover:bg-emerald/5 hover:text-emerald'
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-hairline px-3 text-sm font-600 text-ink-500 transition-colors hover:bg-emerald/5"
            aria-label="Switch language"
          >
            <Globe className="h-4 w-4" />
            {locale === 'en' ? 'فا' : 'EN'}
          </button>
          <button
            onClick={() => go('/contact')}
            className="hidden items-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-sm font-600 text-cream-50 shadow-soft transition-transform hover:scale-[1.03] active:scale-95 sm:inline-flex"
          >
            <Phone className="h-4 w-4" />
            {t.common.ctaText}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 hover:bg-emerald/5 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-hairline bg-cream px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.to}
                onClick={() => go(l.to)}
                className={`rounded-lg px-4 py-3 text-base ${
                  route === l.to
                    ? 'bg-emerald/8 text-emerald'
                    : 'text-ink-500 hover:bg-emerald/5'
                }`}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => go('/contact')}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-base font-600 text-cream-50"
            >
              <Phone className="h-4 w-4" />
              {t.common.ctaText}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
