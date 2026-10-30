import { TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useReveal } from '@/lib/useReveal';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';

export function CaseStudiesPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const cs = t.caseStudies;

  useSeo({ title: cs.metaTitle, description: cs.metaDesc, path: '/case-studies' });
  useReveal();

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 pt-16 sm:pt-20">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-8xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-700 leading-[1.12] text-white sm:text-4xl lg:text-5xl">
              {cs.title}
            </h1>
            <p className="mt-4 text-lg text-slate-300">{cs.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-14 sm:py-16">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {cs.studies.map((s, i) => (
              <article
                key={i}
                className="reveal flex flex-col rounded-2xl border border-white/10 bg-navy-800 p-6"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-600 text-accent-100">
                  {s.type}
                </div>
                <h2 className="mt-4 text-lg font-700 text-white">{s.title}</h2>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <div className="text-xs font-600 uppercase tracking-wider text-slate-500">
                      {cs.before}
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-400">{s.before}</p>
                  </div>
                  <div>
                    <div className="text-xs font-600 uppercase tracking-wider text-accent-400">
                      {cs.after}
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-200">{s.after}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-accent/10 p-4">
                  <TrendingUp className="h-8 w-8 text-accent-400" />
                  <div>
                    <div className="text-2xl font-700 text-white">{s.metric}</div>
                    <div className="text-xs text-slate-400">{s.metricLabel}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="reveal mt-12 rounded-2xl border border-white/10 bg-navy-800 p-8 text-center sm:p-10">
            <h2 className="text-2xl font-700 text-white sm:text-3xl">{cs.wantSimilar}</h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-300">{cs.wantSimilarDesc}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaButton navigate={navigate} />
              <button
                onClick={() => navigate('/pricing')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-base font-600 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
              >
                {t.common.seePricing} <BackIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
