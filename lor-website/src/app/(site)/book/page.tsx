import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { getPublicContent } from "@/lib/data";
import { getLocale, getT } from "@/lib/i18n/server";
import { telHref } from "@/lib/format";
import { BookingWizard } from "@/components/site/booking/BookingWizard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.booking.title, description: t.booking.lead, alternates: { canonical: "/book" } };
}

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const locale = await getLocale();
  const [{ service }, content, t] = await Promise.all([searchParams, getPublicContent(locale), getT()]);
  const { doctor, settings } = content;
  const services = [...content.services, ...content.procedures].map(({ id, kind, name, description, price, priceFrom, durationMinutes, icon }) => ({
    id, kind, name, description, price, priceFrom, durationMinutes, icon,
  }));

  const initialServiceId = services.some((s) => s.id === service) ? service! : null;

  return (
    <section className="pt-6 pb-28 sm:pt-8 lg:pt-14 lg:pb-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">{doctor.fullName}</p>
          <h1 className="h-display mt-3 text-[1.85rem] sm:mt-4 sm:text-[clamp(2.4rem,1.8rem+2.4vw,3.75rem)]">{t.booking.title}</h1>
          <p className="mt-2 text-[15px] text-muted sm:mt-4 sm:text-lg">{t.booking.lead}</p>
        </div>

        <div className="mt-6 sm:mt-10 lg:mt-14">
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

async function Unavailable({ message, phone }: { message: string; phone: string }) {
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
