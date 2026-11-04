import { AttemptStatus, TestStatus, TestType, ViolationGroup, ViolationType } from './common.types';

export interface InstructorTestSummary {
  id: number; title: string; type: TestType; order: number; durationMinutes: number; status: TestStatus;
  questionCount: number; problemCount: number; attemptCount: number; inProgressCount: number; isContentLocked: boolean;
}
export interface InstructorOption { id: number; text: string; isCorrect: boolean }
export interface InstructorQuestion { id: number; text: string; options: InstructorOption[] }
export interface InstructorTestCase { id: number; visibility: 'SAMPLE' | 'HIDDEN'; args: unknown[]; expected: unknown }
export interface InstructorProblem {
  id: number; title: string; description: string; functionName: string; points: number; testCases: InstructorTestCase[];
}
export interface InstructorTestDetail extends InstructorTestSummary {
  questions?: InstructorQuestion[]; problems?: InstructorProblem[];
}
export interface QuestionPayload { text: string; options: { text: string; isCorrect: boolean }[] }
export interface ProblemPayload {
  title: string; description: string; functionName: string; points: number;
  testCases: { visibility: 'SAMPLE' | 'HIDDEN'; args: unknown[]; expected: unknown }[];
}
export interface InstructorAttemptRow {
  id: number;
  student: { id: number; fullName: string; email: string };
  test: { id: number; title: string; type: TestType };
  status: AttemptStatus; startedAt: string; deadline: string; submittedAt: string | null; terminatedAt: string | null;
  timeUsedSeconds: number | null; score: number | null; violationCount: number; terminationReason: string | null;
}
export interface InstructorAttemptDetail extends InstructorAttemptRow {
  mcq?: { correctCount: number; totalCount: number };
  problems?: { problemId: number; title: string; runCount: number; submitted: boolean; passedCount: number | null; totalCount: number | null; points: number | null }[];
  violations: { type: ViolationType; group: ViolationGroup; counted: boolean; occurredAt: string }[];
}
export interface AttemptFilters { testId?: string; status?: string; search?: string }
