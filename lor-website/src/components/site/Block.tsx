import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

/** Section with a heading row (title left, optional link right) and content below. */
export function Block({
  id,
  label,
  title,
  lead,
  action,
  tone = "plain",
  backdrop,
  panel,
  children,
}: {
  id: string;
  label: string;
  title: string;
  lead?: string;
  action?: { href: string; label: string };
  tone?: "plain" | "white";
  /** Optional decorative layer drawn behind the section content. */
  backdrop?: React.ReactNode;
  /** Wrap heading + content in a frosted glass panel; `decor` is drawn faintly inside it. */
  panel?: { decor?: React.ReactNode };
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={backdrop ? "relative isolate overflow-hidden" : panel ? "" : tone === "white" ? "bg-white" : ""}>
      {backdrop}
      <div className={panel ? "container-x py-6 sm:py-10" : "container-x py-12 sm:py-20 lg:py-24"}>
        <div className={panel ? "glass-panel relative isolate mx-auto max-w-4xl overflow-hidden px-4 py-6 sm:px-10 sm:py-10" : ""}>
        {panel?.decor}
        <Reveal className="flex flex-col gap-2.5 sm:flex-row sm:gap-4 sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-accent sm:text-sm">{label}</p>
            <h2 id={`${id}-title`} className="h-section mt-2">{title}</h2>
            {lead && <p className="mt-2 text-[15px] leading-relaxed text-muted sm:mt-3 sm:text-[17px]">{lead}</p>}
          </div>
          {action && (
            <a href={action.href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold sm:text-base text-accent hover:text-accent-strong">
              {action.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          )}
        </Reveal>
        <div className={panel ? "mt-5 sm:mt-8" : "mt-6 sm:mt-10 lg:mt-12"}>{children}</div>
        </div>
      </div>
    </section>
  );
}
