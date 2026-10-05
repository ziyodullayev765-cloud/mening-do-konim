import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { autoRu } from "@/lib/i18n/content-ru";
import { formatDate } from "@/lib/format";
import { clinicNow, getSettings } from "@/lib/slots";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";

export default async function DashboardPage() {
  const t = await getT();
  const svc = (name: string) => (t.meta.locale === "ru" ? autoRu(name) : name);
  await requireAdmin();
  const settings = await getSettings();
  const today = clinicNow(settings.timezone).date;

  const [todayCount, upcoming, newCount, completed, cancelled, patients, services, unread, todayList, recent] = await Promise.all([
    db.appointment.count({ where: { date: today, status: { not: "CANCELLED" } } }),
    db.appointment.count({ where: { date: { gte: today }, status: { in: ["NEW", "CONFIRMED", "RESCHEDULED"] } } }),
    db.appointment.count({ where: { status: "NEW" } }),
    db.appointment.count({ where: { status: "COMPLETED" } }),
    db.appointment.count({ where: { status: "CANCELLED" } }),
    db.patient.count(),
    db.service.count({ where: { active: true } }),
    db.contactMessage.count({ where: { isRead: false } }),
    db.appointment.findMany({
      where: { date: today, status: { not: "CANCELLED" } },
      orderBy: { time: "asc" },
      include: { patient: { select: { fullName: true, phone: true } } },
    }),
    db.appointment.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { patient: { select: { fullName: true } } },
    }),
  ]);

  const stats = [
    { label: t.admin.dashboard.today, value: todayCount, href: `/admin/appointments?date=${today}` },
    { label: t.admin.dashboard.upcoming, value: upcoming, href: "/admin/appointments?upcoming=1" },
    { label: t.admin.dashboard.newRequests, value: newCount, href: "/admin/appointments?status=NEW", highlight: newCount > 0 },
    { label: t.admin.dashboard.completed, value: completed, href: "/admin/appointments?status=COMPLETED" },
    { label: t.admin.dashboard.cancelled, value: cancelled, href: "/admin/appointments?status=CANCELLED" },
    { label: t.admin.dashboard.patients, value: patients, href: "/admin/patients" },
    { label: t.admin.dashboard.services, value: services, href: "/admin/services" },
    { label: t.admin.dashboard.unreadMessages, value: unread, href: "/admin/messages", highlight: unread > 0 },
  ];

  return (
    <>
      <PageHeader title={t.admin.nav.dashboard} description={formatDate(today, true, t)} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`card group p-5 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-lift ${s.highlight ? "border-accent/40" : ""}`}
          >
            <p className="text-[13px] font-medium text-muted">{s.label}</p>
            <p className={`mt-2 font-serif text-4xl tabular-nums ${s.highlight ? "text-accent" : "text-ink"}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title={t.admin.dashboard.todayList}>
          {todayList.length === 0 ? (
            <EmptyState message={t.admin.dashboard.noToday} />
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {todayList.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/appointments/${a.id}`} className="flex items-center gap-4 py-3 hover:bg-paper-2/40">
                    <span className="w-14 font-semibold tabular-nums text-ink">{a.time}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{a.patient.fullName}</span>
                      <span className="block truncate text-sm text-muted">{svc(a.serviceName)}</span>
                    </span>
                    <StatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t.admin.dashboard.recent}
          actions={
            <Link href="/admin/appointments?status=NEW" className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-strong">
              {t.admin.nav.appointments} <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <EmptyState message={t.admin.dashboard.noRecent} />
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {recent.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/appointments/${a.id}`} className="flex items-center gap-4 py-3 hover:bg-paper-2/40">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{a.patient.fullName}</span>
                      <span className="block truncate text-sm text-muted">{svc(a.serviceName)}</span>
                    </span>
                    <span className="text-right text-sm tabular-nums text-muted">
                      {formatDate(a.date, false, t)}
                      <span className="block font-semibold text-ink">{a.time}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
