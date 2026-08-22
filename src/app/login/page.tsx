"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-xl font-semibold text-ink-primary">Sign in</h1>
      {justRegistered && (
        <p className="mt-3 rounded border border-status-good/30 bg-status-good/10 px-3 py-2 text-sm text-status-good">
          Account created. Sign in below.
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded border border-border bg-surface px-3 py-2 text-ink-primary"
          />
        </label>
        {error && <p className="text-sm text-status-critical">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-secondary">
        Need an account?{" "}
        <Link href="/register" className="text-brand underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
