import { Difficulty, DifficultyProfileEntry, Question } from "../types";

// ============================================================================
// DIFFICULTY CALIBRATION
// Converts a mock's mix of Easy/Moderate/Hard questions into a single
// "difficulty weight" — used to adjust a raw score before it's fed into the
// percentile model. The idea: a given raw score achieved on a harder-than-
// baseline paper should map to a higher percentile than the same raw score on
// an easier paper, since it took more to earn each mark.
//
// These weights are editorial judgment calls, not measured data — they exist
// so the calibration can be tuned in one place without touching the
// percentile model or anything that calls it.
// ============================================================================

export const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  Easy: 0.8,
  "Easy-Moderate": 0.9,
  Moderate: 1.0,
  "Moderate-Hard": 1.15,
  Hard: 1.35,
};

/** A "standard" CAT paper leans slightly harder than pure Moderate — this is
 * the reference point every mock's average weight is compared against. */
export const BASELINE_DIFFICULTY_WEIGHT = 1.05;

export function averageDifficultyWeight(questions: Question[]): number {
  if (questions.length === 0) return BASELINE_DIFFICULTY_WEIGHT;
  const sum = questions.reduce((acc, q) => acc + DIFFICULTY_WEIGHTS[q.difficulty], 0);
  return sum / questions.length;
}

/** >1 means this mock (or section) is harder than baseline; <1 means easier. */
export function calibrationFactor(questions: Question[]): number {
  return averageDifficultyWeight(questions) / BASELINE_DIFFICULTY_WEIGHT;
}

export function difficultyProfile(questions: Question[]): DifficultyProfileEntry[] {
  const order: Difficulty[] = ["Easy", "Easy-Moderate", "Moderate", "Moderate-Hard", "Hard"];
  return order
    .map((difficulty) => ({ difficulty, count: questions.filter((q) => q.difficulty === difficulty).length }))
    .filter((entry) => entry.count > 0);
}
