import { CalendarCheck, Clock3, ReceiptText, ShieldCheck } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import { Reveal } from "../Reveal";

/**
 * Stats come only from figures entered in the admin panel; the trust items
 * describe how the practice works (no invented medical claims).
 */
const TRUST = [
  { icon: CalendarCheck, title: "Onlayn yozilish", text: "Qulay kun va vaqtni bir daqiqada tanlang — navbatda kutmang." },
  { icon: ReceiptText, title: "Aniq narxlar", text: "Asosiy xizmatlar narxi oldindan ma'lum, yashirin to'lovlar yo'q." },
  { icon: Clock3, title: "Belgilangan vaqt", text: "Qabul jadval asosida — har bir bemorga yetarli vaqt ajratiladi." },
  { icon: ShieldCheck, title: "Shaxsiy yondashuv", text: "Tashxis va davolash rejasi shifokor ko'rigidan so'ng tuziladi." },
];

export function Highlights({ doctor }: { doctor: Doctor }) {
  const stats = [
    { value: doctor.yearsExperience, label: t.trust.experience },
    { value: doctor.patientsTreated, label: t.trust.patients },
    { value: doctor.proceduresPerformed, label: t.trust.procedures },
    { value: doctor.certificationsCount, label: t.trust.certifications },
  ].filter((s): s is { value: number; label: string } => s.value != null && s.value > 0);

  return (
    <section aria-label="Afzalliklar" className="bg-ink text-white">
      <div className="container-x py-20 lg:py-24">
        {stats.length > 0 && (
          <dl className={`grid grid-cols-2 gap-8 border-b border-white/10 pb-14 ${stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : ""}`}>
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <dd className="text-[clamp(2.4rem,1.8rem+2vw,3.4rem)] font-extrabold tracking-tight text-white tabular-nums">{formatNumber(s.value)}+</dd>
                <dt className="mt-1 text-[15px] text-white/60">{s.label}</dt>
              </Reveal>
            ))}
          </dl>
        )}
        <ul className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${stats.length ? "mt-14" : ""}`}>
          {TRUST.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 80}>
              <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.08]">
                <item.icon className="size-7 text-[#6fd3e3]" strokeWidth={1.7} aria-hidden />
                <p className="mt-5 font-bold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
