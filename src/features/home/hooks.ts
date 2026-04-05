import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchHome } from './api';
import { getCachedJson, setCachedJson, CacheKeys } from '../../lib/storage';
import type { HomeResponse } from '../../types/api';

/**
 * Query hook for the home screen payload.
 * Loads cached data instantly, then fetches fresh data in background.
 */
export function useHome() {
  const [cachedData, setCachedData] = useState<HomeResponse | null>(null);

  // Load cache on mount
  useEffect(() => {
    getCachedJson<HomeResponse>(CacheKeys.HOME_PAYLOAD).then((cached) => {
      if (cached) setCachedData(cached);
    });
  }, []);

  const query = useQuery({
    queryKey: ['home'],
    queryFn: fetchHome,
    staleTime: 1000 * 60 * 2, // 2 min — home data refreshes often
    refetchOnWindowFocus: true,
  });

  // Cache fresh data when it arrives
  useEffect(() => {
    if (query.data) {
      setCachedJson(CacheKeys.HOME_PAYLOAD, query.data);
      setCachedJson(CacheKeys.PROGRESS, query.data.progress);
    }
  }, [query.data]);

  return {
    ...query,
    data: query.data ?? cachedData,
    isLoadingFresh: query.isLoading && !cachedData,
  };
}
