# POST /functions/v1/quest-start

## Purpose

Marks a daily assignment as started. Validates ownership and state.

## Auth

Requires authenticated user (Bearer token).

## Idempotency

Supports `x-idempotency-key` header. Also naturally idempotent — starting an already-active assignment returns success.

## Request

```json
{
  "assignmentId": "uuid"
}
```

## Response (200)

```json
{
  "assignment": {
    "id": "uuid",
    "questId": "uuid",
    "assignedDate": "2026-04-05",
    "slotNumber": 1,
    "status": "active",
    "startedAt": "2026-04-05T14:30:00Z"
  },
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
```

## Error Codes

| Code | Status | When |
|------|--------|------|
| NOT_FOUND | 404 | Assignment doesn't exist |
| FORBIDDEN | 403 | Assignment belongs to another user |
| INVALID_STATE | 422 | Assignment is completed/expired/skipped |

## Database Operations

1. SELECT daily_assignments + quests WHERE id = assignmentId
2. Validate user_id = auth.uid()
3. UPDATE daily_assignments SET status = 'active', started_at = now()
