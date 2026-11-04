import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Rami. STUB: replace @Allow() with the real validators and messages (API.md section 12).
export class McqAnswerDto {
  @ApiProperty({ example: 22, nullable: true })
  @Allow()
  optionId: number | null;
}
