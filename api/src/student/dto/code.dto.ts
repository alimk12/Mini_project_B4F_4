import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class CodeDto {
  @ApiProperty({ example: 'function twoSum(nums, target) {\n  return [0, 1];\n}' })
  @IsString({ message: 'Code cannot be empty.' })
  @Matches(/\S/, { message: 'Code cannot be empty.' })
  @MaxLength(10_000, { message: 'Code cannot be longer than 10,000 characters.' })
  code: string;
}
