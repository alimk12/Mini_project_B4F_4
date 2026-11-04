import { CanActivate, Injectable } from '@nestjs/common';

export const MSG_OTHER_SESSION =
  'This attempt is open in another window or device. Only one window can take the exam at a time.';

/**
 * Owner: Esmaeel (Task 3). API.md 19.4.
 * STUB: replace with real implementation — compare X-Attempt-Session with attempt.sessionKey → 409 MSG_OTHER_SESSION.
 */
@Injectable()
export class AttemptSessionGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}
