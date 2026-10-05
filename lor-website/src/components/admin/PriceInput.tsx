"use client";

import { useFieldError } from "./ActionForm";
import { useI18n } from "@/components/site/I18nProvider";

export function PriceInput({ name, defaultValue, label }: { name: string; defaultValue: number | null; label: string }) {
  const { t } = useI18n();
  const error = useFieldError(name);
  return (
    <div>
      <div className="relative w-48">
        <input
          name={name}
          type="number"
          min={0}
          step={1000}
          inputMode="numeric"
          defaultValue={defaultValue ?? ""}
          placeholder="—"
          aria-label={label}
          aria-invalid={!!error}
          className="input pr-14 tabular-nums"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted">{t.common.currency}</span>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
