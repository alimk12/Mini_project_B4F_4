import { Injectable } from '@nestjs/common';
import { Attempt } from '@prisma/client';

/**
 * Owner: Rami (Task 5). The single place that decides an attempt's state.
 * Rami: write the attempt state table (every state, every request, every result) here in your first PR.
 */
export const MSG_SUBMITTED = 'This test has already been submitted.';
export const MSG_TERMINATED = 'This attempt was ended because the exam rules were broken.';
export const MSG_TIME_OVER = 'Time is over. This attempt expired and was not submitted.';

@Injectable()
export class AttemptStateService {
  // STUB: replace with real implementation (deadline + GRACE_SECONDS against ClockService.now())
  isOverdue(_attempt: Pick<Attempt, 'status' | 'deadline'>): boolean {
    return false;
  }

  // STUB: replace with real implementation (conditional updateMany IN_PROGRESS → EXPIRED, score null)
  async expireOverdue(): Promise<number> {
    return 0;
  }

  // STUB: replace with real implementation (409 with MSG_SUBMITTED / MSG_TERMINATED / MSG_TIME_OVER)
  async assertAcceptingRequests(_attempt: Pick<Attempt, 'id' | 'status' | 'deadline'>): Promise<void> {}

  // STUB: replace with real implementation (used by Majed for the content lock)
  async hasAttempts(_testId: number): Promise<boolean> {
    return false;
  }

  // STUB: replace with real implementation (used by Majed for unpublish)
  async hasActiveAttempts(_testId: number): Promise<boolean> {
    return false;
  }
}
