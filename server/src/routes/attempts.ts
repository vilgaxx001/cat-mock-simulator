import { Router } from "express";
import { getConfig, getGroupsForQuestions, getMock, getQuestionsForMock, toCandidateView } from "../repository/contentRepository";
import { getAttempt, listAttempts, saveAttempt } from "../repository/attemptRepository";
import { beginAttempt, checkAndAdvanceIfExpired, createAttempt, finalizeSubmission, saveResponse, SaveAction, timeRemainingForCurrentSection, visitQuestion } from "../engine/examEngine";
import { isInWarningWindow, secondsRemaining } from "../engine/timerEngine";
import { computeScore } from "../engine/scoringEngine";
import { buildAnalytics } from "../analytics";
import { getCachedResult, setCachedResult } from "../repository/resultCache";
import { Attempt, ExamConfig } from "../types";

export const attemptsRouter = Router();

function loadAttemptContext(attemptId: string) {
  const attempt = getAttempt(attemptId);
  if (!attempt) return null;
  const config = getConfig(attempt.config_id);
  if (!config) return null;
  const mock = getMock(attempt.mock_id);
  if (!mock) return null;
  return { attempt, config, mock };
}

/** Shared shape returned by every endpoint that hands back "where things stand". */
function buildAttemptView(attempt: Attempt, config: ExamConfig, sectionQuestionIds: string[]) {
  const currentSection = attempt.current_section;
  const timeRemaining = timeRemainingForCurrentSection(attempt);

  const responsesForSection = sectionQuestionIds.map((qid) => {
    const r = attempt.responses[qid];
    return {
      question_id: qid,
      visit_state: r.visit_state,
      has_answer: r.final_answer !== null && r.final_answer !== "",
      selected_answer: r.final_answer,
    };
  });

  return {
    attempt_id: attempt.attempt_id,
    // Lets the client resolve which mock (and therefore which config/sections/
    // instructions) an attempt belongs to after a full page reload or a direct
    // visit to /attempt/:id, when there is no in-memory mock selection to lean on.
    mock_id: attempt.mock_id,
    status: attempt.status,
    current_section: currentSection,
    completed_sections: attempt.completed_sections,
    time_remaining_sec: timeRemaining,
    in_warning_window: currentSection ? isInWarningWindow(attempt, currentSection, config) : false,
    responses: responsesForSection,
  };
}

attemptsRouter.get("/", (_req, res) => {
  res.json({ attempts: listAttempts() });
});

attemptsRouter.post("/", (req, res) => {
  const { mock_id } = (req.body ?? {}) as { mock_id?: string };
  if (!mock_id || typeof mock_id !== "string") {
    return res.status(400).json({ error: "mock_id is required" });
  }
  const mock = getMock(mock_id);
  if (!mock) return res.status(404).json({ error: "Mock not found" });
  const config = getConfig(mock.config_id);
  if (!config) return res.status(500).json({ error: "Mock references an unknown config" });

  const attempt = createAttempt(mock, config);
  saveAttempt(attempt);
  res.status(201).json({ attempt_id: attempt.attempt_id });
});

attemptsRouter.post("/:id/begin", (req, res) => {
  const ctx = loadAttemptContext(req.params.id);
  if (!ctx) return res.status(404).json({ error: "Attempt not found" });
  const { attempt, config, mock } = ctx;

  beginAttempt(attempt, config);
  checkAndAdvanceIfExpired(attempt, config);
  saveAttempt(attempt);

  const sectionQuestionIds = attempt.current_section ? mock.question_ids[attempt.current_section] : [];
  res.json(buildAttemptView(attempt, config, sectionQuestionIds));
});

attemptsRouter.get("/:id", (req, res) => {
  const ctx = loadAttemptContext(req.params.id);
  if (!ctx) return res.status(404).json({ error: "Attempt not found" });
  const { attempt, config, mock } = ctx;

  if (attempt.status === "in_progress") {
    checkAndAdvanceIfExpired(attempt, config);
    saveAttempt(attempt);
  }

  const sectionQuestionIds = attempt.current_section ? mock.question_ids[attempt.current_section] : [];
  const sectionQuestions = sectionQuestionIds.map((qid) => getQuestionsForMock(mock.mock_id).find((q) => q.question_id === qid)!);
  const questions = sectionQuestions.map(toCandidateView);
  const groups = getGroupsForQuestions(sectionQuestions);

  res.json({ ...buildAttemptView(attempt, config, sectionQuestionIds), questions, groups });
});

