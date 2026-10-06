"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const DURATION = 5600;

/**
 * "Message sent" swoosh in the style of a phone messenger: a quick rising
 * whoosh of filtered air plus a soft upward tone. Synthesised with Web Audio
 * (no sound file), scheduled `delay` seconds from now.
 */
export function playSwoosh(ctx: AudioContext, delay = 0) {
  const t0 = ctx.currentTime + delay;
  const dur = 0.42;

  // Air: white noise through a band-pass filter sweeping upwards.
  const noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.4;
  band.frequency.setValueAtTime(500, t0);
  band.frequency.exponentialRampToValueAtTime(4200, t0 + dur * 0.8);
  const airGain = ctx.createGain();
  airGain.gain.setValueAtTime(0.0001, t0);
  airGain.gain.exponentialRampToValueAtTime(0.55, t0 + 0.06);
  airGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(band).connect(airGain).connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + dur);

  // Body: a short sine glide that gives the whoosh its "fwip".
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(320, t0);
  osc.frequency.exponentialRampToValueAtTime(1350, t0 + 0.22);
  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.0001, t0);
  toneGain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.03);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);
  osc.connect(toneGain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.3);
}

/** Keyframes: lift off, one full loop, then fly up and away while shrinking. */
function flightKeyframes(x0: number, y0: number): Keyframe[] {
  const frames: Keyframe[] = [];
  const R = Math.min(90, window.innerWidth / 5);
  const push = (x: number, y: number, angle: number, scale: number, offset: number, opacity = 1) =>
    frames.push({ transform: `translate(${x}px, ${y}px) rotate(${angle}rad) scale(${scale})`, offset, opacity });

  // 1) lift off from the button (0 → 0.12)
  push(x0, y0, -0.6, 0.6, 0, 0);
  push(x0 + 30, y0 - 40, 0, 1, 0.12);
  // 2) one loop (0.12 → 0.6). Screen y grows downward, so going "up and over"
  //    from the bottom of the circle means the angle decreases from π/2 by 2π.
  const cx = x0 + 30;
  const cy = y0 - 40 - R;
  const steps = 40;
  for (let i = 1; i <= steps; i++) {
    const th = Math.PI / 2 - (i / steps) * Math.PI * 2;
    const x = cx + R * Math.cos(th);
    const y = cy + R * Math.sin(th);
    const heading = th - Math.PI / 2; // tangent direction, kept continuous (0 → -2π)
    push(x, y, heading, 1, 0.12 + (i / steps) * 0.48);
  }
  // 3) fly up and away (0.6 → 1)
  const endX = x0 + Math.min(260, window.innerWidth * 0.3);
  const endY = -140;
  const n = 14;
  for (let i = 1; i <= n; i++) {
    const p = i / n;
    const ease = p * p;
    const x = x0 + 30 + (endX - x0 - 30) * p;
    const y = y0 - 40 + (endY - (y0 - 40)) * ease;
    push(x, y, -Math.PI * 2 - 0.35 - 0.75 * Math.min(1, p * 2), 1 - 0.55 * p, 0.6 + p * 0.4, p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1);
  }
  return frames;
}

/**
 * Celebratory paper plane after a message is sent: takes off from `origin`,
 * loops once and flies off the top of the screen (~5.6 s), then calls onDone.
 */
export function PaperPlane({ origin, onDone }: { origin: { x: number; y: number }; onDone: () => void }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anim = reduced
      ? el.animate(
          [
            { transform: `translate(${origin.x}px, ${origin.y}px)`, opacity: 0 },
            { transform: `translate(${origin.x}px, ${origin.y - 60}px)`, opacity: 1, offset: 0.3 },
            { transform: `translate(${origin.x}px, ${origin.y - 120}px)`, opacity: 0 },
          ],
          { duration: 1500, fill: "forwards" },
        )
      : el.animate(flightKeyframes(origin.x, origin.y), { duration: DURATION, easing: "cubic-bezier(.45,.05,.55,.95)", fill: "forwards" });
    anim.onfinish = onDone;
    return () => anim.cancel();
  }, [origin, onDone]);

  // Portal to <body>: ancestors with backdrop-filter/transform would otherwise trap position:fixed.
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <svg ref={ref} viewBox="0 0 48 48" className="absolute top-0 left-0 -mt-6 -ml-6 size-12 drop-shadow-[0_6px_10px_rgb(30_157_178/0.35)]" style={{ opacity: 0 }}>
        {/* Paper plane, rotated so its nose points right (heading 0 rad = →) */}
        <g transform="rotate(42 24 24)">
          <path d="M4 22 44 6 32 42 24 28Z" fill="#1e9db2" />
          <path d="M44 6 24 28 22 38 28 31Z" fill="#17839a" />
          <path d="M4 22 24 28 44 6Z" fill="#5cc9da" />
        </g>
      </svg>
    </div>,
    document.body,
  );
}
