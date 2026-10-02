import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getDoctor, getSiteSettings } from "@/lib/data";
import { t } from "@/lib/i18n";
import { telHref } from "@/lib/format";
import { BookingWizard } from "@/components/site/booking/BookingWizard";

export const metadata: Metadata = {
  title: t.booking.title,
  description: t.booking.lead,
  alternates: { canonical: "/book" },
};

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [{ service }, doctor, settings, services] = await Promise.all([
    searchParams,
    getDoctor(),
    getSiteSettings(),
    db.service.findMany({
      where: { active: true },
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, kind: true, name: true, description: true, price: true, priceFrom: true, durationMinutes: true, icon: true },
    }),
  ]);

  const initialServiceId = services.some((s) => s.id === service) ? service! : null;

  return (
    <section className="pt-8 pb-28 lg:pt-14 lg:pb-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">{doctor.fullName}</p>
          <h1 className="h-display mt-4 text-[clamp(2.4rem,1.8rem+2.4vw,3.75rem)]">{t.booking.title}</h1>
          <p className="mt-4 text-lg text-muted">{t.booking.lead}</p>
        </div>

        <div className="mt-10 lg:mt-14">
          {!settings.bookingEnabled ? (
            <Unavailable phone={doctor.phone} message={t.booking.unavailable} />
          ) : services.length === 0 ? (
            <Unavailable phone={doctor.phone} message={t.booking.noServices} />
          ) : (
            <BookingWizard services={services} initialServiceId={initialServiceId} clinicPhone={doctor.phone} />
          )}
        </div>
      </div>
    </section>
  );
}

function Unavailable({ message, phone }: { message: string; phone: string }) {
  return (
    <div className="card max-w-2xl p-8 sm:p-10">
      <p className="text-lg text-ink">{message}</p>
      {phone && (
        <a href={telHref(phone)} className="btn btn-primary mt-6">
          <Phone className="size-4" aria-hidden /> {phone}
        </a>
      )}
    </div>
  );
}
