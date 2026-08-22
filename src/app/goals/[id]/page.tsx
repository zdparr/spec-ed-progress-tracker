import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GoalProgressChart from "@/components/GoalProgressChart";
import AddProgressEntryForm from "@/components/AddProgressEntryForm";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { deleteGoal, deleteProgressEntry } from "@/lib/actions";

export default async function GoalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const teacherId = session!.user.id;

  const goal = await prisma.goal.findFirst({
    where: { id: params.id, student: { teacherId } },
    include: {
      student: true,
      entries: { orderBy: [{ recordedAt: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!goal) notFound();

  const chartData = goal.entries.map((e) => ({
    date: e.recordedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    percent: e.percent,
    note: e.note,
  }));

  const currentPercent = goal.entries.at(-1)?.percent ?? 0;
  const entriesDesc = [...goal.entries].reverse();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href={`/students/${goal.student.id}`} className="text-xs text-brand hover:underline">
          ← {goal.student.name}
        </Link>
        <div className="mt-1 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">{goal.title}</h1>
            {goal.description && (
              <p className="mt-1 max-w-xl text-sm text-ink-secondary">{goal.description}</p>
            )}
          </div>
          <ConfirmDeleteButton
            action={deleteGoal.bind(null, goal.id)}
            confirmMessage="Delete this goal and all of its progress history? This cannot be undone."
            label="Delete goal"
          />
        </div>
        <div className="mt-2 text-sm text-ink-secondary">
          Current progress: <span className="font-medium text-ink-primary">{currentPercent}%</span>
        </div>
      </div>

      <section className="rounded border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-ink-primary">Progress over time</h2>
        <GoalProgressChart data={chartData} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-ink-primary">Log a new entry</h2>
        <AddProgressEntryForm goalId={goal.id} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink-primary">History</h2>
        {entriesDesc.length === 0 ? (
          <p className="text-sm text-ink-secondary">No entries logged yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded border border-border bg-surface">
            {entriesDesc.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-ink-primary">{e.percent}%</div>
                  <div className="text-xs text-ink-muted">
                    {e.recordedAt.toLocaleDateString()}
                    {e.note ? ` · ${e.note}` : ""}
                  </div>
                </div>
                <ConfirmDeleteButton
                  action={deleteProgressEntry.bind(null, e.id)}
                  confirmMessage="Delete this progress entry?"
                  label="Delete"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
