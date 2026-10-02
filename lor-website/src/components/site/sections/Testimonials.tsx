import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { t } from "@/lib/i18n";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

/** Rendered only when real testimonials have been added in the admin panel. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="section bg-paper-2/60">
      <div className="container-x">
        <SectionHeading id="testimonials-title" eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />
        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal as="li" key={item.id} delay={(i % 3) * 70}>
              <figure className="card flex h-full flex-col p-7">
                <Quote className="size-6 text-accent/50" aria-hidden />
                <blockquote className="mt-4 flex-1 font-serif text-[19px] leading-relaxed text-ink">{item.text}</blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t border-line pt-5">
                  <span className="font-semibold text-ink">{item.patientName}</span>
                  {item.rating != null && (
                    <span className="flex gap-0.5" aria-label={`${item.rating}/5`}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <Star key={s} className={`size-4 ${s < item.rating! ? "fill-gold text-gold" : "text-line-strong"}`} aria-hidden />
                      ))}
                    </span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
