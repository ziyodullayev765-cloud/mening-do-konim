import { Briefcase, GraduationCap, Award } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { isPlaceholder, lines } from "@/lib/format";
import { Block } from "../Block";
import { Reveal } from "../Reveal";

function parseHistory(text: string) {
  return lines(text).map((line) => {
    const [a, ...rest] = line.split("|");
    return rest.length ? { period: a.trim(), text: rest.join("|").trim() } : { period: "", text: a.trim() };
  });
}

export function About({ doctor }: { doctor: Doctor }) {
  const real = (xs: string[]) => xs.filter((x) => !isPlaceholder(x));
  const bio = real(lines(doctor.biography));
  const education = real([...lines(doctor.education), ...lines(doctor.training)]);
  const certificates = real([...lines(doctor.certifications), ...lines(doctor.memberships)]);
  const history = parseHistory(doctor.professionalHistory).filter((h) => !isPlaceholder(h.text) && !isPlaceholder(h.period || "x"));
  const cards = [
    { icon: Briefcase, title: t.experience.title, items: history.map((h) => ({ main: h.text, sub: h.period })) },
    { icon: GraduationCap, title: t.qualifications.education, items: education.map((e) => ({ main: e, sub: "" })) },
    { icon: Award, title: t.qualifications.certifications, items: certificates.map((c) => ({ main: c, sub: "" })) },
  ].filter((c) => c.items.length);

  if (!bio.length && !cards.length) return null;

  return (
    <Block id="about" label={t.about.eyebrow} title="Tajriba va malaka" tone="white">
      <div className="grid gap-10 lg:grid-cols-12">
        {bio.length > 0 && (
          <Reveal className="space-y-5 text-[17px] leading-relaxed text-text lg:col-span-7">
            {bio.map((p, i) => <p key={i}>{p}</p>)}
          </Reveal>
        )}
        {cards.length > 0 && (
          <div className={`grid gap-4 ${bio.length ? "lg:col-span-5" : "sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3"}`}>
            {cards.map((c, i) => (
              <Reveal key={c.title} delay={i * 80} className="card p-6">
                <p className="flex items-center gap-2.5 font-bold text-ink"><c.icon className="size-5 text-accent" aria-hidden />{c.title}</p>
                <ul className="mt-4 space-y-3">
                  {c.items.map((it) => (
                    <li key={it.sub + it.main} className="text-[15px] leading-snug text-text">
                      {it.sub && <span className="block text-xs font-semibold text-accent">{it.sub}</span>}
                      {it.main}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Block>
  );
}
