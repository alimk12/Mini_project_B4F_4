export type ExecutionMode = 'MOCK' | 'JUDGE0';
export type RunStatus = 'PASSED' | 'WRONG_ANSWER' | 'SYNTAX_ERROR' | 'RUNTIME_ERROR' | 'FUNCTION_NOT_FOUND' | 'TIME_LIMIT_EXCEEDED' | 'MOCK';
export interface RunResult {
  mode: ExecutionMode; status: RunStatus; message: string; input: unknown[]; expectedOutput: unknown; actualOutput: unknown | null;
  logs: string[]; error: { type: string; message: string; line: number | null } | null; timeMs: number | null;
  runCount: number; runsRemaining: number;
}
export interface SubmitResult {
  problemId: number; mode: ExecutionMode; passedCount: number; totalCount: number; points: number; submittedAt: string; label: string;
}
