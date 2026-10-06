"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";

/**
 * Sun / moon switch shared by the public site and the admin panel. The choice
 * is applied via <html data-theme> and kept in a cookie so the server renders
 * the same theme on the next visit (no flash).
 *
 * Switching is animated: the new theme's colour spreads from the button as a
 * growing circle, then the page appears in the new theme.
 */
export function ThemeToggle({ labels, className = "" }: { labels: { light: string; dark: string }; className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [spin, setSpin] = useState(0);

  // Several toggles can be on one page (desktop + phone header): keep them in sync.
  useEffect(() => {
    const html = document.documentElement;
    const read = () => setTheme(html.dataset.theme === "dark" ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const html = document.documentElement;
    const apply = () => {
      html.dataset.theme = next;
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    };
    setSpin((n) => n + 1);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();

    // One smooth motion, starting on the very click: a circle in the new
    // theme's colour grows from the button; once it covers the screen the
    // theme switches underneath and the circle melts away. Only one element
    // animates (clip-path/opacity), so there is no pause before it starts.
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const veil = document.createElement("div");
    veil.className = "theme-veil";
    veil.style.background = next === "dark" ? "#0b1220" : "#f8fafc";
    document.body.appendChild(veil);
    const grow = veil.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 520, easing: "cubic-bezier(.55,0,.35,1)", fill: "forwards" },
    );
    grow.onfinish = () => {
      apply();
      // Give the browser one frame to paint the new theme, then fade the veil out.
      requestAnimationFrame(() => {
        const fade = veil.animate({ opacity: [1, 0] }, { duration: 260, easing: "ease-out", fill: "forwards" });
        fade.onfinish = () => veil.remove();
      });
    };
  }

  const label = theme === "dark" ? labels.light : labels.dark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface text-ink transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      {/* key change replays the spin-in animation on every switch */}
      <span key={spin} className={spin ? "theme-icon-in" : undefined}>
        {theme === "dark" ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
      </span>
    </button>
  );
}
