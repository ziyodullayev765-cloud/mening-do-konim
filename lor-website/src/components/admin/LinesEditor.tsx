"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

/**
 * Edit a newline-separated list as separate inputs with add / remove /
 * reorder. Submits as a single hidden field (one item per line).
 */
export function LinesEditor({
  name,
  label,
  hint,
  defaultValue,
  placeholder,
  addLabel = "Qo'shish",
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: string;
  placeholder?: string;
  addLabel?: string;
}) {
  const initial = defaultValue.split("\n").map((s) => s.trim()).filter(Boolean);
  const [items, setItems] = useState<{ id: number; value: string }[]>(
    (initial.length ? initial : [""]).map((value, i) => ({ id: i, value })),
  );
  const [nextId, setNextId] = useState(items.length);

  const update = (id: number, value: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, value } : x)));
  const remove = (id: number) => setItems((xs) => (xs.length > 1 ? xs.filter((x) => x.id !== id) : [{ id, value: "" }]));
  const move = (index: number, dir: -1 | 1) =>
    setItems((xs) => {
      const j = index + dir;
      if (j < 0 || j >= xs.length) return xs;
      const copy = [...xs];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });
  const add = () => {
    setItems((xs) => [...xs, { id: nextId, value: "" }]);
    setNextId((n) => n + 1);
  };

  return (
    <div>
      <p className="label">{label}</p>
      <input type="hidden" name={name} value={items.map((x) => x.value.trim()).filter(Boolean).join("\n")} />
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right text-sm text-muted tabular-nums">{i + 1}.</span>
            <input
              className="input"
              value={item.value}
              placeholder={placeholder}
              maxLength={120}
              onChange={(e) => update(item.id, e.target.value)}
              aria-label={`${label} ${i + 1}`}
            />
            <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Yuqoriga">
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Pastga">
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost btn-sm !px-2 text-danger" onClick={() => remove(item.id)} aria-label="O'chirish">
              <Trash2 className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ol>
      <button type="button" onClick={add} className="btn btn-secondary btn-sm mt-3">
        <Plus className="size-4" aria-hidden /> {addLabel}
      </button>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}
