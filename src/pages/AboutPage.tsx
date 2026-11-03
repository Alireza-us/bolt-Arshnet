import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Award, Clock, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { SectionHeading } from '@/components/SectionHeading';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const STAT_ICONS = [Clock, ShieldCheck, Award];
const viewportOnce = { once: true, margin: '-60px' as const };

export function AboutPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir, locale } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const a = t.about;
  const reduced = useReducedMotion();

  useSeo({ title: a.metaTitle, description: a.metaDesc, path: '/about' });

  return (
    <>
      <section className="relative overflow-hidden bg-cream pt-16 sm:pt-20">
        <div className="relative mx-auto max-w-8xl px-4 pb-12 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.14, 0.1)}
            initial="hidden"
            animate="visible"
            className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]"
          >
            <motion.div variants={staggerItem()} className="mx-auto w-full max-w-sm">
              <div className="card-highlight aspect-[4/5] w-full rounded-2xl border border-hairline bg-surface flex items-center justify-center shadow-card relative overflow-hidden">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald/8 text-4xl font-700 text-emerald">
                    {locale === 'fa' ? 'ع' : 'A'}
                  </div>
                  <p className="mt-4 text-sm text-ink-400">{a.photoPlaceholder}</p>
                </div>
              </div>
            </motion.div>
            <motion.div variants={staggerItem()}>
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
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-surface px-5 py-3 text-base font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
                >
                  <Phone className="h-5 w-5" /> {t.common.phoneNumber}
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="border-y border-hairline bg-surface py-10">
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8"
        >
          {a.stats.map((stat, i) => {
            const Icon = STAT_ICONS[i] ?? ShieldCheck;
            return (
              <motion.div key={i} variants={staggerItem()} className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-emerald" />
                <div>
                  <div className="text-2xl font-700 text-ink">{stat.value}</div>
                  <div className="text-sm text-ink-500">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={a.certEyebrow}
            title={a.certTitle}
            subtitle={a.certSubtitle}
          />
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {a.certs.map((c, i) => (
              <motion.div
                key={i}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { y: -3 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="card-highlight flex items-start gap-3 rounded-xl border border-hairline bg-surface p-5 shadow-card"
              >
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald" />
                <div>
                  <div className="font-600 text-ink">{c.label}</div>
                  <div className="mt-0.5 text-sm text-ink-500">{c.note}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-surface py-14 sm:py-16">
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="text-2xl font-700 text-ink sm:text-3xl"
          >
            {a.letsTalk}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE, delay: 0.1 }}
            className="mt-3 text-ink-500"
          >
            {a.letsTalkDesc}
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE, delay: 0.2 }}
            className="mt-6"
          >
            <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
            <button
              onClick={() => navigate('/case-studies')}
              className="ml-0 mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-cream px-5 py-3 text-base font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden sm:ml-3 sm:mt-0"
            >
              {a.seeCaseStudies} <BackIcon className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
