import type { Doctor, Faq, WorkingDay } from "@prisma/client";
import { isPlaceholder } from "@/lib/format";

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * schema.org data built strictly from fields the doctor has filled in.
 * Placeholder values are omitted so no inaccurate data is published.
 */
export function StructuredData({ doctor, schedule, faqs }: { doctor: Doctor; schedule: WorkingDay[]; faqs: Faq[] }) {
  if (isPlaceholder(doctor.fullName)) return null;
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const physician: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.fullName,
    url: siteUrl,
    medicalSpecialty: "Otolaryngologic",
    ...(doctor.shortDescription && { description: doctor.shortDescription }),
    ...(doctor.photoUrl && { image: doctor.photoUrl }),
    ...(!isPlaceholder(doctor.phone) && doctor.phone && { telephone: doctor.phone }),
    ...(!isPlaceholder(doctor.email) && doctor.email && { email: doctor.email }),
    ...(!isPlaceholder(doctor.address) &&
      doctor.address && {
        address: {
          "@type": "PostalAddress",
          streetAddress: doctor.address,
          ...(doctor.city && { addressLocality: doctor.city }),
          ...(doctor.country && { addressCountry: doctor.country }),
        },
      }),
    openingHoursSpecification: schedule
      .filter((d) => d.isOpen)
      .map((d) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAYS[d.dayOfWeek],
        opens: d.openTime,
        closes: d.closeTime,
      })),
  };
  const graph: Record<string, unknown>[] = [physician];
  if (faqs.length) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
