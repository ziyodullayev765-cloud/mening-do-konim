import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatNumber, isPlaceholder, telHref } from "@/lib/format";
import { DoctorPortrait } from "../DoctorPortrait";

/** The only place the doctor's photo and name appear. */
export function Hero({ doctor, todayHours }: { doctor: Doctor; todayHours: string | null }) {
  const location = [doctor.city, doctor.country].filter((v) => v && !isPlaceholder(v)).join(", ");
  const facts = [
    doctor.yearsExperience ? { label: t.trust.experience, value: `${doctor.yearsExperience}+` } : null,
    doctor.patientsTreated ? { label: t.trust.patients, value: `${formatNumber(doctor.patientsTreated)}+` } : null,
    { label: todayHours ? t.hero.todayHours : t.hero.closedToday, value: todayHours ?? "—" },
    location ? { label: t.about.location, value: location } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section id="top" aria-labelledby="hero-title">
      <div className="container-x grid items-center gap-10 pt-10 pb-16 lg:grid-cols-12 lg:gap-16 lg:pt-16 lg:pb-24">
        <div className="lg:col-span-7">
          <p className="eyebrow">{doctor.title}</p>
          <h1 id="hero-title" className="h-display mt-5 text-[clamp(2.5rem,1.6rem+3.4vw,4.25rem)]">{doctor.fullName}</h1>
          {doctor.shortDescription && !isPlaceholder(doctor.shortDescription) && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{doctor.shortDescription}</p>
          )}

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-primary btn-lg">
              <CalendarCheck className="size-5" aria-hidden />
              {t.common.bookAppointment}
            </Link>
            {doctor.phone && !isPlaceholder(doctor.phone) && (
              <a href={telHref(doctor.phone)} className="btn btn-secondary btn-lg">
                <Phone className="size-5" aria-hidden />
                {doctor.phone}
              </a>
            )}
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-muted">{f.label}</dt>
                <dd className="mt-1 font-medium text-ink tabular-nums">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-2xl bg-paper-2 lg:max-w-none">
            <DoctorPortrait photoUrl={doctor.photoUrl} name={doctor.fullName} priority />
          </div>
        </div>
      </div>
    </section>
  );
}
