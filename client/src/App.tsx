import { useCallback, useEffect, useRef, useState, Suspense, lazy } from "react";
import { api, ApiError } from "./api/client";
import { AttemptView, MockDetail, MockSummary, ResultPayload, SectionConfig, SectionName } from "./types";
import { LandingScreen } from "./components/LandingScreen";
import { InstructionsScreen } from "./components/InstructionsScreen";
import { ExamHeader } from "./components/ExamHeader";
import { QuestionPalette } from "./components/QuestionPalette";
import { QuestionView } from "./components/QuestionView";
import { SetStimulus } from "./components/SetStimulus";
import { Controls } from "./components/Controls";
import { ResultDashboard } from "./components/ResultDashboard";
import { SectionTransitionScreen } from "./components/SectionTransitionScreen";
import { ErrorState } from "./components/ErrorState";
import { LoadingState } from "./components/LoadingState";

// Lazy-loaded: history pulls in recharts and a handful of history-only
// components that most sessions (still mid-exam, or just viewing a result)
// never touch — no reason to ship that code until the button is clicked.
const MockHistoryScreen = lazy(() => import("./components/history/MockHistoryScreen").then((m) => ({ default: m.MockHistoryScreen })));

type Screen = "landing" | "instructions" | "exam" | "result" | "history";

const POLL_INTERVAL_MS = 10_000;

/** How many questions come before `currentSection` in the mock's section order — the
 * basis for global question numbering (VARC 1-24, DILR 25-46, QA 47-68, etc.),
 * computed purely from data the client already has, no backend change needed. */
