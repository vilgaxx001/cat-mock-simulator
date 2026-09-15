import { MockHistoryEntry, PersonalBestRecord, PersonalBests, SectionName } from "../../types";

export function buildPersonalBests(entries: MockHistoryEntry[]): PersonalBests {
  if (entries.length === 0) {
    return { best_raw_score: null, best_percentile: null, best_accuracy: null, best_section: {} };
  }

  const toRecord = (e: MockHistoryEntry, value: number): PersonalBestRecord => ({
    value,
    attempt_id: e.attempt_id,
    mock_name: e.mock_name,
    date: e.completed_at,
  });

  const bestRawScore = entries.reduce((best, e) => (e.raw_score > best.raw_score ? e : best));
  const bestPercentile = entries.reduce((best, e) => (e.estimated_percentile > best.estimated_percentile ? e : best));
  const bestAccuracy = entries.reduce((best, e) => (e.accuracy_pct > best.accuracy_pct ? e : best));

  const bestSection: PersonalBests["best_section"] = {};
  const sections: SectionName[] = ["VARC", "DILR", "QA"];
  for (const section of sections) {
    const withSection = entries.filter((e) => e.section_scores[section] !== undefined);
    if (withSection.length === 0) continue;
    const best = withSection.reduce((b, e) => ((e.section_scores[section] as number) > (b.section_scores[section] as number) ? e : b));
    bestSection[section] = toRecord(best, best.section_scores[section] as number);
  }

  return {
    best_raw_score: toRecord(bestRawScore, bestRawScore.raw_score),
    best_percentile: toRecord(bestPercentile, bestPercentile.estimated_percentile),
    best_accuracy: toRecord(bestAccuracy, bestAccuracy.accuracy_pct),
    best_section: bestSection,
  };
}
