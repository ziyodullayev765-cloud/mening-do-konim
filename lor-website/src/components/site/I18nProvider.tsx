"use client";

import { createContext, useContext, useMemo } from "react";
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n";
import { applyTexts } from "@/lib/i18n/texts";

const I18nContext = createContext<{ locale: Locale; t: Dictionary }>({ locale: "uz", t: dictionaries.uz });

/** Gives client components the visitor's language (chosen on the server from the cookie). */
export function I18nProvider({
  locale,
  texts,
  children,
}: {
  locale: Locale;
  /** Admin-edited site texts for this language (see lib/i18n/texts.ts). */
  texts?: Record<string, string>;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: applyTexts(dictionaries[locale], texts) }), [locale, texts]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  /** Picks the Uzbek or Russian variant of an inline (non-dictionary) string. */
  const L = (uz: string, ru: string) => (ctx.locale === "ru" ? ru : uz);
  return { ...ctx, L };
}
