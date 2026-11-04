import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ClientViolationType } from './dto/violation.dto';

export const terminatedLabel = (score: number | null) => `Terminated — exam rules violated (${score ?? 0}%)`;

/** Owner: Esmaeel (Task 3). API.md section 19. The server counts, warns and terminates. */
@Injectable()
export class IntegrityService {
  // STUB: replace with real implementation (groups, limits, 2 s dedupe, termination with Rami's scoring)
  async recordViolation(_userId: number, _attemptId: number, type: ClientViolationType) {
    return {
      type, counted: true, terminated: false,
      warning: 'You left full screen. Warning 1 of 1. Doing it again ends your exam.',
      focusViolations: 1, focusLimit: 2, clipboardViolations: 0, clipboardLimit: 3, result: null,
    };
  }

  // STUB: replace with real implementation (store the new key; on resume log NEW_SESSION)
  async issueSessionKey(_tx: Prisma.TransactionClient, _attemptId: number, _isResume: boolean): Promise<string> {
    return randomUUID();
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
