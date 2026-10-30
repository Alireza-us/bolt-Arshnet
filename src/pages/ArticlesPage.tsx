import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Clock, Tag } from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useReveal } from '@/lib/useReveal';
import { useI18n } from '@/lib/i18n/index.tsx';
import { ARTICLES } from '@/lib/articles';

export function ArticlesPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, locale, dir, digits } = useI18n();
  const a = t.articles;
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

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
  useReveal();

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 pt-16 sm:pt-20">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-8xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-700 leading-[1.12] text-white sm:text-4xl lg:text-5xl">
              {a.title}
            </h1>
            <p className="mt-4 text-lg text-slate-300">{a.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-12 sm:py-16">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-2 text-sm font-600 transition-colors ${
                  active === cat
                    ? 'bg-accent text-white'
                    : 'border border-white/10 bg-navy-800 text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((art, i) => (
              <button
                key={art.slug}
                onClick={() => navigate(`/articles/${art.slug}`)}
                className="reveal group flex flex-col rounded-2xl border border-white/10 bg-navy-800 p-6 text-left transition-all hover:-translate-y-1 hover:border-accent/40"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-600 text-accent-100">
                    <Tag className="h-3 w-3" />
                    {art.category[locale]}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-700 leading-snug text-white group-hover:text-accent-100">
                  {art.title[locale]}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                  {art.excerpt[locale]}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-500">
                  <span>{formatDate(art.date, locale)}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {digits(String(art.readingTime))} {a.readingTime}
                  </span>
                </div>
              </button>
            ))}
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
