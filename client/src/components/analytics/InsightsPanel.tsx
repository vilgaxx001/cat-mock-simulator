import { Insight } from "../../types";

const TYPE_STYLES: Record<Insight["type"], { badge: string; label: string }> = {
  strength: { badge: "bg-status-answered/15 text-status-answered", label: "Strength" },
  weakness: { badge: "bg-status-notanswered/15 text-status-notanswered", label: "Weakness" },
  time_leak: { badge: "bg-warn/15 text-warn", label: "Time Leak" },
  limiting_section: { badge: "bg-status-review/15 text-status-review", label: "Limiting Section" },
  recommendation: { badge: "bg-accent-light text-accent-dark", label: "Recommendation" },
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return <p className="text-sm text-muted">Not enough data in this attempt yet to generate insights — try answering more questions next time.</p>;
  }

  return (
    <div className="space-y-2.5">
      {insights.map((insight, i) => {
        const style = TYPE_STYLES[insight.type];
        return (
          <div key={i} className="rounded-md border border-line bg-panel p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <span className={["rounded px-2 py-0.5 text-[11px] font-medium", style.badge].join(" ")}>{style.label}</span>
              <span className="text-sm font-semibold text-ink">{insight.title}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted">{insight.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
