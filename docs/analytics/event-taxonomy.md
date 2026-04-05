# LEVEL — Analytics Event Taxonomy

## Provider: PostHog (product analytics) + Sentry (error tracking)

## Events

### Onboarding

| Event | Trigger | Properties |
|-------|---------|-----------|
| `onboarding_started` | User taps "Get Started" and anonymous auth succeeds | — |
| `onboarding_completed` | Bootstrap Edge Function succeeds | `vibe`, `duration`, `starterPack` |

### Home

| Event | Trigger | Properties |
|-------|---------|-----------|
| `home_viewed` | Home data loads (fresh fetch) | — |
| `daily_assignments_loaded` | Home data includes assignments | `count` (total), `completedCount` |

### Quest

| Event | Trigger | Properties |
|-------|---------|-----------|
| `quest_started` | quest-start function returns success | `assignmentId`, `questCategory`, `questDifficulty` |
| `proof_upload_started` | Photo upload begins | `assignmentId`, `proofType` |
| `proof_upload_completed` | Photo upload succeeds | `assignmentId`, `proofType`, `durationMs` |
| `quest_completed` | quest-complete function returns reward | `assignmentId`, `questCategory`, `quality`, `xpEarned`, `levelUp`, `isDailyClear` |

### Progression

| Event | Trigger | Properties |
|-------|---------|-----------|
| `progress_viewed` | Progress screen data loads | `level`, `streak`, `totalCompleted` |
| `streak_extended` | Quest completion extends streak | `newStreak`, `longestStreak` |
| `level_up` | Quest completion triggers level-up | `newLevel`, `previousLevel` |
| `archetype_changed` | Archetype scores recalculated | `primaryArchetypeId`, `secondaryArchetypeId` |

### Errors

| Event | Trigger | Properties |
|-------|---------|-----------|
| `edge_function_failed` | Any Edge Function call returns error | `functionName`, `errorCode`, `errorMessage` |

## Sentry Integration

- All `edge_function_failed` events also create a Sentry exception
- Sentry context includes `functionName` and `errorCode` under `level_context`
- Sentry is initialized conditionally (only if `EXPO_PUBLIC_SENTRY_DSN` is set)
- In dev mode: Sentry captures 100% of traces but is disabled for reporting
- In production: 20% trace sample rate

## PostHog Integration

- PostHog wraps the app via `PostHogProvider` in root layout
- Events from non-component contexts use a global capture function set at init
- PostHog is optional — if API key is missing, all track calls no-op silently
