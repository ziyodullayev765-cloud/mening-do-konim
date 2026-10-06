import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/slots";
import { getL, getLocale, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/site/I18nProvider";
import { AdminPrefs } from "@/components/admin/AdminPrefs";
import { LoginForm } from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.login.title, robots: { index: false, follow: false } };
}

export default async function LoginPage() {
  const [t, L, locale] = await Promise.all([getT(), getL(), getLocale()]);
  if (await getAdmin()) redirect("/admin");
  const bg = (await getSettings()).loginBackgroundUrl;
  return (
    <I18nProvider locale={locale}>
    <main className="relative grid min-h-dvh lg:grid-cols-2">
      {bg && (
        // On phones the uploaded picture becomes the page background behind a frosted form card.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg} alt="" aria-hidden className="fixed inset-0 -z-10 size-full object-cover lg:hidden" />
      )}
      <div className="absolute top-4 right-4 z-10"><AdminPrefs /></div>
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {bg ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bg} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          </>
        ) : (
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_10%,rgb(10_147_150/0.45),transparent_70%)]" />
        )}
        <div className="relative flex h-full flex-col justify-end p-14">
          <p className="eyebrow !text-[#8fdcd6]">{t.admin.brand}</p>
          <p className="mt-4 max-w-md font-serif text-4xl leading-tight text-paper">{L("Qabullar, xizmatlar va jadvalni bir joyda boshqaring.", "Записи, услуги и график — в одном месте.")}</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className={`w-full max-w-sm ${bg ? "max-lg:rounded-2xl max-lg:border max-lg:border-white/50 max-lg:bg-surface/85 max-lg:p-6 max-lg:shadow-xl max-lg:backdrop-blur-xl" : ""}`}>
          <h1 className="font-serif text-3xl text-ink">{t.admin.login.title}</h1>
          <p className="mt-2 text-muted">{t.admin.login.lead}</p>
          <LoginForm />
        </div>
      </div>
    </main>
    </I18nProvider>
  );
}
