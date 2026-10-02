import Link from "next/link";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="font-serif text-8xl text-accent/30">404</p>
        <h1 className="mt-4 font-serif text-4xl">{t.notFound.title}</h1>
        <p className="mt-3 text-muted">{t.notFound.lead}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-dark">{t.booking.backHome}</Link>
          <Link href="/book" className="btn btn-primary">{t.common.bookAppointment}</Link>
        </div>
      </div>
    </main>
  );
}
