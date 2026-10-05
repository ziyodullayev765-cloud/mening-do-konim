"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleX, X } from "lucide-react";
import type { ToastKind } from "./toast";
import { useI18n } from "@/components/site/I18nProvider";

type Item = { id: number; message: string; kind: ToastKind };

export function Toaster() {
  const { L } = useI18n();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let id = 0;
    const onToast = (e: Event) => {
      const { message, kind } = (e as CustomEvent<{ message: string; kind: ToastKind }>).detail;
      const item = { id: ++id, message, kind };
      setItems((prev) => [...prev.slice(-3), item]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== item.id)), 4500);
    };
    window.addEventListener("admin-toast", onToast);
    return () => window.removeEventListener("admin-toast", onToast);
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
      {items.map((i) => (
        <div
          key={i.id}
          role={i.kind === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-lg border bg-surface px-4 py-3 shadow-lift ${
            i.kind === "error" ? "border-danger/30" : "border-success/30"
          }`}
        >
          {i.kind === "error" ? (
            <CircleX className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
          ) : (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          )}
          <p className="flex-1 text-sm text-ink">{i.message}</p>
          <button type="button" onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} className="text-muted hover:text-ink" aria-label={L("Yopish", "Закрыть")}>
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
