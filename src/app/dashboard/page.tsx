import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddStudentForm from "@/components/AddStudentForm";
import { StudentAverageChart, CompletionDistributionChart } from "@/components/OverallProgressCharts";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const teacherId = session!.user.id;

  const students = await prisma.student.findMany({
    where: { teacherId },
    include: {
      goals: {
        where: { archived: false },
        include: {
          entries: { orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }], take: 1 },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const latestPercent = (goal: (typeof students)[number]["goals"][number]) =>
    goal.entries[0]?.percent ?? 0;

  const allGoals = students.flatMap((s) => s.goals);
  const overallAverage =
    allGoals.length > 0
      ? Math.round(allGoals.reduce((sum, g) => sum + latestPercent(g), 0) / allGoals.length)
      : null;

  const perStudentAverages = students.map((s) => ({
    name: s.name,
    average:
      s.goals.length > 0
        ? Math.round(s.goals.reduce((sum, g) => sum + latestPercent(g), 0) / s.goals.length)
        : null,
  }));

  const distribution = Array.from({ length: 11 }, (_, i) => i * 10).map((percent) => ({
    percent,
    count: allGoals.filter((g) => latestPercent(g) === percent).length,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Dashboard</h1>
        <p className="text-sm text-ink-secondary">
          Overview of every active goal across your students.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Students</div>
          <div className="mt-1 text-2xl font-semibold text-ink-primary">{students.length}</div>
        </div>
        <div className="rounded border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Active goals</div>
          <div className="mt-1 text-2xl font-semibold text-ink-primary">{allGoals.length}</div>
        </div>
        <div className="rounded border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">
            Overall completion
          </div>
          <div className="mt-1 text-2xl font-semibold text-ink-primary">
            {overallAverage === null ? "—" : `${overallAverage}%`}
          </div>
        </div>
      </section>

      {allGoals.length > 0 && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-ink-primary">
              Average goal completion by student
            </h2>
            <StudentAverageChart data={perStudentAverages} />
          </div>
          <div className="rounded border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-ink-primary">Goals by completion level</h2>
            <CompletionDistributionChart data={distribution} />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-ink-primary">Students</h2>
        <AddStudentForm />

        {students.length === 0 ? (
          <p className="text-sm text-ink-secondary">No students yet. Add one above to get started.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded border border-border bg-surface">
            {students.map((s) => {
              const avg = perStudentAverages.find((p) => p.name === s.name)?.average;
              return (
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
                      {s.goals.length} goal{s.goals.length === 1 ? "" : "s"}
                      {avg !== null && avg !== undefined ? ` · ${avg}% avg` : ""}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
