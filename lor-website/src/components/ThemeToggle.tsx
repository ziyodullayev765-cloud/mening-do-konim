"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";

/**
 * Sun / moon switch shared by the public site and the admin panel. The choice
 * is applied instantly via <html data-theme> and kept in a cookie so the server
 * renders the same theme on the next visit (no flash).
 */
export function ThemeToggle({ labels, className = "" }: { labels: { light: string; dark: string }; className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  const label = theme === "dark" ? labels.light : labels.dark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      {theme === "dark" ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
    </button>
  );
}
