import { Hono } from 'hono';
import type { Env } from '../index';

export const interactionsRoutes = new Hono<{ Bindings: Env }>();

// Get interaction logs for glasses
interactionsRoutes.get('/glasses/:glassesId', async (c) => {
  const db = c.env.DB;
  const glassesId = c.req.param('glassesId');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  const logs = await db
    .prepare(`
      SELECT * FROM interaction_logs
      WHERE actor_glasses_id = ? OR target_glasses_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `)
    .bind(glassesId, glassesId, limit, offset)
    .all();

  return c.json({
    logs: logs.results.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      actorGlassesId: log.actor_glasses_id,
      actorGlassesName: log.actor_glasses_name,
      targetGlassesId: log.target_glasses_id,
      targetGlassesName: log.target_glasses_name,
      actionType: log.action_type,
      friendshipDelta: log.friendship_delta,
    })),
    count: logs.results.length,
    offset,
    limit,
  });
});

// Get recent interactions (for pasture overview)
interactionsRoutes.get('/recent', async (c) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') || '20');

  const logs = await db
    .prepare(`
      SELECT * FROM interaction_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    .bind(limit)
    .all();

  return c.json({
    logs: logs.results.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      actorGlassesId: log.actor_glasses_id,
      actorGlassesName: log.actor_glasses_name,
      targetGlassesId: log.target_glasses_id,
      targetGlassesName: log.target_glasses_name,
      actionType: log.action_type,
      friendshipDelta: log.friendship_delta,
    })),
    count: logs.results.length,
  });
});
