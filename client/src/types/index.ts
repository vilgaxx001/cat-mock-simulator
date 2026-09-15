export type SectionName = "VARC" | "DILR" | "QA";
export type QuestionType = "MCQ" | "TITA";
export type Difficulty = "Easy" | "Easy-Moderate" | "Moderate" | "Moderate-Hard" | "Hard";
export type VisitState = "not_visited" | "visited_unanswered" | "answered" | "marked_review" | "answered_marked_review";
export type AttemptStatus = "not_started" | "in_progress" | "submitted";
export type SaveAction = "save_next" | "mark_review_next" | "clear_response";

export interface CandidateQuestion {
  question_id: string;
  section: SectionName;
  topic: string;
  subtopic: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  question_text: string;
  options?: string[];
  marks: number;
  negative_marks: number;
  estimated_time_sec: number;
  set_id?: string;
  passage_id?: string;
  image?: string;
}

export interface QuestionGroup {
  group_id: string;
  section: SectionName;
  title: string;
  stimulus_text: string;
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  difficulty: Difficulty;
  estimated_time_sec: number;
}

export interface ResponseSummary {
  question_id: string;
  visit_state: VisitState;
  has_answer: boolean;
  selected_answer: string | null;
}

export interface AttemptView {
  attempt_id: string;
  status: AttemptStatus;
  current_section: SectionName | null;
  completed_sections: SectionName[];
  time_remaining_sec: number;
  in_warning_window: boolean;
  responses: ResponseSummary[];
  questions?: CandidateQuestion[];
  groups?: QuestionGroup[];
}

export interface MockSummary {
  mock_id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  question_counts: Record<SectionName, number>;
}

export interface SectionConfig {
  name: SectionName;
  question_count: number;
  duration_min: number;
  order: number;
}

export interface ExamConfig {
  config_id: string;
  name: string;
  sections: SectionConfig[];
  marking: {
    mcq: { correct: number; incorrect: number; unattempted: number };
    tita: { correct: number; incorrect: number; unattempted: number };
  };
  section_locking: boolean;
  auto_advance: boolean;
  allow_early_section_submit: boolean;
  warning_threshold_sec: number;
}

export interface MockDetail {
  mock: { mock_id: string; name: string; description: string; difficulty: Difficulty };
  config: ExamConfig;
  instructions: string[];
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
  total_attempts: number;
  total_correct: number;
  total_incorrect: number;
  total_unattempted: number;
  overall_accuracy_pct: number;
  overall_attempt_rate_pct: number;
}

export interface QuestionReviewItem {
  question_id: string;
  section: SectionName;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  your_answer: string | null;
  correct_answer: string;
  explanation: string;
  outcome: "correct" | "incorrect" | "unattempted";
  marks_awarded: number;
  time_spent_sec: number;
  set_id: string | null;
  was_marked_for_review: boolean;
  answer_change_count: number;
}

// ----------------------------------------------------------------------------
// Analytics — mirrors server/src/types/index.ts's analytics section exactly.
// ----------------------------------------------------------------------------

export type ConfidenceLevel = "Low" | "Medium" | "High";

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

export interface DifficultyPerformanceStat {
  difficulty: Difficulty;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy_pct: number;
  avg_time_sec: number;
}

export interface TopicStat {
  section: SectionName;
  topic: string;
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

export interface ResultPayload {
  score: ScoreSummary;
  question_review: QuestionReviewItem[];
  groups: QuestionGroup[];
  analytics: AnalyticsResult;
  mock_name: string;
  submitted_at: string | null;
}

// ----------------------------------------------------------------------------
// Mock History & Progress Intelligence — mirrors server/src/types/index.ts.
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
