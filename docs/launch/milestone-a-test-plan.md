# Milestone A — Test Plan

## Automated Tests

### Backend Unit Tests (`npm test`)

| Test Suite | File | What It Covers |
|-----------|------|---------------|
| Quality Evaluation | `src/__tests__/backend/progression.test.ts` | All 5 proof types, threshold boundaries, edge cases |
| Streak Bonus | same file | All 6 streak tiers, boundary values |
| Level Formula | same file | Linear progression curve, specific level checks |
| XP Calculation | same file | Base XP per difficulty, quality/streak/first-of-day/daily-clear bonuses, stacking |
| Level-Up Logic | same file | Single level-up, double level-up, XP carry-over, zero-XP edge case |

### App Smoke Tests (`npm test`)

| Test Suite | File | What It Covers |
|-----------|------|---------------|
| Onboarding Screens | `src/__tests__/app/screens.test.tsx` | Intro renders title + CTA, vibe shows 6 options, duration shows 4 options, starter-pack renders |
| Home Screen | same file | Renders loading state correctly |
| Progress Screen | same file | Renders without crashing |

## Manual Integration Tests

These require a running Supabase instance (`npx supabase start` + `npx supabase db reset`).

### Auth Flow
1. Launch app → lands on onboarding intro
2. Tap "Get Started" → anonymous session created (check Supabase Auth dashboard)
3. Verify profile row created in `profiles` table

### Onboarding Flow
1. Select vibes → navigate to duration → select duration → navigate to starter-pack
2. Tap "Let's Go!" → onboarding-bootstrap function called
3. Verify: `profiles.onboarding_completed = true`
4. Verify: `user_preferences` row created with correct vibes/duration
5. Verify: 3 `daily_assignments` rows created for today

### Home Screen
1. After onboarding → home loads with 3 assignment cards
2. Each card shows: title, description, difficulty badge, XP reward, time estimate
3. Pull-to-refresh works
4. Streak bar shows current streak and level/XP

### Quest Flow
1. Tap assignment card → quest detail screen
2. Tap "Start Quest" → `quest-start` function called
3. Verify: `daily_assignments.status = 'active'`, `started_at` set
4. Capture proof photo or write caption
5. Tap "Submit Proof" → photo uploads to Storage → `quest-complete` called
6. Verify: `quest_completions` row created
7. Verify: `xp_events` row created with correct breakdown
8. Verify: `profiles.xp` updated, `profiles.total_completed` incremented

### Reward Reveal
1. After completion → reward screen shows XP breakdown
2. If quality is "good" → +3 bonus shown
3. If first quest of day → +5 bonus shown
4. If all 3 quests completed → +10 daily clear bonus shown
5. If level up → "LEVEL UP!" banner with new level

### Streak Logic
1. Complete 1 quest → streak should be 1
2. Next day: complete 1 quest → streak should be 2
3. Miss a day → streak resets to 0 (verify `streak_events` has reset row)

### Idempotency
1. Complete a quest → note the reward
2. Call `quest-complete` again with same idempotency key → same reward returned
3. XP should NOT be doubled

### Ownership
1. Get assignment ID from user A
2. Try to call `quest-start` with user B's token → expect 403 FORBIDDEN

## Analytics Verification

1. Set up PostHog project and configure `EXPO_PUBLIC_POSTHOG_API_KEY`
2. Run through the full flow
3. Verify these events appear in PostHog:
   - `onboarding_started`
   - `onboarding_completed` (with vibe, duration, starterPack properties)
   - `home_viewed`
   - `daily_assignments_loaded` (with count, completedCount)
   - `quest_started` (with assignmentId, questCategory, questDifficulty)
   - `quest_completed` (with xpEarned, quality, levelUp)
   - `progress_viewed` (with level, streak, totalCompleted)
4. Trigger errors and verify `edge_function_failed` appears

## Sentry Verification

1. Set up Sentry project and configure `EXPO_PUBLIC_SENTRY_DSN`
2. Trigger an Edge Function error (e.g., disconnect Supabase)
3. Verify error appears in Sentry with `level_context` containing functionName and errorCode
