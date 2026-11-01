import { useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

const PATH_WIDTH = 280;
const PATH_HEIGHT = 20;

export function CableDivider({ flip = false }: { flip?: boolean }) {
  const reduced = useReducedMotion();
  const dir = typeof document !== 'undefined' ? document.documentElement.dir : 'ltr';
  const isRtl = dir === 'rtl';

  const sweepFrom = isRtl ? '150%' : '-150%';

  const pathD = flip
    ? `M0 18 Q ${PATH_WIDTH / 4} 2, ${PATH_WIDTH / 2} 10 T ${PATH_WIDTH} 4`
    : `M0 4 Q ${PATH_WIDTH / 4} 16, ${PATH_WIDTH / 2} 8 T ${PATH_WIDTH} 14`;

  const nodePoints = [
    { cx: 0, cy: flip ? 18 : 4 },
    { cx: PATH_WIDTH / 2, cy: flip ? 10 : 8 },
    { cx: PATH_WIDTH, cy: flip ? 4 : 14 },
  ];

  return (
    <div className="pointer-events-none flex justify-center" aria-hidden="true">
      <svg
        width={PATH_WIDTH}
        height={PATH_HEIGHT}
        viewBox={`0 0 ${PATH_WIDTH} ${PATH_HEIGHT}`}
        fill="none"
        className="overflow-visible"
      >
        <path
          d={pathD}
          stroke="var(--hairline, #E7E3DA)"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={
            reduced
              ? { strokeDasharray: 'none' }
              : {
                  strokeDasharray: 600,
                  strokeDashoffset: 600,
                  animation: `cable-draw 0.8s cubic-bezier(0.22,1,0.36,1) forwards`,
                }
          }
        />
        <path
          d={pathD}
          stroke="var(--glow-blue)"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.5}
          style={
            reduced
              ? { opacity: 0 }
              : {
                  strokeDasharray: 600,
                  strokeDashoffset: 600,
                  animation: `cable-draw-glow 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s forwards`,
                }
          }
        />
        {nodePoints.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={2.5}
            fill="var(--emerald, #1F3D36)"
            style={
              reduced
                ? { opacity: 1 }
                : {
                    opacity: 0,
                    animation: `node-pop 0.4s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.15}s forwards`,
                  }
            }
          />
        ))}
      </svg>
      <style>{`
        @keyframes cable-draw { to { stroke-dashoffset: 0; } }
        @keyframes cable-draw-glow { to { stroke-dashoffset: 0; } }
        @keyframes node-pop { to { opacity: 1; } }
      `}</style>
    </div>
  );
}
