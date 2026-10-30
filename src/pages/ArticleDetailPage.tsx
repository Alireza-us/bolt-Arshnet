import { ArrowRight, ArrowLeft, Clock, Tag, CalendarDays, Share2 } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useReveal } from '@/lib/useReveal';
import { useI18n } from '@/lib/i18n/index.tsx';
import { CtaButton } from '@/components/CtaButton';
import { getArticleBySlug, getRelatedArticles } from '@/lib/articles';

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

  const article = getArticleBySlug(slug);

  useSeo({
    title: article ? `${article.title[locale]} — Arshnet` : 'Article — Arshnet',
    description: article ? article.excerpt[locale] : a.metaDesc,
    path: `/articles/${slug}`,
  });
  useReveal();

  if (!article) {
    return (
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-700 text-ink">404</h1>
          <p className="mt-3 text-ink-500">Article not found.</p>
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
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/articles')}
            className="reveal inline-flex items-center gap-1.5 text-sm font-600 text-ink-500 transition-colors hover:text-emerald"
          >
            <BackIcon className="h-4 w-4" />
            {a.backToList}
          </button>

          <div className="reveal mt-6 flex items-center gap-3">
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
          </div>

          <h1 className="reveal mt-5 text-3xl font-700 leading-[1.15] text-ink sm:text-4xl">
            {article.title[locale]}
          </h1>
          <p className="reveal mt-4 text-lg leading-relaxed text-ink-600">
            {article.excerpt[locale]}
          </p>
        </div>
      </section>

      <article className="bg-cream py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="reveal space-y-6">
            {article.body[locale].map((para, i) => (
              <p key={i} className="text-base leading-[1.8] text-ink-600 sm:text-lg">
                {para}
              </p>
            ))}
          </div>

          <div className="reveal mt-10 flex items-center justify-between border-t border-hairline pt-6">
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
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-surface py-14 sm:py-16">
          <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
            <h2 className="reveal text-2xl font-700 text-ink">{a.relatedTitle}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {related.map((rel, i) => (
                <button
                  key={rel.slug}
                  onClick={() => navigate(`/articles/${rel.slug}`)}
                  className="reveal group flex flex-col rounded-2xl border border-hairline bg-cream-50 p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:border-emerald/30"
                  style={{ transitionDelay: `${i * 70}ms` }}
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
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-surface py-16 sm:py-20">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="reveal text-3xl font-700 leading-[1.15] text-ink sm:text-4xl">
            {t.common.readyToStart}
          </h2>
          <p className="reveal mt-4 text-lg text-ink-500">{t.common.bookFreeConsult}</p>
          <div className="reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cream px-6 py-3.5 text-lg font-600 text-emerald ring-1 ring-hairline transition-colors hover:bg-emerald/5"
            >
              {t.nav.contact}
              <BackIcon className="h-4 w-4" />
            </button>
          </div>
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
