import { Attempt, ExamConfig, SectionName } from "../types";

// ============================================================================
// TIMER ENGINE
// The one rule that matters: NEVER trust a duration reported by the client.
// Every "time remaining" figure is derived by subtracting a stored epoch-ms
// `started_at` timestamp from `Date.now()` on the server, at the moment of
// the request. This means:
//   - A page refresh loses nothing: the client just re-asks the server "how
//     much time is left?" and gets the correct answer.
//   - A client that fakes its own clock, pauses its JS timer, or replays an
//     old response cannot extend a section — the server's Date.now() is the
//     only clock that counts for expiry decisions.
//   - Section expiry is enforced on every mutating request (see routes),
//     not just by a client-side countdown hitting zero.
// ============================================================================

export function secondsRemaining(attempt: Attempt, section: SectionName, nowMs: number = Date.now()): number {
  const timer = attempt.section_timers[section];
  if (!timer || timer.started_at === null) return timer?.duration_sec ?? 0;
  if (timer.ended_at !== null) return 0;
  const elapsedSec = Math.floor((nowMs - timer.started_at) / 1000);
  return Math.max(0, timer.duration_sec - elapsedSec);
}

export function isSectionExpired(attempt: Attempt, section: SectionName, nowMs: number = Date.now()): boolean {
  return secondsRemaining(attempt, section, nowMs) <= 0 && attempt.section_timers[section]?.started_at !== null;
}

export function isInWarningWindow(attempt: Attempt, section: SectionName, config: ExamConfig, nowMs: number = Date.now()): boolean {
  const remaining = secondsRemaining(attempt, section, nowMs);
  return remaining > 0 && remaining <= config.warning_threshold_sec;
}

/** Starts a section's clock if it hasn't started yet. Idempotent. */
export function ensureSectionStarted(attempt: Attempt, section: SectionName, nowMs: number = Date.now()): void {
  const timer = attempt.section_timers[section];
  if (timer && timer.started_at === null) {
    timer.started_at = nowMs;
  }
}

export function closeSectionTimer(attempt: Attempt, section: SectionName, nowMs: number = Date.now()): void {
  const timer = attempt.section_timers[section];
  if (timer && timer.ended_at === null) {
    timer.ended_at = nowMs;
  }
}
