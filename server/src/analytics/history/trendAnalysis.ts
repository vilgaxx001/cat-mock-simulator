import { MockHistoryEntry, SectionName, TrendSeries } from "../../types";

export function buildTrendSeries(entries: MockHistoryEntry[]): TrendSeries {
  const point = (e: MockHistoryEntry, value: number) => ({ attempt_id: e.attempt_id, date: e.completed_at, mock_name: e.mock_name, value });

  const section: TrendSeries["section"] = {};
  const sections: SectionName[] = ["VARC", "DILR", "QA"];
  for (const s of sections) {
    const pts = entries.filter((e) => e.section_scores[s] !== undefined).map((e) => point(e, e.section_scores[s] as number));
    if (pts.length > 0) section[s] = pts;
  }

  return {
    raw_score: entries.map((e) => point(e, e.raw_score)),
    percentile: entries.map((e) => point(e, e.estimated_percentile)),
    accuracy: entries.map((e) => point(e, e.accuracy_pct)),
    avg_time_per_question: entries.map((e) => point(e, e.avg_time_per_question_sec)),
    section,
  };
}
