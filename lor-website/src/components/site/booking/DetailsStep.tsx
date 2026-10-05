"use client";

import { useState } from "react";
import { CalendarCheck, LoaderCircle } from "lucide-react";
import { useI18n } from "../I18nProvider";
import type { Dictionary } from "@/lib/i18n";

export type Details = { fullName: string; phone: string; email: string; note: string };

function validate(d: Details, t: Dictionary) {
  const errors: Partial<Record<keyof Details, string>> = {};
  if (d.fullName.trim().length < 2) errors.fullName = t.booking.errors.name;
  const digits = d.phone.replace(/\D/g, "");
  if (!/^[+\d\s()-]+$/.test(d.phone.trim()) || digits.length < 9 || digits.length > 15) errors.phone = t.booking.errors.phone;
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errors.email = t.booking.errors.email;
  return errors;
}

export function DetailsStep({
  value,
  onChange,
  onSubmit,
  submitting,
  serverErrors,
  serverMessage,
}: {
  value: Details;
  onChange: (d: Details) => void;
  onSubmit: () => void;
  submitting: boolean;
  serverErrors?: Record<string, string[]>;
  serverMessage?: string;
}) {
  const { t } = useI18n();
  const [touched, setTouched] = useState(false);
  const clientErrors = touched ? validate(value, t) : {};
  const err = (k: keyof Details) => clientErrors[k] ?? serverErrors?.[k]?.[0];
  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...value, [k]: e.target.value });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (Object.keys(validate(value, t)).length === 0) onSubmit();
      }}
    >
      <fieldset disabled={submitting}>
        <legend className="font-serif text-2xl text-ink">{t.booking.yourDetails}</legend>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field id="b-name" label={t.booking.fullName} error={err("fullName")} className="sm:col-span-2">
            <input id="b-name" className="input" autoComplete="name" value={value.fullName} onChange={set("fullName")} aria-invalid={!!err("fullName")} aria-describedby="b-name-err" />
          </Field>
          <Field id="b-phone" label={t.booking.phone} error={err("phone")}>
            <input id="b-phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="+998 90 123 45 67" value={value.phone} onChange={set("phone")} aria-invalid={!!err("phone")} aria-describedby="b-phone-err" />
          </Field>
          <Field id="b-email" label={t.booking.email} optional error={err("email")}>
            <input id="b-email" type="email" className="input" autoComplete="email" value={value.email} onChange={set("email")} aria-invalid={!!err("email")} aria-describedby="b-email-err" />
          </Field>
          <Field id="b-note" label={t.booking.note} optional className="sm:col-span-2">
            <textarea id="b-note" rows={3} className="input" placeholder={t.booking.notePlaceholder} maxLength={1000} value={value.note} onChange={set("note")} />
          </Field>
        </div>

        {serverMessage && !serverErrors && (
          <p role="alert" className="mt-5 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{serverMessage}</p>
        )}

        <button type="submit" className="btn btn-primary btn-lg mt-7 w-full sm:w-auto">
          {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <CalendarCheck className="size-5" aria-hidden />}
          {t.booking.submit}
        </button>
      </fieldset>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-muted">({t.common.optional})</span>}
      </label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
