import { Injectable } from '@nestjs/common';

const EXAMPLE_TEST = { id: 1, title: 'IQ Test', type: 'MCQ', order: 1, durationMinutes: 20, status: 'PUBLISHED', questionCount: 12, problemCount: 0, attemptCount: 0, inProgressCount: 0, isContentLocked: false };

/** Owner: Majed (Task 4, Part A). API.md section 7. */
@Injectable()
export class InstructorTestsService {
  // STUB: replace with real implementation (the three tests in order, with counts)
  async findAll() {
    return [EXAMPLE_TEST];
  }

  // STUB: replace with real implementation (questions with isCorrect, or problems with every test case)
  async findOne(testId: number) {
    return {
      ...EXAMPLE_TEST, id: testId,
      questions: [{ id: 7, text: 'Which number comes next: 2, 4, 8, 16, ?', options: [{ id: 21, text: '24', isCorrect: false }, { id: 22, text: '32', isCorrect: true }] }],
    };
  }

  // STUB: replace with real implementation (MCQ needs 5+ questions, coding 1+ problem → 409 otherwise)
  async publish(testId: number) {
    return { ...EXAMPLE_TEST, id: testId, status: 'PUBLISHED' };
  }

  // STUB: replace with real implementation (409 while an attempt is IN_PROGRESS)
  async unpublish(testId: number) {
    return { ...EXAMPLE_TEST, id: testId, status: 'DRAFT' };
  }

  // STUB: replace with real implementation (409 "Content is locked because a student has started this test.")
  async assertContentEditable(_testId: number): Promise<void> {}
}
