import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { telHref } from "@/lib/format";

/** Sticky booking bar shown on small screens only. */
export async function MobileBookBar({ phone }: { phone: string }) {
  const t = await getT();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_-14px_rgb(26_43_76/0.35)] sm:hidden">
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
