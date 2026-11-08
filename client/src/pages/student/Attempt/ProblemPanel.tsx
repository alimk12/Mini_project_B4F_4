import CodeEditor from '../../../editor/CodeEditor';
import { StudentProblem } from '../../../types/student.types';

interface Props {
  problem: StudentProblem;
  code: string;
  isReadOnly: boolean;
  onCodeChange(code: string): void;
  onViolation?: (type: 'PASTE_EXTERNAL' | 'DROP_EXTERNAL') => void;
}

// Values are shown with JSON.stringify, so "1" and 1 look different.
const show = (value: unknown) => JSON.stringify(value);

export default function ProblemPanel({ problem, code, isReadOnly, onCodeChange, onViolation }: Props) {
  return (
    <section className="attempt__panel">
      <h2 className="attempt__panel-title">{problem.title}</h2>
      <p className="attempt__panel-meta">
        {problem.points} point{problem.points === 1 ? '' : 's'}
      </p>
      <p className="attempt__description">{problem.description}</p>

      <p className="attempt__fact">
        Function name: <code className="attempt__code-inline">{problem.functionName}</code>
      </p>
      {problem.sample && (
        <>
          <p className="attempt__fact">
            Example input: <code className="attempt__code-inline">{show(problem.sample.args)}</code>
          </p>
          <p className="attempt__fact">
            Expected output: <code className="attempt__code-inline">{show(problem.sample.expected)}</code>
          </p>
        </>
      )}

      <CodeEditor value={code} onChange={onCodeChange} isReadOnly={isReadOnly} onViolation={onViolation} />
    </section>
  );
}