import Link from "next/link";
import { ArrowRight, Award, Briefcase, GraduationCap, Users } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { formatNumber, isPlaceholder, lines } from "@/lib/format";
import { DoctorPortrait } from "../DoctorPortrait";
import { Reveal } from "../Reveal";

function parseHistory(text: string) {
  return lines(text).map((line) => {
    const [a, ...rest] = line.split("|");
    return rest.length ? { period: a.trim(), text: rest.join("|").trim() } : { period: "", text: a.trim() };
  });
}

/** Full "About the doctor" page content — every part is edited in Admin → Shifokor profili. */
export async function AboutPage({ doctor }: { doctor: Doctor }) {
  const t = await getT();
  const real = (xs: string[]) => xs.filter((x) => !isPlaceholder(x));
  const bio = real(lines(doctor.biography));
  const directions = real(lines(doctor.specializations));
  const history = parseHistory(doctor.professionalHistory).filter((h) => !isPlaceholder(h.text) && !isPlaceholder(h.period || "x"));
  const cards = [
    { icon: GraduationCap, title: t.qualifications.education, items: real(lines(doctor.education)) },
    { icon: Award, title: t.qualifications.training, items: real(lines(doctor.training)) },
    { icon: Award, title: t.qualifications.certifications, items: real(lines(doctor.certifications)) },
    { icon: Users, title: t.qualifications.memberships, items: real(lines(doctor.memberships)) },
  ].filter((c) => c.items.length);
  const stats = [
    { value: doctor.yearsExperience, label: t.trust.experience },
    { value: doctor.patientsTreated, label: t.trust.patients },
    { value: doctor.proceduresPerformed, label: t.trust.procedures },
  ].filter((s): s is { value: number; label: string } => s.value != null && s.value > 0);

  return (
    <>
      <section aria-labelledby="about-title" className="hero-glow bg-white bg-[radial-gradient(55%_60%_at_95%_0%,#e4f5f8_0%,transparent_70%)]">
        <div className="container-x grid items-center gap-12 py-8 sm:py-14 lg:grid-cols-12 lg:py-20">
          <div className="min-w-0 lg:col-span-7">
            {/* Phones: small portrait beside the name instead of a big photo below the text. */}
            <div className="flex items-center gap-4 lg:block">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-accent sm:text-sm">{t.about.eyebrow}</p>
                <h1 id="about-title" className="h-display mt-2 text-[1.6rem] sm:mt-3 sm:text-[clamp(2.2rem,1.5rem+2.6vw,3.6rem)]">{doctor.fullName}</h1>
                <p className="mt-1.5 text-sm font-semibold text-muted sm:mt-3 sm:text-lg">{doctor.title}</p>
              </div>
              <div className="relative aspect-[4/5] w-[96px] shrink-0 overflow-hidden rounded-2xl shadow-lift ring-4 ring-white sm:w-36 lg:hidden">
                <DoctorPortrait photoUrl={doctor.aboutPhotoUrl ?? doctor.photoUrl} name={doctor.fullName} priority />
              </div>
            </div>
            {bio.length > 0 ? (
              <div className="mt-5 space-y-3.5 text-[15px] leading-relaxed text-text sm:mt-8 sm:space-y-5 sm:text-[17px]">
                {bio.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <p className="mt-8 text-muted">{t.site.bioSoon}</p>
            )}
            {stats.length > 0 && (
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 sm:mt-10 sm:gap-x-10 sm:gap-y-4 sm:pt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dd className="text-2xl font-extrabold text-ink tabular-nums sm:text-3xl">{formatNumber(s.value)}+</dd>
                    <dt className="text-sm text-muted">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
            <Link href="/book" className="btn btn-primary btn-hero mt-6 w-full sm:mt-10 sm:w-auto">
              {t.common.bookAppointment} <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[28px] shadow-lift">
              <DoctorPortrait photoUrl={doctor.aboutPhotoUrl ?? doctor.photoUrl} name={doctor.fullName} priority />
            </div>
          </div>
        </div>
      </section>

      {(history.length > 0 || cards.length > 0 || directions.length > 0) && (
        <section aria-label={t.site.aboutCardsTitle}>
          <div className="container-x grid gap-3 py-8 sm:gap-6 sm:py-16 lg:grid-cols-12 lg:py-20">
            {history.length > 0 && (
              <Reveal className="card p-4 sm:p-7 lg:col-span-5">
                <p className="flex items-center gap-2.5 text-base font-bold text-ink sm:text-lg"><Briefcase className="size-5 text-accent" aria-hidden />{t.experience.title}</p>
                <ol className="mt-4 space-y-4 border-l-2 sm:mt-6 sm:space-y-6 border-accent-soft pl-6">
                  {history.map((h) => (
                    <li key={h.period + h.text} className="relative">
                      <span aria-hidden className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-white bg-accent" />
                      {h.period && <p className="text-xs font-bold text-accent">{h.period}</p>}
                      <p className="mt-0.5 text-sm text-ink sm:text-[15px]">{h.text}</p>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}
            <div className={`grid gap-3 sm:grid-cols-2 sm:gap-6 ${history.length ? "lg:col-span-7" : "lg:col-span-12 lg:grid-cols-3"}`}>
              {directions.length > 0 && (
                <Reveal className="card p-4 sm:col-span-2 sm:p-7">
                  <p className="text-base font-bold text-ink sm:text-lg">{t.about.expertise}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                    {directions.map((d) => <li key={d} className="rounded-full bg-accent-soft px-3 py-1 text-[13px] sm:px-3.5 sm:py-1.5 sm:text-sm font-semibold text-accent-strong">{d}</li>)}
                  </ul>
                </Reveal>
              )}
              {cards.map((c, i) => (
                <Reveal key={c.title} delay={i * 60} className="card p-4 sm:p-7">
                  <p className="flex items-center gap-2.5 font-bold text-ink"><c.icon className="size-5 text-accent" aria-hidden />{c.title}</p>
                  <ul className="mt-3 space-y-2 text-sm text-text sm:mt-4 sm:space-y-2.5 sm:text-[15px]">
                    {c.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
