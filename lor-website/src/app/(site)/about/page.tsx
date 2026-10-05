import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data";
import { getLocale, getT } from "@/lib/i18n/server";
import { AboutPage } from "@/components/site/sections/About";

export async function generateMetadata(): Promise<Metadata> {
  const [{ doctor }, t] = await Promise.all([getPublicContent(await getLocale()), getT()]);
  return { title: t.about.eyebrow, description: doctor.shortDescription || doctor.title, alternates: { canonical: "/about" } };
}

export default async function About() {
  const { doctor } = await getPublicContent(await getLocale());
  return <AboutPage doctor={doctor} />;
}
