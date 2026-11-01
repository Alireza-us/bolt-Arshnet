import { useRef, useState, useCallback } from 'react';

const GLOW_DURATION = 700;
const GLOW_RADIUS = 120;

type Glow = { id: number; x: number; y: number };

export function GlowText({
  children,
  onClick,
  className = '',
  as: Tag = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  as?: 'button' | 'a' | 'span';
}) {
  const ref = useRef<HTMLElement>(null);
  const [glows, setGlows] = useState<Glow[]>([]);
  const idRef = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = idRef.current++;
      setGlows((g) => [...g, { id, x, y }]);
      el.classList.add('glow-text-active');
      window.setTimeout(() => {
        setGlows((g) => g.filter((gl) => gl.id !== id));
        el.classList.remove('glow-text-active');
      }, GLOW_DURATION);
      onClick?.();
    },
    [onClick],
  );

  return (
    <Tag
      ref={ref as never}
      onClick={handleClick}
      onMouseMove={(e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }}
      className={`spotlight relative overflow-hidden ${className}`}
    >
      {children}
      {glows.map((g) => (
        <span
          key={g.id}
          className="pointer-events-none absolute rounded-full glow-pop"
          style={{
            left: g.x - GLOW_RADIUS,
            top: g.y - GLOW_RADIUS,
            width: GLOW_RADIUS * 2,
            height: GLOW_RADIUS * 2,
            background: 'radial-gradient(circle, var(--glow-blue), transparent 65%)',
          }}
        />
      ))}
    </Tag>
  );
}
