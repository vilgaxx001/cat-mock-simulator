// ============================================================================
// CORE DATA MODEL
// Shared between server and (via copy) client. Kept dependency-free so it can
// be reused anywhere without pulling in Express or Node types.
// ============================================================================

export type SectionName = "VARC" | "DILR" | "QA";

export type QuestionType = "MCQ" | "TITA";

export type Difficulty =
  | "Easy"
  | "Easy-Moderate"
  | "Moderate"
  | "Moderate-Hard"
  | "Hard";

export interface Question {
  question_id: string;
  section: SectionName;
  topic: string;
  subtopic: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  question_text: string;
  /** Only present for MCQ. Always exactly 4 options, index 0-3. */
  options?: string[];
  /** For MCQ: index into options (0-3) as a string, e.g. "2". For TITA: the exact numeric/text answer. */
  correct_answer: string;
  explanation: string;
  marks: number;
  negative_marks: number;
  estimated_time_sec: number;
  /** Groups questions that share a DILR set (table/chart/caselet). */
  set_id?: string;
  /** Groups questions that share a VARC RC passage. */
  passage_id?: string;
  /** Optional image/diagram reference (path or data URI). */
  image?: string;
}

/** A DILR set or VARC passage — the shared stimulus multiple questions attach to. */
export interface QuestionGroup {
  group_id: string; // matches set_id or passage_id
  section: SectionName;
  title: string;
  /** Markdown-ish plain text; tables are rendered from `table` below, not inlined here. */
  stimulus_text: string;
  /** Optional structured table data for DILR sets. */
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  /** Editorial estimate of how "worth it" this set/passage is — surfaces the
   * CAT set-selection strategy layer in the UI (e.g. palette grouping hints). */
  difficulty: Difficulty;
  estimated_time_sec: number;
}

export interface SectionConfig {
  name: SectionName;
  question_count: number;
  duration_min: number;
  /** Order in which sections are presented / locked. 0-based. */
  order: number;
}

export interface MarkingScheme {
  mcq: { correct: number; incorrect: number; unattempted: number };
  tita: { correct: number; incorrect: number; unattempted: number };
}

export interface ExamConfig {
  config_id: string;
  name: string;
  sections: SectionConfig[];
  marking: MarkingScheme;
  section_locking: boolean;
  /** If true, once a section's timer ends the exam auto-advances without user action. */
  auto_advance: boolean;
  /** CAT authenticity rule: real CAT never lets you leave a section early, even if
   * you've answered everything. Default false. Kept configurable in case a future
   * pattern (or a practice-mode variant) wants to relax this. */
  allow_early_section_submit: boolean;
  /** Seconds before a section's end at which the UI shows a time warning. */
  warning_threshold_sec: number;
}

