import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import type { Doctor, Service } from "@prisma/client";
import { t } from "@/lib/i18n";
import { telHref, telegramHref } from "@/lib/format";

export function Footer({ doctor, services }: { doctor: Doctor; services: Pick<Service, "id" | "name">[] }) {
  const socials = [
    doctor.telegram && { label: "Telegram", href: telegramHref(doctor.telegram) },
    doctor.instagram && { label: "Instagram", href: doctor.instagram },
    doctor.facebook && { label: "Facebook", href: doctor.facebook },
    doctor.youtube && { label: "YouTube", href: doctor.youtube },
  ].filter(Boolean) as { label: string; href: string }[];

  const links = [
    { href: "/#about", label: t.nav.about },
    { href: "/#services", label: t.nav.services },
    { href: "/#procedures", label: t.nav.procedures },
    { href: "/#pricing", label: t.nav.pricing },
    { href: "/#faq", label: t.nav.faq },
    { href: "/#contact", label: t.nav.contact },
  ];

  return (
    <footer className="bg-ink pb-28 text-paper/70 sm:pb-0">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5">
          <p className="font-serif text-3xl text-paper">{doctor.fullName}</p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#8fc1c0]">{doctor.title}</p>
          {doctor.shortDescription && <p className="mt-5 max-w-sm text-[15px] leading-relaxed">{doctor.shortDescription}</p>}
          <div className="mt-6 space-y-2 text-[15px]">
            {doctor.phone && (
              <a href={telHref(doctor.phone)} className="flex items-center gap-2.5 text-paper hover:text-white">
                <Phone className="size-4 text-[#8fc1c0]" aria-hidden /> {doctor.phone}
              </a>
            )}
            {doctor.address && (
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-[#8fc1c0]" aria-hidden /> {doctor.address}
              </p>
            )}
          </div>
        </div>
        <nav aria-label={t.footer.quickLinks} className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">{t.footer.quickLinks}</p>
          <ul className="mt-5 space-y-3 text-[15px]">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-paper">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">{t.footer.services}</p>
          <ul className="mt-5 space-y-3 text-[15px]">
            {services.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link href={`/book?service=${s.id}`} className="hover:text-paper">{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">{t.footer.contact}</p>
          <ul className="mt-5 space-y-3 text-[15px]">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-paper">{s.label}</a>
              </li>
            ))}
            {doctor.email && (
              <li><a href={`mailto:${doctor.email}`} className="break-all hover:text-paper">{doctor.email}</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-[13px] text-paper/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {doctor.fullName}. {t.footer.rights}</p>
          <p className="max-w-xl md:text-right">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
