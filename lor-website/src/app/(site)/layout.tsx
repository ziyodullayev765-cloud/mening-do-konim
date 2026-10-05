import { getPublicContent } from "@/lib/data";
import { clinicNow, dayOfWeek } from "@/lib/slots";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileBookBar } from "@/components/site/MobileBookBar";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { doctor, schedule, settings, testimonials } = await getPublicContent();
  const today = schedule.find((d) => d.dayOfWeek === dayOfWeek(clinicNow(settings.timezone).date));
  const todayHours = today?.isOpen ? `${today.openTime} – ${today.closeTime}` : null;
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Asosiy mazmunga o&apos;tish
      </a>
      <Header
        name={doctor.fullName}
        phone={doctor.phone}
        email={doctor.email}
        address={doctor.address}
        todayHours={todayHours}
        hasReviews={testimonials.length > 0}
        logoUrl={doctor.logoUrl}
      />
      <main id="main">{children}</main>
      <Footer doctor={doctor} />
      <MobileBookBar phone={doctor.phone} />
    </>
  );
}
