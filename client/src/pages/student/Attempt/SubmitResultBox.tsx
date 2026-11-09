import { StudentProblem } from '../../../types/student.types';

// Only the counts and the points are shown: nothing else about the hidden tests.
export default function SubmitResultBox({ problem }: { problem: StudentProblem }) {
  const { submission } = problem;
  if (!submission) return null;
  const isPartial = submission.passedCount < submission.totalCount;
  return (
    <section className={`attempt__submit-box${isPartial ? ' attempt__submit-box--partial' : ''}`}>
      <h3 className="attempt__submit-title">Submitted</h3>
      <p className="attempt__submit-line">{`${submission.passedCount} of ${submission.totalCount} tests passed`}</p>
      <p className="attempt__submit-line">{`Points: ${submission.points} of ${problem.points}`}</p>
    </section>
  );
}