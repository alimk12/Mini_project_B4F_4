import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AttemptStateService } from '../attempt-state/attempt-state.service';
import { ScoringService } from '../attempt-state/scoring.service';
import { ClockService } from '../common/clock.service';
import { PrismaService } from '../prisma/prisma.service';
import { McqAnswerDto } from './dto/mcq-answer.dto';
import { McqSubmitDto } from './dto/mcq-submit.dto';

const MSG_NOT_MCQ = 'This action is only for MCQ tests.';
const MSG_INVALID_QUESTION = 'An answer refers to a question that is not part of this test.';
const MSG_INVALID_OPTION = 'An answer refers to an option that does not belong to its question.';
const MSG_DUPLICATE_QUESTION = 'Each question can be answered only once.';

@Injectable()
export class McqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attemptState: AttemptStateService,
    private readonly scoring: ScoringService,
    private readonly clock: ClockService,
  ) {}

  async saveAnswer(userId: number, attemptId: number, questionId: number, dto: McqAnswerDto) {
    const attempt = await this.prisma.attempt.findFirst({
      where: { id: attemptId, userId },
      select: { id: true, testId: true, status: true, deadline: true, test: { select: { type: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (attempt.test.type !== 'MCQ') throw new BadRequestException(MSG_NOT_MCQ);
    await this.attemptState.assertAcceptingRequests(attempt);

    const question = await this.prisma.question.findFirst({
      where: { id: questionId, testId: attempt.testId },
      select: { id: true },
    });
    if (!question) throw new BadRequestException(MSG_INVALID_QUESTION);

    let isCorrect = false;
    if (dto.optionId !== null) {
      const option = await this.prisma.option.findFirst({
        where: { id: dto.optionId, questionId },
        select: { id: true, isCorrect: true },
      });
      if (!option) throw new BadRequestException(MSG_INVALID_OPTION);
      isCorrect = option.isCorrect;
    }

    const savedAt = this.clock.now();
    await this.prisma.mcqAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      create: { attemptId, questionId, optionId: dto.optionId, isCorrect },
      update: { optionId: dto.optionId, isCorrect },
    });

    return { questionId, optionId: dto.optionId, savedAt: savedAt.toISOString() };
  }

  async submit(userId: number, attemptId: number, dto: McqSubmitDto) {
    if (!Array.isArray(dto.answers)) {
      throw new BadRequestException('Answers must be a list of { questionId, optionId }.');
    }
    for (const answer of dto.answers) {
      if (!Number.isInteger(answer?.questionId) || answer.questionId <= 0 || !Number.isInteger(answer?.optionId) || answer.optionId <= 0) {
        throw new BadRequestException('Answers must be a list of { questionId, optionId }.');
      }
    }

    const attempt = await this.prisma.attempt.findFirst({
      where: { id: attemptId, userId },
      select: {
        id: true,
        testId: true,
        status: true,
        deadline: true,
        test: {
          select: {
            type: true,
            questions: { select: { id: true, options: { select: { id: true, isCorrect: true } } } },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (attempt.test.type !== 'MCQ') throw new BadRequestException(MSG_NOT_MCQ);
    await this.attemptState.assertAcceptingRequests(attempt);

    const questionIds = new Set<number>();
    for (const answer of dto.answers) {
      if (questionIds.has(answer.questionId)) throw new BadRequestException(MSG_DUPLICATE_QUESTION);
      questionIds.add(answer.questionId);
    }

    const questionsById = new Map(attempt.test.questions.map((question) => [question.id, question]));
    const answersByQuestion = new Map<number, (typeof dto.answers)[number]>();
    for (const answer of dto.answers) {
      const question = questionsById.get(answer.questionId);
      if (!question) throw new BadRequestException(MSG_INVALID_QUESTION);
      if (!question.options.some((option) => option.id === answer.optionId)) {
        throw new BadRequestException(MSG_INVALID_OPTION);
      }
      answersByQuestion.set(answer.questionId, answer);
    }

    const submittedAt = this.clock.now();
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.attempt.updateMany({
        where: { id: attemptId, userId, status: 'IN_PROGRESS' },
        data: { status: 'SUBMITTED', submittedAt },
      });
      if (changed.count !== 1) {
        throw new ConflictException('This test has already been submitted.');
      }

      await tx.mcqAnswer.deleteMany({ where: { attemptId } });
      await tx.mcqAnswer.createMany({
        data: attempt.test.questions.map((question) => {
          const answer = answersByQuestion.get(question.id);
          const option = answer && question.options.find((item) => item.id === answer.optionId);
          return {
            attemptId,
            questionId: question.id,
            optionId: answer?.optionId ?? null,
            isCorrect: option?.isCorrect ?? false,
          };
        }),
      });

      const score = await this.scoring.scoreMcqFromSaved(tx, attemptId);
      await tx.attempt.update({ where: { id: attemptId }, data: { score: score.score } });

      return {
        attemptId,
        status: 'SUBMITTED' as const,
        correctCount: score.correctCount,
        totalCount: score.totalCount,
        score: score.score,
        label: `${score.correctCount} / ${score.totalCount} correct (${score.score}%)`,
        submittedAt: submittedAt.toISOString(),
      };
    });
  }
}
