import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { TestCaseDto } from './test-case.dto';

// Owner: Majed. STUB: replace @Allow() with the real validators and messages (API.md section 9).
export class ProblemDto {
  @ApiProperty({ example: 'Two Sum' })
  @Allow()
  title: string;

  @ApiProperty({ example: 'Return the indexes of the two numbers that add up to target.' })
  @Allow()
  description: string;

  @ApiProperty({ example: 'twoSum' })
  @Allow()
  functionName: string;

  @ApiProperty({ example: 50 })
  @Allow()
  points: number;

  @ApiProperty({ type: [TestCaseDto] })
  @Allow()
  testCases: TestCaseDto[];
}
