/**
 * Portable progression engine — pure functions extracted from the Edge Function
 * shared module. No Deno/Supabase dependencies. Used by tests and potentially
 * by the client for optimistic UI calculations.
 *
 * This is the single source of truth for XP, quality, and level-up math.
 * The Edge Function _shared/progression.ts mirrors this logic.
 */

// -------------------------------------------------------
// XP by difficulty (locked Milestone A values)
// -------------------------------------------------------

const XP_BY_DIFFICULTY: Record<string, number> = {
  easy: 15,
  medium: 25,
  hard: 40,
};

// -------------------------------------------------------
// Quality bonus
// -------------------------------------------------------

const QUALITY_BONUS: Record<string, number> = {
  standard: 0,
  good: 3,
  excellent: 5,
};

// -------------------------------------------------------
// Streak bonus scale
// -------------------------------------------------------

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 50;
  if (streak >= 14) return 35;
  if (streak >= 7) return 20;
  if (streak >= 3) return 10;
  if (streak >= 1) return 5;
  return 0;
}

// -------------------------------------------------------
// Level formula
// -------------------------------------------------------

export function xpToNextLevel(level: number): number {
  return 200 + (level - 1) * 50;
}

// -------------------------------------------------------
// Proof types
// -------------------------------------------------------

export type ProofSubmissionType =
  | 'photo_plus_caption'
  | 'photo'
  | 'short_text'
  | 'tap_done'
  | 'social_response';

// -------------------------------------------------------
// Quality evaluation
// -------------------------------------------------------

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
      return textLength >= 20 ? 'good' : 'standard';

    case 'photo':
      return hasMedia ? 'good' : 'standard';

    case 'social_response':
      return textLength >= 20 ? 'good' : 'standard';

    case 'photo_plus_caption':
      if (hasMedia && textLength >= 50) return 'excellent';
      if (hasMedia && textLength >= 10) return 'good';
      if (hasMedia) return 'good';
      return 'standard';

    default:
      return 'standard';
  }
}

// -------------------------------------------------------
// XP calculation
// -------------------------------------------------------

export interface XpCalculation {
  baseXp: number;
  qualityBonus: number;
  streakBonus: number;
  firstQuestBonus: number;
  dailyClearBonus: number;
  totalXp: number;
}

export function calculateXp(params: {
  difficulty: string;
  quality: 'standard' | 'good' | 'excellent';
  currentStreak: number;
  isFirstQuestOfDay: boolean;
  isDailyClear: boolean;
}): XpCalculation {
  const baseXp = XP_BY_DIFFICULTY[params.difficulty] ?? 15;
  const qualityBonus = QUALITY_BONUS[params.quality] ?? 0;
  const streakBonus = getStreakBonus(params.currentStreak);
  const firstQuestBonus = params.isFirstQuestOfDay ? 5 : 0;
  const dailyClearBonus = params.isDailyClear ? 10 : 0;

  const totalXp = baseXp + qualityBonus + streakBonus + firstQuestBonus + dailyClearBonus;

  return { baseXp, qualityBonus, streakBonus, firstQuestBonus, dailyClearBonus, totalXp };
}

// -------------------------------------------------------
// Level-up application
// -------------------------------------------------------

export interface LevelUpResult {
  newXp: number;
  newLevel: number;
  newXpToNext: number;
  leveledUp: boolean;
}

export function applyXp(
  currentXp: number,
  currentLevel: number,
  currentXpToNext: number,
  xpAmount: number,
): LevelUpResult {
  let xp = currentXp + xpAmount;
  let level = currentLevel;
  let xpToNext = currentXpToNext;
  let leveledUp = false;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpToNextLevel(level);
    leveledUp = true;
  }

  return { newXp: xp, newLevel: level, newXpToNext: xpToNext, leveledUp };
}
