/**
 * API response types matching Edge Function contracts exactly.
 */

// -------------------------------------------------------
// Shared sub-shapes
// -------------------------------------------------------

export interface ApiProfilePayload {
  id: string;
  displayName: string | null;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  longestStreak?: number;
  totalCompleted: number;
  onboardingCompleted?: boolean;
  timezone?: string;
}

export interface ApiProgressPayload {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak?: number;
  totalCompleted: number;
  weeklyCompleted?: number;
}

export interface ApiQuestPayload {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xpReward: number;
  estimatedMinutes: number;
  proofType: string;
  proofPrompt: string | null;
  tags: string[];
}

export interface ApiAssignmentPayload {
  id: string;
  questId: string;
  assignedDate: string;
  slotNumber: number;
  assignmentType?: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  quest: ApiQuestPayload | null;
}

export interface ApiArchetypePayload {
  archetypeId: string;
  slug: string;
  name: string;
  emoji: string;
  score: number;
  questCount: number;
}

// -------------------------------------------------------
// Function responses
// -------------------------------------------------------

export interface OnboardingBootstrapResponse {
  profile: ApiProfilePayload;
  assignments: ApiAssignmentPayload[];
  progress: ApiProgressPayload;
}

export interface HomeResponse {
  profile: ApiProfilePayload;
  progress: ApiProgressPayload;
  assignments: ApiAssignmentPayload[];
  archetypes: ApiArchetypePayload[];
  today: string;
}

export interface QuestStartResponse {
  assignment: {
    id: string;
    questId: string;
    assignedDate: string;
    slotNumber: number;
    status: string;
    startedAt: string;
  };
  quest: ApiQuestPayload | null;
}

export interface XpBreakdown {
  base: number;
  qualityBonus: number;
  streakBonus: number;
  firstQuestBonus: number;
  dailyClearBonus: number;
  total: number;
}

export interface QuestCompleteResponse {
  reward: {
    assignmentId: string;
    questTitle: string;
    quality: string;
    xpBreakdown: XpBreakdown;
    levelUp: boolean;
    newLevel: number | null;
    message: string;
  };
  progress: ApiProgressPayload;
  archetypes: {
    primaryArchetypeId: string | null;
    secondaryArchetypeId: string | null;
  };
}

// -------------------------------------------------------
// Request bodies
// -------------------------------------------------------

export interface OnboardingBootstrapRequest {
  displayName?: string;
  timezone: string;
  preferredVibe?: string;
  preferredQuestDuration: string;
  starterPack: string;
}

export interface QuestStartRequest {
  assignmentId: string;
}

export interface QuestCompleteRequest {
  assignmentId: string;
  proof: {
    type: 'photo_plus_caption' | 'photo' | 'short_text' | 'tap_done' | 'social_response';
    text?: string | null;
    mediaPath?: string | null;
    metadata?: Record<string, unknown>;
  };
}

// -------------------------------------------------------
// API error shape
// -------------------------------------------------------

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
