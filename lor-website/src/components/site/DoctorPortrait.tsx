import { FallbackImage } from "./FallbackImage";
import { t } from "@/lib/i18n";

/** Doctor photo, or a refined monogram placeholder until a photo is added in the admin panel. */
export function DoctorPortrait({
  photoUrl,
  name,
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
}: {
  photoUrl: string | null;
  name: string;
  priority?: boolean;
  sizes?: string;
}) {
  const placeholder = <Monogram name={name} />;
  if (photoUrl) {
    return (
      <FallbackImage
        src={photoUrl}
        alt={`${name} — ${t.hero.photoAlt}`}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        fallback={placeholder}
      />
    );
  }
  return placeholder;
}

function Monogram({ name }: { name: string }) {
  const initials = name
    .replace(/[[\]]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      role="img"
      aria-label={t.hero.photoAlt}
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_20%_10%,#14a3a3_0%,#0f2f3a_60%)]"
    >
      <svg className="absolute inset-0 size-full opacity-[0.18]" aria-hidden>
        <defs>
          <pattern id="portrait-lines" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="22" stroke="#dff4f3" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#portrait-lines)" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-serif text-[clamp(5rem,14vw,9rem)] italic leading-none text-paper/90">{initials || "Dr"}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
