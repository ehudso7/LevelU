import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signInAnonymously, bootstrapOnboarding } from './api';
import { useAuthStore } from './store';
import { setOnboardingComplete, setCachedJson, CacheKeys } from '../../lib/storage';
import { trackOnboardingStarted, trackOnboardingCompleted } from '../../lib/analytics';
import type { OnboardingBootstrapRequest } from '../../types/api';

/**
 * Mutation: sign in anonymously.
 */
export function useSignInAnonymous() {
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: signInAnonymously,
    onSuccess: (data) => {
      if (data.session) {
        setSession(data.session);
      }
      trackOnboardingStarted();
    },
  });
}

/**
 * Mutation: complete onboarding bootstrap.
 * Calls the Edge Function, caches the response, marks onboarding complete.
 */
export function useOnboardingBootstrap() {
  const { setIsOnboarded } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: OnboardingBootstrapRequest) => {
      const key = `onboard-${Date.now()}`;
      return bootstrapOnboarding(params, key);
    },
    onSuccess: async (data, variables) => {
      trackOnboardingCompleted({
        vibe: variables.preferredVibe ?? 'none',
        duration: variables.preferredQuestDuration,
        starterPack: variables.starterPack,
      });

      // Cache the home payload for instant load
      await setCachedJson(CacheKeys.HOME_PAYLOAD, data);
      await setCachedJson(CacheKeys.PROGRESS, data.progress);

      // Mark onboarding complete
      await setOnboardingComplete();
      setIsOnboarded(true);

      // Prefill the home query cache
      queryClient.setQueryData(['home'], data);
    },
  });
}
