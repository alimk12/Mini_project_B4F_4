import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';
import StateBadge from '../../../components/common/StateBadge';
import { StudentTestCard } from '../../../types/student.types';
import { formatScore } from '../../../utils/format';

interface Props {
  test: StudentTestCard;
  isBusy: boolean; // this card is being resumed
  isDisabled: boolean; // another card is being resumed
  error: string | null;
  onContinue(test: StudentTestCard): void;
}

function itemsText(test: StudentTestCard) {
  const word = test.type === 'MCQ' ? 'question' : 'problem';
  return `${test.itemCount} ${word}${test.itemCount === 1 ? '' : 's'}`;
}

export default function TestCard({ test, isBusy, isDisabled, error, onContinue }: Props) {
  const stateClass = test.state.toLowerCase().replace('_', '-');
  return (
    <li className={`my-tests-card my-tests-card--${stateClass}`}>
      <div className="my-tests-card__header">
        <h2 className="my-tests-card__title">{test.title}</h2>
        <StateBadge state={test.state} />
      </div>

      <p className="my-tests-card__meta">
        {test.type === 'MCQ' ? 'Multiple choice' : 'Coding'} · {test.durationMinutes} min · {itemsText(test)}
      </p>

      {test.state === 'LOCKED' && <p className="my-tests-card__note">{test.lockReason}</p>}

      {test.state === 'SUBMITTED' && (
        <p className="my-tests-card__score my-tests-card__score--submitted">Score: {formatScore(test.score)}</p>
      )}
      {test.state === 'EXPIRED' && (
        <p className="my-tests-card__score my-tests-card__score--expired">{formatScore(test.score)}</p>
      )}
      {test.state === 'TERMINATED' && (
        <p className="my-tests-card__score my-tests-card__score--terminated">
          Terminated — exam rules violated · Score: {formatScore(test.score)}
        </p>
      )}

      {test.state === 'AVAILABLE' && (
        <div className="my-tests-card__actions">
          <Link className="my-tests-card__open" to={`/student/tests/${test.id}`}>
            Open
          </Link>
        </div>
      )}
      {test.state === 'IN_PROGRESS' && (
        <div className="my-tests-card__actions">
          <Button variant="primary" isLoading={isBusy} disabled={isDisabled} onClick={() => onContinue(test)}>
            Continue
          </Button>
        </div>
      )}

      {error && (
        <p className="my-tests-card__error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}