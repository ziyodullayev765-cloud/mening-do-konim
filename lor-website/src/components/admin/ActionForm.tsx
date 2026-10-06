"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import type { ActionState } from "@/lib/action";
import { toast } from "./toast";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const ErrorsContext = createContext<Record<string, string[]> | undefined>(undefined);
const PendingContext = createContext(false);

export function useFieldError(name: string) {
  return useContext(ErrorsContext)?.[name]?.[0];
}

/**
 * Form wrapper for admin server actions: shows a toast for the result
 * and exposes field errors to nested <Field/> components.
 */
export function ActionForm({
  action,
  children,
  className,
  id,
  resetOnSuccess = false,
  onSuccess,
}: {
  action: Action;
  id?: string;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ts) return;
    if (state.message) toast(state.message, state.ok ? "success" : "error");
    if (state.ok) {
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ts]);

  return (
    <PendingContext.Provider value={pending}>
    <ErrorsContext.Provider value={state.ok ? undefined : state.errors}>
      <form
        ref={ref}
        id={id}
        className={className}
        noValidate
        // Submitting manually (instead of <form action>) keeps the user's input
        // when the server returns validation errors — React would reset it otherwise.
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter;
          const data = new FormData(e.currentTarget, submitter);
          startTransition(() => formAction(data));
        }}
      >
        {children}
      </form>
    </ErrorsContext.Provider>
    </PendingContext.Provider>
  );
}

export function SubmitButton({
  children,
  className = "btn btn-dark",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const pending = useContext(PendingContext);
  return (
    <button type="submit" className={className} disabled={pending || rest.disabled} {...rest}>
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
