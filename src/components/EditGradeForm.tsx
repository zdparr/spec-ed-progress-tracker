"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateStudentGrade, type ActionState } from "@/lib/actions";

const initialState: ActionState = { error: null };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-2 py-1 text-xs font-medium text-white disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function EditGradeForm({
  studentId,
  grade,
}: {
  studentId: string;
  grade: string;
}) {
  const boundAction = updateStudentGrade.bind(null, studentId);
  const [state, formAction] = useFormState(boundAction, initialState);
  const [editing, setEditing] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  useEffect(() => {
    if (submitCount > 0 && state.error === null) {
      setEditing(false);
    }
  }, [state, submitCount]);

  if (!editing) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-secondary">
        <span>Grade {grade}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-brand hover:underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setSubmitCount((c) => c + 1);
        formAction(formData);
      }}
      className="flex items-center gap-2"
    >
      <input
        name="grade"
        defaultValue={grade}
        required
        autoFocus
        className="w-20 rounded border border-border bg-surface px-2 py-1 text-sm text-ink-primary"
      />
      <SaveButton />
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-ink-muted hover:underline"
      >
        Cancel
      </button>
      {state.error && <p className="text-xs text-status-critical">{state.error}</p>}
    </form>
  );
}
