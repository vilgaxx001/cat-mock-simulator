import { Attempt, ComparisonResult, ComparisonSnapshot, ScoreSummary } from "../types";
import { listAttempts, getAttempt } from "../repository/attemptRepository";
import { getQuestionsForMock } from "../repository/contentRepository";
import { getConfig } from "../repository/contentRepository";
import { computeScore } from "../engine/scoringEngine";

// ============================================================================
// ATTEMPT COMPARISON
// A ComparisonSnapshot is the compact, serializable slice of an attempt that
// future mock-history/trend features will want to store many of. Today
// there's no dedicated history store — this reads the same
// attemptRepository.listAttempts() index that already exists, finds the most
// recent *other* completed attempt of the *same* mock, and does a real
// comparison against it. When a proper history feature is built later, it
// can reuse ComparisonSnapshot and compareSnapshots() unchanged; only the
// "find the previous attempt" lookup would need to become "pick any two from
// history".
// ============================================================================

export function buildSnapshot(attempt: Attempt, score: ScoreSummary): ComparisonSnapshot {
  const sectionScores: ComparisonSnapshot["section_scores"] = {};
  for (const s of score.sections) sectionScores[s.section] = s.raw_score;

  return {
    attempt_id: attempt.attempt_id,
    mock_id: attempt.mock_id,
    completed_at: attempt.submitted_at ?? attempt.created_at,
    overall_raw_score: score.overall_raw_score,
    overall_accuracy_pct: score.overall_accuracy_pct,
    overall_attempts: score.total_attempts,
    section_scores: sectionScores,
  };
}

function compareSnapshots(current: ComparisonSnapshot, previous: ComparisonSnapshot | null): ComparisonResult["deltas"] {
  if (!previous) return null;
  const sectionDeltas: ComparisonSnapshot["section_scores"] = {};
  for (const section of Object.keys(current.section_scores) as (keyof typeof current.section_scores)[]) {
    const curr = current.section_scores[section] ?? 0;
    const prev = previous.section_scores[section] ?? 0;
    sectionDeltas[section] = round2(curr - prev);
  }
  return {
    overall_raw_score: round2(current.overall_raw_score - previous.overall_raw_score),
    overall_accuracy_pct: round2(current.overall_accuracy_pct - previous.overall_accuracy_pct),
    overall_attempts: current.overall_attempts - previous.overall_attempts,
    section_scores: sectionDeltas,
  };
}

/** Finds the most recent OTHER completed attempt of the same mock, computes its
 * score the same way the current one was computed, and returns a full comparison.
 * Returns `previous: null, deltas: null` gracefully if this is the first
 * completed attempt of this mock — that's an expected, normal case, not an error. */
export function buildComparison(attempt: Attempt, score: ScoreSummary): ComparisonResult {
  const current = buildSnapshot(attempt, score);

  const priorEntry = listAttempts()
    .filter((e) => e.mock_id === attempt.mock_id && e.status === "submitted" && e.attempt_id !== attempt.attempt_id)
    .sort((a, b) => (b.submitted_at ?? "").localeCompare(a.submitted_at ?? ""))[0];

  if (!priorEntry) {
    return { current, previous: null, deltas: null };
  }

  const priorAttempt = getAttempt(priorEntry.attempt_id);
  const config = priorAttempt ? getConfig(priorAttempt.config_id) : undefined;
  if (!priorAttempt || !config) {
    return { current, previous: null, deltas: null };
  }

  const priorQuestions = getQuestionsForMock(priorAttempt.mock_id);
  const priorScore = computeScore(priorAttempt, priorQuestions, config);
  const previous = buildSnapshot(priorAttempt, priorScore);

  return { current, previous, deltas: compareSnapshots(current, previous) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
