export type ExecutionMode = 'MOCK' | 'JUDGE0';
export type RunStatus =
  | 'PASSED'
  | 'WRONG_ANSWER'
  | 'SYNTAX_ERROR'
  | 'RUNTIME_ERROR'
  | 'FUNCTION_NOT_FOUND'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MOCK';

export interface ExecutionError {
  type: string;
  message: string;
  line: number | null;
}

export interface ExecutionRunOutcome {
  mode: ExecutionMode;
  status: RunStatus;
  message: string;
  input: unknown[];
  expectedOutput: unknown;
  actualOutput: unknown | null;
  logs: string[];
  error: ExecutionError | null;
  timeMs: number | null;
}

export interface ExecutionSubmitOutcome {
  mode: ExecutionMode;
  passedCount: number;
  totalCount: number;
}

/** What a provider returns for one program run (Judge0 shape, decoded). */
export interface ProviderRawResult {
  statusId: number;
  stdout: string;
  stderr: string;
  compileOutput: string;
  timeMs: number | null;
}

export interface ProblemForExecution {
  functionName: string;
  testCases: { visibility: 'SAMPLE' | 'HIDDEN'; args: unknown; expected: unknown }[];
}

export class ExecutionUnavailableError extends Error {}
