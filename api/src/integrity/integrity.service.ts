import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AttemptStateService } from '../attempt-state/attempt-state.service';
import { ScoringService } from '../attempt-state/scoring.service';
import { CLIPBOARD_VIOLATION_LIMIT, FOCUS_VIOLATION_LIMIT, VIOLATION_DEDUPE_SECONDS } from '../common/constants';
import { ClockService } from '../common/clock.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClientViolationType } from './dto/violation.dto';

export const terminatedLabel = (score: number | null) => `Terminated — exam rules violated (${score ?? 0}%)`;
const FOCUS_TYPES = ['FULLSCREEN_EXIT', 'TAB_HIDDEN'] as const;
const CLIPBOARD_TYPES = ['COPY', 'CUT', 'PASTE_EXTERNAL', 'DROP_EXTERNAL'] as const;
const FOCUS_WARNING = 'You left full screen or switched away from the exam. If it happens again, your exam will end.';
const CLIPBOARD_WARNINGS = [
  'Copy and paste are not allowed during the exam. Warning 1 of 2. A third attempt ends your exam.',
  'Copy and paste are not allowed during the exam. Warning 2 of 2. The next attempt ends your exam.',
];

@Injectable()
export class IntegrityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attemptState: AttemptStateService,
    private readonly scoring: ScoringService,
    private readonly clock: ClockService,
  ) {}

  async recordViolation(userId: number, attemptId: number, type: ClientViolationType) {
    const now = this.clock.now();
    const attempt = await this.prisma.attempt.findFirst({
      where: { id: attemptId, userId },
      select: { id: true, status: true, deadline: true, test: { select: { type: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    await this.attemptState.assertAcceptingRequests(attempt);

    const isFocus = (FOCUS_TYPES as readonly string[]).includes(type);
    const groupTypes = isFocus ? FOCUS_TYPES : CLIPBOARD_TYPES;
    const limit = isFocus ? FOCUS_VIOLATION_LIMIT : CLIPBOARD_VIOLATION_LIMIT;
    const dedupeCutoff = new Date(now.getTime() - VIOLATION_DEDUPE_SECONDS * 1000);

    return this.prisma.$transaction(async (tx) => {
      const recentCounted = await tx.attemptViolation.findFirst({
        where: {
          attemptId,
          counted: true,
          type: { in: [...groupTypes] },
          occurredAt: { gt: dedupeCutoff },
        },
        select: { id: true },
      });
      const counted = !recentCounted;

      await tx.attemptViolation.create({ data: { attemptId, type, counted, occurredAt: now } });
      const groupCount = await tx.attemptViolation.count({
        where: { attemptId, counted: true, type: { in: [...groupTypes] } },
      });
      const focusViolations = await tx.attemptViolation.count({
        where: { attemptId, counted: true, type: { in: [...FOCUS_TYPES] } },
      });
      const clipboardViolations = await tx.attemptViolation.count({
        where: { attemptId, counted: true, type: { in: [...CLIPBOARD_TYPES] } },
      });
      const terminated = counted && groupCount >= limit;
      let result: { score: number; label: string; terminationReason: string } | null = null;

      if (terminated) {
        const terminationReason = isFocus ? 'Left full screen or switched away from the exam 2 times.' : 'Tried to copy or paste 3 times.';
        const changed = await tx.attempt.updateMany({
          where: { id: attemptId, status: 'IN_PROGRESS' },
          data: { status: 'TERMINATED', terminatedAt: now, terminationReason },
        });

        if (changed.count === 1) {
          const scoringResult =
            attempt.test.type === 'MCQ'
              ? await this.scoring.scoreMcqFromSaved(tx, attemptId)
              : await this.scoring.scoreCoding(tx, attemptId);
          await tx.attempt.update({ where: { id: attemptId }, data: { score: scoringResult.score } });
          result = {
            score: scoringResult.score,
            label: terminatedLabel(scoringResult.score),
            terminationReason,
          };
        }
      }

      return {
        type,
        group: isFocus ? 'FOCUS' : 'CLIPBOARD',
        counted,
        focusViolations,
        focusLimit: FOCUS_VIOLATION_LIMIT,
        clipboardViolations,
        clipboardLimit: CLIPBOARD_VIOLATION_LIMIT,
        terminated: result !== null,
        warning: !counted || result ? null : isFocus ? FOCUS_WARNING : CLIPBOARD_WARNINGS[groupCount - 1],
        result,
      };
    });
  }

  async issueSessionKey(tx: Prisma.TransactionClient, attemptId: number, isResume: boolean): Promise<string> {
    const sessionKey = randomUUID();
    await tx.attempt.update({ where: { id: attemptId }, data: { sessionKey } });
    if (isResume) {
      await tx.attemptViolation.create({
        data: { attemptId, type: 'NEW_SESSION', counted: false, occurredAt: this.clock.now() },
      });
    }
    return sessionKey;
  }

  // STUB: replace with real implementation
  async getIntegrity(_attemptId: number) {
    return { focusViolations: 0, focusLimit: 2, clipboardViolations: 0, clipboardLimit: 3 };
  }

  // STUB: replace with real implementation
  async listViolations(_attemptId: number) {
    return [{ type: 'FULLSCREEN_EXIT', group: 'FOCUS', counted: true, occurredAt: '2026-11-03T10:05:00.000Z' }];
  }
}
