import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { autoRu } from "@/lib/i18n/content-ru";
import { formatDate } from "@/lib/format";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.patients };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const svc = (name: string) => (t.meta.locale === "ru" ? autoRu(name) : name);
  await requireAdmin();
  const { id } = await params;
  const patient = await db.patient.findUnique({
    where: { id },
    include: { appointments: { orderBy: [{ date: "desc" }, { time: "desc" }] } },
  });
  if (!patient) notFound();

  const servicesBooked = [...new Set(patient.appointments.map((a) => svc(a.serviceName)))];

  return (
    <>
      <Link href="/admin/patients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> {t.admin.nav.patients}
      </Link>
      <PageHeader back={false} title={patient.fullName} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel>
          <ul className="space-y-3 text-[15px]">
            <li>
              <a href={`tel:${patient.phone}`} className="flex items-center gap-2 tabular-nums hover:text-accent">
                <Phone className="size-4 text-muted" aria-hidden /> {patient.phone}
              </a>
            </li>
            {patient.email && (
              <li>
                <a href={`mailto:${patient.email}`} className="flex items-center gap-2 break-all hover:text-accent">
                  <Mail className="size-4 text-muted" aria-hidden /> {patient.email}
                </a>
              </li>
            )}
          </ul>
          {servicesBooked.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t.admin.patients.servicesBooked}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {servicesBooked.map((s) => <li key={s} className="chip">{s}</li>)}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title={t.admin.patients.history} className="lg:col-span-2">
          {patient.appointments.length === 0 ? (
            <EmptyState message={t.admin.appointments.empty} />
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {patient.appointments.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/appointments/${a.id}`} className="flex items-center gap-4 py-3 hover:bg-paper-2/40">
                    <span className="w-36 shrink-0 text-sm">
                      <span className="block font-semibold text-ink">{formatDate(a.date, false, t)}</span>
                      <span className="tabular-nums text-muted">{a.time}</span>
                    </span>
                    <span className="min-w-0 flex-1 truncate">{svc(a.serviceName)}</span>
                    <StatusBadge status={a.status} />
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
