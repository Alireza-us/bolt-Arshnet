import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Clock, Tag } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { ARTICLES } from '@/lib/articles';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const viewportOnce = { once: true, margin: '-60px' as const };

export function ArticlesPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, locale, dir, digits } = useI18n();
  const a = t.articles;
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const reduced = useReducedMotion();

  const categories = useMemo(() => {
    const cats = new Set(ARTICLES.map((art) => art.category[locale]));
    return [a.allCategories, ...Array.from(cats)];
  }, [locale, a.allCategories]);

  const [active, setActive] = useState(a.allCategories);

  const filtered = useMemo(() => {
    if (active === a.allCategories) return ARTICLES;
    return ARTICLES.filter((art) => art.category[locale] === active);
  }, [active, locale, a.allCategories]);

  useSeo({ title: a.metaTitle, description: a.metaDesc, path: '/articles' });

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
              {a.title}
            </motion.h1>
            <motion.p variants={staggerItem()} className="mt-4 text-lg text-ink-500">{a.subtitle}</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-cream py-12 sm:py-16">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-2 text-sm font-600 transition-colors ${
                  active === cat
                    ? 'bg-emerald text-cream-50'
                    : 'border border-hairline bg-surface text-ink-500 hover:bg-emerald/5 hover:text-emerald'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {filtered.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-lg text-ink-500"
            >
              {a.noResults}
            </motion.p>
          ) : (
          <motion.div
            key={active}
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((art, i) => (
              <motion.button
                key={art.slug}
                variants={staggerItem()}
                whileHover={reduced ? undefined : { y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
                onClick={() => navigate(`/articles/${art.slug}`)}
                className="group card-highlight flex flex-col rounded-2xl border border-hairline bg-surface p-6 text-start shadow-card hover:border-emerald/30"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-3 py-1 text-xs font-600 text-emerald">
                    <Tag className="h-3 w-3" />
                    {art.category[locale]}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-700 leading-snug text-ink group-hover:text-emerald">
                  {art.title[locale]}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                  {art.excerpt[locale]}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 text-xs text-ink-400">
                  <span>{formatDate(art.date, locale)}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {digits(String(art.readingTime))} {a.readingTime}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

function formatDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
