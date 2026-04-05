import { env } from '../env';

/**
 * PostHog configuration for the PostHogProvider.
 * Returns null if credentials are not configured.
 */
export function getPostHogConfig() {
  if (!env.EXPO_PUBLIC_POSTHOG_API_KEY) {
    console.log('[LEVEL] PostHog API key not set — analytics disabled');
    return null;
  }

  return {
    apiKey: env.EXPO_PUBLIC_POSTHOG_API_KEY,
    host: env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  };
}
