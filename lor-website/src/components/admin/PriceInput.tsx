"use client";

import { useFieldError } from "./ActionForm";

export function PriceInput({ name, defaultValue, label }: { name: string; defaultValue: number | null; label: string }) {
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
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted">so&apos;m</span>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
