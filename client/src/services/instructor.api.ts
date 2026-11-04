import {
  AttemptFilters, InstructorAttemptDetail, InstructorAttemptRow, InstructorProblem, InstructorQuestion,
  InstructorTestDetail, InstructorTestSummary, ProblemPayload, QuestionPayload,
} from '../types/instructor.types';
import { request } from './http';

export const getInstructorTests = () => request<InstructorTestSummary[]>('/instructor/tests');
export const getInstructorTest = (id: number) => request<InstructorTestDetail>(`/instructor/tests/${id}`);
export const publishTest = (id: number) => request<InstructorTestSummary>(`/instructor/tests/${id}/publish`, { method: 'PATCH' });
export const unpublishTest = (id: number) => request<InstructorTestSummary>(`/instructor/tests/${id}/unpublish`, { method: 'PATCH' });
export const createQuestion = (testId: number, p: QuestionPayload) => request<InstructorQuestion>(`/instructor/tests/${testId}/questions`, { method: 'POST', body: p });
export const replaceQuestion = (id: number, p: QuestionPayload) => request<InstructorQuestion>(`/instructor/questions/${id}`, { method: 'PUT', body: p });
export const deleteQuestion = (id: number) => request<{ message: string }>(`/instructor/questions/${id}`, { method: 'DELETE' });
export const createProblem = (testId: number, p: ProblemPayload) => request<InstructorProblem>(`/instructor/tests/${testId}/problems`, { method: 'POST', body: p });
export const replaceProblem = (id: number, p: ProblemPayload) => request<InstructorProblem>(`/instructor/problems/${id}`, { method: 'PUT', body: p });
export const deleteProblem = (id: number) => request<{ message: string }>(`/instructor/problems/${id}`, { method: 'DELETE' });
export function getInstructorAttempts(f: AttemptFilters) {
  const q = new URLSearchParams();
  if (f.testId) q.set('testId', f.testId);
  if (f.status) q.set('status', f.status);
  if (f.search?.trim()) q.set('search', f.search.trim());
  const s = q.toString();
  return request<InstructorAttemptRow[]>(`/instructor/attempts${s ? `?${s}` : ''}`);
}
export const getInstructorAttempt = (id: number) => request<InstructorAttemptDetail>(`/instructor/attempts/${id}`);
