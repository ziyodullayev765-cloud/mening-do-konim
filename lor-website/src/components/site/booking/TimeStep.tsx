"use client";

import { useI18n } from "../I18nProvider";
import { formatDate } from "@/lib/format";

export function TimeStep({
  date,
  slots,
  selected,
  onSelect,
}: {
  date: string;
  slots: string[];
  selected: string | null;
  onSelect: (time: string) => void;
}) {
  const { t } = useI18n();
  const groups = [
    { label: t.booking.morning, items: slots.filter((s) => s < "12:00") },
    { label: t.booking.afternoon, items: slots.filter((s) => s >= "12:00" && s < "17:00") },
    { label: t.booking.evening, items: slots.filter((s) => s >= "17:00") },
  ].filter((g) => g.items.length);

  return (
    <fieldset>
      <legend className="font-serif text-2xl text-ink">{t.booking.selectTime}</legend>
      <p className="mt-1 text-muted">{formatDate(date, true, t)}</p>
      {slots.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line-strong p-8 text-center text-muted">{t.booking.noSlots}</p>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{g.label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {g.items.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelect(time)}
                    aria-pressed={time === selected}
                    className={`rounded-lg border py-3 text-[15px] font-semibold tabular-nums transition-colors ${
                      time === selected
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-surface text-ink hover:border-accent hover:text-accent"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}
