import { Clock } from "lucide-react";
import type { Service } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { formatDuration, formatPrice, isPlaceholder } from "@/lib/format";
import { Block } from "../Block";
import { Reveal } from "../Reveal";

/** Single price list (consultations + procedures). */
export async function Services({ services }: { services: Service[] }) {
  const t = await getT();
  const groups = [
    { title: t.pricing.consultations, items: services.filter((s) => s.kind === "SERVICE") },
    { title: t.pricing.procedures, items: services.filter((s) => s.kind === "PROCEDURE") },
  ].filter((g) => g.items.length);

  return (
    <Block id="prices" label={t.site.prices} title={t.site.pricesTitle} lead={t.pricing.lead}>
      {groups.length === 0 ? (
        <p className="text-muted">{t.services.empty}</p>
      ) : (
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {groups.map((g, gi) => (
            <Reveal key={g.title} delay={gi * 80} className="glass-card overflow-hidden">
              <h3 className="border-b border-white/70 bg-white/50 px-4 py-3 text-sm sm:px-6 sm:py-4 font-bold text-ink">{g.title}</h3>
              <ul className="divide-y divide-ink/[0.07]">
                {g.items.map((s) => {
                  const duration = formatDuration(s.durationMinutes, t);
                  return (
                    <li key={s.id} className="flex items-start justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4 transition-colors hover:bg-white/60">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-ink sm:text-base">{s.name}</p>
                        {s.description && !isPlaceholder(s.description) && <p className="mt-0.5 text-[13px] leading-relaxed text-muted sm:text-sm">{s.description}</p>}
                        {duration && <p className="mt-1 flex items-center gap-1 text-xs text-muted"><Clock className="size-3.5" aria-hidden />{duration}</p>}
                      </div>
                      <span className={`shrink-0 whitespace-nowrap tabular-nums ${s.price == null ? "text-[13px] text-muted sm:text-sm" : "text-[15px] font-bold text-ink sm:text-base"}`}>
                        {formatPrice(s.price, s.priceFrom, t)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      )}
    </Block>
  );
}
