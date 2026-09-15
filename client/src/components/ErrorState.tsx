interface ErrorStateProps {
  title?: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** A consistent error presentation used anywhere a request fails — network
 * failure, a missing mock/attempt, or an unexpected server response. Two
 * optional actions so callers can offer both "try again" and "go back"
 * where relevant, without every call site inventing its own button layout. */
export function ErrorState({ title = "Something went wrong", message, primaryLabel, onPrimary, secondaryLabel, onSecondary }: ErrorStateProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-status-notanswered/10">
        <span className="text-lg font-semibold text-status-notanswered">!</span>
      </div>
      <h1 className="mb-2 text-lg font-semibold text-ink">{title}</h1>
      <p className="mb-6 text-sm leading-relaxed text-muted">{message}</p>
      {(onPrimary || onSecondary) && (
        <div className="flex gap-2">
          {onSecondary && secondaryLabel && (
            <button onClick={onSecondary} className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas">
              {secondaryLabel}
            </button>
          )}
          {onPrimary && primaryLabel && (
            <button onClick={onPrimary} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark">
              {primaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
