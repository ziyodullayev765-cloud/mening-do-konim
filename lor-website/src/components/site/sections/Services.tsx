import { Clock } from "lucide-react";
import type { Service } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatDuration } from "@/lib/format";
import { PriceTag } from "../PriceTag";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" aria-labelledby="services-title" className="section bg-paper-2/60">
      <div className="container-x">
        <SectionHeading id="services-title" eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} />

        {services.length === 0 ? (
          <p className="mt-14 rounded-xl border border-dashed border-line-strong p-10 text-center text-muted">{t.services.empty}</p>
        ) : (
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const duration = formatDuration(s.durationMinutes);
              return (
                <Reveal as="li" key={s.id} delay={(i % 3) * 70}>
                  <article className="group card flex h-full flex-col overflow-hidden transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift">
                    <div className="flex flex-1 flex-col p-6 lg:p-7">
                      <h3 className="text-lg font-semibold text-ink">{s.name}</h3>
                      {s.description && <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{s.description}</p>}
                      <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
                        <PriceTag price={s.price} from={s.priceFrom} className="text-lg" />
                        {duration && (
                          <p className="flex items-center gap-1.5 text-[13px] text-muted">
                            <Clock className="size-3.5" aria-hidden /> {duration}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
