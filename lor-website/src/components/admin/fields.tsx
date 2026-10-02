"use client";

import { useId } from "react";
import { useFieldError } from "./ActionForm";

type Base = { name: string; label: string; hint?: string; className?: string };

function Wrapper({ id, label, hint, error, className = "", children }: { id: string; label: string; hint?: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="mt-1.5 text-sm text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ name, label, hint, className, ...rest }: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <input id={id} name={name} className="input" aria-invalid={!!error} aria-describedby={`${id}-msg`} {...rest} />
    </Wrapper>
  );
}

export function TextArea({ name, label, hint, className, ...rest }: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <textarea id={id} name={name} className="input" rows={4} aria-invalid={!!error} aria-describedby={`${id}-msg`} {...rest} />
    </Wrapper>
  );
}

export function SelectField({
  name,
  label,
  hint,
  className,
  options,
  ...rest
}: Base & React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <select id={id} name={name} className="input" aria-invalid={!!error} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Wrapper>
  );
}

export function Checkbox({ name, label, defaultChecked, className = "" }: { name: string; label: string; defaultChecked?: boolean; className?: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 text-sm font-medium text-ink ${className}`}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[var(--color-accent)]" />
      {label}
    </label>
  );
}
