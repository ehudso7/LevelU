/**
 * Core domain types for LEVEL Milestone A.
 * These mirror the Supabase schema defined in supabase/migrations/.
 */

// -------------------------------------------------------
// Enums (match Postgres enums exactly)
// -------------------------------------------------------

export type QuestCategory = 'spark' | 'momentum' | 'explorer' | 'social' | 'boss';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type ProofType = 'photo' | 'selfie' | 'screenshot' | 'text_note' | 'none';
export type AssignmentType = 'daily' | 'bonus' | 'challenge';
export type AssignmentStatus = 'pending' | 'active' | 'completed' | 'expired' | 'skipped';
export type CompletionQuality = 'standard' | 'good' | 'excellent';
export type PremiumStatus = 'free' | 'trial' | 'premium' | 'expired';
export type PreferredVibe = 'fitness' | 'mindfulness' | 'social' | 'creativity' | 'learning' | 'adventure';
export type PreferredDuration = 'chill' | 'steady' | 'intense' | 'beast';
export type StreakEventType = 'increment' | 'reset' | 'freeze' | 'bonus';

// -------------------------------------------------------
// Tables
// -------------------------------------------------------

export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  longestStreak: number;
  totalCompleted: number;
  premiumStatus: PremiumStatus;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  vibes: PreferredVibe[];
  duration: PreferredDuration;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Archetype {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xpReward: number;
  estimatedMinutes: number;
  proofType: ProofType;
  proofPrompt: string | null;
  archetypeId: string | null;
  tags: string[];
  firstWeekOk: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyAssignment {
  id: string;
  userId: string;
  questId: string;
  assignedDate: string;
  slotNumber: number;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined from quests table for display
  quest?: Quest;
}

export interface QuestCompletion {
  id: string;
  assignmentId: string;
  userId: string;
  questId: string;
  proofUrl: string | null;
  proofNote: string | null;
  quality: CompletionQuality;
  xpEarned: number;
  streakBonus: number;
  completedAt: string;
  createdAt: string;
}

export interface XpEvent {
  id: string;
  userId: string;
  assignmentId: string | null;
  amount: number;
  reason: string;
  balanceAfter: number;
  levelAfter: number;
  createdAt: string;
}

export interface StreakEvent {
  id: string;
  userId: string;
  eventType: StreakEventType;
  streakBefore: number;
  streakAfter: number;
  reason: string | null;
  createdAt: string;
}

export interface UserArchetypeScore {
  id: string;
  userId: string;
  archetypeId: string;
  score: number;
  questCount: number;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------
// Derived / View types (not direct table mirrors)
// -------------------------------------------------------

export interface ProgressSnapshot {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  totalCompleted: number;
  weeklyCompleted: number;
}

export interface RewardSummary {
  assignmentId: string;
  xpEarned: number;
  streakBonus: number;
  totalXp: number;
  levelUp: boolean;
  newLevel: number | null;
  message: string;
}
