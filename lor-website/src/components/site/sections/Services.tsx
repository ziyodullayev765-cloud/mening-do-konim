import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import type { Service } from "@prisma/client";
import { t } from "@/lib/i18n";
import { formatDuration } from "@/lib/format";
import { serviceIcon } from "@/lib/icons";
import { BookTrigger } from "../booking/BookTrigger";
import { PriceTag } from "../PriceTag";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" aria-labelledby="services-title" className="section">
      <div className="container-x">
        <SectionHeading id="services-title" align="center" eyebrow={t.services.eyebrow} title={t.home.servicesTitle} lead={t.home.servicesLead} hideEyebrow />

        {services.length === 0 ? (
          <p className="mt-12 rounded-3xl border border-dashed border-line-strong p-10 text-center text-muted">{t.services.empty}</p>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = serviceIcon(s.icon);
              const duration = formatDuration(s.durationMinutes);
              return (
                <Reveal as="li" key={s.id} delay={(i % 3) * 70}>
                  <article className="group flex h-full flex-col rounded-[28px] border border-white bg-white p-3 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#eaf3ff] to-[#cfe2fa]">
                      {s.imageUrl ? (
                        <Image
                          src={s.imageUrl}
                          alt={s.name}
                          fill
                          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <Icon className="size-16 text-accent/45" strokeWidth={1.2} aria-hidden />
                        </div>
                      )}
                      <span className="glass absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-ink">
                        {t.admin.categories[s.category]}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
                      <h3 className="font-serif text-lg font-semibold text-ink">{s.name}</h3>
                      {s.description && <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{s.description}</p>}
                      {(s.indication || s.recovery) && (
                        <dl className="mt-3 space-y-1 text-[13px]">
                          {s.indication && (
                            <div><dt className="inline font-semibold text-ink">{t.procedures.indication}: </dt><dd className="inline text-muted">{s.indication}</dd></div>
                          )}
                          {s.recovery && (
                            <div><dt className="inline font-semibold text-ink">{t.procedures.recovery}: </dt><dd className="inline text-muted">{s.recovery}</dd></div>
                          )}
                        </dl>
                      )}
                      <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
                        <div>
                          <PriceTag price={s.price} from={s.priceFrom} className="text-[17px]" />
                          {duration && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                              <Clock className="size-3.5" aria-hidden /> {duration}
                            </p>
                          )}
                        </div>
                        <BookTrigger
                          className="btn btn-sm bg-accent-soft text-accent hover:bg-accent hover:text-white"
                          prefill={{ serviceId: s.id }}
                          ariaLabel={`${t.common.bookNow}: ${s.name}`}
                        >
                          {t.common.bookNow} <ArrowRight className="size-4" aria-hidden />
                        </BookTrigger>
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
