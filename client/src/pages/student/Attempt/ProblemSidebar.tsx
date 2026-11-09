import { ChangeEvent } from 'react';
import { StudentProblem } from '../../../types/student.types';

interface Props {
  problems: StudentProblem[];
  selectedId: number;
  onSelect(problemId: number): void;
}

// A list on a computer. On a phone the CSS hides it and shows the select above the panel.
export default function ProblemSidebar({ problems, selectedId, onSelect }: Props) {
  function handleSelect(event: ChangeEvent<HTMLSelectElement>) {
    onSelect(Number(event.target.value));
  }

  return (
    <>
      <nav className="attempt__sidebar" aria-label="Problems">
        {problems.map((problem, index) => (
          <button
            key={problem.id}
            type="button"
            className={`attempt__problem-btn${problem.id === selectedId ? ' attempt__problem-btn--active' : ''}`}
            aria-current={problem.id === selectedId}
            onClick={() => onSelect(problem.id)}
          >
            <span>
              {index + 1}. {problem.title}
            </span>
            {problem.submission && (
              <span className="attempt__problem-done" title="Submitted">
                ✓
              </span>
            )}
          </button>
        ))}
      </nav>

      <select className="attempt__problem-select" value={selectedId} onChange={handleSelect} aria-label="Choose a problem">
        {problems.map((problem, index) => (
          <option key={problem.id} value={problem.id}>
            {index + 1}. {problem.title}
            {problem.submission ? ' ✓' : ''}
          </option>
        ))}
      </select>
    </>
  );
}