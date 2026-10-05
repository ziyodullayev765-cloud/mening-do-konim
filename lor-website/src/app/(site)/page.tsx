import { getPublicContent } from "@/lib/data";
import { clinicNow, dayOfWeek } from "@/lib/slots";
import { Hero } from "@/components/site/sections/Hero";
import { About } from "@/components/site/sections/About";
import { Services } from "@/components/site/sections/Services";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { Faq } from "@/components/site/sections/Faq";
import { Contact } from "@/components/site/sections/Contact";
import { StructuredData } from "@/components/site/StructuredData";

export default async function HomePage() {
  const { doctor, services, procedures, testimonials, faqs, schedule, settings } = await getPublicContent();

  const today = schedule.find((d) => d.dayOfWeek === dayOfWeek(clinicNow(settings.timezone).date));
  const todayHours = today?.isOpen ? `${today.openTime} – ${today.closeTime}` : null;

  return (
    <>
      <StructuredData doctor={doctor} schedule={schedule} faqs={faqs} />
      <Hero doctor={doctor} todayHours={todayHours} />
      <About doctor={doctor} />
      <Services services={[...services, ...procedures]} />
      <Testimonials items={testimonials} />
      <Faq items={faqs} />
      <Contact doctor={doctor} schedule={schedule} />
    </>
  );
}
