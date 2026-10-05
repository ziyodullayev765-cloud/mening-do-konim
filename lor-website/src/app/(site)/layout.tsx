import { getPublicContent } from "@/lib/data";
import { clinicNow, dayOfWeek } from "@/lib/slots";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileBookBar } from "@/components/site/MobileBookBar";
import { I18nProvider } from "@/components/site/I18nProvider";
import { getLocale } from "@/lib/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const { doctor, schedule, settings, testimonials } = await getPublicContent(locale);
  const today = schedule.find((d) => d.dayOfWeek === dayOfWeek(clinicNow(settings.timezone).date));
  const todayHours = today?.isOpen ? `${today.openTime} – ${today.closeTime}` : null;
  return (
    <I18nProvider locale={locale}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {locale === "ru" ? "Перейти к содержимому" : "Asosiy mazmunga o'tish"}
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
    </I18nProvider>
  );
}
