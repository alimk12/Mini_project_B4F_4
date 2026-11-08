import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AttemptStatus, Test } from '@prisma/client';
import { AttemptStateService } from '../attempt-state/attempt-state.service';
import { PrismaService } from '../prisma/prisma.service';

type StudentTestState = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'TERMINATED';

type StudentTestRecord = {
  id: number;
  title: string;
  type: 'MCQ' | 'CODING';
  order: number;
  status: 'DRAFT' | 'PUBLISHED';
  durationMinutes: number;
  attempts: { id: number; status: AttemptStatus; deadline: Date; score: number | null }[];
  _count: { questions: number; problems: number };
};

/** Owner: Rami (Task T3). API.md section 10. */
@Injectable()
export class StudentTestsService {
  private readonly logger = new Logger(StudentTestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attemptState: AttemptStateService,
  ) {}

  async listForStudent(userId: number) {
    await this.attemptState.expireOverdue();
    const tests = await this.prisma.test.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        type: true,
        order: true,
        status: true,
        durationMinutes: true,
        attempts: {
          where: { userId },
          select: { id: true, status: true, deadline: true, score: true },
        },
        _count: { select: { questions: true, problems: true } },
      },
    });
    const testByOrder = new Map(tests.map((test) => [test.order, test]));

    return tests.filter((test) => test.status === 'PUBLISHED').map((test) => this.toStudentCard(test, testByOrder.get(test.order - 1)));
  }

  async getForStudent(userId: number, testId: number) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { id: true, status: true, order: true },
    });
    if (!test) throw new NotFoundException('Test not found.');
    if (test.status !== 'PUBLISHED') {
      this.logger.warn(`Forbidden student access to unpublished test ${testId} by user ${userId}.`);
      throw new ForbiddenException('This test is not available.');
    }

    const cards = await this.listForStudent(userId);
    return cards.find((card) => card.id === testId)!;
  }

  async assertCanStart(userId: number, test: Test): Promise<void> {
    if (test.order === 1) return;

    await this.attemptState.expireOverdue();
    const previousTest = await this.prisma.test.findUnique({
      where: { order: test.order - 1 },
      select: {
        id: true,
        title: true,
        attempts: { where: { userId }, select: { status: true } },
      },
    });
    if (!previousTest) return;

    const previousStatus = previousTest.attempts[0]?.status;
    if (previousStatus !== 'SUBMITTED' && previousStatus !== 'EXPIRED' && previousStatus !== 'TERMINATED') {
      this.logger.warn(`Forbidden start of locked test ${test.id} by user ${userId}.`);
      throw new ForbiddenException(`Complete the ${previousTest.title} first.`);
    }
  }

  private toStudentCard(test: StudentTestRecord, previousTest?: StudentTestRecord) {
    const attempt = test.attempts[0];
    let state: StudentTestState;
    let lockReason: string | null = null;

    if (attempt) {
      if (attempt.status === 'IN_PROGRESS' && !this.attemptState.isOverdue(attempt)) {
        state = 'IN_PROGRESS';
      } else if (attempt.status === 'SUBMITTED') {
        state = 'SUBMITTED';
      } else if (attempt.status === 'EXPIRED' || this.attemptState.isOverdue(attempt)) {
        state = 'EXPIRED';
      } else {
        state = 'TERMINATED';
      }
    } else if (test.order === 1 || this.isFinished(previousTest)) {
      state = 'AVAILABLE';
    } else {
      state = 'LOCKED';
      lockReason = `Complete the ${previousTest!.title} first.`;
    }

    return {
      id: test.id,
      title: test.title,
      type: test.type,
      order: test.order,
      durationMinutes: test.durationMinutes,
      itemCount: test.type === 'MCQ' ? test._count.questions : test._count.problems,
      state,
      lockReason,
      attemptId: attempt?.id ?? null,
      score: state === 'EXPIRED' ? null : (attempt?.score ?? null),
    };
  }

  private isFinished(test?: StudentTestRecord): boolean {
    if (!test) return true;
    const attempt = test.attempts[0];
    return (
      !!attempt &&
      (attempt.status === 'SUBMITTED' ||
        attempt.status === 'EXPIRED' ||
        attempt.status === 'TERMINATED' ||
        this.attemptState.isOverdue(attempt))
    );
  }
}
