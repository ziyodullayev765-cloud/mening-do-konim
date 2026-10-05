import { z } from "zod";
import { t, type Dictionary } from "@/lib/i18n";
import { DATE_RE, TIME_RE } from "@/lib/slots-shared";
import { IMAGE_REF_ERROR, isValidImageRef } from "@/lib/media-shared";
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

const phone = z
  .string()
  .trim()
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    return /^[+\d\s()-]+$/.test(v) && digits.length >= 9 && digits.length <= 15;
  }, t.booking.errors.phone);

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || z.email().safeParse(v).success, t.booking.errors.email)
  .default("");

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "URL https:// bilan boshlanishi kerak.")
  .default("");

/** Uploaded image (/media/…) or external https URL. */
const imageRef = z.string().trim().max(500).refine(isValidImageRef, IMAGE_REF_ERROR).default("");

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
  email: z.email().max(200),
  password: z.string().min(1).max(200),
  remember: checkbox,
});

export const doctorSchema = z.object({
  fullName: z.string().trim().min(2, t.common.required).max(150),
  title: z.string().trim().min(2, t.common.required).max(150),
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
  logoUrl: imageRef,
  photoUrl: imageRef,
  aboutPhotoUrl: imageRef,
  clinicName: text(200),
  city: text(100),
  country: text(100),
  address: text(300),
  phone: text(40),
  whatsapp: text(40),
  telegram: text(100),
  email: optionalEmail,
  /** Accepts "username", "@username" or an instagram.com link; stored as the bare username. */
  instagram: z
    .string()
    .trim()
    .max(200)
    .transform((v) => instagramUsername(v))
    .refine((v) => v === "" || /^[A-Za-z0-9._]{1,30}$/.test(v), "Instagram username noto'g'ri (faqat harf, raqam, nuqta va _)."),
  facebook: optionalUrl,
  youtube: optionalUrl,
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

export const testimonialSchema = z.object({
  patientName: z.string().trim().min(2, t.common.required).max(120),
  text: z.string().trim().min(5, t.common.required).max(1500),
  rating: optionalInt(1, 5),
  active: checkbox,
});

export const faqSchema = z.object({
  question: z.string().trim().min(3, t.common.required).max(300),
  answer: z.string().trim().min(3, t.common.required).max(3000),
  questionRu: text(300),
  answerRu: text(3000),
  active: checkbox,
});

export const settingsSchema = z.object({
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
    }, "Noto'g'ri vaqt mintaqasi."),
  siteTitle: text(120),
  metaDescription: text(300),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, t.common.required).max(200),
  newPassword: z.string().min(10, "Kamida 10 ta belgi.").max(200),
});

export const blockedDateSchema = z.object({
  date: z.string().regex(DATE_RE, t.booking.errors.date),
  reason: text(200),
});

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
