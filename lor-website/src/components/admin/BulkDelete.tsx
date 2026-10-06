"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useI18n } from "@/components/site/I18nProvider";
import type { ActionState } from "@/lib/action";
import { ActionForm } from "./ActionForm";
import { ConfirmButton } from "./ConfirmButton";

export const BULK_FORM = "bulk-delete";
const boxes = () => Array.from(document.querySelectorAll<HTMLInputElement>(`input[type=checkbox][form="${BULK_FORM}"]`));

/** "Select all" checkbox for the table header. */
export function SelectAll({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const sync = () => {
      const all = boxes();
      setChecked(all.length > 0 && all.every((b) => b.checked));
    };
    document.addEventListener("change", sync);
    return () => document.removeEventListener("change", sync);
  }, []);
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(e) => {
        for (const b of boxes()) b.checked = e.target.checked;
        setChecked(e.target.checked);
        document.dispatchEvent(new Event("bulk-change"));
      }}
      className="size-4 accent-[var(--color-accent)]"
    />
  );
}

/** Bar that appears when rows are ticked; deletes them after confirmation. */
export function BulkDeleteBar({
  action,
  what = "appointments",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  what?: "appointments" | "messages";
}) {
  const { L } = useI18n();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(boxes().filter((b) => b.checked).length);
    sync();
    document.addEventListener("change", sync);
    document.addEventListener("bulk-change", sync);
    return () => {
      document.removeEventListener("change", sync);
      document.removeEventListener("bulk-change", sync);
    };
  }, []);

  return (
    <div className={count ? "sticky bottom-4 z-10 mt-4 flex justify-center" : "hidden"}>
      <div className="flex items-center gap-4 rounded-full border border-line bg-surface px-5 py-2.5 shadow-lift">
        <span className="text-sm font-semibold text-ink tabular-nums">{L(`${count} ta tanlandi`, `Выбрано: ${count}`)}</span>
        {/* The row checkboxes join this form through their form="bulk-delete" attribute. */}
        <ActionForm id={BULK_FORM} action={action} onSuccess={() => setCount(0)}>
          <ConfirmButton
            message={
              what === "messages"
                ? L(`Tanlangan ${count} ta xabar butunlay o'chiriladi.`, `Выбранные сообщения (${count}) будут удалены навсегда.`)
                : L(
                    `Tanlangan ${count} ta qabul butunlay o'chiriladi. Buni qaytarib bo'lmaydi.`,
                    `Выбранные записи (${count}) будут удалены навсегда. Это нельзя отменить.`,
                  )
            }
            confirmLabel={L("O'chirish", "Удалить")}
            className="btn btn-danger btn-sm"
          >
            <Trash2 className="size-4" aria-hidden /> {L("O'chirish", "Удалить")}
          </ConfirmButton>
        </ActionForm>
      </div>
    </div>
  );
}
