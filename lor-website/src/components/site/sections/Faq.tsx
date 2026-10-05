import { Plus } from "lucide-react";
import type { Faq as FaqItem } from "@prisma/client";
import { t } from "@/lib/i18n";
import { Block } from "../Block";

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <Block id="faq" label={t.faq.eyebrow} title={t.faq.title}>
      <div className="divide-y divide-line border-y border-line">
        {items.map((f) => (
          <details key={f.id} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[17px] font-medium text-ink hover:text-accent [&::-webkit-details-marker]:hidden">
              {f.question}
              <Plus className="size-4 shrink-0 text-muted group-open:rotate-45" aria-hidden />
            </summary>
            <p className="pr-10 pb-6 text-[16px] leading-relaxed whitespace-pre-line text-muted">{f.answer}</p>
          </details>
        ))}
      </div>
    </Block>
  );
}