attemptsRouter.post("/:id/visit", (req, res) => {
  const ctx = loadAttemptContext(req.params.id);
  if (!ctx) return res.status(404).json({ error: "Attempt not found" });
  const { attempt, config, mock } = ctx;
  const { question_id } = (req.body ?? {}) as { question_id?: string };
  if (!question_id || typeof question_id !== "string") {
    return res.status(400).json({ error: "question_id is required" });
  }

  checkAndAdvanceIfExpired(attempt, config);
  if (attempt.status !== "in_progress") {
    saveAttempt(attempt);
    return res.status(409).json({ error: "Attempt is not in progress", status: attempt.status });
  }

  const currentSectionIds = attempt.current_section ? mock.question_ids[attempt.current_section] : [];
  if (!currentSectionIds.includes(question_id)) {
    return res.status(403).json({ error: "Question is not in the currently unlocked section" });
  }

  visitQuestion(attempt, question_id);
  saveAttempt(attempt);
  res.json(buildAttemptView(attempt, config, currentSectionIds));
});

const VALID_ACTIONS: SaveAction[] = ["save_next", "mark_review_next", "clear_response"];

attemptsRouter.post("/:id/response", (req, res) => {
  const ctx = loadAttemptContext(req.params.id);
  if (!ctx) return res.status(404).json({ error: "Attempt not found" });
  const { attempt, config, mock } = ctx;
  const { question_id, answer, action } = (req.body ?? {}) as { question_id?: string; answer?: string | null; action?: SaveAction };

  if (!question_id || typeof question_id !== "string") {
    return res.status(400).json({ error: "question_id is required" });
  }
  if (!action || !VALID_ACTIONS.includes(action)) {
    return res.status(400).json({ error: `action must be one of: ${VALID_ACTIONS.join(", ")}` });
  }
  if (answer !== null && answer !== undefined && typeof answer !== "string") {
    return res.status(400).json({ error: "answer must be a string or null" });
  }

  checkAndAdvanceIfExpired(attempt, config);
  if (attempt.status !== "in_progress") {
    saveAttempt(attempt);
    return res.status(409).json({ error: "Attempt is not in progress", status: attempt.status });
  }

  const currentSectionIds = attempt.current_section ? mock.question_ids[attempt.current_section] : [];
  if (!currentSectionIds.includes(question_id)) {
    return res.status(403).json({ error: "Question is not in the currently unlocked section" });
  }

  saveResponse(attempt, question_id, answer ?? null, action);
  saveAttempt(attempt);
  res.json(buildAttemptView(attempt, config, currentSectionIds));
});

/** Manual submit. Only takes effect if the config explicitly allows early
 * submission — otherwise this is a no-op that just re-checks expiry, matching
 * real CAT's "you cannot leave before time is up" behaviour. */
attemptsRouter.post("/:id/submit", (req, res) => {
  const ctx = loadAttemptContext(req.params.id);
  if (!ctx) return res.status(404).json({ error: "Attempt not found" });
  const { attempt, config, mock } = ctx;

  checkAndAdvanceIfExpired(attempt, config);

  if (attempt.status === "in_progress" && config.allow_early_section_submit) {
    finalizeSubmission(attempt);
  }

  saveAttempt(attempt);
  const sectionQuestionIds = attempt.current_section ? mock.question_ids[attempt.current_section] : [];
  res.json(buildAttemptView(attempt, config, sectionQuestionIds));
});

attemptsRouter.get("/:id/result", (req, res) => {
  const ctx = loadAttemptContext(req.params.id);
  if (!ctx) return res.status(404).json({ error: "Attempt not found" });
  const { attempt, config, mock } = ctx;

  if (attempt.status !== "submitted") {
    return res.status(409).json({ error: "Attempt has not been submitted yet" });
  }

  // A submitted attempt's result never changes — serve the cached payload if
  // this attempt's result has already been computed once (e.g. this is a
  // refresh, or the person navigated back to an already-viewed result).
  const cached = getCachedResult<object>(attempt.attempt_id);
  if (cached) {
    return res.json(cached);
  }

  const allQuestions = getQuestionsForMock(mock.mock_id);
  const score = computeScore(attempt, allQuestions, config);
  const groups = getGroupsForQuestions(allQuestions);
  const analytics = buildAnalytics(attempt, allQuestions, groups, config, score);

  const questionReview = allQuestions.map((q) => {
    const r = attempt.responses[q.question_id];
    const detail = score.question_details.find((d) => d.question_id === q.question_id)!;
    return {
      question_id: q.question_id,
      section: q.section,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options ?? null,
      your_answer: r.final_answer,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      outcome: detail.outcome,
      marks_awarded: detail.marks_awarded,
      time_spent_sec: detail.time_spent_sec,
      set_id: q.set_id ?? q.passage_id ?? null,
      was_marked_for_review: r.visit_state === "marked_review" || r.visit_state === "answered_marked_review",
      answer_change_count: r.answer_change_count,
    };
  });

  const payload = { score, question_review: questionReview, groups, analytics, mock_name: mock.name, submitted_at: attempt.submitted_at };
  setCachedResult(attempt.attempt_id, payload);
  res.json(payload);
});
