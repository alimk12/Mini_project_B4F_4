import { useState } from 'react';
import Button from '../../../components/common/Button';
import CodeEditor from '../../../editor/CodeEditor';
import { RunResult } from '../../../types/execution.types';
import { StudentProblem } from '../../../types/student.types';
import RunOutput from './RunOutput';

interface Props {
  problem: StudentProblem;
  code: string;
  isReadOnly: boolean;
  isRunning: boolean;
  isBusy: boolean; // another action (like submit) is running
  runResult: RunResult | undefined;
  actionError: string | null;
  onCodeChange(code: string): void;
  onRun(code: string): void;
  onViolation?: (type: 'PASTE_EXTERNAL' | 'DROP_EXTERNAL') => void;
}

// Values are shown with JSON.stringify, so "1" and 1 look different.
const show = (value: unknown) => JSON.stringify(value);

export default function ProblemPanel({
  problem, code, isReadOnly, isRunning, isBusy, runResult, actionError, onCodeChange, onRun, onViolation,
}: Props) {
  const [hasRunHere, setHasRunHere] = useState(false);

  const noRunsLeft = problem.runsRemaining <= 0;
  // Disabled while running, with no runs left, after submit and after the time is up (both make isReadOnly true).
  const canRun = !isReadOnly && !isRunning && !isBusy && !noRunsLeft;

  // The marker is shown only for a run made on this screen, and it is cleared while the next run is working,
  // so the same line is marked again if the error repeats.
  const errorLine = hasRunHere && !isRunning ? (runResult?.error?.line ?? null) : null;

  function handleRun() {
    setHasRunHere(true);
    onRun(code);
  }

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

      <CodeEditor
        value={code}
        onChange={onCodeChange}
        isReadOnly={isReadOnly}
        errorLine={errorLine}
        onViolation={onViolation}
      />

      <div className="attempt__actions">
        <Button variant="primary" disabled={!canRun} isLoading={isRunning} onClick={handleRun}>
          Run ({problem.runsRemaining} left)
        </Button>
      </div>

      {noRunsLeft && !problem.submission && <p className="attempt__hint">No runs left for this problem.</p>}
      {actionError && (
        <p className="attempt__error" role="alert">
          {actionError}
        </p>
      )}

      {runResult && <RunOutput result={runResult} />}
    </section>
  );
}