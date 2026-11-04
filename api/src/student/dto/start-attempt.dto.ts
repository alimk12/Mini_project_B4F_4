import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Rami. STUB: replace @Allow() with @Equals(true, { message: 'You must accept the exam rules to start.' }).
export class StartAttemptDto {
  @ApiProperty({ example: true, description: 'The student ticked the exam-rules pledge' })
  @Allow()
  acceptedRules: boolean;
}
