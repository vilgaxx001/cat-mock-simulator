import { ExamConfig } from "../types";

// ============================================================================
// EXAM CONFIGURATION
// This is the ONLY place section counts, durations, and marking rules live.
// Nothing in the engine, UI, or scoring code hard-codes "24 questions" or
// "+3/-1" — they all read from this object (or one shaped like it). When the
// official CAT pattern changes, this is the only file that needs to change.
//
// PILOT NOTE: QA, DILR, and VARC are all now fully built (see QA_PILOT_CONFIG,
// DILR_PILOT_CONFIG, and VARC_PILOT_CONFIG below). Each pilot config is
// independent and untouched by the others' work — the full 3-section
// DEFAULT_EXAM_CONFIG below is not yet used by any mock; that's the next
// integration step once all three pilots are individually verified.
// ============================================================================

export const DEFAULT_EXAM_CONFIG: ExamConfig = {
  config_id: "cat-2026-default",
  name: "CAT 2026 Standard Pattern",
  sections: [
    { name: "VARC", question_count: 24, duration_min: 40, order: 0 },
    { name: "DILR", question_count: 22, duration_min: 40, order: 1 },
    { name: "QA", question_count: 22, duration_min: 40, order: 2 },
  ],
  marking: {
    mcq: { correct: 3, incorrect: -1, unattempted: 0 },
    tita: { correct: 3, incorrect: 0, unattempted: 0 },
  },
  section_locking: true,
  auto_advance: true,
  allow_early_section_submit: false, // real CAT: you cannot leave a section before its time is up
  warning_threshold_sec: 5 * 60, // 5-minute warning, matches real CBT convention
};

/**
 * PILOT CONFIG: QA-only, used until VARC/DILR content lands. Same shape as
 * DEFAULT_EXAM_CONFIG so swapping between them requires no engine changes —
 * that's the point of keeping this config-driven.
 */
export const QA_PILOT_CONFIG: ExamConfig = {
  config_id: "cat-2026-qa-pilot",
  name: "CAT 2026 — QA Section Pilot",
  sections: [{ name: "QA", question_count: 22, duration_min: 40, order: 0 }],
  marking: {
    mcq: { correct: 3, incorrect: -1, unattempted: 0 },
    tita: { correct: 3, incorrect: 0, unattempted: 0 },
  },
  section_locking: true,
  auto_advance: true,
  allow_early_section_submit: false,
  warning_threshold_sec: 5 * 60,
};

/**
 * PILOT CONFIG: DILR-only, same shape and marking rules as the QA pilot.
 * Kept as its own config (rather than reusing QA_PILOT_CONFIG's config_id)
 * so the two pilots stay fully independent — testing DILR can never affect
 * an in-progress or historical QA attempt.
 */
export const DILR_PILOT_CONFIG: ExamConfig = {
  config_id: "cat-2026-dilr-pilot",
  name: "CAT 2026 — DILR Section Pilot",
  sections: [{ name: "DILR", question_count: 22, duration_min: 40, order: 0 }],
  marking: {
    mcq: { correct: 3, incorrect: -1, unattempted: 0 },
    tita: { correct: 3, incorrect: 0, unattempted: 0 },
  },
  section_locking: true,
  auto_advance: true,
  allow_early_section_submit: false,
  warning_threshold_sec: 5 * 60,
};

/**
 * PILOT CONFIG: VARC-only, same shape and marking rules as the other pilots.
 * Its own config_id keeps it fully independent of the QA and DILR pilots.
 */
export const VARC_PILOT_CONFIG: ExamConfig = {
  config_id: "cat-2026-varc-pilot",
  name: "CAT 2026 — VARC Section Pilot",
  sections: [{ name: "VARC", question_count: 24, duration_min: 40, order: 0 }],
  marking: {
    mcq: { correct: 3, incorrect: -1, unattempted: 0 },
    tita: { correct: 3, incorrect: 0, unattempted: 0 },
  },
  section_locking: true,
  auto_advance: true,
  allow_early_section_submit: false,
  warning_threshold_sec: 5 * 60,
};
