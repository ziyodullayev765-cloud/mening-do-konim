"use client";

import { useState } from "react";
import { CalendarDays, Clock, Moon, Sparkles, Sun, Sunrise } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { formatDate } from "@/lib/format";

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const toTime = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function TimeStep({
  date,
  slots,
  slotMinutes,
  selected,
  onSelect,
  onChangeDate,
}: {
  date: string;
  slots: string[];
  slotMinutes: number;
  selected: string | null;
  onSelect: (time: string) => void;
  onChangeDate: () => void;
}) {
  const { t, L } = useI18n();
  const periods = [
    { id: "morning", label: t.booking.morning, Icon: Sunrise, items: slots.filter((s) => s < "12:00") },
    { id: "afternoon", label: t.booking.afternoon, Icon: Sun, items: slots.filter((s) => s >= "12:00" && s < "17:00") },
    { id: "evening", label: t.booking.evening, Icon: Moon, items: slots.filter((s) => s >= "17:00") },
  ].filter((p) => p.items.length);

  const initial = periods.find((p) => selected && p.items.includes(selected))?.id ?? periods[0]?.id;
  const [active, setActive] = useState(initial);
  const current = periods.find((p) => p.id === active) ?? periods[0];
  const end = (time: string) => toTime(toMin(time) + slotMinutes);

  return (
    <fieldset>
      <legend className="font-serif text-2xl text-ink">{t.booking.selectTime}</legend>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-accent" aria-hidden />
          {formatDate(date, true, t)}
        </span>
        <button type="button" onClick={onChangeDate} className="text-sm font-semibold text-accent hover:underline">
          {L("Sanani o'zgartirish", "Изменить дату")}
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line-strong p-8 text-center text-muted">{t.booking.noSlots}</p>
      ) : (
        <>
          {/* Fastest path: the earliest free time */}
          <button
            type="button"
            onClick={() => onSelect(slots[0])}
            className="group mt-5 flex w-full items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft/60 px-4 py-3 text-left transition-colors hover:border-accent"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-white">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-muted">{L("Eng yaqin bo'sh vaqt", "Ближайшее свободное время")}</span>
              <span className="block font-semibold text-ink tabular-nums">
                {slots[0]} – {end(slots[0])}
              </span>
            </span>
            <span className="text-sm font-semibold text-accent group-hover:underline">{L("Tanlash", "Выбрать")}</span>
          </button>

          {/* Part of the day */}
          <div role="tablist" className="mt-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${periods.length}, minmax(0, 1fr))` }}>
            {periods.map((p) => {
              const on = p.id === current.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(p.id)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 transition-colors ${
                    on ? "border-accent bg-accent text-white shadow-[0_8px_20px_-10px_rgb(30_157_178/0.8)]" : "border-line bg-surface text-ink hover:border-accent"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                    <p.Icon className="size-4" aria-hidden /> {p.label}
                  </span>
                  <span className={`text-xs tabular-nums ${on ? "text-white/85" : "text-muted"}`}>
                    {L(`${p.items.length} ta bo'sh`, `свободно: ${p.items.length}`)}
                  </span>
                </button>
              );
            })}
          </div>

          <div key={current.id} role="tabpanel" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {current.items.map((time, i) => {
              const on = time === selected;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onSelect(time)}
                  aria-pressed={on}
                  aria-label={`${time} – ${end(time)}`}
                  style={{ "--i": i } as React.CSSProperties}
                  className={`slot-in flex flex-col items-center rounded-xl border py-2.5 tabular-nums transition-[color,background-color,border-color,transform] active:scale-95 ${
                    on ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                  }`}
                >
                  <span className="text-[16px] font-bold">{time}</span>
                  <span className={`text-[11px] ${on ? "text-white/80" : "text-muted"}`}>– {end(time)}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
            <Clock className="size-4" aria-hidden />
            {L(`Bitta qabul taxminan ${slotMinutes} daqiqa davom etadi.`, `Один приём длится около ${slotMinutes} минут.`)}
          </p>
        </>
      )}
    </fieldset>
  );
}
