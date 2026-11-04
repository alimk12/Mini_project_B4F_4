import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Esmaeel. STUB: replace @Allow() with the real validators and messages (API.md section 6).
export class RegisterDto {
  @ApiProperty({ example: 'Lina Saleh' })
  @Allow()
  fullName: string;

  @ApiProperty({ example: 'lina@example.com' })
  @Allow()
  email: string;

  @ApiProperty({ example: 'secret123' })
  @Allow()
  password: string;
}
