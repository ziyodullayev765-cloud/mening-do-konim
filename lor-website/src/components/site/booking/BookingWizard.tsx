"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, LoaderCircle, Phone, RotateCcw } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDate, formatPrice, telHref } from "@/lib/format";
import { createBooking, type BookingResult } from "@/app/(site)/actions";
import { ServiceStep } from "./ServiceStep";
import { DateStep } from "./DateStep";
import { TimeStep } from "./TimeStep";
import { DetailsStep, type Details } from "./DetailsStep";
import type { Availability, BookableService } from "./types";

type Step = 0 | 1 | 2 | 3;

export function BookingWizard({
  services,
  initialServiceId,
  clinicPhone,
}: {
  services: BookableService[];
  initialServiceId: string | null;
  clinicPhone: string;
}) {
  const [step, setStep] = useState<Step>(initialServiceId ? 1 : 0);
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<Details>({ fullName: "", phone: "", email: "", note: "" });

  const [availability, setAvailability] = useState<Availability | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [submitting, startSubmit] = useTransition();

  const service = services.find((s) => s.id === serviceId) ?? null;

  const loadDates = useCallback(async () => {
    setLoadError(false);
    setAvailability(null);
    try {
      const res = await fetch("/api/availability", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setAvailability({ from: json.from, to: json.to, dates: json.dates ?? [] });
    } catch {
      setLoadError(true);
    }
  }, []);

  const loadSlots = useCallback(async (d: string) => {
    setLoadError(false);
    setSlots(null);
    try {
      const res = await fetch(`/api/availability?date=${d}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setSlots((await res.json()).slots ?? []);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && !availability) loadDates();
  }, [step, availability, loadDates]);

  useEffect(() => {
    if (step === 2 && date) loadSlots(date);
  }, [step, date, loadSlots]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Choosing a service is optional.
  const canNext = [true, !!date, !!time, true][step];

  function next() {
    setNotice(null);
    if (step < 3 && canNext) setStep((s) => (s + 1) as Step);
  }
  function back() {
    setNotice(null);
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  function submit() {
    if (!date || !time) return;
    startSubmit(async () => {
      const res = await createBooking({ serviceId: serviceId ?? "", date, time, ...details });
      if (res.ok) {
        setResult(res);
        return;
      }
      if (res.slotTaken) {
        setTime(null);
        setAvailability(null);
        setNotice(res.message ?? t.booking.slotTaken);
        setStep(2);
        return;
      }
      setResult(res);
    });
  }

  if (result?.ok && result.booking) {
    return <Success booking={result.booking} phone={clinicPhone} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-8">
        <Stepper step={step} onJump={(s) => s < step && setStep(s)} />

        <div className="card mt-6 p-5 sm:p-8">
          {notice && (
            <p role="alert" className="mb-6 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">{notice}</p>
          )}

          {loadError ? (
            <div className="py-10 text-center">
              <p className="text-muted">{t.booking.loadError}</p>
              <button type="button" className="btn btn-secondary mt-4" onClick={() => (step === 2 && date ? loadSlots(date) : loadDates())}>
                <RotateCcw className="size-4" aria-hidden /> {t.booking.retry}
              </button>
            </div>
          ) : step === 0 ? (
            <ServiceStep
              services={services}
              selected={serviceId}
              onSelect={(id) => {
                setServiceId(id);
                if (id) setStep(1);
              }}
            />
          ) : step === 1 ? (
            availability ? (
              <DateStep
                availability={availability}
                selected={date}
                onSelect={(d) => {
                  if (d !== date) setTime(null);
                  setDate(d);
                  setStep(2);
                }}
              />
            ) : (
              <Loading />
            )
          ) : step === 2 && date ? (
            slots ? (
              <TimeStep
                date={date}
                slots={slots}
                selected={time}
                onSelect={(tm) => {
                  setTime(tm);
                  setNotice(null);
                  setStep(3);
                }}
              />
            ) : (
              <Loading />
            )
          ) : (
            <DetailsStep
              value={details}
              onChange={setDetails}
              onSubmit={submit}
              submitting={submitting}
              serverErrors={result?.ok === false ? result.errors : undefined}
              serverMessage={result?.ok === false ? result.message : undefined}
            />
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <button type="button" onClick={back} className={`btn btn-ghost ${step === 0 ? "invisible" : ""}`}>
              <ArrowLeft className="size-4" aria-hidden /> {t.common.back}
            </button>
            {step < 3 && (
              <button type="button" onClick={next} disabled={!canNext} className="btn btn-dark">
                {t.common.next} <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="card p-6 lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t.booking.summary}</p>
          <dl className="mt-4 divide-y divide-line">
            <SummaryRow label={t.booking.service} value={service?.name ?? (step > 0 ? t.booking.notSelected : undefined)} sub={service ? formatPrice(service.price, service.priceFrom) : undefined} />
            <SummaryRow label={t.booking.date} value={date ? formatDate(date, true) : undefined} />
            <SummaryRow label={t.booking.time} value={time ?? undefined} />
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-muted">{t.booking.privacy}</p>
          {clinicPhone && (
            <a href={telHref(clinicPhone)} className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-strong">
              <Phone className="size-4" aria-hidden /> {clinicPhone}
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}

function Stepper({ step, onJump }: { step: Step; onJump: (s: Step) => void }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Qadamlar">
      {t.booking.steps.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => onJump(i as Step)}
              disabled={!done}
              aria-current={current ? "step" : undefined}
              className="group w-full text-left disabled:cursor-default"
            >
              <span className={`block h-1 rounded-full transition-colors ${done || current ? "bg-accent" : "bg-line"}`} />
              <span className={`mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold ${current ? "text-ink" : done ? "text-accent group-hover:underline" : "text-muted"}`}>
                {done && <Check className="size-3.5" aria-hidden />}
                <span className="hidden sm:inline">{i + 1}.</span> {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function SummaryRow({ label, value, sub }: { label: string; value?: string; sub?: string }) {
  return (
    <div className="py-3.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-0.5 font-semibold ${value ? "text-ink" : "text-muted/50"}`}>{value ?? "—"}</dd>
      {sub && <dd className="text-sm text-muted">{sub}</dd>}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted" role="status">
      <LoaderCircle className="size-5 animate-spin" aria-hidden /> {t.common.loading}
    </div>
  );
}

function Success({ booking, phone }: { booking: NonNullable<BookingResult["booking"]>; phone: string }) {
  return (
    <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12" role="status">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
        <CalendarCheck className="size-8" aria-hidden />
      </span>
      <h2 className="mt-6 font-serif text-3xl text-ink sm:text-4xl">{t.booking.successTitle}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{t.booking.successLead}</p>
      <dl className="mx-auto mt-8 grid max-w-md gap-px overflow-hidden rounded-xl border border-line bg-line text-left sm:grid-cols-2">
        {[
          [t.booking.service, booking.service],
          [t.booking.patient, booking.name],
          [t.booking.date, formatDate(booking.date, true)],
          [t.booking.time, booking.time],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface p-4">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-muted">{t.booking.successChange}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {phone && (
          <a href={telHref(phone)} className="btn btn-secondary">
            <Phone className="size-4" aria-hidden /> {phone}
          </a>
        )}
        <Link href="/" className="btn btn-dark">{t.booking.backHome}</Link>
      </div>
    </div>
  );
}
