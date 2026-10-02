import { Award, BookOpen, GraduationCap, Users } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { lines } from "@/lib/format";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

/** Lines are formatted as "Period | Description" (period optional). */
function parseHistory(text: string) {
  return lines(text).map((line) => {
    const [a, ...rest] = line.split("|");
    return rest.length ? { period: a.trim(), text: rest.join("|").trim() } : { period: "", text: a.trim() };
  });
}

export function Experience({ doctor }: { doctor: Doctor }) {
  const history = parseHistory(doctor.professionalHistory);
  const groups = [
    { icon: GraduationCap, title: t.qualifications.education, items: lines(doctor.education) },
    { icon: BookOpen, title: t.qualifications.training, items: lines(doctor.training) },
    { icon: Award, title: t.qualifications.certifications, items: lines(doctor.certifications) },
    { icon: Users, title: t.qualifications.memberships, items: lines(doctor.memberships) },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <section id="experience" aria-labelledby="experience-title" className="section bg-paper-2/60">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="experience-title" eyebrow={t.experience.eyebrow} title={t.experience.title} />
          </div>
          <div className="lg:col-span-8">
            {history.length === 0 ? (
              <p className="text-muted">{t.experience.empty}</p>
            ) : (
              <ol className="relative border-l border-line-strong pl-8">
                {history.map((h, i) => (
                  <Reveal as="li" key={i} delay={i * 60} className="relative pb-10 last:pb-0">
                    <span aria-hidden className="absolute top-1.5 -left-[37px] size-[9px] rounded-full border-2 border-paper bg-accent ring-1 ring-accent" />
                    {h.period && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{h.period}</p>}
                    <p className="mt-1.5 text-lg leading-snug text-ink">{h.text}</p>
                  </Reveal>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      {groups.length > 0 && (
        <section id="qualifications" aria-labelledby="qualifications-title" className="section">
          <div className="container-x">
            <SectionHeading id="qualifications-title" eyebrow={t.qualifications.eyebrow} title={t.qualifications.title} />
            <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 md:[&>*:last-child:nth-child(odd)]:col-span-2">
              {groups.map((g, i) => (
                <Reveal key={g.title} delay={i * 70} className="bg-surface p-7 lg:p-9">
                  <div className="flex items-center gap-3">
                    <g.icon className="size-5 text-accent" strokeWidth={1.6} aria-hidden />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{g.title}</h3>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {g.items.map((item) => (
                      <li key={item} className="text-[16px] leading-snug text-ink">{item}</li>
                    ))}
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
