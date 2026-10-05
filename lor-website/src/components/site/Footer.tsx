import type { Doctor } from "@prisma/client";
import { t } from "@/lib/i18n";

export function Footer({ doctor }: { doctor: Doctor }) {
  return (
    <footer className="border-t border-line pb-24 sm:pb-0">
      <div className="container-x flex flex-col gap-2 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {doctor.fullName}</p>
        <p className="max-w-xl text-xs md:text-right">{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
