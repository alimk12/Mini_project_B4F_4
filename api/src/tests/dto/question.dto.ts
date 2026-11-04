import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Majed. STUB: replace @Allow() with the real validators and messages (API.md section 8).
export class OptionDto {
  @ApiProperty({ example: '32' })
  @Allow()
  text: string;

  @ApiProperty({ example: true })
  @Allow()
  isCorrect: boolean;
}

export class QuestionDto {
  @ApiProperty({ example: 'Which number comes next: 2, 4, 8, 16, ?' })
  @Allow()
  text: string;

  @ApiProperty({ type: [OptionDto] })
  @Allow()
  options: OptionDto[];
}
