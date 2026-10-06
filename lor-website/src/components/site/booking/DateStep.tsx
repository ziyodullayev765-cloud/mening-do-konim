"use client";

import { useI18n } from "../I18nProvider";
import type { Availability } from "./types";

function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function dow(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Calendar grid (Monday first) covering the booking window. */
export function DateStep({
  availability,
  selected,
  onSelect,
}: {
  availability: Availability;
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const { t, L } = useI18n();
  const free = new Map(availability.dates.map((d) => [d.date, d.slots]));
  const most = Math.max(1, ...availability.dates.map((d) => d.slots));
  const quick = availability.dates.slice(0, 3).map((d) => d.date);
  const quickLabel = (d: string) =>
    d === availability.from ? L("Bugun", "Сегодня") : d === addDays(availability.from, 1) ? L("Ertaga", "Завтра") : `${Number(d.slice(8))}-${t.months[Number(d.slice(5, 7)) - 1].slice(0, 3)}, ${t.weekdaysShort[dow(d)]}`;
  const start = addDays(availability.from, -((dow(availability.from) + 6) % 7));
  const cells: string[] = [];
  for (let d = start; d <= availability.to || cells.length % 7 !== 0; d = addDays(d, 1)) cells.push(d);

  const weeks: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const monthOf = (d: string) => Number(d.slice(5, 7)) - 1;

  return (
    <fieldset>
      <legend className="font-serif text-2xl text-ink">{t.booking.selectDate}</legend>
      {availability.dates.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line-strong p-8 text-center text-muted">{t.booking.noDates}</p>
      ) : (
        <>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">{L("Eng yaqin:", "Ближайшие:")}</span>
          {quick.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                d === selected ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:border-accent hover:text-accent"
              }`}
            >
              {quickLabel(d)} <span className="font-normal opacity-70">· {L(`${free.get(d)} ta`, `${free.get(d)}`)}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="grid grid-cols-7 border-b border-line bg-paper-2/50 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <div key={d} className="py-2.5">{t.weekdaysShort[d]}</div>
            ))}
          </div>
          <div role="grid" className="p-2">
            {weeks.map((week, wi) => (
              <div role="row" key={wi} className="grid grid-cols-7 gap-1">
                {week.map((d) => {
                  const inWindow = d >= availability.from && d <= availability.to;
                  const slots = free.get(d);
                  const isSelected = d === selected;
                  const day = Number(d.slice(8));
                  const showMonth = day === 1 || d === availability.from;
                  if (!inWindow) return <div role="gridcell" key={d} className="aspect-square" />;
                  return (
                    <div role="gridcell" key={d}>
                      <button
                        type="button"
                        disabled={!slots}
                        onClick={() => onSelect(d)}
                        aria-pressed={isSelected}
                        aria-label={`${day}-${t.months[monthOf(d)]}${slots ? ` — ${slots}` : ` — ${L("band", "занято")}`}`}
                        className={`flex aspect-square w-full flex-col items-center justify-center rounded-lg text-[15px] font-semibold tabular-nums transition-colors ${
                          isSelected
                            ? "bg-accent text-white"
                            : slots
                              ? "text-ink hover:bg-accent-soft"
                              : "cursor-not-allowed text-muted/40 line-through decoration-1"
                        }`}
                      >
                        {day}
                        {showMonth && (
                          <span className={`text-[9px] font-semibold uppercase tracking-wide ${isSelected ? "text-white/80" : "text-muted"}`}>
                            {t.months[monthOf(d)].slice(0, 3)}
                          </span>
                        )}
                        {slots ? (
                          <span
                            aria-hidden
                            className={`mt-0.5 size-1.5 rounded-full ${isSelected ? "bg-white" : slots / most > 0.4 ? "bg-success" : "bg-warning"}`}
                          />
                        ) : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" />{L("Bo'sh vaqt ko'p", "Много свободного времени")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />{L("Oz qoldi", "Осталось мало")}</span>
        </p>
        </>
      )}
    </fieldset>
  );
}
