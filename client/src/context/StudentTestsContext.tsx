import { createContext, ReactNode, useContext } from 'react';
import { StudentResult, StudentTestCard } from '../types/student.types';

// SKELETON (Phase 0). Owner: Maya, Task 2 Part B. The value shape is fixed (PROJECT-STRUCTURE.md 4.2).
interface Value {
  tests: StudentTestCard[];
  isTestsLoading: boolean;
  testsError: string | null;
  loadTests(): Promise<void>;
  currentTest: StudentTestCard | null;
  isTestLoading: boolean;
  testError: string | null;
  loadTest(testId: number): Promise<void>;
  results: StudentResult[];
  isResultsLoading: boolean;
  resultsError: string | null;
  loadResults(): Promise<void>;
}

const EMPTY: Value = {
  tests: [], isTestsLoading: false, testsError: null, loadTests: async () => {},
  currentTest: null, isTestLoading: false, testError: null, loadTest: async () => {},
  results: [], isResultsLoading: false, resultsError: null, loadResults: async () => {},
};

const Ctx = createContext<Value>(EMPTY);

export function StudentTestsProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={EMPTY}>{children}</Ctx.Provider>;
}

export function useStudentTests() {
  return useContext(Ctx);
}
