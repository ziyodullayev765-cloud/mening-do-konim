"use client";

import { useState } from "react";
import type { WorkingDay } from "@prisma/client";
import { useI18n } from "@/components/site/I18nProvider";
import { useFieldError } from "./ActionForm";

export function ScheduleRow({ day, label }: { day: WorkingDay; label: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(day.isOpen);
  const error = useFieldError(`to_${day.dayOfWeek}`);
  const dow = day.dayOfWeek;
  return (
    <div className="py-3.5 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <label className="flex w-40 cursor-pointer items-center gap-3">
          <input type="checkbox" name={`open_${dow}`} checked={open} onChange={(e) => setOpen(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
          <span className={`font-medium ${open ? "text-ink" : "text-muted"}`}>{label}</span>
        </label>
        <div className={`flex items-center gap-2 ${open ? "" : "opacity-40"}`}>
          <input type="time" name={`from_${dow}`} defaultValue={day.openTime} step={300} className="input w-32" aria-label={`${label} — ${t.admin.schedule.from}`} />
          <span className="text-muted">–</span>
          <input type="time" name={`to_${dow}`} defaultValue={day.closeTime} step={300} className="input w-32" aria-label={`${label} — ${t.admin.schedule.to}`} aria-invalid={!!error} />
        </div>
        {!open && <span className="text-sm text-muted">{t.contact.closed}</span>}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
