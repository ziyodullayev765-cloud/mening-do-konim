"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/components/site/I18nProvider";

/**
 * Accessible modal built on native <dialog>: focus trap, Esc handling and
 * inert background come from the browser. Closing is always routed through
 * `onRequestClose` so callers can guard unsaved changes.
 */
export function Modal({
  open,
  onRequestClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onRequestClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const width = { sm: "max-w-lg", md: "max-w-2xl", lg: "max-w-4xl" }[size];

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault(); // Esc -> let the caller decide
        onRequestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onRequestClose(); // backdrop click
      }}
      className={`m-auto w-[calc(100%-1.5rem)] ${width} max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-left text-text shadow-lift backdrop:bg-ink/45 backdrop:backdrop-blur-[2px] open:flex open:animate-fade-up open:flex-col`}
    >
      {open && (
        <>
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div>
              <h2 id={titleId} className="font-serif text-2xl text-ink">{title}</h2>
              {description && <p id={descId} className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button type="button" onClick={onRequestClose} className="btn btn-ghost btn-sm -mr-2 !px-2" aria-label={t.common.close}>
              <X className="size-5" aria-hidden />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <footer className="shrink-0 border-t border-line bg-paper-2/40 px-5 py-4 sm:px-6">{footer}</footer>}
        </>
      )}
    </dialog>
  );
}
