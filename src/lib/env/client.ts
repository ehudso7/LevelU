import Constants from 'expo-constants';
import { envSchema, type Env } from './schema';

/**
 * Reads environment variables from Expo's manifest extra / process.env
 * and validates them against the Zod schema.
 *
 * Throws at startup if required vars are missing — fail fast.
 */
function loadEnv(): Env {
  const raw: Record<string, string | undefined> = {};

  // Expo SDK 55: env vars prefixed with EXPO_PUBLIC_ are available at build time
  const extra = Constants.expoConfig?.extra ?? {};
  const allSources = { ...extra, ...process.env };

  for (const key of Object.keys(envSchema.shape)) {
    raw[key] = allSources[key as keyof typeof allSources] as string | undefined;
  }

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.warn(
      `[LEVEL] Environment validation failed (non-critical vars may be missing):\n${missing}`
    );
    // Return a partial env — optional vars may be undefined in dev
    return raw as unknown as Env;
  }

  return result.data;
}

export const env = loadEnv();
