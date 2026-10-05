import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { PriceInput } from "@/components/admin/PriceInput";
import { savePrices } from "@/app/admin/actions/services";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.prices };
}

export default async function PricesPage() {
  const t = await getT();
  await requireAdmin();
  const items = await db.service.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <PageHeader title={t.admin.nav.prices} description={t.admin.prices.lead} />
      {items.length === 0 ? (
        <EmptyState message={t.admin.services.empty} />
      ) : (
        <ActionForm action={savePrices}>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-line bg-paper-2/50 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                  <tr>
                    <th className="px-5 py-3">{t.admin.table.name}</th>
                    <th className="px-5 py-3">{t.admin.table.kind}</th>
                    <th className="px-5 py-3">{t.admin.services.price}</th>
                    <th className="px-5 py-3">{t.common.priceFrom.replace("{price} ", "…")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((s) => (
                    <tr key={s.id} className={s.active ? "" : "opacity-60"}>
                      <td className="px-5 py-3 font-medium text-ink">
                        <input type="hidden" name="id" value={s.id} />
                        {s.name}
                      </td>
                      <td className="px-5 py-3 text-muted">{t.admin.kinds[s.kind]}</td>
                      <td className="px-5 py-3">
                        <PriceInput name={`price_${s.id}`} defaultValue={s.price} label={`${s.name} — ${t.admin.services.price}`} />
                      </td>
                      <td className="px-5 py-3">
                        <input type="checkbox" name={`from_${s.id}`} defaultChecked={s.priceFrom} className="size-4 accent-[var(--color-accent)]" aria-label={`${s.name} — ${t.admin.services.priceFrom}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <SubmitButton>{t.admin.prices.saveAll}</SubmitButton>
          </div>
        </ActionForm>
      )}
    </>
  );
}
