import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getSettings, getWeekSchedule } from "@/lib/slots";

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
  return {
    doctor,
    services: services.filter((s) => s.kind === "SERVICE"),
    procedures: services.filter((s) => s.kind === "PROCEDURE"),
    pricing: services.filter((s) => s.showInPricing),
    testimonials,
    faqs,
    schedule,
    settings,
  };
});

export type PublicContent = Awaited<ReturnType<typeof getPublicContent>>;
