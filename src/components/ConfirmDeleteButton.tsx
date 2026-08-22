"use client";

import { useTransition } from "react";

export default function ConfirmDeleteButton({
  action,
  confirmMessage,
  label = "Delete",
  className,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(() => {
            action();
          });
        }
      }}
      className={
        className ??
        "rounded border border-status-critical/40 px-3 py-1 text-xs text-status-critical hover:bg-status-critical/10 disabled:opacity-60"
      }
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
