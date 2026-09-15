import { SectionConfig, SectionName } from "../types";
import { Spinner } from "./LoadingState";

interface SectionTransitionScreenProps {
  fromSection: SectionName | null;
  toSection: SectionName;
  sections: SectionConfig[];
  onContinue: () => void;
  continuing: boolean;
}

export function SectionTransitionScreen({ fromSection, toSection, sections, onContinue, continuing }: SectionTransitionScreenProps) {
  const toConfig = sections.find((s) => s.name === toSection);
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-line bg-panel p-8 text-center shadow-panel">
        {sorted.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-1.5">
            {sorted.map((s) => (
              <span
                key={s.name}
                className={[
                  "rounded px-2.5 py-1 font-mono text-xs font-medium tnum",
                  s.name === toSection
                    ? "bg-accent text-white"
                    : s.name === fromSection
                    ? "bg-status-answered/15 text-status-answered"
                    : "bg-canvas text-muted",
                ].join(" ")}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}

        {fromSection && <p className="mb-1 font-mono text-xs uppercase tracking-wide text-muted">{fromSection} is over</p>}
        <h1 className="mb-3 text-2xl font-semibold text-ink">{toSection} begins now</h1>
        {toConfig && (
          <p className="mb-6 text-sm text-muted">
            {toConfig.question_count} questions &middot; {toConfig.duration_min} minutes
          </p>
        )}
        <p className="mb-8 text-sm leading-relaxed text-muted">
          {fromSection ? `You cannot return to ${fromSection} once you continue. ` : ""}
          The timer for {toSection} starts as soon as you click continue.
        </p>
        <button
          onClick={onContinue}
          disabled={continuing}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {continuing ? (
            <>
              <Spinner size={14} /> Loading…
            </>
          ) : (
            `Continue to ${toSection}`
          )}
        </button>
      </div>
    </div>
  );
}
