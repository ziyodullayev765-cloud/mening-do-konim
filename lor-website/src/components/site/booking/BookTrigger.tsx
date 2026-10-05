"use client";

import { requestBooking } from "./client";
import type { BookingPrefill } from "./types";

/** Any "Book" button on the site. Works with or without the form on the page. */
export function BookTrigger({
  children,
  className = "btn btn-primary",
  prefill,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  prefill?: BookingPrefill;
  ariaLabel?: string;
}) {
  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={() => requestBooking(prefill)}>
      {children}
    </button>
  );
}
