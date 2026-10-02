import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { Counter } from "../Counter";
import { Reveal } from "../Reveal";

/** Only shows figures the doctor has actually entered — never invented numbers. */
export function TrustBar({ doctor }: { doctor: Doctor }) {
  const items = [
    { value: doctor.yearsExperience, label: t.trust.experience },
    { value: doctor.patientsTreated, label: t.trust.patients },
    { value: doctor.proceduresPerformed, label: t.trust.procedures },
    { value: doctor.certificationsCount, label: t.trust.certifications },
  ].filter((i): i is { value: number; label: string } => i.value != null && i.value > 0);

  if (items.length === 0) return null;

  return (
    <section aria-label="Raqamlar" className="border-y border-line bg-surface/60">
      <div className="container-x">
        <dl className={`grid grid-cols-2 divide-line md:divide-x ${items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 80} className="px-2 py-8 md:px-8 md:py-10">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block font-serif text-[clamp(2.25rem,1.8rem+1.6vw,3.25rem)] leading-none text-ink">
                  <Counter value={item.value} suffix="+" />
                </span>
                <span className="mt-3 block text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">{item.label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
