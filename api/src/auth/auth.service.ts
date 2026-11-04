import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/** Owner: Esmaeel (Task 3, Part B). API.md section 6. */
@Injectable()
export class AuthService {
  // STUB: replace with real implementation (unique email → 409, bcrypt hash, role always STUDENT)
  async register(dto: RegisterDto) {
    return {
      accessToken: 'stub-token',
      user: { id: 3, fullName: dto.fullName ?? 'Lina Saleh', email: dto.email ?? 'lina@example.com', role: 'STUDENT' },
    };
  }

  // STUB: replace with real implementation (bcrypt compare, 401 "Invalid email or password.")
  async login(dto: LoginDto) {
    const isInstructor = String(dto.email ?? '').includes('instructor');
    return { accessToken: isInstructor ? 'stub-token-instructor' : 'stub-token-student', user: await this.getMe(isInstructor ? 2 : 1) };
  }

  // STUB: replace with real implementation
  async getMe(userId: number) {
    return userId === 2
      ? { id: 2, fullName: 'Instructor Demo', email: 'instructor@b4f.local', role: 'INSTRUCTOR' }
      : { id: userId, fullName: 'Lina Saleh', email: 'lina@b4f.local', role: 'STUDENT' };
  }
}
