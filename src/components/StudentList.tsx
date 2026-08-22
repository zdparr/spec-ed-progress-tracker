"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type StudentRow = {
  id: string;
  name: string;
  grade: string;
  goalCount: number;
  average: number | null;
};

export default function StudentList({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search students by name or grade…"
        aria-label="Search students"
        className="rounded border border-border bg-surface px-3 py-2 text-sm text-ink-primary"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-secondary">No students match “{query}”.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded border border-border bg-surface">
          {filtered.map((s) => (
            <li key={s.id}>
              <Link
                href={`/students/${s.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-plane"
              >
                <div>
                  <div className="text-sm font-medium text-ink-primary">{s.name}</div>
                  <div className="text-xs text-ink-muted">Grade {s.grade}</div>
                </div>
                <div className="text-sm text-ink-secondary">
                  {s.goalCount} goal{s.goalCount === 1 ? "" : "s"}
                  {s.average !== null ? ` · ${s.average}% avg` : ""}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
