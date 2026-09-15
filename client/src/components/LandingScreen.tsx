import { MockSummary } from "../types";
import { Spinner } from "./LoadingState";

interface LandingScreenProps {
  mocks: MockSummary[];
  onSelect: (mockId: string) => void;
  onViewHistory: () => void;
  loading: boolean;
}

export function LandingScreen({ mocks, onSelect, onViewHistory, loading }: LandingScreenProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-muted">CAT 2026 Preparation</p>
          <h1 className="text-2xl font-semibold text-ink">Mock Simulator</h1>
        </div>
        <button onClick={onViewHistory} className="rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-canvas">
          Mock History
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner size={14} />
          Loading mocks…
        </div>
      )}

      {!loading && mocks.length === 0 && <p className="text-sm text-muted">No mocks are available right now.</p>}

      <div className="space-y-3">
        {mocks.map((m) => (
          <button
            key={m.mock_id}
            onClick={() => onSelect(m.mock_id)}
            className="flex w-full items-center justify-between rounded-lg border border-line bg-panel px-5 py-4 text-left shadow-panel transition-colors hover:border-accent"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{m.name}</p>
              <p className="mt-0.5 text-sm text-muted">{m.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs text-muted">
                <span>VARC {m.question_counts.VARC}</span>
                <span>&middot;</span>
                <span>DILR {m.question_counts.DILR}</span>
                <span>&middot;</span>
                <span>QA {m.question_counts.QA}</span>
              </div>
            </div>
            <span className="ml-3 flex-shrink-0 rounded bg-accent-light px-2.5 py-1 text-xs font-medium text-accent-dark">{m.difficulty}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
