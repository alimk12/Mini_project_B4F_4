import { createContext, ReactNode, useContext } from 'react';
import { InstructorTestDetail, InstructorTestSummary, ProblemPayload, QuestionPayload } from '../types/instructor.types';

// SKELETON (Phase 0). Owner: Ali, Task 1. The value shape is fixed (PROJECT-STRUCTURE.md 4.2).
interface Value {
  tests: InstructorTestSummary[];
  isTestsLoading: boolean;
  testsError: string | null;
  loadTests(): Promise<void>;
  currentTest: InstructorTestDetail | null;
  isTestLoading: boolean;
  testError: string | null;
  loadTest(testId: number): Promise<void>;
  isSaving: boolean;
  actionError: string | null;
  publishTest(testId: number): Promise<boolean>;
  unpublishTest(testId: number): Promise<boolean>;
  saveQuestion(testId: number, payload: QuestionPayload, questionId?: number): Promise<boolean>;
  deleteQuestion(questionId: number): Promise<boolean>;
  saveProblem(testId: number, payload: ProblemPayload, problemId?: number): Promise<boolean>;
  deleteProblem(problemId: number): Promise<boolean>;
  clearActionError(): void;
}

const notYet = async () => false;
const EMPTY: Value = {
  tests: [], isTestsLoading: false, testsError: null, loadTests: async () => {},
  currentTest: null, isTestLoading: false, testError: null, loadTest: async () => {},
  isSaving: false, actionError: null, publishTest: notYet, unpublishTest: notYet,
  saveQuestion: notYet, deleteQuestion: notYet, saveProblem: notYet, deleteProblem: notYet, clearActionError: () => {},
};

const Ctx = createContext<Value>(EMPTY);

export function InstructorTestsProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={EMPTY}>{children}</Ctx.Provider>;
}

export function useInstructorTests() {
  return useContext(Ctx);
}
