import { PercentileEstimate } from "../../types";

const CONFIDENCE_STYLES: Record<string, string> = {
  High: "bg-status-answered/15 text-status-answered",
  Medium: "bg-warn/15 text-warn",
  Low: "bg-line text-muted",
};

interface ResultHeroProps {
  mockName: string;
  date: string;
  rawScore: number;
  maxScore: number;
  percentile: PercentileEstimate;
}

export function ResultHero({ mockName, date, rawScore, maxScore, percentile }: ResultHeroProps) {
  return (
    <div className="rounded-lg border border-line bg-panel p-6 shadow-panel sm:p-8">
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-muted">CAT Mock Result</p>
      <h1 className="mb-1 text-xl font-semibold text-ink">{mockName}</h1>
      <p className="mb-6 text-sm text-muted">{new Date(date).toLocaleString()}</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Overall Score</p>
          <p className="font-mono text-5xl font-semibold tnum text-ink">
            {rawScore}
            <span className="text-xl font-normal text-muted"> / {maxScore}</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Estimated Percentile</p>
          <div className="flex items-end gap-3">
            <p className="font-mono text-5xl font-semibold tnum text-accent-dark">{percentile.estimate}</p>
            <span className={["mb-2 rounded px-2 py-0.5 text-xs font-medium", CONFIDENCE_STYLES[percentile.confidence] ?? "text-muted"].join(" ")}>
              {percentile.confidence} confidence
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-muted tnum">
            Range: {percentile.range[0]} – {percentile.range[1]}
          </p>
        </div>
      </div>
    </div>
  );
}
