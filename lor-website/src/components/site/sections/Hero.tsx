import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, MapPin } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { DoctorPortrait } from "../DoctorPortrait";

export function Hero({ doctor, todayHours }: { doctor: Doctor; todayHours: string | null }) {
  const location = [doctor.city, doctor.country].filter(Boolean).join(", ");
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_85%_0%,rgb(27_107_112/0.10),transparent_70%)]" />
      <div className="container-x relative grid items-center gap-12 pt-8 pb-16 lg:grid-cols-12 lg:gap-10 lg:pt-14 lg:pb-24">
        <div className="lg:col-span-7">
          <p className="eyebrow animate-fade-up">{t.hero.eyebrow}</p>
          <h1 id="hero-title" className="h-display mt-6 animate-fade-up text-[clamp(2.75rem,1.6rem+4.6vw,5.25rem)] [animation-delay:80ms]">
            {doctor.fullName}
          </h1>
          <p className="mt-4 animate-fade-up font-serif text-[clamp(1.35rem,1.1rem+0.9vw,1.85rem)] italic text-accent [animation-delay:140ms]">
            {doctor.title}
          </p>
          {doctor.shortDescription && (
            <p className="mt-6 max-w-xl animate-fade-up text-[17px] leading-relaxed text-muted [animation-delay:200ms] md:text-lg">
              {doctor.shortDescription}
            </p>
          )}

          <ul className="mt-8 flex animate-fade-up flex-wrap gap-x-6 gap-y-3 text-[15px] text-text [animation-delay:240ms]">
            {doctor.yearsExperience != null && (
              <li className="flex items-center gap-2">
                <span className="font-serif text-2xl leading-none text-ink">{doctor.yearsExperience}+</span>
                <span className="text-muted">{t.common.yearsExperience}</span>
              </li>
            )}
            {location && (
              <li className="flex items-center gap-2 text-muted">
                <MapPin className="size-4 text-accent" aria-hidden />
                {location}
              </li>
            )}
            {doctor.clinicName && <li className="text-muted">{doctor.clinicName}</li>}
          </ul>

          <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:300ms] sm:flex-row">
            <Link href="/book" className="btn btn-primary btn-lg group">
              <CalendarCheck className="size-5" aria-hidden />
              {t.common.bookAppointment}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <a href="#services" className="btn btn-secondary btn-lg">
              {t.common.viewServices}
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md animate-fade-up [animation-delay:150ms] lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] shadow-lift">
              <DoctorPortrait photoUrl={doctor.photoUrl} name={doctor.fullName} priority />
            </div>
            <div aria-hidden className="absolute -top-4 -right-4 -z-10 hidden h-full w-full rounded-[14px] border border-line-strong lg:block" />
            <div className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:-left-6 sm:right-auto">
              <div className="card flex items-center gap-4 px-5 py-4">
                <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent">
                  <Clock className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {todayHours ? t.hero.todayHours : t.hero.closedToday}
                  </p>
                  {todayHours && <p className="mt-0.5 font-semibold tabular-nums text-ink">{todayHours}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
