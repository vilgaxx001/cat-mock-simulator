import { QuestionGroup } from "../types";
import { DataTable } from "./DataTable";

interface SetStimulusProps {
  group: QuestionGroup;
  questionsInSet: number;
  positionInSet: number;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-green-50 text-green-700",
  "Easy-Moderate": "bg-lime-50 text-lime-700",
  Moderate: "bg-amber-50 text-amber-700",
  "Moderate-Hard": "bg-orange-50 text-orange-700",
  Hard: "bg-red-50 text-red-700",
};

export function SetStimulus({ group, questionsInSet, positionInSet }: SetStimulusProps) {
  return (
    <div className="flex w-full flex-col rounded-lg border border-line bg-panel shadow-panel lg:sticky lg:top-4 lg:w-[46%] lg:max-h-[calc(100vh-7rem)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Set &middot; Question {positionInSet} of {questionsInSet}</p>
          <h2 className="text-sm font-semibold text-ink">{group.title}</h2>
        </div>
        <span className={["rounded px-2 py-0.5 text-xs font-medium", DIFFICULTY_STYLES[group.difficulty] ?? ""].join(" ")}>{group.difficulty}</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-ink">{group.stimulus_text}</p>
        {group.table && <DataTable headers={group.table.headers} rows={group.table.rows} />}
      </div>
    </div>
  );
}
