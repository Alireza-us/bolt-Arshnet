import { useEffect, useRef } from 'react';

const DESKTOP_NODE_COUNT = 45;
const MOBILE_NODE_COUNT = 20;
const LINK_DISTANCE = 190;
const ATTRACTION_RADIUS = 300;
const SPRING_STRENGTH = 0.0009;
const MAX_DISPLACEMENT = 54;
const MAX_NODES = 70;
const NODE_DRIFT = 0.16;
const DPR_CAP = 2;
const GLOW_BLUE = 'rgba(110, 168, 255, 1)';
const LINE_BLUE = 'rgba(110, 168, 255,';
const RING_DURATION = 900;
const BRIGHTEN_DURATION = 1200;
const AMBIENT_PACKET_INTERVAL = 4200;
const PACKET_SPEED = 0.0032;

type NodePoint = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  twinkle: number;
  spawnedAt: number;
  fading: boolean;
  fadeStartedAt: number;
};

type Packet = {
  from: NodePoint;
  to: NodePoint;
  progress: number;
  chain: number;
};

type Pulse = {
  x: number;
  y: number;
  startedAt: number;
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function distanceBetween(a: NodePoint, b: NodePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function InteractiveNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const nodes: NodePoint[] = [];
    const packets: Packet[] = [];
    const pulses: Pulse[] = [];
    const pointer = { x: 0, y: 0, active: false };
    const glowSprite = document.createElement('canvas');
    const glowContext = glowSprite.getContext('2d');
    const glowSize = 96;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let visible = true;
    let lastFrame = performance.now();
    let lastAmbientPacket = lastFrame;
    let lastClick = 0;
    let brightenStartedAt = 0;
    let seed = Math.random() * 1000;

    if (glowContext) {
      glowSprite.width = glowSize;
      glowSprite.height = glowSize;
      const glow = glowContext.createRadialGradient(glowSize / 2, glowSize / 2, 0, glowSize / 2, glowSize / 2, glowSize / 2);
      glow.addColorStop(0, GLOW_BLUE);
      glow.addColorStop(0.18, 'rgba(110, 168, 255, 0.52)');
      glow.addColorStop(0.55, 'rgba(110, 168, 255, 0.1)');
      glow.addColorStop(1, 'rgba(110, 168, 255, 0)');
      glowContext.fillStyle = glow;
      glowContext.fillRect(0, 0, glowSize, glowSize);
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (nodes.length === 0) {
        const count = width <= 720 ? MOBILE_NODE_COUNT : DESKTOP_NODE_COUNT;
        for (let i = 0; i < count; i += 1) {
          const x = randomBetween(24, Math.max(25, width - 24));
          const y = randomBetween(24, Math.max(25, height - 24));
          nodes.push({
            x,
            y,
            homeX: x,
            homeY: y,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
            speed: randomBetween(0.00025, 0.00065),
            twinkle: randomBetween(0.7, 1.3),
            spawnedAt: 0,
            fading: false,
            fadeStartedAt: 0,
          });
        }
      }
    }

    function nearestNeighbors(source: NodePoint, count: number): NodePoint[] {
      return nodes
        .filter((node) => node !== source && !node.fading)
        .sort((a, b) => distanceBetween(source, a) - distanceBetween(source, b))
        .slice(0, count);
    }

    function addPacket(from: NodePoint, to: NodePoint, chain = 0) {
      if (reducedMotion || packets.length > 18 || from === to) return;
      packets.push({ from, to, progress: 0, chain });
    }

    function spawnNode(x: number, y: number, now: number) {
      const newNode: NodePoint = {
        x,
        y,
        homeX: x,
        homeY: y,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        speed: randomBetween(0.00035, 0.0007),
        twinkle: randomBetween(0.9, 1.3),
        spawnedAt: now,
        fading: false,
        fadeStartedAt: 0,
      };
      if (nodes.length >= MAX_NODES) {
        const oldest = nodes.find((node) => node.spawnedAt > 0 && !node.fading);
        if (oldest) {
          oldest.fading = true;
          oldest.fadeStartedAt = now;
        }
      }
      nodes.push(newNode);
      nearestNeighbors(newNode, 3).forEach((neighbor) => addPacket(newNode, neighbor));
      pulses.push({ x, y, startedAt: now });
    }

    function handlePointerMove(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest('a, button, input, textarea, select, label, summary, [role="button"], [tabindex], [data-no-spawn]');
      if (interactive) return;
      const now = performance.now();
      if (now - lastClick < 140) return;
      lastClick = now;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      brightenStartedAt = now;
      if (!reducedMotion) spawnNode(event.clientX, event.clientY, now);
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handleVisibilityChange() {
      running = !document.hidden && visible;
      if (running) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(raf);
      }
    }

    function updateVisibility(entries: IntersectionObserverEntry[]) {
      visible = entries[0]?.isIntersecting ?? true;
      running = !document.hidden && visible;
      if (running) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(raf);
      }
    }

    function drawGlow(x: number, y: number, size: number, alpha: number, emerald = false) {
      if (!glowContext) return;
      context.save();
      context.globalAlpha = alpha;
      if (emerald) {
        glowContext.globalCompositeOperation = 'source-over';
      }
      context.drawImage(glowSprite, x - size / 2, y - size / 2, size, size);
      context.restore();
    }

    function draw(now: number) {
      context.clearRect(0, 0, width, height);
      const brighten = brightenStartedAt ? Math.max(0, 1 - (now - brightenStartedAt) / BRIGHTEN_DURATION) : 0;
      const liveNodes = nodes.filter((node) => !node.fading);

      for (let i = 0; i < liveNodes.length; i += 1) {
        for (let j = i + 1; j < liveNodes.length; j += 1) {
          const from = liveNodes[i];
          const to = liveNodes[j];
          const distance = distanceBetween(from, to);
          if (distance > LINK_DISTANCE) continue;
          const opacity = (1 - distance / LINK_DISTANCE) * 0.16 + brighten * 0.12;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.strokeStyle = `${LINE_BLUE}${opacity})`;
          context.lineWidth = 0.65;
          context.stroke();
        }
      }

      packets.forEach((packet) => {
        const x = packet.from.x + (packet.to.x - packet.from.x) * packet.progress;
        const y = packet.from.y + (packet.to.y - packet.from.y) * packet.progress;
        drawGlow(x, y, 22, 0.65);
        context.beginPath();
        context.arc(x, y, 1.35, 0, Math.PI * 2);
        context.fillStyle = '#B9D5FF';
        context.fill();
      });

      liveNodes.forEach((node, index) => {
        const pulse = 0.72 + Math.sin(now * node.speed * node.twinkle + node.phase) * 0.2;
        const nearPointer = !coarsePointer && pointer.active ? Math.max(0, 1 - Math.hypot(node.x - pointer.x, node.y - pointer.y) / ATTRACTION_RADIUS) : 0;
        const alpha = Math.min(0.88, pulse * 0.48 + nearPointer * 0.32 + brighten * 0.3);
        drawGlow(node.x, node.y, nearPointer > 0.25 ? 32 : 23, alpha * 0.45, index % 11 === 0);
        context.beginPath();
        context.arc(node.x, node.y, nearPointer > 0.2 ? 1.65 : 1.15, 0, Math.PI * 2);
        context.fillStyle = index % 11 === 0 ? `rgba(59, 190, 145, ${alpha * 0.7})` : `rgba(164, 202, 255, ${alpha})`;
        context.fill();
      });

      pulses.forEach((pulse) => {
        const progress = Math.min(1, (now - pulse.startedAt) / RING_DURATION);
        context.beginPath();
        context.arc(pulse.x, pulse.y, 5 + progress * 34, 0, Math.PI * 2);
        context.strokeStyle = `rgba(110, 168, 255, ${(1 - progress) * 0.42})`;
        context.lineWidth = 1;
        context.stroke();
      });
    }

    function update(now: number) {
      const delta = Math.min(32, now - lastFrame);
      const time = now * 0.001;
      const liveNodes = nodes.filter((node) => !node.fading);

      liveNodes.forEach((node, index) => {
        if (reducedMotion) return;
        const driftX = Math.sin(time * node.speed * 1000 + node.phase) * NODE_DRIFT;
        const driftY = Math.cos(time * node.speed * 850 + node.phase * 1.7) * NODE_DRIFT;
        const homeX = node.homeX + driftX;
        const homeY = node.homeY + driftY;
        let forceX = (homeX - node.x) * 0.0012;
        let forceY = (homeY - node.y) * 0.0012;
        if (!reducedMotion && !coarsePointer && pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance < ATTRACTION_RADIUS && distance > 0) {
            const strength = (1 - distance / ATTRACTION_RADIUS) * SPRING_STRENGTH;
            forceX += dx * strength;
            forceY += dy * strength;
          }
        }
        node.vx = (node.vx + forceX * delta) * 0.94;
        node.vy = (node.vy + forceY * delta) * 0.94;
        node.x += node.vx * delta;
        node.y += node.vy * delta;
        const offsetX = node.x - node.homeX;
        const offsetY = node.y - node.homeY;
        const offset = Math.hypot(offsetX, offsetY);
        if (offset > MAX_DISPLACEMENT) {
          node.x = node.homeX + (offsetX / offset) * MAX_DISPLACEMENT;
          node.y = node.homeY + (offsetY / offset) * MAX_DISPLACEMENT;
          node.vx *= 0.5;
          node.vy *= 0.5;
        }
        if (index % 12 === 0) seed += 0.0001;
      });

      nodes.forEach((node) => {
        if (node.fading && now - node.fadeStartedAt > 650) {
          const index = nodes.indexOf(node);
          if (index >= 0) nodes.splice(index, 1);
        }
      });

      if (!reducedMotion) {
        for (let i = packets.length - 1; i >= 0; i -= 1) {
          const packet = packets[i];
          packet.progress += delta * PACKET_SPEED;
          if (packet.progress >= 1) {
            packets.splice(i, 1);
            if (packet.chain < 2 && Math.random() < 0.35) {
              const next = nearestNeighbors(packet.to, 1)[0];
              if (next) addPacket(packet.to, next, packet.chain + 1);
            }
          }
        }
        if (now - lastAmbientPacket > AMBIENT_PACKET_INTERVAL && liveNodes.length > 1) {
          const from = liveNodes[Math.floor(Math.random() * liveNodes.length)];
          const to = nearestNeighbors(from, 3)[Math.floor(Math.random() * 3)];
          if (to) addPacket(from, to);
          lastAmbientPacket = now;
        }
      }

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        if (now - pulses[i].startedAt > RING_DURATION) pulses.splice(i, 1);
      }
    }

    function animate(now: number) {
      if (!running) return;
      update(now);
      draw(now);
      lastFrame = now;
      raf = requestAnimationFrame(animate);
    }

    resize();
    const observer = new IntersectionObserver(updateVisibility);
    observer.observe(canvas);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    raf = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
}
