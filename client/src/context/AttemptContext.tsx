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

// Every 409 has the same status, so the message tells the cases apart (docs/API.md 19.4 and 12).
const SESSION_REPLACED_START = 'This attempt is open in another window or device.';
const isSessionReplacedError = (e: unknown) =>
  e instanceof ApiError && e.status === 409 && e.message.startsWith(SESSION_REPLACED_START);

// The attempt changed on the server (time over, ended by the rules, already submitted): reload it.
const STATE_CONFLICT_STARTS = [
  'Time is over.',
  'This attempt was ended because the exam rules were broken.',
  'This test has already been submitted.',
];
const isStateConflictError = (e: unknown) =>
  e instanceof ApiError && e.status === 409 && STATE_CONFLICT_STARTS.some((start) => e.message.startsWith(start));

const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

// Built in the next steps. They do nothing yet.
const notYet = async () => false;
const PENDING = {
  runResults: {} as Record<number, RunResult>,
  submitResults: {} as Record<number, SubmitResult>,
  runningProblemId: null as number | null,
  runCode: notYet,
  submitCode: notYet,
  finishCoding: notYet,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingQuestionIds, setSavingQuestionIds] = useState<number[]>([]);

  const latestRequest = useRef(0); // only the newest request may write its answer
  const currentAttemptId = useRef<number | null>(null);
  const saveCounter = useRef<Record<number, number>>({}); // newest save number per question

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
    setIsSubmitting(false);
    setActionError(null);
    setSavingQuestionIds([]);
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
      setActionError(null);
      setSavingQuestionIds([]);
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
        setActionError(null);
        setSavingQuestionIds([]);
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

  // The same reaction for every action the server rejects with 409.
  const reactToConflict = useCallback(
    (e: unknown, attemptId: number) => {
      if (isSessionReplacedError(e)) setIsSessionReplaced(true);
      else if (isStateConflictError(e)) void loadAttempt(attemptId);
    },
    [loadAttempt],
  );

  // Autosave: quiet on success. The page keeps the choices and decides about retries.
  const saveMcqAnswer = useCallback(
    async (questionId: number, optionId: number | null) => {
      const attemptId = currentAttemptId.current;
      if (attemptId === null) return false;
      const mine = (saveCounter.current[questionId] ?? 0) + 1;
      saveCounter.current[questionId] = mine;
      setSavingQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
      try {
        await api.saveMcqAnswer(attemptId, questionId, optionId);
        return true;
      } catch (e) {
        reactToConflict(e, attemptId);
        return false;
      } finally {
        // Only the newest save of this question may switch "Saving…" off.
        if (saveCounter.current[questionId] === mine) {
          setSavingQuestionIds((prev) => prev.filter((id) => id !== questionId));
        }
      }
    },
    [reactToConflict],
  );

  const submitMcq = useCallback(
    async (answers: McqAnswerPayload[]) => {
      const attemptId = currentAttemptId.current;
      if (attemptId === null) return false;
      setIsSubmitting(true);
      setActionError(null);
      try {
        await api.submitMcq(attemptId, answers);
        await loadAttempt(attemptId); // the result screen is built from the stored attempt
        return true;
      } catch (e) {
        if (!isSessionReplacedError(e)) setActionError(message(e));
        reactToConflict(e, attemptId);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAttempt, reactToConflict],
  );

  const clearActionError = useCallback(() => setActionError(null), []);

  const value = useMemo<Value>(
    () => ({
      attempt, isAttemptLoading, attemptError, startAttempt, loadAttempt, serverOffsetMs, integrity, isSessionReplaced,
      isSubmitting, actionError, submitMcq, saveMcqAnswer, savingQuestionIds, clearActionError,
      ...PENDING,
    }),
    [
      attempt, isAttemptLoading, attemptError, startAttempt, loadAttempt, serverOffsetMs, integrity, isSessionReplaced,
      isSubmitting, actionError, submitMcq, saveMcqAnswer, savingQuestionIds, clearActionError,
    ],
  );
  return <AttemptContext.Provider value={value}>{children}</AttemptContext.Provider>;
}

export function useAttempt() {
  const ctx = useContext(AttemptContext);
  if (!ctx) throw new Error('useAttempt must be used inside AttemptProvider');
  return ctx;
}