import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

const DOT_COLOR = 'rgba(31, 61, 54, 0.10)';
const DOT_COLOR_PEAK = 'rgba(31, 61, 54, 0.35)';
const GLOW_COLOR = 'rgba(110, 168, 255, 0.25)';
const SPACING = 28;
const MIN_DURATION = 2.5;
const MAX_DURATION = 6;
const MIN_DELAY = 0;
const MAX_DELAY = 4;
const MIN_OPACITY = 0.15;
const MAX_OPACITY = 1;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.15;

type Dot = {
  cx: number;
  cy: number;
  duration: number;
  delay: number;
};

export function TwinkleDots({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();

  const dots = useMemo(() => {
    const cols = Math.ceil(100 / SPACING) + 2;
    const rows = Math.ceil(80 / SPACING) + 2;
    const arr: Dot[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.65) continue;
        arr.push({
          cx: c * SPACING + Math.random() * 4,
          cy: r * SPACING + Math.random() * 4,
          duration: MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION),
          delay: MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY),
        });
      }
    }
    return arr;
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg className="h-full w-full" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice" fill="none">
        {dots.map((d, i) =>
          reduced ? (
            <circle key={i} cx={d.cx} cy={d.cy} r={0.5} fill={DOT_COLOR} />
          ) : (
            <motion.circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r={0.5}
              fill={DOT_COLOR_PEAK}
              initial={{ opacity: MIN_OPACITY, scale: MIN_SCALE }}
              animate={{ opacity: [MIN_OPACITY, MAX_OPACITY, MIN_OPACITY], scale: [MIN_SCALE, MAX_SCALE, MIN_SCALE] }}
              transition={{
                duration: d.duration,
                delay: d.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: `${d.cx}px ${d.cy}px`, filter: `drop-shadow(0 0 1px ${GLOW_COLOR})` }}
            />
          ),
        )}
      </svg>
    </div>
  );
}
