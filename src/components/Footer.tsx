import { Phone, Mail, MapPin } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useI18n } from '@/lib/i18n/index.tsx';

export function Footer({ navigate }: { navigate: (to: Route) => void }) {
  const { t } = useI18n();

  const links: { to: Route; label: string }[] = [
    { to: '/cameras', label: t.nav.cameras },
    { to: '/voip', label: t.nav.voip },
    { to: '/network', label: t.nav.network },
    { to: '/pricing', label: t.nav.pricing },
    { to: '/case-studies', label: t.nav.caseStudies },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <footer className="border-t border-white/10 bg-navy-950">
      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-xl font-700 text-white">
              Arsh<span className="text-accent">net</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-600 uppercase tracking-wider text-slate-300">
              {t.footer.pagesTitle}
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {links.map((l) => (
                <li key={l.to}>
                  <button
                    onClick={() => navigate(l.to)}
                    className="text-sm text-slate-400 transition-colors hover:text-accent"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-600 uppercase tracking-wider text-slate-300">
              {t.footer.contactTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>
                <a
                  href={`tel:${t.common.phoneDial}`}
                  className="flex items-center gap-2 hover:text-accent"
                >
                  <Phone className="h-4 w-4 text-accent" />
                  {t.common.phoneNumber}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t.common.contactEmail}`}
                  className="flex items-center gap-2 hover:text-accent"
                >
                  <Mail className="h-4 w-4 text-accent" />
                  {t.common.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                {t.common.cityRegion}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Arshnet. {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
