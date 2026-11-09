import { StudentQuestion } from '../../../types/student.types';
import { SaveStatus } from './useMcqChoices';

const STATUS_TEXT: Record<SaveStatus, string> = {
  saving: 'Saving…',
  saved: 'Saved',
  retrying: 'Not saved, retrying',
  failed: 'Not saved',
};

interface Props {
  question: StudentQuestion;
  number: number;
  selectedOptionId: number | undefined;
  status: SaveStatus | undefined;
  isDisabled: boolean;
  onChoose(optionId: number): void;
}

export default function QuestionCard({ question, number, selectedOptionId, status, isDisabled, onChoose }: Props) {
  return (
    <section className="ui-card attempt__question">
      <div className="attempt__question-head">
        <p className="attempt__question-text">
          {number}. {question.text}
        </p>
        {status && <span className={`attempt__save attempt__save--${status}`}>{STATUS_TEXT[status]}</span>}
      </div>

      <div className="attempt__options">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const classes = `attempt__option${isSelected ? ' attempt__option--selected' : ''}${isDisabled ? ' attempt__option--disabled' : ''}`;
          return (
            <label key={option.id} className={classes}>
              <input
                className="attempt__radio"
                type="radio"
                name={`question-${question.id}`}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onChoose(option.id)}
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}