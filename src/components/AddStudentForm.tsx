"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createStudent, type ActionState } from "@/lib/actions";

const initialState: ActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add student"}
    </button>
  );
}

export default function AddStudentForm() {
  const [state, formAction] = useFormState(createStudent, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitCount, setSubmitCount] = useState(0);

  useEffect(() => {
    if (submitCount > 0 && state.error === null) {
      formRef.current?.reset();
    }
  }, [state, submitCount]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setSubmitCount((c) => c + 1);
        formAction(formData);
      }}
      className="flex flex-wrap items-end gap-3 rounded border border-border bg-surface p-4"
    >
      <label className="flex flex-col gap-1 text-sm text-ink-secondary">
        Student name
        <input
          name="name"
          required
          className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-secondary">
        Grade
        <input
          name="grade"
          required
          placeholder="e.g. 4th"
          className="w-28 rounded border border-border bg-surface px-3 py-2 text-ink-primary"
        />
      </label>
      <SubmitButton />
      {state.error && <p className="text-sm text-status-critical">{state.error}</p>}
    </form>
  );
}
