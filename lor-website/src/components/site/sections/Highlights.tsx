import { CalendarCheck, Clock3, ReceiptText, ShieldCheck } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { formatNumber } from "@/lib/format";
import { Reveal } from "../Reveal";

/**
 * Stats come only from figures entered in the admin panel; the trust items
 * describe how the practice works (no invented medical claims).
 */
const TRUST_ICONS = [CalendarCheck, ReceiptText, Clock3, ShieldCheck];

export async function Highlights({ doctor }: { doctor: Doctor }) {
  const t = await getT();
  const stats = [
    { value: doctor.yearsExperience, label: t.trust.experience },
    { value: doctor.patientsTreated, label: t.trust.patients },
    { value: doctor.proceduresPerformed, label: t.trust.procedures },
    { value: doctor.certificationsCount, label: t.trust.certifications },
  ].filter((s): s is { value: number; label: string } => s.value != null && s.value > 0);

  return (
    <section aria-label={t.site.advantages}>
      <div className="container-x py-12 sm:py-20 lg:py-24">
        {stats.length > 0 && (
          <dl className={`grid grid-cols-2 gap-5 border-b border-line pb-8 sm:gap-8 sm:pb-14 ${stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : ""}`}>
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <dd className="text-[clamp(1.615rem,1.275rem+1.7vw,2.89rem)] font-extrabold tracking-tight text-ink tabular-nums">{formatNumber(s.value)}+</dd>
                <dt className="mt-1 text-[13px] text-muted sm:text-[15px]">{s.label}</dt>
              </Reveal>
            ))}
          </dl>
        )}
        <ul className={`grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4 ${stats.length ? "mt-8 sm:mt-14" : ""}`}>
          {t.site.trust.map((item, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
            return (
            <Reveal as="li" key={item.title} delay={i * 80}>
              <div className="card lift h-full p-3.5 sm:p-6">
                <Icon className="size-5 text-accent sm:size-7" strokeWidth={1.7} aria-hidden />
                <p className="mt-2.5 text-[13.5px] leading-snug font-bold text-ink sm:mt-5 sm:text-base">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted sm:mt-2 sm:text-sm">{item.text}</p>
              </div>
            </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
