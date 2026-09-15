import { MockHistoryEntry, StreakInfo } from "../../types";

// ============================================================================
// STREAKS
// Deliberately minimal, per the spec's "keep it optional, don't gamify
// excessively" — three counts and one streak number, no badges, no levels.
// ============================================================================

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function buildStreakInfo(entries: MockHistoryEntry[]): StreakInfo {
  const now = new Date();
  const currentWeek = isoWeekKey(now);
  const currentMonth = monthKey(now);

  const weekSet = new Set(entries.map((e) => isoWeekKey(new Date(e.completed_at))));
  const currentWeekCount = entries.filter((e) => isoWeekKey(new Date(e.completed_at)) === currentWeek).length;
  const currentMonthCount = entries.filter((e) => monthKey(new Date(e.completed_at)) === currentMonth).length;

  let streak = 0;
  let cursor = now;
  while (weekSet.has(isoWeekKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }

  return {
    mocks_completed: entries.length,
    current_week_count: currentWeekCount,
    current_month_count: currentMonthCount,
    weekly_streak_weeks: streak,
  };
}
