import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loading from '../../../components/common/Loading';
import { GRACE_SECONDS } from '../../../constants';
import { useAttempt } from '../../../context/AttemptContext';
import { useStudentTests } from '../../../context/StudentTestsContext';
import FullscreenGate from '../../../exam-guard/FullscreenGate';
import { useExamGuard } from '../../../exam-guard/useExamGuard';
import { useFullscreen } from '../../../exam-guard/useFullscreen';
import ViolationWarningDialog from '../../../exam-guard/ViolationWarningDialog';
import AttemptResult from './AttemptResult';
import CodingTestView from './CodingTestView';
import IntegrityStatus from './IntegrityStatus';
import McqTestView from './McqTestView';
import { useMcqChoices } from './useMcqChoices';
import { useCodingDrafts } from './useCodingDrafts';
import './AttemptPage.css';

const REPLACED = 'This attempt is open in another window or device.';
// The docs give no text for a refused full screen, so this one is ours.
const FULLSCREEN_REFUSED = 'Could not enter full screen. Please allow full screen and try again.';

// Never a blank page: a problem always shows its message and a way back.
function Problem({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="attempt__problem">
      <ErrorMessage message={message} onRetry={onRetry} />
      <Link className="attempt__back" to="/student/tests">
        Back to My Tests
      </Link>
    </div>
  );
}

export default function AttemptPage() {
  const { attemptId: attemptIdParam } = useParams();
  const attemptId = Number(attemptIdParam);
  const isValidId = Number.isInteger(attemptId) && attemptId > 0;

  const {
    attempt, attemptError, loadAttempt, startAttempt, isSessionReplaced,
    serverOffsetMs, saveMcqAnswer, submitMcq, isSubmitting, actionError,
    integrity, lastWarning, reportViolation, clearWarning,
    runResults, runningProblemId, runCode,  } = useAttempt();
  const { tests, loadTests } = useStudentTests();
  const { isFullscreen, enter, exit } = useFullscreen();
  const navigate = useNavigate();

  const [requestedId, setRequestedId] = useState<number | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [fullscreenRefused, setFullscreenRefused] = useState(false);
  const [timedUpFor, setTimedUpFor] = useState<number | null>(null); // the attempt whose time is over

  // The context may still hold another attempt: only this attempt counts.
  const current = attempt && attempt.id === attemptId ? attempt : null;
  const isFinished = current !== null && current.status !== 'IN_PROGRESS';
  const isTimeUp = timedUpFor === attemptId;

  // The browser only reports. The guard watches only while the exam is really running.
  const isActive = current?.status === 'IN_PROGRESS' && !isTimeUp && !isSessionReplaced;
  useExamGuard({ isActive, onViolation: reportViolation });

  // The MCQ choices live here (outside the gate), so leaving full screen never loses them.
  const { choices, statuses, choose, buildAnswers } = useMcqChoices(current, saveMcqAnswer);

  // The code and the selected problem live here too, for the same reason.
  const { codeMap, setCode, selectedProblemId, selectProblem } = useCodingDrafts(current?.id ?? null);

  // "Continue here" needs the test id. A window that never loaded the attempt finds it in the test list.
  const resumeTestId = current?.testId ?? tests.find((test) => test.attemptId === attemptId)?.id ?? null;

  useEffect(() => {
    if (!isValidId) return;
    setRequestedId(attemptId);
    void loadAttempt(attemptId);
  }, [isValidId, attemptId, loadAttempt]);

  useEffect(() => {
    if (isSessionReplaced && resumeTestId === null) void loadTests();
  }, [isSessionReplaced, resumeTestId, loadTests]);

  // Finished attempts leave full screen.
  useEffect(() => {
    if (isFinished) void exit();
  }, [isFinished]);

  // Time is over: after the grace period the server has expired the attempt, so reload it.
  useEffect(() => {
    if (!isTimeUp) return;
    const timer = window.setTimeout(() => {
      void loadAttempt(attemptId);
    }, GRACE_SECONDS * 1000 + 1000);
    return () => window.clearTimeout(timer);
  }, [isTimeUp, attemptId, loadAttempt]);

  const handleTimeUp = useCallback(() => setTimedUpFor(attemptId), [attemptId]);
  const handleSubmit = useCallback(() => submitMcq(buildAnswers()), [submitMcq, buildAnswers]);

  // Continue here: full screen first (the browser allows it only right after a click), then resume.
  async function handleContinueHere() {
    if (resumeTestId === null) return;
    setFullscreenRefused(false);
    setIsResuming(true);
    try {
      if (!(await enter())) {
        setFullscreenRefused(true);
        return;
      }
      const id = await startAttempt(resumeTestId, true);
      if (id === null) {
        await exit();
        return;
      }
      if (id !== attemptId) navigate(`/student/attempts/${id}`);
    } finally {
      setIsResuming(false);
    }
  }

  let content;
  if (!isValidId) {
    content = <Problem message="Attempt not found." />;
  } else if (requestedId !== attemptId && !current) {
    content = <Loading />;
  } else if (isSessionReplaced) {
    content = (
      <div className="attempt__problem">
        <p className="attempt__replaced">{REPLACED}</p>
        {fullscreenRefused && (
          <p className="attempt__error" role="alert">
            {FULLSCREEN_REFUSED}
          </p>
        )}
        <Button variant="primary" isLoading={isResuming} disabled={resumeTestId === null} onClick={handleContinueHere}>
          Continue here
        </Button>
        <Link className="attempt__back" to="/student/tests">
          Back to My Tests
        </Link>
      </div>
    );
  } else if (attemptError) {
    content = <Problem message={attemptError} onRetry={() => loadAttempt(attemptId)} />;
  } else if (!current) {
    content = <Loading />;
  } else if (current.status !== 'IN_PROGRESS') {
    content = <AttemptResult attempt={current} />;
  } else {
    const view =
      current.type === 'MCQ' ? (
        <McqTestView
          questions={current.questions ?? []}
          deadline={current.deadline}
          serverOffsetMs={serverOffsetMs}
          choices={choices}
          statuses={statuses}
          isTimeUp={isTimeUp}
          isSubmitting={isSubmitting}
          actionError={actionError}
          onChoose={choose}
          onTimeUp={handleTimeUp}
          onSubmit={handleSubmit}
        />
      ) : (
        <CodingTestView
          problems={current.problems ?? []}
          executionMode={current.executionMode}
          deadline={current.deadline}
          serverOffsetMs={serverOffsetMs}
          selectedProblemId={selectedProblemId}
          codeMap={codeMap}
          runResults={runResults}
          runningProblemId={runningProblemId}
          isSubmitting={isSubmitting}
          actionError={actionError}
          isTimeUp={isTimeUp}
          onSelectProblem={selectProblem}
          onCodeChange={setCode}
          onRun={runCode}
          onTimeUp={handleTimeUp}
          onViolation={reportViolation}
        />
      );
    content = (
      <FullscreenGate isFullscreen={isFullscreen} onEnter={enter}>
        {view}
      </FullscreenGate>
    );
  }

  return (
    <div className="attempt">
      <header className="attempt__header">
        <h1 className="attempt__title">{current ? current.testTitle : 'Exam'}</h1>
        {current?.status === 'IN_PROGRESS' && integrity && <IntegrityStatus integrity={integrity} />}
      </header>
      <div className="attempt__body">{content}</div>
      {/* OUTSIDE the gate: leaving full screen is itself a violation, so the warning must stay visible then. */}
      <ViolationWarningDialog
        warning={lastWarning}
        onReturn={() => {
          clearWarning();
          void enter();
        }}
      />
    </div>
  );
}