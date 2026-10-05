import { Mail, MapPin, Phone } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { telHref, telegramHref } from "@/lib/format";
import { Logo } from "./Logo";

export function Footer({ doctor }: { doctor: Doctor }) {
  const socials = [
    doctor.telegram && { label: "Telegram", href: telegramHref(doctor.telegram) },
    doctor.instagram && { label: "Instagram", href: doctor.instagram },
    doctor.facebook && { label: "Facebook", href: doctor.facebook },
    doctor.youtube && { label: "YouTube", href: doctor.youtube },
  ].filter(Boolean) as { label: string; href: string }[];

  const links = [
    { href: "/#services", label: t.nav.services },
    { href: "/#about", label: t.nav.about },
    { href: "/#faq", label: t.nav.faq },
    { href: "/#appointment", label: t.common.bookAppointment },
  ];

  return (
    <footer className="relative mt-16 pb-28 sm:pb-0">
      {/* Curved sky band with the centered shield badge (from the reference) */}
      <svg aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-16 w-full text-[#d7e8fb] sm:h-24">
        <path d="M0 120 L0 70 Q720 -40 1440 70 L1440 120 Z" fill="currentColor" />
      </svg>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3">
        <div className="rounded-[26px] border-4 border-white bg-white/60 p-1 shadow-lift backdrop-blur">
          <Logo logoUrl={doctor.logoUrl} size="lg" />
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#d7e8fb] to-[#a9cdf4] text-text/80">
        <div className="container-x grid gap-10 pt-14 pb-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-xl font-semibold text-ink">{doctor.fullName}</p>
            <p className="mt-1 text-sm font-medium text-accent-strong">{doctor.title}</p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed">{doctor.shortDescription || t.home.footerLead}</p>
          </div>
          <nav aria-label={t.footer.quickLinks} className="md:col-span-3">
            <p className="text-sm font-semibold text-ink">{t.footer.quickLinks}</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {links.map((l) => (
                <li key={l.href}><a href={l.href} className="hover:text-ink">{l.label}</a></li>
              ))}
              {socials.map((s) => (
                <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">{s.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-4">
            <p className="text-sm font-semibold text-ink">{t.footer.contact}</p>
            <ul className="mt-4 space-y-3 text-[15px]">
              {doctor.address && (
                <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden />{doctor.address}</li>
              )}
              {doctor.phone && (
                <li><a href={telHref(doctor.phone)} className="flex gap-2.5 hover:text-ink"><Phone className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden />{doctor.phone}</a></li>
              )}
              {doctor.email && (
                <li><a href={`mailto:${doctor.email}`} className="flex gap-2.5 break-all hover:text-ink"><Mail className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden />{doctor.email}</a></li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/50">
          <div className="container-x flex flex-col gap-2 py-5 text-[13px] text-text/60 md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} {doctor.fullName}. {t.footer.rights}</p>
            <p className="max-w-xl md:text-right">{t.footer.disclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
