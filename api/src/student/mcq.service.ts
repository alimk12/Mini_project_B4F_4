import { Injectable } from '@nestjs/common';
import { McqAnswerDto } from './dto/mcq-answer.dto';
import { McqSubmitDto } from './dto/mcq-submit.dto';

/** Owner: Rami (Task 5). API.md section 12. */
@Injectable()
export class McqService {
  // STUB: replace with real implementation (upsert one answer)
  async saveAnswer(_userId: number, _attemptId: number, questionId: number, dto: McqAnswerDto) {
    return { questionId, optionId: dto.optionId ?? null, savedAt: new Date().toISOString() };
  }

  // STUB: replace with real implementation (one transaction, score on the server)
  async submit(_userId: number, _attemptId: number, _dto: McqSubmitDto) {
    return { score: 80, label: '16 / 20 correct (80%)' };
  }
}
