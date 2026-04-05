import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startQuest, completeQuest, uploadProofPhoto } from './api';
import { setCachedJson, removeCached, CacheKeys } from '../../lib/storage';
import {
  trackQuestStarted,
  trackProofUploadStarted,
  trackProofUploadCompleted,
  trackQuestCompleted,
  trackStreakExtended,
  trackLevelUp,
  trackArchetypeChanged,
} from '../../lib/analytics';
import type { QuestCompleteResponse } from '../../types/api';

/**
 * Mutation: start a quest.
 */
export function useQuestStart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => {
      const key = `start-${assignmentId}-${Date.now()}`;
      return startQuest(assignmentId, key);
    },
    onSuccess: async (data, assignmentId) => {
      trackQuestStarted({
        assignmentId,
        questCategory: data.quest?.category ?? 'unknown',
        questDifficulty: data.quest?.difficulty ?? 'unknown',
      });
      // Cache the active assignment ID for restore-on-reopen
      await setCachedJson(CacheKeys.ACTIVE_ASSIGNMENT_ID, assignmentId);
      // Invalidate home to reflect status change
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

/**
 * Mutation: complete a quest with proof.
 * Handles photo upload + function call.
 */
export function useQuestComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      assignmentId: string;
      userId: string;
      proofType: 'photo_plus_caption' | 'photo' | 'short_text' | 'tap_done' | 'social_response';
      photoUri?: string | null;
      caption?: string | null;
    }) => {
      let mediaPath: string | null = null;

      // Upload photo if present
      if (params.photoUri) {
        trackProofUploadStarted({
          assignmentId: params.assignmentId,
          proofType: params.proofType,
        });
        const uploadStart = Date.now();

        mediaPath = await uploadProofPhoto(
          params.userId,
          params.assignmentId,
          params.photoUri,
        );

        trackProofUploadCompleted({
          assignmentId: params.assignmentId,
          proofType: params.proofType,
          durationMs: Date.now() - uploadStart,
        });
      }

      const key = `complete-${params.assignmentId}-${Date.now()}`;
      return completeQuest(
        {
          assignmentId: params.assignmentId,
          proof: {
            type: params.proofType,
            text: params.caption ?? null,
            mediaPath,
            metadata: {},
          },
        },
        key,
      );
    },
    onSuccess: async (data: QuestCompleteResponse) => {
      // Track completion
      trackQuestCompleted({
        assignmentId: data.reward.assignmentId,
        questCategory: 'unknown', // Category not in reward response
        quality: data.reward.quality,
        xpEarned: data.reward.xpBreakdown.total,
        levelUp: data.reward.levelUp,
        isDailyClear: data.reward.xpBreakdown.dailyClearBonus > 0,
      });

      // Track streak
      if (data.progress.streak > 0) {
        trackStreakExtended({
          newStreak: data.progress.streak,
          longestStreak: data.progress.longestStreak ?? data.progress.streak,
        });
      }

      // Track level up
      if (data.reward.levelUp && data.reward.newLevel) {
        trackLevelUp({
          newLevel: data.reward.newLevel,
          previousLevel: data.reward.newLevel - 1,
        });
      }

      // Track archetype change
      if (data.archetypes.primaryArchetypeId) {
        trackArchetypeChanged(data.archetypes);
      }

      // Clear active assignment cache
      await removeCached(CacheKeys.ACTIVE_ASSIGNMENT_ID);
      // Cache updated progress
      await setCachedJson(CacheKeys.PROGRESS, data.progress);
      // Invalidate home + progress queries
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
