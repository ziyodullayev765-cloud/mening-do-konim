"use client";

import { useMemo, useState } from "react";
import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { useI18n } from "@/components/site/I18nProvider";
import { MAX_TEXT_LENGTH } from "@/lib/i18n/texts";
import { saveTexts } from "@/app/admin/actions/texts";
import { ActionForm, SubmitButton } from "./ActionForm";

type Lang = "uz" | "ru";
export type EditorField = { path: string; label: string; long: boolean; defaults: Record<Lang, string>; values: Record<Lang, string> };
export type EditorGroup = { id: string; title: string; fields: EditorField[] };

export function TextsEditor({ groups }: { groups: EditorGroup[] }) {
  const { L } = useI18n();
  const [values, setValues] = useState(() => {
    const out: Record<string, string> = {};
    for (const g of groups) for (const f of g.fields) for (const l of ["uz", "ru"] as const) out[`${l}|${f.path}`] = f.values[l];
    return out;
  });
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set([groups[0]?.id]));

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          fields: q
            ? g.fields.filter((f) =>
                [f.label, g.title, values[`uz|${f.path}`], values[`ru|${f.path}`]].some((s) => s?.toLowerCase().includes(q)),
              )
            : g.fields,
        }))
        .filter((g) => g.fields.length),
    [groups, q, values],
  );

  const changed = (f: EditorField, l: Lang) => (values[`${l}|${f.path}`] ?? "").trim() !== f.defaults[l];
  const changedIn = (g: EditorGroup) => g.fields.reduce((n, f) => n + (changed(f, "uz") ? 1 : 0) + (changed(f, "ru") ? 1 : 0), 0);
  const toggle = (id: string) =>
    setOpenIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ActionForm action={saveTexts} className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={L("Matn yoki bo'lim bo'yicha qidirish…", "Поиск по тексту или разделу…")}
          className="input pl-10"
        />
      </div>

      {groups.map((group) => {
        const shown = visible.find((g) => g.id === group.id);
        const isOpen = q ? Boolean(shown) : openIds.has(group.id);
        const count = changedIn(group);
        return (
          <section key={group.id} className={`card overflow-hidden ${q && !shown ? "hidden" : ""}`}>
            <button
              type="button"
              onClick={() => toggle(group.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-5 py-4 text-left sm:px-6"
            >
              <span className="flex-1 font-semibold text-ink">{group.title}</span>
              {count > 0 && (
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {L(`${count} ta o'zgartirilgan`, `изменено: ${count}`)}
                </span>
              )}
              <ChevronDown className={`size-5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {/* Fields stay in the DOM when collapsed so every text is submitted. */}
            <div className={`space-y-5 border-t border-line px-5 py-5 sm:px-6 ${isOpen ? "" : "hidden"}`}>
              {group.fields.map((f) => {
                const hidden = q && !shown?.fields.includes(f);
                return (
                  <div key={f.path} className={hidden ? "hidden" : ""}>
                    <p className="mb-2 text-sm font-semibold text-ink">{f.label}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(["uz", "ru"] as const).map((l) => {
                        const name = `${l}|${f.path}`;
                        const Field = f.long ? "textarea" : "input";
                        return (
                          <div key={l} className="relative">
                            <span className="pointer-events-none absolute top-2.5 left-3 rounded bg-paper-2 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-muted uppercase">
                              {l}
                            </span>
                            <Field
                              name={name}
                              value={values[name]}
                              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                              placeholder={f.defaults[l]}
                              maxLength={MAX_TEXT_LENGTH}
                              {...(f.long ? { rows: 3 } : {})}
                              className={`input pl-12 ${changed(f, l) ? "pr-10 !border-accent/60" : ""}`}
                              aria-label={`${f.label} (${l.toUpperCase()})`}
                            />
                            {changed(f, l) && (
                              <button
                                type="button"
                                onClick={() => setValues((v) => ({ ...v, [name]: f.defaults[l] }))}
                                title={L("Asl matnga qaytarish", "Вернуть исходный текст")}
                                aria-label={L("Asl matnga qaytarish", "Вернуть исходный текст")}
                                className="absolute top-2 right-2 grid size-7 place-items-center rounded-md text-muted hover:bg-accent-soft hover:text-accent"
                              >
                                <RotateCcw className="size-4" aria-hidden />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton className="btn btn-primary shadow-lg">{L("Matnlarni saqlash", "Сохранить тексты")}</SubmitButton>
      </div>
    </ActionForm>
  );
}
