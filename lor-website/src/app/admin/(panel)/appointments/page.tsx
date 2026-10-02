import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { clinicNow, getSettings } from "@/lib/slots";
import { DATE_RE } from "@/lib/slots-shared";
import { statusSchema } from "@/lib/validation";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: t.admin.nav.appointments };

const PAGE_SIZE = 50;

type Search = { q?: string; status?: string; service?: string; date?: string; upcoming?: string; page?: string };

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = statusSchema.safeParse(sp.status).data;
  const date = sp.date && DATE_RE.test(sp.date) ? sp.date : undefined;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const settings = await getSettings();
  const today = clinicNow(settings.timezone).date;

  const where: Prisma.AppointmentWhereInput = {
    ...(status && { status }),
    ...(sp.service && { serviceId: sp.service }),
    ...(date && { date }),
    ...(sp.upcoming && !date && { date: { gte: today }, status: status ?? { in: ["NEW", "CONFIRMED", "RESCHEDULED"] } }),
    ...(q && {
      OR: [
        { patient: { fullName: { contains: q, mode: "insensitive" } } },
        { patient: { phone: { contains: q.replace(/[^\d+]/g, "") || q } } },
        { serviceName: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total, services] = await Promise.all([
    db.appointment.findMany({
      where,
      orderBy: sp.upcoming ? [{ date: "asc" }, { time: "asc" }] : [{ date: "desc" }, { time: "desc" }],
      include: { patient: { select: { fullName: true, phone: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.appointment.count({ where }),
    db.service.findMany({ orderBy: [{ kind: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const params = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    params.set("page", String(p));
    return `?${params}`;
  };

  return (
    <>
      <PageHeader title={t.admin.nav.appointments} description={`${total}`} />

      <form className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={q} placeholder={t.admin.appointments.search} className="input pl-9" aria-label={t.admin.appointments.search} />
        </div>
        <input type="date" name="date" defaultValue={date} className="input" aria-label={t.admin.appointments.date} />
        <select name="status" defaultValue={status ?? ""} className="input" aria-label={t.admin.appointments.status}>
          <option value="">{t.admin.appointments.allStatuses}</option>
          {(["NEW", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as const).map((s) => (
            <option key={s} value={s}>{t.status[s]}</option>
          ))}
        </select>
        <select name="service" defaultValue={sp.service ?? ""} className="input" aria-label={t.admin.appointments.service}>
          <option value="">{t.admin.appointments.allServices}</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-dark flex-1">{t.admin.appointments.filter}</button>
          <Link href="/admin/appointments" className="btn btn-ghost">{t.admin.appointments.reset}</Link>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState message={t.admin.appointments.empty} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-paper-2/50 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-5 py-3">{t.admin.appointments.date}</th>
                  <th className="px-5 py-3">{t.admin.appointments.patient}</th>
                  <th className="px-5 py-3">{t.admin.appointments.service}</th>
                  <th className="px-5 py-3">{t.admin.appointments.status}</th>
                  <th className="px-5 py-3"><span className="sr-only">{t.admin.table.actions}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((a) => (
                  <tr key={a.id} className={`hover:bg-paper-2/40 ${a.date === today ? "bg-accent-soft/25" : ""}`}>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-semibold tabular-nums text-ink">{a.time}</span>
                      <span className="ml-2 text-muted">{formatDate(a.date)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-ink">{a.patient.fullName}</span>
                      <span className="text-muted tabular-nums">{a.patient.phone}</span>
                    </td>
                    <td className="px-5 py-3.5 text-text">{a.serviceName}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/admin/appointments/${a.id}`} className="btn btn-secondary btn-sm">{t.admin.appointments.open}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Sahifalar">
          {page > 1 && <Link href={qs(page - 1)} className="btn btn-secondary btn-sm">{t.common.back}</Link>}
          <span className="px-3 text-sm text-muted tabular-nums">{page} / {pages}</span>
          {page < pages && <Link href={qs(page + 1)} className="btn btn-secondary btn-sm">{t.common.next}</Link>}
        </nav>
      )}
    </>
  );
}
