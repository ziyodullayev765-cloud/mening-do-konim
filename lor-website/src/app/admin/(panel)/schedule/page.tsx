import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { clinicNow, getSettings, getWeekSchedule } from "@/lib/slots";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { TextField } from "@/components/admin/fields";
import { ScheduleRow } from "@/components/admin/ScheduleRow";
import { EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import { addBlockedDate, removeBlockedDate, saveSchedule } from "@/app/admin/actions/settings";

export const metadata: Metadata = { title: t.admin.nav.schedule };

export default async function SchedulePage() {
  await requireAdmin();
  const settings = await getSettings();
  const today = clinicNow(settings.timezone).date;
  const [week, blocked] = await Promise.all([
    getWeekSchedule(),
    db.blockedDate.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title={t.admin.nav.schedule} />
      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title={t.admin.schedule.weekly} className="xl:col-span-3">
          <ActionForm action={saveSchedule}>
            <div className="divide-y divide-line">
              {week.map((d) => (
                <ScheduleRow key={d.dayOfWeek} day={d} label={t.weekdays[d.dayOfWeek]} />
              ))}
            </div>
            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <SubmitButton>{t.common.save}</SubmitButton>
            </div>
          </ActionForm>
        </Panel>

        <Panel title={t.admin.schedule.blocked} className="xl:col-span-2">
          <p className="-mt-1 mb-5 text-sm text-muted">{t.admin.schedule.blockedLead}</p>
          <ActionForm action={addBlockedDate} resetOnSuccess className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end xl:grid-cols-1 2xl:grid-cols-[auto_1fr_auto]">
            <TextField name="date" type="date" min={today} label={t.admin.appointments.date} required />
            <TextField name="reason" label={t.admin.schedule.reason} />
            <SubmitButton className="btn btn-dark">{t.admin.schedule.addBlocked}</SubmitButton>
          </ActionForm>
          <div className="mt-6">
            {blocked.length === 0 ? (
              <EmptyState message={t.admin.schedule.noBlocked} />
            ) : (
              <ul className="divide-y divide-line">
                {blocked.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1">
                      <p className="font-medium text-ink">{formatDate(b.date, true)}</p>
                      {b.reason && <p className="text-sm text-muted">{b.reason}</p>}
                    </div>
                    <ActionForm action={removeBlockedDate}>
                      <input type="hidden" name="id" value={b.id} />
                      <ConfirmButton message={t.admin.services.deleteConfirm} className="btn btn-ghost btn-sm !text-danger">
                        <Trash2 className="size-4" aria-hidden />
                        <span className="sr-only">{t.admin.services.delete}</span>
                      </ConfirmButton>
                    </ActionForm>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
