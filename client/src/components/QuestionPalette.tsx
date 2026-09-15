import { CandidateQuestion, ResponseSummary, VisitState } from "../types";

interface PaletteProps {
  questions: CandidateQuestion[];
  responses: Record<string, ResponseSummary>;
  currentQuestionId: string;
  globalOffset: number;
  onJump: (questionId: string) => void;
}

const STATE_STYLES: Record<VisitState, string> = {
  not_visited: "bg-status-notvisited text-ink border-transparent",
  visited_unanswered: "bg-status-notanswered text-white border-transparent",
  answered: "bg-status-answered text-white border-transparent",
  marked_review: "bg-status-review text-white border-transparent",
  answered_marked_review: "bg-status-answeredreview text-white border-transparent",
};

const LEGEND: { state: VisitState; label: string }[] = [
  { state: "not_visited", label: "Not Visited" },
  { state: "visited_unanswered", label: "Not Answered" },
  { state: "answered", label: "Answered" },
  { state: "marked_review", label: "Marked for Review" },
  { state: "answered_marked_review", label: "Answered & Marked" },
];

interface PaletteGroup {
  key: string;
  setLabel: string | null;
  items: { question: CandidateQuestion; index: number }[];
}

/** Runs of consecutive questions sharing a set_id/passage_id become one visual group,
 * so the palette mirrors the same set structure the exam screen shows. Questions with
 * no group (e.g. QA) fall into their own single-item group with no label — the palette
 * then renders exactly as it did before sets existed. */
function groupQuestions(questions: CandidateQuestion[]): PaletteGroup[] {
  const groups: PaletteGroup[] = [];
  let setCounter = 0;
  const seenSetKeys = new Map<string, string>();

  questions.forEach((question, index) => {
    const rawKey = question.set_id ?? question.passage_id ?? null;
    const last = groups[groups.length - 1];

    if (rawKey && last && last.key === rawKey) {
      last.items.push({ question, index });
      return;
    }

    let setLabel: string | null = null;
    if (rawKey) {
      if (!seenSetKeys.has(rawKey)) {
        setCounter += 1;
        seenSetKeys.set(rawKey, `Set ${setCounter}`);
      }
      setLabel = seenSetKeys.get(rawKey)!;
    }

    groups.push({ key: rawKey ?? `standalone-${index}`, setLabel, items: [{ question, index }] });
  });

  return groups;
}

export function QuestionPalette({ questions, responses, currentQuestionId, globalOffset, onJump }: PaletteProps) {
  const counts = LEGEND.reduce<Record<VisitState, number>>((acc, { state }) => {
    acc[state] = 0;
    return acc;
  }, {} as Record<VisitState, number>);
  for (const q of questions) {
    const s = responses[q.question_id]?.visit_state ?? "not_visited";
    counts[s] += 1;
  }

  const groups = groupQuestions(questions);

  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-panel shadow-panel">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Question Palette</h2>
      </div>

      <div className="space-y-3 overflow-y-auto px-4 py-4">
        {groups.map((group) => (
          <div key={group.key}>
            {group.setLabel && <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">{group.setLabel}</p>}
            <div className="flex flex-wrap gap-2">
              {group.items.map(({ question, index }) => {
                const state = responses[question.question_id]?.visit_state ?? "not_visited";
                const isCurrent = question.question_id === currentQuestionId;
                return (
                  <button
                    key={question.question_id}
                    onClick={() => onJump(question.question_id)}
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded font-mono text-sm font-medium tnum border-2 transition-transform hover:scale-105",
                      STATE_STYLES[state],
                      isCurrent ? "ring-2 ring-accent ring-offset-1" : "",
                    ].join(" ")}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-label={`Question ${globalOffset + index + 1}, ${state.replace(/_/g, " ")}`}
                  >
                    {globalOffset + index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-2 border-t border-line px-4 py-3 text-xs text-muted">
        {LEGEND.map(({ state, label }) => (
          <div key={state} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={["h-3 w-3 rounded-sm", STATE_STYLES[state].split(" ")[0]].join(" ")} />
              <span>{label}</span>
            </div>
            <span className="font-mono tnum">{counts[state]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
