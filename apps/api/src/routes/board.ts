import { Hono } from 'hono';
import type { Env } from '../index';

export const boardRoutes = new Hono<{ Bindings: Env }>();

// Get board posts for a specific date
boardRoutes.get('/date/:date', async (c) => {
  const db = c.env.DB;
  const date = c.req.param('date'); // YYYY-MM-DD format

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }

  const posts = await db
    .prepare(`
      SELECT p.id, p.content, p.posted_at, g.id as glasses_id, g.name as glasses_name
      FROM board_posts bp
      JOIN posts p ON bp.post_id = p.id
      JOIN glasses g ON p.glasses_id = g.id
      WHERE bp.board_date = ? AND p.is_deleted = 0
      ORDER BY p.posted_at ASC
    `)
    .bind(date)
    .all();

  return c.json({
    date,
    posts: posts.results.map((p) => ({
      id: p.id,
      glassesId: p.glasses_id,
      glassesName: p.glasses_name,
      content: p.content,
      postedAt: p.posted_at,
    })),
    count: posts.results.length,
  });
});

// Get available board dates (last 7 days)
boardRoutes.get('/dates', async (c) => {
  const db = c.env.DB;

  const dates = await db
    .prepare(`
      SELECT DISTINCT board_date, COUNT(*) as post_count
      FROM board_posts bp
      JOIN posts p ON bp.post_id = p.id
      WHERE p.is_deleted = 0
      GROUP BY board_date
      ORDER BY board_date DESC
      LIMIT 7
    `)
    .all();

  return c.json({
    dates: dates.results.map((d) => ({
      date: d.board_date,
      postCount: d.post_count,
    })),
  });
});

// Get today's board
boardRoutes.get('/today', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  return c.redirect(`/api/board/date/${today}`);
});
