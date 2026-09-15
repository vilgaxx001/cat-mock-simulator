import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendPoint } from "../../types";

interface TrendChartProps {
  points: TrendPoint[];
  color?: string;
  yLabel?: string;
  domain?: [number, number];
}

export function TrendChart({ points, color = "#3452C7", yLabel, domain }: TrendChartProps) {
  if (points.length === 0) {
    return <p className="text-sm text-muted">No data yet.</p>;
  }

  const data = points.map((p, i) => ({
    index: i + 1,
    value: p.value,
    label: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    mock_name: p.mock_name,
  }));

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 6, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E5EA" />
          <XAxis dataKey="label" fontSize={11} stroke="#5B6472" />
          <YAxis fontSize={11} stroke="#5B6472" domain={domain ?? ["auto", "auto"]} />
          <Tooltip
            formatter={(value: number) => [value, yLabel ?? "Value"]}
            labelFormatter={(_label, payload) => payload?.[0]?.payload?.mock_name ?? ""}
            contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#E2E5EA" }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
