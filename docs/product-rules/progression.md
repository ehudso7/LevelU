# Progression System — Product Rules

## Overview

LEVEL uses an XP-based leveling system with streaks as a secondary progression mechanic. All progression state is server-authoritative — the client reads but never writes progression fields.

## XP System

### Sources of XP

| Source             | Typical Amount | Notes                          |
|-------------------|---------------|--------------------------------|
| Quest completion  | 15–120 XP     | Based on quest difficulty/category |
| Streak bonus      | 5–50 XP       | Scales with current streak length |
| Level-up bonus    | 25 XP         | Bonus on crossing level threshold |
| Quality bonus     | 0–30 XP       | Future: based on completion_quality |

### XP Formula

```
xp_earned = quest.xp_reward + streak_bonus(current_streak) + quality_bonus(quality)
```

### Streak Bonus Scale

| Streak Days | Bonus XP |
|------------|---------|
| 1–2        | +5      |
| 3–6        | +10     |
| 7–13       | +20     |
| 14–29      | +35     |
| 30+        | +50     |

## Leveling

### Level Thresholds

XP required per level increases linearly:

```
xp_to_next_level = 200 + (level - 1) * 50
```

| Level | XP to Next | Cumulative XP |
|-------|-----------|--------------|
| 1     | 200       | 0            |
| 2     | 250       | 200          |
| 3     | 300       | 450          |
| 4     | 350       | 750          |
| 5     | 400       | 1,100        |
| 10    | 650       | 4,225        |
| 20    | 1,150     | 13,225       |

### Level-Up Behavior

When `profiles.xp >= profiles.xp_to_next`:
1. `profiles.level` += 1
2. `profiles.xp` -= old `xp_to_next` (carry over excess)
3. `profiles.xp_to_next` = 200 + (new_level - 1) * 50
4. Insert level-up `xp_events` row with +25 bonus XP
5. Client shows level-up celebration on reward screen

## Streak System

### Rules

1. **Increment**: Completing at least one quest in a calendar day increments the streak.
2. **Reset**: If a user completes zero quests on any day they had assignments, the streak resets to 0.
3. **Grace**: Users with no assignments on a day (e.g., server didn't generate them) do not lose their streak.
4. **Longest streak**: `profiles.longest_streak` tracks the all-time best.
5. **Freeze (future)**: Premium users can freeze their streak once per week.

### Streak Events

Every streak change is logged in `streak_events`:
- `increment`: Daily completion maintained the streak
- `reset`: Missed day, streak back to 0
- `freeze`: Streak was protected (future premium feature)
- `bonus`: Special event granted bonus streak days

## Archetype Scores

### How It Works

Each quest is optionally linked to an archetype. When a user completes that quest:
1. `user_archetype_scores.score` += quest XP for that archetype
2. `user_archetype_scores.quest_count` += 1

### Usage

- The quest engine uses archetype scores to personalize daily assignments.
- Higher archetype score → more quests from that archetype's pool.
- Ensures users get quests aligned with their emerging play style.
- Displayed on future profile screen (post-Milestone A).

## Server Authority

**Critical rule**: The client NEVER writes to:
- `profiles.level`, `profiles.xp`, `profiles.streak`, `profiles.xp_to_next`
- `profiles.longest_streak`, `profiles.total_completed`
- `xp_events`, `streak_events`, `user_archetype_scores`
- `quest_completions`, `daily_assignments`

All writes go through Edge Functions that validate, compute, and atomically update these fields.

## Progress Snapshot (Client View)

The client reads `profiles` to construct a `ProgressSnapshot`:

```typescript
{
  level: profiles.level,
  xp: profiles.xp,
  xpToNextLevel: profiles.xp_to_next,
  streak: profiles.streak,
  totalCompleted: profiles.total_completed,
  weeklyCompleted: COUNT(quest_completions WHERE completed_at > 7 days ago)
}
```

`weeklyCompleted` is computed client-side from `quest_completions` for now. May move to a materialized view if performance requires.
