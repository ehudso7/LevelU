/**
 * Core domain types for LEVEL Milestone A.
 */

export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  xp: number;
  streak: number;
  createdAt: string;
}

export interface VibeCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface DurationPreference {
  id: string;
  label: string;
  minutesPerDay: number;
}

export interface Assignment {
  id: string;
  questId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  dueDate: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
}

export interface QuestProof {
  assignmentId: string;
  photoUri: string | null;
  note: string | null;
  completedAt: string;
}

export interface Reward {
  id: string;
  assignmentId: string;
  xpEarned: number;
  streakBonus: number;
  levelUp: boolean;
  newLevel: number | null;
  message: string;
}

export interface ProgressSnapshot {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalCompleted: number;
  weeklyCompleted: number;
}
