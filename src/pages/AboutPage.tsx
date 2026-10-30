import { ShieldCheck, Award, Clock, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useReveal } from '@/lib/useReveal';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { SectionHeading } from '@/components/SectionHeading';

const STAT_ICONS = [Clock, ShieldCheck, Award];

export function AboutPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const a = t.about;

  useSeo({ title: a.metaTitle, description: a.metaDesc, path: '/about' });
  useReveal();

  return (
    <>
      <section className="relative overflow-hidden bg-cream pt-16 sm:pt-20">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-8xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="reveal grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div className="mx-auto w-full max-w-sm">
              <div className="aspect-[4/5] w-full rounded-2xl border border-hairline bg-surface bg-circuit flex items-center justify-center shadow-card">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald/8 text-4xl font-700 text-emerald">
                    A
                  </div>
                  <p className="mt-4 text-sm text-ink-400">{a.photoPlaceholder}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-600 uppercase tracking-[0.2em] text-champagne-600">
                {a.eyebrow}
              </div>
              <h1 className="text-3xl font-700 leading-[1.12] text-ink sm:text-4xl lg:text-5xl">
                {a.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-600">{a.bio1}</p>
              <p className="mt-4 text-base leading-relaxed text-ink-500">{a.bio2}</p>
              <p className="mt-4 text-base leading-relaxed text-ink-500">{a.bio3}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton navigate={navigate} />
                <a
                  href={`tel:${t.common.phoneDial}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-surface px-5 py-3 text-base font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5"
                >
                  <Phone className="h-5 w-5" /> {t.common.phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="border-y border-hairline bg-surface py-10">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {a.stats.map((stat, i) => {
            const Icon = STAT_ICONS[i] ?? ShieldCheck;
            return (
              <div key={i} className="reveal flex items-center gap-3">
                <Icon className="h-8 w-8 text-emerald" />
                <div>
                  <div className="text-2xl font-700 text-ink">{stat.value}</div>
                  <div className="text-sm text-ink-500">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={a.certEyebrow}
            title={a.certTitle}
            subtitle={a.certSubtitle}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {a.certs.map((c, i) => (
              <div
                key={i}
                className="reveal flex items-start gap-3 rounded-xl border border-hairline bg-surface p-5 shadow-card"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald" />
                <div>
                  <div className="font-600 text-ink">{c.label}</div>
                  <div className="mt-0.5 text-sm text-ink-500">{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-surface py-14 sm:py-16">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="reveal text-2xl font-700 text-ink sm:text-3xl">{a.letsTalk}</h2>
          <p className="reveal mt-3 text-ink-500">{a.letsTalkDesc}</p>
          <div className="reveal mt-6">
            <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
            <button
              onClick={() => navigate('/case-studies')}
              className="ml-0 mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-cream px-5 py-3 text-base font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 sm:ml-3 sm:mt-0"
            >
              {a.seeCaseStudies} <BackIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