export interface MockDefinition {
  mock_id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  config_id: string;
  /** Ordered question_ids per section, fixed at mock-creation time. */
  question_ids: Record<SectionName, string[]>;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Attempt state — everything captured while a candidate is taking (or has
// taken) a mock.
// ----------------------------------------------------------------------------

export type VisitState = "not_visited" | "visited_unanswered" | "answered" | "marked_review" | "answered_marked_review";

export type AttemptStatus = "not_started" | "in_progress" | "submitted";

export interface ResponseRecord {
  question_id: string;
  selected_answer: string | null;
  final_answer: string | null;
  visit_state: VisitState;
  visit_count: number;
  time_spent_sec: number;
  /** Timestamp (ms) the question was last opened, used to accrue time_spent_sec accurately. */
  last_opened_at: number | null;
  /** How many times the candidate committed a different non-null answer than the one
   * previously committed (via Save & Next or Mark for Review & Next). The very first
   * answer doesn't count as a "change" — only switching between two different answers
   * does. Used by analytics to flag indecision/second-guessing patterns. */
  answer_change_count: number;
}

export interface SectionTimerState {
  section: SectionName;
  /** epoch ms when this section started counting down. Null until reached. */
  started_at: number | null;
  duration_sec: number;
  /** epoch ms when the section was actually submitted/closed. */
  ended_at: number | null;
}

export interface Attempt {
  attempt_id: string;
  mock_id: string;
  config_id: string;
  status: AttemptStatus;
  current_section: SectionName | null;
  /** Sections that have been closed and can no longer be accessed. */
  completed_sections: SectionName[];
  section_timers: Record<SectionName, SectionTimerState>;
  responses: Record<string, ResponseRecord>;
  created_at: string;
  submitted_at: string | null;
}

// ----------------------------------------------------------------------------
// Scoring & analytics output shapes
// ----------------------------------------------------------------------------

export interface QuestionScoreDetail {
  question_id: string;
  section: SectionName;
  topic: string;
  difficulty: Difficulty;
  question_type: QuestionType;
  outcome: "correct" | "incorrect" | "unattempted";
  marks_awarded: number;
  time_spent_sec: number;
}

export interface SectionScore {
  section: SectionName;
  attempts: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  raw_score: number;
  accuracy_pct: number;
  attempt_rate_pct: number;
}

export interface ScoreSummary {
  attempt_id: string;
  overall_raw_score: number;
  sections: SectionScore[];
  question_details: QuestionScoreDetail[];
  total_attempts: number;
  total_correct: number;
  total_incorrect: number;
  total_unattempted: number;
  overall_accuracy_pct: number;
  overall_attempt_rate_pct: number;
}

// ----------------------------------------------------------------------------
// ANALYTICS — percentile estimation, topic/time/section breakdowns, insights,
// and attempt-comparison. Entirely additive: nothing here is read by the exam
// engine, timer, or scoring engine. Computed once, after submission, from the
// existing Attempt + Question[] + ScoreSummary — no new persisted state beyond
// ResponseRecord.answer_change_count above.
// ----------------------------------------------------------------------------

export type ConfidenceLevel = "Low" | "Medium" | "High";

/** Always an ESTIMATE — never presented as an official CAT percentile anywhere
 * this type is used. See server/src/analytics/percentileModel.ts for the
 * disclaimer this is built around. */
export interface PercentileEstimate {
  estimate: number;
  range: [number, number];
  confidence: ConfidenceLevel;
}

export type PerformanceClassification = "Excellent" | "Good" | "Average" | "Needs Improvement";

export interface SectionPerformance {
  section: SectionName;
  raw_score: number;
  max_possible_score: number;
  percentile: PercentileEstimate;
  classification: PerformanceClassification;
}

export interface DifficultyProfileEntry {
  difficulty: Difficulty;
  count: number;
}

export interface TopicStat {
  section: SectionName;
  topic: string;
  /** Present only on subtopic-level entries; absent on topic-level rollups. */
  subtopic?: string;
  attempts: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy_pct: number;
  avg_time_sec: number;
  score_contribution: number;
}

export interface QuestionTimeFlag {
  question_id: string;
  section: SectionName;
  topic: string;
  time_spent_sec: number;
  marks_awarded: number;
}

export interface GroupTimeStat {
  group_id: string;
  section: SectionName;
  title: string;
  estimated_time_sec: number;
  actual_time_sec: number;
  marks_earned: number;
  questions_in_group: number;
  questions_attempted: number;
}

export interface TimeAnalytics {
  over_2min_count: number;
  over_3min_count: number;
  over_4min_count: number;
  fast_correct: QuestionTimeFlag[];
  slow_correct: QuestionTimeFlag[];
  slow_incorrect: QuestionTimeFlag[];
  time_wasted_on_unattempted_sec: number;
  time_by_section: Partial<Record<SectionName, number>>;
  time_by_topic: { section: SectionName; topic: string; time_sec: number }[];
  group_time: GroupTimeStat[];
}

export interface Insight {
  type: "strength" | "weakness" | "time_leak" | "limiting_section" | "recommendation";
  title: string;
  detail: string;
}

export interface ComparisonSnapshot {
  attempt_id: string;
  mock_id: string;
  completed_at: string;
  overall_raw_score: number;
  overall_accuracy_pct: number;
  overall_attempts: number;
  section_scores: Partial<Record<SectionName, number>>;
}

export interface ComparisonResult {
  current: ComparisonSnapshot;
  previous: ComparisonSnapshot | null;
  deltas: {
    overall_raw_score: number;
    overall_accuracy_pct: number;
    overall_attempts: number;
    section_scores: Partial<Record<SectionName, number>>;
  } | null;
}

export interface AnalyticsResult {
  overall_percentile: PercentileEstimate;
  calibration_factor: number;
  difficulty_profile: DifficultyProfileEntry[];
  difficulty_performance: DifficultyPerformanceStat[];
  sections: SectionPerformance[];
  topic_stats: TopicStat[];
  subtopic_stats: TopicStat[];
  time: TimeAnalytics;
  insights: Insight[];
  comparison: ComparisonResult;
  type_breakdown: TypeBreakdown;
  time_summary: TimeSummary;
  priority_areas: PriorityArea[];
  verdict: string;
}

export interface DifficultyPerformanceStat {
  difficulty: Difficulty;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy_pct: number;
  avg_time_sec: number;
}

// ----------------------------------------------------------------------------
// MOCK HISTORY & PROGRESS INTELLIGENCE
// Nothing here is persisted separately — every field is recomputed on demand
// from the same Attempt records attemptRepository already stores, using the
// same scoring/analytics functions a single result page uses. This avoids a
// second source of truth that could drift from the attempts themselves, and
// means "never overwrite previous attempts" is automatically satisfied: there
// is nothing to overwrite, only attempts to read.
// ----------------------------------------------------------------------------

export interface MockHistoryEntry {
  attempt_id: string;
  mock_id: string;
  mock_name: string;
  completed_at: string;
  raw_score: number;
  max_possible_score: number;
  estimated_percentile: number;
  percentile_confidence: ConfidenceLevel;
  section_scores: Partial<Record<SectionName, number>>;
  section_percentiles: Partial<Record<SectionName, number>>;
  total_attempts: number;
  total_correct: number;
  total_incorrect: number;
  total_unattempted: number;
  accuracy_pct: number;
  avg_time_per_question_sec: number;
  section_time_sec: Partial<Record<SectionName, number>>;
  time_wasted_on_unattempted_sec: number;
}

export interface TrendPoint {
  attempt_id: string;
  date: string;
  mock_name: string;
  value: number;
}

export interface TrendSeries {
  raw_score: TrendPoint[];
  percentile: TrendPoint[];
  accuracy: TrendPoint[];
  avg_time_per_question: TrendPoint[];
  section: Partial<Record<SectionName, TrendPoint[]>>;
}

export interface ImprovementNote {
  title: string;
  detail: string;
  positive: boolean;
}

export interface ConsistencyScore {
  score: number;
  components: {
    score_stability: number;
    section_balance: number;
    accuracy_stability: number;
  };
  mocks_considered: number;
}

export interface TopicTrend {
  section: SectionName;
  topic: string;
  mocks_seen: number;
  combined_attempts: number;
  avg_accuracy_pct: number;
  avg_time_sec: number;
}

export interface TimeManagementTrend {
  avg_time_per_question_trend: TrendPoint[];
  wasted_time_trend: TrendPoint[];
  improving: boolean;
  detail: string;
}

export interface Recommendation {
  rank: number;
  section: SectionName;
  topic: string;
  reason: string;
}

export interface PersonalBestRecord {
  value: number;
  attempt_id: string;
  mock_name: string;
  date: string;
}

export interface PersonalBests {
  best_raw_score: PersonalBestRecord | null;
  best_percentile: PersonalBestRecord | null;
  best_accuracy: PersonalBestRecord | null;
  best_section: Partial<Record<SectionName, PersonalBestRecord>>;
}

export interface StreakInfo {
  mocks_completed: number;
  current_week_count: number;
  current_month_count: number;
  weekly_streak_weeks: number;
}

export interface MockHistoryPayload {
  entries: MockHistoryEntry[];
  trends: TrendSeries;
  improvements: ImprovementNote[];
  consistency: ConsistencyScore | null;
  weak_topics: TopicTrend[];
  strong_topics: TopicTrend[];
  time_management: TimeManagementTrend;
  recommendations: Recommendation[];
  personal_bests: PersonalBests;
  streak: StreakInfo;
}

// ----------------------------------------------------------------------------
// INSTANT RESULT ENGINE — the "first impression" pieces of a freshly-submitted
// attempt: MCQ/TITA right-wrong breakdown, exam-clock time usage, this
// attempt's priority topics (distinct from history's multi-mock recurring
// weaknesses), and one short evidence-based verdict sentence. All computed
// from data buildAnalytics() already has — none of it touches scoring.
// ----------------------------------------------------------------------------

export interface TypeBreakdown {
  mcq: { correct: number; incorrect: number; unattempted: number };
  tita: { correct: number; incorrect: number; unattempted: number };
}

export interface TimeSummary {
  total_allotted_sec: number;
  total_used_sec: number;
  time_remaining_sec: number;
  submitted_early: boolean;
}

export interface PriorityArea {
  rank: number;
  section: SectionName;
  topic: string;
  accuracy_pct: number;
  attempts: number;
  reason: string;
}
