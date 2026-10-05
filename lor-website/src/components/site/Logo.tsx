/** Geometric emblem: a rounded square with a medical cross. */
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#1E9DB2" />
      <path d="M20 9.5v21M9.5 20h21" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3.2" fill="#1A2B4C" />
    </svg>
  );
}
