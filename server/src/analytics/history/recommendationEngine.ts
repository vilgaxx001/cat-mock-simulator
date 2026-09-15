import { Recommendation, TopicTrend } from "../../types";

// ============================================================================
// RECOMMENDATION ENGINE
// Deliberately thin: the real work already happened in topicTracking.ts. This
// just ranks the weak topics it found and attaches a reason string built from
// their actual numbers — no separate "advice" logic to keep in sync.
// ============================================================================

export function buildRecommendations(weakTopics: TopicTrend[]): Recommendation[] {
  return weakTopics.slice(0, 3).map((t, i) => ({
    rank: i + 1,
    section: t.section,
    topic: t.topic,
    reason: `${t.avg_accuracy_pct}% accuracy across ${t.combined_attempts} attempts in your last ${t.mocks_seen} mock${t.mocks_seen > 1 ? "s" : ""}, averaging ${Math.round(
      t.avg_time_sec / 60
    )}m ${t.avg_time_sec % 60}s per question.`,
  }));
}
