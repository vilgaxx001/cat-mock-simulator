import { useState } from "react";
import { MockHistoryEntry } from "../../types";

type SortKey = "newest" | "score" | "percentile";

export function HistoryTable({ entries }: { entries: MockHistoryEntry[] }) {
  const [sort, setSort] = useState<SortKey>("newest");

  const sorted = [...entries].sort((a, b) => {
    if (sort === "score") return b.raw_score - a.raw_score;
    if (sort === "percentile") return b.estimated_percentile - a.estimated_percentile;
    return b.completed_at.localeCompare(a.completed_at);
  });

  return (
    <div className="rounded-lg border border-line bg-panel shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
        <h2 className="text-sm font-semibold text-ink">All Attempts ({entries.length})</h2>
        <div className="flex gap-1.5">
          {([
            ["newest", "Newest"],
            ["score", "Highest Score"],
            ["percentile", "Highest Percentile"],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={[
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                sort === key ? "bg-accent text-white" : "bg-canvas text-muted hover:bg-line",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Mock</th>
              <th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Est. %ile</th>
              <th className="px-3 py-2 font-medium">VARC</th>
              <th className="px-3 py-2 font-medium">DILR</th>
              <th className="px-3 py-2 font-medium">QA</th>
              <th className="px-3 py-2 font-medium">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.attempt_id} className="border-b border-line last:border-0">
                <td className="px-5 py-2.5 text-ink">{new Date(e.completed_at).toLocaleDateString()}</td>
                <td className="px-3 py-2.5 text-ink">{e.mock_name}</td>
                <td className="px-3 py-2.5 font-mono tnum font-medium text-ink">
                  {e.raw_score}
                  <span className="text-muted"> / {e.max_possible_score}</span>
                </td>
                <td className="px-3 py-2.5 font-mono tnum text-ink">{e.estimated_percentile}</td>
                <td className="px-3 py-2.5 font-mono tnum text-muted">{e.section_scores.VARC ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono tnum text-muted">{e.section_scores.DILR ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono tnum text-muted">{e.section_scores.QA ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono tnum text-ink">{e.accuracy_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
