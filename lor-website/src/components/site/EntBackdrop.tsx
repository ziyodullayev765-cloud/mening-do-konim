/**
 * Soft teal wash shared by the FAQ and Contact sections. One layer spans both
 * sections so there is no seam between them.
 */
export function EntBackdrop() {
  return (
    <div aria-hidden className="ent-wash pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,var(--color-paper)_0%,#eaf6f8_14%,#e4f2f5_60%,#e9f4f6_100%)]">
      {/* Soft light spots so the panels read clearly */}
      <span className="absolute left-1/2 top-[18%] size-[42rem] -translate-x-1/2 rounded-full bg-white/60 blur-[90px]" />
      <span className="absolute left-1/2 top-[62%] size-[46rem] -translate-x-1/2 rounded-full bg-white/55 blur-[100px]" />
    </div>
  );
}

