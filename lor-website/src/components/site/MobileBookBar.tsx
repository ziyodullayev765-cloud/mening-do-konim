"use client";

import { CalendarCheck, Phone } from "lucide-react";
import { t } from "@/lib/i18n";
import { telHref } from "@/lib/format";
import { requestBooking } from "./booking/client";

/** Sticky glass booking bar shown on small screens only. */
export function MobileBookBar({ phone }: { phone: string }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="glass flex gap-2 rounded-full p-1.5">
        {phone && (
          <a href={telHref(phone)} className="btn btn-secondary shrink-0 !px-4" aria-label={t.contact.phone}>
            <Phone className="size-5" aria-hidden />
          </a>
        )}
        <button type="button" onClick={() => requestBooking()} className="btn btn-primary flex-1">
          <CalendarCheck className="size-5" aria-hidden />
          {t.common.bookAppointment}
        </button>
      </div>
    </div>
  );
}
