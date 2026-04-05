import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchProgress } from './api';
import { getCachedJson, setCachedJson, CacheKeys } from '../../lib/storage';
import { trackProgressViewed } from '../../lib/analytics';
import type { ApiProgressPayload } from '../../types/api';

/**
 * Query hook for progress data.
 * Shares the same query key as home since it comes from the same endpoint.
 * Loads cached progress for instant UI.
 */
export function useProgress() {
  const [cachedProgress, setCachedProgress] = useState<ApiProgressPayload | null>(null);

  useEffect(() => {
    getCachedJson<ApiProgressPayload>(CacheKeys.PROGRESS).then((cached) => {
      if (cached) setCachedProgress(cached);
    });
  }, []);

  const query = useQuery({
    queryKey: ['home'],
    queryFn: fetchProgress,
    staleTime: 1000 * 60 * 2,
  });

  const progress = query.data?.progress ?? cachedProgress;
  const archetypes = query.data?.archetypes ?? [];

  useEffect(() => {
    if (query.data?.progress) {
      setCachedJson(CacheKeys.PROGRESS, query.data.progress);
      trackProgressViewed({
        level: query.data.progress.level,
        streak: query.data.progress.streak,
        totalCompleted: query.data.progress.totalCompleted,
      });
    }
  }, [query.data]);

  return {
    progress,
    archetypes,
    isLoading: query.isLoading && !cachedProgress,
    error: query.error,
    refetch: query.refetch,
  };
}
