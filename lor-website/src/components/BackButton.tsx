"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/components/site/I18nProvider";

/**
 * "← Back" link: returns to the previous page inside the site, or to
 * `fallback` when the page was opened directly (no in-site history).
 */
export function BackButton({ fallback, className = "" }: { fallback: string; className?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => {
        const sameSite = document.referrer && new URL(document.referrer).origin === location.origin;
        if (sameSite && history.length > 1) router.back();
        else router.push(fallback);
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg py-1 pr-2 text-sm font-semibold text-muted transition-colors hover:text-accent ${className}`}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {t.common.back}
    </button>
  );
}
