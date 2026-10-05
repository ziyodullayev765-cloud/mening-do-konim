export type ToastKind = "success" | "error";

export function toast(message: string, kind: ToastKind = "success") {
  window.dispatchEvent(new CustomEvent("admin-toast", { detail: { message, kind } }));
}
