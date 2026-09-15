import { ExamConfig, MockDefinition, Question, QuestionGroup, SectionName } from "../types";
import { QA_QUESTIONS } from "../data/questions.qa";
import { DILR_QUESTIONS } from "../data/questions.dilr";
import { DILR_GROUPS } from "../data/groups.dilr";
import { VARC_QUESTIONS } from "../data/questions.varc";
import { VARC_GROUPS } from "../data/groups.varc";
import { MOCK_DEFINITIONS } from "../data/mockDefinitions";
import { DEFAULT_EXAM_CONFIG, DILR_PILOT_CONFIG, QA_PILOT_CONFIG, VARC_PILOT_CONFIG } from "../config/examConfig";

// ============================================================================
// CONTENT REPOSITORY
// Everything "static" (questions, groups, mocks, configs) is read through
// this module rather than imported directly by routes/engine code. Today
// it's backed by in-memory TS arrays; swapping to a real database later
// means rewriting only this file — nothing else references the underlying
// storage.
// ============================================================================

const ALL_QUESTIONS: Question[] = [...QA_QUESTIONS, ...DILR_QUESTIONS, ...VARC_QUESTIONS];
const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.question_id, q]));
const ALL_GROUPS: QuestionGroup[] = [...DILR_GROUPS, ...VARC_GROUPS];
const GROUP_BY_ID = new Map(ALL_GROUPS.map((g) => [g.group_id, g]));
const CONFIG_BY_ID = new Map<string, ExamConfig>([
  [DEFAULT_EXAM_CONFIG.config_id, DEFAULT_EXAM_CONFIG],
  [QA_PILOT_CONFIG.config_id, QA_PILOT_CONFIG],
  [DILR_PILOT_CONFIG.config_id, DILR_PILOT_CONFIG],
  [VARC_PILOT_CONFIG.config_id, VARC_PILOT_CONFIG],
]);
const MOCK_BY_ID = new Map(MOCK_DEFINITIONS.map((m) => [m.mock_id, m]));

export function listMocks(): MockDefinition[] {
  return MOCK_DEFINITIONS;
}

export function getMock(mockId: string): MockDefinition | undefined {
  return MOCK_BY_ID.get(mockId);
}

export function getConfig(configId: string): ExamConfig | undefined {
  return CONFIG_BY_ID.get(configId);
}

export function getQuestion(questionId: string): Question | undefined {
  return QUESTION_BY_ID.get(questionId);
}

export function getQuestionsForMock(mockId: string, section?: SectionName): Question[] {
  const mock = getMock(mockId);
  if (!mock) return [];
  const sections: SectionName[] = section ? [section] : ["VARC", "DILR", "QA"];
  return sections.flatMap((s) => mock.question_ids[s].map((id) => QUESTION_BY_ID.get(id)!).filter(Boolean));
}

export function getGroup(groupId: string): QuestionGroup | undefined {
  return GROUP_BY_ID.get(groupId);
}

/** Returns the distinct set/passage groups referenced by the given questions, in first-appearance order. */
export function getGroupsForQuestions(questions: Question[]): QuestionGroup[] {
  const seen = new Set<string>();
  const groups: QuestionGroup[] = [];
  for (const q of questions) {
    const groupId = q.set_id ?? q.passage_id;
    if (!groupId || seen.has(groupId)) continue;
    const group = GROUP_BY_ID.get(groupId);
    if (group) {
      seen.add(groupId);
      groups.push(group);
    }
  }
  return groups;
}

/** Strips the fields a candidate must not see mid-attempt (answer + explanation). */
export function toCandidateView(q: Question) {
  const { correct_answer, explanation, ...rest } = q;
  return rest;
}
