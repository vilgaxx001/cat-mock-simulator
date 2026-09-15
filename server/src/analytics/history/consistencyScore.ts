import { ConsistencyScore, MockHistoryEntry, SectionName } from "../../types";

// ============================================================================
// CONSISTENCY SCORE
// Three components, each 0-10, averaged into one headline number:
//   - score_stability:    how tightly raw scores cluster across recent mocks
//                          (low coefficient of variation = high stability)
//   - section_balance:    how evenly the most recent mock's performance is
//                          spread across sections (low spread in sectional
//                          percentiles = balanced, not just strong in one)
//   - accuracy_stability: same coefficient-of-variation idea, applied to
//                          overall accuracy instead of raw score
// Needs at least 2 completed mocks for stability metrics to mean anything —
// returns null below that rather than fabricating a number from one data point.
// ============================================================================

const RECENT_WINDOW = 5;

function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  return sd / Math.abs(mean);
}

function stabilityFromCv(cv: number): number {
  // A CV of 0 (perfectly consistent) -> 10. A CV of 0.5+ (huge swings) -> 0.
  return Math.max(0, Math.min(10, 10 * (1 - cv / 0.5)));
}

export function computeConsistencyScore(entries: MockHistoryEntry[]): ConsistencyScore | null {
  if (entries.length < 2) return null;

  const recent = entries.slice(-RECENT_WINDOW);

  const scoreCv = coefficientOfVariation(recent.map((e) => e.raw_score));
  const scoreStability = Math.round(stabilityFromCv(scoreCv) * 10) / 10;

  const accuracyCv = coefficientOfVariation(recent.map((e) => e.accuracy_pct));
  const accuracyStability = Math.round(stabilityFromCv(accuracyCv) * 10) / 10;

  const latest = recent[recent.length - 1];
  const sections: SectionName[] = ["VARC", "DILR", "QA"];
  const latestSectionPercentiles = sections.map((s) => latest.section_percentiles[s]).filter((v): v is number => v !== undefined);
  let sectionBalance = 10;
  if (latestSectionPercentiles.length >= 2) {
    const mean = latestSectionPercentiles.reduce((a, b) => a + b, 0) / latestSectionPercentiles.length;
    const spread = Math.sqrt(latestSectionPercentiles.reduce((sum, v) => sum + (v - mean) ** 2, 0) / latestSectionPercentiles.length);
    // A spread of 0 (identical percentiles across sections) -> 10. A spread of 30+ points -> 0.
    sectionBalance = Math.round(Math.max(0, Math.min(10, 10 * (1 - spread / 30))) * 10) / 10;
  }

  const overall = Math.round(((scoreStability + accuracyStability + sectionBalance) / 3) * 10) / 10;

  return {
    score: overall,
    components: { score_stability: scoreStability, section_balance: sectionBalance, accuracy_stability: accuracyStability },
    mocks_considered: recent.length,
  };
}
