import { useState } from "react";
import { MockDetail } from "../types";
import { Spinner } from "./LoadingState";
import { BackLink } from "./BackLink";

interface InstructionsScreenProps {
  detail: MockDetail;
  onStart: () => void;
  starting: boolean;
  /** Where the "Back to Mock Library" affordance above the card should lead. */
  backTo?: string;
}

export function InstructionsScreen({ detail, onStart, starting, backTo }: InstructionsScreenProps) {
  const { mock, config, instructions } = detail;
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-12 sm:px-6">
      {backTo && <BackLink to={backTo} label="Back to Mock Library" />}
      <div className="rounded-lg border border-line bg-panel p-6 shadow-panel sm:p-8">
        <div className="mb-6 border-b border-line pb-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-muted">Examination Instructions</p>
          <h1 className="text-xl font-semibold text-ink sm:text-2xl">{mock.name}</h1>
          <p className="mt-1 text-sm text-muted">{mock.description}</p>
        </div>

        <div className={["mb-6 grid gap-3", config.sections.length > 1 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:w-1/3"].join(" ")}>
          {config.sections.map((s) => (
            <div key={s.name} className="rounded-md border border-line bg-canvas px-3 py-2.5 text-center">
              <p className="font-mono text-lg font-semibold text-ink tnum">{s.name}</p>
              <p className="text-xs text-muted">
                {s.question_count} Qs &middot; {s.duration_min} min
              </p>
            </div>
          ))}
        </div>

        <ol className="mb-8 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-ink">
          {instructions.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>

        <label className="mb-6 flex items-start gap-2.5 rounded-md border border-line bg-canvas px-4 py-3 text-sm text-ink">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 accent-accent" />
          <span>I have read and understood the instructions above, and I am ready to begin the timed examination.</span>
        </label>

        <button
          onClick={onStart}
          disabled={starting || !agreed}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting ? (
            <>
              <Spinner size={14} /> Starting…
            </>
          ) : (
            "Start Examination"
          )}
        </button>
      </div>
    </div>
  );
}
