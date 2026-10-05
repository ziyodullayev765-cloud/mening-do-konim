import { getPublicContent } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { Hero } from "@/components/site/sections/Hero";
import { Directions } from "@/components/site/sections/Directions";
import { Services } from "@/components/site/sections/Services";
import { Highlights } from "@/components/site/sections/Highlights";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { Faq } from "@/components/site/sections/Faq";
import { Contact } from "@/components/site/sections/Contact";
import { StructuredData } from "@/components/site/StructuredData";

export default async function HomePage() {
  const { doctor, services, procedures, testimonials, faqs, schedule } = await getPublicContent(await getLocale());

  // Rating badge only from real, rated patient reviews.
  const rated = testimonials.filter((x) => x.rating != null);
  const rating = rated.length
    ? { average: rated.reduce((sum, x) => sum + (x.rating ?? 0), 0) / rated.length, count: rated.length }
    : null;

  return (
    <>
      <StructuredData doctor={doctor} schedule={schedule} faqs={faqs} />
      <Hero doctor={doctor} rating={rating} />
      <Directions doctor={doctor} />
      <Services services={[...services, ...procedures]} />
      <Highlights doctor={doctor} />
      <Testimonials items={testimonials} />
      <div className="py-6 sm:py-10">
        <Faq items={faqs} />
        <Contact doctor={doctor} schedule={schedule} />
      </div>
    </>
  );
}
