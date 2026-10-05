import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: t.admin.login.title, robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_10%,rgb(47_111_216/0.45),transparent_70%)]" />
        <div className="relative flex h-full flex-col justify-end p-14">
          <p className="eyebrow !text-[#9cc4f5]">{t.admin.brand}</p>
          <p className="mt-4 max-w-md font-serif text-4xl leading-tight text-paper">Qabullar, xizmatlar va jadvalni bir joyda boshqaring.</p>
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
  );
}
