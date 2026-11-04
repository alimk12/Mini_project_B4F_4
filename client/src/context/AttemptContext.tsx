import { createContext, ReactNode, useContext } from 'react';
import { ClientViolationType } from '../types/common.types';
import { RunResult, SubmitResult } from '../types/execution.types';
import { AttemptIntegrity, McqAnswerPayload, StudentAttempt } from '../types/student.types';

// SKELETON (Phase 0). Owner: Maya, Task 2 Parts B and G. The value shape is fixed (PROJECT-STRUCTURE.md 4.2).
interface Value {
  attempt: StudentAttempt | null;
  isAttemptLoading: boolean;
  attemptError: string | null;
  startAttempt(testId: number, acceptedRules: boolean): Promise<number | null>;
  loadAttempt(attemptId: number): Promise<void>;
  serverOffsetMs: number;
  isSubmitting: boolean;
  actionError: string | null;
  submitMcq(answers: McqAnswerPayload[]): Promise<boolean>;
  saveMcqAnswer(questionId: number, optionId: number | null): Promise<boolean>;
  savingQuestionIds: number[];
  runResults: Record<number, RunResult>;
  submitResults: Record<number, SubmitResult>;
  runningProblemId: number | null;
  runCode(problemId: number, code: string): Promise<boolean>;
  submitCode(problemId: number, code: string): Promise<boolean>;
  finishCoding(): Promise<boolean>;
  clearActionError(): void;
  integrity: AttemptIntegrity | null;
  lastWarning: string | null;
  reportViolation(type: ClientViolationType): Promise<void>;
  clearWarning(): void;
  isSessionReplaced: boolean;
}

const notYet = async () => false;
const EMPTY: Value = {
  attempt: null, isAttemptLoading: false, attemptError: null, startAttempt: async () => null, loadAttempt: async () => {},
  serverOffsetMs: 0, isSubmitting: false, actionError: null, submitMcq: notYet, saveMcqAnswer: notYet, savingQuestionIds: [],
  runResults: {}, submitResults: {}, runningProblemId: null, runCode: notYet, submitCode: notYet, finishCoding: notYet,
  clearActionError: () => {}, integrity: null, lastWarning: null, reportViolation: async () => {}, clearWarning: () => {},
  isSessionReplaced: false,
};

const Ctx = createContext<Value>(EMPTY);

export function AttemptProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={EMPTY}>{children}</Ctx.Provider>;
}

export function useAttempt() {
  return useContext(Ctx);
}
