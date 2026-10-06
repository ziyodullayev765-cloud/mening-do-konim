import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getDoctor, getSiteSettings } from "@/lib/data";
import { getLocale, getT, getTheme } from "@/lib/i18n/server";
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

/** Sends uncaught browser errors to /api/client-error so they show up in the server logs. */
const REPORT_ERRORS = `(function(){var n=0;function send(m,s,st){if(n++>5)return;try{var b=JSON.stringify({message:String(m||""),source:String(s||""),stack:String(st||""),url:location.href});navigator.sendBeacon?navigator.sendBeacon("/api/client-error",b):fetch("/api/client-error",{method:"POST",body:b,keepalive:true})}catch(e){}}window.addEventListener("error",function(e){send(e.message,(e.filename||"")+":"+(e.lineno||0),e.error&&e.error.stack)});window.addEventListener("unhandledrejection",function(e){var r=e.reason||{};send(r.message||String(r),"promise",r.stack)});window.__reportError=send})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);
  return (
    <html lang={locale} data-theme={theme} className={`${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESET_SCROLL_ON_RELOAD }} />
        <script dangerouslySetInnerHTML={{ __html: REPORT_ERRORS }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
