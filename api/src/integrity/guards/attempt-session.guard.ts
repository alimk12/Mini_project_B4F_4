import { CanActivate, ConflictException, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../../auth/jwt-payload.interface';
import { ATTEMPT_SESSION_HEADER } from '../../common/constants';
import { PrismaService } from '../../prisma/prisma.service';

export const MSG_OTHER_SESSION = 'This attempt is open in another window or device. Open it again from My Tests to continue here.';

type AttemptRequest = Request & { params: { attemptId?: string }; user?: JwtPayload };

/**
 * Owner: Esmaeel (Task 3). API.md 19.4.
 */
@Injectable()
export class AttemptSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AttemptRequest>();
    const attemptId = Number(request.params.attemptId);
    if (!Number.isInteger(attemptId) || attemptId < 1 || !request.user) return true;

    const attempt = await this.prisma.attempt.findFirst({
      where: { id: attemptId, userId: request.user.sub },
      select: { status: true, sessionKey: true },
    });
    if (!attempt || attempt.status !== 'IN_PROGRESS') return true;

    const sessionKey = request.headers[ATTEMPT_SESSION_HEADER];
    if (typeof sessionKey !== 'string' || sessionKey !== attempt.sessionKey) {
      throw new ConflictException(MSG_OTHER_SESSION);
    }
    return true;
  }
}
