import type { Route } from '@/lib/router';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/index.tsx';

export function CtaButton({
  navigate,
  to = '/contact',
  label,
  variant = 'primary',
  className = '',
}: {
  navigate: (to: Route) => void;
  to?: Route;
  label?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const { t, dir } = useI18n();
  const text = label ?? t.common.ctaText;
  const Icon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-600 transition-transform hover:scale-[1.03] active:scale-95 min-h-[44px]';
  const styles =
    variant === 'primary'
      ? 'bg-emerald text-cream-50 shadow-soft'
      : 'bg-surface text-emerald ring-1 ring-hairline hover:bg-emerald/5';
  return (
    <button
      onClick={() => navigate(to)}
      className={`${base} ${styles} ${className}`}
    >
      {text}
      <Icon className="h-4 w-4" />
    </button>
  );
}
