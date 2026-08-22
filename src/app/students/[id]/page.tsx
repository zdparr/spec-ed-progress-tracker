import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddGoalForm from "@/components/AddGoalForm";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import StudentPdfReport from "@/components/StudentPdfReport";
import { deleteStudent, toggleGoalArchived } from "@/lib/actions";

export default async function StudentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const teacherId = session!.user.id;

  const student = await prisma.student.findFirst({
    where: { id: params.id, teacherId },
    include: {
      goals: {
        include: {
          entries: { orderBy: [{ recordedAt: "asc" }, { createdAt: "asc" }] },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) notFound();

  const activeGoals = student.goals.filter((g) => !g.archived);
  const archivedGoals = student.goals.filter((g) => g.archived);

  const pdfGoals = student.goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    archived: g.archived,
    currentPercent: g.entries.at(-1)?.percent ?? 0,
    chartData: g.entries.map((e) => ({
      date: e.recordedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      percent: e.percent,
      note: e.note,
    })),
    entriesDesc: [...g.entries].reverse().map((e) => ({
      id: e.id,
      percent: e.percent,
      note: e.note,
      dateLabel: e.recordedAt.toLocaleDateString(),
    })),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/dashboard" className="text-xs text-brand hover:underline">
          ← Dashboard
        </Link>
        <div className="mt-1 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">{student.name}</h1>
            <p className="text-sm text-ink-secondary">Grade {student.grade}</p>
          </div>
          <div className="flex items-center gap-2">
            <StudentPdfReport
              studentName={student.name}
              grade={student.grade}
              goals={pdfGoals}
            />
            <ConfirmDeleteButton
              action={deleteStudent.bind(null, student.id)}
              confirmMessage={`Delete ${student.name} and all of their goals? This cannot be undone.`}
              label="Delete student"
            />
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-ink-primary">Add a goal</h2>
        <AddGoalForm studentId={student.id} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink-primary">Active goals</h2>
        {activeGoals.length === 0 ? (
          <p className="text-sm text-ink-secondary">No active goals yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded border border-border bg-surface">
            {activeGoals.map((g) => {
              const percent = g.entries.at(-1)?.percent ?? 0;
              return (
                <li key={g.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <Link href={`/goals/${g.id}`} className="flex-1 hover:underline">
                    <div className="text-sm font-medium text-ink-primary">{g.title}</div>
                    {g.description && (
                      <div className="text-xs text-ink-muted">{g.description}</div>
                    )}
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-grid">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-10 text-right text-sm text-ink-secondary">{percent}%</span>
                    <form action={toggleGoalArchived.bind(null, g.id, true)}>
                      <button
                        type="submit"
                        className="rounded border border-border px-2 py-1 text-xs text-ink-secondary hover:bg-plane"
                      >
                        Archive
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {archivedGoals.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-ink-primary">Archived goals</h2>
          <ul className="flex flex-col divide-y divide-border rounded border border-border bg-surface opacity-75">
            {archivedGoals.map((g) => {
              const percent = g.entries.at(-1)?.percent ?? 0;
              return (
                <li key={g.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <Link href={`/goals/${g.id}`} className="flex-1 hover:underline">
                    <div className="text-sm font-medium text-ink-primary">{g.title}</div>
                  </Link>
                  <span className="text-sm text-ink-secondary">{percent}%</span>
                  <form action={toggleGoalArchived.bind(null, g.id, false)}>
                    <button
                      type="submit"
                      className="rounded border border-border px-2 py-1 text-xs text-ink-secondary hover:bg-plane"
                    >
                      Restore
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
