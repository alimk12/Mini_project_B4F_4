import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionMode, ExecutionRunOutcome, ExecutionSubmitOutcome, ProblemForExecution } from './execution.types';

export const MSG_RUN_UNAVAILABLE =
  'The code execution service is not reachable right now. Your run was not counted. Please try again.';
export const MSG_SUBMIT_UNAVAILABLE =
  'The code execution service is not reachable right now. Your submission was not saved. Please try again.';

/**
 * Owner: Majed (Task 4, Part C). API.md section 13.
 * Next files (yours): providers/mock.provider.ts, providers/judge0.provider.ts, harness/, output-comparer.ts,
 * error-normalizer.ts, SPIKE.md (Phase 0 spike result).
 */
@Injectable()
export class CodeExecutionService {
  constructor(private readonly config: ConfigService) {}

  getMode(): ExecutionMode {
    return this.config.get<string>('EXECUTION_MODE') === 'judge0' ? 'JUDGE0' : 'MOCK';
  }

  // STUB: replace with real implementation (sample case only)
  async run(_problem: ProblemForExecution, code: string): Promise<ExecutionRunOutcome> {
    return {
      mode: 'MOCK', status: 'MOCK', message: `[MOCK] Code received: ${code.split('\n').length} lines. Real execution is not enabled.`,
      input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], actualOutput: null, logs: [], error: null, timeMs: null,
    };
  }

  // STUB: replace with real implementation (hidden cases, counts only)
  async submit(problem: ProblemForExecution, _code: string): Promise<ExecutionSubmitOutcome> {
    const totalCount = problem.testCases.filter((c) => c.visibility === 'HIDDEN').length || 4;
    return { mode: 'MOCK', passedCount: totalCount, totalCount };
  }
}
