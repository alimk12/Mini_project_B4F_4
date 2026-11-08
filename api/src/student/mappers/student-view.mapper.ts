import { AttemptStatus, Prisma, TestType } from '@prisma/client';

export const studentAttemptSelect = (attemptId: number) =>
  ({
    id: true,
    testId: true,
    status: true,
    startedAt: true,
    deadline: true,
    submittedAt: true,
    terminatedAt: true,
    terminationReason: true,
    score: true,
    questionOrder: true,
    optionOrder: true,
    mcqAnswers: { select: { questionId: true, optionId: true, isCorrect: true } },
    violations: { where: { counted: true }, select: { type: true } },
    test: {
      select: {
        title: true,
        type: true,
        questions: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            text: true,
            options: { orderBy: { position: 'asc' }, select: { id: true, text: true } },
          },
        },
        problems: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            functionName: true,
            points: true,
            testCases: {
              where: { visibility: 'SAMPLE' },
              orderBy: { position: 'asc' },
              take: 1,
              select: { args: true, expected: true },
            },
            results: {
              where: { attemptId },
              select: { runCount: true, submittedAt: true, passedCount: true, totalCount: true, points: true },
            },
          },
        },
      },
    },
  }) satisfies Prisma.AttemptSelect;

export type StudentAttemptRecord = Prisma.AttemptGetPayload<{ select: ReturnType<typeof studentAttemptSelect> }>;

const FOCUS_TYPES = ['FULLSCREEN_EXIT', 'TAB_HIDDEN'];
const MAX_RUNS_PER_PROBLEM = 20;

export function toStudentQuestion(
  question: StudentAttemptRecord['test']['questions'][number],
  selectedOptionId: number | null,
  optionOrder: Prisma.JsonValue | undefined,
) {
  const optionIds = Array.isArray(optionOrder) ? optionOrder.filter((id): id is number => typeof id === 'number') : [];
  const optionsById = new Map(question.options.map((option) => [option.id, option]));
  const options = optionIds.length
    ? optionIds.map((id) => optionsById.get(id)).filter((option): option is NonNullable<typeof option> => !!option)
    : question.options;

  return { id: question.id, text: question.text, options, selectedOptionId };
}

export function toStudentProblem(problem: StudentAttemptRecord['test']['problems'][number]) {
  const result = problem.results[0];
  const sample = problem.testCases[0];
  return {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    functionName: problem.functionName,
    points: problem.points,
    sample: sample ? { args: sample.args, expected: sample.expected } : null,
    runCount: result?.runCount ?? 0,
    runsRemaining: MAX_RUNS_PER_PROBLEM - (result?.runCount ?? 0),
    submission: result?.submittedAt
      ? {
          passedCount: result.passedCount,
          totalCount: result.totalCount,
          points: result.points,
          submittedAt: result.submittedAt.toISOString(),
        }
      : null,
  };
}

export function toStudentAttempt(attempt: StudentAttemptRecord, sessionKey: string | null, serverNow: Date, executionMode: string | null) {
  const focusViolations = attempt.violations.filter((violation) => FOCUS_TYPES.includes(violation.type)).length;
  const clipboardViolations = attempt.violations.length - focusViolations;
  const questionOrder = Array.isArray(attempt.questionOrder)
    ? attempt.questionOrder.filter((id): id is number => typeof id === 'number')
    : [];
  const optionOrder =
    attempt.optionOrder && typeof attempt.optionOrder === 'object' && !Array.isArray(attempt.optionOrder)
      ? (attempt.optionOrder as Record<string, Prisma.JsonValue>)
      : {};
  const questionsById = new Map(attempt.test.questions.map((question) => [question.id, question]));
  const answersByQuestion = new Map(attempt.mcqAnswers.map((answer) => [answer.questionId, answer]));
  const orderedQuestions = questionOrder.length
    ? questionOrder.map((id) => questionsById.get(id)).filter((question): question is NonNullable<typeof question> => !!question)
    : attempt.test.questions;
  const questions = orderedQuestions.map((question) =>
    toStudentQuestion(question, answersByQuestion.get(question.id)?.optionId ?? null, optionOrder[String(question.id)]),
  );
  const problems = attempt.test.problems.map(toStudentProblem);
  const isFinished = attempt.status !== 'IN_PROGRESS';
  let result: Record<string, unknown> | null = null;

  if (attempt.status === 'EXPIRED') {
    result = { score: null, label: 'Expired — not submitted' };
  } else if (attempt.status === 'TERMINATED') {
    result = {
      score: attempt.score,
      label: `Terminated — exam rules violated (${attempt.score ?? 0}%)`,
      terminationReason: attempt.terminationReason,
    };
  } else if (attempt.status === 'SUBMITTED') {
    if (attempt.test.type === 'MCQ') {
      const correctCount = attempt.mcqAnswers.filter((answer) => answer.isCorrect).length;
      const totalCount = attempt.test.questions.length;
      result = {
        correctCount,
        totalCount,
        score: attempt.score,
        label: `${correctCount} / ${totalCount} correct (${attempt.score ?? 0}%)`,
      };
    } else {
      result = { score: attempt.score, label: `Coding score: ${attempt.score ?? 0}%` };
    }
  }

  return {
    id: attempt.id,
    testId: attempt.testId,
    testTitle: attempt.test.title,
    type: attempt.test.type as TestType,
    status: attempt.status as AttemptStatus,
    startedAt: attempt.startedAt.toISOString(),
    deadline: attempt.deadline.toISOString(),
    serverNow: serverNow.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    terminatedAt: attempt.terminatedAt?.toISOString() ?? null,
    sessionKey,
    questions: isFinished || attempt.test.type !== 'MCQ' ? null : questions,
    problems: isFinished || attempt.test.type !== 'CODING' ? null : problems,
    executionMode: attempt.test.type === 'CODING' ? executionMode : null,
    integrity: { focusViolations, focusLimit: 2, clipboardViolations, clipboardLimit: 3 },
    result,
  };
}
