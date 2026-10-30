import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Route } from '@/lib/router';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/index.tsx';
import { EASE } from '@/lib/motion';

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
  const reduced = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = '';
  };

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-600 min-h-[44px]';
  const styles =
    variant === 'primary'
      ? 'bg-emerald text-cream-50 shadow-soft'
      : 'bg-surface text-emerald ring-1 ring-hairline hover:bg-emerald/5';
  return (
    <motion.button
      ref={ref}
      onClick={() => navigate(to)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={`${base} ${styles} ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)' }}
    >
      {text}
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}
