import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { isPlaceholder, lines } from "@/lib/format";
import { Block } from "../Block";

function parseHistory(text: string) {
  return lines(text).map((line) => {
    const [a, ...rest] = line.split("|");
    return rest.length ? { period: a.trim(), text: rest.join("|").trim() } : { period: "", text: a.trim() };
  });
}

/** Text-only: photo and name are already shown in the hero. */
export function About({ doctor }: { doctor: Doctor }) {
  const real = (xs: string[]) => xs.filter((x) => !isPlaceholder(x));
  const bio = real(lines(doctor.biography));
  const expertise = real(lines(doctor.specializations));
  const education = real([...lines(doctor.education), ...lines(doctor.training)]);
  const certificates = real([...lines(doctor.certifications), ...lines(doctor.memberships)]);
  const history = parseHistory(doctor.professionalHistory).filter((h) => !isPlaceholder(h.text) && !isPlaceholder(h.period || "x"));

  const lists = [
    { title: t.experience.title, items: history.map((h) => ({ key: h.period + h.text, main: h.text, sub: h.period })) },
    { title: t.qualifications.education, items: education.map((e) => ({ key: e, main: e, sub: "" })) },
    { title: t.qualifications.certifications, items: certificates.map((c) => ({ key: c, main: c, sub: "" })) },
  ].filter((l) => l.items.length);

  if (!bio.length && !expertise.length && !lists.length) return null;

  return (
    <Block id="about" label={t.about.eyebrow}>
      {bio.length > 0 && (
        <div className="space-y-5 text-lg leading-relaxed text-text">
          {bio.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}

      {expertise.length > 0 && (
        <div className={bio.length ? "mt-10" : ""}>
          <h3 className="text-sm font-semibold text-ink">{t.about.expertise}</h3>
          <p className="mt-2 text-[16px] leading-relaxed text-muted">{expertise.join(" · ")}</p>
        </div>
      )}

      {lists.length > 0 && (
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {lists.map((l) => (
            <div key={l.title}>
              <h3 className="text-sm font-semibold text-ink">{l.title}</h3>
              <ul className="mt-3 space-y-3">
                {l.items.map((it) => (
                  <li key={it.key} className="text-[15px] leading-snug text-text">
                    {it.sub && <span className="block text-xs text-muted">{it.sub}</span>}
                    {it.main}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Block>
  );
}
