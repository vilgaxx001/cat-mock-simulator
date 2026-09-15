import { MockHistoryPayload } from "../../types";
import { buildHistoryEntries } from "./historyAggregator";
import { buildTrendSeries } from "./trendAnalysis";
import { detectImprovements } from "./improvementDetection";
import { computeConsistencyScore } from "./consistencyScore";
import { buildTopicTrends } from "./topicTracking";
import { buildTimeManagementTrend } from "./timeManagementTrend";
import { buildRecommendations } from "./recommendationEngine";
import { buildPersonalBests } from "./personalBests";
import { buildStreakInfo } from "./streaks";

export function buildMockHistory(): MockHistoryPayload {
  const entries = buildHistoryEntries();
  const { weak, strong } = buildTopicTrends();

  return {
    entries,
    trends: buildTrendSeries(entries),
    improvements: detectImprovements(entries),
    consistency: computeConsistencyScore(entries),
    weak_topics: weak,
    strong_topics: strong,
    time_management: buildTimeManagementTrend(entries),
    recommendations: buildRecommendations(weak),
    personal_bests: buildPersonalBests(entries),
    streak: buildStreakInfo(entries),
  };
}
