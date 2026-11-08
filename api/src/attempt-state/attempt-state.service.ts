import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Attempt } from '@prisma/client';
import { ClockService } from '../common/clock.service';
import { PrismaService } from '../prisma/prisma.service';

export const GRACE_SECONDS = 10;
export const MSG_SUBMITTED = 'This test has already been submitted.';
export const MSG_TERMINATED = 'This attempt was ended because the exam rules were broken.';
export const MSG_TIME_OVER = 'Time is over. This attempt expired and was not submitted.';

@Injectable()
export class AttemptStateService {
  private readonly logger = new Logger(AttemptStateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  isOverdue(attempt: Pick<Attempt, 'status' | 'deadline'>, now: Date = this.clock.now()): boolean {
    return attempt.status === 'IN_PROGRESS' && now.getTime() > attempt.deadline.getTime() + GRACE_SECONDS * 1000;
  }

  async expireOverdue() {
    const cutoff = this.clock.now();
    cutoff.setTime(cutoff.getTime() - GRACE_SECONDS * 1000);

    const result = await this.prisma.attempt.updateMany({
      where: { status: 'IN_PROGRESS', deadline: { lt: cutoff } },
      data: { status: 'EXPIRED', score: null },
    });

    this.logger.log(`Expired ${result.count} overdue attempt(s).`);
    return result.count;
  }

  async assertAcceptingRequests(attempt: Pick<Attempt, 'id' | 'status' | 'deadline'>) {
    if (attempt.status === 'SUBMITTED') {
      throw new ConflictException(MSG_SUBMITTED);
    }
    if (attempt.status === 'TERMINATED') {
      throw new ConflictException(MSG_TERMINATED);
    }
    if (attempt.status === 'EXPIRED' || this.isOverdue(attempt, this.clock.now())) {
      if (attempt.status !== 'EXPIRED') {
        await this.prisma.attempt.updateMany({
          where: { id: attempt.id, status: 'IN_PROGRESS' },
          data: { status: 'EXPIRED', score: null },
        });
      }
      this.logger.warn(`Rejected late request for attempt ${attempt.id}.`);
      throw new ConflictException(MSG_TIME_OVER);
    }
  }

  async hasAttempts(testId: number) {
    return (await this.prisma.attempt.count({ where: { testId } })) > 0;
  }

  async hasActiveAttempts(testId: number) {
    await this.expireOverdue();
    return (await this.prisma.attempt.count({ where: { testId, status: 'IN_PROGRESS' } })) > 0;
  }
}
