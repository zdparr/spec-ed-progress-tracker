"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-border bg-surface print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-sm font-semibold text-ink-primary">
          Spec Ed Progress Tracker
        </Link>
        {status === "authenticated" && session?.user && (
          <div className="flex items-center gap-4 text-sm text-ink-secondary">
            <span>{session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded border border-border px-3 py-1 text-ink-primary hover:bg-plane"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
