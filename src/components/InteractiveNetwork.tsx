import { useEffect, useRef } from 'react';

const DESKTOP_NODE_COUNT = 55;
const MOBILE_NODE_COUNT = 25;
const LINK_DISTANCE = 160;
const ATTRACTION_RADIUS = 260;
const SPRING_STRENGTH = 34;
const AMBIENT_MIN_SPEED = 4;
const AMBIENT_MAX_SPEED = 12;
const MAX_AMBIENT_SPEED = 14;
const MAX_ATTRACTION_SPEED = 60;
const DAMPING = 0.93;
const MAX_TEMPORARY_NODES = 8;
const TEMPORARY_LIFETIME = 5000;
const TEMPORARY_FADE_DURATION = 1500;
const TEMPORARY_FADE_IN = 500;
const TEMPORARY_BURST_DURATION = 1500;
const TEMPORARY_BURST_SPEED = 36;
const LINK_DRAW_DURATION = 600;
const RING_DURATION = 800;
const BRIGHTEN_DURATION = 1200;
const PACKET_SPEED = 220;
const GLOW_RADIUS = 13;
const NODE_CORE_RADIUS = 2.3;
const DPR_CAP = 2;
const GLOW_BLUE = 'rgba(110, 168, 255, 1)';
const LINE_BLUE = 'rgba(110, 168, 255,';
const EMERALD = 'rgba(59, 190, 145,';

type NodePoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  direction: number;
  speed: number;
  temporary: boolean;
  bornAt: number;
  fadeStartedAt: number | null;
  removeAt: number | null;
  burstX: number;
  burstY: number;
};

type TemporaryLink = {
  from: NodePoint;
  to: NodePoint;
  createdAt: number;
};

