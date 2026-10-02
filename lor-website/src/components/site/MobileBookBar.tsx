import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { t } from "@/lib/i18n";
import { telHref } from "@/lib/format";

/** Sticky booking bar shown on small screens only. */
export function MobileBookBar({ phone }: { phone: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
      <div className="flex gap-2">
        {phone && (
          <a href={telHref(phone)} className="btn btn-secondary shrink-0" aria-label={t.contact.phone}>
            <Phone className="size-5" aria-hidden />
          </a>
        )}
        <Link href="/book" className="btn btn-primary flex-1">
          <CalendarCheck className="size-5" aria-hidden />
          {t.common.bookAppointment}
        </Link>
      </div>
    </div>
  );
}
