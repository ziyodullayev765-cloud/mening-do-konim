"use client";

import { useRef } from "react";
import { t } from "@/lib/i18n";

/** Submit button that asks for confirmation in a modal before submitting its form. */
export function ConfirmButton({
  children,
  message,
  className = "btn btn-secondary btn-sm",
  confirmLabel = t.common.confirm,
  danger = true,
  name,
  value,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  confirmLabel?: string;
  danger?: boolean;
  name?: string;
  value?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hiddenRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button" ref={triggerRef} className={className} onClick={() => dialogRef.current?.showModal()}>
        {children}
      </button>
      {/* Hidden real submit button so name/value are included in the form data. */}
      <button type="submit" ref={hiddenRef} name={name} value={value} hidden tabIndex={-1} aria-hidden />
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface p-0 text-left shadow-lift backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="p-6">
          <p className="text-[15px] leading-relaxed text-ink">{message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => dialogRef.current?.close()}>
              {t.common.cancel}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${danger ? "btn-danger" : "btn-dark"}`}
              onClick={() => {
                dialogRef.current?.close();
                const btn = hiddenRef.current;
                btn?.form?.requestSubmit(btn);
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
