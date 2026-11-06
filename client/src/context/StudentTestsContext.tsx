import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import * as api from '../services/student.api';
import { StudentResult, StudentTestCard } from '../types/student.types';
import { useAuth } from './AuthContext';

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

const StudentTestsContext = createContext<Value | undefined>(undefined);
const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

export function StudentTestsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tests, setTests] = useState<StudentTestCard[]>([]);
  const [isTestsLoading, setIsTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [currentTest, setCurrentTest] = useState<StudentTestCard | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // Each request gets a number. Only the newest request may write its answer.
  const testsRequest = useRef(0);
  const testRequest = useRef(0);
  const resultsRequest = useRef(0);

  // A different student (or a sign-out) must never see the previous student's data.
  const userId = user?.id ?? null;
  const [ownerId, setOwnerId] = useState(userId);
  if (ownerId !== userId) {
    setOwnerId(userId);
    setTests([]);
    setIsTestsLoading(false);
    setTestsError(null);
    setCurrentTest(null);
    setIsTestLoading(false);
    setTestError(null);
    setResults([]);
    setIsResultsLoading(false);
    setResultsError(null);
  }

  const loadTests = useCallback(async () => {
    const id = ++testsRequest.current;
    setIsTestsLoading(true);
    setTestsError(null);
    try {
      const data = await api.getStudentTests();
      if (id === testsRequest.current) setTests(data);
    } catch (e) {
      if (id === testsRequest.current) setTestsError(message(e));
    } finally {
      if (id === testsRequest.current) setIsTestsLoading(false);
    }
  }, []);

  const loadTest = useCallback(async (testId: number) => {
    const id = ++testRequest.current;
    setCurrentTest(null);
    setIsTestLoading(true);
    setTestError(null);
    try {
      const data = await api.getStudentTest(testId);
      if (id === testRequest.current) setCurrentTest(data);
    } catch (e) {
      if (id === testRequest.current) setTestError(message(e));
    } finally {
      if (id === testRequest.current) setIsTestLoading(false);
    }
  }, []);

  const loadResults = useCallback(async () => {
    const id = ++resultsRequest.current;
    setIsResultsLoading(true);
    setResultsError(null);
    try {
      const data = await api.getResults();
      if (id === resultsRequest.current) setResults(data);
    } catch (e) {
      if (id === resultsRequest.current) setResultsError(message(e));
    } finally {
      if (id === resultsRequest.current) setIsResultsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      tests, isTestsLoading, testsError, loadTests,
      currentTest, isTestLoading, testError, loadTest,
      results, isResultsLoading, resultsError, loadResults,
    }),
    [tests, isTestsLoading, testsError, loadTests, currentTest, isTestLoading, testError, loadTest, results, isResultsLoading, resultsError, loadResults],
  );
  return <StudentTestsContext.Provider value={value}>{children}</StudentTestsContext.Provider>;
}

export function useStudentTests() {
  const ctx = useContext(StudentTestsContext);
  if (!ctx) throw new Error('useStudentTests must be used inside StudentTestsProvider');
  return ctx;
}