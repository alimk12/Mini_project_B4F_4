import { ClientViolationType } from '../types/common.types';
import { RunResult, SubmitResult } from '../types/execution.types';
import { McqAnswerPayload, StudentAttempt, StudentResult, StudentTestCard, ViolationResult } from '../types/student.types';
import { getAttemptSession } from '../utils/attemptSession';
import { request } from './http';

const session = (attemptId: number) => ({ 'X-Attempt-Session': getAttemptSession(attemptId) ?? '' });
const onAttempt = <T>(attemptId: number, path: string, method = 'POST', body?: unknown) =>
  request<T>(`/student/attempts/${attemptId}${path}`, { method, body, headers: session(attemptId) });

export const getStudentTests = () => request<StudentTestCard[]>('/student/tests');
export const getStudentTest = (id: number) => request<StudentTestCard>(`/student/tests/${id}`);
export const startAttempt = (testId: number, acceptedRules: boolean) =>
  request<StudentAttempt>(`/student/tests/${testId}/attempts`, { method: 'POST', body: { acceptedRules } });
export const getAttempt = (attemptId: number) => onAttempt<StudentAttempt>(attemptId, '', 'GET');
export const saveMcqAnswer = (attemptId: number, questionId: number, optionId: number | null) =>
  onAttempt<{ questionId: number; optionId: number | null; savedAt: string }>(attemptId, `/mcq-answers/${questionId}`, 'PUT', { optionId });
export const submitMcq = (attemptId: number, answers: McqAnswerPayload[]) =>
  onAttempt<{ score: number; label: string }>(attemptId, '/mcq-submit', 'POST', { answers });
export const runCode = (attemptId: number, problemId: number, code: string) =>
  onAttempt<RunResult>(attemptId, `/problems/${problemId}/run`, 'POST', { code });
export const submitCode = (attemptId: number, problemId: number, code: string) =>
  onAttempt<SubmitResult>(attemptId, `/problems/${problemId}/submit`, 'POST', { code });
export const finishCoding = (attemptId: number) => onAttempt<{ score: number; label: string }>(attemptId, '/finish');
export const reportViolation = (attemptId: number, type: ClientViolationType) =>
  onAttempt<ViolationResult>(attemptId, '/violations', 'POST', { type });
export const getResults = () => request<StudentResult[]>('/student/results');
