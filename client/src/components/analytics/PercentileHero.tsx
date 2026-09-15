import { PercentileEstimate } from "../../types";

const CONFIDENCE_STYLES: Record<string, string> = {
  High: "text-status-answered",
  Medium: "text-warn",
  Low: "text-muted",
};

export function PercentileHero({ percentile, calibrationFactor }: { percentile: PercentileEstimate; calibrationFactor: number }) {
  return (
    <div className="rounded-lg border border-accent bg-accent-light p-6">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-accent-dark">Estimated CAT-style Percentile</p>
      <div className="flex flex-wrap items-end gap-4">
        <span className="font-mono text-4xl font-semibold text-accent-dark tnum">{percentile.estimate}</span>
        <div className="pb-1">
          <p className="text-sm text-ink">
            Range: <span className="font-mono tnum">{percentile.range[0]}</span> – <span className="font-mono tnum">{percentile.range[1]}</span>
          </p>
          <p className={["text-xs font-medium", CONFIDENCE_STYLES[percentile.confidence] ?? "text-muted"].join(" ")}>{percentile.confidence} confidence</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        This is a statistical estimate calibrated against this mock's difficulty mix (factor {calibrationFactor}×) — not an official CAT percentile. Treat it as
        a directional signal, not a guarantee.
      </p>
    </div>
  );
}
