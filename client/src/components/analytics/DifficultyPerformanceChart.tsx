import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DifficultyPerformanceStat } from "../../types";

export function DifficultyPerformanceChart({ stats }: { stats: DifficultyPerformanceStat[] }) {
  const data = stats.filter((s) => s.attempts > 0).map((s) => ({ difficulty: s.difficulty, accuracy: s.accuracy_pct, attempts: s.attempts }));

  if (data.length === 0) return <p className="text-sm text-muted">No attempted questions to chart yet.</p>;

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E5EA" />
          <XAxis dataKey="difficulty" fontSize={10} stroke="#5B6472" interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis domain={[0, 100]} fontSize={11} stroke="#5B6472" tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(value: number, key: string) => (key === "accuracy" ? [`${value}%`, "Accuracy"] : [value, "Attempts"])}
            contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#E2E5EA" }}
          />
          <Bar dataKey="accuracy" fill="#7C4FE0" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
