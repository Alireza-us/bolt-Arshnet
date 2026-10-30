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
      <section className="relative overflow-hidden bg-navy-900 pt-16 sm:pt-20">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-8xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="reveal grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div className="mx-auto w-full max-w-sm">
              <div className="aspect-[4/5] w-full rounded-2xl border border-white/10 bg-navy-800 bg-circuit flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 text-4xl font-700 text-accent-400">
                    A
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{a.photoPlaceholder}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-600 uppercase tracking-[0.2em] text-accent-400">
                {a.eyebrow}
              </div>
              <h1 className="text-3xl font-700 leading-[1.12] text-white sm:text-4xl lg:text-5xl">
                {a.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-300">{a.bio1}</p>
              <p className="mt-4 text-base leading-relaxed text-slate-400">{a.bio2}</p>
              <p className="mt-4 text-base leading-relaxed text-slate-400">{a.bio3}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton navigate={navigate} />
                <a
                  href={`tel:${t.common.phoneDial}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-base font-600 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
                >
                  <Phone className="h-5 w-5" /> {t.common.phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="border-y border-white/10 bg-navy-950 py-10">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {a.stats.map((stat, i) => {
            const Icon = STAT_ICONS[i] ?? ShieldCheck;
            return (
              <div key={i} className="reveal flex items-center gap-3">
                <Icon className="h-8 w-8 text-accent-400" />
                <div>
                  <div className="text-2xl font-700 text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="bg-navy-900 py-16 sm:py-20">
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
                className="reveal flex items-start gap-3 rounded-xl border border-white/10 bg-navy-800 p-5"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-accent-400" />
                <div>
                  <div className="font-600 text-white">{c.label}</div>
                  <div className="mt-0.5 text-sm text-slate-400">{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-14 sm:py-16">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="reveal text-2xl font-700 text-white sm:text-3xl">{a.letsTalk}</h2>
          <p className="reveal mt-3 text-slate-300">{a.letsTalkDesc}</p>
          <div className="reveal mt-6">
            <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
            <button
              onClick={() => navigate('/case-studies')}
              className="ml-0 mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-base font-600 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15 sm:ml-3 sm:mt-0"
            >
              {a.seeCaseStudies} <BackIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
