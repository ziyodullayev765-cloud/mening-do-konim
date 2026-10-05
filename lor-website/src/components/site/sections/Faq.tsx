import { Plus } from "lucide-react";
import type { Faq as FaqItem } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { Block } from "../Block";
import { Reveal } from "../Reveal";

export async function Faq({ items }: { items: FaqItem[] }) {
  const t = await getT();
  if (items.length === 0) return null;
  return (
    <Block id="faq" label={t.faq.eyebrow} title={t.faq.title} tone="white">
      <Reveal className="mx-auto max-w-3xl space-y-2 sm:space-y-3">
        {items.map((f) => (
          <details key={f.id} className="group card overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-left text-[14.5px] sm:gap-6 sm:px-6 sm:py-5 sm:text-[16px] font-bold text-ink hover:text-accent [&::-webkit-details-marker]:hidden">
              {f.question}
              <span className="grid size-7 shrink-0 sm:size-8 place-items-center rounded-full bg-accent-soft text-accent transition-transform duration-300 group-open:rotate-45">
                <Plus className="size-4" aria-hidden />
              </span>
            </summary>
            <p className="px-4 pb-4 text-[14px] leading-relaxed sm:px-6 sm:pb-6 sm:text-[15px] whitespace-pre-line text-muted">{f.answer}</p>
          </details>
        ))}
      </Reveal>
    </Block>
  );
}
