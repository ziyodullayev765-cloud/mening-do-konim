import { Activity, Baby, Ear, Microscope, Mic, Stethoscope, Wind, type LucideIcon } from "lucide-react";
import type { Doctor } from "@prisma/client";
import { isPlaceholder, lines } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { Block } from "../Block";
import { Reveal } from "../Reveal";


function iconFor(text: string): LucideIcon {
  const s = text.toLowerCase();
  if (s.includes("bola") || s.includes("дет")) return Baby;
  if (s.includes("quloq") || s.includes("eshit") || s.includes("ух") || s.includes("слух")) return Ear;
  if (s.includes("burun") || s.includes("sinus") || s.includes("nafas") || s.includes("нос") || s.includes("пазух")) return Wind;
  if (s.includes("tomoq") || s.includes("hiqildoq") || s.includes("ovoz") || s.includes("горл") || s.includes("гортан")) return Mic;
  if (s.includes("endoskop") || s.includes("tashxis") || s.includes("diagnost") || s.includes("эндоскоп") || s.includes("диагност")) return Microscope;
  if (s.includes("allerg")) return Activity;
  return Stethoscope;
}

/** Treatment directions — taken from the doctor's specializations in the admin panel. */
export async function Directions({ doctor }: { doctor: Doctor }) {
  const t = await getT();
  const items = lines(doctor.specializations).filter((x) => !isPlaceholder(x));
  const list = items.length ? items : t.site.fallbackDirections;
  return (
    <Block id="directions" label={t.site.directions} title={t.site.directionsTitle} action={{ href: "#prices", label: t.site.allServices }}>
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((name, i) => {
          const Icon = iconFor(name);
          return (
            <Reveal as="li" key={name} delay={(i % 4) * 60}>
              <div className="card lift flex h-full flex-col p-3.5 sm:p-6">
                <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent sm:size-12 sm:rounded-xl">
                  <Icon className="size-5 sm:size-6" strokeWidth={1.7} aria-hidden />
                </span>
                <p className="mt-2.5 text-[13.5px] font-bold leading-snug text-ink sm:mt-5 sm:text-base">{name}</p>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Block>
  );
}
