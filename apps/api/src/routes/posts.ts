import { Hono } from 'hono';
import type { Env } from '../index';
import { generateUUID } from '../utils/uuid';
import { POST_LIMITS, BOARD_CONFIG } from '@glasses-pasture/shared';

export const postsRoutes = new Hono<{ Bindings: Env }>();

// Create post (to stable)
postsRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    glassesId: string;
    content: string;
    isDraft?: boolean;
  }>();

  const { glassesId, content, isDraft = false } = body;

  // Validate content length
  if (content.length > POST_LIMITS.MAX_CONTENT_LENGTH) {
    return c.json({
      error: 'Content too long',
      maxLength: POST_LIMITS.MAX_CONTENT_LENGTH,
    }, 400);
  }

  // Check glasses exists
  const glasses = await db
    .prepare('SELECT * FROM glasses WHERE id = ?')
    .bind(glassesId)
    .first();

  if (!glasses) {
    return c.json({ error: 'Glasses not found' }, 404);
  }

  // Rate limit check (only for non-drafts)
  if (!isDraft) {
    const recentPost = await db
      .prepare(`
        SELECT * FROM posts
        WHERE glasses_id = ? AND is_draft = 0
        ORDER BY posted_at DESC LIMIT 1
      `)
      .bind(glassesId)
      .first();

    if (recentPost) {
      const lastPostTime = new Date(recentPost.posted_at as string).getTime();
      const now = Date.now();
      if (now - lastPostTime < POST_LIMITS.RATE_LIMIT_MS) {
        return c.json({
          error: 'Rate limited',
          retryAfter: POST_LIMITS.RATE_LIMIT_MS - (now - lastPostTime),
        }, 429);
      }
    }
  }

  const now = new Date();
  const postId = generateUUID();

  await db
    .prepare(`
      INSERT INTO posts (id, glasses_id, content, posted_at, is_draft, is_deleted)
      VALUES (?, ?, ?, ?, ?, 0)
    `)
    .bind(postId, glassesId, content, now.toISOString(), isDraft ? 1 : 0)
    .run();

  // If not draft, create board projection
  if (!isDraft) {
    const boardDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const expiresAt = new Date(now.getTime() + BOARD_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const boardPostId = generateUUID();

    await db
      .prepare(`
        INSERT INTO board_posts (id, post_id, board_date, expires_at)
        VALUES (?, ?, ?, ?)
      `)
      .bind(boardPostId, postId, boardDate, expiresAt.toISOString())
      .run();
  }

  return c.json({
    id: postId,
    glassesId,
    glassesName: glasses.name,
    content,
    postedAt: now.toISOString(),
    isDraft,
    isDeleted: false,
  }, 201);
});

// Get posts for glasses (stable)
postsRoutes.get('/glasses/:glassesId', async (c) => {
  const db = c.env.DB;
  const glassesId = c.req.param('glassesId');
  const includeDrafts = c.req.query('includeDrafts') === 'true';

  let query = `
    SELECT p.*, g.name as glasses_name
    FROM posts p
    JOIN glasses g ON p.glasses_id = g.id
    WHERE p.glasses_id = ? AND p.is_deleted = 0
  `;

  if (!includeDrafts) {
    query += ' AND p.is_draft = 0';
  }

  query += ' ORDER BY p.posted_at DESC';

  const posts = await db.prepare(query).bind(glassesId).all();

  return c.json({
    posts: posts.results.map((p) => ({
      id: p.id,
      glassesId: p.glasses_id,
      glassesName: p.glasses_name,
      content: p.content,
      postedAt: p.posted_at,
      isDraft: p.is_draft === 1,
      isDeleted: false,
    })),
    count: posts.results.length,
  });
});

// Get single post
postsRoutes.get('/:id', async (c) => {
  const db = c.env.DB;
  const postId = c.req.param('id');

  const post = await db
    .prepare(`
      SELECT p.*, g.name as glasses_name
      FROM posts p
      JOIN glasses g ON p.glasses_id = g.id
      WHERE p.id = ? AND p.is_deleted = 0
    `)
    .bind(postId)
    .first();

  if (!post) {
    return c.json({ error: 'Post not found' }, 404);
  }

  return c.json({
    id: post.id,
    glassesId: post.glasses_id,
    glassesName: post.glasses_name,
    content: post.content,
    postedAt: post.posted_at,
    isDraft: post.is_draft === 1,
    isDeleted: false,
  });
});

// Update post (publish draft or edit)
postsRoutes.put('/:id', async (c) => {
  const db = c.env.DB;
  const postId = c.req.param('id');
  const body = await c.req.json<{
    content?: string;
    isDraft?: boolean;
  }>();

  const post = await db
    .prepare('SELECT * FROM posts WHERE id = ? AND is_deleted = 0')
    .bind(postId)
    .first();

  if (!post) {
    return c.json({ error: 'Post not found' }, 404);
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.content !== undefined) {
    if (body.content.length > POST_LIMITS.MAX_CONTENT_LENGTH) {
      return c.json({
        error: 'Content too long',
        maxLength: POST_LIMITS.MAX_CONTENT_LENGTH,
      }, 400);
    }
    updates.push('content = ?');
    values.push(body.content);
  }

  // Publishing a draft
  if (body.isDraft === false && post.is_draft === 1) {
    updates.push('is_draft = 0');
    const now = new Date();
    updates.push('posted_at = ?');
    values.push(now.toISOString());

    // Create board projection
    const boardDate = now.toISOString().split('T')[0];
    const expiresAt = new Date(now.getTime() + BOARD_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const boardPostId = generateUUID();

    await db
      .prepare(`
        INSERT INTO board_posts (id, post_id, board_date, expires_at)
        VALUES (?, ?, ?, ?)
      `)
      .bind(boardPostId, postId, boardDate, expiresAt.toISOString())
      .run();
  }

  if (updates.length > 0) {
    values.push(postId);
    await db
      .prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  return c.json({ success: true });
});

// Delete post (soft delete)
postsRoutes.delete('/:id', async (c) => {
  const db = c.env.DB;
  const postId = c.req.param('id');

  await db
    .prepare('UPDATE posts SET is_deleted = 1 WHERE id = ?')
    .bind(postId)
    .run();

  // Remove from board
  await db
    .prepare('DELETE FROM board_posts WHERE post_id = ?')
    .bind(postId)
    .run();

  return c.json({ success: true });
});