type Packet = {
  from: NodePoint;
  to: NodePoint;
  distance: number;
  travelled: number;
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function damp(value: number, amount: number): number {
  return Math.pow(amount, value * 60);
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
    const temporaryLinks: TemporaryLink[] = [];
    const packets: Packet[] = [];
    const pulses: Pulse[] = [];
    const pointer = { x: 0, y: 0, active: false };
    const glowSprite = document.createElement('canvas');
    const glowContext = glowSprite.getContext('2d');
    const glowSize = 64;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let lastFrame = performance.now();
    let lastClick = 0;
    let brightenStartedAt = 0;

    if (glowContext) {
      glowSprite.width = glowSize;
      glowSprite.height = glowSize;
      const glow = glowContext.createRadialGradient(glowSize / 2, glowSize / 2, 0, glowSize / 2, glowSize / 2, glowSize / 2);
      glow.addColorStop(0, GLOW_BLUE);
      glow.addColorStop(0.2, 'rgba(110, 168, 255, 0.58)');
      glow.addColorStop(0.52, 'rgba(110, 168, 255, 0.14)');
      glow.addColorStop(1, 'rgba(110, 168, 255, 0)');
      glowContext.fillStyle = glow;
      glowContext.fillRect(0, 0, glowSize, glowSize);
    }

    function createNode(x: number, y: number, temporary: boolean, now: number): NodePoint {
      const direction = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(AMBIENT_MIN_SPEED, AMBIENT_MAX_SPEED);
      return {
        x,
        y,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed,
        phase: Math.random() * Math.PI * 2,
        direction,
        speed,
        temporary,
        bornAt: now,
        fadeStartedAt: null,
        removeAt: null,
        burstX: temporary ? Math.cos(direction) * TEMPORARY_BURST_SPEED : 0,
        burstY: temporary ? Math.sin(direction) * TEMPORARY_BURST_SPEED : 0,
      };
    }

    function resize() {
      const previousWidth = width;
      const previousHeight = height;
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
        const columns = Math.ceil(Math.sqrt((count * width) / height));
        const rows = Math.ceil(count / columns);
        const cellWidth = width / columns;
        const cellHeight = height / rows;
        for (let i = 0; i < count; i += 1) {
          const column = i % columns;
          const row = Math.floor(i / columns);
          nodes.push(createNode(
            (column + randomBetween(0.25, 0.75)) * cellWidth,
            (row + randomBetween(0.25, 0.75)) * cellHeight,
            false,
            0,
          ));
        }
        return;
      }

      const widthRatio = previousWidth ? width / previousWidth : 1;
      const heightRatio = previousHeight ? height / previousHeight : 1;
      nodes.forEach((node) => {
        node.x *= widthRatio;
        node.y *= heightRatio;
      });
    }

    function liveNodes(now = performance.now()): NodePoint[] {
      return nodes.filter((node) => node.removeAt === null || (node.fadeStartedAt !== null && node.removeAt > now));
    }

    function nearestNeighbors(source: NodePoint, count: number): NodePoint[] {
      return nodes
        .filter((node) => node !== source && node.removeAt === null && node.fadeStartedAt === null)
        .sort((a, b) => distanceBetween(source, a) - distanceBetween(source, b))
        .slice(0, count);
    }

    function addPacket(from: NodePoint, to: NodePoint) {
      if (reducedMotion || packets.length >= 12 || from === to) return;
      packets.push({ from, to, distance: Math.max(1, distanceBetween(from, to)), travelled: 0 });
    }

    function beginFade(node: NodePoint, now: number) {
      if (!node.temporary || node.fadeStartedAt !== null) return;
      node.fadeStartedAt = now;
      node.removeAt = now + TEMPORARY_FADE_DURATION;
    }

    function spawnNode(x: number, y: number, now: number) {
      const temporaryNodes = nodes.filter((node) => node.temporary && node.fadeStartedAt === null);
      if (temporaryNodes.length >= MAX_TEMPORARY_NODES) {
        beginFade(temporaryNodes.sort((a, b) => a.bornAt - b.bornAt)[0], now);
      }

      const node = createNode(x, y, true, now);
      nodes.push(node);
      const neighbors = nearestNeighbors(node, 3);
      neighbors.forEach((neighbor) => {
        temporaryLinks.push({ from: node, to: neighbor, createdAt: now });
        addPacket(node, neighbor);
      });
      pulses.push({ x, y, startedAt: now });
    }

    function handlePointerMove(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest('a, button, input, textarea, select, label, summary, [role="button"], [tabindex], [data-clickable], [data-no-spawn]');
      if (interactive) return;
      const now = performance.now();
      if (now - lastClick < 140) return;
      lastClick = now;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      brightenStartedAt = now;
      spawnNode(event.clientX, event.clientY, now);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
        return;
      }
      if (!running) {
        running = true;
        lastFrame = performance.now();
        raf = requestAnimationFrame(animate);
      }
    }

    function drawGlow(x: number, y: number, alpha: number, size = GLOW_RADIUS * 2) {
      if (!glowContext) return;
      context.save();
      context.globalAlpha = alpha;
      context.drawImage(glowSprite, x - size / 2, y - size / 2, size, size);
      context.restore();
    }

    function nodeOpacity(node: NodePoint, now: number): number {
      if (!node.temporary) return 0.55;
      const age = now - node.bornAt;
      if (node.fadeStartedAt === null) return clamp(age / TEMPORARY_FADE_IN, 0, 1);
      return clamp(1 - (now - node.fadeStartedAt) / TEMPORARY_FADE_DURATION, 0, 1);
    }

    function draw(now: number) {
      context.clearRect(0, 0, width, height);
      const brighten = brightenStartedAt ? clamp(1 - (now - brightenStartedAt) / BRIGHTEN_DURATION, 0, 1) : 0;
      const visibleNodes = liveNodes(now);
      const baseNodes = visibleNodes.filter((node) => !node.temporary);

      for (let i = 0; i < baseNodes.length; i += 1) {
        for (let j = i + 1; j < baseNodes.length; j += 1) {
          const from = baseNodes[i];
          const to = baseNodes[j];
          const distance = distanceBetween(from, to);
          if (distance > LINK_DISTANCE) continue;
          const opacity = 0.12 + (1 - distance / LINK_DISTANCE) * 0.1 + brighten * 0.06;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.strokeStyle = `${LINE_BLUE}${opacity})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      }

      temporaryLinks.forEach((link) => {
        const progress = reducedMotion ? 1 : clamp((now - link.createdAt) / LINK_DRAW_DURATION, 0, 1);
        const opacity = 0.12 + progress * 0.1;
        const fromOpacity = nodeOpacity(link.from, now);
        const toOpacity = nodeOpacity(link.to, now);
        context.beginPath();
        context.moveTo(link.from.x, link.from.y);
        context.lineTo(link.to.x, link.to.y);
        context.strokeStyle = `${LINE_BLUE}${opacity * Math.min(fromOpacity, toOpacity)})`;
        context.lineWidth = 0.8;
        context.stroke();
      });

      packets.forEach((packet) => {
        const progress = clamp(packet.travelled / packet.distance, 0, 1);
        const x = packet.from.x + (packet.to.x - packet.from.x) * progress;
        const y = packet.from.y + (packet.to.y - packet.from.y) * progress;
        drawGlow(x, y, 0.8, 18);
        context.beginPath();
        context.arc(x, y, 1.7, 0, Math.PI * 2);
        context.fillStyle = '#C5DCFF';
        context.fill();
      });

      visibleNodes.forEach((node, index) => {
        const twinkle = 0.35 + ((Math.sin(now * 0.001 * (0.7 + (index % 7) * 0.08) + node.phase) + 1) / 2) * 0.65;
        const nearPointer = !coarsePointer && pointer.active
          ? clamp(1 - Math.hypot(node.x - pointer.x, node.y - pointer.y) / ATTRACTION_RADIUS, 0, 1)
          : 0;
        const alpha = clamp(nodeOpacity(node, now) * (0.55 + twinkle * 0.25 + nearPointer * 0.12 + brighten * 0.3), 0, 1);
        drawGlow(node.x, node.y, alpha * 0.65, nearPointer > 0 ? 30 : GLOW_RADIUS * 2);
        context.beginPath();
        context.arc(node.x, node.y, NODE_CORE_RADIUS + nearPointer * 0.6, 0, Math.PI * 2);
        context.fillStyle = index % 13 === 0
          ? `${EMERALD}${Math.min(0.82, alpha)})`
          : `rgba(174, 210, 255, ${Math.min(0.92, alpha)})`;
        context.fill();
      });

      pulses.forEach((pulse) => {
        const progress = clamp((now - pulse.startedAt) / RING_DURATION, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        context.beginPath();
        context.arc(pulse.x, pulse.y, 5 + eased * 38, 0, Math.PI * 2);
        context.strokeStyle = `rgba(110, 168, 255, ${(1 - progress) * 0.5})`;
        context.lineWidth = 1;
        context.stroke();
      });
    }

    function update(now: number) {
      const delta = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
      const time = now * 0.001;
      const damping = damp(delta, DAMPING);

      nodes.forEach((node) => {
        if (node.removeAt !== null) return;
        if (node.temporary && node.fadeStartedAt === null && now - node.bornAt >= TEMPORARY_LIFETIME) {
          beginFade(node, now);
        }
        if (reducedMotion) return;

        const noise = Math.sin(time * 0.22 + node.phase) * 0.7 + Math.sin(time * 0.09 + node.phase * 1.8) * 0.3;
        const desiredDirection = node.direction + noise * 0.45;
        const desiredSpeed = clamp(node.speed + Math.sin(time * 0.13 + node.phase) * 2, AMBIENT_MIN_SPEED, AMBIENT_MAX_SPEED);
        const response = 1 - Math.pow(0.04, delta);
        node.vx += (Math.cos(desiredDirection) * desiredSpeed - node.vx) * response;
        node.vy += (Math.sin(desiredDirection) * desiredSpeed - node.vy) * response;

        if (node.temporary) {
          const age = now - node.bornAt;
          const burst = age < TEMPORARY_BURST_DURATION ? Math.exp(-age / 500) : 0;
          node.vx += node.burstX * burst * delta;
          node.vy += node.burstY * burst * delta;
        }

        if (!coarsePointer && pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < ATTRACTION_RADIUS) {
            const strength = (1 - distance / ATTRACTION_RADIUS) * SPRING_STRENGTH;
            node.vx += dx / distance * strength * delta;
            node.vy += dy / distance * strength * delta;
          }
        }

        node.vx *= damping;
        node.vy *= damping;
        const maxSpeed = !coarsePointer && pointer.active ? MAX_ATTRACTION_SPEED : MAX_AMBIENT_SPEED;
        const velocity = Math.hypot(node.vx, node.vy);
        if (velocity > maxSpeed) {
          node.vx = (node.vx / velocity) * maxSpeed;
          node.vy = (node.vy / velocity) * maxSpeed;
        }
        node.x += node.vx * delta;
        node.y += node.vy * delta;

        if (node.x < -8) node.x = width + 8;
        if (node.x > width + 8) node.x = -8;
        if (node.y < -8) node.y = height + 8;
        if (node.y > height + 8) node.y = -8;
      });

      for (let i = packets.length - 1; i >= 0; i -= 1) {
        packets[i].travelled += PACKET_SPEED * delta;
        if (packets[i].travelled >= packets[i].distance) packets.splice(i, 1);
      }

      for (let i = temporaryLinks.length - 1; i >= 0; i -= 1) {
        if (temporaryLinks[i].from.removeAt !== null && temporaryLinks[i].to.removeAt !== null) temporaryLinks.splice(i, 1);
      }

      for (let i = nodes.length - 1; i >= 0; i -= 1) {
        if (nodes[i].removeAt !== null && now >= nodes[i].removeAt) {
          const removed = nodes[i];
          nodes.splice(i, 1);
          for (let j = temporaryLinks.length - 1; j >= 0; j -= 1) {
            if (temporaryLinks[j].from === removed || temporaryLinks[j].to === removed) temporaryLinks.splice(j, 1);
          }
        }
      }

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        if (now - pulses[i].startedAt >= RING_DURATION) pulses.splice(i, 1);
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
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    raf = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full" aria-hidden="true" />;
}
