import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { telHref } from "@/lib/format";
import { Reveal } from "../Reveal";

export function FinalCta({ doctor }: { doctor: Doctor }) {
  return (
    <section aria-labelledby="cta-title" className="pb-20 lg:pb-28">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-2xl bg-accent px-6 py-16 text-center sm:px-12 lg:py-24">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_0%,rgb(255_255_255/0.14),transparent_70%)]" />
          <h2 id="cta-title" className="h-display relative text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)] !text-white">{t.finalCta.title}</h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/80">{t.finalCta.lead.replace("{name}", doctor.fullName)}</p>
          <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/book" className="btn btn-lg bg-white text-accent-strong shadow-lift hover:bg-paper">
              <CalendarCheck className="size-5" aria-hidden />
              {t.common.bookAppointment}
            </Link>
            {doctor.phone && (
              <a href={telHref(doctor.phone)} className="btn btn-lg text-white hover:bg-white/10">
                <Phone className="size-5" aria-hidden />
                <span className="text-white/70">{t.finalCta.orCall}</span> {doctor.phone}
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
