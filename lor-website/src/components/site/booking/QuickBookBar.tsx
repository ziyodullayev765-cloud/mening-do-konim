"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Stethoscope } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { fetchDates, requestBooking } from "./client";
import type { Availability, BookableService } from "./types";

/** Hero "liquid glass" bar: pick service + date, then jump to the full form. */
export function QuickBookBar({ services }: { services: BookableService[] }) {
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);

  useEffect(() => {
    fetchDates().then(setAvailability).catch(() => setAvailability({ from: "", to: "", dates: [] }));
  }, []);

  return (
    <form
      className="glass grid gap-3 rounded-[28px] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-4"
      onSubmit={(e) => {
        e.preventDefault();
        requestBooking({ serviceId: serviceId || undefined, date: date || undefined });
      }}
    >
      <label className="block">
        <span className="mb-1.5 ml-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Stethoscope className="size-3.5 text-accent" aria-hidden /> {t.home.quickService}
        </span>
        <select className="input !border-white/80 !bg-white/80" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          <option value="">{t.booking.selectServicePlaceholder}</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 ml-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Calendar className="size-3.5 text-accent" aria-hidden /> {t.home.quickDate}
        </span>
        <select className="input !border-white/80 !bg-white/80" value={date} onChange={(e) => setDate(e.target.value)} disabled={!availability}>
          <option value="">{availability ? t.booking.selectDatePlaceholder : t.common.loading}</option>
          {availability?.dates.map((d) => <option key={d.date} value={d.date}>{formatDate(d.date, true)}</option>)}
        </select>
      </label>
      <button type="submit" className="btn btn-primary btn-lg group">
        {t.home.quickBook}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </button>
    </form>
  );
}
