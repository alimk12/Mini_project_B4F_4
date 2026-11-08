import { randomInt } from 'crypto';

type QuestionOrderInput = { id: number; options: { id: number }[] };

function shuffle<T>(values: T[]): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function buildAttemptOrder(questions: QuestionOrderInput[]) {
  const shuffledQuestions = shuffle(questions);
  const questionOrder = shuffledQuestions.map((question) => question.id);
  const optionOrder = Object.fromEntries(
    shuffledQuestions.map((question) => [String(question.id), shuffle(question.options.map((option) => option.id))]),
  );

  return { questionOrder, optionOrder };
}
