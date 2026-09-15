import { TopicStat } from "../../types";

const MIN_ATTEMPTS = 2;

function List({ items, tone }: { items: TopicStat[]; tone: "good" | "bad" }) {
  if (items.length === 0) return <p className="text-sm text-muted">Not enough attempted questions yet.</p>;
  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div key={`${t.section}-${t.topic}`} className="flex items-center justify-between rounded-md border border-line bg-panel px-3.5 py-2.5">
          <div>
            <p className="text-sm font-medium text-ink">
              {t.section} &middot; {t.topic}
            </p>
            <p className="text-[11px] text-muted">
              {t.correct} of {t.attempts} correct
            </p>
          </div>
          <span className={["font-mono text-sm font-semibold tnum", tone === "good" ? "text-status-answered" : "text-status-notanswered"].join(" ")}>
            {t.accuracy_pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function StrengthWeaknessLists({ topicStats }: { topicStats: TopicStat[] }) {
  const eligible = topicStats.filter((t) => t.attempts >= MIN_ATTEMPTS);
  const strongest = [...eligible].sort((a, b) => b.accuracy_pct - a.accuracy_pct).slice(0, 3);
  const weakest = [...eligible].sort((a, b) => a.accuracy_pct - b.accuracy_pct).slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-status-answered">Strongest Areas</p>
        <List items={strongest} tone="good" />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-status-notanswered">Weakest Areas</p>
        <List items={weakest} tone="bad" />
      </div>
    </div>
  );
}
