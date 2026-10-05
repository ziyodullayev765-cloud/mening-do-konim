import { Briefcase, GraduationCap } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatNumber, lines } from "@/lib/format";
import { DoctorPortrait } from "../DoctorPortrait";
import { Reveal } from "../Reveal";

function parseHistory(text: string) {
  return lines(text).map((line) => {
    const [a, ...rest] = line.split("|");
    return rest.length ? { period: a.trim(), text: rest.join("|").trim() } : { period: "", text: a.trim() };
  });
}

export function About({ doctor }: { doctor: Doctor }) {
  const paragraphs = lines(doctor.biography);
  const expertise = lines(doctor.specializations);
  const education = [...lines(doctor.education), ...lines(doctor.training), ...lines(doctor.certifications), ...lines(doctor.memberships)];
  const history = parseHistory(doctor.professionalHistory);
  // Only real, entered figures are shown.
  const stats = [
    { value: doctor.yearsExperience, label: t.trust.experience },
    { value: doctor.patientsTreated, label: t.trust.patients },
    { value: doctor.proceduresPerformed, label: t.trust.procedures },
  ].filter((s): s is { value: number; label: string } => s.value != null && s.value > 0);

  return (
    <section id="about" aria-labelledby="about-title" className="section bg-gradient-to-b from-paper to-paper-2/70">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="relative lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#e3efff] to-[#bcd6f6] shadow-lift">
              <DoctorPortrait photoUrl={doctor.aboutPhotoUrl ?? doctor.photoUrl} name={doctor.fullName} sizes="(min-width: 1024px) 35vw, 100vw" />
            </div>
            {stats.length > 0 && (
              <div className="glass absolute inset-x-4 -bottom-6 grid grid-cols-3 gap-2 rounded-3xl p-4 text-center">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-serif text-2xl font-semibold text-ink tabular-nums">{formatNumber(s.value)}+</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">{t.home.aboutEyebrow}</p>
            <h2 id="about-title" className="h-section mt-3">{doctor.fullName}</h2>
            <p className="mt-2 font-medium text-accent">{doctor.title}</p>
          </Reveal>

          {paragraphs.length > 0 && (
            <Reveal delay={60} className="mt-6 space-y-4 text-[16.5px] leading-[1.75] text-text/90">
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </Reveal>
          )}

          {expertise.length > 0 && (
            <Reveal delay={100} className="mt-7 flex flex-wrap gap-2">
              {expertise.map((e) => <span key={e} className="chip border-accent/15 bg-accent-soft text-accent-strong">{e}</span>)}
            </Reveal>
          )}

          {(education.length > 0 || history.length > 0) && (
            <Reveal delay={140} className="mt-10 grid gap-4 sm:grid-cols-2">
              {education.length > 0 && (
                <div className="rounded-3xl border border-white bg-white p-6 shadow-soft">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <GraduationCap className="size-5 text-accent" aria-hidden /> {t.home.education}
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-[15px] text-text/90">
                    {education.map((e) => (
                      <li key={e} className="flex gap-2.5"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {history.length > 0 && (
                <div className="rounded-3xl border border-white bg-white p-6 shadow-soft">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Briefcase className="size-5 text-accent" aria-hidden /> {t.home.career}
                  </h3>
                  <ul className="mt-4 space-y-3 text-[15px]">
                    {history.map((h, i) => (
                      <li key={i}>
                        {h.period && <span className="block text-xs font-semibold text-accent">{h.period}</span>}
                        <span className="text-text/90">{h.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
