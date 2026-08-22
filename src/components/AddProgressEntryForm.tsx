"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addProgressEntry, type ActionState } from "@/lib/actions";

const initialState: ActionState = { error: null };
const PERCENT_OPTIONS = Array.from({ length: 11 }, (_, i) => i * 10);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Saving…" : "Log progress"}
    </button>
  );
}

export default function AddProgressEntryForm({ goalId }: { goalId: string }) {
  const boundAction = addProgressEntry.bind(null, goalId);
  const [state, formAction] = useFormState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

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
        Percent complete
        <select
          name="percent"
          required
          defaultValue={0}
          className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
        >
          {PERCENT_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}%
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-secondary">
        Date
        <input
          name="recordedAt"
          type="date"
          defaultValue={today}
          className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
        />
      </label>
      <label className="flex flex-1 min-w-[180px] flex-col gap-1 text-sm text-ink-secondary">
        Note (optional)
        <input
          name="note"
          placeholder="Observation, context, etc."
          className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
        />
      </label>
      <SubmitButton />
      {state.error && <p className="w-full text-sm text-status-critical">{state.error}</p>}
    </form>
  );
}
