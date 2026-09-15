// ============================================================================
// RESULT CACHE
// A submitted attempt is immutable — its responses, timers, and score can
// never change again. That makes its computed result (score + analytics +
// review) a perfect candidate for caching: compute once, serve instantly on
// every subsequent request (refresh, revisiting the result page, PDF export,
// etc.) without recomputing scoring/analytics from scratch each time.
//
// Deliberately simple: an in-memory Map, no eviction policy. For a
// single-user local tool this is more than sufficient, and it resets cleanly
// on server restart along with nothing else needing to change.
// ============================================================================

const cache = new Map<string, unknown>();

export function getCachedResult<T>(attemptId: string): T | undefined {
  return cache.get(attemptId) as T | undefined;
}

export function setCachedResult<T>(attemptId: string, result: T): void {
  cache.set(attemptId, result);
}
