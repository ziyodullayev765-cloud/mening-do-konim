"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "./toast";

/** Shows a toast once (e.g. after a redirect with ?saved=1) and cleans the URL. */
export function FlashToast({ message }: { message: string }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    toast(message);
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);
  return null;
}
