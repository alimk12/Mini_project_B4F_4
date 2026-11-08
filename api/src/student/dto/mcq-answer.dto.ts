import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, ValidateIf } from 'class-validator';

export class McqAnswerDto {
  @ApiProperty({ example: 22, nullable: true })
  @ValidateIf((_object, value) => value !== null)
  @Type(() => Number)
  @IsInt({ message: 'optionId must be a positive whole number or null.' })
  @Min(1, { message: 'optionId must be a positive whole number or null.' })
  optionId!: number | null;
}
