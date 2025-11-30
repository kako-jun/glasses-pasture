import { GLASSES_CONFIG, BOARD_CONFIG } from '@glasses-pasture/shared';

/**
 * Clean up expired data (called by cron trigger)
 */
export async function cleanupExpiredData(db: D1Database): Promise<void> {
  const now = new Date();

  // 1. Delete expired board posts (older than 7 days)
  await db
    .prepare('DELETE FROM board_posts WHERE expires_at < ?')
    .bind(now.toISOString())
    .run();

  // 2. Handle extinct glasses (inactive for 90 days)
  const extinctionCutoff = new Date();
  extinctionCutoff.setDate(extinctionCutoff.getDate() - GLASSES_CONFIG.EXTINCTION_DAYS);

  // Get glasses to delete
  const extinctGlasses = await db
    .prepare(`
      SELECT id, name, user_id FROM glasses
      WHERE last_active_at < ?
    `)
    .bind(extinctionCutoff.toISOString())
    .all();

  for (const glasses of extinctGlasses.results) {
    // Delete related data (cascade should handle most, but be explicit)
    await db
      .prepare('DELETE FROM gambits WHERE glasses_id = ?')
      .bind(glasses.id)
      .run();

    await db
      .prepare('DELETE FROM affinity_vectors WHERE glasses_id = ?')
      .bind(glasses.id)
      .run();

    // Soft delete posts (keep in stable but remove from board)
    await db
      .prepare('DELETE FROM board_posts WHERE post_id IN (SELECT id FROM posts WHERE glasses_id = ?)')
      .bind(glasses.id)
      .run();

    // Delete the glasses
    await db
      .prepare('DELETE FROM glasses WHERE id = ?')
      .bind(glasses.id)
      .run();

    // Reset user's screening status so they need to pass again for new glasses
    await db
      .prepare('UPDATE users SET screening_passed = 0 WHERE id = ?')
      .bind(glasses.user_id)
      .run();
  }

  // 3. Clean up old interaction logs (older than 30 days, to save space)
  const logCutoff = new Date();
  logCutoff.setDate(logCutoff.getDate() - 30);

  await db
    .prepare('DELETE FROM interaction_logs WHERE timestamp < ?')
    .bind(logCutoff.toISOString())
    .run();
}
