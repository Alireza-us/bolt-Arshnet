import { Check, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useReveal } from '@/lib/useReveal';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { SectionHeading } from '@/components/SectionHeading';

export function PricingPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pricing;

  useSeo({ title: p.metaTitle, description: p.metaDesc, path: '/pricing' });
  useReveal();

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 pt-16 sm:pt-20">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-8xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-700 leading-[1.12] text-white sm:text-4xl lg:text-5xl">
              {p.title}
            </h1>
            <p className="mt-4 text-lg text-slate-300">{p.subtitle}</p>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="bg-navy-900 py-14 sm:py-16">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {p.plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`reveal relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                  i === 1
                    ? 'border-accent/50 bg-navy-800 shadow-glow'
                    : 'border-white/10 bg-navy-800'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-700 text-white">
                    {t.common.mostPopular}
                  </div>
                )}
                <h3 className="text-xl font-700 text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{plan.tagline}</p>
                <div className="mt-5">
                  <span className="text-3xl font-700 text-white">{plan.price}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <CtaButton
                    navigate={navigate}
                    label={`${t.common.choose} ${plan.name}`}
                    variant={i === 1 ? 'primary' : 'secondary'}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-navy-950 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.compareEyebrow} title={p.compareTitle} align="left" />
          <div className="reveal mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-navy-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-5 py-4 font-600 text-slate-200">{p.tableFeature}</th>
                  <th className="px-5 py-4 text-center font-600 text-slate-200">{p.plans[0].name}</th>
                  <th className="px-5 py-4 text-center font-600 text-white">{p.plans[1].name}</th>
                  <th className="px-5 py-4 text-center font-600 text-slate-200">{p.plans[2].name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {p.compareTable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5 text-slate-300">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><Cell on={row.basic} /></td>
                    <td className="px-5 py-3.5 bg-accent/5 text-center"><Cell on={row.business} accent /></td>
                    <td className="px-5 py-3.5 text-center"><Cell on={row.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PROJECT PRICING */}
      <section className="bg-navy-900 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={p.projectEyebrow}
            title={p.projectTitle}
            subtitle={p.projectSubtitle}
            align="left"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {p.projects.map((proj, i) => (
              <div
                key={i}
                className="reveal rounded-2xl border border-white/10 bg-navy-800 p-5"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="text-sm text-slate-400">{proj.label}</div>
                <div className="mt-2 text-xl font-700 text-accent-400">{proj.from}</div>
              </div>
            ))}
          </div>
          <div className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaButton navigate={navigate} />
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-base font-600 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              {p.askCustomJob} <BackIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function Cell({ on, accent = false }: { on: boolean; accent?: boolean }) {
  if (!on) return <Minus className="mx-auto h-4 w-4 text-slate-600" />;
  return (
    <Check className={`mx-auto h-5 w-5 ${accent ? 'text-accent-400' : 'text-slate-300'}`} />
  );
}
