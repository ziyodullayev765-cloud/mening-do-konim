import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getSettings, getWeekSchedule } from "@/lib/slots";
import { SERVICE_CATEGORIES } from "@/lib/schemas/service";

export const getDoctor = cache(async () => {
  return (
    (await db.doctor.findUnique({ where: { id: 1 } })) ??
    (await db.doctor.create({
      data: { id: 1, fullName: "[Shifokor F.I.Sh.]", title: "LOR shifokori", shortDescription: "" },
    }))
  );
});

export const getSiteSettings = cache(getSettings);

export const getPublicContent = cache(async () => {
  const [doctor, services, testimonials, faqs, schedule, settings] = await Promise.all([
    getDoctor(),
    db.service.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.testimonial.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    db.faq.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    getWeekSchedule(),
    getSiteSettings(),
  ]);
  const categoryCounts = SERVICE_CATEGORIES.map((category) => ({
    category,
    count: services.filter((s) => s.category === category).length,
  })).filter((c) => c.count > 0);
  return {
    doctor,
    services,
    /** Minimal fields for the booking form (no internal data sent to the browser). */
    bookable: services.map(({ id, category, name, price, priceFrom, durationMinutes }) => ({ id, category, name, price, priceFrom, durationMinutes })),
    categoryCounts,
    testimonials,
    faqs,
    schedule,
    settings,
  };
});

export type PublicContent = Awaited<ReturnType<typeof getPublicContent>>;
