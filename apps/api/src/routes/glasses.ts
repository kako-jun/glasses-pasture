import { Hono } from 'hono';
import type { Env } from '../index';
import { generateUUID } from '../utils/uuid';
import { generateGlassesName, generateRandomDegree, generateRandomFrameColor } from '../utils/glasses';
import { GLASSES_CONFIG, DEFAULT_GAMBITS } from '@glasses-pasture/shared';

export const glassesRoutes = new Hono<{ Bindings: Env }>();

// Create glasses for user
glassesRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{ userId: string }>();
  const { userId } = body;

  // Check if user exists and passed screening
  const user = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Skip screening check in development mode
  const isDev = c.env.ENVIRONMENT === 'development';
  if (!isDev && user.screening_passed !== 1) {
    return c.json({ error: 'Screening not passed' }, 403);
  }

  // Check if user already has glasses
  const existing = await db
    .prepare('SELECT * FROM glasses WHERE user_id = ?')
    .bind(userId)
    .first();

  if (existing) {
    return c.json({ error: 'User already has glasses' }, 409);
  }

  const now = new Date().toISOString();
  const glassesId = generateUUID();
  const name = generateGlassesName();
  const degree = generateRandomDegree();
  const frameColor = generateRandomFrameColor();

  // Create glasses
  await db
    .prepare(`
      INSERT INTO glasses (id, user_id, name, degree, frame_color, lens_state, rarity, friendship_points, energy, last_active_at, created_at)
      VALUES (?, ?, ?, ?, ?, 'clear', 'common', ?, ?, ?, ?)
    `)
    .bind(
      glassesId,
      userId,
      name,
      degree,
      frameColor,
      GLASSES_CONFIG.INITIAL_FRIENDSHIP,
      GLASSES_CONFIG.INITIAL_ENERGY,
      now,
      now
    )
    .run();

  // Create default gambits
  for (const gambit of DEFAULT_GAMBITS) {
    const gambitId = generateUUID();
    await db
      .prepare(`
        INSERT INTO gambits (id, glasses_id, condition_type, condition_data, action_type, probability, enabled, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        gambitId,
        glassesId,
        gambit.condition.type,
        JSON.stringify(gambit.condition),
        gambit.action.type,
        gambit.probability,
        gambit.enabled ? 1 : 0,
        gambit.priority
      )
      .run();
  }

  return c.json({
    id: glassesId,
    name,
    degree,
    frameColor,
    lensState: 'clear',
    rarity: 'common',
    friendshipPoints: GLASSES_CONFIG.INITIAL_FRIENDSHIP,
    energy: GLASSES_CONFIG.INITIAL_ENERGY,
    lastActiveAt: now,
    createdAt: now,
  }, 201);
});

// Get glasses by user ID
glassesRoutes.get('/user/:userId', async (c) => {
  const db = c.env.DB;
  const userId = c.req.param('userId');

  const glasses = await db
    .prepare('SELECT * FROM glasses WHERE user_id = ?')
    .bind(userId)
    .first();

  if (!glasses) {
    return c.json({ error: 'Glasses not found' }, 404);
  }

  // Update last active
  const now = new Date().toISOString();
  await db
    .prepare('UPDATE glasses SET last_active_at = ? WHERE id = ?')
    .bind(now, glasses.id)
    .run();

  return c.json({
    id: glasses.id,
    name: glasses.name,
    degree: glasses.degree,
    frameColor: glasses.frame_color,
    lensState: glasses.lens_state,
    rarity: glasses.rarity,
    friendshipPoints: glasses.friendship_points,
    energy: glasses.energy,
    lastActiveAt: now,
    createdAt: glasses.created_at,
  });
});

// Rename glasses (triggers screening if first rename)
glassesRoutes.put('/:id/rename', async (c) => {
  const db = c.env.DB;
  const glassesId = c.req.param('id');
  const body = await c.req.json<{ name: string }>();
  const { name } = body;

  // Validate name
  if (!name || name.length < 1 || name.length > 30) {
    return c.json({ error: 'Invalid name (1-30 characters)' }, 400);
  }

  const glasses = await db
    .prepare('SELECT * FROM glasses WHERE id = ?')
    .bind(glassesId)
    .first();

  if (!glasses) {
    return c.json({ error: 'Glasses not found' }, 404);
  }

  await db
    .prepare('UPDATE glasses SET name = ? WHERE id = ?')
    .bind(name, glassesId)
    .run();

  return c.json({ id: glassesId, name });
});

// Get gambits for glasses
glassesRoutes.get('/:id/gambits', async (c) => {
  const db = c.env.DB;
  const glassesId = c.req.param('id');

  const gambits = await db
    .prepare('SELECT * FROM gambits WHERE glasses_id = ? ORDER BY priority')
    .bind(glassesId)
    .all();

  return c.json({
    gambits: gambits.results.map((g) => ({
      id: g.id,
      glassesId: g.glasses_id,
      condition: JSON.parse(g.condition_data as string),
      action: { type: g.action_type },
      probability: g.probability,
      enabled: g.enabled === 1,
      priority: g.priority,
    })),
  });
});

// Update gambit
glassesRoutes.put('/:glassesId/gambits/:gambitId', async (c) => {
  const db = c.env.DB;
  const { glassesId, gambitId } = c.req.param();
  const body = await c.req.json<{
    probability?: number;
    enabled?: boolean;
    priority?: number;
  }>();

  const gambit = await db
    .prepare('SELECT * FROM gambits WHERE id = ? AND glasses_id = ?')
    .bind(gambitId, glassesId)
    .first();

  if (!gambit) {
    return c.json({ error: 'Gambit not found' }, 404);
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.probability !== undefined) {
    updates.push('probability = ?');
    values.push(Math.max(0, Math.min(100, body.probability)));
  }
  if (body.enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(body.enabled ? 1 : 0);
  }
  if (body.priority !== undefined) {
    updates.push('priority = ?');
    values.push(body.priority);
  }

  if (updates.length > 0) {
    values.push(gambitId);
    await db
      .prepare(`UPDATE gambits SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  return c.json({ success: true });
});
