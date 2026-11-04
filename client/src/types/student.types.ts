import { AttemptStatus, ClientViolationType, StudentTestState, TestType } from './common.types';
import { ExecutionMode } from './execution.types';

export interface StudentTestCard {
  id: number; title: string; type: TestType; order: number; durationMinutes: number; itemCount: number;
  state: StudentTestState; lockReason: string | null; attemptId: number | null; score: number | null;
}
export interface StudentQuestion { id: number; text: string; options: { id: number; text: string }[]; selectedOptionId: number | null }
export interface StudentProblem {
  id: number; title: string; description: string; functionName: string; points: number;
  sample: { args: unknown[]; expected: unknown } | null; runCount: number; runsRemaining: number;
  submission: { passedCount: number; totalCount: number; points: number; submittedAt: string } | null;
}
export interface AttemptIntegrity { focusViolations: number; focusLimit: number; clipboardViolations: number; clipboardLimit: number }
export interface AttemptResultInfo {
  score: number | null; label: string; correctCount?: number; totalCount?: number; terminationReason?: string;
  problems?: { problemId: number; title: string; submitted: boolean; points: number }[];
}
export interface StudentAttempt {
  id: number; testId: number; testTitle: string; type: TestType; status: AttemptStatus;
  startedAt: string; deadline: string; serverNow: string; submittedAt: string | null; terminatedAt: string | null;
  sessionKey: string | null; questions: StudentQuestion[] | null; problems: StudentProblem[] | null;
  executionMode: ExecutionMode | null; integrity: AttemptIntegrity; result: AttemptResultInfo | null;
}
export interface McqAnswerPayload { questionId: number; optionId: number }
export interface ViolationResult extends AttemptIntegrity {
  type: ClientViolationType; counted: boolean; terminated: boolean; warning: string | null;
  result: { score: number; label: string; terminationReason: string } | null;
}
export interface StudentResult {
  testId: number; testTitle: string; type: TestType; status: AttemptStatus; score: number | null; label: string;
  startedAt: string; submittedAt: string | null; terminatedAt: string | null; terminationReason: string | null;
}
