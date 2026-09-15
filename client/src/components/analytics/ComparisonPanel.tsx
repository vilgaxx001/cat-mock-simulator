import { ComparisonResult } from "../../types";

function DeltaBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value > 0;
  const negative = value < 0;
  return (
    <span
      className={[
        "font-mono text-xs font-medium tnum",
        positive ? "text-status-answered" : negative ? "text-status-notanswered" : "text-muted",
      ].join(" ")}
    >
      {positive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

export function ComparisonPanel({ comparison }: { comparison: ComparisonResult }) {
  if (!comparison.previous || !comparison.deltas) {
    return <p className="text-sm text-muted">This is your first completed attempt of this mock — nothing to compare against yet.</p>;
  }

  const { deltas, previous, current } = comparison;

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
      <p className="mb-3 text-xs text-muted">
        Compared with your attempt on {new Date(previous.completed_at).toLocaleDateString()} (scored {previous.overall_raw_score})
      </p>
      <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
        <div>
          <p className="text-[11px] text-muted">Score</p>
          <p className="font-mono text-sm font-semibold tnum text-ink">{current.overall_raw_score}</p>
          <DeltaBadge value={deltas.overall_raw_score} />
        </div>
        <div>
          <p className="text-[11px] text-muted">Accuracy</p>
          <p className="font-mono text-sm font-semibold tnum text-ink">{current.overall_accuracy_pct}%</p>
          <DeltaBadge value={deltas.overall_accuracy_pct} suffix="%" />
        </div>
        <div>
          <p className="text-[11px] text-muted">Attempts</p>
          <p className="font-mono text-sm font-semibold tnum text-ink">{current.overall_attempts}</p>
          <DeltaBadge value={deltas.overall_attempts} />
        </div>
        {(Object.keys(deltas.section_scores) as (keyof typeof deltas.section_scores)[]).map((section) => (
          <div key={section}>
            <p className="text-[11px] text-muted">{section}</p>
            <p className="font-mono text-sm font-semibold tnum text-ink">{current.section_scores[section] ?? 0}</p>
            <DeltaBadge value={deltas.section_scores[section] ?? 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
