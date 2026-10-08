import { useRef, useState } from "react";
import { QuestionReviewItem, ResultPayload } from "../types";
import { DataTable } from "./DataTable";
import { ResultHero } from "./analytics/ResultHero";
import { SectionPerformancePanel } from "./analytics/SectionPerformancePanel";
import { TypeBreakdownCard } from "./analytics/TypeBreakdownCard";
import { VerdictBanner } from "./analytics/VerdictBanner";
import { PriorityAreasPanel } from "./analytics/PriorityAreasPanel";
import { StrengthWeaknessLists } from "./analytics/StrengthWeaknessLists";
import { TopicAccuracyChart } from "./analytics/TopicAccuracyChart";
import { TimeBySectionChart } from "./analytics/TimeBySectionChart";
import { DifficultyPerformanceChart } from "./analytics/DifficultyPerformanceChart";
import { InsightsPanel } from "./analytics/InsightsPanel";
import { ComparisonPanel } from "./analytics/ComparisonPanel";
import { Spinner } from "./LoadingState";

interface ResultDashboardProps {
  result: ResultPayload;
  mockName: string;
  completedAt: string;
  onViewHistory: () => void;
  onBackToDashboard: () => void;
}

const OUTCOME_STYLES: Record<QuestionReviewItem["outcome"], string> = {
  correct: "border-status-answered/40 bg-status-answered/5",
  incorrect: "border-status-notanswered/40 bg-status-notanswered/5",
  unattempted: "border-line bg-canvas",
};

const OUTCOME_LABEL: Record<QuestionReviewItem["outcome"], string> = {
  correct: "Correct",
  incorrect: "Incorrect",
  unattempted: "Unattempted",
};

