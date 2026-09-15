import { ImprovementNote, MockHistoryEntry, SectionName } from "../../types";

// ============================================================================
// IMPROVEMENT DETECTION
// Compares the two most recent completed attempts (regardless of which mock
// they were), and only emits a note where there's an actual, meaningful
// difference — small noise (e.g. a 1-mark swing) doesn't produce a note.
// ============================================================================

const MEANINGFUL_SCORE_DELTA = 3; // marks
const MEANINGFUL_ACCURACY_DELTA = 5; // percentage points
const MEANINGFUL_ATTEMPT_DELTA = 2; // question count

export function detectImprovements(entries: MockHistoryEntry[]): ImprovementNote[] {
  if (entries.length < 2) return [];

  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];
  const notes: ImprovementNote[] = [];

  const sections: SectionName[] = ["VARC", "DILR", "QA"];
  for (const section of sections) {
    const curr = latest.section_scores[section];
    const prev = previous.section_scores[section];
    if (curr === undefined || prev === undefined) continue;
    const delta = curr - prev;
    if (Math.abs(delta) >= MEANINGFUL_SCORE_DELTA) {
      notes.push({
        title: `${section} ${delta > 0 ? "improved" : "declined"} by ${Math.abs(delta)} marks`,
        detail: `${previous.mock_name} scored ${prev} in ${section}; ${latest.mock_name} scored ${curr}.`,
        positive: delta > 0,
      });
    }
  }

  const accuracyDelta = Math.round((latest.accuracy_pct - previous.accuracy_pct) * 10) / 10;
  if (Math.abs(accuracyDelta) >= MEANINGFUL_ACCURACY_DELTA) {
    notes.push({
      title: `Overall accuracy ${accuracyDelta > 0 ? "increased" : "dropped"} from ${previous.accuracy_pct}% to ${latest.accuracy_pct}%`,
      detail: `Based on your two most recent completed mocks.`,
      positive: accuracyDelta > 0,
    });
  }

  const attemptDelta = latest.total_attempts - previous.total_attempts;
  if (Math.abs(attemptDelta) >= MEANINGFUL_ATTEMPT_DELTA) {
    notes.push({
      title: `Attempt rate ${attemptDelta > 0 ? "improved" : "dropped"}: ${previous.total_attempts} → ${latest.total_attempts} questions attempted`,
      detail: `Out of ${latest.max_possible_score / 3} questions in ${latest.mock_name}.`,
      positive: attemptDelta > 0,
    });
  }

  const percentileDelta = Math.round((latest.estimated_percentile - previous.estimated_percentile) * 10) / 10;
  if (Math.abs(percentileDelta) >= 1) {
    notes.push({
      title: `Estimated percentile ${percentileDelta > 0 ? "up" : "down"} ${Math.abs(percentileDelta)} points`,
      detail: `${previous.estimated_percentile} → ${latest.estimated_percentile}.`,
      positive: percentileDelta > 0,
    });
  }

  return notes;
}
