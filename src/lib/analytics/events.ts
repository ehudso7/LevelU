/**
 * Analytics event layer for LEVEL Milestone A.
 *
 * All trackable events go through this module.
 * Uses PostHog for product analytics and Sentry for error tracking.
 * Gracefully no-ops if providers aren't configured.
 */
import * as Sentry from '@sentry/react-native';

// PostHog is accessed via the provider hook — for non-component contexts,
// we use a global capture function set during app init.
let posthogCapture: ((event: string, properties?: Record<string, unknown>) => void) | null = null;

/**
 * Set the PostHog capture function. Called once from the root layout
 * when the PostHog provider is available.
 */
export function setPostHogCapture(
  captureFn: (event: string, properties?: Record<string, unknown>) => void,
): void {
  posthogCapture = captureFn;
}

/**
 * Track an analytics event.
 */
function track(event: string, properties?: Record<string, unknown>): void {
  try {
    posthogCapture?.(event, properties);
  } catch {
    // Analytics should never crash the app
  }
}

/**
 * Track an error in Sentry with optional context.
 */
function trackError(error: unknown, context?: Record<string, string>): void {
  try {
    if (context) {
      Sentry.setContext('level_context', context);
    }
    Sentry.captureException(error);
  } catch {
    // Error tracking should never crash the app
  }
}

// -------------------------------------------------------
// Onboarding events
// -------------------------------------------------------

export function trackOnboardingStarted(): void {
  track('onboarding_started');
}

export function trackOnboardingCompleted(params: {
  vibe: string;
  duration: string;
  starterPack: string;
}): void {
  track('onboarding_completed', params);
}

// -------------------------------------------------------
// Home events
// -------------------------------------------------------

export function trackHomeViewed(): void {
  track('home_viewed');
}

export function trackDailyAssignmentsLoaded(params: {
  count: number;
  completedCount: number;
}): void {
  track('daily_assignments_loaded', params);
}

// -------------------------------------------------------
// Quest events
// -------------------------------------------------------

export function trackQuestStarted(params: {
  assignmentId: string;
  questCategory: string;
  questDifficulty: string;
}): void {
  track('quest_started', params);
}

export function trackProofUploadStarted(params: {
  assignmentId: string;
  proofType: string;
}): void {
  track('proof_upload_started', params);
}

export function trackProofUploadCompleted(params: {
  assignmentId: string;
  proofType: string;
  durationMs: number;
}): void {
  track('proof_upload_completed', params);
}

export function trackQuestCompleted(params: {
  assignmentId: string;
  questCategory: string;
  quality: string;
  xpEarned: number;
  levelUp: boolean;
  isDailyClear: boolean;
}): void {
  track('quest_completed', params);
}

// -------------------------------------------------------
// Progress events
// -------------------------------------------------------

export function trackProgressViewed(params: {
  level: number;
  streak: number;
  totalCompleted: number;
}): void {
  track('progress_viewed', params);
}

export function trackStreakExtended(params: {
  newStreak: number;
  longestStreak: number;
}): void {
  track('streak_extended', params);
}

export function trackLevelUp(params: {
  newLevel: number;
  previousLevel: number;
}): void {
  track('level_up', params);
}

export function trackArchetypeChanged(params: {
  primaryArchetypeId: string | null;
  secondaryArchetypeId: string | null;
}): void {
  track('archetype_changed', params);
}

// -------------------------------------------------------
// Error events
// -------------------------------------------------------

export function trackEdgeFunctionFailed(params: {
  functionName: string;
  errorCode: string;
  errorMessage: string;
}): void {
  track('edge_function_failed', params);
  trackError(new Error(`Edge function ${params.functionName} failed: ${params.errorMessage}`), {
    functionName: params.functionName,
    errorCode: params.errorCode,
  });
}
