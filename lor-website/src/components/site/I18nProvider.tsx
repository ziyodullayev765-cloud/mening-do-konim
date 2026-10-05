"use client";

import { createContext, useContext } from "react";
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n";

const I18nContext = createContext<{ locale: Locale; t: Dictionary }>({ locale: "uz", t: dictionaries.uz });

/** Gives client components the visitor's language (chosen on the server from the cookie). */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: dictionaries[locale] }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  /** Picks the Uzbek or Russian variant of an inline (non-dictionary) string. */
  const L = (uz: string, ru: string) => (ctx.locale === "ru" ? ru : uz);
  return { ...ctx, L };
}
