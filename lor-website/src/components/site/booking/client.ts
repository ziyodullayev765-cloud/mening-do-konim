"use client";

import type { Availability, BookingPrefill } from "./types";
import { APPOINTMENT_ID } from "./client-ids";

const EVENT = "booking:prefill";

/**
 * Opens the appointment form: scrolls to it (and pre-fills it) when it is on
 * the current page, otherwise navigates to /book with the same values.
 */
export function requestBooking(prefill: BookingPrefill = {}) {
  const target = document.getElementById(APPOINTMENT_ID);
  if (target) {
    window.dispatchEvent(new CustomEvent<BookingPrefill>(EVENT, { detail: prefill }));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const params = new URLSearchParams();
  if (prefill.serviceId) params.set("service", prefill.serviceId);
  if (prefill.date) params.set("date", prefill.date);
  const qs = params.toString();
  window.location.href = `/book${qs ? `?${qs}` : ""}`;
}

export function onBookingPrefill(handler: (p: BookingPrefill) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<BookingPrefill>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/* Shared, de-duplicated availability requests (hero bar + form use the same data). */
let datesPromise: Promise<Availability> | null = null;

export function fetchDates(force = false): Promise<Availability> {
  if (!datesPromise || force) {
    datesPromise = fetch("/api/availability", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("availability");
        return r.json();
      })
      .then((j) => ({ from: j.from, to: j.to, dates: j.dates ?? [] }))
      .catch((e) => {
        datesPromise = null;
        throw e;
      });
  }
  return datesPromise;
}

export async function fetchSlots(date: string): Promise<string[]> {
  const r = await fetch(`/api/availability?date=${encodeURIComponent(date)}`, { cache: "no-store" });
  if (!r.ok) throw new Error("slots");
  return (await r.json()).slots ?? [];
}
