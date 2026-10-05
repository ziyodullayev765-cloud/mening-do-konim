import type { Testimonial } from "@prisma/client";
import { t } from "@/lib/i18n";
import { Block } from "../Block";

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <Block id="testimonials" label={t.testimonials.eyebrow}>
      <ul className="grid gap-10 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <figure>
              <blockquote className="font-serif text-xl leading-relaxed text-ink">“{item.text}”</blockquote>
              <figcaption className="mt-3 text-sm text-muted">
                {item.patientName}
                {item.rating != null && <span className="ml-2 text-gold" aria-label={`${item.rating}/5`}>{"★".repeat(item.rating)}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Block>
  );
}
