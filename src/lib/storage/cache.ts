import * as SecureStore from 'expo-secure-store';

/**
 * Lightweight local cache for fast app reopen.
 * Uses SecureStore for small JSON payloads (profile, progress, active quest).
 * Not intended for large datasets — just enough for instant UI on cold start.
 */

const CACHE_PREFIX = 'level_cache_';

export async function getCachedJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedJson<T>(key: string, value: T): Promise<void> {
  try {
    await SecureStore.setItemAsync(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Cache write failure is non-critical
  }
}

export async function removeCached(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CACHE_PREFIX + key);
  } catch {
    // Ignore
  }
}

// Cache keys
export const CacheKeys = {
  HOME_PAYLOAD: 'home_payload',
  PROGRESS: 'progress',
  ACTIVE_ASSIGNMENT_ID: 'active_assignment_id',
  ONBOARDING_VIBES: 'onboarding_vibes',
  ONBOARDING_DURATION: 'onboarding_duration',
} as const;
