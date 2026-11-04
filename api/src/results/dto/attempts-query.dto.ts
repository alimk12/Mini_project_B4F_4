import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Esmaeel. STUB: replace @Allow() with the real validators and messages (API.md section 15).
export class AttemptsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Allow()
  testId?: number;

  @ApiPropertyOptional({ enum: ['IN_PROGRESS', 'SUBMITTED', 'EXPIRED', 'TERMINATED'] })
  @Allow()
  status?: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'TERMINATED';

  @ApiPropertyOptional({ example: 'lina' })
  @Allow()
  search?: string;
}
