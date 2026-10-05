/**
 * Single source of truth for service validation.
 * Imported by the client form (react-hook-form + zodResolver) AND by the
 * server action, so both sides apply exactly the same rules and messages.
 * Must stay free of server-only imports.
 */
import { z } from "zod";
import { imageRefError, isValidImageRef } from "@/lib/media-shared";

export const SERVICE_CATEGORIES = ["CONSULTATION", "DIAGNOSTICS", "TREATMENT", "SURGERY"] as const;
export type ServiceCategoryKey = (typeof SERVICE_CATEGORIES)[number];

/** Categories shown in the public "Procedures" section; the rest go to "Services". */
const PROCEDURE_CATEGORIES: readonly ServiceCategoryKey[] = ["TREATMENT", "SURGERY"];

export function kindForCategory(category: ServiceCategoryKey) {
  return PROCEDURE_CATEGORIES.includes(category) ? ("PROCEDURE" as const) : ("SERVICE" as const);
}

export function isProcedureCategory(category: ServiceCategoryKey) {
  return PROCEDURE_CATEGORIES.includes(category);
}

export const SERVICE_ICON_KEYS = [
  "stethoscope", "ear", "wind", "mic", "microscope", "scan", "activity",
  "baby", "syringe", "scissors", "pill", "heart", "shield", "sparkles",
] as const;

export const PRICE_MAX = 1_000_000_000;
export const DURATION_MIN = 5;
export const DURATION_MAX = 600;

type Locale = "uz" | "ru";

const MESSAGES = {
  uz: {
    nameMin: "Xizmat nomini to'liq kiriting (kamida 3 ta belgi).",
    nameMax: "Nom 120 belgidan oshmasligi kerak.",
    category: "Kategoriyani tanlang.",
    priceNumber: "Narx faqat raqamlardan iborat bo'lishi kerak.",
    pricePositive: "Narx musbat son bo'lishi kerak.",
    priceMax: "Narx juda katta.",
    priceFromNeedsPrice: "\"…dan\" ko'rinishi uchun narxni kiriting.",
    durationNumber: "Davomiylik butun son (daqiqa) bo'lishi kerak.",
    durationRange: `Davomiylik ${DURATION_MIN}–${DURATION_MAX} daqiqa oralig'ida bo'lishi kerak.`,
    sortNumber: "Tartib raqami butun son bo'lishi kerak.",
    tooLong: (n: number) => `${n} belgidan oshmasligi kerak.`,
    icon: "Belgini tanlang.",
  },
  ru: {
    nameMin: "Введите полное название услуги (не менее 3 символов).",
    nameMax: "Название не должно превышать 120 символов.",
    category: "Выберите категорию.",
    priceNumber: "Цена должна состоять только из цифр.",
    pricePositive: "Цена должна быть положительным числом.",
    priceMax: "Слишком большая цена.",
    priceFromNeedsPrice: "Для вида «от …» укажите цену.",
    durationNumber: "Длительность должна быть целым числом (минуты).",
    durationRange: `Длительность должна быть от ${DURATION_MIN} до ${DURATION_MAX} минут.`,
    sortNumber: "Порядковый номер должен быть целым числом.",
    tooLong: (n: number) => `Не более ${n} символов.`,
    icon: "Выберите иконку.",
  },
};

/**
 * Optional integer typed into a text field. Accepts "250 000", "250,000" or "".
 * "" -> null. Kept as string input so the browser never turns it into NaN.
 */
function optionalInt(opts: { min: number; max: number; notNumber: string; range: string; minMsg?: string }) {
  return z
    .string()
    .trim()
    .max(20, opts.notNumber)
    .transform((v) => v.replace(/[\s_,]/g, ""))
    .refine((v) => v === "" || /^-?\d+$/.test(v), opts.notNumber)
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || v >= opts.min, opts.minMsg ?? opts.range)
    .refine((v) => v === null || v <= opts.max, opts.range);
}

export function serviceFormSchemaFor(locale: Locale = "uz") {
  const msg = MESSAGES[locale];
  const text = (max: number) => z.string().trim().max(max, msg.tooLong(max));
  return z
  .object({
    name: z.string().trim().min(3, msg.nameMin).max(120, msg.nameMax),
    category: z.enum(SERVICE_CATEGORIES, { error: msg.category }),
    description: text(600),
    price: optionalInt({ min: 1, max: PRICE_MAX, notNumber: msg.priceNumber, range: msg.priceMax, minMsg: msg.pricePositive }),
    priceFrom: z.boolean(),
    durationMinutes: optionalInt({ min: DURATION_MIN, max: DURATION_MAX, notNumber: msg.durationNumber, range: msg.durationRange }),
    icon: z.enum(SERVICE_ICON_KEYS, { error: msg.icon }),
    imageUrl: z
      .string()
      .trim()
      .max(500, msg.tooLong(500))
      .refine(isValidImageRef, imageRefError(locale)),
    indication: text(500),
    recovery: text(500),
    nameRu: text(120),
    descriptionRu: text(600),
    indicationRu: text(500),
    recoveryRu: text(500),
    showInPricing: z.boolean(),
    active: z.boolean(),
    sortOrder: optionalInt({ min: -1000, max: 10000, notNumber: msg.sortNumber, range: msg.sortNumber }),
  })
  .superRefine((v, ctx) => {
    if (v.priceFrom && v.price === null) {
      ctx.addIssue({ code: "custom", path: ["priceFrom"], message: msg.priceFromNeedsPrice });
    }
  });
}

export const serviceFormSchema = serviceFormSchemaFor("uz");

/** What the form holds (strings for numeric inputs). */
export type ServiceFormInput = z.input<typeof serviceFormSchema>;
/** What the server stores after parsing. */
export type ServiceFormOutput = z.output<typeof serviceFormSchema>;

export const emptyServiceForm: ServiceFormInput = {
  name: "",
  category: "CONSULTATION",
  description: "",
  price: "",
  priceFrom: false,
  durationMinutes: "",
  icon: "stethoscope",
  imageUrl: "",
  indication: "",
  recovery: "",
  nameRu: "",
  descriptionRu: "",
  indicationRu: "",
  recoveryRu: "",
  showInPricing: true,
  active: true,
  sortOrder: "0",
};
