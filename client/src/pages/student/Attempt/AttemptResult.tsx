import { Link } from 'react-router-dom';
import { AttemptStatus } from '../../../types/common.types';
import { StudentAttempt } from '../../../types/student.types';

interface Props {
  attempt: StudentAttempt;
}

function heading(status: AttemptStatus) {
  if (status === 'EXPIRED') return 'Time is over';
  if (status === 'TERMINATED') return 'Exam ended';
  return 'Test submitted';
}

// Used only if the server sent no result.
function fallbackLabel(status: AttemptStatus) {
  if (status === 'EXPIRED') return 'Expired — not submitted';
  if (status === 'TERMINATED') return 'Terminated — exam rules violated';
  return 'Submitted';
}

export default function AttemptResult({ attempt }: Props) {
  const { result, status } = attempt;
  return (
    <section className={`attempt__result attempt__result--${status.toLowerCase()}`}>
      <h2 className="attempt__result-title">{heading(status)}</h2>
      <p className="attempt__result-label">{result?.label ?? fallbackLabel(status)}</p>

      {status === 'TERMINATED' && result?.terminationReason && (
        <p className="attempt__result-reason">Reason: {result.terminationReason}</p>
      )}

      {result?.problems && result.problems.length > 0 && (
        <ul className="attempt__result-problems">
          {result.problems.map((problem) => (
            <li key={problem.problemId}>
              {problem.title}: {problem.points} points{problem.submitted ? '' : ' (not submitted)'}
            </li>
          ))}
        </ul>
      )}

      <div className="attempt__result-links">
        <Link className="attempt__back" to="/student/tests">
          Back to My Tests
        </Link>
        <Link className="attempt__back" to="/student/results">
          My Results
        </Link>
      </div>
    </section>
  );
}