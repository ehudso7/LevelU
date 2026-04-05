import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.24.2';
import { handleCors } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import { getServiceClient } from '../_shared/db.ts';
import { parseBody, getIdempotencyKey } from '../_shared/validation.ts';
import { ok, errorResponse } from '../_shared/response.ts';
import { notFound, invalidState, forbidden, conflict } from '../_shared/errors.ts';
import { getTodayInTimezone, getYesterdayInTimezone } from '../_shared/timezone.ts';
import {
  evaluateQuality,
  calculateXp,
  applyXp,
  evaluateStreak,
  recalculateArchetypes,
  type ProofSubmissionType,
} from '../_shared/progression.ts';

const ProofSchema = z.object({
  type: z.enum(['photo_plus_caption', 'photo', 'short_text', 'tap_done', 'social_response']),
  text: z.string().optional().nullable(),
  mediaPath: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
});

const RequestSchema = z.object({
  assignmentId: z.string().uuid(),
  proof: ProofSchema,
});

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const userId = await getAuthenticatedUserId(req);
    const body = await parseBody(req, RequestSchema);
    const db = getServiceClient();

    // Idempotency check
    const idempotencyKey = getIdempotencyKey(req);
    if (idempotencyKey) {
      const { data: existing } = await db
        .from('idempotency_keys')
        .select('response')
        .eq('key', idempotencyKey)
        .eq('user_id', userId)
        .single();

      if (existing?.response) {
        return ok(existing.response);
      }
    }

    // 1. Fetch assignment with quest details
    const { data: assignment, error: assignmentError } = await db
      .from('daily_assignments')
      .select('*, quest:quests(*)')
      .eq('id', body.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      throw notFound('Assignment');
    }

    // 2. Validate ownership
    if (assignment.user_id !== userId) {
      throw forbidden('This assignment does not belong to you');
    }

    // 3. Validate state — must be active (or pending, we allow direct completion)
    if (assignment.status === 'completed') {
      // Already completed — check for existing completion and return it
      const { data: existingCompletion } = await db
        .from('quest_completions')
        .select('*')
        .eq('assignment_id', body.assignmentId)
        .single();

      if (existingCompletion) {
        return ok(await buildRewardResponse(db, userId, existingCompletion, assignment));
      }
      throw conflict('Assignment already completed but completion record missing');
    }

    if (assignment.status !== 'active' && assignment.status !== 'pending') {
      throw invalidState(
        `Cannot complete assignment in '${assignment.status}' state. Must be 'active' or 'pending'.`,
      );
    }

    const quest = assignment.quest as Record<string, unknown>;
    const now = new Date().toISOString();

    // 4. Evaluate proof quality
    const quality = evaluateQuality(
      body.proof.type as ProofSubmissionType,
      body.proof.text,
      body.proof.mediaPath,
    );

    // 5. Fetch current profile for progression calculation
    const { data: profile } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) throw notFound('Profile');

    const timezone = profile.timezone ?? 'UTC';
    const today = getTodayInTimezone(timezone);
    const yesterday = getYesterdayInTimezone(timezone);

    // 6. Check if this is the first quest of the day
    const { count: completedToday } = await db
      .from('quest_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00`)
      .lt('completed_at', `${today}T23:59:59.999`);

    const isFirstQuestOfDay = (completedToday ?? 0) === 0;

    // 7. Check if this completion clears all daily quests
    const { data: todayAssignments } = await db
      .from('daily_assignments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('assigned_date', today);

    const pendingOrActive = (todayAssignments ?? []).filter(
      (a) => a.id !== body.assignmentId && (a.status === 'pending' || a.status === 'active'),
    );
    const isDailyClear = pendingOrActive.length === 0;

    // 8. Evaluate streak
    let currentStreak = profile.streak;

    // If this is the first completion today and user didn't complete yesterday,
    // we need to evaluate streak freshly
    if (isFirstQuestOfDay) {
      const streakResult = await evaluateStreak(db, userId, currentStreak, yesterday);

      if (streakResult.eventType === 'reset' && currentStreak > 0) {
        // Record streak reset
        await db.from('streak_events').insert({
          user_id: userId,
          event_type: 'reset',
          streak_before: currentStreak,
          streak_after: 0,
          reason: 'No completions on previous day',
        });
        currentStreak = 0;
      }

      // Increment streak for today's first completion
      const newStreak = currentStreak + 1;
      await db.from('streak_events').insert({
        user_id: userId,
        event_type: 'increment',
        streak_before: currentStreak,
        streak_after: newStreak,
        reason: 'First quest completion of the day',
      });
      currentStreak = newStreak;
    }

    // 9. Calculate XP
    const xpCalc = calculateXp({
      difficulty: quest.difficulty as string,
      quality,
      currentStreak,
      isFirstQuestOfDay,
      isDailyClear,
    });

    // 10. Apply XP and level-up
    const progression = applyXp(
      profile.xp,
      profile.level,
      profile.xp_to_next,
      xpCalc.totalXp,
    );

    // 11. Create quest_completion record
    const { data: completion, error: completionError } = await db
      .from('quest_completions')
      .insert({
        assignment_id: body.assignmentId,
        user_id: userId,
        quest_id: assignment.quest_id,
        proof_url: body.proof.mediaPath ?? null,
        proof_note: body.proof.text ?? null,
        quality,
        xp_earned: xpCalc.totalXp,
        streak_bonus: xpCalc.streakBonus,
        completed_at: now,
      })
      .select()
      .single();

    if (completionError) {
      // Unique constraint violation — already completed
      if (completionError.code === '23505') {
        const { data: existing } = await db
          .from('quest_completions')
          .select('*')
          .eq('assignment_id', body.assignmentId)
          .single();
        if (existing) {
          return ok(await buildRewardResponse(db, userId, existing, assignment));
        }
      }
      throw completionError;
    }

    // 12. Update assignment status
    await db
      .from('daily_assignments')
      .update({ status: 'completed', completed_at: now })
      .eq('id', body.assignmentId);

    // 13. Insert XP event
    await db.from('xp_events').insert({
      user_id: userId,
      assignment_id: body.assignmentId,
      amount: xpCalc.totalXp,
      reason: buildXpReason(xpCalc),
      balance_after: progression.newXp,
      level_after: progression.newLevel,
    });

    // 14. Update profile progression
    const longestStreak = Math.max(profile.longest_streak, currentStreak);
    await db
      .from('profiles')
      .update({
        xp: progression.newXp,
        level: progression.newLevel,
        xp_to_next: progression.newXpToNext,
        streak: currentStreak,
        longest_streak: longestStreak,
        total_completed: profile.total_completed + 1,
      })
      .eq('id', userId);

    // 15. Update archetype scores
    if (quest.archetype_id) {
      const { data: existingScore } = await db
        .from('user_archetype_scores')
        .select('id, score, quest_count')
        .eq('user_id', userId)
        .eq('archetype_id', quest.archetype_id)
        .single();

      if (existingScore) {
        await db
          .from('user_archetype_scores')
          .update({
            score: existingScore.score + xpCalc.totalXp,
            quest_count: existingScore.quest_count + 1,
          })
          .eq('id', existingScore.id);
      } else {
        await db.from('user_archetype_scores').insert({
          user_id: userId,
          archetype_id: quest.archetype_id,
          score: xpCalc.totalXp,
          quest_count: 1,
        });
      }
    }

    // 16. Recalculate primary/secondary archetypes (for future use)
    const archetypes = await recalculateArchetypes(db, userId);

    // 17. Build reward response
    const response = {
      reward: {
        assignmentId: body.assignmentId,
        questTitle: quest.title,
        quality,
        xpBreakdown: {
          base: xpCalc.baseXp,
          qualityBonus: xpCalc.qualityBonus,
          streakBonus: xpCalc.streakBonus,
          firstQuestBonus: xpCalc.firstQuestBonus,
          dailyClearBonus: xpCalc.dailyClearBonus,
          total: xpCalc.totalXp,
        },
        levelUp: progression.leveledUp,
        newLevel: progression.leveledUp ? progression.newLevel : null,
        message: buildRewardMessage(quality, progression.leveledUp, isDailyClear),
      },
      progress: {
        level: progression.newLevel,
        xp: progression.newXp,
        xpToNextLevel: progression.newXpToNext,
        streak: currentStreak,
        longestStreak,
        totalCompleted: profile.total_completed + 1,
      },
      archetypes: {
        primaryArchetypeId: archetypes.primaryArchetypeId,
        secondaryArchetypeId: archetypes.secondaryArchetypeId,
      },
    };

    // Store idempotency key
    if (idempotencyKey) {
      await db.from('idempotency_keys').upsert({
        key: idempotencyKey,
        user_id: userId,
        function_name: 'quest-complete',
        response,
      });
    }

    return ok(response);
  } catch (err) {
    return errorResponse(err);
  }
});

