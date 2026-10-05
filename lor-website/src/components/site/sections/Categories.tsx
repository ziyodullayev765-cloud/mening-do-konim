import { Microscope, Pill, Scissors, Stethoscope, type LucideIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import type { ServiceCategoryKey } from "@/lib/schemas/service";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

const ICONS: Record<ServiceCategoryKey, LucideIcon> = {
  CONSULTATION: Stethoscope,
  DIAGNOSTICS: Microscope,
  TREATMENT: Pill,
  SURGERY: Scissors,
};

/** "Departments" cards from the reference — one per category that has services. */
export function Categories({ counts }: { counts: { category: ServiceCategoryKey; count: number }[] }) {
  if (counts.length === 0) return null;
  return (
    <section aria-labelledby="categories-title" className="section pb-0 lg:pb-0">
      <div className="container-x">
        <SectionHeading id="categories-title" align="center" eyebrow={t.home.categoriesTitle} title={t.home.categoriesTitle} lead={t.home.categoriesLead} hideEyebrow />
        <ul className={`mt-12 grid gap-4 sm:gap-5 ${counts.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : counts.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
          {counts.map(({ category, count }, i) => {
            const Icon = ICONS[category];
            return (
              <Reveal as="li" key={category} delay={i * 70}>
                <a
                  href="#services"
                  className="group flex h-full flex-col items-center rounded-[28px] border border-white bg-gradient-to-b from-white to-paper-2 px-4 py-8 text-center shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift sm:py-10"
                >
                  <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#e3efff] to-[#c4dcfa] text-accent shadow-[inset_0_1px_0_white] transition-transform duration-300 group-hover:scale-105 sm:size-20">
                    <Icon className="size-8 sm:size-10" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="mt-5 font-serif text-lg font-semibold text-ink">{t.admin.categories[category]}</span>
                  <span className="mt-1 text-sm text-muted">{t.home.servicesCount.replace("{count}", String(count))}</span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
