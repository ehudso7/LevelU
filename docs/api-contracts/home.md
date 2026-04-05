# POST /functions/v1/home

## Purpose

Returns the home screen payload: profile, progress snapshot, today's assignments (generated if missing), and top archetype scores.

## Auth

Requires authenticated user (Bearer token).

## Request

No body required. POST with empty body or `{}`.

## Response (200)

```json
{
  "profile": {
    "id": "uuid",
    "displayName": "J",
    "level": 3,
    "xp": 120,
    "xpToNext": 300,
    "streak": 5,
    "longestStreak": 12,
    "totalCompleted": 28,
    "timezone": "America/New_York"
  },
  "progress": {
    "level": 3,
    "xp": 120,
    "xpToNextLevel": 300,
    "streak": 5,
    "longestStreak": 12,
    "totalCompleted": 28,
    "weeklyCompleted": 8
  },
  "assignments": [
    {
      "id": "uuid",
      "questId": "uuid",
      "assignedDate": "2026-04-05",
      "slotNumber": 1,
      "assignmentType": "daily",
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "quest": { ... }
    }
  ],
  "archetypes": [
    {
      "archetypeId": "uuid",
      "slug": "explorer",
      "name": "Explorer",
      "emoji": "🗺️",
      "score": 450,
      "questCount": 12
    }
  ],
  "today": "2026-04-05"
}
```

## Database Operations

1. SELECT profiles WHERE id = auth.uid()
2. Generate daily_assignments for today if missing (via shared engine)
3. COUNT quest_completions in last 7 days
4. SELECT user_archetype_scores joined with archetypes (top 3)
