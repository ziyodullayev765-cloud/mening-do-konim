import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data";
import { t } from "@/lib/i18n";
import { DATE_RE } from "@/lib/slots-shared";
import { Appointment } from "@/components/site/sections/Appointment";

export const metadata: Metadata = {
  title: t.booking.title,
  description: t.booking.lead,
  alternates: { canonical: "/book" },
};

/** Standalone booking page (used by links from outside the home page). */
export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string; date?: string }> }) {
  const [{ service, date }, { doctor, bookable, schedule, settings }] = await Promise.all([searchParams, getPublicContent()]);
  const initialServiceId = bookable.some((s) => s.id === service) ? service : undefined;
  const initialDate = date && DATE_RE.test(date) ? date : undefined;

  return (
    <div className="pt-24 sm:pt-28">
      {settings.bookingEnabled && bookable.length > 0 ? (
        <Appointment doctor={doctor} schedule={schedule} services={bookable} initialServiceId={initialServiceId} initialDate={initialDate} />
      ) : (
        <section className="section">
          <div className="container-x">
            <p className="mx-auto max-w-xl rounded-3xl border border-white bg-white p-8 text-center text-ink shadow-soft">
              {settings.bookingEnabled ? t.booking.noServices : t.booking.unavailable}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
