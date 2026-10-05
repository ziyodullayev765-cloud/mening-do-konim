"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useFieldError } from "./ActionForm";
import { useI18n } from "@/components/site/I18nProvider";

const MAX_SIDE = 1800;
const ACCEPT = "image/jpeg,image/png,image/webp";

/** Downscales large photos in the browser so uploads stay small and fast. */
async function prepareImage(file: File, L: (uz: string, ru: string) => string): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(L("Faqat JPG, PNG yoki WEBP rasm tanlang.", "Выберите изображение JPG, PNG или WEBP."));
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error(L("Rasmni o'qib bo'lmadi.", "Не удалось прочитать изображение."));
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const keepPng = file.type === "image/png"; // logos often need transparency
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, keepPng ? "image/png" : "image/webp", 0.86),
  );
  if (!blob) throw new Error(L("Rasmni tayyorlab bo'lmadi.", "Не удалось подготовить изображение."));
  return blob;
}

/**
 * Image picker with upload, preview, replace and remove.
 * Uncontrolled (name + defaultValue, for server-action forms) or
 * controlled (value + onChange, for react-hook-form).
 */
export function ImageUpload({
  name,
  label,
  hint,
  defaultValue,
  value,
  onChange,
  error: errorProp,
  aspect = "aspect-[4/3]",
  fit = "cover",
}: {
  name?: string;
  label: string;
  hint?: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (url: string) => void;
  error?: string;
  aspect?: string;
  fit?: "cover" | "contain";
}) {
  const { L } = useI18n();
  const [inner, setInner] = useState(defaultValue ?? "");
  const url = value ?? inner;
  const setUrl = (u: string) => (onChange ? onChange(u) : setInner(u));
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const fieldError = useFieldError(name ?? "");
  const error = localError ?? errorProp ?? fieldError;

  async function upload(file: File) {
    setLocalError(null);
    setBusy(true);
    try {
      const blob = await prepareImage(file, L);
      const body = new FormData();
      body.append("file", blob, file.name);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error ?? L("Yuklashda xatolik.", "Ошибка загрузки."));
      setUrl(json.url);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : L("Yuklashda xatolik.", "Ошибка загрузки."));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <p id={`${id}-label`} className="label">{label}</p>
      {name && <input type="hidden" name={name} value={url} />}
      <input
        ref={fileRef}
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        aria-labelledby={`${id}-label`}
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${aspect} ${
          dragOver ? "border-accent bg-accent-soft" : error ? "border-danger/50 bg-danger-soft/40" : "border-line-strong bg-paper"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={`absolute inset-0 size-full ${fit === "contain" ? "object-contain p-4" : "object-cover"}`} />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-muted hover:text-accent"
          >
            <ImagePlus className="size-8" strokeWidth={1.5} aria-hidden />
            <span className="text-sm font-semibold">{L("Rasm yuklash", "Загрузить изображение")}</span>
            <span className="text-xs">{L("yoki shu yerga sudrab tashlang", "или перетащите сюда")}</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm" role="status">
            <LoaderCircle className="size-7 animate-spin text-accent" aria-label={L("Yuklanmoqda", "Загрузка")} />
          </div>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          {url ? <RefreshCw className="size-3.5" aria-hidden /> : <ImagePlus className="size-3.5" aria-hidden />}
          {url ? L("Almashtirish", "Заменить") : L("Tanlash", "Выбрать")}
        </button>
        {url && (
          <button type="button" className="btn btn-ghost btn-sm text-danger" disabled={busy} onClick={() => setUrl("")}>
            <Trash2 className="size-3.5" aria-hidden /> {L("Olib tashlash", "Удалить")}
          </button>
        )}
      </div>
      {error ? <p role="alert" className="mt-1.5 text-sm text-danger">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
