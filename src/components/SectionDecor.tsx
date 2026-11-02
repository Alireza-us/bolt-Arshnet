import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

const ACCENT = 'rgba(31, 61, 54, 0.08)';
const ACCENT_STRONG = 'rgba(31, 61, 54, 0.12)';
const GLOW = 'var(--glow-blue)';

type Variant = 'packet' | 'hex' | 'ping' | 'orbit' | 'crosshair';

const variantOrder: Variant[] = ['packet', 'hex', 'ping', 'orbit', 'crosshair'];

export function SectionDecor({
  variant,
  className = '',
}: {
  variant: Variant;
  className?: string;
}) {
  const reduced = useReducedMotion();

  const containerProps = {
    initial: reduced ? { opacity: 1 } : { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.7, ease: EASE },
  };

  return (
    <motion.div
      {...containerProps}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {variant === 'packet' && <PacketGrid reduced={!!reduced} />}
      {variant === 'hex' && <HexCells reduced={!!reduced} />}
      {variant === 'ping' && <PingRings reduced={!!reduced} />}
      {variant === 'orbit' && <OrbitArcs reduced={!!reduced} />}
      {variant === 'crosshair' && <CrosshairGlyph reduced={!!reduced} />}
    </motion.div>
  );
}

export function pickVariant(index: number): Variant {
  return variantOrder[index % variantOrder.length];
}

function PacketGrid({ reduced }: { reduced: boolean }) {
  const COLS = 12;
  const ROWS = 4;
  const dots = Array.from({ length: COLS * ROWS }, (_, i) => ({
    cx: (i % COLS) * (100 / COLS) + 100 / (COLS * 2),
    cy: Math.floor(i / COLS) * (100 / ROWS) + 100 / (ROWS * 2),
    delay: (i % 5) * 0.4,
  }));

  return (
    <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={0.4} fill={ACCENT_STRONG} />
      ))}
      {!reduced && dots.map((d, i) => (
        <motion.circle
          key={`p-${i}`}
          cx={d.cx}
          cy={d.cy}
          r={0.6}
          fill={GLOW}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

function HexCells({ reduced }: { reduced: boolean }) {
  const cells = [
    { x: 80, y: 15, r: 8 },
    { x: 88, y: 25, r: 5 },
    { x: 75, y: 28, r: 6 },
    { x: 92, y: 12, r: 4 },
  ];

  return (
    <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none">
      {cells.map((c, i) => {
        const pts = hexPoints(c.x, c.y, c.r);
        return (
          <polygon
            key={i}
            points={pts}
            stroke={ACCENT}
            strokeWidth={0.3}
            fill="none"
          />
        );
      })}
    </svg>
  );
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}

function PingRings({ reduced }: { reduced: boolean }) {
  const rings = [
    { cx: 85, cy: 20, r: 4, delay: 0 },
    { cx: 85, cy: 20, r: 7, delay: 0.6 },
    { cx: 85, cy: 20, r: 10, delay: 1.2 },
  ];

  return (
    <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none">
      {!reduced ? rings.map((r, i) => (
        <motion.circle
          key={i}
          cx={r.cx}
          cy={r.cy}
          r={r.r}
          stroke={GLOW}
          strokeWidth={0.2}
          fill="none"
          initial={{ opacity: 0.6, scale: 0.5 }}
          animate={{ opacity: [0.6, 0, 0], scale: [0.5, 1.2, 1.2] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: r.delay, ease: 'easeOut' }}
          style={{ transformOrigin: `${r.cx}px ${r.cy}px` }}
        />
      )) : rings.map((r, i) => (
        <circle key={i} cx={r.cx} cy={r.cy} r={r.r} stroke={ACCENT} strokeWidth={0.2} fill="none" />
      ))}
    </svg>
  );
}

function OrbitArcs({ reduced }: { reduced: boolean }) {
  const arcs = [
    { cx: 50, cy: 50, r: 30, delay: 0 },
    { cx: 50, cy: 50, r: 22, delay: 0.8 },
    { cx: 50, cy: 50, r: 14, delay: 1.6 },
  ];

  return (
    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none">
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={a.cx}
          cy={a.cy}
          r={a.r}
          stroke={ACCENT}
          strokeWidth={0.15}
          strokeDasharray="2 1.5"
          fill="none"
          style={!reduced ? {
            animation: `orbit-rotate ${20 + i * 8}s linear infinite`,
            transformOrigin: `${a.cx}px ${a.cy}px`,
          } : undefined}
        />
      ))}
      <style>{`@keyframes orbit-rotate { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function CrosshairGlyph({ reduced }: { reduced: boolean }) {
  const markers = [
    { x: 82, y: 12 },
    { x: 92, y: 28 },
    { x: 72, y: 30 },
  ];

  return (
    <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none">
      {markers.map((m, i) => (
        <g key={i}>
          <line x1={m.x - 2} y1={m.y} x2={m.x + 2} y2={m.y} stroke={ACCENT} strokeWidth={0.3} />
          <line x1={m.x} y1={m.y - 2} x2={m.x} y2={m.y + 2} stroke={ACCENT} strokeWidth={0.3} />
          <rect x={m.x - 1.5} y1={m.y + 3} width={0.6} height={2.5} fill={ACCENT_STRONG} />
          <rect x={m.x - 0.3} y1={m.y + 3} width={0.6} height={1.5} fill={ACCENT_STRONG} />
          <rect x={m.x + 0.9} y1={m.y + 3} width={0.6} height={3.5} fill={ACCENT_STRONG} />
        </g>
      ))}
    </svg>
  );
}
