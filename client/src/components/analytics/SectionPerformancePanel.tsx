import { SectionPerformance, SectionScore } from "../../types";

const CLASSIFICATION_STYLES: Record<string, string> = {
  Excellent: "bg-status-answered text-white",
  Good: "bg-accent text-white",
  Average: "bg-warn text-white",
  "Needs Improvement": "bg-status-notanswered text-white",
};

export function SectionPerformancePanel({ sections, scoreSections }: { sections: SectionPerformance[]; scoreSections: SectionScore[] }) {
  const scoreBySection = Object.fromEntries(scoreSections.map((s) => [s.section, s]));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {sections.map((s) => {
        const score = scoreBySection[s.section];
        return (
          <div key={s.section} className="rounded-lg border border-line bg-panel p-4 shadow-panel">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{s.section}</span>
              <span className={["rounded px-2 py-0.5 text-[11px] font-medium", CLASSIFICATION_STYLES[s.classification]].join(" ")}>{s.classification}</span>
            </div>
            <p className="font-mono text-2xl font-semibold tnum text-ink">
              {s.raw_score}
              <span className="text-sm font-normal text-muted"> / {s.max_possible_score}</span>
            </p>
            {score && (
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
                <span>
                  Attempts: <span className="font-mono font-medium text-ink tnum">{score.attempts}</span>
                </span>
                <span>
                  Accuracy: <span className="font-mono font-medium text-ink tnum">{score.accuracy_pct}%</span>
                </span>
                <span>
                  Correct: <span className="font-mono font-medium text-status-answered tnum">{score.correct}</span>
                </span>
                <span>
                  Wrong: <span className="font-mono font-medium text-status-notanswered tnum">{score.incorrect}</span>
                </span>
              </div>
            )}
            <p className="mt-1 text-xs text-muted">
              Est. percentile: <span className="font-mono font-medium text-ink tnum">{s.percentile.estimate}</span>{" "}
              <span className="font-mono tnum">
                ({s.percentile.range[0]}–{s.percentile.range[1]})
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
