import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.privacyPage.title, description: t.privacyPage.intro, alternates: { canonical: "/privacy" } };
}

export default async function PrivacyPage() {
  const t = await getT();
  const p = t.privacyPage;
  return (
    <section className="pt-8 pb-28 sm:pt-12 lg:pb-32">
      <div className="container-x max-w-3xl">
        <h1 className="h-display text-[1.85rem] sm:text-[clamp(2.2rem,1.6rem+2vw,3rem)]">{p.title}</h1>
        <p className="mt-2 text-sm text-muted">{p.updated}</p>
        <p className="mt-5 text-[15px] leading-relaxed text-text sm:text-[17px]">{p.intro}</p>
        <div className="mt-8 space-y-6">
          {p.sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-ink">{s.title}</h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-text">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
