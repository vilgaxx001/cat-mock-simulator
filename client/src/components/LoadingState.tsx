export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-line border-t-accent"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2.5">
      <Spinner />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
