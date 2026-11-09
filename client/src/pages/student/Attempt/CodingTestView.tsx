import { useState } from 'react';
import Button from '../../../components/common/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Countdown from '../../../components/common/Countdown';
import EmptyState from '../../../components/common/EmptyState';
import { starterCode } from '../../../constants';
import { ExecutionMode, RunResult } from '../../../types/execution.types';
import { StudentProblem } from '../../../types/student.types';
import ExecutionModeNotice from './ExecutionModeNotice';
import ProblemPanel from './ProblemPanel';
import ProblemSidebar from './ProblemSidebar';

interface Props {
  problems: StudentProblem[];
  executionMode: ExecutionMode | null;
  deadline: string;
  serverOffsetMs: number;
  selectedProblemId: number | null;
  codeMap: Record<number, string>;
  runResults: Record<number, RunResult>;
  runningProblemId: number | null;
  isSubmitting: boolean;
  actionError: string | null;
  isTimeUp: boolean;
  onSelectProblem(problemId: number): void;
  onCodeChange(problemId: number, code: string): void;
  onRun(problemId: number, code: string): Promise<boolean>;
  onSubmit(problemId: number, code: string): Promise<boolean>;
  onFinish(): Promise<boolean>;
  onTimeUp(): void;
  onViolation(type: 'PASTE_EXTERNAL' | 'DROP_EXTERNAL'): void;
}

export default function CodingTestView({
  problems, executionMode, deadline, serverOffsetMs, selectedProblemId, codeMap, runResults, runningProblemId,
  isSubmitting, actionError, isTimeUp, onSelectProblem, onCodeChange, onRun, onSubmit, onFinish, onTimeUp, onViolation,
}: Props) {
  const [isFinishOpen, setIsFinishOpen] = useState(false);

  if (problems.length === 0) return <EmptyState title="This test has no problems yet." />;

  const selected = problems.find((problem) => problem.id === selectedProblemId) ?? problems[0];
  const unsubmitted = problems.filter((problem) => problem.submission === null);
  const isBusy = isSubmitting || runningProblemId !== null;

  async function handleFinish() {
    await onFinish();
    setIsFinishOpen(false);
  }

  return (
    <div className="attempt__coding">
      <div className="attempt__bar">
        <div className="attempt__bar-group">
          <span>Time left:</span>
          <Countdown deadline={deadline} serverOffsetMs={serverOffsetMs} onTimeUp={onTimeUp} />
          <ExecutionModeNotice mode={executionMode} />
        </div>
        <Button variant="danger" disabled={isTimeUp || isBusy} onClick={() => setIsFinishOpen(true)}>
          Finish test
        </Button>
      </div>

      {isTimeUp && (
        <p className="attempt__notice" role="alert">
          Time is over.
        </p>
      )}

      <div className="attempt__coding-layout">
        <ProblemSidebar problems={problems} selectedId={selected.id} onSelect={onSelectProblem} />
        <ProblemPanel
          key={selected.id}
          problem={selected}
          code={codeMap[selected.id] ?? starterCode(selected.functionName)}
          isReadOnly={selected.submission !== null || isTimeUp}
          isRunning={runningProblemId === selected.id}
          isBusy={isBusy}
          isSubmitting={isSubmitting}
          runResult={runResults[selected.id]}
          actionError={actionError}
          onCodeChange={(code) => onCodeChange(selected.id, code)}
          onRun={(code) => void onRun(selected.id, code)}
          onSubmit={(code) => onSubmit(selected.id, code)}
          onViolation={isTimeUp ? undefined : onViolation}
        />
      </div>

      <ConfirmDialog
        isOpen={isFinishOpen && !isTimeUp}
        title="Finish the test?"
        confirmLabel="Finish test"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleFinish}
        onCancel={() => setIsFinishOpen(false)}
      >
        {unsubmitted.length > 0 ? (
          <>
            <p>These problems are not submitted:</p>
            <ul className="attempt__finish-list">
              {unsubmitted.map((problem) => (
                <li key={problem.id}>{problem.title}</li>
              ))}
            </ul>
            <p>Unsubmitted problems score 0.</p>
          </>
        ) : (
          <p>Finish the test now? You cannot change your answers afterwards.</p>
        )}
      </ConfirmDialog>
    </div>
  );
}