import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AttemptStateService } from '../attempt-state/attempt-state.service';
import { ClockService } from '../common/clock.service';
import { buildAttemptOrder } from '../common/attempt-order.util';
import { PrismaService } from '../prisma/prisma.service';
import { CodeExecutionService } from '../execution/code-execution.service';
import { IntegrityService } from '../integrity/integrity.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { StudentTestsService } from './student-tests.service';

const MSG_ALREADY_FINISHED = 'You have already finished this test.';

/** Owner: Rami (Task 5). API.md section 11 and 19.4–19.6. */
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
      if (this.attemptState.isOverdue(existing)) {
        await this.attemptState.expireOverdue();
        throw new ConflictException(MSG_ALREADY_FINISHED);
      }
      return this.resume(existing.id);
    }
    if (existing) throw new ConflictException(MSG_ALREADY_FINISHED);

    await this.studentTests.assertCanStart(userId, test);

    try {
      const questions =
        test.type === 'MCQ'
          ? await this.prisma.question.findMany({
              where: { testId },
              orderBy: { position: 'asc' },
              select: { id: true, options: { select: { id: true } } },
            })
          : [];
      const { questionOrder, optionOrder } = buildAttemptOrder(questions);
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
            questionOrder,
            optionOrder,
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

  // STUB: replace with real implementation (only the student's own attempt, never correct options / hidden cases)
  async getForStudent(_userId: number, attemptId: number) {
    return this.view(attemptId, null);
  }

  async view(attemptId: number, sessionKey: string | null) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        testId: true,
        status: true,
        startedAt: true,
        deadline: true,
        submittedAt: true,
        terminatedAt: true,
        terminationReason: true,
        score: true,
        questionOrder: true,
        optionOrder: true,
        mcqAnswers: { select: { questionId: true, optionId: true, isCorrect: true } },
        violations: { where: { counted: true }, select: { type: true } },
        test: {
          select: {
            title: true,
            type: true,
            questions: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                text: true,
                options: { orderBy: { position: 'asc' }, select: { id: true, text: true } },
              },
            },
            problems: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                functionName: true,
                points: true,
                testCases: {
                  where: { visibility: 'SAMPLE' },
                  orderBy: { position: 'asc' },
                  take: 1,
                  select: { args: true, expected: true },
                },
                results: {
                  where: { attemptId },
                  select: { runCount: true, submittedAt: true, passedCount: true, totalCount: true, points: true },
                },
              },
            },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');

    const focusTypes = ['FULLSCREEN_EXIT', 'TAB_HIDDEN'];
    const focusViolations = attempt.violations.filter((violation) => focusTypes.includes(violation.type)).length;
    const clipboardViolations = attempt.violations.length - focusViolations;
    const questionOrder = Array.isArray(attempt.questionOrder)
      ? attempt.questionOrder.filter((id): id is number => typeof id === 'number')
      : [];
    const optionOrder =
      attempt.optionOrder && typeof attempt.optionOrder === 'object' && !Array.isArray(attempt.optionOrder)
        ? (attempt.optionOrder as Record<string, Prisma.JsonValue>)
        : {};
    const questionsById = new Map(attempt.test.questions.map((question) => [question.id, question]));
    const answersByQuestion = new Map(attempt.mcqAnswers.map((answer) => [answer.questionId, answer]));
    const orderedQuestions = questionOrder.length
      ? questionOrder.map((id) => questionsById.get(id)).filter((question): question is NonNullable<typeof question> => !!question)
      : attempt.test.questions;
    const questions = orderedQuestions.map((question) => {
      const rawOptionOrder = optionOrder[String(question.id)];
      const optionIds = Array.isArray(rawOptionOrder) ? rawOptionOrder.filter((id): id is number => typeof id === 'number') : [];
      const optionsById = new Map(question.options.map((option) => [option.id, option]));
      const options = optionIds.length
        ? optionIds.map((id) => optionsById.get(id)).filter((option): option is NonNullable<typeof option> => !!option)
        : question.options;
      return { id: question.id, text: question.text, options, selectedOptionId: answersByQuestion.get(question.id)?.optionId ?? null };
    });
    const problems = attempt.test.problems.map((problem) => {
      const result = problem.results[0];
      const sample = problem.testCases[0];
      return {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        functionName: problem.functionName,
        points: problem.points,
        sample: sample ? { args: sample.args, expected: sample.expected } : null,
        runCount: result?.runCount ?? 0,
        runsRemaining: 20 - (result?.runCount ?? 0),
        submission: result?.submittedAt
          ? {
              passedCount: result.passedCount,
              totalCount: result.totalCount,
              points: result.points,
              submittedAt: result.submittedAt.toISOString(),
            }
          : null,
      };
    });
    const isFinished = attempt.status !== 'IN_PROGRESS';
    let result: Record<string, unknown> | null = null;
    if (attempt.status === 'EXPIRED') {
      result = { score: null, label: 'Expired — not submitted' };
    } else if (attempt.status === 'TERMINATED') {
      result = {
        score: attempt.score,
        label: `Terminated — exam rules violated (${attempt.score ?? 0}%)`,
        terminationReason: attempt.terminationReason,
      };
    } else if (attempt.status === 'SUBMITTED') {
      if (attempt.test.type === 'MCQ') {
        const correctCount = attempt.mcqAnswers.filter((answer) => answer.isCorrect).length;
        const totalCount = attempt.test.questions.length;
        result = {
          correctCount,
          totalCount,
          score: attempt.score,
          label: `${correctCount} / ${totalCount} correct (${attempt.score ?? 0}%)`,
        };
      } else {
        result = { score: attempt.score, label: `Coding score: ${attempt.score ?? 0}%` };
      }
    }

    return {
      id: attempt.id,
      testId: attempt.testId,
      testTitle: attempt.test.title,
      type: attempt.test.type,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      deadline: attempt.deadline.toISOString(),
      serverNow: this.clock.now().toISOString(),
      submittedAt: attempt.submittedAt?.toISOString() ?? null,
      terminatedAt: attempt.terminatedAt?.toISOString() ?? null,
      sessionKey,
      questions: isFinished || attempt.test.type !== 'MCQ' ? null : questions,
      problems: isFinished || attempt.test.type !== 'CODING' ? null : problems,
      executionMode: attempt.test.type === 'CODING' ? this.execution.getMode() : null,
      integrity: { focusViolations, focusLimit: 2, clipboardViolations, clipboardLimit: 3 },
      result,
    };
  }

  private async resume(attemptId: number) {
    const sessionKey = await this.prisma.$transaction((tx) => this.integrity.issueSessionKey(tx, attemptId, true));
    return { created: false, view: await this.view(attemptId, sessionKey) };
  }
}
