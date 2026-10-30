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
      <section className="bg-navy-900 py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-700 text-white">404</h1>
          <p className="mt-3 text-slate-400">Article not found.</p>
          <button
            onClick={() => navigate('/articles')}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-base font-600 text-white"
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
      <section className="relative overflow-hidden bg-navy-900 pt-14 sm:pt-16">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/articles')}
            className="reveal inline-flex items-center gap-1.5 text-sm font-600 text-slate-400 transition-colors hover:text-white"
          >
            <BackIcon className="h-4 w-4" />
            {a.backToList}
          </button>

          <div className="reveal mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-600 text-accent-100">
              <Tag className="h-3 w-3" />
              {article.category[locale]}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(article.date, locale)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {digits(String(article.readingTime))} {a.readingTime}
            </span>
          </div>

          <h1 className="reveal mt-5 text-3xl font-700 leading-[1.15] text-white sm:text-4xl">
            {article.title[locale]}
          </h1>
          <p className="reveal mt-4 text-lg leading-relaxed text-slate-300">
            {article.excerpt[locale]}
          </p>
        </div>
      </section>

      <article className="bg-navy-900 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="reveal space-y-6">
            {article.body[locale].map((para, i) => (
              <p key={i} className="text-base leading-[1.8] text-slate-200 sm:text-lg">
                {para}
              </p>
            ))}
          </div>

          <div className="reveal mt-10 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              onClick={() => navigate('/articles')}
              className="inline-flex items-center gap-1.5 text-sm font-600 text-slate-400 transition-colors hover:text-white"
            >
              <BackIcon className="h-4 w-4" />
              {a.backToList}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-navy-800 px-4 py-2.5 text-sm font-600 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              {a.shareArticle}
            </button>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-navy-950 py-14 sm:py-16">
          <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
            <h2 className="reveal text-2xl font-700 text-white">{a.relatedTitle}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {related.map((rel, i) => (
                <button
                  key={rel.slug}
                  onClick={() => navigate(`/articles/${rel.slug}`)}
                  className="reveal group flex flex-col rounded-2xl border border-white/10 bg-navy-800 p-6 text-left transition-all hover:-translate-y-1 hover:border-accent/40"
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-600 text-accent-100">
                    <Tag className="h-3 w-3" />
                    {rel.category[locale]}
                  </span>
                  <h3 className="mt-4 text-lg font-700 text-white group-hover:text-accent-100">
                    {rel.title[locale]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {rel.excerpt[locale]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="reveal text-3xl font-700 leading-[1.15] text-white sm:text-4xl">
            {t.common.readyToStart}
          </h2>
          <p className="reveal mt-4 text-lg text-slate-300">{t.common.bookFreeConsult}</p>
          <div className="reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaButton navigate={navigate} className="px-6 py-3.5 text-lg" />
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-lg font-600 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
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
