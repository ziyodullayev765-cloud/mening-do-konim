import type { Service } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatDuration, formatPrice, isPlaceholder } from "@/lib/format";
import { Block } from "../Block";

/** One list for everything: replaces the separate services, procedures and pricing sections. */
export function Services({ services }: { services: Service[] }) {
  const groups = [
    { title: t.pricing.consultations, items: services.filter((s) => s.kind === "SERVICE") },
    { title: t.pricing.procedures, items: services.filter((s) => s.kind === "PROCEDURE") },
  ].filter((g) => g.items.length);

  return (
    <Block id="services" label={t.nav.services} title={t.pricing.title}>
      {groups.length === 0 ? (
        <p className="text-muted">{t.services.empty}</p>
      ) : (
        <div className="space-y-12">
          {groups.map((g) => (
            <div key={g.title}>
              {groups.length > 1 && <h3 className="text-sm font-semibold text-ink">{g.title}</h3>}
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {g.items.map((s) => {
                  const duration = formatDuration(s.durationMinutes);
                  const extra = [s.indication && `${t.procedures.indication}: ${s.indication}`, s.recovery && `${t.procedures.recovery}: ${s.recovery}`].filter(Boolean);
                  return (
                    <li key={s.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{s.name}</p>
                        {s.description && !isPlaceholder(s.description) && <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.description}</p>}
                        {extra.map((e) => <p key={e as string} className="mt-1 text-sm text-muted">{e}</p>)}
                      </div>
                      <div className="flex shrink-0 items-baseline gap-4 sm:text-right">
                        {duration && <span className="text-sm text-muted">{duration}</span>}
                        <span className={`whitespace-nowrap tabular-nums ${s.price == null ? "text-sm text-muted" : "font-semibold text-ink"}`}>
                          {formatPrice(s.price, s.priceFrom)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="text-sm text-muted">{t.pricing.lead}</p>
        </div>
      )}
    </Block>
  );
}
