import { useEffect, useRef, useState } from 'react';

// ── Tunable constants ──────────────────────────────────────────────
const SEGMENT_COUNT = 26;
const SEGMENT_LENGTH = 8;
const CABLE_ANCHOR_DISTANCE = 20;
const DAMPING = 0.5508;
const IDLE_SWAY = 0.34;
const ROTATION_SMOOTHING = 0.12;
const CABLE_COLOR = '#1F3D36';
const HIGHLIGHT_COLOR = '#C8A15A';
const CABLE_WIDTH = 3;
const PLUG_SCALE = 1;
const HOVER_SCALE = 1;
const CLICK_SCALE = 1.3;
const LED_COLOR = '#22C55E';
const PULSE_DURATION = 600;
const FADE_DURATION = 300;

type Vec = { x: number; y: number };

export function NetworkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [active] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // ── Canvas setup ──────────────────────────────────────────────────
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    document.documentElement.classList.add('has-custom-cursor');
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // ── State ────────────────────────────────────────────────────────
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let mouseAngle = 0;
    let targetMouseAngle = 0;
    let mouseSpeed = 0;
    let mouseInside = false;
    let opacity = 0;
    let hovering = false;
    let clickPulse = 0;
    let clickTime = 0;
    let plugScale = PLUG_SCALE;
    let targetScale = PLUG_SCALE;
    let ledBlink = 0;

    // ── Verlet chain ─────────────────────────────────────────────────
    type Point = { x: number; y: number; px: number; py: number };
    const chain: Point[] = [];
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      chain.push({ x: mouseX - CABLE_ANCHOR_DISTANCE, y: mouseY, px: mouseX - CABLE_ANCHOR_DISTANCE, py: mouseY });
    }

    // ── Event handlers ──────────────────────────────────────────────
    function isInteractive(el: Element | null): boolean {
      if (!el) return false;
      return !!el.closest('a, button, [role="button"], summary, label[for], select, [data-clickable], .cursor-pointer');
    }

    function onPointerMove(e: PointerEvent) {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!mouseInside) opacity = 1;
      mouseInside = true;

      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      mouseSpeed = Math.sqrt(dx * dx + dy * dy);

      if (mouseSpeed > 1.5) {
        targetMouseAngle = Math.atan2(dy, dx);
      }

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const wasHovering = hovering;
      hovering = isInteractive(el);

      if (hovering !== wasHovering) {
        targetScale = hovering ? HOVER_SCALE : PLUG_SCALE;
      }

    }

    function onMouseDown() {
      clickPulse = 1;
      clickTime = performance.now();
      if (hovering) targetScale = CLICK_SCALE;
    }

    function onMouseUp() {
      targetScale = hovering ? HOVER_SCALE : PLUG_SCALE;
    }

    function onMouseLeave() {
      mouseInside = false;
    }

    function onMouseEnter(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseInside = true;
      opacity = 1;
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('resize', resize);

    // ── Animation loop ──────────────────────────────────────────────
    let raf = 0;
    let running = true;

    function updateChain() {
      // Head follows the exact rear point of the plug boot
      const anchorX = mouseX - Math.cos(mouseAngle) * CABLE_ANCHOR_DISTANCE * plugScale;
      const anchorY = mouseY - Math.sin(mouseAngle) * CABLE_ANCHOR_DISTANCE * plugScale;

      chain[0].x = anchorX;
      chain[0].y = anchorY;
      chain[0].px = anchorX;
      chain[0].py = anchorY;

      // Verlet constraints for rest of chain
      for (let i = 1; i < chain.length; i++) {
        const p = chain[i];

        // Inertia (verlet integration)
        const vx = (p.x - p.px) * DAMPING;
        const vy = (p.y - p.py) * DAMPING;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy;

        // Idle sway — subtle sine wave when cursor is still
        if (mouseSpeed < 0.5 && !reducedMotion) {
          const t = performance.now() * 0.001;
          const swayAmount = IDLE_SWAY * (1 - i / chain.length);
          p.x += Math.sin(t + i * 0.3) * swayAmount;
          p.y += Math.cos(t + i * 0.2) * swayAmount;
        }

        // Distance constraint
        const prev = chain[i - 1];
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const diff = (dist - SEGMENT_LENGTH) / dist;
        p.x -= dx * diff;
        p.y -= dy * diff;
      }

      // Multiple passes for stability
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 1; i < chain.length; i++) {
          const p = chain[i];
          const prev = chain[i - 1];
          const dx = p.x - prev.x;
          const dy = p.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const diff = (dist - SEGMENT_LENGTH) / dist;
          p.x -= dx * diff;
          p.y -= dy * diff;
        }

        // Keep the head immovable during constraint passes
        chain[0].x = anchorX;
        chain[0].y = anchorY;
        chain[0].px = anchorX;
        chain[0].py = anchorY;
      }
    }

    function drawCable() {
      if (reducedMotion) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = opacity;

      // Draw cable as smooth curve
      const points = chain.map((p) => ({ x: p.x, y: p.y }));

      // Main cable
      ctx.strokeStyle = CABLE_COLOR;
      ctx.lineWidth = CABLE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();

      // Champagne highlight (thin line offset slightly)
      ctx.strokeStyle = HIGHLIGHT_COLOR;
      ctx.lineWidth = 1;
      ctx.globalAlpha = opacity * 0.4;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.globalAlpha = opacity;

      // Draw click pulse
      if (clickPulse > 0) {
        const elapsed = performance.now() - clickTime;
        const progress = elapsed / PULSE_DURATION;
        if (progress < 1) {
          const radius = 10 + progress * 50;
          ctx.strokeStyle = CABLE_COLOR;
          ctx.lineWidth = 2;
          ctx.globalAlpha = opacity * (1 - progress) * 0.6;
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = opacity;
        } else {
          clickPulse = 0;
        }
      }

      ctx.globalAlpha = 1;
    }

    function updatePlug() {
      if (!svgRef.current) return;

      // Smooth scale lerp
      plugScale += (targetScale - plugScale) * 0.18;

      // LED blink when hovering
      if (hovering) {
        ledBlink += 0.08;
      } else {
        ledBlink = 0;
      }

      // Position the SVG plug at the mouse position
      // The tip (right side) points toward movement direction
      const angleDeg = (mouseAngle * 180) / Math.PI;
      const ledOpacity = hovering ? 0.5 + Math.sin(ledBlink) * 0.5 : 0;

      // Use a top-left transform origin so the center stays pinned to the mouse
      svgRef.current.style.transformOrigin = '0 0';
      svgRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) rotate(${angleDeg}deg) scale(${plugScale}) translate(-50%, -50%)`;
      svgRef.current.style.opacity = String(opacity);
      svgRef.current.style.filter = hovering
        ? 'drop-shadow(0 0 3px rgba(110, 168, 255, 0.45)) drop-shadow(0 0 8px rgba(110, 168, 255, 0.25))'
        : 'none';

      const ringEl = svgRef.current.querySelector('[data-hover-ring]');
      if (ringEl) ringEl.setAttribute('opacity', hovering ? '0.55' : '0');

      // Update LED
      const ledEl = svgRef.current.querySelector('[data-led]');
      if (ledEl) {
        ledEl.setAttribute('opacity', String(ledOpacity));
      }
    }

    function animate() {
      if (!running) return;

      // Fade in/out
      const targetOpacity = mouseInside ? (hovering ? 0.4 : 1) : 0;
      opacity += (targetOpacity - opacity) * 0.1;

      // Smooth rotation using the shortest angular path
      const angleDelta = Math.atan2(
        Math.sin(targetMouseAngle - mouseAngle),
        Math.cos(targetMouseAngle - mouseAngle)
      );
      mouseAngle += angleDelta * ROTATION_SMOOTHING;

      // Decay mouse speed
      mouseSpeed *= 0.765;

      if (!reducedMotion) {
        updateChain();
        drawCable();
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      updatePlug();

      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    function onVisChange() {
      if (document.hidden) {
        running = false;
        mouseInside = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        mouseInside = true;
        raf = requestAnimationFrame(animate);
      }
    }
    document.addEventListener('visibilitychange', onVisChange);

    // ── Cleanup ─────────────────────────────────────────────────────
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisChange);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[2147483646]"
        aria-hidden="true"
      />
      <div
        ref={svgRef}
        className="pointer-events-none fixed left-0 top-0 z-[2147483647] network-cursor-head"
        style={{ opacity: 0, willChange: 'transform, opacity, filter', transformOrigin: '0 0', transition: 'filter 180ms ease' }}
        aria-hidden="true"
      >
        <svg width="44" height="26" viewBox="0 0 44 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="13" r="17" fill="none" stroke="rgba(110, 168, 255, 0.45)" strokeWidth="0.7" opacity="0" data-hover-ring style={{ transition: 'opacity 180ms ease' }} />
          {/* Cable-side strain relief */}
          <path
            d="M2 8 L12 6 V20 L2 18 Z"
            fill="#1F3D36"
            fillOpacity="0.12"
            stroke="#1F3D36"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Translucent clip tab */}
          <path
            d="M13 6 L21 2 H31 L34 10 H27 L24 7 H13 Z"
            fill="#1F3D36"
            fillOpacity="0.12"
            stroke="#1F3D36"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Plug body */}
          <path
            d="M12 4 H37 L42 8 V18 L37 22 H12 Z"
            fill="#E7E3DA"
            stroke="#1F3D36"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Gold contact pins at the pointer-facing tip */}
          <line x1="37" y1="8" x2="42" y2="8" stroke="#C8A15A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="37" y1="11" x2="42" y2="11" stroke="#C8A15A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="37" y1="14" x2="42" y2="14" stroke="#C8A15A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="37" y1="17" x2="42" y2="17" stroke="#C8A15A" strokeWidth="1.5" strokeLinecap="round" />
          {/* LED indicator */}
          <circle data-led cx="30" cy="7" r="1.5" fill="#22C55E" opacity="0" />
        </svg>
      </div>
    </>
  );
}