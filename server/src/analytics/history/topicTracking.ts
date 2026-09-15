import { TopicTrend } from "../../types";
import { listAttempts, getAttempt } from "../../repository/attemptRepository";
import { getConfig, getMock, getQuestionsForMock } from "../../repository/contentRepository";
import { computeScore } from "../../engine/scoringEngine";
import { buildTopicStats } from "../topicAnalysis";

// ============================================================================
// TOPIC TRACKING ACROSS MOCKS
// Reuses buildTopicStats (the same function a single result page uses) once
// per recent attempt, then merges the per-attempt topic stats together —
// weighted by how many questions were actually attempted in each mock, so a
// topic you tried 8 times across 3 mocks counts more than one you tried once.
// ============================================================================

const RECENT_MOCK_WINDOW = 5;
const MIN_COMBINED_ATTEMPTS = 3;
const WEAK_THRESHOLD_PCT = 50;
const STRONG_THRESHOLD_PCT = 80;

export function buildTopicTrends(): { weak: TopicTrend[]; strong: TopicTrend[] } {
  const recentSubmitted = listAttempts()
    .filter((e) => e.status === "submitted")
    .sort((a, b) => (b.submitted_at ?? "").localeCompare(a.submitted_at ?? ""))
    .slice(0, RECENT_MOCK_WINDOW);

  const merged = new Map<
    string,
    { section: string; topic: string; mocks_seen: Set<string>; attempts: number; correct: number; timeSum: number }
  >();

  for (const indexEntry of recentSubmitted) {
    const attempt = getAttempt(indexEntry.attempt_id);
    if (!attempt) continue;
    const mock = getMock(attempt.mock_id);
    const config = getConfig(attempt.config_id);
    if (!mock || !config) continue;

    const questions = getQuestionsForMock(attempt.mock_id);
    const score = computeScore(attempt, questions, config);
    const topicStats = buildTopicStats(questions, attempt, score.question_details);

    for (const t of topicStats) {
      if (t.attempts === 0) continue;
      const key = `${t.section}::${t.topic}`;
      const existing = merged.get(key) ?? { section: t.section, topic: t.topic, mocks_seen: new Set<string>(), attempts: 0, correct: 0, timeSum: 0 };
      existing.mocks_seen.add(attempt.attempt_id);
      existing.attempts += t.attempts;
      existing.correct += t.correct;
      existing.timeSum += t.avg_time_sec * t.attempts;
      merged.set(key, existing);
    }
  }

  const trends: TopicTrend[] = Array.from(merged.values())
    .filter((m) => m.attempts >= MIN_COMBINED_ATTEMPTS)
    .map((m) => ({
      section: m.section as TopicTrend["section"],
      topic: m.topic,
      mocks_seen: m.mocks_seen.size,
      combined_attempts: m.attempts,
      avg_accuracy_pct: Math.round((m.correct / m.attempts) * 1000) / 10,
      avg_time_sec: Math.round(m.timeSum / m.attempts),
    }));

  const weak = trends
    .filter((t) => t.avg_accuracy_pct <= WEAK_THRESHOLD_PCT)
    .sort((a, b) => a.avg_accuracy_pct - b.avg_accuracy_pct || b.combined_attempts - a.combined_attempts)
    .slice(0, 5);

  const strong = trends
    .filter((t) => t.avg_accuracy_pct >= STRONG_THRESHOLD_PCT)
    .sort((a, b) => b.avg_accuracy_pct - a.avg_accuracy_pct || b.combined_attempts - a.combined_attempts)
    .slice(0, 5);

  return { weak, strong };
}
