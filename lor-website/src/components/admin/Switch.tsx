"use client";

/** Accessible toggle switch (role="switch"). */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  pending,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  pending?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={pending || undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "border-accent bg-accent" : "border-line-strong bg-paper-2"
      } ${pending ? "opacity-70" : ""}`}
    >
      <span
        aria-hidden
        className={`inline-block size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
