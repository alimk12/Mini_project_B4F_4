import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Owner: Esmaeel (Task 3, Part B).
 * STUB: replace with real implementation — verify the Bearer token with JwtService,
 * put the payload on request.user, 401 "Please sign in to continue." otherwise.
 * For now every request passes as a fake user, so all routes answer with stub data:
 * a token containing "instructor" acts as the instructor (id 2), anything else as a student (id 1).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const isInstructor = String(req.headers.authorization ?? '').includes('instructor');
    req.user = isInstructor
      ? { sub: 2, email: 'instructor@b4f.local', role: 'INSTRUCTOR' }
      : { sub: 1, email: 'lina@b4f.local', role: 'STUDENT' };
    return true;
  }
}
