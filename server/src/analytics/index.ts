import { AnalyticsResult, Attempt, ExamConfig, Question, QuestionGroup, ScoreSummary } from "../types";
import { averageDifficultyWeight, calibrationFactor, difficultyProfile, BASELINE_DIFFICULTY_WEIGHT } from "./difficultyCalibration";
import { estimatePercentile } from "./percentileModel";
import { buildSectionPerformance } from "./sectionAnalysis";
import { buildTopicStats, buildSubtopicStats, buildDifficultyPerformance } from "./topicAnalysis";
import { buildTimeAnalytics } from "./timeAnalysis";
import { buildInsights } from "./insightGenerator";
import { buildComparison } from "./comparison";
import { buildTypeBreakdown } from "./typeBreakdown";
import { buildTimeSummary } from "./timeSummary";
import { buildPriorityAreas } from "./priorityAreas";
import { buildVerdict } from "./verdictGenerator";

export function buildAnalytics(attempt: Attempt, questions: Question[], groups: QuestionGroup[], config: ExamConfig, score: ScoreSummary): AnalyticsResult {
  const maxRawScore = questions.reduce((sum, q) => sum + q.marks, 0);
  const overallFactor = calibrationFactor(questions);
  const overallPercentile = estimatePercentile(score.overall_raw_score, maxRawScore, overallFactor, score.overall_attempt_rate_pct);

  const sections = buildSectionPerformance(score, questions);
  const topicStats = buildTopicStats(questions, attempt, score.question_details);
  const subtopicStats = buildSubtopicStats(questions, attempt, score.question_details);
  const difficultyPerformance = buildDifficultyPerformance(questions, attempt, score.question_details);
  const time = buildTimeAnalytics(questions, attempt, score.question_details, groups);
  const insights = buildInsights(topicStats, time, sections);
  const comparison = buildComparison(attempt, score);
  const priorityAreas = buildPriorityAreas(topicStats);

  return {
    overall_percentile: overallPercentile,
    calibration_factor: Math.round(overallFactor * 1000) / 1000,
    difficulty_profile: difficultyProfile(questions),
    difficulty_performance: difficultyPerformance,
    sections,
    topic_stats: topicStats,
    subtopic_stats: subtopicStats,
    time,
    insights,
    comparison,
    type_breakdown: buildTypeBreakdown(score.question_details),
    time_summary: buildTimeSummary(attempt, config),
    priority_areas: priorityAreas,
    verdict: buildVerdict(sections, priorityAreas),
  };
}

// Re-exported for the /result route and for anything that wants the raw
// building blocks (e.g. tests) without going through the full orchestrator.
export { averageDifficultyWeight, BASELINE_DIFFICULTY_WEIGHT };
