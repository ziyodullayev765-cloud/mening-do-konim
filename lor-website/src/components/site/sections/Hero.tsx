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
      <div className="container-x relative grid items-center gap-12 pt-6 pb-10 sm:pt-10 sm:pb-16 lg:grid-cols-12 lg:pt-14 lg:pb-24">
        <div className="min-w-0 lg:col-span-6">
          {location && (
            <p className="inline-flex max-w-full animate-fade-up items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink shadow-soft sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-[13px]">
              <MapPin className="size-3.5 shrink-0 text-accent sm:size-4" aria-hidden /> <span className="truncate">{location}</span>
            </p>
          )}
          {/* Phones: headline with a small portrait beside it, so the photo stays on the first screen. */}
          <div className="mt-4 flex animate-fade-up items-center gap-4 [animation-delay:80ms] sm:mt-6 lg:block">
            <h1 id="hero-title" className="h-display min-w-0 flex-1 text-[1.85rem] sm:text-[clamp(2.4rem,1.5rem+3.2vw,4rem)]">
              {doctor.heroTitle || t.site.heroTitle}
            </h1>
            <div className="relative aspect-[4/5] w-[104px] shrink-0 overflow-hidden rounded-2xl shadow-lift ring-4 ring-white sm:w-36 lg:hidden">
              <DoctorPortrait photoUrl={doctor.photoUrl} name={doctor.fullName} priority />
            </div>
          </div>
          <p className="mt-4 max-w-xl animate-fade-up text-[15px] leading-relaxed text-muted [animation-delay:160ms] sm:mt-6 sm:text-lg">{lead}</p>

          <div className="mt-6 grid animate-fade-up grid-cols-2 gap-2.5 [animation-delay:220ms] sm:mt-9 sm:flex sm:flex-wrap sm:gap-3">
            <Link href="/book" className="btn btn-primary btn-hero group">
              {t.common.bookAppointment}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 sm:size-5" aria-hidden />
            </Link>
            <a href="#directions" className="btn btn-secondary btn-hero">{t.site.directions}</a>
          </div>

          {/* Metric cards — one swipeable row on phones */}
          <div className="no-scrollbar -mx-4 mt-6 flex animate-fade-up snap-x gap-2.5 scroll-px-4 overflow-x-auto px-4 pb-1 [animation-delay:300ms] sm:mx-0 sm:mt-10 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0">
            {rating && (
              <div className="card hero-metric">
                <span className="grid size-9 shrink-0 place-items-center rounded-full sm:size-10 bg-[#fff6e5] text-gold"><Star className="size-5 fill-gold" aria-hidden /></span>
                <div className="leading-tight">
                  <p className="text-base font-extrabold text-ink sm:text-lg">{rating.average.toFixed(1)} <span className="text-sm font-semibold text-muted">/ 5</span></p>
                  <p className="text-xs text-muted">{t.site.reviewsCount.replace("{count}", String(rating.count))}</p>
                </div>
              </div>
            )}
            {insta ? (
              <a
                href={instagramHref(insta)}
                target="_blank"
                rel="noopener noreferrer"
                className="card hero-metric group transition-[border-color,box-shadow] hover:border-[#e1306c]/40 hover:shadow-lift"
                aria-label={`Instagram: @${insta}`}
              >
                <span className="relative size-9 shrink-0 overflow-hidden rounded-full sm:size-10 bg-accent-soft ring-2 ring-[#e1306c]/60">
                  {doctor.photoUrl && <FallbackImage src={doctor.photoUrl} alt="" fill sizes="40px" className="object-cover object-top" />}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-bold text-ink sm:text-[15px]">@{insta}</p>
                  <p className="text-xs text-muted">{t.site.instagramMy}</p>
                </div>
                <span className="ml-1 grid size-8 shrink-0 sm:size-9 place-items-center rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white transition-transform group-hover:scale-105">
                  <InstagramIcon className="size-[18px]" />
                </span>
              </a>
            ) : (
              <div className="card hero-metric">
                <span className="relative size-9 shrink-0 overflow-hidden rounded-full sm:size-10 bg-accent-soft ring-2 ring-white">
                  {doctor.photoUrl && <FallbackImage src={doctor.photoUrl} alt="" fill sizes="40px" className="object-cover object-top" />}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-bold text-ink sm:text-[15px]">{doctor.fullName}</p>
                  <p className="truncate text-xs text-muted">{doctor.title}</p>
                </div>
              </div>
            )}
            {doctor.yearsExperience ? (
              <div className="card hero-metric">
                <span className="grid size-9 shrink-0 place-items-center rounded-full sm:size-10 bg-accent-soft text-accent"><Award className="size-5" aria-hidden /></span>
                <div className="leading-tight">
                  <p className="text-base font-extrabold text-ink sm:text-lg">{doctor.yearsExperience}+</p>
                  <p className="text-xs text-muted">{t.trust.experience}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative hidden lg:col-span-6 lg:block">
          <div aria-hidden className="absolute inset-x-6 bottom-0 top-10 rounded-[32px] bg-gradient-to-br from-accent to-[#157f93]" />
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[28px] shadow-lift lg:max-w-[480px]">
            <DoctorPortrait photoUrl={doctor.photoUrl} name={doctor.fullName} priority />
          </div>
        </div>
      </div>
    </section>
  );
}
