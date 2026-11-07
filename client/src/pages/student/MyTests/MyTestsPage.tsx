import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loading from '../../../components/common/Loading';
import PageContainer from '../../../components/common/PageContainer';
import { useAttempt } from '../../../context/AttemptContext';
import { useStudentTests } from '../../../context/StudentTestsContext';
import { useFullscreen } from '../../../exam-guard/useFullscreen';
import { StudentTestCard } from '../../../types/student.types';
import TestCard from './TestCard';
import './MyTestsPage.css';

// The docs give no text for a refused full screen, so this one is ours.
const FULLSCREEN_REFUSED = 'Could not enter full screen. Please allow full screen and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

interface Failure {
  testId: number;
  fullscreenRefused: boolean;
}

export default function MyTestsPage() {
  const { tests, isTestsLoading, testsError, loadTests } = useStudentTests();
  const { startAttempt, attemptError } = useAttempt();
  const { enter, exit } = useFullscreen();
  const navigate = useNavigate();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [resumingId, setResumingId] = useState<number | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTests().then(() => {
      if (!cancelled) setHasLoadedOnce(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loadTests]);

  // Continue: full screen first (the browser allows it only right after a click), then resume, then open.
  async function handleContinue(test: StudentTestCard) {
    setFailure(null);
    setResumingId(test.id);
    try {
      if (!(await enter())) {
        setFailure({ testId: test.id, fullscreenRefused: true });
        return;
      }
      const attemptId = await startAttempt(test.id, true);
      if (attemptId === null) {
        setFailure({ testId: test.id, fullscreenRefused: false });
        await exit();
        return;
      }
      navigate(`/student/attempts/${attemptId}`);
    } finally {
      setResumingId(null);
    }
  }

  function errorFor(testId: number): string | null {
    if (!failure || failure.testId !== testId) return null;
    if (failure.fullscreenRefused) return FULLSCREEN_REFUSED;
    return attemptError ?? GENERIC_ERROR;
  }

  let content;
  if (testsError) {
    content = <ErrorMessage message={testsError} onRetry={loadTests} />;
  } else if (tests.length === 0 && (isTestsLoading || !hasLoadedOnce)) {
    content = <Loading />;
  } else if (tests.length === 0) {
    content = <EmptyState title="No tests are available yet." />;
  } else {
    content = (
      <ul className="my-tests-list">
        {tests.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            isBusy={resumingId === test.id}
            isDisabled={resumingId !== null}
            error={errorFor(test.id)}
            onContinue={handleContinue}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="my-tests-page">
      <PageContainer title="My Tests">{content}</PageContainer>
    </div>
  );
}