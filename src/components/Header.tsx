import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, X, Phone, Globe } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useI18n } from '@/lib/i18n/index.tsx';
import { Logo } from '@/components/Logo';
import { EASE } from '@/lib/motion';

export function Header({
  route,
  navigate,
}: {
  route: Route;
  navigate: (to: Route) => void;
}) {
  const { t, toggle, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

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
        <motion.button
          onClick={() => go('/')}
          className="flex items-center gap-2.5"
          aria-label={t.common.homeLabel}
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Logo variant="full" />
        </motion.button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l, i) => (
            <motion.button
              key={l.to}
              onClick={() => go(l.to)}
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                el.style.setProperty('--my', `${e.clientY - rect.top}px`);
              }}
              className="group spotlight relative rounded-lg px-3.5 py-2 text-sm font-500 transition-colors"
              initial={reduced ? undefined : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.05 * i }}
            >
              <span className="led-dot absolute start-2 top-1/2 -translate-y-1/2" />
              <span
                className={
                  route === l.to
                    ? 'text-emerald'
                    : 'text-ink-500 group-hover:text-emerald'
                }
              >
                {l.label}
              </span>
              <span className="absolute inset-x-2 -bottom-0.5 h-0.5 origin-left rtl:origin-right rounded-full bg-emerald transition-transform duration-300 ease-out group-hover:scale-x-100"
                style={{ transform: route === l.to ? 'scaleX(1)' : 'scaleX(0)' }}
              />
            </motion.button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-hairline px-3 text-sm font-600 text-ink-500 transition-colors hover:bg-emerald/5"
            aria-label={t.common.switchLanguage}
          >
            <Globe className="h-4 w-4" />
            {locale === 'en' ? 'فا' : 'EN'}
          </button>
          <motion.button
            onClick={() => go('/contact')}
            whileTap={reduced ? undefined : { scale: 0.95 }}
            className="hidden items-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-sm font-600 text-cream-50 shadow-soft sm:inline-flex"
          >
            <Phone className="h-4 w-4" />
            {t.common.ctaText}
          </motion.button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 hover:bg-emerald/5 lg:hidden"
            aria-label={open ? t.common.closeMenu : t.common.openMenu}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-hairline bg-cream lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
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
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
