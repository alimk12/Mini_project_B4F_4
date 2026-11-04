import { CanActivate, Injectable } from '@nestjs/common';

/**
 * Owner: Esmaeel (Task 3, Part B).
 * STUB: replace with real implementation — read @Roles() with Reflector,
 * 403 "You do not have permission to do this." when the role does not match.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}