function computeGlobalOffset(sections: SectionConfig[], currentSection: SectionName | null): number {
  if (!currentSection) return 0;
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  let offset = 0;
  for (const s of sorted) {
    if (s.name === currentSection) break;
    offset += s.question_count;
  }
  return offset;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [mocks, setMocks] = useState<MockSummary[]>([]);
  const [mockDetail, setMockDetail] = useState<MockDetail | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptView, setAttemptView] = useState<AttemptView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [syncedAtMs, setSyncedAtMs] = useState(Date.now());
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section-transition interstitial state. `pendingView` holds the freshly-fetched
  // state for the new section — deliberately NOT applied to `attemptView` until the
  // person clicks "Continue", so the new section's content never flashes on screen
  // before it's acknowledged (matching real CAT's mandatory click-through).
  const [transitionTo, setTransitionTo] = useState<{ from: SectionName | null; to: SectionName } | null>(null);
  const [pendingView, setPendingView] = useState<AttemptView | null>(null);
  const [confirmingTransition, setConfirmingTransition] = useState(false);

  const attemptIdRef = useRef<string | null>(null);
  attemptIdRef.current = attemptId;
  // Tracks the section actually being displayed right now, independent of React's
  // render cycle — used to detect a genuine section change coming back from the
  // server (as opposed to a routine refresh of the same section's state).
  const currentSectionRef = useRef<SectionName | null>(null);

  // ---- Load mock list on first paint ----
  useEffect(() => {
    setLoading(true);
    api
      .listMocks()
      .then((r) => setMocks(r.mocks))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectMock = useCallback((mockId: string) => {
    setError(null);
    api
      .getMockDetail(mockId)
      .then((detail) => {
        setMockDetail(detail);
        setScreen("instructions");
      })
      .catch((e) => setError(e.message));
  }, []);

  const questions = attemptView?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  const responseMap = Object.fromEntries((attemptView?.responses ?? []).map((r) => [r.question_id, r]));

  /** Merges a partial view (from an action endpoint, which omits `questions`) onto the existing full view. */
  const mergeView = useCallback((patch: AttemptView) => {
    setAttemptView((prev) => ({ ...(prev ?? patch), ...patch, questions: patch.questions ?? prev?.questions }));
    setSyncedAtMs(Date.now());
  }, []);

  const handleAutoSubmitted = useCallback(() => {
    const id = attemptIdRef.current;
    if (!id) return;
    api
      .getResult(id)
      .then((r) => {
        setResult(r);
        setScreen("result");
      })
      .catch((e) => setError(e.message));
  }, []);

  /** Applies a fully-fetched attempt view (with questions/groups for whatever section
   * it belongs to) as the new "current" state: resets to question 1 and visits it.
   * Used both for the very first section on exam start, and after a transition is
   * confirmed via the interstitial. */
  const applyFreshView = useCallback(
    (view: AttemptView) => {
      setAttemptView(view);
      setSyncedAtMs(Date.now());
      setCurrentIndex(0);
      currentSectionRef.current = view.current_section;
      const firstId = view.questions?.[0]?.question_id;
      const id = attemptIdRef.current;
      if (firstId && id) {
        api.visitQuestion(id, firstId).then(mergeView).catch(() => {});
      }
    },
    [mergeView]
  );

  /** Central decision point for "what changed" whenever we get an authoritative
   * fresh read of the attempt: submitted -> results; a different section than what's
   * on screen -> hold it and show the transition interstitial; otherwise just a
   * routine state refresh (timer ticking down, responses updating, etc). */
  const processFreshView = useCallback(
    (view: AttemptView) => {
      if (view.status === "submitted") {
        handleAutoSubmitted();
        return;
      }
      if (view.current_section !== currentSectionRef.current) {
        setPendingView(view);
        setTransitionTo({ from: currentSectionRef.current, to: view.current_section as SectionName });
        return;
      }
      setAttemptView(view);
      setSyncedAtMs(Date.now());
    },
    [handleAutoSubmitted]
  );

  const fetchAndProcess = useCallback(() => {
    const id = attemptIdRef.current;
    if (!id) return;
    api.getAttempt(id).then(processFreshView).catch(() => {});
  }, [processFreshView]);

  const handleStart = useCallback(() => {
    if (!mockDetail) return;
    setStarting(true);
    setError(null);
    let newAttemptId = "";
    api
      .createAttempt(mockDetail.mock.mock_id)
      .then(({ attempt_id }) => {
        newAttemptId = attempt_id;
        setAttemptId(attempt_id);
        return api.beginAttempt(attempt_id).then(() => api.getAttempt(attempt_id));
      })
      .then((full) => {
        setScreen("exam");
        applyFreshView(full);
      })
      .catch((e) => setError(e.message))
      .finally(() => setStarting(false));
  }, [mockDetail, applyFreshView]);

  const confirmTransition = useCallback(() => {
    if (!pendingView) return;
    setConfirmingTransition(true);
    applyFreshView(pendingView);
    setTransitionTo(null);
    setPendingView(null);
    setConfirmingTransition(false);
  }, [pendingView, applyFreshView]);

  /** Any 403 (question no longer in the now-current section — a boundary was
   * crossed mid-request) or 409 (already submitted) means "go find out what the
   * authoritative state actually is now" rather than showing a raw error. */
  const handleBoundaryError = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && (e.status === 403 || e.status === 409)) {
        fetchAndProcess();
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    },
    [fetchAndProcess]
  );

  const navigateTo = useCallback(
    (newIndex: number) => {
      if (!attemptId || newIndex < 0 || newIndex >= questions.length) return;
      setCurrentIndex(newIndex);
      const qid = questions[newIndex].question_id;
      api.visitQuestion(attemptId, qid).then(mergeView).catch(handleBoundaryError);
    },
    [attemptId, questions, mergeView, handleBoundaryError]
  );

  // Reset the draft to the server-committed value whenever the visible question changes.
  // This deliberately mirrors real CAT: an unsaved selection is discarded if you navigate
  // away without Save & Next / Mark for Review & Next.
  useEffect(() => {
    if (!currentQuestion) return;
    const committed = responseMap[currentQuestion.question_id]?.selected_answer ?? "";
    setDraftAnswer(committed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.question_id]);

  const doAction = useCallback(
    (action: "save_next" | "mark_review_next" | "clear_response", advance: boolean) => {
      if (!attemptId || !currentQuestion) return;
      const answer = action === "clear_response" ? null : draftAnswer.trim() === "" ? null : draftAnswer.trim();
      api
        .saveResponse(attemptId, currentQuestion.question_id, answer, action)
        .then((view) => {
          mergeView(view);
          if (action === "clear_response") {
            setDraftAnswer("");
          } else if (advance && currentIndex < questions.length - 1) {
            navigateTo(currentIndex + 1);
          }
        })
        .catch(handleBoundaryError);
    },
    [attemptId, currentQuestion, draftAnswer, currentIndex, questions.length, mergeView, navigateTo, handleBoundaryError]
  );

  // Poll periodically so an idle candidate (no clicks) still gets caught by
  // server-side expiry detection — whether that means the timer warning kicking in,
  // a section transition, or final auto-submission.
  useEffect(() => {
    if (screen !== "exam" || !attemptId) return;
    const id = window.setInterval(fetchAndProcess, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [screen, attemptId, fetchAndProcess]);

  if (error) {
    return (
      <ErrorState
        message={error}
        primaryLabel="Try Again"
        onPrimary={() => setError(null)}
        secondaryLabel="Back to Mocks"
        onSecondary={() => {
          setError(null);
          setScreen("landing");
        }}
      />
    );
  }

  if (screen === "landing") {
    return <LandingScreen mocks={mocks} onSelect={handleSelectMock} onViewHistory={() => setScreen("history")} loading={loading} />;
  }

  if (screen === "instructions" && mockDetail) {
    return <InstructionsScreen detail={mockDetail} onStart={handleStart} starting={starting} />;
  }

  if (screen === "result" && result && mockDetail) {
    return (
      <ResultDashboard
        result={result}
        mockName={mockDetail.mock.name}
        completedAt={result.submitted_at ?? new Date().toISOString()}
        onViewHistory={() => setScreen("history")}
      />
    );
  }

  if (screen === "history") {
    return (
      <Suspense fallback={<LoadingState label="Loading history…" />}>
        <MockHistoryScreen onBack={() => setScreen("landing")} />
      </Suspense>
    );
  }

  if (screen === "exam" && transitionTo && mockDetail) {
    return (
      <SectionTransitionScreen
        fromSection={transitionTo.from}
        toSection={transitionTo.to}
        sections={mockDetail.config.sections}
        onContinue={confirmTransition}
        continuing={confirmingTransition}
      />
    );
  }

  if (screen === "exam" && attemptView && currentQuestion && mockDetail) {
    const groups = attemptView.groups ?? [];
    const groupKey = currentQuestion.set_id ?? currentQuestion.passage_id ?? null;
    const currentGroup = groupKey ? groups.find((g) => g.group_id === groupKey) : undefined;
    const setQuestions = groupKey ? questions.filter((q) => (q.set_id ?? q.passage_id) === groupKey) : [];
    const positionInSet = groupKey ? setQuestions.findIndex((q) => q.question_id === currentQuestion.question_id) + 1 : 0;

    const sortedSections = [...mockDetail.config.sections].sort((a, b) => a.order - b.order);
    const totalInMock = sortedSections.reduce((sum, s) => sum + s.question_count, 0);
    const globalOffset = computeGlobalOffset(mockDetail.config.sections, attemptView.current_section);

    return (
      <div className="flex min-h-screen flex-col">
        <ExamHeader
          mockName={mockDetail.mock.name}
          currentSection={attemptView.current_section!}
          allSections={sortedSections.map((s) => s.name)}
          completedSections={attemptView.completed_sections}
          serverSeconds={attemptView.time_remaining_sec}
          syncedAtMs={syncedAtMs}
          warningThresholdSec={mockDetail.config.warning_threshold_sec}
        />

        {attemptView.in_warning_window && (
          <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-warn sm:px-6">
            Less than 5 minutes remaining in this section.
          </div>
        )}

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-1 flex-col gap-4 lg:flex-row">
              {currentGroup && <SetStimulus group={currentGroup} questionsInSet={setQuestions.length} positionInSet={positionInSet} />}
              <QuestionView
                question={currentQuestion}
                index={currentIndex}
                totalInSection={questions.length}
                globalNumber={globalOffset + currentIndex + 1}
                totalInMock={totalInMock}
                draftAnswer={draftAnswer}
                onDraftChange={setDraftAnswer}
              />
            </div>
            <Controls
              onPrevious={() => navigateTo(currentIndex - 1)}
              onClear={() => doAction("clear_response", false)}
              onMarkAndNext={() => doAction("mark_review_next", true)}
              onSaveAndNext={() => doAction("save_next", true)}
              canGoPrevious={currentIndex > 0}
              isLastQuestion={currentIndex === questions.length - 1}
            />
            <p className="text-center text-xs text-muted">
              Selecting an option does not save it — use Save &amp; Next or Mark for Review &amp; Next to record your answer.
            </p>
          </div>
          <div className="w-full flex-shrink-0 lg:w-64">
            <QuestionPalette
              questions={questions}
              responses={responseMap}
              currentQuestionId={currentQuestion.question_id}
              globalOffset={globalOffset}
              onJump={(qid) => navigateTo(questions.findIndex((q) => q.question_id === qid))}
            />
          </div>
        </div>
      </div>
    );
  }

  return <LoadingState />;
}
