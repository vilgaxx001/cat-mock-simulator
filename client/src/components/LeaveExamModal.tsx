interface LeaveExamModalProps {
  onContinue: () => void;
  onLeave: () => void;
}

/** Shown when navigation away from an in-progress attempt is blocked (the header's
 * exit control, or browser back/forward via useBlocker). Deliberately doesn't claim
 * progress will be "lost" — it won't be, the attempt is persisted server-side via the
 * existing attempt repository and can be resumed from the same /attempt/:id URL — but
 * the section timer keeps running while you're away, which is the real, honest cost
 * of leaving. */
export function LeaveExamModal({ onContinue, onLeave }: LeaveExamModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="leave-exam-title">
      <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-6 shadow-panel">
        <h2 id="leave-exam-title" className="mb-2 text-lg font-semibold text-ink">
          Leave this mock?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted">
          You can resume this attempt later from where you left off, but the section timer keeps running while you're away.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onLeave}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas"
          >
            Leave Mock
          </button>
          <button
            onClick={onContinue}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Continue Exam
          </button>
        </div>
      </div>
    </div>
  );
}
