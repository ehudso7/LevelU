import { supabase } from '../../lib/supabase';
import { callFunction } from '../../lib/api';
import type {
  OnboardingBootstrapRequest,
  OnboardingBootstrapResponse,
} from '../../types/api';

/**
 * Sign in anonymously via Supabase Auth.
 */
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
}

/**
 * Complete onboarding: creates profile, prefs, and Day 1 assignments.
 */
export async function bootstrapOnboarding(
  params: OnboardingBootstrapRequest,
  idempotencyKey?: string,
): Promise<OnboardingBootstrapResponse> {
  return callFunction<OnboardingBootstrapResponse, OnboardingBootstrapRequest>(
    'onboarding-bootstrap',
    params,
    idempotencyKey ? { idempotencyKey } : undefined,
  );
}
