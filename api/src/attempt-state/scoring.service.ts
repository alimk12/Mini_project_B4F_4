import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { round1 } from '../common/round.util';

type Tx = Prisma.TransactionClient;

@Injectable()
export class ScoringService {
  async scoreMcqFromSaved(tx: Tx, attemptId: number) {
    const attempt = await tx.attempt.findUniqueOrThrow({
      where: { id: attemptId },
      select: { testId: true },
    });
    const [correctCount, totalCount] = await Promise.all([
      tx.mcqAnswer.count({ where: { attemptId, isCorrect: true } }),
      tx.question.count({ where: { testId: attempt.testId } }),
    ]);

    return {
      score: totalCount === 0 ? 0 : round1((correctCount / totalCount) * 100),
      correctCount,
      totalCount,
    };
  }

  async scoreCoding(tx: Tx, attemptId: number) {
    await tx.problemResult.updateMany({
      where: { attemptId, submittedAt: null },
      data: { points: 0 },
    });

    const results = await tx.problemResult.findMany({
      where: { attemptId },
      select: {
        problemId: true,
        points: true,
        submittedAt: true,
        problem: { select: { title: true, points: true } },
      },
    });
    const totalPoints = results.reduce((sum, result) => sum + result.problem.points, 0);
    const earnedPoints = results.reduce((sum, result) => sum + (result.points ?? 0), 0);

    return {
      score: totalPoints === 0 ? 0 : round1((earnedPoints / totalPoints) * 100),
      problems: results.map((result) => ({
        problemId: result.problemId,
        title: result.problem.title,
        submitted: result.submittedAt !== null,
        points: result.points ?? 0,
      })),
    };
  }
}
