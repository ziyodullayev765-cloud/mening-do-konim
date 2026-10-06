"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/** Happy rising arpeggio (C6 · E6 · G6 · C7) with a soft marimba-like tone. */
export function playJoy(ctx: AudioContext, delay = 0) {
  const start = ctx.currentTime + delay;
  const master = ctx.createGain();
  master.gain.value = 0.2;
  master.connect(ctx.destination);
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
    const t0 = start + i * 0.11;
    const last = i === 3;
    for (const [type, mult, vol] of [["triangle", 1, 1], ["sine", 4, 0.12]] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol * (last ? 1.1 : 0.85), t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (last ? 1.4 : 0.45));
      osc.connect(g).connect(master);
      osc.start(t0);
      osc.stop(t0 + (last ? 1.5 : 0.5));
    }
  });
}

const COLORS = ["#1e9db2", "#2bd4c4", "#7c6cf0", "#f5b83d", "#ff7a8a", "#5cc9da", "#9be37a"];

type Piece = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string; shape: 0 | 1 | 2; life: number };

/**
 * Full-screen confetti: two bursts from the lower corners and a gentle shower
 * from the top (~3.5 s). Canvas only, no dependencies; skipped for reduced motion.
 */
export function Confetti({ onDone }: { onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone?.();
      return;
    }
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const pieces: Piece[] = [];
    const scale = Math.min(1, W / 900);
    const make = (x: number, y: number, angle: number, spread: number, speed: number): Piece => {
      const a = angle + rnd(-spread, spread);
      const v = speed * rnd(0.55, 1.15);
      return {
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        rot: rnd(0, Math.PI * 2), vr: rnd(-0.25, 0.25),
        w: rnd(6, 11), h: rnd(8, 15),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.floor(Math.random() * 3) as 0 | 1 | 2,
        life: 1,
      };
    };
    const burst = (n: number) => {
      for (let i = 0; i < n; i++) {
        pieces.push(make(0, H * 0.85, -Math.PI / 3, 0.35, 19 * Math.max(0.7, scale)));
        pieces.push(make(W, H * 0.85, (-2 * Math.PI) / 3, 0.35, 19 * Math.max(0.7, scale)));
      }
    };
    burst(Math.round(70 * Math.max(0.6, scale)));
    let showered = 0;

    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = now - start;
      // gentle shower from the top during the first 1.6 s
      if (t < 1600 && showered < 90) {
        for (let i = 0; i < 3; i++, showered++) pieces.push(make(rnd(0, W), -20, Math.PI / 2, 0.4, rnd(2, 5)));
      }
      ctx.clearRect(0, 0, W, H);
      for (const p of pieces) {
        p.vy += 0.32; // gravity
        p.vx *= 0.985; // air drag
        p.vy *= 0.985;
        p.x += p.vx + Math.sin((t + p.rot * 300) / 300) * 0.6; // flutter
        p.y += p.vy;
        p.rot += p.vr;
        if (t > 2600) p.life = Math.max(0, p.life - 0.02);
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * 0.55);
        else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.h / 2);
          ctx.lineTo(p.w / 2, p.h / 2);
          ctx.lineTo(-p.w / 2, p.h / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (t < 3800) raf = requestAnimationFrame(frame);
      else onDone?.();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return createPortal(<canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[60] size-full" />, document.body);
}
