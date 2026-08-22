"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES_COLOR = "var(--series-1)";
const GRID_COLOR = "var(--gridline)";
const AXIS_COLOR = "var(--text-muted)";
const SURFACE_COLOR = "var(--surface-1)";
const BORDER_COLOR = "var(--border-hairline)";

type Point = { date: string; percent: number; note: string | null };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div
      className="rounded border px-2 py-1 text-xs shadow-sm"
      style={{ background: SURFACE_COLOR, borderColor: BORDER_COLOR, color: "var(--text-primary)" }}
    >
      <div className="font-medium">{point.date}</div>
      <div style={{ color: "var(--text-secondary)" }}>{point.percent}% complete</div>
      {point.note && <div style={{ color: "var(--text-muted)" }}>{point.note}</div>}
    </div>
  );
}

export default function GoalProgressChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-ink-muted">
        No progress entries yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="0" />
        <XAxis
          dataKey="date"
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="stepAfter"
          dataKey="percent"
          stroke={SERIES_COLOR}
          strokeWidth={2}
          strokeLinecap="round"
          dot={{ r: 5, fill: SERIES_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
