import { uz } from "./uz";
import { ru } from "./ru";
import type { Dictionary } from "./uz";

export type { Dictionary } from "./uz";
export type Locale = "uz" | "ru";
export const LOCALES: Locale[] = ["uz", "ru"];
export const DEFAULT_LOCALE: Locale = "uz";
export const LOCALE_COOKIE = "lang";

export const dictionaries: Record<Locale, Dictionary> = { uz, ru };

export function isLocale(value: unknown): value is Locale {
  return value === "uz" || value === "ru";
}

/** Static Uzbek dictionary — used by the admin panel and as the default. */
export const t: Dictionary = uz;
