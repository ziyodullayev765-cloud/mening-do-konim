import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
  hideEyebrow = false,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  id?: string;
  hideEyebrow?: boolean;
}) {
  return (
    <Reveal className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {!hideEyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className={`h-section ${hideEyebrow ? "" : "mt-3"}`}>
        {title}
      </h2>
      {lead && <p className="mt-4 text-[17px] leading-relaxed text-muted">{lead}</p>}
    </Reveal>
  );
}
