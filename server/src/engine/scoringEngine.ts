import { Attempt, ExamConfig, Question, QuestionScoreDetail, ScoreSummary, SectionName, SectionScore } from "../types";

// ============================================================================
// SCORING ENGINE
// The ONLY function in the codebase that turns responses into marks. Routes,
// results UI, analytics, and mock history all call this (or read its output)
// — none of them re-implement scoring logic. Marking rules come entirely
// from ExamConfig.marking, never hard-coded here.
// ============================================================================

function scoreOne(question: Question, finalAnswer: string | null, config: ExamConfig): { outcome: QuestionScoreDetail["outcome"]; marks: number } {
  const rule = question.question_type === "MCQ" ? config.marking.mcq : config.marking.tita;

  if (finalAnswer === null || finalAnswer === "") {
    return { outcome: "unattempted", marks: rule.unattempted };
  }

  const isCorrect =
    question.question_type === "MCQ"
      ? finalAnswer === question.correct_answer
      : normalizeTitaAnswer(finalAnswer) === normalizeTitaAnswer(question.correct_answer);

  return isCorrect ? { outcome: "correct", marks: rule.correct } : { outcome: "incorrect", marks: rule.incorrect };
}

/** TITA answers are free-text numeric/string input — normalize before comparing so
 * "48", " 48 ", "48.0" all match, but genuinely different values never do. */
function normalizeTitaAnswer(raw: string): string {
  const trimmed = raw.trim();
  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && trimmed !== "") {
    return String(asNumber);
  }
  return trimmed.toLowerCase();
}

export function computeScore(attempt: Attempt, questions: Question[], config: ExamConfig): ScoreSummary {
  const questionById = new Map(questions.map((q) => [q.question_id, q]));
  const details: QuestionScoreDetail[] = [];

  for (const q of questions) {
    const response = attempt.responses[q.question_id];
    const finalAnswer = response?.final_answer ?? null;
    const { outcome, marks } = scoreOne(q, finalAnswer, config);
    details.push({
      question_id: q.question_id,
      section: q.section,
      topic: q.topic,
      difficulty: q.difficulty,
      question_type: q.question_type,
      outcome,
      marks_awarded: marks,
      time_spent_sec: response?.time_spent_sec ?? 0,
    });
  }

  const sectionScores: SectionScore[] = (["VARC", "DILR", "QA"] as SectionName[])
    .map((section) => buildSectionScore(section, details))
    .filter((s) => questions.some((q) => q.section === s.section));

  const totalCorrect = details.filter((d) => d.outcome === "correct").length;
  const totalIncorrect = details.filter((d) => d.outcome === "incorrect").length;
  const totalUnattempted = details.filter((d) => d.outcome === "unattempted").length;
  const totalAttempts = totalCorrect + totalIncorrect;
  const overallRaw = details.reduce((sum, d) => sum + d.marks_awarded, 0);

  return {
    attempt_id: attempt.attempt_id,
    overall_raw_score: overallRaw,
    sections: sectionScores,
    question_details: details,
    total_attempts: totalAttempts,
    total_correct: totalCorrect,
    total_incorrect: totalIncorrect,
    total_unattempted: totalUnattempted,
    overall_accuracy_pct: totalAttempts > 0 ? round2((totalCorrect / totalAttempts) * 100) : 0,
    overall_attempt_rate_pct: details.length > 0 ? round2((totalAttempts / details.length) * 100) : 0,
  };
}

function buildSectionScore(section: SectionName, details: QuestionScoreDetail[]): SectionScore {
  const sectionDetails = details.filter((d) => d.section === section);
  const correct = sectionDetails.filter((d) => d.outcome === "correct").length;
  const incorrect = sectionDetails.filter((d) => d.outcome === "incorrect").length;
  const unattempted = sectionDetails.filter((d) => d.outcome === "unattempted").length;
  const attempts = correct + incorrect;
  const rawScore = sectionDetails.reduce((sum, d) => sum + d.marks_awarded, 0);

  return {
    section,
    attempts,
    correct,
    incorrect,
    unattempted,
    raw_score: rawScore,
    accuracy_pct: attempts > 0 ? round2((correct / attempts) * 100) : 0,
    attempt_rate_pct: sectionDetails.length > 0 ? round2((attempts / sectionDetails.length) * 100) : 0,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
