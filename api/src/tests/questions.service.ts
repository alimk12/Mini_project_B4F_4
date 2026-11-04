import { Injectable } from '@nestjs/common';
import { QuestionDto } from './dto/question.dto';

/** Owner: Majed (Task 4, Part A). API.md section 8. */
@Injectable()
export class QuestionsService {
  // STUB: replace with real implementation
  async create(_testId: number, dto: QuestionDto) {
    return { id: 7, text: dto.text ?? 'Which number comes next: 2, 4, 8, 16, ?', options: [{ id: 21, text: '24', isCorrect: false }, { id: 22, text: '32', isCorrect: true }] };
  }

  // STUB: replace with real implementation
  async replace(questionId: number, dto: QuestionDto) {
    return { id: questionId, text: dto.text ?? 'Which number comes next: 2, 4, 8, 16, ?', options: [{ id: 23, text: '32', isCorrect: true }, { id: 24, text: '30', isCorrect: false }] };
  }

  // STUB: replace with real implementation
  async remove(_questionId: number) {
    return { message: 'Question deleted.' };
  }
}
