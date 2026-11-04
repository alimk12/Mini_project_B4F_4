import { createContext, ReactNode, useContext } from 'react';
import { AttemptFilters, InstructorAttemptDetail, InstructorAttemptRow } from '../types/instructor.types';

// SKELETON (Phase 0). Owner: Ali, Task 1. The value shape is fixed (PROJECT-STRUCTURE.md 4.2).
interface Value {
  attempts: InstructorAttemptRow[];
  isAttemptsLoading: boolean;
  attemptsError: string | null;
  loadAttempts(filters: AttemptFilters): Promise<void>;
  selectedAttempt: InstructorAttemptDetail | null;
  isDetailLoading: boolean;
  detailError: string | null;
  loadAttemptDetail(attemptId: number): Promise<void>;
  closeDetail(): void;
}

const EMPTY: Value = {
  attempts: [], isAttemptsLoading: false, attemptsError: null, loadAttempts: async () => {},
  selectedAttempt: null, isDetailLoading: false, detailError: null, loadAttemptDetail: async () => {}, closeDetail: () => {},
};

const Ctx = createContext<Value>(EMPTY);

export function InstructorAttemptsProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={EMPTY}>{children}</Ctx.Provider>;
}

export function useInstructorAttempts() {
  return useContext(Ctx);
}
