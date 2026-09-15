import { Question, ScoreSummary, SectionPerformance } from "../types";
import { calibrationFactor } from "./difficultyCalibration";
import { classifyFromPercentile, estimatePercentile } from "./percentileModel";

// ============================================================================
// SECTIONAL PERFORMANCE
// One percentile estimate per section, kept explicitly separate from the
// overall estimate — a candidate can be strong in QA and weak in VARC, and
// the sectional numbers need to say so independently rather than being
// implied by a single blended figure.
// ============================================================================

export function buildSectionPerformance(score: ScoreSummary, allQuestions: Question[]): SectionPerformance[] {
  return score.sections.map((sectionScore) => {
    const sectionQuestions = allQuestions.filter((q) => q.section === sectionScore.section);
    const maxPossible = sectionQuestions.reduce((sum, q) => sum + q.marks, 0);
    const factor = calibrationFactor(sectionQuestions);
    const percentile = estimatePercentile(sectionScore.raw_score, maxPossible, factor, sectionScore.attempt_rate_pct);

    return {
      section: sectionScore.section,
      raw_score: sectionScore.raw_score,
      max_possible_score: maxPossible,
      percentile,
      classification: classifyFromPercentile(percentile.estimate),
    };
  });
}
