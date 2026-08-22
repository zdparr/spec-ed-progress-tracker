"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createGoal, type ActionState } from "@/lib/actions";

const initialState: ActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add goal"}
    </button>
  );
}

export default function AddGoalForm({ studentId }: { studentId: string }) {
  const boundAction = createGoal.bind(null, studentId);
  const [state, formAction] = useFormState(boundAction, initialState);
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
      className="flex flex-col gap-3 rounded border border-border bg-surface p-4"
    >
      <label className="flex flex-col gap-1 text-sm text-ink-secondary">
        Goal title
        <input
          name="title"
          required
          placeholder="e.g. Read grade-level text with 80% comprehension"
          className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-secondary">
        Description (optional)
        <textarea
          name="description"
          rows={2}
          className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
        />
      </label>
      <div>
        <SubmitButton />
      </div>
      {state.error && <p className="text-sm text-status-critical">{state.error}</p>}
    </form>
  );
}
