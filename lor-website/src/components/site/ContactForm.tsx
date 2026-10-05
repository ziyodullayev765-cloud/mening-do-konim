"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { t } from "@/lib/i18n";
import type { ActionState } from "@/lib/action";
import { sendContactMessage } from "@/app/(site)/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(sendContactMessage, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const err = (name: string) => state.errors?.[name]?.[0];

  return (
    <form
      ref={formRef}
      className="card p-6 sm:p-8"
      noValidate
      onSubmit={(e) => {
        // Manual submit so typed values survive server-side validation errors.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <h3 className="font-serif text-2xl text-ink">{t.contact.formTitle}</h3>
      <p className="mt-2 text-[15px] text-muted">{t.contact.formLead}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">{t.contact.name}</label>
          <input id="c-name" name="name" className="input" autoComplete="name" required aria-invalid={!!err("name")} aria-describedby="c-name-err" />
          {err("name") && <p id="c-name-err" className="mt-1.5 text-sm text-danger">{err("name")}</p>}
        </div>
        <div>
          <label htmlFor="c-phone" className="label">{t.booking.phone}</label>
          <input id="c-phone" name="phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="+998 90 123 45 67" required aria-invalid={!!err("phone")} aria-describedby="c-phone-err" />
          {err("phone") && <p id="c-phone-err" className="mt-1.5 text-sm text-danger">{err("phone")}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-email" className="label">
            {t.booking.email} <span className="font-normal text-muted">({t.common.optional})</span>
          </label>
          <input id="c-email" name="email" type="email" className="input" autoComplete="email" aria-invalid={!!err("email")} aria-describedby="c-email-err" />
          {err("email") && <p id="c-email-err" className="mt-1.5 text-sm text-danger">{err("email")}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-message" className="label">{t.contact.message}</label>
          <textarea id="c-message" name="message" rows={4} className="input" required aria-invalid={!!err("message")} aria-describedby="c-message-err" />
          {err("message") && <p id="c-message-err" className="mt-1.5 text-sm text-danger">{err("message")}</p>}
        </div>
      </div>

      {/* Honeypot for bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="text-sm">
          {state.ok && (
            <p className="flex items-center gap-2 text-success">
              <CheckCircle2 className="size-4" aria-hidden /> {state.message}
            </p>
          )}
          {state.ok === false && !state.errors && <p className="text-danger">{state.message}</p>}
        </div>
        <button type="submit" className="btn btn-dark" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {t.contact.send}
        </button>
      </div>
    </form>
  );
}
