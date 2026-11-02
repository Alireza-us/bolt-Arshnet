import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Route } from '@/lib/router';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/index.tsx';
import { EASE } from '@/lib/motion';

const PULSE_DURATION = 600;
const SHIMMER_DURATION = 0.7;

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

  const handleClick = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pulse = document.createElement('span');
    pulse.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.4);pointer-events:none;animation:btn-pulse ${PULSE_DURATION}ms cubic-bezier(0.22,1,0.36,1) forwards;`;
    ref.current.appendChild(pulse);
    setTimeout(() => pulse.remove(), PULSE_DURATION);
    navigate(to);
  };

  const base =
    'btn-shimmer group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-600 min-h-[44px]';
  const styles =
    variant === 'primary'
      ? 'bg-emerald text-cream-50 shadow-soft'
      : 'bg-surface text-emerald ring-1 ring-hairline hover:bg-emerald/5';

  const shimmerDeg = dir === 'rtl' ? 270 : 90;

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={`${base} ${styles} ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)' }}
    >
      {!reduced && (
        <span
          className="btn-shimmer-sweep pointer-events-none absolute inset-0 opacity-0"
          style={{
            background: `linear-gradient(${shimmerDeg}deg, transparent 35%, var(--glow-blue) 50%, transparent 65%)`,
            backgroundSize: '250% 100%',
          }}
          aria-hidden="true"
        />
      )}
      <span className="led-dot absolute start-2 top-1/2 -translate-y-1/2" />
      <span className="relative flex items-center gap-2">
        {text}
        <Icon className="h-4 w-4" />
      </span>
    </motion.button>
  );
}
