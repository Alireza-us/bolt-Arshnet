import { useState, useEffect } from 'react';
import { Menu, X, Phone, Globe } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useI18n } from '@/lib/i18n/index.tsx';

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
    { to: '/about', label: t.nav.about },
  ];

  const go = (to: Route) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => go('/')}
          className="flex items-center gap-2.5"
          aria-label="Arshnet home"
        >
          <Logo />
          <span className="font-display text-lg font-700 tracking-tight text-white">
            Arsh<span className="text-accent">net</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <button
              key={l.to}
              onClick={() => go(l.to)}
              className={`rounded-lg px-3.5 py-2 text-sm font-500 transition-colors ${
                route === l.to
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-sm font-600 text-slate-200 transition-colors hover:bg-white/5"
            aria-label="Switch language"
          >
            <Globe className="h-4 w-4" />
            {locale === 'en' ? 'فا' : 'EN'}
          </button>
          <button
            onClick={() => go('/contact')}
            className="hidden items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-600 text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-95 sm:inline-flex"
          >
            <Phone className="h-4 w-4" />
            {t.common.ctaText}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/5 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-navy-900 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.to}
                onClick={() => go(l.to)}
                className={`rounded-lg px-4 py-3 text-base ${
                  route === l.to
                    ? 'bg-white/10 text-white'
                    : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => go('/contact')}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-base font-600 text-white"
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

function Logo() {
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#111C30" />
      <path
        d="M16 20h18a10 10 0 0 1 10 10v14"
        stroke="#2F6BFF"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="20" r="4" fill="#2F6BFF" />
      <circle cx="44" cy="44" r="4" fill="#2F6BFF" />
      <path
        d="M22 28l8 8 8-8"
        stroke="#5C8CFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
