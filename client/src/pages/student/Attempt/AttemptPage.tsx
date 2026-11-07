import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loading from '../../../components/common/Loading';
import { useAttempt } from '../../../context/AttemptContext';
import { useStudentTests } from '../../../context/StudentTestsContext';
import { useFullscreen } from '../../../exam-guard/useFullscreen';
import AttemptResult from './AttemptResult';
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

  const { attempt, attemptError, loadAttempt, startAttempt, isSessionReplaced } = useAttempt();
  const { tests, loadTests } = useStudentTests();
  const { enter, exit } = useFullscreen();
  const navigate = useNavigate();

  const [requestedId, setRequestedId] = useState<number | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [fullscreenRefused, setFullscreenRefused] = useState(false);

  // The context may still hold another attempt: only this attempt counts.
  const current = attempt && attempt.id === attemptId ? attempt : null;
  const isFinished = current !== null && current.status !== 'IN_PROGRESS';

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
    // The MCQ view (step 13) and the coding view (step 16) will replace this placeholder.
    const count = current.type === 'MCQ' ? current.questions?.length ?? 0 : current.problems?.length ?? 0;
    content = (
      <p className="attempt__placeholder">
        Test view comes next: {count} {current.type === 'MCQ' ? 'questions' : 'problems'}.
      </p>
    );
  }

  return (
    <div className="attempt">
      <header className="attempt__header">
        <h1 className="attempt__title">{current ? current.testTitle : 'Exam'}</h1>
      </header>
      <div className="attempt__body">{content}</div>
    </div>
  );
}