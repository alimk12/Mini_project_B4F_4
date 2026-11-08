import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AttemptStateService } from '../attempt-state/attempt-state.service';
import { ScoringService } from '../attempt-state/scoring.service';
import { ClockService } from '../common/clock.service';
import { CodeExecutionService } from '../execution/code-execution.service';
import { PrismaService } from '../prisma/prisma.service';

/** Owner: Rami (Task 5), using Majed's CodeExecutionService. API.md section 14. */
@Injectable()
export class CodingService {
  constructor(
    private readonly execution: CodeExecutionService,
    private readonly prisma: PrismaService,
    private readonly attemptState: AttemptStateService,
    private readonly scoring: ScoringService,
    private readonly clock: ClockService,
  ) {}

  // STUB: replace with real implementation (20 runs per problem, 503 does not count)
  async run(_userId: number, _attemptId: number, _problemId: number, code: string) {
    const r = await this.execution.run({ functionName: 'twoSum', testCases: [] }, code);
    return { ...r, runCount: 1, runsRemaining: 19 };
  }

  // STUB: replace with real implementation (once per problem)
  async submit(_userId: number, _attemptId: number, problemId: number, code: string) {
    const r = await this.execution.submit({ functionName: 'twoSum', testCases: [] }, code);
    return {
      problemId,
      ...r,
      points: 50,
      submittedAt: new Date().toISOString(),
      label: `${r.passedCount} of ${r.totalCount} tests passed`,
    };
  }

  async finish(userId: number, attemptId: number) {
    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.attempt.findFirst({
        where: { id: attemptId, userId },
        select: { id: true, status: true, deadline: true, test: { select: { type: true } } },
      });
      if (!attempt) throw new NotFoundException('Attempt not found.');

      await this.attemptState.assertAcceptingRequests(attempt);
      if (attempt.test.type !== 'CODING') {
        throw new ConflictException('This is not a coding test.');
      }

      const submittedAt = this.clock.now();
      const changed = await tx.attempt.updateMany({
        where: { id: attemptId, userId, status: 'IN_PROGRESS' },
        data: { status: 'SUBMITTED', submittedAt },
      });
      if (changed.count !== 1) throw new ConflictException('This attempt has already been finished.');

      const result = await this.scoring.scoreCoding(tx, attemptId);
      await tx.attempt.update({ where: { id: attemptId }, data: { score: result.score } });

      return {
        attemptId,
        status: 'SUBMITTED' as const,
        score: result.score,
        label: `Coding score: ${result.score}%`,
        submittedAt: submittedAt.toISOString(),
        problems: result.problems,
      };
    });
  }
}
