"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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

type StudentAverage = { name: string; average: number | null };
type DistributionBucket = { percent: number; count: number };

function ChartTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  suffix: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded border px-2 py-1 text-xs shadow-sm"
      style={{ background: SURFACE_COLOR, borderColor: BORDER_COLOR, color: "var(--text-primary)" }}
    >
      <div className="font-medium">{label}</div>
      <div style={{ color: "var(--text-secondary)" }}>
        {payload[0].value}
        {suffix}
      </div>
    </div>
  );
}

export function StudentAverageChart({ data }: { data: StudentAverage[] }) {
  const chartData = data.map((d) => ({ name: d.name, average: d.average ?? 0 }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="0" />
        <XAxis
          dataKey="name"
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<ChartTooltip suffix="% average" />} cursor={{ fill: GRID_COLOR }} />
        <Bar dataKey="average" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompletionDistributionChart({ data }: { data: DistributionBucket[] }) {
  const chartData = data.map((d) => ({ name: `${d.percent}%`, count: d.count }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="0" />
        <XAxis
          dataKey="name"
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<ChartTooltip suffix=" goals" />} cursor={{ fill: GRID_COLOR }} />
        <Bar dataKey="count" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
