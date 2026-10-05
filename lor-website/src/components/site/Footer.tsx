import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { isPlaceholder, telHref } from "@/lib/format";
import { LogoMark } from "./Logo";


export async function Footer({ doctor }: { doctor: Doctor }) {
  const t = await getT();
  const LINKS = [
    { href: "/#directions", label: t.site.directions },
    { href: "/#prices", label: t.site.prices },
    { href: "/about", label: t.nav.about },
    { href: "/#faq", label: t.nav.faq },
    { href: "/#contact", label: t.nav.contact },
  ];
  const ok = (v: string) => Boolean(v) && !isPlaceholder(v);
  return (
    <footer className="bg-ink pb-24 text-white/70 sm:pb-0">
      <div className="container-x grid grid-cols-2 gap-x-4 gap-y-8 py-10 sm:py-14 md:grid-cols-12 md:gap-10">
        <div className="col-span-2 md:col-span-5">
          <div className="flex items-center gap-3">
            <LogoMark className="size-10" logoUrl={doctor.logoUrl} />
            <span className="text-lg font-extrabold text-white">{doctor.fullName}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed sm:mt-4 sm:text-[15px]">{doctor.title}</p>
          <Link href="/book" className="btn btn-primary mt-6">{t.common.bookAppointment}</Link>
        </div>
        <nav aria-label={t.footer.quickLinks} className="col-span-1 md:col-span-3">
          <p className="font-bold text-white">{t.footer.quickLinks}</p>
          <ul className="mt-3 space-y-2 text-sm sm:mt-4 sm:space-y-2.5 sm:text-[15px]">
            {LINKS.map((l) => <li key={l.href}><a href={l.href} className="hover:text-white">{l.label}</a></li>)}
          </ul>
        </nav>
        <div className="col-span-2 md:col-span-4">
          <p className="font-bold text-white">{t.footer.contact}</p>
          <ul className="mt-3 space-y-2.5 text-sm sm:mt-4 sm:space-y-3 sm:text-[15px]">
            {ok(doctor.phone) && <li><a href={telHref(doctor.phone)} className="flex gap-2.5 hover:text-white"><Phone className="mt-0.5 size-4 shrink-0 text-[#6fd3e3]" aria-hidden />{doctor.phone}</a></li>}
            {ok(doctor.email) && <li><a href={`mailto:${doctor.email}`} className="flex gap-2.5 break-all hover:text-white"><Mail className="mt-0.5 size-4 shrink-0 text-[#6fd3e3]" aria-hidden />{doctor.email}</a></li>}
            {ok(doctor.address) && <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-[#6fd3e3]" aria-hidden />{doctor.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-4 text-xs sm:py-5 sm:text-[13px] text-white/45 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {doctor.fullName}. {t.footer.rights}</p>
          <p className="max-w-xl md:text-right">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
