import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CODING_PROBLEMS } from './seed-data/coding-problems';
import { HTML_CSS_QUESTIONS, IQ_QUESTIONS } from './seed-data/mcq-questions';
import { SEED_USERS } from './seed-data/users';

const prisma = new PrismaClient();

const TESTS = [
  { order: 1, title: 'IQ Test', type: 'MCQ' as const, durationMinutes: 20, status: 'PUBLISHED' as const, questions: IQ_QUESTIONS },
  { order: 2, title: 'HTML & CSS Test', type: 'MCQ' as const, durationMinutes: 20, status: 'PUBLISHED' as const, questions: HTML_CSS_QUESTIONS },
  { order: 3, title: 'JavaScript Problem Solving', type: 'CODING' as const, durationMinutes: 45, status: 'DRAFT' as const, questions: [] },
];

async function main() {
  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { fullName: u.fullName, email: u.email, role: u.role, passwordHash: await bcrypt.hash(u.password, 10) },
    });
  }

  for (const t of TESTS) {
    const test = await prisma.test.upsert({
      where: { order: t.order },
      update: {},
      create: { order: t.order, title: t.title, type: t.type, durationMinutes: t.durationMinutes, status: t.status },
    });
    if (t.type === 'MCQ' && (await prisma.question.count({ where: { testId: test.id } })) === 0) {
      for (const [i, q] of t.questions.entries()) {
        await prisma.question.create({
          data: {
            testId: test.id,
            text: q.text,
            position: i,
            options: { create: q.options.map((text, j) => ({ text, isCorrect: j === q.correct, position: j })) },
          },
        });
      }
    }
    if (t.type === 'CODING' && (await prisma.problem.count({ where: { testId: test.id } })) === 0) {
      for (const [i, p] of CODING_PROBLEMS.entries()) {
        await prisma.problem.create({
          data: {
            testId: test.id,
            title: p.title,
            description: p.description,
            functionName: p.functionName,
            points: p.points,
            position: i,
            testCases: {
              create: p.testCases.map((c, j) => ({ visibility: c.visibility, args: c.args as never, expected: c.expected as never, position: j })),
            },
          },
        });
      }
    }
  }
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
