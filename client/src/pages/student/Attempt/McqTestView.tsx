import { useState } from 'react';
import Button from '../../../components/common/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Countdown from '../../../components/common/Countdown';
import { StudentQuestion } from '../../../types/student.types';
import QuestionCard from './QuestionCard';
import { SaveStatus } from './useMcqChoices';

interface Props {
  questions: StudentQuestion[];
  deadline: string;
  serverOffsetMs: number;
  choices: Record<number, number>;
  statuses: Record<number, SaveStatus>;
  isTimeUp: boolean;
  isSubmitting: boolean;
  actionError: string | null;
  onChoose(questionId: number, optionId: number): void;
  onTimeUp(): void;
  onSubmit(): Promise<boolean>;
}

export default function McqTestView({
  questions, deadline, serverOffsetMs, choices, statuses, isTimeUp, isSubmitting, actionError, onChoose, onTimeUp, onSubmit,
}: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const answered = questions.filter((question) => choices[question.id] !== undefined).length;
  const unanswered = questions.length - answered;
  const isLocked = isTimeUp || isSubmitting;

  // The unanswered text is from the task description. The other one is ours.
  const confirmText =
    unanswered > 0
      ? `You have ${unanswered} unanswered ${unanswered === 1 ? 'question' : 'questions'}. Unanswered questions count as wrong. Submit anyway?`
      : 'Submit your answers now? You cannot change them afterwards.';

  async function handleConfirm() {
    await onSubmit();
    setIsConfirmOpen(false);
  }

  return (
    <div className="attempt__mcq">
      <div className="attempt__bar">
        <div className="attempt__bar-group">
          <span>Time left:</span>
          <Countdown deadline={deadline} serverOffsetMs={serverOffsetMs} onTimeUp={onTimeUp} />
        </div>
        <span className="attempt__counter">
          {answered} of {questions.length} answered
        </span>
      </div>

      {isTimeUp && (
        <p className="attempt__notice" role="alert">
          Time is over.
        </p>
      )}

      <div className="attempt__questions">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            number={index + 1}
            selectedOptionId={choices[question.id]}
            status={statuses[question.id]}
            isDisabled={isLocked}
            onChoose={(optionId) => onChoose(question.id, optionId)}
          />
        ))}
      </div>

      <div className="attempt__submit-area">
        {actionError && (
          <p className="attempt__error" role="alert">
            {actionError}
          </p>
        )}
        <Button variant="primary" disabled={isLocked} onClick={() => setIsConfirmOpen(true)}>
          Submit answers
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen && !isTimeUp}
        title="Submit your answers?"
        confirmLabel="Submit"
        isLoading={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      >
        <p>{confirmText}</p>
      </ConfirmDialog>
    </div>
  );
}