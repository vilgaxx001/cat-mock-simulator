import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionName } from "../../types";

export function TimeBySectionChart({ timeBySection }: { timeBySection: Partial<Record<SectionName, number>> }) {
  const data = (Object.entries(timeBySection) as [SectionName, number][]).map(([section, sec]) => ({
    section,
    minutes: Math.round((sec / 60) * 10) / 10,
  }));

  if (data.length === 0) return <p className="text-sm text-muted">No time data yet.</p>;

  return (
    <div style={{ width: "100%", height: 160 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E5EA" />
          <XAxis dataKey="section" fontSize={12} stroke="#5B6472" />
          <YAxis fontSize={11} stroke="#5B6472" tickFormatter={(v) => `${v}m`} />
          <Tooltip formatter={(value: number) => [`${value} min`, "Time spent"]} contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#E2E5EA" }} />
          <Bar dataKey="minutes" fill="#3452C7" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
