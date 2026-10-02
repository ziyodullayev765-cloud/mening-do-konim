import { Building2, MapPin } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { lines } from "@/lib/format";
import { DoctorPortrait } from "../DoctorPortrait";
import { Reveal } from "../Reveal";

export function About({ doctor }: { doctor: Doctor }) {
  const expertise = lines(doctor.specializations);
  const paragraphs = lines(doctor.biography);
  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] lg:sticky lg:top-28">
            <DoctorPortrait photoUrl={doctor.photoUrl} name={doctor.fullName} sizes="(min-width: 1024px) 35vw, 100vw" />
          </div>
        </Reveal>
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">{t.about.eyebrow}</p>
            <h2 id="about-title" className="h-section mt-4">{doctor.fullName}</h2>
            <p className="mt-3 font-serif text-xl italic text-accent">{doctor.title}</p>
          </Reveal>
          {paragraphs.length > 0 && (
            <Reveal delay={80} className="mt-8 space-y-5 text-[17px] leading-[1.75] text-text/90">
              {paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-ink" : ""}>
                  {p}
                </p>
              ))}
            </Reveal>
          )}

          {expertise.length > 0 && (
            <Reveal delay={120} className="mt-10">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t.about.expertise}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {expertise.map((e) => (
                  <li key={e} className="chip">{e}</li>
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal delay={160} className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {doctor.clinicName && (
              <div className="flex gap-4 bg-surface p-6">
                <Building2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.about.clinic}</p>
                  <p className="mt-1.5 font-medium text-ink">{doctor.clinicName}</p>
                </div>
              </div>
            )}
            {doctor.address && (
              <div className="flex gap-4 bg-surface p-6">
                <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.about.location}</p>
                  <p className="mt-1.5 font-medium text-ink">{doctor.address}</p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
