import { MockDefinition } from "../types";
import { QA_QUESTIONS } from "./questions.qa";
import { DILR_QUESTIONS } from "./questions.dilr";
import { VARC_QUESTIONS } from "./questions.varc";
import { DEFAULT_EXAM_CONFIG, DILR_PILOT_CONFIG, QA_PILOT_CONFIG, VARC_PILOT_CONFIG } from "../config/examConfig";

// ============================================================================
// Once a mock is defined, its question set is fixed — the spec is explicit
// that questions must never change mid-attempt or between attempts of the
// same mock. VARC is still empty until that section is built; nothing
// downstream assumes it's non-empty.
//
// DILR-SET-* order below is deliberate: question_ids for DILR are listed set
// by set (all of Set 1, then all of Set 2, ...) rather than shuffled, so the
// palette and navigation naturally group each set's questions together —
// exactly how a real CAT DILR section presents itself.
// ============================================================================

export const MOCK_DEFINITIONS: MockDefinition[] = [
  {
    mock_id: "cat-mock-qa-pilot-01",
    name: "QA Section Pilot — Mock 01",
    description:
      "22-question Quantitative Ability pilot mock used to validate the exam engine (timer, navigation, scoring) before VARC and DILR content is added.",
    difficulty: "Moderate-Hard",
    config_id: QA_PILOT_CONFIG.config_id,
    question_ids: {
      VARC: [],
      DILR: [],
      QA: QA_QUESTIONS.map((q) => q.question_id),
    },
    created_at: new Date().toISOString(),
  },
  {
    mock_id: "cat-mock-dilr-pilot-01",
    name: "DILR Section Pilot — Mock 01",
    description:
      "22-question Data Interpretation & Logical Reasoning pilot mock across 6 independent sets of uneven difficulty, used to validate set/passage grouping in the exam engine.",
    difficulty: "Moderate-Hard",
    config_id: DILR_PILOT_CONFIG.config_id,
    question_ids: {
      VARC: [],
      DILR: DILR_QUESTIONS.map((q) => q.question_id),
      QA: [],
    },
    created_at: new Date().toISOString(),
  },
  {
    mock_id: "cat-mock-varc-pilot-01",
    name: "VARC Section Pilot — Mock 01",
    description:
      "24-question Verbal Ability & Reading Comprehension pilot mock across 4 RC passages of uneven difficulty plus 5 Verbal Ability questions, validating the same passage_id grouping mechanism DILR proved out.",
    difficulty: "Moderate-Hard",
    config_id: VARC_PILOT_CONFIG.config_id,
    question_ids: {
      VARC: VARC_QUESTIONS.map((q) => q.question_id),
      DILR: [],
      QA: [],
    },
    created_at: new Date().toISOString(),
  },
  {
    mock_id: "cat-mock-full-01",
    name: "CAT 2026 Full-Length Mock 01",
    description:
      "The complete 68-question, 120-minute CAT-style mock: VARC (24, 40 min) → DILR (22, 40 min) → QA (22, 40 min), one continuous timed exam with real section locking between all three.",
    difficulty: "Moderate-Hard",
    config_id: DEFAULT_EXAM_CONFIG.config_id,
    question_ids: {
      VARC: VARC_QUESTIONS.map((q) => q.question_id),
      DILR: DILR_QUESTIONS.map((q) => q.question_id),
      QA: QA_QUESTIONS.map((q) => q.question_id),
    },
    created_at: new Date().toISOString(),
  },
];

