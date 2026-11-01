import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

const PATH_WIDTH = 280;
const PATH_HEIGHT = 20;
const DRAW_DURATION = 0.8;
const GLOW_DELAY = 0.1;

export function CableDivider({ flip = false }: { flip?: boolean }) {
  const reduced = useReducedMotion();

  const pathD = flip
    ? `M0 18 Q ${PATH_WIDTH / 4} 2, ${PATH_WIDTH / 2} 10 T ${PATH_WIDTH} 4`
    : `M0 4 Q ${PATH_WIDTH / 4} 16, ${PATH_WIDTH / 2} 8 T ${PATH_WIDTH} 14`;

  const nodePoints = [
    { cx: 0, cy: flip ? 18 : 4 },
    { cx: PATH_WIDTH / 2, cy: flip ? 10 : 8 },
    { cx: PATH_WIDTH, cy: flip ? 4 : 14 },
  ];

  return (
    <div className="pointer-events-none flex justify-center py-2" aria-hidden="true">
      <svg
        width={PATH_WIDTH}
        height={PATH_HEIGHT}
        viewBox={`0 0 ${PATH_WIDTH} ${PATH_HEIGHT}`}
        fill="none"
        className="overflow-visible"
      >
        <motion.path
          d={pathD}
          stroke="var(--hairline, #E7E3DA)"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: DRAW_DURATION, ease: EASE }}
        />
        <motion.path
          d={pathD}
          stroke="var(--glow-blue)"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
          initial={reduced ? { pathLength: 0, opacity: 0 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.5 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            pathLength: { duration: DRAW_DURATION, ease: EASE, delay: GLOW_DELAY },
            opacity: { duration: 0.3, delay: GLOW_DELAY },
          }}
        />
        {nodePoints.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={2.5}
            fill="var(--emerald, #1F3D36)"
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.15 }}
          />
        ))}
      </svg>
    </div>
  );
}
