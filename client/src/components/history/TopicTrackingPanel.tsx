import { Recommendation, TopicTrend } from "../../types";

function TopicRow({ t, tone }: { t: TopicTrend; tone: "weak" | "strong" }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-panel px-3.5 py-2.5">
      <div>
        <p className="text-sm font-medium text-ink">
          {t.section} &middot; {t.topic}
        </p>
        <p className="text-[11px] text-muted">
          {t.combined_attempts} attempts across last {t.mocks_seen} mock{t.mocks_seen > 1 ? "s" : ""} &middot; avg {Math.floor(t.avg_time_sec / 60)}m {t.avg_time_sec % 60}s
        </p>
      </div>
      <span className={["font-mono text-sm font-semibold tnum", tone === "weak" ? "text-status-notanswered" : "text-status-answered"].join(" ")}>
        {t.avg_accuracy_pct}%
      </span>
    </div>
  );
}

export function TopicTrackingPanel({ weak, strong }: { weak: TopicTrend[]; strong: TopicTrend[] }) {
  if (weak.length === 0 && strong.length === 0) {
    return <p className="text-sm text-muted">Attempt at least 3 questions in a topic, across your recent mocks, to see recurring patterns here.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-status-notanswered">Recurring Weaknesses</p>
        {weak.length === 0 ? <p className="text-sm text-muted">None detected — nice.</p> : <div className="space-y-2">{weak.map((t) => <TopicRow key={`${t.section}-${t.topic}`} t={t} tone="weak" />)}</div>}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-status-answered">Recurring Strengths</p>
        {strong.length === 0 ? <p className="text-sm text-muted">None detected yet.</p> : <div className="space-y-2">{strong.map((t) => <TopicRow key={`${t.section}-${t.topic}`} t={t} tone="strong" />)}</div>}
      </div>
    </div>
  );
}

export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return <p className="text-sm text-muted">No recurring weak topics detected yet — keep taking mocks to build a focus list.</p>;
  }
  return (
    <ol className="space-y-2">
      {recommendations.map((r) => (
        <li key={r.rank} className="flex items-start gap-3 rounded-md border border-line bg-panel p-3.5">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-white tnum">{r.rank}</span>
          <div>
            <p className="text-sm font-medium text-ink">
              {r.section} &middot; {r.topic}
            </p>
            <p className="text-xs text-muted">{r.reason}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
