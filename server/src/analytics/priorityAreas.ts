import { PriorityArea, TopicStat } from "../types";

const MIN_ATTEMPTS = 2;
const WEAK_THRESHOLD_PCT = 60;

/** Ranks this attempt's own weakest topics — not a multi-mock trend (that's
 * analytics/history/topicTracking.ts), just "what to fix before the next mock"
 * based on what actually happened in this one attempt. Only topics that were
 * genuinely weak make the list — a topic isn't a "priority" just because it
 * happens to be the least-strong among otherwise-fine performance. */
export function buildPriorityAreas(topicStats: TopicStat[]): PriorityArea[] {
  return topicStats
    .filter((t) => t.attempts >= MIN_ATTEMPTS && t.accuracy_pct <= WEAK_THRESHOLD_PCT)
    .sort((a, b) => a.accuracy_pct - b.accuracy_pct || b.attempts - a.attempts)
    .slice(0, 3)
    .map((t, i) => ({
      rank: i + 1,
      section: t.section,
      topic: t.topic,
      accuracy_pct: t.accuracy_pct,
      attempts: t.attempts,
      reason: `${t.correct} of ${t.attempts} correct (${t.accuracy_pct}%), averaging ${Math.floor(t.avg_time_sec / 60)}m ${t.avg_time_sec % 60}s per question.`,
    }));
}
