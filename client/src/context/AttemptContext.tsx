import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ApiError } from '../services/http';
import * as api from '../services/student.api';
import { ClientViolationType } from '../types/common.types';
import { RunResult, SubmitResult } from '../types/execution.types';
import { AttemptIntegrity, McqAnswerPayload, StudentAttempt } from '../types/student.types';
import { saveAttemptSession } from '../utils/attemptSession';
import { getOffsetMs } from '../utils/serverClock';
import { useAuth } from './AuthContext';

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

// Every 409 has the same status, so the message tells the cases apart (docs/API.md 19.4).
const SESSION_REPLACED_START = 'This attempt is open in another window or device.';
const isSessionReplacedError = (e: unknown) =>
  e instanceof ApiError && e.status === 409 && e.message.startsWith(SESSION_REPLACED_START);
const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

// Built in the next steps. They do nothing yet.
const notYet = async () => false;
const PENDING = {
  isSubmitting: false,
  actionError: null as string | null,
  submitMcq: notYet,
  saveMcqAnswer: notYet,
  savingQuestionIds: [] as number[],
  runResults: {} as Record<number, RunResult>,
  submitResults: {} as Record<number, SubmitResult>,
  runningProblemId: null as number | null,
  runCode: notYet,
  submitCode: notYet,
  finishCoding: notYet,
  clearActionError: () => {},
  lastWarning: null as string | null,
  reportViolation: async () => {},
  clearWarning: () => {},
};

const AttemptContext = createContext<Value | undefined>(undefined);

export function AttemptProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<StudentAttempt | null>(null);
  const [isAttemptLoading, setIsAttemptLoading] = useState(false);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [integrity, setIntegrity] = useState<AttemptIntegrity | null>(null);
  const [isSessionReplaced, setIsSessionReplaced] = useState(false);

  const latestRequest = useRef(0); // only the newest request may write its answer
  const currentAttemptId = useRef<number | null>(null);

  // A different student (or a sign-out) must never see the previous attempt.
  const userId = user?.id ?? null;
  const [ownerId, setOwnerId] = useState(userId);
  if (ownerId !== userId) {
    setOwnerId(userId);
    setAttempt(null);
    setIsAttemptLoading(false);
    setAttemptError(null);
    setServerOffsetMs(0);
    setIntegrity(null);
    setIsSessionReplaced(false);
  }

  // Every attempt response updates the attempt, the clock offset and the integrity counters.
  const showAttempt = useCallback((data: StudentAttempt) => {
    currentAttemptId.current = data.id;
    setAttempt(data);
    setServerOffsetMs(getOffsetMs(data.serverNow));
    setIntegrity(data.integrity);
  }, []);

  const startAttempt = useCallback(
    async (testId: number, acceptedRules: boolean) => {
      const request = ++latestRequest.current;
      currentAttemptId.current = null;
      setAttempt(null);
      setIntegrity(null);
      setIsSessionReplaced(false);
      setIsAttemptLoading(true);
      setAttemptError(null);
      try {
        const data = await api.startAttempt(testId, acceptedRules);
        if (data.sessionKey) saveAttemptSession(data.id, data.sessionKey);
        if (request === latestRequest.current) showAttempt(data);
        return data.id;
      } catch (e) {
        if (request === latestRequest.current) setAttemptError(message(e));
        return null;
      } finally {
        if (request === latestRequest.current) setIsAttemptLoading(false);
      }
    },
    [showAttempt],
  );

  const loadAttempt = useCallback(
    async (attemptId: number) => {
      const request = ++latestRequest.current;
      // Opening another attempt: drop the old one at once. Reloading the same one keeps it on screen.
      if (currentAttemptId.current !== attemptId) {
        currentAttemptId.current = null;
        setAttempt(null);
        setIntegrity(null);
        setIsSessionReplaced(false);
      }
      setIsAttemptLoading(true);
      setAttemptError(null);
      try {
        const data = await api.getAttempt(attemptId);
        if (request === latestRequest.current) {
          showAttempt(data);
          setIsSessionReplaced(false);
        }
      } catch (e) {
        if (request === latestRequest.current) {
          if (isSessionReplacedError(e)) setIsSessionReplaced(true);
          else setAttemptError(message(e));
        }
      } finally {
        if (request === latestRequest.current) setIsAttemptLoading(false);
      }
    },
    [showAttempt],
  );

  const value = useMemo<Value>(
    () => ({
      attempt, isAttemptLoading, attemptError, startAttempt, loadAttempt, serverOffsetMs, integrity, isSessionReplaced,
      ...PENDING,
    }),
    [attempt, isAttemptLoading, attemptError, startAttempt, loadAttempt, serverOffsetMs, integrity, isSessionReplaced],
  );
  return <AttemptContext.Provider value={value}>{children}</AttemptContext.Provider>;
}

export function useAttempt() {
  const ctx = useContext(AttemptContext);
  if (!ctx) throw new Error('useAttempt must be used inside AttemptProvider');
  return ctx;
}