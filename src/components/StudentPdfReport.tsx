"use client";

import { useRef, useState } from "react";
import GoalProgressChart from "@/components/GoalProgressChart";

type PdfGoal = {
  id: string;
  title: string;
  description: string | null;
  archived: boolean;
  currentPercent: number;
  chartData: { date: string; percent: number; note: string | null }[];
  entriesDesc: { id: string; percent: number; note: string | null; dateLabel: string }[];
};

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "student";
}

function GoalBlock({ goal }: { goal: PdfGoal }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-ink-primary">
          {goal.title}
          {goal.archived && (
            <span className="ml-2 text-xs font-normal text-ink-muted">(archived)</span>
          )}
        </h2>
        {goal.description && <p className="text-sm text-ink-secondary">{goal.description}</p>}
        <p className="mt-1 text-sm text-ink-secondary">
          Current progress:{" "}
          <span className="font-medium text-ink-primary">{goal.currentPercent}%</span>
        </p>
      </div>

      <GoalProgressChart data={goal.chartData} />

      {goal.entriesDesc.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-ink-muted">
              <th className="py-1 pr-4 font-medium">Date</th>
              <th className="py-1 pr-4 font-medium">Percent</th>
              <th className="py-1 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {goal.entriesDesc.map((e) => (
              <tr key={e.id} className="border-b border-border">
                <td className="py-1 pr-4 text-ink-secondary">{e.dateLabel}</td>
                <td className="py-1 pr-4 text-ink-primary">{e.percent}%</td>
                <td className="py-1 text-ink-secondary">{e.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function StudentPdfReport({
  studentName,
  grade,
  goals,
}: {
  studentName: string;
  grade: string;
  goals: PdfGoal[];
}) {
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pageCount = Math.max(1, goals.length);

  async function handleDownload() {
    setStatus("generating");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 36;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const pages = pageRefs.current.filter((el): el is HTMLDivElement => el !== null);

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/jpeg", 0.85);

        let renderWidth = availableWidth;
        let renderHeight = (canvas.height * availableWidth) / canvas.width;
        if (renderHeight > availableHeight) {
          const scale = availableHeight / renderHeight;
          renderHeight = availableHeight;
          renderWidth = availableWidth * scale;
        }

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, margin, renderWidth, renderHeight);
      }

      pdf.save(`${slugify(studentName)}-progress-report.pdf`);
      setStatus("idle");
    } catch (err) {
      console.error("Failed to generate PDF", err);
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={status === "generating"}
        className="rounded border border-border px-3 py-1 text-xs text-ink-secondary hover:bg-plane disabled:opacity-60"
      >
        {status === "generating" ? "Preparing PDF…" : "Download PDF report"}
      </button>
      {status === "error" && (
        <p className="text-xs text-status-critical">
          Something went wrong generating the PDF. Please try again.
        </p>
      )}

      {/* Off-screen report content used only to render the PDF pages. */}
      <div
        aria-hidden
        data-theme="light"
        style={{ position: "fixed", top: 0, left: "-10000px", width: "760px", zIndex: -1 }}
      >
        {Array.from({ length: pageCount }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              pageRefs.current[i] = el;
            }}
            className="flex flex-col gap-6 bg-surface p-8"
          >
            {i === 0 && (
              <div>
                <h1 className="text-xl font-semibold text-ink-primary">
                  {studentName} — Progress Report
                </h1>
                <p className="text-sm text-ink-secondary">
                  Grade {grade} · Printed{" "}
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            {goals.length === 0 ? (
              <p className="text-sm text-ink-secondary">No goals recorded yet.</p>
            ) : (
              <GoalBlock goal={goals[i]} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
