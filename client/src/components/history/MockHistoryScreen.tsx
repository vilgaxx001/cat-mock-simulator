import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { MockHistoryPayload } from "../../types";
import { HistoryTable } from "./HistoryTable";
import { TrendChart } from "./TrendChart";
import { ConsistencyCard, ImprovementsPanel, PersonalBestsGrid, StreakCard } from "./HistorySummaryPanels";
import { RecommendationsPanel, TopicTrackingPanel } from "./TopicTrackingPanel";
import { ErrorState } from "../ErrorState";
import { LoadingState } from "../LoadingState";

export function MockHistoryScreen({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<MockHistoryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getHistory()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading history…" />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? "Could not load history."} primaryLabel="Back to Mocks" onPrimary={onBack} />;
  }

  if (data.entries.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-muted">Mock History</p>
        <h1 className="mb-3 text-xl font-semibold text-ink">Nothing here yet</h1>
        <p className="mb-6 text-sm text-muted">Complete a mock to start building your progress history.</p>
        <button onClick={onBack} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark">
          Back to mocks
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-muted">Progress Intelligence</p>
          <h1 className="text-2xl font-semibold text-ink">Mock History</h1>
        </div>
        <button onClick={onBack} className="rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-canvas">
          Back to mocks
        </button>
      </div>

      {/* Personal bests */}
      <SectionHeading title="Personal Bests" />
      <div className="mb-8">
        <PersonalBestsGrid bests={data.personal_bests} />
      </div>

      {/* Consistency + Streak */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ConsistencyCard consistency={data.consistency} />
        <StreakCard streak={data.streak} />
      </div>

      {/* Improvements */}
      <SectionHeading title="Latest vs Previous" />
      <div className="mb-8">
        <ImprovementsPanel improvements={data.improvements} />
      </div>

      {/* Trends */}
      <SectionHeading title="Score & Percentile Trend" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Raw Score</p>
          <TrendChart points={data.trends.raw_score} color="#3452C7" yLabel="Score" />
        </div>
        <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Estimated Percentile</p>
          <TrendChart points={data.trends.percentile} color="#1F8A70" yLabel="Percentile" domain={[0, 100]} />
        </div>
      </div>

      {(["VARC", "DILR", "QA"] as const).some((s) => data.trends.section[s]) && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["VARC", "DILR", "QA"] as const).map(
            (s) =>
              data.trends.section[s] && (
                <div key={s} className="rounded-lg border border-line bg-panel p-4 shadow-panel">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{s} Score Trend</p>
                  <TrendChart points={data.trends.section[s]!} color="#7C4FE0" yLabel="Score" />
                </div>
              )
          )}
        </div>
      )}

      {/* Time management */}
      <SectionHeading title="Time Management Trend" />
      <div className="mb-8">
        <div className="mb-3 rounded-md border border-line bg-canvas px-4 py-2.5 text-sm text-ink">{data.time_management.detail}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Avg Time / Question (sec)</p>
            <TrendChart points={data.trends.avg_time_per_question} color="#D97706" yLabel="Seconds" />
          </div>
          <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Minutes Wasted on Unattempted</p>
            <TrendChart points={data.time_management.wasted_time_trend} color="#D8503B" yLabel="Minutes" />
          </div>
        </div>
      </div>

      {/* Topic tracking */}
      <SectionHeading title="Recurring Topics (Last 5 Mocks)" />
      <div className="mb-8">
        <TopicTrackingPanel weak={data.weak_topics} strong={data.strong_topics} />
      </div>

      {/* Recommendations */}
      <SectionHeading title="Next Mock Focus" />
      <div className="mb-8">
        <RecommendationsPanel recommendations={data.recommendations} />
      </div>

      {/* Full table */}
      <SectionHeading title="All Attempts" />
      <HistoryTable entries={data.entries} />
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>;
}
