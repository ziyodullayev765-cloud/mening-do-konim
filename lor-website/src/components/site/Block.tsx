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
  children,
}: {
  id: string;
  label: string;
  title: string;
  lead?: string;
  action?: { href: string; label: string };
  tone?: "plain" | "white";
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={tone === "white" ? "bg-white" : ""}>
      <div className="container-x py-20 lg:py-24">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-accent">{label}</p>
            <h2 id={`${id}-title`} className="h-section mt-2">{title}</h2>
            {lead && <p className="mt-3 text-[17px] leading-relaxed text-muted">{lead}</p>}
          </div>
          {action && (
            <a href={action.href} className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-accent hover:text-accent-strong">
              {action.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          )}
        </Reveal>
        <div className="mt-10 lg:mt-12">{children}</div>
      </div>
    </section>
  );
}
