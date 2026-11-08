import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export class StartAttemptDto {
  @ApiProperty({ example: true, description: 'The student ticked the exam-rules pledge' })
  @Equals(true, { message: 'You must accept the exam rules to start.' })
  acceptedRules: boolean;
}
