import { z } from "zod";
import { t, type Dictionary } from "@/lib/i18n";
import { DATE_RE, TIME_RE } from "@/lib/slots-shared";
import { imageRefError, isValidImageRef } from "@/lib/media-shared";
import { instagramUsername } from "@/lib/social";

const trimmed = (max: number) => z.string().trim().max(max);

/** Optional text input: "" stays "". */
const text = (max = 2000) => trimmed(max).default("");

/** Optional integer input: "" -> null. */
const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(min).max(max).nullable(),
  );

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/** Phone validator with messages in the given language. */
const phoneFor = (d: Dictionary) =>
  z
    .string()
    .trim()
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return /^[+\d\s()-]+$/.test(v) && digits.length >= 9 && digits.length <= 15;
    }, d.booking.errors.phone);

const optionalEmailFor = (d: Dictionary) =>
  z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, d.booking.errors.email)
    .default("");

/** Public booking schema; messages follow the visitor's language. */
export const bookingSchemaFor = (d: Dictionary) =>
  z.object({
    /** Optional — a patient may book without choosing a specific service. */
    serviceId: z.string().max(50).optional().default(""),
    date: z.string().regex(DATE_RE, d.booking.errors.date),
    time: z.string().regex(TIME_RE, d.booking.errors.time),
    fullName: z.string().trim().min(2, d.booking.errors.name).max(120, d.booking.errors.name),
    phone: phoneFor(d),
    email: optionalEmailFor(d),
    note: text(1000),
  });

export const contactSchemaFor = (d: Dictionary) =>
  z.object({
    name: z.string().trim().min(2, d.booking.errors.name).max(120),
    phone: phoneFor(d),
    email: optionalEmailFor(d),
    message: z.string().trim().min(5, d.meta.locale === "ru" ? "Сообщение слишком короткое." : "Xabar juda qisqa.").max(2000),
  });

export const bookingSchema = bookingSchemaFor(t);
export const contactSchema = contactSchemaFor(t);

export const loginSchema = z.object({
  /** Login name or email (stored in Admin.email, lower-case). */
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200),
  remember: checkbox,
});

/** Admin form schemas; validation messages follow the admin's language. */
export function adminSchemasFor(d: Dictionary) {
  const ru = d.meta.locale === "ru";
  const image = z.string().trim().max(500).refine(isValidImageRef, imageRefError(ru ? "ru" : "uz")).default("");
  const url = z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), ru ? "URL должен начинаться с https://." : "URL https:// bilan boshlanishi kerak.")
    .default("");
  const doctorSchema = z.object({
    fullName: z.string().trim().min(2, d.common.required).max(150),
    title: z.string().trim().min(2, d.common.required).max(150),
    shortDescription: text(400),
    biography: text(5000),
    yearsExperience: optionalInt(0, 80),
    patientsTreated: optionalInt(0, 10_000_000),
    proceduresPerformed: optionalInt(0, 10_000_000),
    certificationsCount: optionalInt(0, 10_000),
    education: text(3000),
    training: text(3000),
    professionalHistory: text(3000),
    specializations: text(2000),
    certifications: text(3000),
    memberships: text(2000),
    heroTitle: text(120),
    heroBadge: text(80),
    logoUrl: image,
    photoUrl: image,
    aboutPhotoUrl: image,
    clinicName: text(200),
    city: text(100),
    country: text(100),
    address: text(300),
    phone: text(40),
    whatsapp: text(40),
    telegram: text(100),
    email: optionalEmailFor(d),
    /** Accepts "username", "@username" or an instagram.com link; stored as the bare username. */
    instagram: z
      .string()
      .trim()
      .max(200)
      .transform((v) => instagramUsername(v))
      .refine((v) => v === "" || /^[A-Za-z0-9._]{1,30}$/.test(v), ru ? "Неверный username Instagram (только буквы, цифры, точка и _)." : "Instagram username noto'g'ri (faqat harf, raqam, nuqta va _)."),
    facebook: url,
    youtube: url,
    mapQuery: text(300),
    titleRu: text(150),
    shortDescriptionRu: text(400),
    heroTitleRu: text(120),
    heroBadgeRu: text(80),
    biographyRu: text(5000),
    specializationsRu: text(2000),
    professionalHistoryRu: text(3000),
    educationRu: text(3000),
    trainingRu: text(3000),
    certificationsRu: text(3000),
    membershipsRu: text(2000),
    addressRu: text(300),
    clinicNameRu: text(200),
  });

  const testimonialSchema = z.object({
    patientName: z.string().trim().min(2, d.common.required).max(120),
    text: z.string().trim().min(5, d.common.required).max(1500),
    rating: optionalInt(1, 5),
    active: checkbox,
  });

  const faqSchema = z.object({
    question: z.string().trim().min(3, d.common.required).max(300),
    answer: z.string().trim().min(3, d.common.required).max(3000),
    questionRu: text(300),
    answerRu: text(3000),
    active: checkbox,
  });

  const settingsSchema = z.object({
    bookingEnabled: checkbox,
    slotMinutes: z.coerce.number().int().min(5).max(240),
    bookingWindowDays: z.coerce.number().int().min(1).max(365),
    minNoticeMinutes: z.coerce.number().int().min(0).max(7 * 24 * 60),
    timezone: z
      .string()
      .trim()
      .refine((tz) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      }, ru ? "Неверный часовой пояс." : "Noto'g'ri vaqt mintaqasi."),
    siteTitle: text(120),
    metaDescription: text(300),
    backgroundUrl: image,
    loginBackgroundUrl: image,
    adminBackgroundUrl: image,
  });

  const passwordSchema = z.object({
    currentPassword: z.string().min(1, d.common.required).max(200),
    newPassword: z.string().min(10, ru ? "Не менее 10 символов." : "Kamida 10 ta belgi.").max(200),
  });

  const blockedDateSchema = z.object({
    date: z.string().regex(DATE_RE, d.booking.errors.date),
    reason: text(200),
  });

  return { doctorSchema, testimonialSchema, faqSchema, settingsSchema, passwordSchema, blockedDateSchema };
}

export const { doctorSchema, testimonialSchema, faqSchema, settingsSchema, passwordSchema, blockedDateSchema } = adminSchemasFor(t);

export const id = z.string().min(1).max(50);
export const statusSchema = z.enum(["NEW", "CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"]);

/** Flattens zod issues into { field: [messages] } for forms. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
