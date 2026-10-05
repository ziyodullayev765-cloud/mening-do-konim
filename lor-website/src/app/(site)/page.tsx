import { getPublicContent } from "@/lib/data";
import { clinicNow, dayOfWeek } from "@/lib/slots";
import { Hero } from "@/components/site/sections/Hero";
import { TrustBar } from "@/components/site/sections/TrustBar";
import { About } from "@/components/site/sections/About";
import { Services } from "@/components/site/sections/Services";
import { Procedures } from "@/components/site/sections/Procedures";
import { Pricing } from "@/components/site/sections/Pricing";
import { Experience } from "@/components/site/sections/Experience";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { Faq } from "@/components/site/sections/Faq";
import { Contact } from "@/components/site/sections/Contact";
import { FinalCta } from "@/components/site/sections/FinalCta";
import { StructuredData } from "@/components/site/StructuredData";

export default async function HomePage() {
  const { doctor, services, procedures, pricing, testimonials, faqs, schedule, settings } = await getPublicContent();

  const today = schedule.find((d) => d.dayOfWeek === dayOfWeek(clinicNow(settings.timezone).date));
  const todayHours = today?.isOpen ? `${today.openTime} – ${today.closeTime}` : null;

  return (
    <>
      <StructuredData doctor={doctor} schedule={schedule} faqs={faqs} />
      <Hero doctor={doctor} todayHours={todayHours} />
      <TrustBar doctor={doctor} />
      <About doctor={doctor} />
      <Services services={services} />
      <Procedures procedures={procedures} />
      <Pricing items={pricing} />
      <Experience doctor={doctor} />
      <Testimonials items={testimonials} />
      <Faq items={faqs} />
      <Contact doctor={doctor} schedule={schedule} />
      <div className="h-20 bg-paper-2/60 lg:h-28" aria-hidden />
      <FinalCta doctor={doctor} />
    </>
  );
}
