import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getSettings, getWeekSchedule } from "@/lib/slots";
import type { Doctor, Faq, Service } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { autoRu } from "@/lib/i18n/content-ru";

const DOCTOR_RU = [
  "title", "shortDescription", "heroTitle", "heroBadge", "biography", "specializations", "professionalHistory",
  "education", "training", "certifications", "memberships", "address", "clinicName",
] as const;

/**
 * Russian text where it was entered in the admin panel; otherwise a built-in
 * Russian version of standard content (see content-ru.ts); otherwise the Uzbek original.
 */
const pickRu = (ru: string, uz: string) => ru.trim() || autoRu(uz);

export function localizeDoctor(d: Doctor, locale: Locale): Doctor {
  if (locale !== "ru") return d;
  const out = { ...d, country: autoRu(d.country) };
  for (const f of DOCTOR_RU) out[f] = pickRu(d[`${f}Ru` as const], d[f]);
  return out;
}

export function localizeService<T extends Pick<Service, "name" | "description" | "indication" | "recovery" | "nameRu" | "descriptionRu" | "indicationRu" | "recoveryRu">>(s: T, locale: Locale): T {
  if (locale !== "ru") return s;
  return {
    ...s,
    name: pickRu(s.nameRu, s.name),
    description: pickRu(s.descriptionRu, s.description),
    indication: pickRu(s.indicationRu, s.indication),
    recovery: pickRu(s.recoveryRu, s.recovery),
  };
}

function localizeFaq(f: Faq, locale: Locale): Faq {
  if (locale !== "ru") return f;
  return { ...f, question: pickRu(f.questionRu, f.question), answer: pickRu(f.answerRu, f.answer) };
}

export const getDoctor = cache(async () => {
  return (
    (await db.doctor.findUnique({ where: { id: 1 } })) ??
    (await db.doctor.create({
      data: { id: 1, fullName: "[Shifokor F.I.Sh.]", title: "LOR shifokori", shortDescription: "" },
    }))
  );
});

export const getSiteSettings = cache(getSettings);

export const getPublicContent = cache(async (locale: Locale = "uz") => {
  const [doctor, services, testimonials, faqs, schedule, settings] = await Promise.all([
    getDoctor(),
    db.service.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.testimonial.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    db.faq.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    getWeekSchedule(),
    getSiteSettings(),
  ]);
  const localized = services.map((s) => localizeService(s, locale));
  return {
    doctor: localizeDoctor(doctor, locale),
    services: localized.filter((s) => s.kind === "SERVICE"),
    procedures: localized.filter((s) => s.kind === "PROCEDURE"),
    pricing: services.filter((s) => s.showInPricing),
    testimonials,
    faqs: faqs.map((f) => localizeFaq(f, locale)),
    schedule,
    settings,
  };
});

export type PublicContent = Awaited<ReturnType<typeof getPublicContent>>;
