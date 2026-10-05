/** Uploaded logo (admin panel) or the default geometric emblem. */
export function LogoMark({ className = "size-10", logoUrl }: { className?: string; logoUrl?: string | null }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="" className={`${className} rounded-[11px] object-contain`} />;
  }
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#1E9DB2" />
      <path d="M20 9.5v21M9.5 20h21" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3.2" fill="#1A2B4C" />
    </svg>
  );
}

/** Instagram glyph (lucide no longer ships brand icons). */
export function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
