import { Attempt, DifficultyPerformanceStat, Question, QuestionScoreDetail, TopicStat } from "../types";

// ============================================================================
// TOPIC & SUBTOPIC ANALYTICS
// Pure aggregation over data that already exists: Question.topic/subtopic,
// ScoreSummary.question_details (outcome + marks), and Attempt.responses
// (time_spent_sec). No new data collection, just grouping and math.
// ============================================================================

interface GroupKey {
  section: string;
  topic: string;
  subtopic?: string;
}

function aggregate(questions: Question[], attempt: Attempt, details: QuestionScoreDetail[], keyOf: (q: Question) => GroupKey): TopicStat[] {
  const detailByQid = new Map(details.map((d) => [d.question_id, d]));
  const groups = new Map<string, { key: GroupKey; questions: Question[] }>();

  for (const q of questions) {
    const key = keyOf(q);
    const groupKey = `${key.section}::${key.topic}::${key.subtopic ?? ""}`;
    if (!groups.has(groupKey)) groups.set(groupKey, { key, questions: [] });
    groups.get(groupKey)!.questions.push(q);
  }

  const stats: TopicStat[] = [];
  for (const { key, questions: groupQuestions } of groups.values()) {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let attemptedTime = 0;
    let scoreContribution = 0;
    let attemptedCount = 0;

    for (const q of groupQuestions) {
      const detail = detailByQid.get(q.question_id);
      const response = attempt.responses[q.question_id];
      const timeSpent = response?.time_spent_sec ?? 0;
      if (!detail) continue;
      scoreContribution += detail.marks_awarded;
      if (detail.outcome === "correct") {
        correct += 1;
        attemptedCount += 1;
        attemptedTime += timeSpent;
      } else if (detail.outcome === "incorrect") {
        incorrect += 1;
        attemptedCount += 1;
        attemptedTime += timeSpent;
      } else {
        unattempted += 1;
      }
    }

    stats.push({
      section: key.section as TopicStat["section"],
      topic: key.topic,
      subtopic: key.subtopic,
      attempts: attemptedCount,
      correct,
      incorrect,
      unattempted,
      accuracy_pct: attemptedCount > 0 ? round2((correct / attemptedCount) * 100) : 0,
      // Average time is over ATTEMPTED questions only, so it stays comparable with
      // accuracy — diluting it with skipped questions would understate how long the
      // ones you actually engaged with really took.
      avg_time_sec: attemptedCount > 0 ? Math.round(attemptedTime / attemptedCount) : 0,
      score_contribution: scoreContribution,
    });
  }

  // Sort by attempts descending, so the most-engaged-with topics surface first.
  return stats.sort((a, b) => b.attempts - a.attempts || a.topic.localeCompare(b.topic));
}

export function buildTopicStats(questions: Question[], attempt: Attempt, details: QuestionScoreDetail[]): TopicStat[] {
  return aggregate(questions, attempt, details, (q) => ({ section: q.section, topic: q.topic }));
}

export function buildSubtopicStats(questions: Question[], attempt: Attempt, details: QuestionScoreDetail[]): TopicStat[] {
  return aggregate(questions, attempt, details, (q) => ({ section: q.section, topic: q.topic, subtopic: q.subtopic }));
}

export function buildDifficultyPerformance(questions: Question[], attempt: Attempt, details: QuestionScoreDetail[]): DifficultyPerformanceStat[] {
  const detailByQid = new Map(details.map((d) => [d.question_id, d]));
  const order: DifficultyPerformanceStat["difficulty"][] = ["Easy", "Easy-Moderate", "Moderate", "Moderate-Hard", "Hard"];

  return order
    .map((difficulty) => {
      const groupQuestions = questions.filter((q) => q.difficulty === difficulty);
      let correct = 0;
      let incorrect = 0;
      let attemptedTime = 0;
      let attempts = 0;

      for (const q of groupQuestions) {
        const detail = detailByQid.get(q.question_id);
        if (!detail || detail.outcome === "unattempted") continue;
        const response = attempt.responses[q.question_id];
        attemptedTime += response?.time_spent_sec ?? 0;
        attempts += 1;
        if (detail.outcome === "correct") correct += 1;
        else incorrect += 1;
      }

      return {
        difficulty,
        attempts,
        correct,
        incorrect,
        accuracy_pct: attempts > 0 ? round2((correct / attempts) * 100) : 0,
        avg_time_sec: attempts > 0 ? Math.round(attemptedTime / attempts) : 0,
      };
    })
    .filter((stat) => questions.some((q) => q.difficulty === stat.difficulty));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
