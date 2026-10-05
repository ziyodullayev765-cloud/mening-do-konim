import Link from "next/link";
import { ArrowRight, Award, MapPin, Star } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { isPlaceholder } from "@/lib/format";
import { DoctorPortrait } from "../DoctorPortrait";
import { FallbackImage } from "../FallbackImage";

const DEFAULT_TITLE = "Quloq, burun va tomoq salomatligi";
const DEFAULT_LEAD = "Tashxis, davolash va maslahat — tajribali LOR shifokori qabulida. Onlayn yoziling, vaqtingizni tejang.";

export function Hero({ doctor, rating }: { doctor: Doctor; rating: { average: number; count: number } | null }) {
  const ok = (v: string | null | undefined) => Boolean(v) && !isPlaceholder(v);
  const location = ok(doctor.address) ? doctor.address : [doctor.city, doctor.country].filter(ok).join(", ");
  const lead = ok(doctor.shortDescription) ? doctor.shortDescription : DEFAULT_LEAD;

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden bg-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 size-[620px] rounded-full bg-accent-soft/80 blur-3xl" />
      <div className="container-x relative grid items-center gap-12 pt-10 pb-16 lg:grid-cols-12 lg:pt-14 lg:pb-24">
        <div className="lg:col-span-6">
          {location && (
            <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-soft">
              <MapPin className="size-4 text-accent" aria-hidden /> {location}
            </p>
          )}
          <h1 id="hero-title" className="h-display mt-6 animate-fade-up text-[clamp(2.4rem,1.5rem+3.2vw,4rem)] [animation-delay:80ms]">
            {doctor.heroTitle || DEFAULT_TITLE}
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted [animation-delay:160ms]">{lead}</p>

          <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:220ms]">
            <Link href="/book" className="btn btn-primary btn-lg group">
              {t.common.bookAppointment}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <a href="#directions" className="btn btn-secondary btn-lg">Davolash yo&apos;nalishlari</a>
          </div>

          {/* Floating metric cards */}
          <div className="mt-10 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]">
            {rating && (
              <div className="card flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#fff6e5] text-gold"><Star className="size-5 fill-gold" aria-hidden /></span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink">{rating.average.toFixed(1)} <span className="text-sm font-semibold text-muted">/ 5</span></p>
                  <p className="text-xs text-muted">{rating.count} ta bemor fikri</p>
                </div>
              </div>
            )}
            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-accent-soft ring-2 ring-white">
                {doctor.photoUrl && <FallbackImage src={doctor.photoUrl} alt="" fill sizes="40px" className="object-cover object-top" />}
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[15px] font-bold text-ink">{doctor.fullName}</p>
                <p className="truncate text-xs text-muted">{doctor.title}</p>
              </div>
            </div>
            {doctor.yearsExperience ? (
              <div className="card flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent"><Award className="size-5" aria-hidden /></span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink">{doctor.yearsExperience}+</p>
                  <p className="text-xs text-muted">{t.trust.experience}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div aria-hidden className="absolute inset-x-6 bottom-0 top-10 rounded-[32px] bg-gradient-to-br from-accent to-[#157f93]" />
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[28px] shadow-lift lg:max-w-[480px]">
            <DoctorPortrait photoUrl={doctor.photoUrl} name={doctor.fullName} priority />
          </div>
        </div>
      </div>
    </section>
  );
}
