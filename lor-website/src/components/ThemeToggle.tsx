"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/**
 * Sun / moon switch shared by the public site and the admin panel. The choice
 * is applied via <html data-theme> and kept in a cookie so the server renders
 * the same theme on the next visit (no flash).
 *
 * Switching is animated: the new theme spreads from the button as a growing
 * circle (View Transitions API); browsers without it get a soft colour fade.
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
      setTheme(next);
      setSpin((n) => n + 1);
      html.dataset.theme = next;
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as ViewTransitionDoc;
    if (reduced) return apply();

    if (!doc.startViewTransition) {
      // Fallback: fade colours for a moment.
      html.classList.add("theme-fade");
      apply();
      window.setTimeout(() => html.classList.remove("theme-fade"), 650);
      return;
    }

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => flushSync(apply));
    vt.ready.then(() => {
      html.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
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
