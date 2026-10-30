import { useEffect, useState } from 'react';

export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed z-[55] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 transition-opacity duration-300"
      style={{
        left: pos.x,
        top: pos.y,
        background: 'radial-gradient(circle, rgba(47,107,255,0.15) 0%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  );
}
