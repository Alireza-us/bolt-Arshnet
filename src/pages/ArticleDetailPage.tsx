import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Clock, Tag, CalendarDays, Share2 } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const viewportOnce = { once: true, margin: '-60px' as const };

export function ArticleDetailPage({
  navigate,
  slug,
}: {
  navigate: (to: Route) => void;
  slug: string;
}) {
  const { t, locale, dir, digits } = useI18n();
  const a = t.articles;
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const reduced = useReducedMotion();

  const article = getArticleBySlug(slug);

  useSeo({
    title: article ? `${article.title[locale]} — Arshnet` : `${a.articleFallbackTitle} — Arshnet`,
    description: article ? article.excerpt[locale] : a.metaDesc,
    path: `/articles/${slug}`,
  });

  if (!article) {
    return (
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-700 text-ink">{a.notFoundCode}</h1>
          <p className="mt-3 text-ink-500">{a.notFoundText}</p>
          <button
            onClick={() => navigate('/articles')}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald px-5 py-3 text-base font-600 text-cream-50"
          >
            {a.backToList}
          </button>
        </div>
      </section>
    );
  }

  const related = getRelatedArticles(slug);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.href : ''}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: article.title[locale], url: shareUrl });
      } catch {
        // user cancelled
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-cream pt-14 sm:pt-16">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.1, 0.05)}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              variants={staggerItem()}
              onClick={() => navigate('/articles')}
              className="inline-flex items-center gap-1.5 text-sm font-600 text-ink-500 transition-colors hover:text-emerald"
            >
              <BackIcon className="h-4 w-4" />
              {a.backToList}
            </motion.button>

            <motion.div variants={staggerItem()} className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-3 py-1 text-xs font-600 text-emerald">
                <Tag className="h-3 w-3" />
                {article.category[locale]}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-400">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(article.date, locale)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-400">
                <Clock className="h-3.5 w-3.5" />
                {digits(String(article.readingTime))} {a.readingTime}
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem()}
              className="mt-5 text-3xl font-700 leading-[1.15] text-ink sm:text-4xl"
            >
              {article.title[locale]}
            </motion.h1>
            <motion.p
              variants={staggerItem()}
              className="mt-4 text-lg leading-relaxed text-ink-600"
            >
              {article.excerpt[locale]}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <article className="bg-cream py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="space-y-6"
          >
            {article.body[locale].map((para, i) => (
              <p key={i} className="text-base leading-[1.8] text-ink-600 sm:text-lg">
                {para}
              </p>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            className="mt-10 flex items-center justify-between border-t border-hairline pt-6"
          >
            <button
              onClick={() => navigate('/articles')}
              className="inline-flex items-center gap-1.5 text-sm font-600 text-ink-500 transition-colors hover:text-emerald"
            >
              <BackIcon className="h-4 w-4" />
              {a.backToList}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-2.5 text-sm font-600 text-ink-500 transition-colors hover:bg-emerald/5 hover:text-emerald"
            >
              <Share2 className="h-4 w-4" />
              {a.shareArticle}
            </button>
          </motion.div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-surface py-14 sm:py-16">
          <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
              className="text-2xl font-700 text-ink"
            >
              {a.relatedTitle}
            </motion.h2>
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-8 grid gap-6 md:grid-cols-2"
            >
              {related.map((rel, i) => (
                <motion.button
                  key={rel.slug}
                  variants={staggerItem()}
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  onClick={() => navigate(`/articles/${rel.slug}`)}
                  className="group card-highlight flex flex-col rounded-2xl border border-hairline bg-cream-50 p-6 text-start shadow-card hover:border-emerald/30"
                >
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-3 py-1 text-xs font-600 text-emerald">
                    <Tag className="h-3 w-3" />
                    {rel.category[locale]}
                  </span>
                  <h3 className="mt-4 text-lg font-700 text-ink group-hover:text-emerald">
                    {rel.title[locale]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {rel.excerpt[locale]}
                  </p>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>
      )}

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
              onClick={() => navigate('/contact')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cream px-6 py-3.5 text-lg font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
            >
              {t.nav.contact}
              <BackIcon className="h-4 w-4" />
            </button>
          </motion.div>
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
