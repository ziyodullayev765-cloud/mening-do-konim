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
    <Block id="prices" label={t.site.prices} title={t.site.pricesTitle} lead={t.pricing.lead} tone="white">
      {groups.length === 0 ? (
        <p className="text-muted">{t.services.empty}</p>
      ) : (
        <div className="mx-auto max-w-4xl space-y-6">
          {groups.map((g, gi) => (
            <Reveal key={g.title} delay={gi * 80} className="card overflow-hidden">
              <h3 className="border-b border-line bg-paper px-6 py-4 text-sm font-bold text-ink">{g.title}</h3>
              <ul className="divide-y divide-line">
                {g.items.map((s) => {
                  const duration = formatDuration(s.durationMinutes, t);
                  return (
                    <li key={s.id} className="flex items-start justify-between gap-6 px-6 py-4 transition-colors hover:bg-paper">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{s.name}</p>
                        {s.description && !isPlaceholder(s.description) && <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.description}</p>}
                        {duration && <p className="mt-1 flex items-center gap-1 text-xs text-muted"><Clock className="size-3.5" aria-hidden />{duration}</p>}
                      </div>
                      <span className={`shrink-0 whitespace-nowrap tabular-nums ${s.price == null ? "text-sm text-muted" : "font-bold text-ink"}`}>
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
