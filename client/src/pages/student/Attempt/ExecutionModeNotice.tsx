import { ExecutionMode } from '../../../types/execution.types';

// The texts are from the task description.
const TEXT: Record<ExecutionMode, string> = {
  MOCK: 'Mock execution: your code is not really executed. Run shows a simulated result.',
  JUDGE0: 'Your code runs on an external execution service.',
};

export default function ExecutionModeNotice({ mode }: { mode: ExecutionMode | null }) {
  if (!mode) return null;
  return <p className={`attempt__mode attempt__mode--${mode.toLowerCase()}`}>{TEXT[mode]}</p>;
}