import { Attempt, ExamConfig, TimeSummary } from "../types";

// ============================================================================
// TIME SUMMARY
// Reads the same section_timers the timer engine already maintains — total
// allotted is the sum of every section's configured duration; total used is
// the sum of each section's actual (ended_at - started_at), which can run a
// few seconds past the nominal duration due to the lag between a section
// expiring and the next request detecting it (expected and correct, not a
// bug — see timerEngine.ts).
//
// Under the current configs, every section only ever ends via timer expiry
// (allow_early_section_submit is false everywhere), so time_remaining_sec
// will normally be ~0 and submitted_early will normally be false. Both are
// still computed properly so they mean something the moment early submission
// is ever enabled.
// ============================================================================

const EARLY_SUBMIT_THRESHOLD_SEC = 5;

export function buildTimeSummary(attempt: Attempt, config: ExamConfig): TimeSummary {
  const totalAllotted = config.sections.reduce((sum, s) => sum + s.duration_min * 60, 0);

  let totalUsed = 0;
  for (const timer of Object.values(attempt.section_timers)) {
    if (timer.started_at !== null && timer.ended_at !== null) {
      totalUsed += Math.round((timer.ended_at - timer.started_at) / 1000);
    }
  }

  const remaining = Math.max(0, totalAllotted - totalUsed);

  return {
    total_allotted_sec: totalAllotted,
    total_used_sec: totalUsed,
    time_remaining_sec: remaining,
    submitted_early: remaining > EARLY_SUBMIT_THRESHOLD_SEC,
  };
}
