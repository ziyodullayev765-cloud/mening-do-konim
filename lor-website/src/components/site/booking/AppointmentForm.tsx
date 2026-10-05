"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowRight, CalendarCheck, Calendar, Clock, LoaderCircle, RotateCcw } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDate, formatPrice } from "@/lib/format";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { createBooking, type BookingResult } from "@/app/(site)/actions";
import { fetchDates, fetchSlots, onBookingPrefill } from "./client";
import type { Availability, BookableService } from "./types";

type Values = { fullName: string; phone: string; serviceId: string; date: string; time: string; note: string };
const b = t.booking;

export function AppointmentForm({
  services,
  initialServiceId = "",
  initialDate = "",
}: {
  services: BookableService[];
  initialServiceId?: string;
  initialDate?: string;
}) {
  const [values, setValues] = useState<Values>({
    fullName: "",
    phone: "",
    serviceId: initialServiceId,
    date: initialDate,
    time: "",
    note: "",
  });
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [sending, startSending] = useTransition();

  const loadDates = useCallback((force = false) => {
    setLoadError(false);
    fetchDates(force)
      .then(setAvailability)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => loadDates(), [loadDates]);

  // Slots for the chosen date.
  useEffect(() => {
    if (!values.date) {
      setSlots(null);
      return;
    }
    let cancelled = false;
    setSlots(null);
    fetchSlots(values.date)
      .then((s) => !cancelled && setSlots(s))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [values.date]);

  // Drop a date that is not bookable (e.g. from a stale link).
  useEffect(() => {
    if (availability && values.date && !availability.dates.some((d) => d.date === values.date)) {
      setValues((v) => ({ ...v, date: "", time: "" }));
    }
  }, [availability, values.date]);

  // Pre-fill from hero bar / service cards.
  useEffect(
    () =>
      onBookingPrefill((p) => {
        setResult(null);
        setValues((v) => ({
          ...v,
          serviceId: p.serviceId ?? v.serviceId,
          ...(p.date && p.date !== v.date ? { date: p.date, time: "" } : {}),
        }));
        setTimeout(() => document.getElementById("ap-fullName")?.focus({ preventScroll: true }), 400);
      }),
    [],
  );

  function validate(next: Values) {
    const parsed = bookingSchema.safeParse(next);
    return parsed.success ? {} : fieldErrors(parsed.error);
  }

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value, ...(key === "date" ? { time: "" } : {}) };
    setValues(next);
    if (submitted) setErrors(validate(next));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setMessage(null);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`ap-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    startSending(async () => {
      const res = await createBooking(values);
      if (res.ok) {
        setResult(res);
        fetchDates(true).then(setAvailability).catch(() => {});
        return;
      }
      if (res.slotTaken) {
        setValues((v) => ({ ...v, time: "" }));
        setErrors({ time: [b.slotTaken] });
        fetchSlots(values.date).then(setSlots).catch(() => {});
        return;
      }
      if (res.errors) setErrors(res.errors);
      setMessage(res.message ?? t.common.serverError);
    });
  }

  if (result?.ok && result.booking) {
    const bk = result.booking;
    return (
      <div className="animate-fade-up rounded-3xl border border-line bg-white p-8 text-center shadow-soft sm:p-10" role="status">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CalendarCheck className="size-8" aria-hidden />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-ink">{b.successTitle}</h3>
        <p className="mx-auto mt-2 max-w-md text-muted">{b.successLead}</p>
        <dl className="mx-auto mt-6 grid max-w-md gap-px overflow-hidden rounded-2xl border border-line bg-line text-left sm:grid-cols-2">
          {[
            [b.service, bk.service],
            [b.patient, bk.name],
            [b.date, formatDate(bk.date, true)],
            [b.time, bk.time],
          ].map(([k, v]) => (
            <div key={k} className="bg-white p-4">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-muted">{b.successChange}</p>
        <button
          type="button"
          className="btn btn-secondary mt-6"
          onClick={() => {
            setResult(null);
            setSubmitted(false);
            setErrors({});
            setValues({ fullName: "", phone: "", serviceId: "", date: "", time: "", note: "" });
          }}
        >
          {b.newRequest}
        </button>
      </div>
    );
  }

  const err = (k: keyof Values) => errors[k]?.[0];
  const consultations = services.filter((s) => s.category === "CONSULTATION" || s.category === "DIAGNOSTICS");
  const procedures = services.filter((s) => s.category === "TREATMENT" || s.category === "SURGERY");
  const noDates = availability !== null && availability.dates.length === 0;

  return (
    <form onSubmit={submit} noValidate>
      <fieldset disabled={sending} className="grid gap-5 sm:grid-cols-2">
        <Field id="ap-fullName" label={b.fullName} error={err("fullName")}>
          <input id="ap-fullName" className="input" autoComplete="name" placeholder="Alisher Karimov" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} aria-invalid={!!err("fullName")} />
        </Field>
        <Field id="ap-phone" label={b.phone} error={err("phone")}>
          <input id="ap-phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="+998 90 123 45 67" value={values.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!err("phone")} />
        </Field>

        <Field id="ap-serviceId" label={b.service} error={err("serviceId")} className="sm:col-span-2">
          <select id="ap-serviceId" className="input" value={values.serviceId} onChange={(e) => set("serviceId", e.target.value)} aria-invalid={!!err("serviceId")}>
            <option value="">{b.selectServicePlaceholder}</option>
            {[
              { label: t.pricing.consultations, items: consultations },
              { label: t.pricing.procedures, items: procedures },
            ]
              .filter((g) => g.items.length)
              .map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatPrice(s.price, s.priceFrom)}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </Field>

        <Field id="ap-date" label={b.date} error={err("date")} icon={<Calendar className="size-4" aria-hidden />}>
          <select
            id="ap-date"
            className="input pl-10"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            disabled={!availability || noDates}
            aria-invalid={!!err("date")}
          >
            <option value="">{availability ? (noDates ? b.noDates : b.selectDatePlaceholder) : t.common.loading}</option>
            {availability?.dates.map((d) => (
              <option key={d.date} value={d.date}>{formatDate(d.date, true)}</option>
            ))}
          </select>
        </Field>
        <Field id="ap-time" label={b.time} error={err("time")} icon={<Clock className="size-4" aria-hidden />}>
          <select
            id="ap-time"
            className="input pl-10"
            value={values.time}
            onChange={(e) => set("time", e.target.value)}
            disabled={!values.date || !slots || slots.length === 0}
            aria-invalid={!!err("time")}
          >
            <option value="">
              {!values.date ? b.selectTimePlaceholder : !slots ? b.loadingSlots : slots.length === 0 ? b.noSlots : b.timePlaceholder}
            </option>
            {slots?.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field id="ap-note" label={b.complaint} optional error={err("note")} className="sm:col-span-2">
          <textarea id="ap-note" rows={3} maxLength={500} className="input" placeholder={b.complaintPlaceholder} value={values.note} onChange={(e) => set("note", e.target.value)} aria-invalid={!!err("note")} />
        </Field>
      </fieldset>

      {loadError && (
        <p role="alert" className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {b.loadError}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => loadDates(true)}>
            <RotateCcw className="size-4" aria-hidden /> {b.retry}
          </button>
        </p>
      )}
      {message && <p role="alert" className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{message}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn btn-primary btn-lg group" disabled={sending}>
          {sending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
          {sending ? b.sending : b.send}
          {!sending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />}
        </button>
        <p className="text-xs text-muted sm:max-w-56 sm:text-right">{b.privacy}</p>
      </div>
    </form>
  );
}

function Field({
  id, label, error, optional, className = "", icon, children,
}: {
  id: string; label: string; error?: string; optional?: boolean; className?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-muted">({t.common.optional})</span>}
      </label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-muted">{icon}</span>}
        {children}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
