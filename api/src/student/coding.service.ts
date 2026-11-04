import { Injectable } from '@nestjs/common';
import { CodeExecutionService } from '../execution/code-execution.service';

/** Owner: Rami (Task 5), using Majed's CodeExecutionService. API.md section 14. */
@Injectable()
export class CodingService {
  constructor(private readonly execution: CodeExecutionService) {}

  // STUB: replace with real implementation (20 runs per problem, 503 does not count)
  async run(_userId: number, _attemptId: number, _problemId: number, code: string) {
    const r = await this.execution.run({ functionName: 'twoSum', testCases: [] }, code);
    return { ...r, runCount: 1, runsRemaining: 19 };
  }

  // STUB: replace with real implementation (once per problem)
  async submit(_userId: number, _attemptId: number, problemId: number, code: string) {
    const r = await this.execution.submit({ functionName: 'twoSum', testCases: [] }, code);
    return { problemId, ...r, points: 50, submittedAt: new Date().toISOString(), label: `${r.passedCount} of ${r.totalCount} tests passed` };
  }

  // STUB: replace with real implementation (one transaction + ScoringService.scoreCoding)
  async finish(_userId: number, _attemptId: number) {
    return { score: 50, label: 'Coding score: 50%' };
  }
}
