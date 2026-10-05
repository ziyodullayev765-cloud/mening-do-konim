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
      <section aria-labelledby="about-title" className="bg-white bg-[radial-gradient(55%_60%_at_95%_0%,#e4f5f8_0%,transparent_70%)]">
        <div className="container-x grid items-center gap-12 py-14 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-sm font-bold text-accent">{t.about.eyebrow}</p>
            <h1 id="about-title" className="h-display mt-3 text-[clamp(2.2rem,1.5rem+2.6vw,3.6rem)]">{doctor.fullName}</h1>
            <p className="mt-3 text-lg font-semibold text-muted">{doctor.title}</p>
            {bio.length > 0 ? (
              <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-text">
                {bio.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <p className="mt-8 text-muted">{t.site.bioSoon}</p>
            )}
            {stats.length > 0 && (
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dd className="text-3xl font-extrabold text-ink tabular-nums">{formatNumber(s.value)}+</dd>
                    <dt className="text-sm text-muted">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
            <Link href="/book" className="btn btn-primary btn-lg mt-10">
              {t.common.bookAppointment} <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[28px] shadow-lift">
              <DoctorPortrait photoUrl={doctor.aboutPhotoUrl ?? doctor.photoUrl} name={doctor.fullName} priority />
            </div>
          </div>
        </div>
      </section>

      {(history.length > 0 || cards.length > 0 || directions.length > 0) && (
        <section aria-label={t.site.aboutCardsTitle}>
          <div className="container-x grid gap-6 py-16 lg:grid-cols-12 lg:py-20">
            {history.length > 0 && (
              <Reveal className="card p-7 lg:col-span-5">
                <p className="flex items-center gap-2.5 text-lg font-bold text-ink"><Briefcase className="size-5 text-accent" aria-hidden />{t.experience.title}</p>
                <ol className="mt-6 space-y-6 border-l-2 border-accent-soft pl-6">
                  {history.map((h) => (
                    <li key={h.period + h.text} className="relative">
                      <span aria-hidden className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-white bg-accent" />
                      {h.period && <p className="text-xs font-bold text-accent">{h.period}</p>}
                      <p className="mt-0.5 text-[15px] text-ink">{h.text}</p>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}
            <div className={`grid gap-6 sm:grid-cols-2 ${history.length ? "lg:col-span-7" : "lg:col-span-12 lg:grid-cols-3"}`}>
              {directions.length > 0 && (
                <Reveal className="card p-7 sm:col-span-2">
                  <p className="text-lg font-bold text-ink">{t.about.expertise}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {directions.map((d) => <li key={d} className="rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-accent-strong">{d}</li>)}
                  </ul>
                </Reveal>
              )}
              {cards.map((c, i) => (
                <Reveal key={c.title} delay={i * 60} className="card p-7">
                  <p className="flex items-center gap-2.5 font-bold text-ink"><c.icon className="size-5 text-accent" aria-hidden />{c.title}</p>
                  <ul className="mt-4 space-y-2.5 text-[15px] text-text">
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
