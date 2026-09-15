import { PriorityArea } from "../../types";

export function PriorityAreasPanel({ areas }: { areas: PriorityArea[] }) {
  if (areas.length === 0) {
    return <p className="text-sm text-muted">No clear weak spots stood out in this attempt — nice.</p>;
  }
  return (
    <ol className="space-y-2">
      {areas.map((a) => (
        <li key={`${a.section}-${a.topic}`} className="flex items-start gap-3 rounded-md border border-line bg-panel p-3.5">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-white tnum">{a.rank}</span>
          <div>
            <p className="text-sm font-medium text-ink">
              {a.section} &middot; {a.topic}
            </p>
            <p className="text-xs text-muted">{a.reason}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
