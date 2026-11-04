import { Injectable } from '@nestjs/common';
import { AttemptsQueryDto } from './dto/attempts-query.dto';

const EXAMPLE_ROW = {
  id: 12, student: { id: 3, fullName: 'Lina Saleh', email: 'lina@example.com' }, test: { id: 1, title: 'IQ Test', type: 'MCQ' },
  status: 'SUBMITTED', startedAt: '2026-11-03T10:00:00.000Z', deadline: '2026-11-03T10:20:00.000Z',
  submittedAt: '2026-11-03T10:17:00.000Z', terminatedAt: null, timeUsedSeconds: 1020, score: 80, violationCount: 0, terminationReason: null,
};

/** Owner: Esmaeel (Task 3, Part D). API.md sections 15–16. */
@Injectable()
export class ResultsService {
  // STUB: replace with real implementation (expireOverdue first, filters, newest first)
  async listAttempts(_q: AttemptsQueryDto) {
    return [EXAMPLE_ROW];
  }

  // STUB: replace with real implementation (404 when missing)
  async getAttemptDetail(attemptId: number) {
    return { ...EXAMPLE_ROW, id: attemptId, mcq: { correctCount: 16, totalCount: 20 }, violations: [] };
  }

  // STUB: replace with real implementation (only finished attempts of this student)
  async listStudentResults(_userId: number) {
    return [{
      testId: 1, testTitle: 'IQ Test', type: 'MCQ', status: 'SUBMITTED', score: 80, label: '16 / 20 correct (80%)',
      startedAt: '2026-11-03T10:00:00.000Z', submittedAt: '2026-11-03T10:17:00.000Z', terminatedAt: null, terminationReason: null,
    }];
  }
}
