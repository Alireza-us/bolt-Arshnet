import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

const SWEEP_DURATION = 0.45;
const CONTENT_DURATION = 0.35;
const SLIDE_DISTANCE = 16;

export function PageTransition({ routeKey, children }: { routeKey: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const dir = typeof document !== 'undefined' ? document.documentElement.dir : 'ltr';
  const isRtl = dir === 'rtl';

  const sweepX = isRtl ? ['-100%', '100%'] : ['-100%', '100%'];

  return (
    <>
      {!reduced && (
        <motion.div
          key={`sweep-${routeKey}`}
          initial={{ x: sweepX[0], opacity: 0 }}
          animate={{ x: sweepX[1], opacity: [0, 1, 0] }}
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
        initial={{ opacity: 0, y: reduced ? 0 : SLIDE_DISTANCE }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: CONTENT_DURATION, ease: EASE, delay: reduced ? 0 : 0.15 }}
      >
        {children}
      </motion.div>
    </>
  );
}
