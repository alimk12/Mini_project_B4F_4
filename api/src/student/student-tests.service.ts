import { Injectable } from '@nestjs/common';
import { Test } from '@prisma/client';

const EXAMPLE_CARD = { id: 1, title: 'IQ Test', type: 'MCQ', order: 1, durationMinutes: 20, itemCount: 12, state: 'AVAILABLE', lockReason: null, attemptId: null, score: null };

/** Owner: Rami (Task 5). API.md section 10. */
@Injectable()
export class StudentTestsService {
  // STUB: replace with real implementation (published tests in order, state per student)
  async listForStudent(_userId: number) {
    return [
      EXAMPLE_CARD,
      { ...EXAMPLE_CARD, id: 2, title: 'HTML & CSS Test', order: 2, state: 'LOCKED', lockReason: 'Complete the IQ Test first.' },
    ];
  }

  // STUB: replace with real implementation (403 "This test is not available." when unpublished)
  async getForStudent(_userId: number, testId: number) {
    return { ...EXAMPLE_CARD, id: testId };
  }

  // STUB: replace with real implementation (403 lock reason / 409 already finished)
  async assertCanStart(_userId: number, _test: Test): Promise<void> {}
}
