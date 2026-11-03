import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Star,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  Video,
  Network,
  Cable,
  Headphones,
  HardDriveDownload,
} from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { SectionHeading } from '@/components/SectionHeading';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { CableDivider } from '@/components/CableDivider';

const TRUST_BRANDS = ['Hikvision', 'Ubiquiti', 'MikroTik', '3CX', 'FreePBX', 'Grandstream'];

const SERVICE_ROUTES: { to: Route; icon: typeof Video; color: string }[] = [
  { to: '/cameras', icon: Video, color: '#1F3D36' },
  { to: '/voip', icon: Phone, color: '#2A5249' },
  { to: '/network', icon: Network, color: '#163029' },
];

const STEP_ICONS = [Phone, Cable, HardDriveDownload, Headphones];

const viewportOnce = { once: true, margin: '-60px' as const };

export function HomePage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir, digits } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.5]);

  useSeo({
    title: t.home.metaTitle,
    description: t.home.metaDesc,
    path: '/',
  });

  const h = t.home;
  const heroVariants = staggerContainer(0.12, 0.1);
  const item = staggerItem();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <div className="relative mx-auto max-w-8xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28">
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-600 text-emerald">
              <MapPin className="h-3.5 w-3.5" />
              {h.badge}
            </motion.div>
            <motion.h1 variants={item} className="text-4xl font-700 leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              {h.heroTitle}
            </motion.h1>
            <motion.p variants={item} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
              {h.heroSubtitle}
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
              <button
                onClick={() => navigate('/pricing')}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-surface px-6 py-3.5 text-lg font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
              >
                {t.common.seePricing}
                <BackIcon className="h-4 w-4" />
              </button>
            </motion.div>
            <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald" /> {h.certifiedInsured}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald" /> {h.sameDay}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-champagne-600" /> {h.noLockIn}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <CableDivider />

      {/* SERVICE CARDS */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={h.servicesEyebrow}
            title={h.servicesTitle}
            subtitle={h.servicesSubtitle}
          />
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {h.services.map((s, i) => {
              const meta = SERVICE_ROUTES[i];
              const Icon = meta.icon;
              return (
                <motion.button
                  key={meta.to}
                  variants={staggerItem()}
                  onClick={() => navigate(meta.to)}
                  whileHover={reduced ? undefined : { y: -6 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="group card-highlight flex flex-col rounded-2xl border border-hairline bg-surface p-6 text-start shadow-card hover:border-emerald/30"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ background: `${meta.color}0d` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: meta.color }} />
                  </div>
                  <h3 className="mt-5 text-xl font-700 text-ink">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                    {s.short}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-600 text-emerald transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    {t.common.learnMore} <BackIcon className="h-4 w-4" />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      <CableDivider flip />

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden bg-surface py-16 sm:py-20">
        <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={h.howEyebrow}
            title={h.howTitle}
            subtitle={h.howSubtitle}
          />
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {h.steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i] ?? Phone;
              return (
                <motion.div
                  key={step.title}
                  variants={staggerItem()}
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="group card-highlight relative rounded-2xl border border-hairline bg-cream-50 p-6 shadow-card"
                >
                  <div className="absolute -top-3 start-6 flex h-7 w-7 items-center justify-center rounded-full bg-emerald text-sm font-700 text-cream-50">
                    {digits(String(i + 1))}
                  </div>
                  <StepIcon className="mt-3 h-8 w-8 text-emerald" />
                  <h3 className="mt-4 text-lg font-600 text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <CableDivider />

      {/* TRUST STRIP */}
      <section className="relative border-y border-hairline bg-cream py-12">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            className="text-center text-xs font-600 uppercase tracking-[0.2em] text-ink-400"
          >
            {h.trustLabel}
          </motion.p>
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12"
          >
            {TRUST_BRANDS.map((brand) => (
              <motion.span
                key={brand}
                variants={staggerItem()}
                className="text-lg font-700 tracking-tight text-ink-500 transition-colors hover:text-emerald sm:text-xl"
              >
                {brand}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <CableDivider flip />

      {/* TESTIMONIALS */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={h.testimonialsEyebrow}
            title={h.testimonialsTitle}
          />
          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {h.testimonials.map((tm, i) => (
              <motion.figure
                key={tm.name + i}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { y: -4 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="group card-highlight flex flex-col rounded-2xl border border-hairline bg-surface p-6 shadow-card"
              >
                <div className="flex gap-1 text-champagne-400" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink-600">
                  &ldquo;{tm.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-hairline pt-4">
                  <div className="font-600 text-ink">{tm.name}</div>
                  <div className="text-sm text-ink-400">{tm.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </section>

      <CableDivider />

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-surface py-16 sm:py-24">
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="text-3xl font-700 leading-[1.15] text-ink sm:text-4xl lg:text-5xl"
          >
            {h.finalCtaTitle}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE, delay: 0.1 }}
            className="mt-4 text-lg text-ink-500"
          >
            {h.finalCtaSubtitle}
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
            <a
              href={`tel:${t.common.phoneDial}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cream px-6 py-3.5 text-lg font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
            >
              <Phone className="h-5 w-5" />
              {t.common.phoneNumber}
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
