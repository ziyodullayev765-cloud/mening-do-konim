"use client";

import { startTransition, useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import type { ActionState } from "@/lib/action";
import { login } from "../actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {});
  const [show, setShow] = useState(false);
  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={(e) => {
        // Manual submit keeps the typed email after a failed attempt.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      {state.ok === false && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{state.message}</p>
      )}
      <div>
        <label htmlFor="email" className="label">{t.admin.login.email}</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" autoFocus />
      </div>
      <div>
        <label htmlFor="password" className="label">{t.admin.login.password}</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="input pr-11" />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-ink"
            aria-label={show ? t.admin.login.hidePassword : t.admin.login.showPassword}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <label className="flex items-center gap-2.5 text-sm text-text">
        <input type="checkbox" name="remember" className="size-4 accent-[var(--color-accent)]" />
        {t.admin.login.remember}
      </label>
      <button type="submit" className="btn btn-dark w-full" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {t.admin.login.submit}
      </button>
    </form>
  );
}
