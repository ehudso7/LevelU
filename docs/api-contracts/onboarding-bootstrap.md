# POST /functions/v1/onboarding-bootstrap

## Purpose

Completes the onboarding flow: ensures profile + preferences exist, marks onboarding complete, generates Day 1 daily assignments, and returns a home-ready payload.

## Auth

Requires authenticated user (Bearer token). Supports anonymous auth.

## Idempotency

Supports `x-idempotency-key` header. Repeated calls with the same key return the cached response.

## Request

```json
{
  "displayName": "J",
  "timezone": "America/New_York",
  "preferredVibe": "fitness",
  "preferredQuestDuration": "steady",
  "starterPack": "spark"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| displayName | string (1–50) | No | |
| timezone | IANA timezone | No | Defaults to "UTC" |
| preferredVibe | enum | No | fitness, mindfulness, social, creativity, learning, adventure |
| preferredQuestDuration | enum | No | chill, steady, intense, beast. Default: steady |
| starterPack | enum | No | spark, momentum, explorer, social, boss. Default: spark |

## Response (200)

```json
{
  "profile": {
    "id": "uuid",
    "displayName": "J",
    "level": 1,
    "xp": 0,
    "xpToNext": 200,
    "streak": 0,
    "totalCompleted": 0,
    "onboardingCompleted": true,
    "timezone": "America/New_York"
  },
  "assignments": [
    {
      "id": "uuid",
      "questId": "uuid",
      "assignedDate": "2026-04-05",
      "slotNumber": 1,
      "status": "pending",
      "quest": {
        "id": "uuid",
        "title": "Take a 10-minute walk",
        "description": "...",
        "category": "spark",
        "difficulty": "easy",
        "xpReward": 15,
        "estimatedMinutes": 10,
        "proofType": "photo",
        "proofPrompt": "Snap something interesting...",
        "tags": ["fitness", "mindfulness"]
      }
    }
  ],
  "progress": {
    "level": 1,
    "xp": 0,
    "xpToNextLevel": 200,
    "streak": 0,
    "totalCompleted": 0
  }
}
```

## Database Operations

1. SELECT profiles WHERE id = auth.uid()
2. INSERT or UPDATE profiles (display_name, timezone, onboarding_completed)
3. UPSERT user_preferences (vibes, duration)
4. Generate daily_assignments via shared assignment engine
5. SELECT updated profile
