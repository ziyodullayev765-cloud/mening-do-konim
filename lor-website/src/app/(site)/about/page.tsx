import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data";
import { t } from "@/lib/i18n";
import { AboutPage } from "@/components/site/sections/About";

export async function generateMetadata(): Promise<Metadata> {
  const { doctor } = await getPublicContent();
  return { title: t.about.eyebrow, description: doctor.shortDescription || doctor.title, alternates: { canonical: "/about" } };
}

export default async function About() {
  const { doctor } = await getPublicContent();
  return <AboutPage doctor={doctor} />;
}
