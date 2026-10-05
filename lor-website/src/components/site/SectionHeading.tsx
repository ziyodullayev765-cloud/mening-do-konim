import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <Reveal className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="h-section mt-4">
        {title}
      </h2>
      {lead && <p className="mt-5 text-[17px] leading-relaxed text-muted">{lead}</p>}
    </Reveal>
  );
}
