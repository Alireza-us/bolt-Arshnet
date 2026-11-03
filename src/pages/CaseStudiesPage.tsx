import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const viewportOnce = { once: true, margin: '-60px' as const };

export function CaseStudiesPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const cs = t.caseStudies;
  const reduced = useReducedMotion();

  useSeo({ title: cs.metaTitle, description: cs.metaDesc, path: '/case-studies' });

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
              {cs.title}
            </motion.h1>
            <motion.p variants={staggerItem()} className="mt-4 text-lg text-ink-500">{cs.subtitle}</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-cream py-14 sm:py-16">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid gap-6 lg:grid-cols-3"
          >
            {cs.studies.map((s, i) => (
              <motion.article
                key={s.title}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="card-highlight flex flex-col rounded-2xl border border-hairline bg-surface p-6 shadow-card"
              >
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-3 py-1 text-xs font-600 text-emerald">
                  {s.type}
                </div>
                <h2 className="mt-4 text-lg font-700 text-ink">{s.title}</h2>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <div className="text-xs font-600 uppercase tracking-wider text-ink-400">
                      {cs.before}
                    </div>
                    <p className="mt-1 leading-relaxed text-ink-500">{s.before}</p>
                  </div>
                  <div>
                    <div className="text-xs font-600 uppercase tracking-wider text-emerald">
                      {cs.after}
                    </div>
                    <p className="mt-1 leading-relaxed text-ink-600">{s.after}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald/8 p-4">
                  <TrendingUp className="h-8 w-8 text-emerald" />
                  <div>
                    <div className="text-2xl font-700 text-ink">{s.metric}</div>
                    <div className="text-xs text-ink-500">{s.metricLabel}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="card-highlight mt-12 rounded-2xl border border-hairline bg-surface p-8 text-center shadow-soft sm:p-10"
          >
            <h2 className="text-2xl font-700 text-ink sm:text-3xl">{cs.wantSimilar}</h2>
            <p className="mx-auto mt-3 max-w-lg text-ink-500">{cs.wantSimilarDesc}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaButton navigate={navigate} />
              <button
                onClick={() => navigate('/pricing')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-cream px-5 py-3 text-base font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
              >
                {t.common.seePricing} <BackIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