const OUTCOME_BADGE: Record<QuestionReviewItem["outcome"], string> = {
  correct: "bg-status-answered text-white",
  incorrect: "bg-status-notanswered text-white",
  unattempted: "bg-status-notvisited text-ink",
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function optionLetter(idx: number): string {
  return String.fromCharCode(65 + idx);
}

export function ResultDashboard({ result, mockName, completedAt, onViewHistory, onBackToDashboard }: ResultDashboardProps) {
  const [filter, setFilter] = useState<"all" | QuestionReviewItem["outcome"]>("all");
  const [downloading, setDownloading] = useState(false);
  const { score, question_review, groups, analytics } = result;
  const groupById = Object.fromEntries(groups.map((g) => [g.group_id, g]));
  const reviewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Dynamically imported so jsPDF (and its html2canvas/dompurify transitive
      // dependencies) only ever load when someone actually clicks this button —
      // every other screen in the app never pays for this ~250KB+ of code.
      const { exportResultToPdf } = await import("../utils/pdfExport");
      exportResultToPdf(result, mockName, completedAt);
    } finally {
      setDownloading(false);
    }
  };

  const filtered = filter === "all" ? question_review : question_review.filter((q) => q.outcome === filter);
  const maxScore = analytics.sections.reduce((sum, s) => sum + s.max_possible_score, 0);
  const { time_summary } = analytics;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Top actions — the result screen is a hub, not a dead end: Review Result
          (scrolls to the question-by-question breakdown below), Mock History and
          Back to Dashboard are always available from here. */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-canvas"
          >
            Review Result
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading && <Spinner size={12} />}
            {downloading ? "Preparing PDF…" : "Download Result"}
          </button>
          <button onClick={onViewHistory} className="rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-canvas">
            Mock History
          </button>
          <button onClick={onBackToDashboard} className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark">
            Back to Dashboard
          </button>
      </div>

      {/* Instant hero */}
      <div className="mb-6">
        <ResultHero mockName={mockName} date={completedAt} rawScore={score.overall_raw_score} maxScore={maxScore} percentile={analytics.overall_percentile} />
      </div>

      {/* Section summary cards */}
      <div className="mb-6">
        <SectionPerformancePanel sections={analytics.sections} scoreSections={score.sections} />
      </div>

      {/* First-impression stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Correct" value={score.total_correct} tone="good" />
        <StatCard label="Incorrect" value={score.total_incorrect} tone="bad" />
        <StatCard label="Unattempted" value={score.total_unattempted} tone="neutral" />
        <StatCard label="Attempt Rate" value={`${score.overall_attempt_rate_pct}%`} />
        <StatCard label="Accuracy" value={`${score.overall_accuracy_pct}%`} />
        <StatCard label="Time Used" value={formatTime(time_summary.total_used_sec)} />
        {time_summary.submitted_early ? (
          <StatCard label="Time Remaining" value={formatTime(time_summary.time_remaining_sec)} tone="neutral" />
        ) : (
          <StatCard label="Allotted Time" value={formatTime(time_summary.total_allotted_sec)} tone="neutral" />
        )}
        <StatCard label="Answer Changes" value={question_review.reduce((s, q) => s + q.answer_change_count, 0)} tone="neutral" />
      </div>

      {/* MCQ / TITA breakdown */}
      <SectionHeading title="Right / Wrong Breakdown by Question Type" />
      <div className="mb-6">
        <TypeBreakdownCard breakdown={analytics.type_breakdown} />
      </div>

      {/* Verdict */}
      <div className="mb-6">
        <VerdictBanner verdict={analytics.verdict} />
      </div>

      {/* Priority before next mock */}
      <SectionHeading title="Priority Before Next Mock" />
      <div className="mb-8">
        <PriorityAreasPanel areas={analytics.priority_areas} />
      </div>

      <div className="mb-8 border-t border-line pt-8">
        <p className="mb-6 font-mono text-xs uppercase tracking-wide text-muted">Detailed Analysis</p>

        {/* Strongest / weakest */}
        <SectionHeading title="Strongest & Weakest Areas" />
        <div className="mb-8">
          <StrengthWeaknessLists topicStats={analytics.topic_stats} />
        </div>

        {/* Topic performance */}
        <SectionHeading title="Topic Performance" />
        <div className="mb-8 rounded-lg border border-line bg-panel p-4 shadow-panel">
          <TopicAccuracyChart topics={analytics.topic_stats} />
        </div>

        {/* Time analysis */}
        <SectionHeading title="Time Analysis" />
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Time by Section</p>
            <TimeBySectionChart timeBySection={analytics.time.time_by_section} />
          </div>
          <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Accuracy by Difficulty</p>
            <DifficultyPerformanceChart stats={analytics.difficulty_performance} />
          </div>
        </div>

        {/* Insights */}
        <SectionHeading title="Performance Insights" />
        <div className="mb-8">
          <InsightsPanel insights={analytics.insights} />
        </div>

        {/* Comparison */}
        <SectionHeading title="Compared to Your Last Attempt" />
        <div className="mb-2">
          <ComparisonPanel comparison={analytics.comparison} />
        </div>
      </div>

      {/* Question-by-question review */}
      <div ref={reviewRef} className="mb-4 flex items-center justify-between pt-4">
        <h2 className="text-sm font-semibold text-ink">Question-by-Question Review</h2>
        <div className="flex gap-1.5">
          {(["all", "correct", "incorrect", "unattempted"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                filter === f ? "bg-accent text-white" : "bg-canvas text-muted hover:bg-line",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => {
          const group = q.set_id ? groupById[q.set_id] : undefined;
          return (
            <div key={q.question_id} className={["rounded-lg border p-5", OUTCOME_STYLES[q.outcome]].join(" ")}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs text-muted tnum">
                  <span>Question {question_review.indexOf(q) + 1}</span>
                  <span>&middot;</span>
                  <span>{q.topic}</span>
                  <span>&middot;</span>
                  <span>{q.difficulty}</span>
                  <span>&middot;</span>
                  <span>{formatTime(q.time_spent_sec)}</span>
                  {q.was_marked_for_review && (
                    <>
                      <span>&middot;</span>
                      <span className="text-status-review">Marked for review</span>
                    </>
                  )}
                  {q.answer_change_count > 0 && (
                    <>
                      <span>&middot;</span>
                      <span>Changed answer {q.answer_change_count}×</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={["rounded px-2 py-0.5 text-xs font-medium", OUTCOME_BADGE[q.outcome]].join(" ")}>{OUTCOME_LABEL[q.outcome]}</span>
                  <span className="font-mono text-xs font-medium tnum text-muted">{q.marks_awarded >= 0 ? `+${q.marks_awarded}` : q.marks_awarded}</span>
                </div>
              </div>

              {group && (
                <details className="mb-3 rounded-md border border-line bg-canvas/60 px-3 py-2 text-sm">
                  <summary className="cursor-pointer font-medium text-ink">
                    Set: {group.title} <span className="font-normal text-muted">(view data)</span>
                  </summary>
                  <div className="mt-2 space-y-2">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{group.stimulus_text}</p>
                    {group.table && <DataTable headers={group.table.headers} rows={group.table.rows} />}
                  </div>
                </details>
              )}

              <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{q.question_text}</p>

              {q.options ? (
                <div className="mb-3 space-y-1.5">
                  {q.options.map((opt, idx) => {
                    const val = String(idx);
                    const isCorrect = val === q.correct_answer;
                    const isYours = val === q.your_answer;
                    return (
                      <div
                        key={idx}
                        className={[
                          "flex items-center gap-2 rounded border px-3 py-1.5 text-sm",
                          isCorrect ? "border-status-answered bg-status-answered/10" : isYours ? "border-status-notanswered bg-status-notanswered/10" : "border-line",
                        ].join(" ")}
                      >
                        <span className="font-mono text-xs font-medium text-muted">{optionLetter(idx)}</span>
                        <span className="flex-1 text-ink">{opt}</span>
                        {isCorrect && <span className="text-xs font-medium text-status-answered">Correct</span>}
                        {isYours && !isCorrect && <span className="text-xs font-medium text-status-notanswered">Your answer</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mb-3 flex gap-4 text-sm">
                  <span className="text-muted">
                    Your answer: <span className="font-mono font-medium text-ink">{q.your_answer ?? "—"}</span>
                  </span>
                  <span className="text-muted">
                    Correct answer: <span className="font-mono font-medium text-status-answered">{q.correct_answer}</span>
                  </span>
                </div>
              )}

              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-accent">Explanation</summary>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">{q.explanation}</p>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>;
}

function StatCard({ label, value, tone, accent }: { label: string; value: string | number; tone?: "good" | "bad" | "neutral"; accent?: boolean }) {
  const toneColor = tone === "good" ? "text-status-answered" : tone === "bad" ? "text-status-notanswered" : tone === "neutral" ? "text-muted" : "text-ink";
  return (
    <div className={["rounded-lg border p-4", accent ? "border-accent bg-accent-light" : "border-line bg-panel"].join(" ")}>
      <p className="text-xs text-muted">{label}</p>
      <p className={["mt-1 font-mono text-xl font-semibold tnum", accent ? "text-accent-dark" : toneColor].join(" ")}>{value}</p>
    </div>
  );
}
