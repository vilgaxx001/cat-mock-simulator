interface ControlsProps {
  onPrevious: () => void;
  onClear: () => void;
  onMarkAndNext: () => void;
  onSaveAndNext: () => void;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
}

export function Controls({ onPrevious, onClear, onMarkAndNext, onSaveAndNext, canGoPrevious, isLastQuestion }: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel px-4 py-3 shadow-panel">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onClear} className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas">
          Clear Response
        </button>
        <button
          onClick={onMarkAndNext}
          className="rounded-md border border-status-review px-4 py-2 text-sm font-medium text-status-review transition-colors hover:bg-status-review/10"
        >
          Mark for Review &amp; Next
        </button>
        <button onClick={onSaveAndNext} className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark">
          {isLastQuestion ? "Save" : "Save & Next"}
        </button>
      </div>
    </div>
  );
}
