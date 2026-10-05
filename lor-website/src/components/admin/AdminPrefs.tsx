"use client";

import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/components/site/I18nProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

/** RU/UZ switch + light/dark toggle for the admin panel. */
export function AdminPrefs({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LanguageSwitcher />
      <ThemeToggle labels={{ light: t.site.themeLight, dark: t.site.themeDark }} />
    </div>
  );
}
