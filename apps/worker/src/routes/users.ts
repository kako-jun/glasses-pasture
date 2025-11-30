import { Hono } from 'hono';
import type { Env } from '../index';
import { generateUUID } from '../utils/uuid';

export const usersRoutes = new Hono<{ Bindings: Env }>();

// Create or get user (anonymous, UUID-based)
usersRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{ userId?: string }>();

  const now = new Date().toISOString();

  // If userId provided, try to find existing user
  if (body.userId) {
    const existing = await db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(body.userId)
      .first();

    if (existing) {
      // Update last access
      await db
        .prepare('UPDATE users SET last_access_at = ? WHERE id = ?')
        .bind(now, body.userId)
        .run();

      return c.json({
        id: existing.id,
        screeningPassed: existing.screening_passed === 1,
        screeningLockUntil: existing.screening_lock_until,
        lastAccessAt: now,
        createdAt: existing.created_at,
      });
    }
  }

  // Create new user
  const userId = generateUUID();

  await db
    .prepare(`
      INSERT INTO users (id, screening_passed, last_access_at, created_at)
      VALUES (?, 0, ?, ?)
    `)
    .bind(userId, now, now)
    .run();

  return c.json({
    id: userId,
    screeningPassed: false,
    screeningLockUntil: null,
    lastAccessAt: now,
    createdAt: now,
  }, 201);
});

// Get user by ID
usersRoutes.get('/:id', async (c) => {
  const db = c.env.DB;
  const userId = c.req.param('id');

  const user = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    id: user.id,
    screeningPassed: user.screening_passed === 1,
    screeningLockUntil: user.screening_lock_until,
    lastAccessAt: user.last_access_at,
    createdAt: user.created_at,
  });
});
