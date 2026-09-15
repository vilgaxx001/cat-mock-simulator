import { CandidateQuestion } from "../types";

interface QuestionViewProps {
  question: CandidateQuestion;
  index: number;
  totalInSection: number;
  globalNumber: number;
  totalInMock: number;
  draftAnswer: string;
  onDraftChange: (value: string) => void;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-green-50 text-green-700",
  "Easy-Moderate": "bg-lime-50 text-lime-700",
  Moderate: "bg-amber-50 text-amber-700",
  "Moderate-Hard": "bg-orange-50 text-orange-700",
  Hard: "bg-red-50 text-red-700",
};

export function QuestionView({ question, index, totalInSection, globalNumber, totalInMock, draftAnswer, onDraftChange }: QuestionViewProps) {
  return (
    <div className="flex-1 rounded-lg border border-line bg-panel p-4 shadow-panel sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-muted tnum">
            Question {globalNumber} of {totalInMock}
            <span className="ml-1.5 text-[11px] text-muted">
              ({question.section} &middot; {index + 1} of {totalInSection})
            </span>
          </span>
          <span className={["rounded px-2 py-0.5 text-xs font-medium", DIFFICULTY_STYLES[question.difficulty] ?? ""].join(" ")}>
            {question.difficulty}
          </span>
          <span className="rounded bg-accent-light px-2 py-0.5 text-xs font-medium text-accent-dark">{question.topic}</span>
        </div>
        <div className="text-xs text-muted">
          <span className="font-medium text-status-answered">+{question.marks}</span>
          {question.negative_marks !== 0 && <span className="ml-2 font-medium text-status-notanswered">{question.negative_marks}</span>}
          <span className="ml-3 rounded border border-line px-1.5 py-0.5 font-mono">{question.question_type}</span>
        </div>
      </div>

      <p className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-ink">{question.question_text}</p>

      {question.question_type === "MCQ" && question.options ? (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const value = String(i);
            const selected = draftAnswer === value;
            return (
              <label
                key={i}
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors",
                  selected ? "border-accent bg-accent-light" : "border-line bg-white hover:border-accent/50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={question.question_id}
                  value={value}
                  checked={selected}
                  onChange={() => onDraftChange(value)}
                  className="mt-0.5 h-4 w-4 accent-accent"
                />
                <span className="text-sm text-ink">{opt}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="max-w-xs">
          <label htmlFor="tita-input" className="mb-1.5 block text-xs font-medium text-muted">
            Type your answer (numeric)
          </label>
          <input
            id="tita-input"
            type="text"
            inputMode="decimal"
            value={draftAnswer}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="e.g. 42"
            className="w-full rounded-md border border-line px-3 py-2 font-mono text-base tnum focus:border-accent focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
