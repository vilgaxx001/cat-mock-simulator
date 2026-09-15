import { QuestionScoreDetail, TypeBreakdown } from "../types";

export function buildTypeBreakdown(details: QuestionScoreDetail[]): TypeBreakdown {
  const breakdown: TypeBreakdown = {
    mcq: { correct: 0, incorrect: 0, unattempted: 0 },
    tita: { correct: 0, incorrect: 0, unattempted: 0 },
  };

  for (const d of details) {
    const bucket = d.question_type === "MCQ" ? breakdown.mcq : breakdown.tita;
    if (d.outcome === "correct") bucket.correct += 1;
    else if (d.outcome === "incorrect") bucket.incorrect += 1;
    else bucket.unattempted += 1;
  }

  return breakdown;
}
