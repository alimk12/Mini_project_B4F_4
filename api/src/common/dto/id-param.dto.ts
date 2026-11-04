import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

const positive = (name: string) => ({ message: `${name} must be a positive whole number.` });

export class TestIdParamDto {
  @Type(() => Number) @IsInt(positive('testId')) @Min(1, positive('testId'))
  testId: number;
}
export class AttemptIdParamDto {
  @Type(() => Number) @IsInt(positive('attemptId')) @Min(1, positive('attemptId'))
  attemptId: number;
}
export class QuestionIdParamDto {
  @Type(() => Number) @IsInt(positive('questionId')) @Min(1, positive('questionId'))
  questionId: number;
}
export class ProblemIdParamDto {
  @Type(() => Number) @IsInt(positive('problemId')) @Min(1, positive('problemId'))
  problemId: number;
}
export class AttemptProblemParamDto {
  @Type(() => Number) @IsInt(positive('attemptId')) @Min(1, positive('attemptId'))
  attemptId: number;
  @Type(() => Number) @IsInt(positive('problemId')) @Min(1, positive('problemId'))
  problemId: number;
}
export class AttemptQuestionParamDto {
  @Type(() => Number) @IsInt(positive('attemptId')) @Min(1, positive('attemptId'))
  attemptId: number;
  @Type(() => Number) @IsInt(positive('questionId')) @Min(1, positive('questionId'))
  questionId: number;
}
