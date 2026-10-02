import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Service } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatDuration } from "@/lib/format";
import { serviceIcon } from "@/lib/icons";
import { PriceTag } from "../PriceTag";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" aria-labelledby="services-title" className="section bg-paper-2/60">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="services-title" eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} />
          <Reveal>
            <Link href="/book" className="btn btn-primary">{t.common.bookAppointment}</Link>
          </Reveal>
        </div>

        {services.length === 0 ? (
          <p className="mt-14 rounded-xl border border-dashed border-line-strong p-10 text-center text-muted">{t.services.empty}</p>
        ) : (
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = serviceIcon(s.icon);
              const duration = formatDuration(s.durationMinutes);
              return (
                <Reveal as="li" key={s.id} delay={(i % 3) * 70}>
                  <article className="group card flex h-full flex-col overflow-hidden transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift">
                    {s.imageUrl && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image src={s.imageUrl} alt={s.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6 lg:p-7">
                      <span className="grid size-11 place-items-center rounded-lg border border-line bg-accent-soft/60 text-accent">
                        <Icon className="size-5" strokeWidth={1.6} aria-hidden />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold text-ink">{s.name}</h3>
                      {s.description && <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{s.description}</p>}
                      <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
                        <div>
                          <PriceTag price={s.price} from={s.priceFrom} className="text-lg" />
                          {duration && (
                            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                              <Clock className="size-3.5" aria-hidden /> {duration}
                            </p>
                          )}
                        </div>
                        <Link href={`/book?service=${s.id}`} className="btn btn-secondary btn-sm group/btn" aria-label={`${t.common.bookNow}: ${s.name}`}>
                          {t.common.bookNow}
                          <ArrowUpRight className="size-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" aria-hidden />
                        </Link>
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
