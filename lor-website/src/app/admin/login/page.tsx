import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
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
  return (
    <I18nProvider locale={locale}>
    <main className="relative grid min-h-dvh lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-10"><AdminPrefs /></div>
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_10%,rgb(10_147_150/0.45),transparent_70%)]" />
        <div className="relative flex h-full flex-col justify-end p-14">
          <p className="eyebrow !text-[#8fdcd6]">{t.admin.brand}</p>
          <p className="mt-4 max-w-md font-serif text-4xl leading-tight text-paper">{L("Qabullar, xizmatlar va jadvalni bir joyda boshqaring.", "Записи, услуги и график — в одном месте.")}</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-ink">{t.admin.login.title}</h1>
          <p className="mt-2 text-muted">{t.admin.login.lead}</p>
          <LoginForm />
        </div>
      </div>
    </main>
    </I18nProvider>
  );
}
