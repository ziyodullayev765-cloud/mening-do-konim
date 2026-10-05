import { getPublicContent } from "@/lib/data";
import { clinicNow, dayOfWeek } from "@/lib/slots";
import { Hero } from "@/components/site/sections/Hero";
import { Categories } from "@/components/site/sections/Categories";
import { Services } from "@/components/site/sections/Services";
import { About } from "@/components/site/sections/About";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { Faq } from "@/components/site/sections/Faq";
import { Appointment } from "@/components/site/sections/Appointment";
import { StructuredData } from "@/components/site/StructuredData";

export default async function HomePage() {
  const { doctor, services, bookable, categoryCounts, testimonials, faqs, schedule, settings } = await getPublicContent();

  const today = schedule.find((d) => d.dayOfWeek === dayOfWeek(clinicNow(settings.timezone).date));
  const todayHours = today?.isOpen ? `${today.openTime} – ${today.closeTime}` : null;
  const bookingOpen = settings.bookingEnabled && bookable.length > 0;

  return (
    <>
      <StructuredData doctor={doctor} schedule={schedule} faqs={faqs} />
      <Hero doctor={doctor} services={bookable} todayHours={todayHours} />
      <Categories counts={categoryCounts} />
      <Services services={services} />
      <About doctor={doctor} />
      <Testimonials items={testimonials} />
      <Faq items={faqs} />
      {bookingOpen ? (
        <Appointment doctor={doctor} schedule={schedule} services={bookable} />
      ) : (
        <section id="appointment" className="section">
          <div className="container-x">
            <p className="mx-auto max-w-xl rounded-3xl border border-white bg-white p-8 text-center text-ink shadow-soft">
              {settings.bookingEnabled ? "Hozircha onlayn yozilish uchun xizmatlar mavjud emas." : "Onlayn yozilish vaqtincha to'xtatilgan. Iltimos, klinikaga qo'ng'iroq qiling."}
              {doctor.phone && <a href={`tel:${doctor.phone.replace(/[^\d+]/g, "")}`} className="mt-3 block font-semibold text-accent">{doctor.phone}</a>}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
