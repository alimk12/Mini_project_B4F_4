import { useCallback, useEffect, useRef, useState } from 'react';
import { McqAnswerPayload, StudentAttempt } from '../../../types/student.types';

export type SaveStatus = 'saving' | 'saved' | 'retrying' | 'failed';

const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 3;

// The choices and the autosave retries live here (in AttemptPage), not in the question screen,
// because FullscreenGate removes its children when the student leaves full screen.
export function useMcqChoices(
  attempt: StudentAttempt | null,
  saveMcqAnswer: (questionId: number, optionId: number | null) => Promise<boolean>,
) {
  const attemptId = attempt?.id ?? null;
  const questions = attempt?.questions ?? null;

  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [choices, setChoices] = useState<Record<number, number>>({});
  const [statuses, setStatuses] = useState<Record<number, SaveStatus>>({});
  const choicesRef = useRef(choices);
  const tokens = useRef<Record<number, number>>({}); // newest save number per question
  const timers = useRef<Record<number, number>>({}); // pending retries per question

  // Start from the choices the server already saved, once per attempt.
  // Reloading the same attempt keeps the choices made on this screen.
  if (attemptId !== null && questions && ownerId !== attemptId) {
    const saved: Record<number, number> = {};
    for (const question of questions) {
      if (question.selectedOptionId !== null) saved[question.id] = question.selectedOptionId;
    }
    setOwnerId(attemptId);
    setChoices(saved);
    setStatuses({});
  }

  useEffect(() => {
    choicesRef.current = choices;
  }, [choices]);

  const clearTimers = useCallback(() => {
    Object.values(timers.current).forEach((timer) => window.clearTimeout(timer));
    timers.current = {};
  }, []);

  // No retries for another attempt, or after the test is over.
  useEffect(() => clearTimers, [attemptId, clearTimers]);
  useEffect(() => {
    if (!questions) clearTimers();
  }, [questions, clearTimers]);

  const setStatus = useCallback((questionId: number, status: SaveStatus) => {
    setStatuses((prev) => ({ ...prev, [questionId]: status }));
  }, []);

  // Every try sends the CURRENT choice of the question, so an old choice never overwrites a newer one.
  const trySave = useCallback(
    async (questionId: number, retriesLeft: number, token: number) => {
      const optionId = choicesRef.current[questionId] ?? null;
      const ok = await saveMcqAnswer(questionId, optionId);
      if (tokens.current[questionId] !== token) return; // a newer choice took over
      if (ok) {
        setStatus(questionId, 'saved');
        return;
      }
      if (retriesLeft <= 0) {
        setStatus(questionId, 'failed');
        return;
      }
      setStatus(questionId, 'retrying');
      timers.current[questionId] = window.setTimeout(() => {
        void trySave(questionId, retriesLeft - 1, token);
      }, RETRY_DELAY_MS);
    },
    [saveMcqAnswer, setStatus],
  );

  const choose = useCallback(
    (questionId: number, optionId: number) => {
      setChoices((prev) => ({ ...prev, [questionId]: optionId }));
      choicesRef.current = { ...choicesRef.current, [questionId]: optionId };
      window.clearTimeout(timers.current[questionId]);
      const token = (tokens.current[questionId] ?? 0) + 1;
      tokens.current[questionId] = token;
      setStatus(questionId, 'saving');
      void trySave(questionId, MAX_RETRIES, token);
    },
    [setStatus, trySave],
  );

  // The final Submit sends every choice, saved or not.
  const buildAnswers = useCallback(
    (): McqAnswerPayload[] =>
      Object.entries(choicesRef.current).map(([questionId, optionId]) => ({
        questionId: Number(questionId),
        optionId,
      })),
    [],
  );

  return { choices, statuses, choose, buildAnswers };
}