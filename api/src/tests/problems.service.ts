import { Injectable } from '@nestjs/common';
import { ProblemDto } from './dto/problem.dto';

const EXAMPLE_PROBLEM = { id: 3, title: 'Two Sum', description: 'Return the indexes of the two numbers that add up to target.', functionName: 'twoSum', points: 50, testCases: [{ id: 9, visibility: 'SAMPLE', args: [[2, 7, 11, 15], 9], expected: [0, 1] }] };

/** Owner: Majed (Task 4, Part A). API.md section 9. */
@Injectable()
export class ProblemsService {
  // STUB: replace with real implementation (1+ sample, 3+ hidden cases)
  async create(_testId: number, _dto: ProblemDto) {
    return EXAMPLE_PROBLEM;
  }

  // STUB: replace with real implementation
  async replace(problemId: number, _dto: ProblemDto) {
    return { ...EXAMPLE_PROBLEM, id: problemId };
  }

  // STUB: replace with real implementation
  async remove(_problemId: number) {
    return { message: 'Problem deleted.' };
  }
}
