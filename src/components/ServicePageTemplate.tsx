import {
  Check,
  Phone,
  ArrowRight,
  ArrowLeft,
  Camera,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { Faq, type FaqItem } from '@/components/Faq';
import { CableDivider } from '@/components/CableDivider';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

export type ServiceKey = 'cameras' | 'voip' | 'network';

const COLORS: Record<ServiceKey, string> = {
  cameras: '#1F3D36',
  voip: '#2A5249',
  network: '#163029',
};

const ICONS: Record<ServiceKey, typeof Camera> = {
  cameras: Camera,
  voip: Phone,
  network: Camera,
};

const viewportOnce = { once: true, margin: '-60px' as const };

export function ServicePageTemplate({
  serviceKey,
  navigate,
}: {
  serviceKey: ServiceKey;
  navigate: (to: Route) => void;
}) {
  const { t, dir, digits } = useI18n();
  const d = t[serviceKey];
  const faqs: FaqItem[] = d.faqs;
  const Icon = ICONS[serviceKey];
  const color = COLORS[serviceKey];
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const reduced = useReducedMotion();
  const heroVariants = staggerContainer(0.12, 0.1);
  const item = staggerItem();

  useSeo({ title: d.metaTitle, description: d.metaDesc, path: `/${serviceKey}` });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream pt-14 sm:pt-16">
        <div className="relative mx-auto max-w-8xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div variants={item} className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-600 uppercase tracking-wider text-ink-500">
              {d.heroEyebrow}
            </motion.div>
            <motion.div
              variants={item}
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: `${color}0d` }}
            >
              <Icon className="h-8 w-8" style={{ color }} />
            </motion.div>
            <motion.h1 variants={item} className="mt-6 text-3xl font-700 leading-[1.12] text-ink sm:text-4xl lg:text-5xl">
              {d.heroTitle}
            </motion.h1>
            <motion.div variants={item} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
              <a
                href={`tel:${t.common.phoneDial}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-surface px-6 py-3.5 text-lg font-600 text-ink ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
              >
                <Phone className="h-5 w-5" /> {t.common.phoneNumber}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <CableDivider />

      {/* PROBLEM */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="grid gap-10 lg:grid-cols-[1fr_1.4fr]"
          >
            <h2 className="text-2xl font-700 text-ink sm:text-3xl">
              {d.problemTitle}
            </h2>
            <ul className="space-y-4">
              {d.problems.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-base leading-relaxed text-ink-500"
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <CableDivider flip />

      {/* SOLUTION */}
      <section className="relative overflow-hidden bg-surface py-16 sm:py-20">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="card-highlight rounded-2xl border border-hairline bg-cream-50 p-6 sm:p-10 shadow-soft"
          >
            <h2 className="text-2xl font-700 text-ink sm:text-3xl">
              {d.solutionTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">
              {d.solutionDesc}
            </p>
          </motion.div>
        </div>
      </section>

      <CableDivider />

      {/* WHAT'S INCLUDED */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="text-2xl font-700 text-ink sm:text-3xl"
          >
            {d.includedTitle}
          </motion.h2>
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-8 grid gap-4 sm:grid-cols-2"
          >
            {d.included.map((item, i) => (
              <motion.div
                key={item}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { y: -3 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="card-highlight flex items-start gap-3 rounded-xl border border-hairline bg-surface p-4 shadow-card"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color}0d` }}
                >
                  <Check className="h-5 w-5" style={{ color }} />
                </div>
                <span className="pt-2 text-base text-ink-600">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CableDivider flip />

      {/* PROCESS */}
      <section className="relative overflow-hidden bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="text-2xl font-700 text-ink sm:text-3xl"
          >
            {d.processTitle}
          </motion.h2>
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-8 space-y-4"
          >
            {d.process.map((step, i) => (
              <motion.div
                key={step.title}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { x: dir === 'rtl' ? -4 : 4 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="card-highlight flex gap-4 rounded-xl border border-hairline bg-cream-50 p-5 shadow-card"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-sm font-700 text-cream-50">
                  {digits(String(i + 1))}
                </div>
                <div>
                  <h3 className="text-lg font-600 text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CableDivider />

      {/* FAQ */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-2xl font-700 text-ink sm:text-3xl">
              {t.serviceFaqHeading}
            </h2>
            <p className="mt-3 text-ink-500">
              {t.serviceFaqSubtitle}
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE, delay: 0.1 }}
            className="mt-10"
          >
            <Faq items={faqs} />
          </motion.div>
        </div>
      </section>

      <CableDivider flip />

      {/* CTA */}
      <section className="relative overflow-hidden bg-surface py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="text-3xl font-700 leading-[1.15] text-ink sm:text-4xl"
          >
            {t.common.readyToStart}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE, delay: 0.1 }}
            className="mt-4 text-lg text-ink-500"
          >
            {t.common.bookFreeConsult}
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cream px-6 py-3.5 text-lg font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
            >
              {t.common.seePricing} <BackIcon className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
