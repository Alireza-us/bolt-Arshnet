import { motion, useReducedMotion } from 'framer-motion';
import { Check, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { SectionHeading } from '@/components/SectionHeading';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const viewportOnce = { once: true, margin: '-60px' as const };

export function PricingPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pricing;
  const reduced = useReducedMotion();

  useSeo({ title: p.metaTitle, description: p.metaDesc, path: '/pricing' });

  return (
    <>
      <section className="relative overflow-hidden bg-cream pt-16 sm:pt-20">
        <div className="relative mx-auto max-w-8xl px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h1 variants={staggerItem()} className="text-3xl font-700 leading-[1.12] text-ink sm:text-4xl lg:text-5xl">
              {p.title}
            </motion.h1>
            <motion.p variants={staggerItem()} className="mt-4 text-lg text-ink-500">{p.subtitle}</motion.p>
          </motion.div>
        </div>
      </section>

      {/* PLANS */}
      <section className="bg-cream py-14 sm:py-16">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid gap-6 lg:grid-cols-3"
          >
            {p.plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={`card-highlight relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                  i === 1
                    ? 'border-emerald/40 bg-surface shadow-soft ring-1 ring-emerald/20'
                    : 'border-hairline bg-surface shadow-card'
                }`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald px-3 py-1 text-xs font-700 text-cream-50">
                    {t.common.mostPopular}
                  </div>
                )}
                <h3 className="text-xl font-700 text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
                <div className="mt-5">
                  <span className="text-3xl font-700 text-ink">{plan.price}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-surface py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.compareEyebrow} title={p.compareTitle} align="start" />
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="card-highlight mt-8 overflow-x-auto rounded-2xl border border-hairline bg-cream-50 shadow-card"
          >
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-hairline bg-cream-200">
                  <th className="px-5 py-4 font-600 text-ink-600">{p.tableFeature}</th>
                  <th className="px-5 py-4 text-center font-600 text-ink-500">{p.plans[0].name}</th>
                  <th className="px-5 py-4 text-center font-600 text-emerald">{p.plans[1].name}</th>
                  <th className="px-5 py-4 text-center font-600 text-ink-500">{p.plans[2].name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {p.compareTable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5 text-ink-600">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><Cell on={row.basic} /></td>
                    <td className="px-5 py-3.5 bg-emerald/5 text-center"><Cell on={row.business} accent /></td>
                    <td className="px-5 py-3.5 text-center"><Cell on={row.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* PROJECT PRICING */}
      <section className="bg-cream py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={p.projectEyebrow}
            title={p.projectTitle}
            subtitle={p.projectSubtitle}
            align="start"
          />
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-8 grid gap-4 sm:grid-cols-3"
          >
            {p.projects.map((proj, i) => (
              <motion.div
                key={i}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { y: -3 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="card-highlight rounded-2xl border border-hairline bg-surface p-5 shadow-card"
              >
                <div className="text-sm text-ink-500">{proj.label}</div>
                <div className="mt-2 text-xl font-700 text-emerald">{proj.from}</div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <CtaButton navigate={navigate} />
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-surface px-5 py-3 text-base font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
            >
              {p.askCustomJob} <BackIcon className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function Cell({ on, accent = false }: { on: boolean; accent?: boolean }) {
  if (!on) return <Minus className="mx-auto h-4 w-4 text-ink-400/40" />;
  return (
    <Check className={`mx-auto h-5 w-5 ${accent ? 'text-emerald' : 'text-ink-500'}`} />
  );
}
