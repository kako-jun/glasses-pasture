import { Hono } from 'hono';
import type { Env } from '../index';
import { SCREENING_CONFIG } from '@glasses-pasture/shared';

export const screeningRoutes = new Hono<{ Bindings: Env }>();

// 10 fixed questions - correct answer is always 'B' (introverted choice)
const SCREENING_QUESTIONS = [
  { id: 1, correctAnswer: 'B' as const },
  { id: 2, correctAnswer: 'B' as const },
  { id: 3, correctAnswer: 'B' as const },
  { id: 4, correctAnswer: 'B' as const },
  { id: 5, correctAnswer: 'B' as const },
  { id: 6, correctAnswer: 'B' as const },
  { id: 7, correctAnswer: 'B' as const },
  { id: 8, correctAnswer: 'B' as const },
  { id: 9, correctAnswer: 'B' as const },
  { id: 10, correctAnswer: 'B' as const },
];

// Get questions (returns question IDs only, content is in i18n)
screeningRoutes.get('/questions', async (c) => {
  return c.json({
    questions: SCREENING_QUESTIONS.map((q) => ({ id: q.id })),
    total: SCREENING_CONFIG.QUESTION_COUNT,
    requiredCorrect: SCREENING_CONFIG.REQUIRED_CORRECT,
  });
});

// Submit answers
screeningRoutes.post('/submit', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    userId: string;
    answers: Array<{ questionId: number; answer: 'A' | 'B' }>;
  }>();

  const { userId, answers } = body;

  // Check if user exists
  const user = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Check if user is locked
  if (user.screening_lock_until) {
    const lockUntil = new Date(user.screening_lock_until as string);
    if (lockUntil > new Date()) {
      return c.json({
        passed: false,
        locked: true,
        lockUntil: user.screening_lock_until,
      });
    }
  }

  // Check if already passed
  if (user.screening_passed === 1) {
    return c.json({ passed: true, alreadyPassed: true });
  }

  // Validate answers count
  if (answers.length !== SCREENING_CONFIG.QUESTION_COUNT) {
    return c.json({ error: 'Invalid number of answers' }, 400);
  }

  // Check all answers (all must be correct)
  let correctCount = 0;
  for (const answer of answers) {
    const question = SCREENING_QUESTIONS.find((q) => q.id === answer.questionId);
    if (question && answer.answer === question.correctAnswer) {
      correctCount++;
    }
  }

  const passed = correctCount === SCREENING_CONFIG.REQUIRED_CORRECT;
  const now = new Date();

  if (passed) {
    // Mark as passed
    await db
      .prepare('UPDATE users SET screening_passed = 1, screening_lock_until = NULL WHERE id = ?')
      .bind(userId)
      .run();

    return c.json({ passed: true });
  } else {
    // Lock for 24 hours
    const lockUntil = new Date(now.getTime() + SCREENING_CONFIG.LOCK_HOURS * 60 * 60 * 1000);

    await db
      .prepare('UPDATE users SET screening_lock_until = ? WHERE id = ?')
      .bind(lockUntil.toISOString(), userId)
      .run();

    return c.json({
      passed: false,
      locked: true,
      lockUntil: lockUntil.toISOString(),
    });
  }
});

// Check screening status
screeningRoutes.get('/status/:userId', async (c) => {
  const db = c.env.DB;
  const userId = c.req.param('userId');

  const user = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  const now = new Date();
  let locked = false;
  let lockUntil = null;

  if (user.screening_lock_until) {
    const lockDate = new Date(user.screening_lock_until as string);
    if (lockDate > now) {
      locked = true;
      lockUntil = user.screening_lock_until;
    }
  }

  return c.json({
    passed: user.screening_passed === 1,
    locked,
    lockUntil,
  });
});
