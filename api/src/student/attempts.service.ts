import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

/** Owner: Rami (Task 5). API.md section 11 and 19.4–19.6. */
@Injectable()
export class AttemptsService {
  // STUB: replace with real implementation (pledge, order lock, one attempt, shuffled order, new session key)
  async start(_userId: number, testId: number) {
    return { created: true, view: { ...(await this.view(1, randomUUID())), testId } };
  }

  // STUB: replace with real implementation (only the student's own attempt, never correct options / hidden cases)
  async getForStudent(_userId: number, attemptId: number) {
    return this.view(attemptId, null);
  }

  // STUB: replace with real implementation
  async view(attemptId: number, sessionKey: string | null) {
    return {
      id: attemptId, testId: 1, testTitle: 'IQ Test', type: 'MCQ', status: 'IN_PROGRESS',
      startedAt: '2026-11-03T10:00:00.000Z', deadline: '2026-11-03T10:20:00.000Z', serverNow: new Date().toISOString(),
      submittedAt: null, terminatedAt: null, sessionKey,
      questions: [{ id: 7, text: 'Which number comes next: 2, 4, 8, 16, ?', options: [{ id: 22, text: '32' }, { id: 21, text: '24' }], selectedOptionId: null }],
      problems: null, executionMode: null,
      integrity: { focusViolations: 0, focusLimit: 2, clipboardViolations: 0, clipboardLimit: 3 }, result: null,
    };
  }
}
