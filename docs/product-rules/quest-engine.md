# Quest Engine — Product Rules

## Overview

The quest engine is the core gameplay loop of LEVEL. It assigns daily quests to users, validates completions, and grants rewards. All progression-critical logic runs server-side.

## Quest Categories

| Category   | Purpose                          | Typical XP | Typical Time |
|-----------|----------------------------------|-----------|-------------|
| `spark`   | Quick daily micro-tasks           | 15–40     | 2–10 min    |
| `momentum`| Habit-building, streak-friendly   | 20–60     | 5–60 min    |
| `explorer`| Try something new                 | 30–50     | 10–40 min   |
| `social`  | Connect with another person       | 25–55     | 2–30 min    |
| `boss`    | Larger challenge, higher XP       | 75–120    | 25–60 min   |

## Quest Difficulty

| Level    | XP Multiplier Context | Target Audience        |
|---------|----------------------|------------------------|
| `easy`  | Base XP              | Everyone, especially new users |
| `medium`| ~1.5x base           | Active users, week 2+  |
| `hard`  | ~2x base             | Committed users, boss quests |

## Daily Assignment Rules

1. **Slot count**: Each user receives 3 daily quest slots (expandable to 5 for premium, future).
2. **Assignment time**: Quests are assigned at midnight in the user's timezone (or on first app open if backfill needed).
3. **Category mix**: Daily assignments aim for variety — no two quests from the same category in one day.
4. **First-week safety**: New users (first 7 days) only receive quests flagged `first_week_ok = true`.
5. **Difficulty curve**: Week 1 is all `easy`. Week 2 introduces `medium`. `hard` appears in week 3+.
6. **No repeats within 7 days**: A quest should not be re-assigned to the same user within a 7-day window.
7. **Archetype weighting**: After initial onboarding, quest selection is weighted toward the user's dominant archetype.

## Proof Types

| Type         | Description                        | Required? |
|-------------|-------------------------------------|-----------|
| `photo`     | Photo of completed task             | Yes       |
| `selfie`    | Selfie during/after task            | Yes       |
| `screenshot`| Screen capture as evidence          | Yes       |
| `text_note` | Written confirmation/reflection     | Optional  |
| `none`      | Honor system — no proof required    | No        |

## Completion Flow

1. User taps "Start Quest" → `daily_assignments.status` moves to `active`, `started_at` is set.
2. User captures proof (photo/selfie/screenshot) or writes a note.
3. User submits proof → Edge Function:
   a. Uploads proof to `quest-proofs` storage bucket.
   b. Creates `quest_completions` row.
   c. Updates `daily_assignments.status` to `completed`.
   d. Calculates XP (base + streak bonus + quality bonus).
   e. Inserts `xp_events` row.
   f. Updates `profiles.xp`, `profiles.level` if threshold crossed.
   g. Updates streak via `streak_events`.
   h. Updates `user_archetype_scores` based on quest archetype.

## Expiration

- Quests expire at end of day (midnight user timezone).
- Expired quests: `daily_assignments.status` → `expired`.
- Streak is evaluated at assignment time: if no completion from previous day, streak resets.

## Skip

- Users can skip a quest (status → `skipped`). No XP penalty, but it doesn't count toward streak.
- Skipped quests are not replaced (in Milestone A).

## Quality Rating (Future)

`completion_quality` defaults to `standard` in Milestone A. In future milestones:
- `good` = +10% XP bonus
- `excellent` = +25% XP bonus (e.g., exceptional proof photo, detailed reflection)