function buildXpReason(xpCalc: {
  baseXp: number;
  qualityBonus: number;
  streakBonus: number;
  firstQuestBonus: number;
  dailyClearBonus: number;
}): string {
  const parts = [`quest_completion(${xpCalc.baseXp})`];
  if (xpCalc.qualityBonus > 0) parts.push(`quality(+${xpCalc.qualityBonus})`);
  if (xpCalc.streakBonus > 0) parts.push(`streak(+${xpCalc.streakBonus})`);
  if (xpCalc.firstQuestBonus > 0) parts.push(`first_of_day(+${xpCalc.firstQuestBonus})`);
  if (xpCalc.dailyClearBonus > 0) parts.push(`daily_clear(+${xpCalc.dailyClearBonus})`);
  return parts.join(', ');
}

function buildRewardMessage(
  quality: string,
  levelUp: boolean,
  dailyClear: boolean,
): string {
  if (levelUp && dailyClear) return 'LEVEL UP! You cleared all quests today!';
  if (levelUp) return 'LEVEL UP! You\'re getting stronger!';
  if (dailyClear) return 'Daily clean sweep! All quests complete!';
  if (quality === 'excellent') return 'Exceptional effort! That proof was outstanding.';
  if (quality === 'good') return 'Solid work! Great proof.';
  return 'Quest complete! Keep the momentum going.';
}

async function buildRewardResponse(
  db: ReturnType<typeof getServiceClient>,
  userId: string,
  completion: Record<string, unknown>,
  assignment: Record<string, unknown>,
) {
  const quest = assignment.quest as Record<string, unknown>;
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return {
    reward: {
      assignmentId: completion.assignment_id,
      questTitle: quest.title,
      quality: completion.quality,
      xpBreakdown: {
        base: completion.xp_earned,
        qualityBonus: 0,
        streakBonus: completion.streak_bonus,
        firstQuestBonus: 0,
        dailyClearBonus: 0,
        total: completion.xp_earned,
      },
      levelUp: false,
      newLevel: null,
      message: 'Quest already completed.',
    },
    progress: {
      level: profile?.level ?? 1,
      xp: profile?.xp ?? 0,
      xpToNextLevel: profile?.xp_to_next ?? 200,
      streak: profile?.streak ?? 0,
      longestStreak: profile?.longest_streak ?? 0,
      totalCompleted: profile?.total_completed ?? 0,
    },
    archetypes: await recalculateArchetypes(db, userId),
  };
}
