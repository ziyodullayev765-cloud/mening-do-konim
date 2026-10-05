import Link from "next/link";
import { ArrowRight, Award, MapPin, Star } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { isPlaceholder } from "@/lib/format";
import { DoctorPortrait } from "../DoctorPortrait";
import { FallbackImage } from "../FallbackImage";
import { InstagramIcon } from "../Logo";
import { instagramHref, instagramUsername } from "@/lib/social";


export async function Hero({ doctor, rating }: { doctor: Doctor; rating: { average: number; count: number } | null }) {
  const t = await getT();
  const ok = (v: string | null | undefined) => Boolean(v) && !isPlaceholder(v);
  const location = ok(doctor.heroBadge)
    ? doctor.heroBadge
    : ok(doctor.address)
      ? doctor.address
      : [doctor.city, doctor.country].filter(ok).join(", ");
  const insta = instagramUsername(doctor.instagram);
  const lead = ok(doctor.shortDescription) ? doctor.shortDescription : t.site.heroLead;

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden bg-white bg-[radial-gradient(55%_60%_at_95%_0%,#e4f5f8_0%,transparent_70%)]">
      <div className="container-x relative grid items-center gap-12 pt-10 pb-16 lg:grid-cols-12 lg:pt-14 lg:pb-24">
        <div className="lg:col-span-6">
          {location && (
            <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-soft">
              <MapPin className="size-4 text-accent" aria-hidden /> {location}
            </p>
          )}
          <h1 id="hero-title" className="h-display mt-6 animate-fade-up text-[clamp(2.4rem,1.5rem+3.2vw,4rem)] [animation-delay:80ms]">
            {doctor.heroTitle || t.site.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted [animation-delay:160ms]">{lead}</p>

          <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:220ms]">
            <Link href="/book" className="btn btn-primary btn-lg group">
              {t.common.bookAppointment}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <a href="#directions" className="btn btn-secondary btn-lg">{t.site.directionsTitle}</a>
          </div>

          {/* Floating metric cards */}
          <div className="mt-10 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]">
            {rating && (
              <div className="card flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#fff6e5] text-gold"><Star className="size-5 fill-gold" aria-hidden /></span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink">{rating.average.toFixed(1)} <span className="text-sm font-semibold text-muted">/ 5</span></p>
                  <p className="text-xs text-muted">{t.site.reviewsCount.replace("{count}", String(rating.count))}</p>
                </div>
              </div>
            )}
            {insta ? (
              <a
                href={instagramHref(insta)}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex items-center gap-3 px-4 py-3 transition-[border-color,box-shadow] hover:border-[#e1306c]/40 hover:shadow-lift"
                aria-label={`Instagram: @${insta}`}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-accent-soft ring-2 ring-[#e1306c]/60">
                  {doctor.photoUrl && <FallbackImage src={doctor.photoUrl} alt="" fill sizes="40px" className="object-cover object-top" />}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[15px] font-bold text-ink">@{insta}</p>
                  <p className="text-xs text-muted">{t.site.instagramMy}</p>
                </div>
                <span className="ml-1 grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white transition-transform group-hover:scale-105">
                  <InstagramIcon className="size-[18px]" />
                </span>
              </a>
            ) : (
              <div className="card flex items-center gap-3 px-4 py-3">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-accent-soft ring-2 ring-white">
                  {doctor.photoUrl && <FallbackImage src={doctor.photoUrl} alt="" fill sizes="40px" className="object-cover object-top" />}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[15px] font-bold text-ink">{doctor.fullName}</p>
                  <p className="truncate text-xs text-muted">{doctor.title}</p>
                </div>
              </div>
            )}
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
