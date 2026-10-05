import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getDoctor, getSiteSettings } from "@/lib/data";
import { getLocale, getT } from "@/lib/i18n/server";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope", display: "swap" });

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  // Requested: no pinch-zoom or auto-zoom on the site.
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const [doctor, settings, t] = await Promise.all([getDoctor(), getSiteSettings(), getT()]);
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

/**
 * A page reload should open at the top. Otherwise the browser restores the old
 * scroll position (or a leftover #anchor), which with smooth scrolling looks
 * like the page sliding down by itself. Restoration is switched off only while
 * the page unloads, so back/forward inside the site keeps working.
 */
const RESET_SCROLL_ON_RELOAD = `try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"&&location.hash)history.replaceState(history.state,"",location.pathname+location.search);addEventListener("load",function(){setTimeout(function(){history.scrollRestoration="auto"},300)});addEventListener("pagehide",function(){history.scrollRestoration="manual"});addEventListener("pageshow",function(e){if(e.persisted)history.scrollRestoration="auto"})}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESET_SCROLL_ON_RELOAD }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
