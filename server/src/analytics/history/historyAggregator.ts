import { MockHistoryEntry, SectionName } from "../../types";
import { listAttempts, getAttempt } from "../../repository/attemptRepository";
import { getConfig, getMock, getQuestionsForMock } from "../../repository/contentRepository";
import { computeScore } from "../../engine/scoringEngine";
import { calibrationFactor } from "../difficultyCalibration";
import { estimatePercentile } from "../percentileModel";
import { buildSectionPerformance } from "../sectionAnalysis";

// ============================================================================
// HISTORY AGGREGATOR
// Reads every completed attempt through the exact same computeScore /
// estimatePercentile / buildSectionPerformance functions a single result page
// uses — nothing here duplicates or reimplements scoring or percentile logic.
// Nothing is persisted; this runs fresh each time history is requested.
// ============================================================================

export function buildHistoryEntries(): MockHistoryEntry[] {
  const submitted = listAttempts().filter((e) => e.status === "submitted");
  const entries: MockHistoryEntry[] = [];

  for (const indexEntry of submitted) {
    const attempt = getAttempt(indexEntry.attempt_id);
    if (!attempt) continue;
    const mock = getMock(attempt.mock_id);
    const config = getConfig(attempt.config_id);
    if (!mock || !config) continue;

    const questions = getQuestionsForMock(attempt.mock_id);
    const score = computeScore(attempt, questions, config);
    const maxPossible = questions.reduce((sum, q) => sum + q.marks, 0);
    const factor = calibrationFactor(questions);
    const overallPercentile = estimatePercentile(score.overall_raw_score, maxPossible, factor, score.overall_attempt_rate_pct);
    const sectionPerf = buildSectionPerformance(score, questions);

    const sectionScores: Partial<Record<SectionName, number>> = {};
    const sectionPercentiles: Partial<Record<SectionName, number>> = {};
    for (const s of sectionPerf) {
      sectionScores[s.section] = s.raw_score;
      sectionPercentiles[s.section] = s.percentile.estimate;
    }

    const sectionTime: Partial<Record<SectionName, number>> = {};
    let totalTime = 0;
    let wastedTime = 0;
    for (const q of questions) {
      const response = attempt.responses[q.question_id];
      const t = response?.time_spent_sec ?? 0;
      sectionTime[q.section] = (sectionTime[q.section] ?? 0) + t;
      totalTime += t;
      const detail = score.question_details.find((d) => d.question_id === q.question_id);
      if (detail?.outcome === "unattempted") wastedTime += t;
    }

    entries.push({
      attempt_id: attempt.attempt_id,
      mock_id: attempt.mock_id,
      mock_name: mock.name,
      completed_at: attempt.submitted_at ?? attempt.created_at,
      raw_score: score.overall_raw_score,
      max_possible_score: maxPossible,
      estimated_percentile: overallPercentile.estimate,
      percentile_confidence: overallPercentile.confidence,
      section_scores: sectionScores,
      section_percentiles: sectionPercentiles,
      total_attempts: score.total_attempts,
      total_correct: score.total_correct,
      total_incorrect: score.total_incorrect,
      total_unattempted: score.total_unattempted,
      accuracy_pct: score.overall_accuracy_pct,
      avg_time_per_question_sec: questions.length > 0 ? Math.round(totalTime / questions.length) : 0,
      section_time_sec: sectionTime,
      time_wasted_on_unattempted_sec: wastedTime,
    });
  }

  // Chronological order — oldest first — so trend charts and "latest vs previous"
  // comparisons read naturally left-to-right / most-recent-last.
  return entries.sort((a, b) => a.completed_at.localeCompare(b.completed_at));
}
