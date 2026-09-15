import { Insight, SectionPerformance, TimeAnalytics, TopicStat } from "../types";

// ============================================================================
// INSIGHT GENERATOR
// Every insight here is built by reading a specific number out of the topic/
// time/section analytics already computed — never a canned phrase. If the
// data doesn't support a particular insight (e.g. too few attempts to call
// anything a "strength"), that insight is simply omitted rather than filled
// with a generic placeholder.
// ============================================================================

const MIN_ATTEMPTS_FOR_TOPIC_VERDICT = 2;

export function buildInsights(topicStats: TopicStat[], time: TimeAnalytics, sections: SectionPerformance[]): Insight[] {
  const insights: Insight[] = [];

  const eligibleTopics = topicStats.filter((t) => t.attempts >= MIN_ATTEMPTS_FOR_TOPIC_VERDICT);

  const strongest = [...eligibleTopics].sort((a, b) => b.accuracy_pct - a.accuracy_pct || b.attempts - a.attempts)[0];
  if (strongest && strongest.accuracy_pct >= 70) {
    insights.push({
      type: "strength",
      title: `Strongest area: ${strongest.section} — ${strongest.topic}`,
      detail: `${strongest.correct} of ${strongest.attempts} attempted correct (${strongest.accuracy_pct}% accuracy), contributing ${strongest.score_contribution} marks.`,
    });
  }

  const weakest = [...eligibleTopics].sort((a, b) => a.accuracy_pct - b.accuracy_pct || b.attempts - a.attempts)[0];
  if (weakest && weakest.accuracy_pct <= 50 && weakest !== strongest) {
    insights.push({
      type: "weakness",
      title: `Biggest weakness: ${weakest.section} — ${weakest.topic}`,
      detail: `Only ${weakest.correct} of ${weakest.attempts} attempted correct (${weakest.accuracy_pct}% accuracy). ${weakest.incorrect} incorrect cost ${Math.abs(
        Math.min(0, weakest.score_contribution)
      )} marks in negative marking alone.`,
    });
  }

  // Time leak: the group (set/passage) with the worst ratio of time spent to marks
  // earned, among groups where meaningful time was actually spent.
  const timeLeakCandidates = time.group_time.filter((g) => g.actual_time_sec >= 300);
  const worstLeak = [...timeLeakCandidates].sort((a, b) => a.marks_earned / Math.max(a.actual_time_sec, 1) - b.marks_earned / Math.max(b.actual_time_sec, 1))[0];
  if (worstLeak) {
    const minutes = Math.round((worstLeak.actual_time_sec / 60) * 10) / 10;
    insights.push({
      type: "time_leak",
      title: `Time leak: ${worstLeak.title}`,
      detail: `You spent ${minutes} minutes on this set (estimated ${Math.round(worstLeak.estimated_time_sec / 60)} min) across ${worstLeak.questions_attempted} of ${
        worstLeak.questions_in_group
      } questions attempted, and earned ${worstLeak.marks_earned} marks.`,
    });
  }

  // Slow + incorrect questions as a group insight, if there are enough to matter.
  if (time.slow_incorrect.length >= 2) {
    const totalTime = time.slow_incorrect.reduce((sum, q) => sum + q.time_spent_sec, 0);
    const totalMarks = time.slow_incorrect.reduce((sum, q) => sum + q.marks_awarded, 0);
    insights.push({
      type: "time_leak",
      title: `${time.slow_incorrect.length} questions were both slow and wrong`,
      detail: `You spent ${Math.round((totalTime / 60) * 10) / 10} minutes on these and still lost marks (net ${totalMarks}). Recognizing when to cut losses on a question is worth practicing.`,
    });
  }

  // Limiting section: the section with the lowest sectional percentile estimate.
  const limitingSection = [...sections].sort((a, b) => a.percentile.estimate - b.percentile.estimate)[0];
  if (limitingSection && sections.length > 1) {
    insights.push({
      type: "limiting_section",
      title: `${limitingSection.section} is currently your limiting section`,
      detail: `Estimated ${limitingSection.percentile.estimate} percentile in ${limitingSection.section} (${limitingSection.classification}), versus ${sections
        .filter((s) => s.section !== limitingSection.section)
        .map((s) => `${s.percentile.estimate} in ${s.section}`)
        .join(", ")}.`,
    });
  }

  // Unattempted time waste, if substantial.
  if (time.time_wasted_on_unattempted_sec >= 180) {
    const minutes = Math.round((time.time_wasted_on_unattempted_sec / 60) * 10) / 10;
    insights.push({
      type: "recommendation",
      title: "Time spent without an answer to show for it",
      detail: `${minutes} minutes went into questions you ultimately left unattempted. Deciding to skip earlier would recover that time for questions you do answer.`,
    });
  }

  return insights;
}
