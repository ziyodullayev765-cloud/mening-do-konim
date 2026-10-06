import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dictionaries, isLocale, type Locale } from "./index";
import { applyTexts, parseOverrides } from "./texts";

/** Visitor's language from the `lang` cookie (set by the RU/UZ switcher). */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** Colour theme from the `theme` cookie (set by the sun/moon toggle). */
export const getTheme = cache(async (): Promise<"light" | "dark"> =>
  (await cookies()).get("theme")?.value === "dark" ? "dark" : "light",
);

/** Picks the Uzbek or Russian variant of an inline (non-dictionary) string. */
export async function getL() {
  const locale = await getLocale();
  return (uz: string, ru: string) => (locale === "ru" ? ru : uz);
}

/** Site texts the admin changed (Admin → Site texts), for the visitor's language. */
export const getTextOverrides = cache(async (): Promise<Record<string, string>> => {
  const locale = await getLocale();
  try {
    const s = await db.setting.findUnique({ where: { id: 1 }, select: { texts: true } });
    return parseOverrides(s?.texts)[locale] ?? {};
  } catch {
    return {};
  }
});

/** The dictionary for the visitor's language, with the admin's text changes applied. */
export const getT = cache(async () => applyTexts(dictionaries[await getLocale()], await getTextOverrides()));
