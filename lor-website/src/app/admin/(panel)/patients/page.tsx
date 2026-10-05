import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/admin/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.patients };
}

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const t = await getT();
  await requireAdmin();
  const q = (await searchParams).q?.trim().slice(0, 100) || undefined;
  const patients = await db.patient.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q.replace(/[^\d+]/g, "") || q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      _count: { select: { appointments: true } },
      appointments: { orderBy: [{ date: "desc" }, { time: "desc" }], take: 1, select: { date: true } },
    },
  });

  return (
    <>
      <PageHeader title={t.admin.nav.patients} />
      <form className="card mb-6 flex gap-2 p-4" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={q} placeholder={t.admin.patients.search} className="input pl-9" aria-label={t.admin.patients.search} />
        </div>
        <button type="submit" className="btn btn-dark">{t.admin.appointments.filter}</button>
      </form>

      {patients.length === 0 ? (
        <EmptyState message={t.admin.patients.empty} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-paper-2/50 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-5 py-3">{t.admin.appointments.patient}</th>
                  <th className="px-5 py-3">{t.admin.appointments.phone}</th>
                  <th className="px-5 py-3">{t.admin.patients.appointments}</th>
                  <th className="px-5 py-3">{t.admin.patients.lastVisit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-paper-2/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/patients/${p.id}`} className="font-medium text-ink hover:text-accent">{p.fullName}</Link>
                      {p.email && <span className="block text-muted">{p.email}</span>}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums">{p.phone}</td>
                    <td className="px-5 py-3.5 tabular-nums">{p._count.appointments}</td>
                    <td className="px-5 py-3.5 text-muted">{p.appointments[0] ? formatDate(p.appointments[0].date, false, t) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
