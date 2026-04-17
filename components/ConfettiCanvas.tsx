'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  shape: 'rect' | 'circle' | 'triangle';
}

interface Props {
  active: boolean;
  onDone: () => void;
}

const PALETTE = [
  '#f59e0b', '#3b82f6', '#10b981', '#ec4899',
  '#8b5cf6', '#f97316', '#06b6d4', '#a3e635',
  '#fbbf24', '#818cf8',
];

export default function ConfettiCanvas({ active, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    startedAt.current = performance.now();

    const shapes: Particle['shape'][] = ['rect', 'circle', 'triangle'];

    particles.current = Array.from({ length: 200 }, () => ({
      x:        Math.random() * canvas.width,
      y:        -10 - Math.random() * 120,
      vx:       (Math.random() - 0.5) * 5,
      vy:       2.5 + Math.random() * 4.5,
      color:    PALETTE[Math.floor(Math.random() * PALETTE.length)],
      size:     5 + Math.random() * 9,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.18,
      alpha:    1,
      shape:    shapes[Math.floor(Math.random() * shapes.length)],
    }));

    const draw = (p: Particle, c: CanvasRenderingContext2D) => {
      c.save();
      c.globalAlpha = p.alpha;
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.fillStyle = p.color;

      if (p.shape === 'rect') {
        c.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.55);
      } else if (p.shape === 'circle') {
        c.beginPath();
        c.ellipse(0, 0, p.size / 2, p.size / 3, 0, 0, Math.PI * 2);
        c.fill();
      } else {
        // triangle
        c.beginPath();
        c.moveTo(0, -p.size / 2);
        c.lineTo(p.size / 2, p.size / 2);
        c.lineTo(-p.size / 2, p.size / 2);
        c.closePath();
        c.fill();
      }
      c.restore();
    };

    const tick = (now: number) => {
      const elapsed = now - startedAt.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = 0;

      for (const p of particles.current) {
        if (p.alpha <= 0) continue;
        alive++;

        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.06;   // gravity
        p.vx *= 0.995;  // slight air resistance
        p.rotation += p.rotSpeed;

        // Start fading after 2.2 s
        if (elapsed > 2200) {
          p.alpha = Math.max(0, p.alpha - 0.022);
        }

        draw(p, ctx);
      }

      if (alive === 0) { onDone(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
