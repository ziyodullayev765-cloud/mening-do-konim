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
      <Reveal className="mx-auto max-w-3xl space-y-3">
        {items.map((f) => (
          <details key={f.id} className="group card overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-left text-[16px] font-bold text-ink hover:text-accent [&::-webkit-details-marker]:hidden">
              {f.question}
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-transform duration-300 group-open:rotate-45">
                <Plus className="size-4" aria-hidden />
              </span>
            </summary>
            <p className="px-6 pb-6 text-[15px] leading-relaxed whitespace-pre-line text-muted">{f.answer}</p>
          </details>
        ))}
      </Reveal>
    </Block>
  );
}
