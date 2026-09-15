import { ConsistencyScore, ImprovementNote, PersonalBests, StreakInfo } from "../../types";

export function ConsistencyCard({ consistency }: { consistency: ConsistencyScore | null }) {
  if (!consistency) {
    return (
      <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Consistency</p>
        <p className="text-sm text-muted">Complete at least 2 mocks to see a consistency score.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Consistency</p>
      <p className="font-mono text-2xl font-semibold tnum text-ink">
        {consistency.score}
        <span className="text-sm font-normal text-muted"> / 10</span>
      </p>
      <div className="mt-2 space-y-1 text-xs text-muted">
        <div className="flex justify-between">
          <span>Score stability</span>
          <span className="font-mono tnum">{consistency.components.score_stability}</span>
        </div>
        <div className="flex justify-between">
          <span>Section balance</span>
          <span className="font-mono tnum">{consistency.components.section_balance}</span>
        </div>
        <div className="flex justify-between">
          <span>Accuracy stability</span>
          <span className="font-mono tnum">{consistency.components.accuracy_stability}</span>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted">Based on your last {consistency.mocks_considered} mocks.</p>
    </div>
  );
}

export function StreakCard({ streak }: { streak: StreakInfo }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Streak</p>
      <p className="font-mono text-2xl font-semibold tnum text-ink">
        {streak.weekly_streak_weeks}
        <span className="text-sm font-normal text-muted"> week{streak.weekly_streak_weeks === 1 ? "" : "s"}</span>
      </p>
      <div className="mt-2 space-y-1 text-xs text-muted">
        <div className="flex justify-between">
          <span>Mocks completed</span>
          <span className="font-mono tnum">{streak.mocks_completed}</span>
        </div>
        <div className="flex justify-between">
          <span>This week</span>
          <span className="font-mono tnum">{streak.current_week_count}</span>
        </div>
        <div className="flex justify-between">
          <span>This month</span>
          <span className="font-mono tnum">{streak.current_month_count}</span>
        </div>
      </div>
    </div>
  );
}

export function PersonalBestsGrid({ bests }: { bests: PersonalBests }) {
  const cards: { label: string; record: { value: number; mock_name: string } | null; suffix?: string }[] = [
    { label: "Best Raw Score", record: bests.best_raw_score },
    { label: "Best Est. Percentile", record: bests.best_percentile },
    { label: "Best Accuracy", record: bests.best_accuracy, suffix: "%" },
    ...(["VARC", "DILR", "QA"] as const).map((s) => ({ label: `Best ${s}`, record: bests.best_section[s] ?? null })),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-line bg-panel p-4 shadow-panel">
          <p className="text-xs text-muted">{c.label}</p>
          {c.record ? (
            <>
              <p className="mt-1 font-mono text-xl font-semibold tnum text-ink">
                {c.record.value}
                {c.suffix ?? ""}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted">{c.record.mock_name}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">—</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function ImprovementsPanel({ improvements }: { improvements: ImprovementNote[] }) {
  if (improvements.length === 0) {
    return <p className="text-sm text-muted">Complete at least 2 mocks to see improvement notes.</p>;
  }
  return (
    <div className="space-y-2.5">
      {improvements.map((note, i) => (
        <div key={i} className={["rounded-md border p-3.5", note.positive ? "border-status-answered/40 bg-status-answered/5" : "border-status-notanswered/40 bg-status-notanswered/5"].join(" ")}>
          <p className={["text-sm font-semibold", note.positive ? "text-status-answered" : "text-status-notanswered"].join(" ")}>{note.title}</p>
          <p className="mt-0.5 text-xs text-muted">{note.detail}</p>
        </div>
      ))}
    </div>
  );
}
