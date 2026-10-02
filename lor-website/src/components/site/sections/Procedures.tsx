import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";
import type { Service } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatDuration } from "@/lib/format";
import { PriceTag } from "../PriceTag";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

export function Procedures({ procedures }: { procedures: Service[] }) {
  return (
    <section id="procedures" aria-labelledby="procedures-title" className="section bg-ink text-paper/80">
      <div className="container-x">
        <div className="[&_.eyebrow]:text-[#8fc1c0] [&_h2]:text-paper [&_p]:text-paper/65">
          <SectionHeading id="procedures-title" eyebrow={t.procedures.eyebrow} title={t.procedures.title} lead={t.procedures.lead} />
        </div>

        {procedures.length === 0 ? (
          <p className="mt-14 rounded-xl border border-dashed border-white/20 p-10 text-center">{t.procedures.empty}</p>
        ) : (
          <ol className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {procedures.map((p, i) => {
              const duration = formatDuration(p.durationMinutes);
              const facts = [
                p.indication && { label: t.procedures.indication, value: p.indication },
                duration && { label: t.procedures.duration, value: duration },
                p.recovery && { label: t.procedures.recovery, value: p.recovery },
              ].filter(Boolean) as { label: string; value: string }[];
              return (
                <Reveal as="li" key={p.id}>
                  <article className="group grid gap-6 py-10 lg:grid-cols-12 lg:gap-10 lg:py-12">
                    <div className="flex items-start gap-5 lg:col-span-5">
                      <span className="pt-1 font-serif text-sm tabular-nums text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-serif text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] leading-tight text-paper">{p.name}</h3>
                        {p.description && <p className="mt-3 max-w-md text-[15px] leading-relaxed text-paper/65">{p.description}</p>}
                      </div>
                    </div>
                    <dl className="grid gap-5 sm:grid-cols-3 lg:col-span-4">
                      {facts.map((f) => (
                        <div key={f.label}>
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/45">{f.label}</dt>
                          <dd className="mt-1.5 text-[15px] text-paper/85">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="flex items-center justify-between gap-4 lg:col-span-3 lg:flex-col lg:items-end lg:justify-start">
                      <PriceTag price={p.price} from={p.priceFrom} className="text-xl !text-paper" />
                      <Link href={`/book?service=${p.id}`} className="btn btn-primary btn-sm">
                        <CalendarCheck className="size-4" aria-hidden />
                        {t.common.bookAppointment}
                      </Link>
                    </div>
                    {p.imageUrl && (
                      <div className="relative aspect-[21/9] overflow-hidden rounded-xl lg:col-span-12">
                        <Image src={p.imageUrl} alt={p.name} fill sizes="100vw" className="object-cover" loading="lazy" />
                      </div>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
