/**
 * Decorative background shared by the FAQ and Contact sections: a faint,
 * slowly drifting pattern of ear / nose / head line icons on a soft teal wash.
 * One layer spans both sections so there is no seam between them.
 */
export function EntBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,var(--color-paper)_0%,#eaf6f8_14%,#e4f2f5_60%,#e9f4f6_100%)]">
      {/* Pattern fades in from the top so it blends into the section above */}
      <div className="absolute inset-0 [mask-image:linear-gradient(180deg,transparent_0,#000_220px)] [-webkit-mask-image:linear-gradient(180deg,transparent_0,#000_220px)]">
      <div className="ent-pattern absolute -inset-[260px] text-[#1e9db2] opacity-[0.13]">
        <svg className="size-full" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <pattern id="ent-icons" width="260" height="170" patternUnits="userSpaceOnUse">
              {/* Ear */}
              <g transform="translate(18 22)">
                <path d="M22 0C9 0 0 10 1 24c1 10 8 14 9 23 1 8-3 15 4 18 7 3 14-3 15-11 2-14 12-19 12-36C41 7 33 0 22 0Z" />
                <path d="M22 11c-7 0-11 6-10 12 1 6 7 7 8 13 1 6-2 10 3 12" />
              </g>
              {/* Nose */}
              <g transform="translate(108 20)">
                <path d="M14 0c-1 14-6 30-14 44-3 6 0 12 7 12 4 0 6-3 10-3 4 0 6 3 11 3 6 0 9-6 5-12-8-12-12-28-13-44" />
                <path d="M9 50c2-2 5-2 7 0M22 50c2-2 5-2 7 0" />
              </g>
              {/* Head profile with airway */}
              <g transform="translate(186 16)">
                <path d="M6 18C14 4 34 0 48 10c10 8 12 20 9 30l7 10c2 3 0 5-3 5h-3l1 7c0 4-3 6-7 6h-5l1 7c0 5-4 7-9 6l-6-1v14" />
                <path d="M6 18C0 30 2 46 10 56c4 6 6 12 6 20v10" />
                <path d="M57 40c-10-1-17-4-22-9-2 6-2 12 2 17 4 5 11 7 18 7" />
              </g>
              {/* Second row, offset */}
              <g transform="translate(150 104) scale(.8)">
                <path d="M22 0C9 0 0 10 1 24c1 10 8 14 9 23 1 8-3 15 4 18 7 3 14-3 15-11 2-14 12-19 12-36C41 7 33 0 22 0Z" />
                <path d="M22 11c-7 0-11 6-10 12 1 6 7 7 8 13 1 6-2 10 3 12" />
              </g>
              <g transform="translate(62 108) scale(.8)">
                <path d="M14 0c-1 14-6 30-14 44-3 6 0 12 7 12 4 0 6-3 10-3 4 0 6 3 11 3 6 0 9-6 5-12-8-12-12-28-13-44" />
                <path d="M9 50c2-2 5-2 7 0M22 50c2-2 5-2 7 0" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ent-icons)" stroke="none" />
        </svg>
      </div>
      </div>
      {/* Soft light spots so the panels read clearly */}
      <span className="absolute left-1/2 top-[18%] size-[42rem] -translate-x-1/2 rounded-full bg-white/60 blur-[90px]" />
      <span className="absolute left-1/2 top-[62%] size-[46rem] -translate-x-1/2 rounded-full bg-white/55 blur-[100px]" />
    </div>
  );
}

/** Faint caduceus drawn inside glass panels. */
export function CaduceusMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 260 420" className={`pointer-events-none ${className}`} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="130" cy="22" r="14" />
      <path d="M130 36v380" />
      <path d="M126 76C80 44 38 50 6 82c36-4 64 4 84 18-30 0-52 10-68 30 34-8 68-8 104-26" />
      <path d="M134 76c46-32 88-26 120 6-36-4-64 4-84 18 30 0 52 10 68 30-34-8-68-8-104-26" />
      <path d="M130 130c45 15 45 50 0 65s-45 50 0 65 45 50 0 65c-40 13-40 40-4 55" />
      <path d="M130 130c-45 15-45 50 0 65s45 50 0 65-45 50 0 65c40 13 40 40 4 55" />
    </svg>
  );
}
