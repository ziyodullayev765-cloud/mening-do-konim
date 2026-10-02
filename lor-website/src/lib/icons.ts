import {
  Activity, Baby, Ear, HeartPulse, Microscope, Mic, Scan, ShieldCheck,
  Sparkles, Stethoscope, Syringe, Wind, Pill, Scissors, type LucideIcon,
} from "lucide-react";

/** Icons selectable for services in the admin panel. */
export const SERVICE_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  stethoscope: { icon: Stethoscope, label: "Ko'rik" },
  ear: { icon: Ear, label: "Quloq" },
  wind: { icon: Wind, label: "Burun / nafas" },
  mic: { icon: Mic, label: "Tomoq / ovoz" },
  microscope: { icon: Microscope, label: "Endoskopiya" },
  scan: { icon: Scan, label: "Diagnostika" },
  activity: { icon: Activity, label: "Eshitish" },
  baby: { icon: Baby, label: "Bolalar" },
  syringe: { icon: Syringe, label: "Muolaja" },
  scissors: { icon: Scissors, label: "Operatsiya" },
  pill: { icon: Pill, label: "Davolash" },
  heart: { icon: HeartPulse, label: "Salomatlik" },
  shield: { icon: ShieldCheck, label: "Profilaktika" },
  sparkles: { icon: Sparkles, label: "Boshqa" },
};

export function serviceIcon(key: string) {
  return (SERVICE_ICONS[key] ?? SERVICE_ICONS.stethoscope).icon;
}
