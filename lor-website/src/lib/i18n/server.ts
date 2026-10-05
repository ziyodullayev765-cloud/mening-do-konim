import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dictionaries, isLocale, type Locale } from "./index";

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

export async function getT() {
  return dictionaries[await getLocale()];
}
