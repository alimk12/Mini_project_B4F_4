import { useEffect, useState } from 'react';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loading from '../../../components/common/Loading';
import PageContainer from '../../../components/common/PageContainer';
import StateBadge from '../../../components/common/StateBadge';
import { useStudentTests } from '../../../context/StudentTestsContext';
import { StudentResult } from '../../../types/student.types';
import { formatDateTime, formatScore } from '../../../utils/format';
import './MyResultsPage.css';

// SUBMITTED shows the score, EXPIRED shows "Expired — not submitted" (its score is null, never 0),
// and TERMINATED always shows its label next to the score.
function resultText(result: StudentResult) {
  if (result.status === 'TERMINATED') {
    return `Terminated — exam rules violated · ${formatScore(result.score)}`;
  }
  return formatScore(result.score);
}

export default function MyResultsPage() {
  const { results, isResultsLoading, resultsError, loadResults } = useStudentTests();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadResults().then(() => {
      if (!cancelled) setHasLoadedOnce(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loadResults]);

  let content;
  if (resultsError) {
    content = <ErrorMessage message={resultsError} onRetry={loadResults} />;
  } else if (results.length === 0 && (isResultsLoading || !hasLoadedOnce)) {
    content = <Loading />;
  } else if (results.length === 0) {
    content = <EmptyState title="You have not finished any test yet." />;
  } else {
    content = (
      <div className="my-results__table-wrap">
        <table className="my-results__table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Result</th>
              <th>Finished</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.testId}>
                <td className="my-results__title">
                  {result.testTitle}
                  <span className="my-results__type">{result.type === 'MCQ' ? 'Multiple choice' : 'Coding'}</span>
                </td>
                <td>
                  <StateBadge state={result.status} />
                </td>
                <td className={`my-results__result my-results__result--${result.status.toLowerCase()}`}>
                  {resultText(result)}
                </td>
                <td className="my-results__time">{formatDateTime(result.submittedAt ?? result.terminatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="my-results-page">
      <PageContainer title="My Results">{content}</PageContainer>
    </div>
  );
}