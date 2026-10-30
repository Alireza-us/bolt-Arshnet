import {
  Check,
  Phone,
  ArrowRight,
  ArrowLeft,
  Camera,
} from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useReveal } from '@/lib/useReveal';
import { useI18n } from '@/lib/i18n/index.tsx';
import type { Translations } from '@/lib/i18n/en';
import { CtaButton } from '@/components/CtaButton';
import { Faq, type FaqItem } from '@/components/Faq';

export type ServiceKey = 'cameras' | 'voip' | 'network';

const COLORS: Record<ServiceKey, string> = {
  cameras: '#2F6BFF',
  voip: '#5C8CFF',
  network: '#3B82F6',
};

const ICONS: Record<ServiceKey, typeof Camera> = {
  cameras: Camera,
  voip: Phone,
  network: Camera,
};

export function ServicePageTemplate({
  serviceKey,
  navigate,
}: {
  serviceKey: ServiceKey;
  navigate: (to: Route) => void;
}) {
  const { t, dir } = useI18n();
  const d = t[serviceKey];
  const faqs: FaqItem[] = d.faqs;
  const Icon = ICONS[serviceKey];
  const color = COLORS[serviceKey];
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  useSeo({ title: d.metaTitle, description: d.metaDesc, path: `/${serviceKey}` });
  useReveal();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div
          className="absolute -top-20 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: `${color}22` }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-8xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="reveal max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-600 uppercase tracking-wider text-slate-300">
              {d.heroEyebrow}
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: `${color}1a` }}
            >
              <Icon className="h-8 w-8" style={{ color }} />
            </div>
            <h1 className="mt-6 text-3xl font-700 leading-[1.12] text-white sm:text-4xl lg:text-5xl">
              {d.heroTitle}
            </h1>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
              <a
                href={`tel:${t.common.phoneDial}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-lg font-600 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
              >
                <Phone className="h-5 w-5" /> {t.common.phoneNumber}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-navy-900 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="reveal grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <h2 className="text-2xl font-700 text-white sm:text-3xl">
              {d.problemTitle}
            </h2>
            <ul className="space-y-4">
              {d.problems.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-base leading-relaxed text-slate-300"
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-20">
        <div className="bg-circuit absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="reveal rounded-2xl border border-white/10 bg-navy-800 p-6 sm:p-10">
            <h2 className="text-2xl font-700 text-white sm:text-3xl">
              {d.solutionTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              {d.solutionDesc}
            </p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="bg-navy-900 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="reveal text-2xl font-700 text-white sm:text-3xl">
            {d.includedTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {d.included.map((item, i) => (
              <div
                key={i}
                className="reveal flex items-start gap-3 rounded-xl border border-white/10 bg-navy-800 p-4"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color}1a` }}
                >
                  <Check className="h-5 w-5" style={{ color }} />
                </div>
                <span className="pt-2 text-base text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="reveal text-2xl font-700 text-white sm:text-3xl">
            {d.processTitle}
          </h2>
          <div className="mt-8 space-y-4">
            {d.process.map((step, i) => (
              <div
                key={i}
                className="reveal flex gap-4 rounded-xl border border-white/10 bg-navy-800 p-5"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-700 text-white">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-600 text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-navy-900 py-16 sm:py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-700 text-white sm:text-3xl">
              {t.serviceFaqHeading}
            </h2>
            <p className="mt-3 text-slate-400">
              {t.serviceFaqSubtitle}
            </p>
          </div>
          <div className="mt-10">
            <Faq items={faqs} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="reveal text-3xl font-700 leading-[1.15] text-white sm:text-4xl">
            {t.common.readyToStart}
          </h2>
          <p className="reveal mt-4 text-lg text-slate-300">
            {t.common.bookFreeConsult}
          </p>
          <div className="reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-lg font-600 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              {t.common.seePricing} <BackIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
