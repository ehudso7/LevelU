import { callFunction } from '../../lib/api';
import type { HomeResponse } from '../../types/api';

/**
 * Fetch progress data. Reuses the home endpoint since it returns
 * the full progress snapshot. Avoids a separate function just for progress.
 */
export async function fetchProgress(): Promise<HomeResponse> {
  return callFunction<HomeResponse>('home');
}
