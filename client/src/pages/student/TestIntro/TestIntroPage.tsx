import { ChangeEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loading from '../../../components/common/Loading';
import PageContainer from '../../../components/common/PageContainer';
import { useAttempt } from '../../../context/AttemptContext';
import { useStudentTests } from '../../../context/StudentTestsContext';
import { useFullscreen } from '../../../exam-guard/useFullscreen';
import './TestIntroPage.css';

// Rules from the task description. The pledge and the unsupported text are fixed in docs/API.md 19.6 and 19.7.
const RULES = [
  'You have one attempt.',
  'The timer starts when you press Start.',
  'Refreshing the page does not stop the timer.',
  'Full screen is required.',
  'Leaving full screen or switching tabs twice ends the exam.',
  'Copying or pasting three times ends the exam.',
];
const PLEDGE_LINES = [
  'I will take this exam alone, stay in full screen, and not copy or paste.',
  'I understand that breaking these rules ends my exam.',
];
const UNSUPPORTED = 'This exam needs full screen. Please use a computer with Chrome, Edge or Firefox.';
// The docs give no text for a refused full screen, so this one is ours.
const FULLSCREEN_REFUSED = 'Could not enter full screen. Please allow full screen and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

// Never a blank page: a problem always shows its message and a way back.
function Problem({ message }: { message: string }) {
  return (
    <div className="test-intro__problem">
      <ErrorMessage message={message} />
      <Link className="test-intro__back" to="/student/tests">
        Back to My Tests
      </Link>
    </div>
  );
}

export default function TestIntroPage() {
  const { testId: testIdParam } = useParams();
  const testId = Number(testIdParam);
  const isValidId = Number.isInteger(testId) && testId > 0;

  const { currentTest, isTestLoading, testError, loadTest } = useStudentTests();
  const { startAttempt, attemptError } = useAttempt();
  const { isSupported, enter, exit } = useFullscreen();
  const navigate = useNavigate();

  const [requestedId, setRequestedId] = useState<number | null>(null);
  const [acceptedFor, setAcceptedFor] = useState<number | null>(null); // the test whose pledge is ticked
  const [isStarting, setIsStarting] = useState(false);
  const [failure, setFailure] = useState<'fullscreen' | 'start' | null>(null);

  const accepted = acceptedFor === testId;
  const test = currentTest && currentTest.id === testId ? currentTest : null;

  useEffect(() => {
    if (!isValidId) return;
    setRequestedId(testId);
    void loadTest(testId);
  }, [isValidId, testId, loadTest]);

  function handlePledge(event: ChangeEvent<HTMLInputElement>) {
    setAcceptedFor(event.target.checked ? testId : null);
  }

  // Full screen first (the browser allows it only right after a click), then start, then open the attempt.
  async function handleStart() {
    if (!test) return;
    setFailure(null);
    setIsStarting(true);
    try {
      if (!(await enter())) {
        setFailure('fullscreen');
        return;
      }
      const attemptId = await startAttempt(test.id, true);
      if (attemptId === null) {
        setFailure('start');
        await exit();
        return;
      }
      navigate(`/student/attempts/${attemptId}`);
    } finally {
      setIsStarting(false);
    }
  }

  let content;
  if (!isValidId) {
    content = <Problem message="Test not found." />;
  } else if (requestedId !== testId || isTestLoading) {
    content = <Loading />;
  } else if (testError) {
    content = <Problem message={testError} />;
  } else if (!test) {
    content = <Problem message="Test not found." />;
  } else {
    const word = test.type === 'MCQ' ? 'question' : 'problem';
    const items = `${test.itemCount} ${word}${test.itemCount === 1 ? '' : 's'}`;
    const meta = `${test.type === 'MCQ' ? 'Multiple choice' : 'Coding'} · ${test.durationMinutes} min · ${items}`;
    const canStart = test.state === 'AVAILABLE' || test.state === 'IN_PROGRESS';

    content = (
      <section className="test-intro">
        <p className="test-intro__meta">{meta}</p>

        {test.state === 'LOCKED' && <p className="test-intro__note">{test.lockReason}</p>}

        {!canStart && test.state !== 'LOCKED' && (
          <p className="test-intro__note">You have already finished this test.</p>
        )}

        {canStart && (
          <>
            <h3 className="test-intro__heading">Before you start</h3>
            <ul className="test-intro__rules">
              {RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>

            <label className="test-intro__pledge">
              <input className="test-intro__checkbox" type="checkbox" checked={accepted} onChange={handlePledge} />
              <span>
                {PLEDGE_LINES.map((line) => (
                  <span className="test-intro__pledge-line" key={line}>
                    {line}
                  </span>
                ))}
              </span>
            </label>

            {!isSupported && <p className="test-intro__notice">{UNSUPPORTED}</p>}
            {failure && (
              <p className="test-intro__error" role="alert">
                {failure === 'fullscreen' ? FULLSCREEN_REFUSED : (attemptError ?? GENERIC_ERROR)}
              </p>
            )}
          </>
        )}

        <div className="test-intro__actions">
          {canStart && (
            <Button variant="primary" isLoading={isStarting} disabled={!accepted || !isSupported} onClick={handleStart}>
              Start test
            </Button>
          )}
          <Link className="test-intro__back" to="/student/tests">
            Back to My Tests
          </Link>
          {!canStart && test.state !== 'LOCKED' && (
            <Link className="test-intro__back" to="/student/results">
              My Results
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="test-intro-page">
      <PageContainer title={test ? test.title : 'Test intro'}>{content}</PageContainer>
    </div>
  );
}