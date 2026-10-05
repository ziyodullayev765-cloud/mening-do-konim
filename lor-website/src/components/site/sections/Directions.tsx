import { Activity, Baby, Ear, Microscope, Mic, Stethoscope, Wind, type LucideIcon } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { isPlaceholder, lines } from "@/lib/format";
import { Block } from "../Block";
import { Reveal } from "../Reveal";

const FALLBACK = ["Quloq kasalliklari", "Burun va burun yondosh bo'shliqlari", "Tomoq va hiqildoq kasalliklari", "Bolalar LOR kasalliklari"];

function iconFor(text: string): LucideIcon {
  const s = text.toLowerCase();
  if (s.includes("bola")) return Baby;
  if (s.includes("quloq") || s.includes("eshit")) return Ear;
  if (s.includes("burun") || s.includes("sinus") || s.includes("nafas")) return Wind;
  if (s.includes("tomoq") || s.includes("hiqildoq") || s.includes("ovoz")) return Mic;
  if (s.includes("endoskop") || s.includes("tashxis") || s.includes("diagnost")) return Microscope;
  if (s.includes("allerg")) return Activity;
  return Stethoscope;
}

/** Treatment directions — taken from the doctor's specializations in the admin panel. */
export function Directions({ doctor }: { doctor: Doctor }) {
  const items = lines(doctor.specializations).filter((x) => !isPlaceholder(x));
  const list = items.length ? items : FALLBACK;
  return (
    <Block id="directions" label="Yo'nalishlar" title="Davolash yo'nalishlari" action={{ href: "#prices", label: "Barcha xizmatlar" }}>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((name, i) => {
          const Icon = iconFor(name);
          return (
            <Reveal as="li" key={name} delay={(i % 4) * 60}>
              <div className="card lift flex h-full flex-col p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                </span>
                <p className="mt-5 font-bold leading-snug text-ink">{name}</p>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Block>
  );
}
