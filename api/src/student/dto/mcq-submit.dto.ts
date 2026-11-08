import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class McqAnswerItemDto {
  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt({ message: 'Answers must be a list of { questionId, optionId }.' })
  @Min(1, { message: 'Answers must be a list of { questionId, optionId }.' })
  questionId!: number;

  @ApiProperty({ example: 22 })
  @Type(() => Number)
  @IsInt({ message: 'Answers must be a list of { questionId, optionId }.' })
  @Min(1, { message: 'Answers must be a list of { questionId, optionId }.' })
  optionId!: number;
}

export class McqSubmitDto {
  @ApiProperty({ type: [McqAnswerItemDto] })
  @IsArray({ message: 'Answers must be a list of { questionId, optionId }.' })
  @ValidateNested({ each: true, message: 'Answers must be a list of { questionId, optionId }.' })
  @Type(() => McqAnswerItemDto)
  answers!: McqAnswerItemDto[];
}
