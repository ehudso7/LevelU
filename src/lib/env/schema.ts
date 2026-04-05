import { z } from 'zod';

/**
 * Environment variable schema for LEVEL.
 * All required env vars must be defined here.
 * Validated at app startup via client.ts.
 */
export const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  EXPO_PUBLIC_POSTHOG_API_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  EXPO_PUBLIC_REVENUECAT_IOS_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;
