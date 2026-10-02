import { t } from "@/lib/i18n";

const nf = new Intl.NumberFormat("ru-RU");

/** 2500000 -> "2 500 000" (thin spaces normalised to regular spaces) */
export function formatNumber(n: number) {
  return nf.format(n).replace(/\s/g, " ");
}

export function formatPrice(price: number | null | undefined, from = false) {
  if (price == null) return t.common.priceOnRequest;
  const amount = `${formatNumber(price)} ${t.common.currency}`;
  return from ? t.common.priceFrom.replace("{price}", amount) : amount;
}

export function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} ${t.common.minutesShort}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ${t.common.hoursShort} ${m} ${t.common.minutesShort}` : `${h} ${t.common.hoursShort}`;
}

/** "2026-10-02" -> "2-oktabr, 2026" */
export function formatDate(date: string, withWeekday = false) {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const base = `${d}-${t.months[m - 1]}, ${y}`;
  return withWeekday ? `${t.weekdays[dow]}, ${base}` : base;
}

export function formatDateTime(d: Date, timeZone: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Splits newline-separated admin text into trimmed non-empty lines. */
export function lines(text: string | null | undefined) {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

/** Phone -> "+998901234567" (digits with leading +). */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export function telHref(phone: string) {
  return `tel:${normalizePhone(phone)}`;
}

export function whatsappHref(value: string) {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function telegramHref(value: string) {
  if (/^https?:\/\//.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, "")}`;
}

/** Whether a stored profile value is still an unfilled "[PLACEHOLDER]". */
export function isPlaceholder(value: string | null | undefined) {
  return !value || /^\[.*\]$/.test(value.trim());
}
