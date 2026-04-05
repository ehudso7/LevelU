import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startQuest, completeQuest, uploadProofPhoto } from './api';
import { setCachedJson, removeCached, CacheKeys } from '../../lib/storage';
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
    onSuccess: async (_data, assignmentId) => {
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
        mediaPath = await uploadProofPhoto(
          params.userId,
          params.assignmentId,
          params.photoUri,
        );
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
