import { Phone, Mail, MapPin } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useI18n } from '@/lib/i18n/index.tsx';
import { GlowText } from '@/components/GlowText';

export function Footer({ navigate }: { navigate: (to: Route) => void }) {
  const { t } = useI18n();

  const links: { to: Route; label: string }[] = [
    { to: '/cameras', label: t.nav.cameras },
    { to: '/voip', label: t.nav.voip },
    { to: '/network', label: t.nav.network },
    { to: '/pricing', label: t.nav.pricing },
    { to: '/case-studies', label: t.nav.caseStudies },
    { to: '/about', label: t.nav.about },
    { to: '/articles', label: t.nav.articles },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <footer className="border-t border-hairline bg-cream-50">
      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-xl font-700 text-ink">
              Arsh<span className="text-champagne-400">net</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-600 uppercase tracking-wider text-ink-600">
              {t.footer.pagesTitle}
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {links.map((l) => (
                <li key={l.to}>
                  <GlowText
                    onClick={() => navigate(l.to)}
                    className="relative inline-block text-sm text-ink-500 transition-colors hover:text-emerald"
                  >
                    <span className="led-dot absolute -start-3 top-1/2 -translate-y-1/2" />
                    {l.label}
                  </GlowText>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-600 uppercase tracking-wider text-ink-600">
              {t.footer.contactTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-500">
              <li>
                <a
                  href={`tel:${t.common.phoneDial}`}
                  onMouseMove={(e) => {
                    const el = e.currentTarget;
                    const rect = el.getBoundingClientRect();
                    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
                  }}
                  className="spotlight relative flex items-center gap-2 hover:text-emerald"
                >
                  <span className="led-dot absolute -start-3 top-1/2 -translate-y-1/2" />
                  <Phone className="h-4 w-4 text-emerald" />
                  {t.common.phoneNumber}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t.common.contactEmail}`}
                  onMouseMove={(e) => {
                    const el = e.currentTarget;
                    const rect = el.getBoundingClientRect();
                    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
                  }}
                  className="spotlight relative flex items-center gap-2 hover:text-emerald"
                >
                  <span className="led-dot absolute -start-3 top-1/2 -translate-y-1/2" />
                  <Mail className="h-4 w-4 text-emerald" />
                  {t.common.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald" />
                {t.common.cityRegion}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-hairline pt-6 text-xs text-ink-400">
          &copy; {new Date().getFullYear()} Arshnet. {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
