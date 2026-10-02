import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, CheckCheck, Mail, Phone, X } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { formatDate, formatDateTime } from "@/lib/format";
import { getSettings } from "@/lib/slots";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { TextArea, TextField } from "@/components/admin/fields";
import { rescheduleAppointment, saveAppointmentNote, setAppointmentStatus } from "@/app/admin/actions/appointments";

export const metadata: Metadata = { title: t.admin.appointments.details };

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [a, settings] = await Promise.all([
    db.appointment.findUnique({ where: { id }, include: { patient: true } }),
    getSettings(),
  ]);
  if (!a) notFound();

  const rows: [string, React.ReactNode][] = [
    [t.admin.appointments.patient, <Link key="p" href={`/admin/patients/${a.patientId}`} className="font-semibold text-accent hover:underline">{a.patient.fullName}</Link>],
    [t.admin.appointments.phone, <a key="ph" href={`tel:${a.patient.phone}`} className="inline-flex items-center gap-1.5 tabular-nums hover:text-accent"><Phone className="size-3.5" aria-hidden />{a.patient.phone}</a>],
    [t.admin.appointments.email, a.patient.email ? <a key="e" href={`mailto:${a.patient.email}`} className="inline-flex items-center gap-1.5 hover:text-accent"><Mail className="size-3.5" aria-hidden />{a.patient.email}</a> : "—"],
    [t.admin.appointments.service, a.serviceName],
    [t.admin.appointments.date, formatDate(a.date, true)],
    [t.admin.appointments.time, <span key="t" className="tabular-nums">{a.time}</span>],
    [t.admin.appointments.status, <StatusBadge key="s" status={a.status} />],
    [t.admin.appointments.note, a.note ? <span key="n" className="whitespace-pre-line">{a.note}</span> : "—"],
    [t.admin.appointments.created, formatDateTime(a.createdAt, settings.timezone)],
  ];

  const isClosed = a.status === "COMPLETED" || a.status === "CANCELLED";

  return (
    <>
      <Link href="/admin/appointments" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> {t.admin.nav.appointments}
      </Link>
      <PageHeader title={t.admin.appointments.details} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <dl className="divide-y divide-line">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-4 py-3 first:pt-0 last:pb-0">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="col-span-2 text-[15px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="space-y-6 lg:col-span-2">
          <Panel title={t.admin.appointments.status}>
            <ActionForm action={setAppointmentStatus} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={a.id} />
              {a.status !== "CONFIRMED" && !isClosed && (
                <SubmitButton name="status" value="CONFIRMED" className="btn btn-primary btn-sm">
                  <CalendarCheck className="size-4" aria-hidden /> {t.admin.appointments.confirm}
                </SubmitButton>
              )}
              {a.status !== "COMPLETED" && a.status !== "CANCELLED" && (
                <SubmitButton name="status" value="COMPLETED" className="btn btn-dark btn-sm">
                  <CheckCheck className="size-4" aria-hidden /> {t.admin.appointments.complete}
                </SubmitButton>
              )}
              {a.status !== "CANCELLED" && (
                <ConfirmButton name="status" value="CANCELLED" message={t.admin.appointments.cancelConfirm} className="btn btn-secondary btn-sm !text-danger">
                  <X className="size-4" aria-hidden /> {t.admin.appointments.cancel}
                </ConfirmButton>
              )}
              {isClosed && (
                <SubmitButton name="status" value="NEW" className="btn btn-secondary btn-sm">
                  {t.status.NEW}
                </SubmitButton>
              )}
            </ActionForm>
          </Panel>

          <Panel title={t.admin.appointments.reschedule}>
            <ActionForm action={rescheduleAppointment} className="space-y-4">
              <input type="hidden" name="id" value={a.id} />
              <div className="grid grid-cols-2 gap-3">
                <TextField name="date" type="date" label={t.admin.appointments.newDate} defaultValue={a.date} required />
                <TextField name="time" type="time" step={300} label={t.admin.appointments.newTime} defaultValue={a.time} required />
              </div>
              <SubmitButton className="btn btn-secondary btn-sm">{t.admin.appointments.reschedule}</SubmitButton>
            </ActionForm>
          </Panel>

          <Panel title={t.admin.appointments.adminNote}>
            <ActionForm action={saveAppointmentNote} className="space-y-3">
              <input type="hidden" name="id" value={a.id} />
              <TextArea name="adminNote" label={t.admin.appointments.adminNote} defaultValue={a.adminNote} rows={3} className="[&>label]:sr-only" />
              <SubmitButton className="btn btn-secondary btn-sm">{t.admin.appointments.saveNote}</SubmitButton>
            </ActionForm>
          </Panel>
        </div>
      </div>
    </>
  );
}
