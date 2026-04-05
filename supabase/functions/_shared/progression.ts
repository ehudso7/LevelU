import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

/**
 * XP awarded by quest difficulty.
 * Locked values for Milestone A.
 */
const XP_BY_DIFFICULTY: Record<string, number> = {
  easy: 15,
  medium: 25,
  hard: 40,
};

/**
 * Quality bonus applied on top of base XP.
 */
const QUALITY_BONUS: Record<string, number> = {
  standard: 0,
  good: 3,      // "strong" quality
  excellent: 5, // "exceptional" quality
};

/**
 * Streak bonus based on current streak length.
 */
function getStreakBonus(streak: number): number {
  if (streak >= 30) return 50;
  if (streak >= 14) return 35;
  if (streak >= 7) return 20;
  if (streak >= 3) return 10;
  if (streak >= 1) return 5;
  return 0;
}

/**
 * XP required to reach next level.
 * Formula: 200 + (level - 1) * 50
 */
function xpToNextLevel(level: number): number {
  return 200 + (level - 1) * 50;
}

/**
 * Proof types mapped to the locked contract values.
 */
export type ProofSubmissionType =
  | 'photo_plus_caption'
  | 'photo'
  | 'short_text'
  | 'tap_done'
  | 'social_response';

/**
 * Deterministic quality evaluation based on proof type and content.
 */
export function evaluateQuality(
  proofType: ProofSubmissionType,
  text?: string | null,
  mediaPath?: string | null,
): 'standard' | 'good' | 'excellent' {
  const textLength = (text ?? '').trim().length;
  const hasMedia = !!mediaPath && mediaPath.length > 0;

  switch (proofType) {
    case 'tap_done':
      return 'standard';

    case 'short_text':
      // Strong if non-trivial text (>= 20 chars)
      return textLength >= 20 ? 'good' : 'standard';

    case 'photo':
      // Strong if media present
      return hasMedia ? 'good' : 'standard';

    case 'social_response':
      // Treat like short_text
      return textLength >= 20 ? 'good' : 'standard';

    case 'photo_plus_caption':
      // Exceptional if media + caption >= 50 chars
      // Strong if media + any non-trivial caption
      if (hasMedia && textLength >= 50) return 'excellent';
      if (hasMedia && textLength >= 10) return 'good';
      if (hasMedia) return 'good';
      return 'standard';

    default:
      return 'standard';
  }
}

/**
 * Calculate total XP for a quest completion.
 */
export function calculateXp(params: {
  difficulty: string;
  quality: 'standard' | 'good' | 'excellent';
  currentStreak: number;
  isFirstQuestOfDay: boolean;
  isDailyClear: boolean;
}): { baseXp: number; qualityBonus: number; streakBonus: number; firstQuestBonus: number; dailyClearBonus: number; totalXp: number } {
  const baseXp = XP_BY_DIFFICULTY[params.difficulty] ?? 15;
  const qualityBonus = QUALITY_BONUS[params.quality] ?? 0;
  const streakBonus = getStreakBonus(params.currentStreak);
  const firstQuestBonus = params.isFirstQuestOfDay ? 5 : 0;
  const dailyClearBonus = params.isDailyClear ? 10 : 0;

  const totalXp = baseXp + qualityBonus + streakBonus + firstQuestBonus + dailyClearBonus;

  return { baseXp, qualityBonus, streakBonus, firstQuestBonus, dailyClearBonus, totalXp };
}

/**
 * Apply XP to a profile and handle level-ups.
 * Returns the updated profile fields and any XP events to insert.
 */
export function applyXp(
  currentXp: number,
  currentLevel: number,
  currentXpToNext: number,
  xpAmount: number,
): { newXp: number; newLevel: number; newXpToNext: number; leveledUp: boolean } {
  let xp = currentXp + xpAmount;
  let level = currentLevel;
  let xpToNext = currentXpToNext;
  let leveledUp = false;

  // Process level-ups (can level up multiple times in theory)
  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpToNextLevel(level);
    leveledUp = true;
  }

  return { newXp: xp, newLevel: level, newXpToNext: xpToNext, leveledUp };
}

/**
 * Evaluate streak: did the user complete at least one quest yesterday?
 * Returns the new streak value and event type.
 */
export async function evaluateStreak(
  db: SupabaseClient,
  userId: string,
  currentStreak: number,
  yesterday: string,
): Promise<{ newStreak: number; eventType: 'increment' | 'reset' }> {
  // Check if user completed any quest yesterday
  const { count } = await db
    .from('quest_completions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('completed_at', `${yesterday}T00:00:00`)
    .lt('completed_at', `${yesterday}T23:59:59.999`);

  if ((count ?? 0) > 0) {
    // Streak continues
    return { newStreak: currentStreak + 1, eventType: 'increment' };
  }

  // Check if user even had assignments yesterday (grace: no assignments = no penalty)
  const { count: assignmentCount } = await db
    .from('daily_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('assigned_date', yesterday);

  if ((assignmentCount ?? 0) === 0) {
    // No assignments yesterday — grace period, keep streak
    return { newStreak: currentStreak, eventType: 'increment' };
  }

  // Had assignments but didn't complete any — reset
  return { newStreak: 0, eventType: 'reset' };
}

/**
 * Recalculate primary and secondary archetypes for a user.
 * Returns the top two archetype IDs by score.
 */
export async function recalculateArchetypes(
  db: SupabaseClient,
  userId: string,
): Promise<{ primaryArchetypeId: string | null; secondaryArchetypeId: string | null }> {
  const { data: scores } = await db
    .from('user_archetype_scores')
    .select('archetype_id, score')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(2);

  return {
    primaryArchetypeId: scores?.[0]?.archetype_id ?? null,
    secondaryArchetypeId: scores?.[1]?.archetype_id ?? null,
  };
}
