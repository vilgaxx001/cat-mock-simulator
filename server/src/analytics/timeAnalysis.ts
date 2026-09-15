import { Attempt, GroupTimeStat, Question, QuestionGroup, QuestionScoreDetail, SectionName, TimeAnalytics } from "../types";

// ============================================================================
// TIME ANALYTICS
// Everything here is derived from Attempt.responses[*].time_spent_sec, which
// the exam engine already accrues accurately (timestamp-based, see
// examEngine.visitQuestion / finalizeSubmission) — no new tracking needed,
// just analysis of data that already exists.
// ============================================================================

const FAST_CORRECT_THRESHOLD_SEC = 60;
const SLOW_THRESHOLD_SEC = 150; // 2.5 min — "slow" for either a correct or incorrect answer

export function buildTimeAnalytics(
  questions: Question[],
  attempt: Attempt,
  details: QuestionScoreDetail[],
  groups: QuestionGroup[]
): TimeAnalytics {
  const detailByQid = new Map(details.map((d) => [d.question_id, d]));

  let over2 = 0;
  let over3 = 0;
  let over4 = 0;
  let wastedOnUnattempted = 0;
  const fastCorrect: TimeAnalytics["fast_correct"] = [];
  const slowCorrect: TimeAnalytics["slow_correct"] = [];
  const slowIncorrect: TimeAnalytics["slow_incorrect"] = [];
  const timeBySection: Partial<Record<SectionName, number>> = {};
  const timeByTopicMap = new Map<string, { section: SectionName; topic: string; time_sec: number }>();

  for (const q of questions) {
    const response = attempt.responses[q.question_id];
    const timeSpent = response?.time_spent_sec ?? 0;
    const detail = detailByQid.get(q.question_id);

    if (timeSpent > 120) over2 += 1;
    if (timeSpent > 180) over3 += 1;
    if (timeSpent > 240) over4 += 1;

    timeBySection[q.section] = (timeBySection[q.section] ?? 0) + timeSpent;
    const topicKey = `${q.section}::${q.topic}`;
    const existing = timeByTopicMap.get(topicKey);
    if (existing) existing.time_sec += timeSpent;
    else timeByTopicMap.set(topicKey, { section: q.section, topic: q.topic, time_sec: timeSpent });

    if (!detail) continue;

    if (detail.outcome === "unattempted") {
      wastedOnUnattempted += timeSpent;
      continue;
    }

    const flag = { question_id: q.question_id, section: q.section, topic: q.topic, time_spent_sec: timeSpent, marks_awarded: detail.marks_awarded };

    if (detail.outcome === "correct") {
      if (timeSpent > 0 && timeSpent <= FAST_CORRECT_THRESHOLD_SEC) fastCorrect.push(flag);
      else if (timeSpent >= SLOW_THRESHOLD_SEC) slowCorrect.push(flag);
    } else if (detail.outcome === "incorrect" && timeSpent >= SLOW_THRESHOLD_SEC) {
      slowIncorrect.push(flag);
    }
  }

  const groupTime = buildGroupTimeStats(questions, attempt, details, groups);

  return {
    over_2min_count: over2,
    over_3min_count: over3,
    over_4min_count: over4,
    fast_correct: fastCorrect.sort((a, b) => a.time_spent_sec - b.time_spent_sec),
    slow_correct: slowCorrect.sort((a, b) => b.time_spent_sec - a.time_spent_sec),
    slow_incorrect: slowIncorrect.sort((a, b) => b.time_spent_sec - a.time_spent_sec),
    time_wasted_on_unattempted_sec: wastedOnUnattempted,
    time_by_section: timeBySection,
    time_by_topic: Array.from(timeByTopicMap.values()).sort((a, b) => b.time_sec - a.time_sec),
    group_time: groupTime,
  };
}

function buildGroupTimeStats(questions: Question[], attempt: Attempt, details: QuestionScoreDetail[], groups: QuestionGroup[]): GroupTimeStat[] {
  const detailByQid = new Map(details.map((d) => [d.question_id, d]));
  const stats: GroupTimeStat[] = [];

  for (const group of groups) {
    const groupQuestions = questions.filter((q) => (q.set_id ?? q.passage_id) === group.group_id);
    if (groupQuestions.length === 0) continue;

    let actualTime = 0;
    let marksEarned = 0;
    let attempted = 0;

    for (const q of groupQuestions) {
      const response = attempt.responses[q.question_id];
      actualTime += response?.time_spent_sec ?? 0;
      const detail = detailByQid.get(q.question_id);
      if (detail) {
        marksEarned += detail.marks_awarded;
        if (detail.outcome !== "unattempted") attempted += 1;
      }
    }

    stats.push({
      group_id: group.group_id,
      section: group.section,
      title: group.title,
      estimated_time_sec: group.estimated_time_sec,
      actual_time_sec: actualTime,
      marks_earned: marksEarned,
      questions_in_group: groupQuestions.length,
      questions_attempted: attempted,
    });
  }

  return stats.sort((a, b) => b.actual_time_sec - a.actual_time_sec);
}
