"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, Inbox, Sparkles } from "lucide-react";

const SHOW_MS = 4800;

/**
 * Greeting shown once right after signing in to the admin panel:
 * "Assalomu alaykum, …!" with today's summary, then it fades away by itself.
 */
export function WelcomeSplash({
  hello,
  name,
  greeting,
  today,
  lines,
  cta,
}: {
  hello: string;
  name: string;
  greeting: string;
  today: string;
  lines: { icon: "calendar" | "inbox"; text: string }[];
  cta: string;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const close = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      setGone(true);
      router.replace("/admin", { scroll: false });
    }, 650);
  }, [router]);

  useEffect(() => {
    const id = window.setTimeout(close, SHOW_MS);
    const onKey = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter") && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  if (gone) return null;
  const title = name ? `${hello}, ${name}!` : `${hello}!`;
  const Icons = { calendar: CalendarCheck, inbox: Inbox };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={close}
      className={`welcome-overlay fixed inset-0 z-[70] grid place-items-center overflow-hidden px-5 ${leaving ? "welcome-leave" : ""}`}
    >
      {/* Drifting aurora behind frosted glass */}
      <div aria-hidden className="absolute inset-0">
        <span className="welcome-orb left-[8%] top-[12%] size-[28rem] bg-[#1e9db2]" />
        <span className="welcome-orb right-[6%] bottom-[8%] size-[32rem] bg-[#7c6cf0] [animation-delay:-3s]" />
        <span className="welcome-orb left-[40%] bottom-[30%] size-[20rem] bg-[#2bd4c4] [animation-delay:-6s]" />
      </div>

      <div className="welcome-card relative w-full max-w-lg overflow-hidden rounded-[28px] p-8 text-center sm:p-10" onClick={(e) => e.stopPropagation()}>
        <div aria-hidden className="welcome-shine" />
        <p className="welcome-in flex items-center justify-center gap-2 text-sm font-semibold text-accent [--d:100ms]">
          <Sparkles className="size-4" aria-hidden /> {greeting}
        </p>
        <div aria-hidden className="welcome-in welcome-wave mx-auto mt-5 text-6xl [--d:200ms] sm:text-7xl">👋</div>
        <h1 className="mt-5 font-serif text-[1.7rem] leading-tight font-extrabold text-ink sm:text-[2.1rem]">
          {title.split(" ").map((word, i) => (
            <span key={i} className="welcome-word inline-block" style={{ "--d": `${350 + i * 110}ms` } as React.CSSProperties}>
              {word}&nbsp;
            </span>
          ))}
        </h1>
        <p className="welcome-in mt-2 text-[15px] text-muted [--d:750ms]">{today}</p>

        {lines.length > 0 && (
          <ul className="mt-6 space-y-2 text-left">
            {lines.map((l, i) => {
              const Icon = Icons[l.icon];
              return (
                <li
                  key={i}
                  className="welcome-in flex items-center gap-3 rounded-xl border border-white/60 bg-white/55 px-4 py-3 text-[15px] text-ink"
                  style={{ "--d": `${900 + i * 130}ms` } as React.CSSProperties}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Icon className="size-[18px]" aria-hidden /></span>
                  {l.text}
                </li>
              );
            })}
          </ul>
        )}

        <button type="button" onClick={close} className="welcome-in btn btn-primary mt-7 w-full [--d:1200ms]">
          {cta} <ArrowRight className="size-4" aria-hidden />
        </button>
        <div aria-hidden className="welcome-progress mt-5 h-1 overflow-hidden rounded-full bg-line">
          <span className="block h-full rounded-full bg-accent" style={{ animationDuration: `${SHOW_MS}ms` }} />
        </div>
      </div>
    </div>
  );
}
