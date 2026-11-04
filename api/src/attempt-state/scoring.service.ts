import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

/** Owner: Rami (Task 5). Used by MCQ submit, coding finish, and Esmaeel's termination. */
@Injectable()
export class ScoringService {
  // STUB: replace with real implementation (score from the saved answers, round1)
  async scoreMcqFromSaved(_tx: Tx, _attemptId: number) {
    return { score: 80, correctCount: 16, totalCount: 20 };
  }

  // STUB: replace with real implementation (sum of submitted points / total points, unsubmitted = 0)
  async scoreCoding(_tx: Tx, _attemptId: number) {
    return { score: 50, problems: [] as { problemId: number; title: string; submitted: boolean; points: number }[] };
  }
}
