"use client";

import { Check, Clock } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDuration, formatPrice } from "@/lib/format";
import { serviceIcon } from "@/lib/icons";
import type { BookableService } from "./types";

export function ServiceStep({
  services,
  selected,
  onSelect,
}: {
  services: BookableService[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const groups = [
    { title: t.pricing.consultations, items: services.filter((s) => s.kind === "SERVICE") },
    { title: t.pricing.procedures, items: services.filter((s) => s.kind === "PROCEDURE") },
  ].filter((g) => g.items.length);

  return (
    <fieldset>
      <legend className="font-serif text-2xl text-ink">{t.booking.selectServiceOptional}</legend>
      <p className="mt-2 text-sm text-muted">{t.booking.serviceOptionalHint}</p>
      <div className="mt-6 space-y-8">
        {groups.map((g) => (
          <div key={g.title}>
            {groups.length > 1 && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{g.title}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {g.items.map((s) => {
                const Icon = serviceIcon(s.icon);
                const active = s.id === selected;
                const duration = formatDuration(s.durationMinutes);
                return (
                  <label
                    key={s.id}
                    className={`relative flex cursor-pointer gap-4 rounded-xl border bg-surface p-4 transition-[border-color,box-shadow,background-color] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                      active ? "border-accent shadow-[0_0_0_1px_var(--color-accent)]" : "border-line hover:border-line-strong"
                    }`}
                  >
                    {/* Checkbox semantics so a chosen service can be un-selected again (choice is optional). */}
                    <input type="checkbox" name="service" value={s.id} checked={active} onChange={() => onSelect(active ? null : s.id)} className="sr-only" />
                    <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${active ? "bg-accent text-white" : "bg-accent-soft text-accent"}`}>
                      <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{s.name}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                        <span className="font-medium text-text">{formatPrice(s.price, s.priceFrom)}</span>
                        {duration && (
                          <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{duration}</span>
                        )}
                      </span>
                    </span>
                    {active && (
                      <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-accent text-white">
                        <Check className="size-3.5" aria-hidden />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
