import { TypeBreakdown } from "../../types";

function Row({ label, correct, incorrect, unattempted }: { label: string; correct: number; incorrect: number; unattempted: number }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="flex gap-4 text-sm">
        <span>
          Correct: <span className="font-mono font-medium text-status-answered tnum">{correct}</span>
        </span>
        <span>
          Wrong: <span className="font-mono font-medium text-status-notanswered tnum">{incorrect}</span>
        </span>
        <span>
          Unattempted: <span className="font-mono font-medium text-muted tnum">{unattempted}</span>
        </span>
      </div>
    </div>
  );
}

export function TypeBreakdownCard({ breakdown }: { breakdown: TypeBreakdown }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
      <div className="space-y-3">
        <Row label="MCQ" {...breakdown.mcq} />
        <Row label="TITA" {...breakdown.tita} />
      </div>
    </div>
  );
}
