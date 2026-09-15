export function VerdictBanner({ verdict }: { verdict: string }) {
  return (
    <div className="rounded-lg border border-accent bg-accent-light px-5 py-4">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-accent-dark">Verdict</p>
      <p className="text-sm font-medium leading-relaxed text-ink">{verdict}</p>
    </div>
  );
}
