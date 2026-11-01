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
  const pulseId = useRef(0);

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
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = pulseId.current++;
    const pulse = document.createElement('span');
    pulse.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.4);pointer-events:none;animation:btn-pulse 600ms cubic-bezier(0.22,1,0.36,1) forwards;`;
    pulse.dataset.pulseId = String(id);
    ref.current.appendChild(pulse);
    setTimeout(() => pulse.remove(), 600);
    navigate(to);
  };

  const base =
    'relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-600 min-h-[44px]';
  const styles =
    variant === 'primary'
      ? 'bg-emerald text-cream-50 shadow-soft'
      : 'bg-surface text-emerald ring-1 ring-hairline hover:bg-emerald/5';

  const shimmerDir = dir === 'rtl' ? -1 : 1;

  return (
    <>
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
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(${shimmerDir === 1 ? 90 : 270}deg, transparent 35%, var(--glow-blue) 50%, transparent 65%)`,
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
      <style>{`
        @keyframes btn-pulse {
          0% { width:0; height:0; opacity:0.6; }
          100% { width:300px; height:300px; margin:-150px 0 0 -150px; opacity:0; }
        }
        .group:hover > span[style*="glow-blue"] { opacity:0.7 !important; animation: btn-shimmer 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes btn-shimmer {
          from { background-position: 150% 0; }
          to { background-position: -150% 0; }
        }
      `}</style>
    </>
  );
}
