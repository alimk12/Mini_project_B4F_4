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
  onTimeUp(): void;
  onViolation(type: 'PASTE_EXTERNAL' | 'DROP_EXTERNAL'): void;
}

export default function CodingTestView({
  problems, executionMode, deadline, serverOffsetMs, selectedProblemId, codeMap, runResults, runningProblemId,
  isSubmitting, actionError, isTimeUp, onSelectProblem, onCodeChange, onRun, onTimeUp, onViolation,
}: Props) {
  if (problems.length === 0) return <EmptyState title="This test has no problems yet." />;

  const selected = problems.find((problem) => problem.id === selectedProblemId) ?? problems[0];

  return (
    <div className="attempt__coding">
      <div className="attempt__bar">
        <div className="attempt__bar-group">
          <span>Time left:</span>
          <Countdown deadline={deadline} serverOffsetMs={serverOffsetMs} onTimeUp={onTimeUp} />
          <ExecutionModeNotice mode={executionMode} />
        </div>
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
          isBusy={isSubmitting || runningProblemId !== null}
          runResult={runResults[selected.id]}
          actionError={actionError}
          onCodeChange={(code) => onCodeChange(selected.id, code)}
          onRun={(code) => void onRun(selected.id, code)}
          onViolation={isTimeUp ? undefined : onViolation}
        />
      </div>
    </div>
  );
}