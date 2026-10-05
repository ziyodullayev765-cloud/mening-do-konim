"use client";

import { useI18n } from "@/components/site/I18nProvider";
import type { ServiceCategoryKey } from "@/lib/schemas/service";

export const CATEGORY_STYLES: Record<ServiceCategoryKey, { badge: string; dot: string }> = {
  CONSULTATION: { badge: "bg-accent-soft text-accent-strong border-accent/20", dot: "bg-accent" },
  DIAGNOSTICS: { badge: "bg-[#e8eef7] text-[#2b4c7e] border-[#2b4c7e]/15", dot: "bg-[#2b4c7e]" },
  TREATMENT: { badge: "bg-warning-soft text-warning border-warning/20", dot: "bg-warning" },
  SURGERY: { badge: "bg-[#f6e9ec] text-[#8a3346] border-[#8a3346]/15", dot: "bg-[#8a3346]" },
};

export function CategoryBadge({ category }: { category: ServiceCategoryKey }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${CATEGORY_STYLES[category].badge}`}>
      <span className={`size-1.5 rounded-full ${CATEGORY_STYLES[category].dot}`} aria-hidden />
      {t.admin.categories[category]}
    </span>
  );
}
