import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

const SWEEP_DURATION = 0.45;
const CONTENT_DURATION = 0.35;
const CONTENT_DELAY = 0.15;
const SLIDE_DISTANCE = 16;

export function PageTransition({ routeKey, children }: { routeKey: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const dir = typeof document !== 'undefined' ? document.documentElement.dir : 'ltr';
  const isRtl = dir === 'rtl';

  // RTL: sweep right-to-left; LTR: sweep left-to-right
  const sweepInitial = isRtl ? '100%' : '-100%';
  const sweepTarget = isRtl ? '-100%' : '100%';

  // RTL: slide in from right; LTR: slide in from left
  const slideY = reduced ? 0 : isRtl ? -SLIDE_DISTANCE : SLIDE_DISTANCE;

  return (
    <>
      {!reduced && (
        <motion.div
          key={`sweep-${routeKey}`}
          initial={{ x: sweepInitial, opacity: 0 }}
          animate={{ x: sweepTarget, opacity: [0, 1, 0] }}
          transition={{ duration: SWEEP_DURATION, ease: EASE, times: [0, 0.3, 1] }}
          className="fixed inset-x-0 top-0 z-[60] h-0.5 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--glow-blue), transparent)',
          }}
          aria-hidden="true"
        />
      )}
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: slideY }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: CONTENT_DURATION, ease: EASE, delay: reduced ? 0 : CONTENT_DELAY }}
      >
        {children}
      </motion.div>
    </>
  );
}
