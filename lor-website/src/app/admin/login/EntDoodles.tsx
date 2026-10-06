/**
 * Faint line drawings of ears and noses floating behind the
 * login form — a light ENT motif. Purely decorative.
 */

const EAR = (
  <>
    <path d="M17 4.5c-5.2 0-9 3.9-9 8.8 0 2.8 1.1 4.6 2.6 6.3 1.2 1.3 1.6 2.4 1.6 4 0 2.6 1.9 4.4 4.3 4.4 2.3 0 4-1.6 4.4-3.8" />
    <path d="M12.5 13.4c0-2.6 2-4.4 4.4-4.4s4.6 1.9 4.6 4.6c0 2.3-1.4 3.4-2.6 4.4-.9.8-1.3 1.6-1.3 2.6" />
    <path d="M26 13.3c0-5-4-8.8-9-8.8" />
  </>
);
const NOSE = (
  <>
    <path d="M16 5c-.4 5-1.4 9-3.4 12.2-1.1 1.8-3.1 2.6-3.4 4.4-.3 1.8 1.2 3 2.8 2.6 1.4-.3 2.4.8 4 .8s2.6-1.1 4-.8c1.6.4 3.1-.8 2.8-2.6-.3-1.8-2.3-2.6-3.4-4.4C17.4 14 16.4 10 16 5Z" />
    <path d="M12.6 21.8c.9.7 2 .7 2.6 0M16.8 21.8c.6.7 1.7.7 2.6 0" />
  </>
);
const ITEMS: { icon: React.ReactNode; x: string; y: string; size: number; rot: number; delay: number }[] = [
  { icon: EAR, x: "8%", y: "10%", size: 64, rot: -12, delay: 0 },
  { icon: NOSE, x: "78%", y: "16%", size: 56, rot: 10, delay: -3 },
  { icon: NOSE, x: "16%", y: "78%", size: 52, rot: 8, delay: -6 },
  { icon: EAR, x: "84%", y: "70%", size: 72, rot: 14, delay: -2 },
  { icon: NOSE, x: "4%", y: "44%", size: 44, rot: -6, delay: -8 },
  { icon: EAR, x: "88%", y: "42%", size: 40, rot: -10, delay: -4 },
  { icon: EAR, x: "46%", y: "88%", size: 44, rot: -20, delay: -5 },
  { icon: NOSE, x: "52%", y: "5%", size: 40, rot: 18, delay: -7 },
  { icon: EAR, x: "30%", y: "26%", size: 30, rot: 25, delay: -1 },
  { icon: NOSE, x: "66%", y: "84%", size: 32, rot: -16, delay: -9 },
];

export function EntDoodles() {
  return (
    <div aria-hidden className="ent-doodles pointer-events-none absolute inset-0 -z-10">
      {ITEMS.map((it, i) => (
        <svg
          key={i}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ent-doodle absolute"
          style={{ left: it.x, top: it.y, width: it.size, height: it.size, "--r": `${it.rot}deg`, animationDelay: `${it.delay}s` } as React.CSSProperties}
        >
          {it.icon}
        </svg>
      ))}
    </div>
  );
}
