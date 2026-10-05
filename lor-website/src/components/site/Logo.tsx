import { ShieldPlus } from "lucide-react";

/** Uploaded logo, or a shield mark in the style of the reference design. */
export function Logo({ logoUrl, size = "md" }: { logoUrl: string | null; size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-16 rounded-2xl" : "size-10 rounded-full";
  if (logoUrl) {
    return (
      // Logos may be PNG with transparency and any aspect ratio; plain <img> keeps them crisp.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="" className={`${box} shrink-0 bg-white object-contain p-1`} />
    );
  }
  return (
    <span className={`${box} grid shrink-0 place-items-center bg-gradient-to-br from-accent to-[#5b95ea] text-white shadow-[0_6px_16px_-6px_rgb(47_111_216/.7)]`}>
      <ShieldPlus className={size === "lg" ? "size-8" : "size-5"} strokeWidth={1.8} aria-hidden />
    </span>
  );
}
