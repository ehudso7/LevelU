# POST /functions/v1/quest-complete

## Purpose

Completes a quest: validates proof, creates completion record, awards XP, updates streak, updates archetype scores, returns reward + progress.

## Auth

Requires authenticated user (Bearer token).

## Idempotency

Supports `x-idempotency-key` header. Completing an already-completed assignment returns the cached reward.

## Request

```json
{
  "assignmentId": "uuid",
  "proof": {
    "type": "photo_plus_caption",
    "text": "Walked around the park and saw this beautiful sunset",
    "mediaPath": "quest-proofs/user-uuid/photo-123.jpg",
    "metadata": {}
  }
}
```

### Proof Types

| Type | Description | Quality Logic |
|------|-------------|---------------|
| `tap_done` | Honor system | Always "standard" |
| `short_text` | Text-only note | "good" if >= 20 chars |
| `photo` | Photo proof | "good" if media present |
| `social_response` | Social interaction note | "good" if >= 20 chars |
| `photo_plus_caption` | Photo + text | "good" if media + caption >= 10; "excellent" if caption >= 50 |

## Response (200)

```json
{
  "reward": {
    "assignmentId": "uuid",
    "questTitle": "Take a 10-minute walk",
    "quality": "good",
    "xpBreakdown": {
      "base": 15,
      "qualityBonus": 3,
      "streakBonus": 10,
      "firstQuestBonus": 5,
      "dailyClearBonus": 0,
      "total": 33
    },
    "levelUp": false,
    "newLevel": null,
    "message": "Solid work! Great proof."
  },
  "progress": {
    "level": 3,
    "xp": 153,
    "xpToNextLevel": 300,
    "streak": 6,
    "longestStreak": 12,
    "totalCompleted": 29
  },
  "archetypes": {
    "primaryArchetypeId": "uuid",
    "secondaryArchetypeId": "uuid"
  }
}
```

## XP Rules

| Source | Amount |
|--------|--------|
| Easy quest | 15 XP |
| Medium quest | 25 XP |
| Hard quest | 40 XP |
| Good quality bonus | +3 XP |
| Excellent quality bonus | +5 XP |
| First quest of day | +5 XP |
| Daily clear (all 3 done) | +10 XP |
| Streak bonus (1–2 days) | +5 XP |
| Streak bonus (3–6 days) | +10 XP |
| Streak bonus (7–13 days) | +20 XP |
| Streak bonus (14–29 days) | +35 XP |
| Streak bonus (30+ days) | +50 XP |

## Error Codes

| Code | Status | When |
|------|--------|------|
| NOT_FOUND | 404 | Assignment doesn't exist |
| FORBIDDEN | 403 | Assignment belongs to another user |
| INVALID_STATE | 422 | Assignment is expired/skipped |
| CONFLICT | 409 | Assignment already completed (edge case) |

## Database Operations (in order)

1. SELECT daily_assignments + quests
2. Validate ownership and state
3. Evaluate proof quality (deterministic)
4. SELECT profile for current XP/level/streak
5. COUNT today's completions (first quest of day check)
6. SELECT today's assignments (daily clear check)
7. Evaluate streak (check yesterday's completions)
8. INSERT streak_events (reset + increment if applicable)
9. Calculate XP (base + quality + streak + first + clear)
10. Apply XP to profile (handle level-ups)
11. INSERT quest_completions
12. UPDATE daily_assignments status → completed
13. INSERT xp_events
14. UPDATE profiles (xp, level, streak, total_completed)
15. UPSERT user_archetype_scores
16. Recalculate primary/secondary archetypes
17. Store idempotency key
