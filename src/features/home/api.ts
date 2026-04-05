import { callFunction } from '../../lib/api';
import type { HomeResponse } from '../../types/api';

/**
 * Fetch the home payload: profile, progress, today's assignments, archetypes.
 * Also generates assignments if they don't exist for today.
 */
export async function fetchHome(): Promise<HomeResponse> {
  return callFunction<HomeResponse>('home');
}
