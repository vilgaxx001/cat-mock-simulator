import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TopicStat } from "../../types";

const COLORS = { good: "#3F9142", mid: "#D97706", bad: "#D8503B" };

function colorFor(accuracy: number): string {
  if (accuracy >= 70) return COLORS.good;
  if (accuracy >= 40) return COLORS.mid;
  return COLORS.bad;
}

export function TopicAccuracyChart({ topics }: { topics: TopicStat[] }) {
  const data = topics
    .filter((t) => t.attempts > 0)
    .map((t) => ({ name: `${t.section} · ${t.topic}`, accuracy: t.accuracy_pct, attempts: t.attempts }));

  if (data.length === 0) {
    return <p className="text-sm text-muted">No attempted questions to chart yet.</p>;
  }

  return (
    <div style={{ width: "100%", height: Math.max(160, data.length * 40) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E5EA" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} stroke="#5B6472" />
          <YAxis type="category" dataKey="name" width={150} fontSize={11} stroke="#5B6472" />
          <Tooltip
            formatter={(value: number, key: string) => (key === "accuracy" ? [`${value}%`, "Accuracy"] : [value, "Attempts"])}
            contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#E2E5EA" }}
          />
          <Bar dataKey="accuracy" radius={[0, 3, 3, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.accuracy)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
