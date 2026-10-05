"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

const LABELS: Record<Locale, string> = { uz: "UZ", ru: "RU" };

/** RU / UZ toggle. Stores the choice in a cookie and re-renders the page on the server. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    startTransition(() => router.refresh());
  }

  return (
    <div role="group" aria-label={t.site.language} className={`inline-flex rounded-lg border border-line bg-white p-0.5 ${pending ? "opacity-60" : ""} ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${l === locale ? "bg-accent text-white" : "text-muted hover:text-ink"}`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
