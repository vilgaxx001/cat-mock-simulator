import { randomUUID } from "crypto";
import { Attempt, ExamConfig, MockDefinition, ResponseRecord, SectionName, SectionTimerState, VisitState } from "../types";
import { closeSectionTimer, ensureSectionStarted, isSectionExpired, secondsRemaining } from "./timerEngine";

// ============================================================================
// EXAM ENGINE
// Owns every state transition an attempt can go through. Routes call these
// functions and persist the result; nothing here talks to Express or the
// filesystem, so it's testable in isolation and reusable if the transport
// layer ever changes.
// ============================================================================

export function createAttempt(mock: MockDefinition, config: ExamConfig): Attempt {
  const orderedSections = [...config.sections].sort((a, b) => a.order - b.order).map((s) => s.name);

  const sectionTimers = {} as Record<SectionName, SectionTimerState>;
  for (const s of config.sections) {
    sectionTimers[s.name] = {
      section: s.name,
      started_at: null,
      duration_sec: s.duration_min * 60,
      ended_at: null,
    };
  }

  const responses: Record<string, ResponseRecord> = {};
  for (const section of orderedSections) {
    for (const qid of mock.question_ids[section]) {
      responses[qid] = {
        question_id: qid,
        selected_answer: null,
        final_answer: null,
        visit_state: "not_visited",
        visit_count: 0,
        time_spent_sec: 0,
        last_opened_at: null,
        answer_change_count: 0,
      };
    }
  }

  return {
    attempt_id: randomUUID(),
    mock_id: mock.mock_id,
    config_id: config.config_id,
    status: "not_started",
    current_section: null,
    completed_sections: [],
    section_timers: sectionTimers,
    responses,
    created_at: new Date().toISOString(),
    submitted_at: null,
  };
}

/** Called once, when the candidate clicks "Start Exam" past the instructions screen. */
export function beginAttempt(attempt: Attempt, config: ExamConfig, nowMs: number = Date.now()): Attempt {
  if (attempt.status !== "not_started") return attempt;
  const firstSection = [...config.sections].sort((a, b) => a.order - b.order)[0].name;
  attempt.status = "in_progress";
  attempt.current_section = firstSection;
  ensureSectionStarted(attempt, firstSection, nowMs);
  return attempt;
}

/**
 * Runs on every mutating request before anything else: if the active
 * section's clock has run out, close it and move to the next section (or
 * submit if it was the last one). This is what makes auto-submit reliable
 * even if the client never sends an explicit "time's up" signal — the very
 * next request the server receives will catch the expiry.
 */
export function checkAndAdvanceIfExpired(attempt: Attempt, config: ExamConfig, nowMs: number = Date.now()): Attempt {
  if (attempt.status !== "in_progress" || !attempt.current_section) return attempt;

  while (attempt.status === "in_progress" && attempt.current_section && isSectionExpired(attempt, attempt.current_section, nowMs)) {
    advanceSection(attempt, config, nowMs);
  }
  return attempt;
}

function advanceSection(attempt: Attempt, config: ExamConfig, nowMs: number): void {
  const current = attempt.current_section!;
  closeSectionTimer(attempt, current, nowMs);
  attempt.completed_sections.push(current);

  const ordered = [...config.sections].sort((a, b) => a.order - b.order).map((s) => s.name);
  const currentIdx = ordered.indexOf(current);
  const next = ordered[currentIdx + 1];

  if (next) {
    attempt.current_section = next;
    ensureSectionStarted(attempt, next, nowMs);
  } else {
    attempt.current_section = null;
    attempt.status = "submitted";
    attempt.submitted_at = new Date(nowMs).toISOString();
  }
}

/** Candidate opens a question. Accrues time on whatever was previously open, then marks this one visited. */
export function visitQuestion(attempt: Attempt, questionId: string, nowMs: number = Date.now()): void {
  // Accrue time on the previously open question in this section, if any.
  for (const r of Object.values(attempt.responses)) {
    if (r.last_opened_at !== null) {
      r.time_spent_sec += Math.max(0, Math.floor((nowMs - r.last_opened_at) / 1000));
      r.last_opened_at = null;
    }
  }

  const response = attempt.responses[questionId];
  if (!response) return;
  response.visit_count += 1;
  response.last_opened_at = nowMs;
  if (response.visit_state === "not_visited") {
    response.visit_state = "visited_unanswered";
  }
}

export type SaveAction = "save_next" | "mark_review_next" | "clear_response";

export function saveResponse(attempt: Attempt, questionId: string, answer: string | null, action: SaveAction): void {
  const response = attempt.responses[questionId];
  if (!response) return;

  if (action === "clear_response") {
    response.selected_answer = null;
    response.final_answer = null;
    response.visit_state = response.visit_state === "answered_marked_review" ? "marked_review" : "visited_unanswered";
    return;
  }

  response.selected_answer = answer;

  const hasAnswer = answer !== null && answer !== "";
  const previousAnswer = response.final_answer;
  // A "change" is switching between two different real answers — not the first
  // answer being set (previousAnswer was null), and not a no-op resave of the
  // same value.
  if (hasAnswer && previousAnswer !== null && previousAnswer !== answer) {
    response.answer_change_count += 1;
  }
  response.final_answer = answer;

  if (action === "mark_review_next") {
    response.visit_state = hasAnswer ? "answered_marked_review" : "marked_review";
  } else {
    response.visit_state = hasAnswer ? "answered" : "visited_unanswered";
  }
}

/** Final manual submission, only ever called from the last section (or a confirmed early full-exam submit). */
export function finalizeSubmission(attempt: Attempt, nowMs: number = Date.now()): void {
  // Flush any in-progress time accrual before locking the attempt.
  for (const r of Object.values(attempt.responses)) {
    if (r.last_opened_at !== null) {
      r.time_spent_sec += Math.max(0, Math.floor((nowMs - r.last_opened_at) / 1000));
      r.last_opened_at = null;
    }
  }
  if (attempt.current_section) {
    closeSectionTimer(attempt, attempt.current_section, nowMs);
    if (!attempt.completed_sections.includes(attempt.current_section)) {
      attempt.completed_sections.push(attempt.current_section);
    }
  }
  attempt.status = "submitted";
  attempt.current_section = null;
  attempt.submitted_at = new Date(nowMs).toISOString();
}

export function timeRemainingForCurrentSection(attempt: Attempt, nowMs: number = Date.now()): number {
  if (!attempt.current_section) return 0;
  return secondsRemaining(attempt, attempt.current_section, nowMs);
}
