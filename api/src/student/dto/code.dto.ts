import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// Owner: Rami. STUB: replace @Allow() with the real validators and messages (API.md section 14).
export class CodeDto {
  @ApiProperty({ example: 'function twoSum(nums, target) {\n  return [0, 1];\n}' })
  @Allow()
  code: string;
}
