import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AttemptStateService } from '../attempt-state/attempt-state.service';
import { ScoringService } from '../attempt-state/scoring.service';
import { ClockService } from '../common/clock.service';
import { MAX_CODE_LENGTH, MAX_RUNS_PER_PROBLEM } from '../common/constants';
import { round1 } from '../common/round.util';
import { CodeExecutionService, MSG_RUN_UNAVAILABLE, MSG_SUBMIT_UNAVAILABLE } from '../execution/code-execution.service';
import { ExecutionUnavailableError, ProblemForExecution } from '../execution/execution.types';
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

  async run(userId: number, attemptId: number, problemId: number, code: string) {
    this.validateCode(code);
    const { problem } = await this.getProblemContext(userId, attemptId, problemId, 'SAMPLE');
    const runCount = await this.prisma.$transaction(async (tx) => {
      const reserved = await tx.problemResult.updateMany({
        where: { attemptId, problemId, runCount: { lt: MAX_RUNS_PER_PROBLEM } },
        data: { runCount: { increment: 1 } },
      });
      if (reserved.count !== 1) {
        throw new ConflictException('You have used all 20 runs for this problem.');
      }
      const result = await tx.problemResult.findUnique({
        where: { attemptId_problemId: { attemptId, problemId } },
        select: { runCount: true },
      });
      return result!.runCount;
    });

    try {
      const outcome = await this.execution.run(problem, code);
      return {
        ...outcome,
        runCount,
        runsRemaining: MAX_RUNS_PER_PROBLEM - runCount,
      };
    } catch (error) {
      if (this.isUnavailable(error)) {
        await this.prisma.problemResult.updateMany({
          where: { attemptId, problemId, runCount: { gt: 0 } },
          data: { runCount: { decrement: 1 } },
        });
        if (error instanceof HttpException) throw error;
        throw new ServiceUnavailableException(MSG_RUN_UNAVAILABLE);
      }
      throw error;
    }
  }

  async submit(userId: number, attemptId: number, problemId: number, code: string) {
    this.validateCode(code);
    const { problem, result } = await this.getProblemContext(userId, attemptId, problemId, 'HIDDEN');
    if (result.submittedAt) throw new ConflictException('This problem has already been submitted.');

    let outcome;
    try {
      outcome = await this.execution.submit(problem, code);
    } catch (error) {
      if (this.isUnavailable(error)) {
        if (error instanceof HttpException) throw error;
        throw new ServiceUnavailableException(MSG_SUBMIT_UNAVAILABLE);
      }
      throw error;
    }

    const points = outcome.totalCount === 0 ? 0 : round1((problem.points * outcome.passedCount) / outcome.totalCount);
    const submittedAt = this.clock.now();
    const saved = await this.prisma.problemResult.updateMany({
      where: { attemptId, problemId, submittedAt: null },
      data: {
        code,
        passedCount: outcome.passedCount,
        totalCount: outcome.totalCount,
        points,
        submittedAt,
      },
    });
    if (saved.count !== 1) throw new ConflictException('This problem has already been submitted.');

    return {
      problemId,
      mode: outcome.mode,
      passedCount: outcome.passedCount,
      totalCount: outcome.totalCount,
      points,
      submittedAt: submittedAt.toISOString(),
      label: `${outcome.passedCount} of ${outcome.totalCount} tests passed`,
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
        throw new BadRequestException('This action is only for the coding test.');
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

  private validateCode(code: string): void {
    if (typeof code !== 'string' || code.trim().length === 0) {
      throw new BadRequestException('Code cannot be empty.');
    }
    if (code.length > MAX_CODE_LENGTH) {
      throw new BadRequestException('Code cannot be longer than 10,000 characters.');
    }
  }

  private async getProblemContext(userId: number, attemptId: number, problemId: number, visibility: 'SAMPLE' | 'HIDDEN') {
    const attempt = await this.prisma.attempt.findFirst({
      where: { id: attemptId, userId },
      select: {
        id: true,
        testId: true,
        status: true,
        deadline: true,
        test: { select: { type: true } },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (attempt.test.type !== 'CODING') {
      throw new BadRequestException('This action is only for the coding test.');
    }
    await this.attemptState.assertAcceptingRequests(attempt);

    const problem = await this.prisma.problem.findFirst({
      where: { id: problemId, testId: attempt.testId },
      select: {
        id: true,
        title: true,
        points: true,
        functionName: true,
        testCases: {
          where: { visibility },
          orderBy: { position: 'asc' },
          select: { visibility: true, args: true, expected: true },
        },
        results: {
          where: { attemptId },
          select: { runCount: true, submittedAt: true },
        },
      },
    });
    if (!problem) throw new NotFoundException('Problem not found in this test.');
    const result = problem.results[0];
    if (!result) throw new NotFoundException('Problem not found in this test.');

    const executionProblem: ProblemForExecution & { points: number } = {
      functionName: problem.functionName,
      points: problem.points,
      testCases: problem.testCases,
    };
    return { problem: executionProblem, result };
  }

  private isUnavailable(error: unknown): boolean {
    return error instanceof ExecutionUnavailableError || (error instanceof HttpException && error.getStatus() === 503);
  }
}
