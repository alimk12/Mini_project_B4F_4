import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Majed. STUB: replace @Allow() with the real validators and messages (API.md section 9).
export class TestCaseDto {
  @ApiProperty({ enum: ['SAMPLE', 'HIDDEN'] })
  @Allow()
  visibility: 'SAMPLE' | 'HIDDEN';

  @ApiProperty({ example: [[2, 7, 11, 15], 9], description: 'The function arguments, in order' })
  @Allow()
  args: unknown[];

  @ApiProperty({ example: [0, 1], description: 'The value the function must return' })
  @Allow()
  expected: unknown;
}
