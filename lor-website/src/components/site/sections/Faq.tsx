import { Plus } from "lucide-react";
import type { Faq as FaqItem } from "@prisma/client";
import { t } from "@/lib/i18n";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section id="faq" aria-labelledby="faq-title" className="section">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-title" eyebrow={t.faq.eyebrow} title={t.faq.title} />
        </div>
        <Reveal className="lg:col-span-8">
          <div className="divide-y divide-line border-y border-line">
            {items.map((f) => (
              <details key={f.id} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-medium text-ink transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong transition-transform duration-300 group-open:rotate-45 group-open:border-accent group-open:text-accent">
                    <Plus className="size-4" aria-hidden />
                  </span>
                </summary>
                <div className="pb-7 pr-12 text-[16px] leading-relaxed whitespace-pre-line text-muted">{f.answer}</div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
