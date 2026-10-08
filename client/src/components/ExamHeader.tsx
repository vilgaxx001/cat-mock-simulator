import { SectionName } from "../types";
import { Timer } from "./Timer";

interface ExamHeaderProps {
  mockName: string;
  currentSection: SectionName;
  allSections: SectionName[];
  completedSections: SectionName[];
  serverSeconds: number;
  syncedAtMs: number;
  warningThresholdSec: number;
  /** Optional exit affordance, consistently positioned at the header's leading edge.
   * Left out of the tab order/flow when omitted. Triggering it is expected to go
   * through the same blocked-navigation confirmation as browser back (see
   * MockRunner's useBlocker + LeaveExamModal) rather than leaving immediately. */
  onExit?: () => void;
}

export function ExamHeader({
  mockName,
  currentSection,
  allSections,
  completedSections,
  serverSeconds,
  syncedAtMs,
  warningThresholdSec,
  onExit,
}: ExamHeaderProps) {
  const sectionPosition = allSections.indexOf(currentSection) + 1;
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-panel px-4 py-3 shadow-panel sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {onExit && (
          <button
            onClick={onExit}
            className="flex-shrink-0 rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label="Exit mock"
            title="Exit mock"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
        <span className="max-w-[160px] truncate text-sm font-semibold text-ink sm:max-w-none">{mockName}</span>
        {allSections.length > 1 && (
          <span className="font-mono text-xs text-muted tnum">
            Section {sectionPosition} of {allSections.length}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          {allSections.map((s) => {
            const isDone = completedSections.includes(s);
            const isCurrent = s === currentSection;
            return (
              <span
                key={s}
                className={[
                  "rounded px-2.5 py-1 font-mono text-xs font-medium tnum",
                  isCurrent ? "bg-accent text-white" : isDone ? "bg-status-answered/15 text-status-answered" : "bg-canvas text-muted",
                ].join(" ")}
              >
                {s}
              </span>
            );
          })}
        </div>
      </div>
      <Timer serverSeconds={serverSeconds} syncedAtMs={syncedAtMs} warningThresholdSec={warningThresholdSec} />
    </header>
  );
}
