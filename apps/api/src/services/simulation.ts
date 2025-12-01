import { generateUUID } from '../utils/uuid';
import { INTERACTION_CONFIG } from '@glasses-pasture/shared';

interface GlassesRow {
  id: string;
  name: string;
  degree: number;
  frame_color: string;
  lens_state: string;
  friendship_points: number;
}

interface GambitRow {
  id: string;
  glasses_id: string;
  condition_type: string;
  condition_data: string;
  action_type: string;
  probability: number;
  enabled: number;
  priority: number;
}

/**
 * Run interaction simulation (called by cron trigger)
 */
export async function runInteractionSimulation(db: D1Database): Promise<void> {
  // Get all active glasses (accessed within last 90 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const glassesResult = await db
    .prepare(`
      SELECT * FROM glasses
      WHERE last_active_at > ?
    `)
    .bind(cutoffDate.toISOString())
    .all();

  const allGlasses = glassesResult.results as GlassesRow[];

  if (allGlasses.length < 2) {
    return; // Need at least 2 glasses to interact
  }

  // Get all gambits
  const gambitsResult = await db
    .prepare('SELECT * FROM gambits WHERE enabled = 1 ORDER BY priority')
    .all();

  const allGambits = gambitsResult.results as GambitRow[];

  // Group gambits by glasses_id
  const gambitsByGlasses = new Map<string, GambitRow[]>();
  for (const gambit of allGambits) {
    const existing = gambitsByGlasses.get(gambit.glasses_id) || [];
    existing.push(gambit);
    gambitsByGlasses.set(gambit.glasses_id, existing);
  }

  // Get affinity vectors for potential boost
  const affinityResult = await db
    .prepare('SELECT * FROM affinity_vectors')
    .all();

  const affinityVectors = new Map<string, number[]>();
  for (const row of affinityResult.results) {
    try {
      affinityVectors.set(row.glasses_id as string, JSON.parse(row.vector as string));
    } catch {
      // Ignore invalid vectors
    }
  }

  // Process each glasses
  const now = new Date().toISOString();
  const interactions: Array<{
    actorId: string;
    actorName: string;
    targetId: string;
    targetName: string;
    actionType: string;
    friendshipDelta: number;
  }> = [];

  for (const actor of allGlasses) {
    const gambits = gambitsByGlasses.get(actor.id) || [];

    if (gambits.length === 0) continue;

    // Find potential targets (exclude self)
    const potentialTargets = allGlasses.filter((g) => g.id !== actor.id);

    if (potentialTargets.length === 0) continue;

    // Try each gambit in priority order
    for (const gambit of gambits) {
      // Random probability check
      if (Math.random() * 100 > gambit.probability) continue;

      // Find matching target
      const matchingTarget = findMatchingTarget(actor, potentialTargets, gambit, affinityVectors);

      if (matchingTarget) {
        const friendshipDelta = getFriendshipDelta(gambit.action_type);

        interactions.push({
          actorId: actor.id,
          actorName: actor.name,
          targetId: matchingTarget.id,
          targetName: matchingTarget.name,
          actionType: gambit.action_type,
          friendshipDelta,
        });

        // Only one interaction per actor per cycle
        break;
      }
    }
  }

  // Save interactions and update friendship
  for (const interaction of interactions) {
    const logId = generateUUID();

    await db
      .prepare(`
        INSERT INTO interaction_logs (id, timestamp, actor_glasses_id, actor_glasses_name, target_glasses_id, target_glasses_name, action_type, friendship_delta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        logId,
        now,
        interaction.actorId,
        interaction.actorName,
        interaction.targetId,
        interaction.targetName,
        interaction.actionType,
        interaction.friendshipDelta
      )
      .run();

    // Update friendship points for both parties
    await db
      .prepare('UPDATE glasses SET friendship_points = friendship_points + ? WHERE id = ?')
      .bind(interaction.friendshipDelta, interaction.actorId)
      .run();

    await db
      .prepare('UPDATE glasses SET friendship_points = friendship_points + ? WHERE id = ?')
      .bind(interaction.friendshipDelta, interaction.targetId)
      .run();

    // Clear fog if encouraged
    if (interaction.actionType === 'encourage') {
      await db
        .prepare("UPDATE glasses SET lens_state = 'clear' WHERE id = ? AND lens_state = 'foggy'")
        .bind(interaction.targetId)
        .run();
    }
  }

  // Random fog event (10% chance for each glasses)
  for (const glasses of allGlasses) {
    if (Math.random() < 0.1 && glasses.lens_state === 'clear') {
      await db
        .prepare("UPDATE glasses SET lens_state = 'foggy' WHERE id = ?")
        .bind(glasses.id)
        .run();
    }
  }
}

function findMatchingTarget(
  actor: GlassesRow,
  targets: GlassesRow[],
  gambit: GambitRow,
  affinityVectors: Map<string, number[]>
): GlassesRow | null {
  const condition = JSON.parse(gambit.condition_data);

  // Filter targets by condition
  let matchingTargets = targets.filter((target) => {
    switch (condition.type) {
      case 'degree_close':
        return Math.abs(actor.degree - target.degree) <= (condition.threshold || 0.5);

      case 'same_frame_color':
        return actor.frame_color === target.frame_color;

      case 'target_foggy':
        return target.lens_state === 'foggy';

      case 'high_friendship':
        return target.friendship_points >= (condition.threshold || 50);

      case 'random':
        return true;

      default:
        return false;
    }
  });

  if (matchingTargets.length === 0) return null;

  // Apply affinity boost
  const actorVector = affinityVectors.get(actor.id);
  if (actorVector) {
    matchingTargets = matchingTargets.map((target) => {
      const targetVector = affinityVectors.get(target.id);
      if (targetVector) {
        const similarity = cosineSimilarity(actorVector, targetVector);
        const boost = Math.min(similarity * 100, INTERACTION_CONFIG.AFFINITY_BONUS_CAP);
        return { ...target, _boost: boost };
      }
      return { ...target, _boost: 0 };
    });

    // Sort by boost (higher first) with some randomness
    matchingTargets.sort((a, b) => {
      const aBoost = (a as GlassesRow & { _boost: number })._boost || 0;
      const bBoost = (b as GlassesRow & { _boost: number })._boost || 0;
      return (bBoost + Math.random() * 10) - (aBoost + Math.random() * 10);
    });
  } else {
    // Shuffle randomly
    matchingTargets.sort(() => Math.random() - 0.5);
  }

  return matchingTargets[0];
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getFriendshipDelta(actionType: string): number {
  switch (actionType) {
    case 'greet':
      return 1;
    case 'encourage':
      return 3;
    case 'exchange_item':
      return 5;
    case 'play':
      return 10;
    default:
      return 0;
  }
}
