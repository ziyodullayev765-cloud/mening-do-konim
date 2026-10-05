import Image from "next/image";
import { UserRound } from "lucide-react";
import { t } from "@/lib/i18n";

/** Uploaded photo, or a soft placeholder until one is added in the admin panel. */
export function DoctorPortrait({
  photoUrl,
  name,
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  alt,
}: {
  photoUrl: string | null;
  name: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={alt ?? `${name} — ${t.hero.photoAlt}`}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover object-top"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={t.hero.photoAlt}
      className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,rgb(255_255_255/.55),rgb(255_255_255/.15))]"
    >
      <UserRound className="size-1/3 text-accent/35" strokeWidth={1} aria-hidden />
      <span className="absolute bottom-6 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
        Rasm admin paneldan qo&apos;yiladi
      </span>
    </div>
  );
}
