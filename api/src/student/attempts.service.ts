import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AttemptStateService } from '../attempt-state/attempt-state.service';
import { ClockService } from '../common/clock.service';
import { buildAttemptOrder } from '../common/attempt-order.util';
import { PrismaService } from '../prisma/prisma.service';
import { CodeExecutionService } from '../execution/code-execution.service';
import { IntegrityService } from '../integrity/integrity.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { studentAttemptSelect, toStudentAttempt } from './mappers/student-view.mapper';
import { StudentTestsService } from './student-tests.service';

const MSG_ALREADY_FINISHED = 'You have already finished this test.';

/** Owner: Rami (Tasks T4/T5). API.md sections 9 and 19.4–19.6. */
@Injectable()
export class AttemptsService {
  private readonly logger = new Logger(AttemptsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
    private readonly attemptState: AttemptStateService,
    private readonly studentTests: StudentTestsService,
    private readonly integrity: IntegrityService,
    private readonly execution: CodeExecutionService,
  ) {}

  async start(userId: number, testId: number, dto: StartAttemptDto) {
    if (dto.acceptedRules !== true) {
      throw new BadRequestException('You must accept the exam rules to start.');
    }

    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new NotFoundException('Test not found.');
    if (test.status !== 'PUBLISHED') throw new ForbiddenException('This test is not available.');

    await this.attemptState.expireOverdue();
    const existing = await this.prisma.attempt.findUnique({
      where: { userId_testId: { userId, testId } },
      select: { id: true, status: true, deadline: true },
    });
    if (existing?.status === 'IN_PROGRESS') {
      // expireOverdue() ran immediately before the lookup; retain this guard for the deadline boundary race.
      if (this.attemptState.isOverdue(existing)) {
        await this.attemptState.expireOverdue();
        throw new ConflictException(MSG_ALREADY_FINISHED);
      }
      return this.resume(existing.id);
    }
    if (existing) throw new ConflictException(MSG_ALREADY_FINISHED);

    await this.studentTests.assertCanStart(userId, test);

    try {
      const order =
        test.type === 'MCQ'
          ? buildAttemptOrder(
              await this.prisma.question.findMany({
                where: { testId },
                orderBy: { position: 'asc' },
                select: { id: true, options: { select: { id: true } } },
              }),
            )
          : null;
      const startedAt = this.clock.now();
      const deadline = new Date(startedAt.getTime() + test.durationMinutes * 60_000);

      const { attemptId, sessionKey } = await this.prisma.$transaction(async (tx) => {
        const attempt = await tx.attempt.create({
          data: {
            userId,
            testId,
            status: 'IN_PROGRESS',
            startedAt,
            deadline,
            ...(order
              ? { questionOrder: order.questionOrder, optionOrder: order.optionOrder }
              : {}),
          },
          select: { id: true },
        });

        if (test.type === 'CODING') {
          const problems = await tx.problem.findMany({ where: { testId }, select: { id: true } });
          if (problems.length) {
            await tx.problemResult.createMany({
              data: problems.map(({ id }) => ({ attemptId: attempt.id, problemId: id, runCount: 0 })),
            });
          }
        }

        const sessionKey = await this.integrity.issueSessionKey(tx, attempt.id, false);
        return { attemptId: attempt.id, sessionKey };
      });

      this.logger.log(`Attempt ${attemptId} started for user ${userId} on test ${testId}.`);
      return { created: true, view: await this.view(attemptId, sessionKey) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const racedAttempt = await this.prisma.attempt.findUnique({
          where: { userId_testId: { userId, testId } },
          select: { id: true, status: true, deadline: true },
        });
        if (racedAttempt?.status === 'IN_PROGRESS') {
          if (this.attemptState.isOverdue(racedAttempt)) {
            await this.attemptState.expireOverdue();
            throw new ConflictException(MSG_ALREADY_FINISHED);
          }
          return this.resume(racedAttempt.id);
        }
        if (racedAttempt) throw new ConflictException(MSG_ALREADY_FINISHED);
      }
      throw error;
    }
  }

  async getForStudent(userId: number, attemptId: number) {
    const ownedAttempt = await this.prisma.attempt.findFirst({
      where: { id: attemptId, userId },
      select: { id: true },
    });
    if (!ownedAttempt) throw new NotFoundException('Attempt not found.');

    await this.attemptState.expireOverdue();
    const attempt = await this.prisma.attempt.findFirst({
      where: { id: attemptId, userId },
      select: studentAttemptSelect(attemptId),
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');

    return toStudentAttempt(attempt, null, this.clock.now(), this.execution.getMode());
  }

  async view(attemptId: number, sessionKey: string | null) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      select: studentAttemptSelect(attemptId),
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');

    return toStudentAttempt(attempt, sessionKey, this.clock.now(), this.execution.getMode());
  }

  private async resume(attemptId: number) {
    const sessionKey = await this.prisma.$transaction((tx) => this.integrity.issueSessionKey(tx, attemptId, true));
    return { created: false, view: await this.view(attemptId, sessionKey) };
  }
}
