"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { registerTeacher, type ActionState } from "@/lib/actions";

const initialState: ActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerTeacher, initialState);

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-xl font-semibold text-ink-primary">Create a teacher account</h1>
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-secondary">
          Name
          <input
            name="name"
            type="text"
            required
            className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-secondary">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-secondary">
          Password (min. 8 characters)
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
          />
        </label>
        {state.error && <p className="text-sm text-status-critical">{state.error}</p>}
        <SubmitButton />
      </form>
      <p className="mt-4 text-sm text-ink-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
