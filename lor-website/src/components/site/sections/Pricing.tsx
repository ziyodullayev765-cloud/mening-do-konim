import Link from "next/link";
import type { Service } from "@prisma/client";
import { t } from "@/lib/i18n";
import { PriceTag } from "../PriceTag";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

function PriceGroup({ title, items }: { title: string; items: Service[] }) {
  if (items.length === 0) return null;
  return (
    <Reveal className="card overflow-hidden">
      <h3 className="border-b border-line bg-paper-2/50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{title}</h3>
      <ul className="divide-y divide-line">
        {items.map((s) => (
          <li key={s.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{s.name}</p>
              {s.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{s.description}</p>}
            </div>
            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <PriceTag price={s.price} from={s.priceFrom} className="whitespace-nowrap text-[17px]" />
              <Link href={`/book?service=${s.id}`} className="btn btn-secondary btn-sm" aria-label={`${t.common.bookNow}: ${s.name}`}>
                {t.common.bookNow}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Pricing({ items }: { items: Service[] }) {
  const consultations = items.filter((s) => s.kind === "SERVICE");
  const procedures = items.filter((s) => s.kind === "PROCEDURE");
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="section">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading id="pricing-title" eyebrow={t.pricing.eyebrow} title={t.pricing.title} lead={t.pricing.lead} />
            <Reveal className="mt-8">
              <Link href="/book" className="btn btn-primary">{t.common.bookAppointment}</Link>
            </Reveal>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-8">
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong p-10 text-center text-muted">{t.pricing.empty}</p>
          ) : (
            <>
              <PriceGroup title={t.pricing.consultations} items={consultations} />
              <PriceGroup title={t.pricing.procedures} items={procedures} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
