import { MockHistoryEntry, TimeManagementTrend } from "../../types";

// ============================================================================
// TIME MANAGEMENT TREND
// "Improving" is judged by wasted time (time sunk into questions ultimately
// left unattempted) — comparing the most recent mock against the average of
// everything before it. This is a more direct signal of time management than
// average-time-per-question alone, since a faster average can just as easily
// mean rushing and guessing as it can mean genuine efficiency.
// ============================================================================

export function buildTimeManagementTrend(entries: MockHistoryEntry[]): TimeManagementTrend {
  const avgTimeTrend = entries.map((e) => ({ attempt_id: e.attempt_id, date: e.completed_at, mock_name: e.mock_name, value: e.avg_time_per_question_sec }));
  const wastedTrend = entries.map((e) => ({
    attempt_id: e.attempt_id,
    date: e.completed_at,
    mock_name: e.mock_name,
    value: Math.round((e.time_wasted_on_unattempted_sec / 60) * 10) / 10,
  }));

  if (entries.length < 2) {
    return {
      avg_time_per_question_trend: avgTimeTrend,
      wasted_time_trend: wastedTrend,
      improving: false,
      detail: "Complete at least two mocks to see a time-management trend.",
    };
  }

  const latest = entries[entries.length - 1];
  const priorWasted = entries.slice(0, -1).map((e) => e.time_wasted_on_unattempted_sec);
  const priorAvgWasted = priorWasted.reduce((a, b) => a + b, 0) / priorWasted.length;

  const improving = latest.time_wasted_on_unattempted_sec < priorAvgWasted;
  const latestMin = Math.round((latest.time_wasted_on_unattempted_sec / 60) * 10) / 10;
  const priorMin = Math.round((priorAvgWasted / 60) * 10) / 10;

  return {
    avg_time_per_question_trend: avgTimeTrend,
    wasted_time_trend: wastedTrend,
    improving,
    detail: `Your most recent mock wasted ${latestMin} minutes on unattempted questions, versus an average of ${priorMin} minutes across your earlier mocks.`,
  };
}
