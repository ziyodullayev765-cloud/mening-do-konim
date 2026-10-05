import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { getDoctor, getSiteSettings } from "@/lib/data";
import { t } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#f3fafa", width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const [doctor, settings] = await Promise.all([getDoctor(), getSiteSettings()]);
  const title = settings.siteTitle || `${doctor.fullName} — ${doctor.title}`;
  const description =
    settings.metaDescription || doctor.shortDescription || `${doctor.fullName}: ${t.hero.specialty}.`;
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${doctor.fullName}` },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: t.meta.ogLocale,
      url: siteUrl,
      siteName: doctor.fullName,
      title,
      description,
      ...(doctor.photoUrl ? { images: [{ url: doctor.photoUrl }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={t.meta.locale} className={`${manrope.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
