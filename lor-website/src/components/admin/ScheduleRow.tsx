"use client";

import { useState } from "react";
import type { WorkingDay } from "@prisma/client";
import { Coffee, X } from "lucide-react";
import { useI18n } from "@/components/site/I18nProvider";
import { useFieldError } from "./ActionForm";

/** Slots per day for the given hours (used for the live "N appointments" hint). */
function countSlots(from: string, to: string, bFrom: string, bTo: string, step: number) {
  const m = (t: string) => (/^\d{2}:\d{2}$/.test(t) ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) : NaN);
  const [o, c, bf, bt] = [m(from), m(to), m(bFrom), m(bTo)];
  if (!(c > o) || step < 5) return 0;
  const hasBreak = bt > bf;
  let n = 0;
  for (let x = o; x + step <= c; x += step) if (!(hasBreak && x < bt && x + step > bf)) n++;
  return n;
}

type DayState = { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string; breakStart: string; breakEnd: string };

/** The whole week, with "copy this day to all open days". */
export function WeekEditor({ days, labels, slotMinutes }: { days: WorkingDay[]; labels: string[]; slotMinutes: number }) {
  const { L } = useI18n();
  const [week, setWeek] = useState<DayState[]>(days.map(({ dayOfWeek, isOpen, openTime, closeTime, breakStart, breakEnd }) => ({ dayOfWeek, isOpen, openTime, closeTime, breakStart, breakEnd })));
  const [copied, setCopied] = useState(false);
  const total = week.reduce((n, d) => n + (d.isOpen ? countSlots(d.openTime, d.closeTime, d.breakStart, d.breakEnd, slotMinutes) : 0), 0);
  const first = week.find((d) => d.isOpen);

  return (
    <>
      <div className="-mt-1 mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {L(`Haftasiga jami ${total} ta qabul o'rni (bitta qabul ${slotMinutes} daqiqa).`, `Всего ${total} мест в неделю (один приём — ${slotMinutes} мин).`)}
        </p>
        {first && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setWeek((w) => w.map((d) => (d.isOpen ? { ...first, dayOfWeek: d.dayOfWeek } : d)));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            }}
          >
            {copied ? L("Nusxalandi ✓", "Скопировано ✓") : L(`${labels[first.dayOfWeek]} vaqtini barcha ish kunlariga`, `Время «${labels[first.dayOfWeek]}» на все рабочие дни`)}
          </button>
        )}
      </div>
      <div className="divide-y divide-line">
        {week.map((d, i) => (
          <ScheduleRow
            key={d.dayOfWeek}
            day={d}
            label={labels[d.dayOfWeek]}
            slotMinutes={slotMinutes}
            onChange={(patch) => setWeek((w) => w.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
          />
        ))}
      </div>
    </>
  );
}

function ScheduleRow({ day, label, slotMinutes, onChange }: { day: DayState; label: string; slotMinutes: number; onChange: (patch: Partial<DayState>) => void }) {
  const { t, L } = useI18n();
  const dow = day.dayOfWeek;
  const { isOpen: open, openTime: from, closeTime: to, breakStart: bFrom, breakEnd: bTo } = day;
  const setOpen = (v: boolean) => onChange({ isOpen: v });
  const setFrom = (v: string) => onChange({ openTime: v });
  const setTo = (v: string) => onChange({ closeTime: v });
  const setBFrom = (v: string) => onChange({ breakStart: v });
  const setBTo = (v: string) => onChange({ breakEnd: v });
  const hasBreak = Boolean(bFrom || bTo);
  const error = useFieldError(`to_${dow}`);
  const slots = countSlots(from, to, hasBreak ? bFrom : "", hasBreak ? bTo : "", slotMinutes);

  return (
    <div className="py-3.5 first:pt-0" data-schedule-row={dow}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <label className="flex w-32 cursor-pointer items-center gap-3">
          <input type="checkbox" name={`open_${dow}`} checked={open} onChange={(e) => setOpen(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
          <span className={`font-medium ${open ? "text-ink" : "text-muted"}`}>{label}</span>
        </label>
        <div className={`flex items-center gap-2 ${open ? "" : "opacity-40"}`}>
          <input type="time" name={`from_${dow}`} value={from} onChange={(e) => setFrom(e.target.value)} step={300} className="input w-[6.9rem]" aria-label={`${label} — ${t.admin.schedule.from}`} />
          <span className="text-muted">–</span>
          <input type="time" name={`to_${dow}`} value={to} onChange={(e) => setTo(e.target.value)} step={300} className="input w-[6.9rem]" aria-label={`${label} — ${t.admin.schedule.to}`} aria-invalid={!!error} />
        </div>
        {open ? (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent tabular-nums">
            {L(`${slots} ta qabul`, `${slots} приёмов`)}
          </span>
        ) : (
          <span className="text-sm text-muted">{t.contact.closed}</span>
        )}
      </div>

      {open && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-0 sm:pl-7">
          {hasBreak ? (
            <>
              <Coffee className="size-4 text-muted" aria-hidden />
              <span className="text-sm text-muted">{L("Tanaffus", "Перерыв")}</span>
              <input type="time" name={`bfrom_${dow}`} value={bFrom} onChange={(e) => setBFrom(e.target.value)} step={300} className="input h-9 w-[6.9rem] py-1" aria-label={`${label} — ${L("tanaffus boshlanishi", "начало перерыва")}`} />
              <span className="text-muted">–</span>
              <input type="time" name={`bto_${dow}`} value={bTo} onChange={(e) => setBTo(e.target.value)} step={300} className="input h-9 w-[6.9rem] py-1" aria-label={`${label} — ${L("tanaffus tugashi", "конец перерыва")}`} />
              <button
                type="button"
                onClick={() => onChange({ breakStart: "", breakEnd: "" })}
                className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                aria-label={L("Tanaffusni olib tashlash", "Убрать перерыв")}
              >
                <X className="size-4" aria-hidden />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onChange({ breakStart: "13:00", breakEnd: "14:00" })}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-accent hover:bg-accent-soft"
            >
              <Coffee className="size-4" aria-hidden /> {L("+ Tushlik / tanaffus", "+ Обед / перерыв")}
            </button>
          )}
        </div>
      )}
      {/* a closed day keeps its break for when it is reopened */}
      {!open && (
        <>
          <input type="hidden" name={`bfrom_${dow}`} value={bFrom} />
          <input type="hidden" name={`bto_${dow}`} value={bTo} />
        </>
      )}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
