import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { Block } from "../Block";
import { Reveal } from "../Reveal";

export async function Testimonials({ items }: { items: Testimonial[] }) {
  const t = await getT();
  if (items.length === 0) return null;
  return (
    <Block id="reviews" label={t.site.reviews} title={t.site.reviewsTitle}>
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal as="li" key={item.id} delay={(i % 3) * 70}>
            <figure className="card lift flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <Quote className="size-6 text-accent/40" aria-hidden />
                {item.rating != null && (
                  <span className="flex gap-0.5" aria-label={`${item.rating}/5`}>
                    {Array.from({ length: 5 }, (_, s) => <Star key={s} className={`size-4 ${s < item.rating! ? "fill-gold text-gold" : "text-line-strong"}`} aria-hidden />)}
                  </span>
                )}
              </div>
              <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-text">{item.text}</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4 font-bold text-ink">{item.patientName}</figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Block>
  );
}
