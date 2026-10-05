import { Award, BadgeCheck, MapPin } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { DoctorPortrait } from "../DoctorPortrait";
import { BookTrigger } from "../booking/BookTrigger";
import { QuickBookBar } from "../booking/QuickBookBar";
import type { BookableService } from "../booking/types";

export function Hero({ doctor, services, todayHours }: { doctor: Doctor; services: BookableService[]; todayHours: string | null }) {
  const location = [doctor.city, doctor.country].filter(Boolean).join(", ");
  return (
    <section id="top" aria-labelledby="hero-title" className="relative px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="bg-sky-hero relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] pt-24 sm:rounded-[40px] sm:pt-28">
        {/* soft decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/3 size-80 rounded-full bg-[#7fb0ee]/30 blur-3xl" />

        <div className="container-x relative grid gap-8 lg:min-h-[640px] lg:grid-cols-12 lg:gap-10">
          {/* Text */}
          <div className="pb-2 lg:order-2 lg:col-span-6 lg:self-center lg:pb-36">
            <p className="eyebrow animate-fade-up">{doctor.title}</p>
            <h1 id="hero-title" className="h-display mt-4 animate-fade-up text-[clamp(2.1rem,1.5rem+2.4vw,3.4rem)] [animation-delay:80ms]">
              {doctor.heroTitle || t.home.heroTitleFallback}
            </h1>
            {doctor.shortDescription && (
              <p className="mt-5 max-w-lg animate-fade-up text-[17px] leading-relaxed text-text/80 [animation-delay:160ms]">
                {doctor.shortDescription}
              </p>
            )}
            <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:220ms]">
              <BookTrigger className="btn btn-primary btn-lg max-sm:flex-1">{t.common.bookAppointment}</BookTrigger>
              <a href="#services" className="btn btn-lg border border-white/80 bg-white/50 text-ink backdrop-blur hover:bg-white/80">
                {t.common.viewServices}
              </a>
            </div>
            {location && (
              <p className="mt-6 flex items-center gap-2 text-sm text-text/70">
                <MapPin className="size-4 text-accent" aria-hidden /> {location}
                {doctor.clinicName && <span className="text-text/50">· {doctor.clinicName}</span>}
              </p>
            )}
          </div>

          {/* Photo with floating glass cards */}
          <div className="relative lg:order-1 lg:col-span-6 lg:self-end">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-t-[200px] rounded-b-none border-x-8 border-t-8 border-white/40">
              <DoctorPortrait photoUrl={doctor.photoUrl} name={doctor.fullName} priority sizes="(min-width: 1024px) 40vw, 90vw" />
            </div>

            {doctor.yearsExperience != null && doctor.yearsExperience > 0 && (
              <div className="glass absolute top-[22%] left-0 flex items-center gap-3 rounded-full py-2 pr-5 pl-2 sm:left-4 lg:left-0">
                <span className="grid size-10 place-items-center rounded-full bg-accent text-white">
                  <Award className="size-5" aria-hidden />
                </span>
                <span className="leading-tight">
                  <span className="block font-serif text-lg font-semibold text-ink">{doctor.yearsExperience}+</span>
                  <span className="block text-xs text-muted">{t.home.experienceChip}</span>
                </span>
              </div>
            )}

            <div className="glass absolute top-[48%] right-0 w-56 rounded-3xl p-4 sm:right-4 lg:right-0">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-5 shrink-0 text-accent" aria-hidden />
                <p className="truncate text-sm font-semibold text-ink">{doctor.fullName}</p>
              </div>
              <p className="mt-1 text-xs text-muted">{doctor.title}</p>
              <div className="mt-3 border-t border-white/70 pt-3 text-xs">
                <span className="text-muted">{todayHours ? t.hero.todayHours : t.hero.closedToday}</span>
                {todayHours && <span className="ml-2 font-semibold text-ink tabular-nums">{todayHours}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Quick booking bar (liquid glass) */}
        <div className="container-x relative pb-6 sm:pb-8 lg:absolute lg:inset-x-0 lg:bottom-0">
          <QuickBookBar services={services} />
        </div>
      </div>
    </section>
  );
}
