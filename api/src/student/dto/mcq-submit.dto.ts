import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Rami. STUB: replace @Allow() with the real validators and messages (API.md section 12).
export class McqAnswerItemDto {
  @ApiProperty({ example: 7 })
  @Allow()
  questionId: number;

  @ApiProperty({ example: 22 })
  @Allow()
  optionId: number;
}

export class McqSubmitDto {
  @ApiProperty({ type: [McqAnswerItemDto] })
  @Allow()
  answers: McqAnswerItemDto[];
}
