import { getPublicContent } from "@/lib/data";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileBookBar } from "@/components/site/MobileBookBar";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { doctor } = await getPublicContent();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Asosiy mazmunga o'tish
      </a>
      <Header name={doctor.fullName} title={doctor.title} phone={doctor.phone} />
      <main id="main">{children}</main>
      <Footer doctor={doctor} />
      <MobileBookBar phone={doctor.phone} />
    </>
  );
}
