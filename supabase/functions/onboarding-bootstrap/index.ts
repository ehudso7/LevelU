import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.24.2';
import { handleCors } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import { getServiceClient } from '../_shared/db.ts';
import { parseBody, getIdempotencyKey } from '../_shared/validation.ts';
import { ok, errorResponse } from '../_shared/response.ts';
import { conflict } from '../_shared/errors.ts';
import { getTodayInTimezone, isValidTimezone } from '../_shared/timezone.ts';
import { generateDailyAssignments } from '../_shared/assignments.ts';

const RequestSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  timezone: z.string().refine(isValidTimezone, 'Invalid IANA timezone').default('UTC'),
  preferredVibe: z.enum([
    'fitness', 'mindfulness', 'social', 'creativity', 'learning', 'adventure',
  ]).optional(),
  preferredQuestDuration: z.enum(['chill', 'steady', 'intense', 'beast']).default('steady'),
  starterPack: z.enum(['spark', 'momentum', 'explorer', 'social', 'boss']).default('spark'),
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

    // 1. Ensure profile exists and update it
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    if (!profile) {
      // Profile should exist via trigger, but create if somehow missing
      await db.from('profiles').insert({
        id: userId,
        display_name: body.displayName ?? null,
        timezone: body.timezone,
        onboarding_completed: true,
      });
    } else {
      // Update profile with onboarding data
      await db
        .from('profiles')
        .update({
          display_name: body.displayName ?? profile.display_name,
          timezone: body.timezone,
          onboarding_completed: true,
        })
        .eq('id', userId);
    }

    // 2. Upsert user preferences
    const vibes = body.preferredVibe ? [body.preferredVibe] : [];
    await db
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          vibes,
          duration: body.preferredQuestDuration,
        },
        { onConflict: 'user_id' },
      );

    // 3. Generate Day 1 assignments
    const today = getTodayInTimezone(body.timezone);
    const assignments = await generateDailyAssignments(db, userId, today);

    // 4. Fetch updated profile
    const { data: updatedProfile } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 5. Build response
    const response = {
      profile: {
        id: updatedProfile!.id,
        displayName: updatedProfile!.display_name,
        level: updatedProfile!.level,
        xp: updatedProfile!.xp,
        xpToNext: updatedProfile!.xp_to_next,
        streak: updatedProfile!.streak,
        totalCompleted: updatedProfile!.total_completed,
        onboardingCompleted: updatedProfile!.onboarding_completed,
        timezone: updatedProfile!.timezone,
      },
      assignments: assignments.map(formatAssignment),
      progress: {
        level: updatedProfile!.level,
        xp: updatedProfile!.xp,
        xpToNextLevel: updatedProfile!.xp_to_next,
        streak: updatedProfile!.streak,
        totalCompleted: updatedProfile!.total_completed,
      },
    };

    // Store idempotency key
    if (idempotencyKey) {
      await db.from('idempotency_keys').upsert({
        key: idempotencyKey,
        user_id: userId,
        function_name: 'onboarding-bootstrap',
        response,
      });
    }

    return ok(response);
  } catch (err) {
    return errorResponse(err);
  }
});

function formatAssignment(a: Record<string, unknown>) {
  const quest = a.quest as Record<string, unknown> | null;
  return {
    id: a.id,
    questId: a.quest_id,
    assignedDate: a.assigned_date,
    slotNumber: a.slot_number,
    status: a.status,
    quest: quest
      ? {
          id: quest.id,
          title: quest.title,
          description: quest.description,
          category: quest.category,
          difficulty: quest.difficulty,
          xpReward: quest.xp_reward,
          estimatedMinutes: quest.estimated_minutes,
          proofType: quest.proof_type,
          proofPrompt: quest.proof_prompt,
          tags: quest.tags,
        }
      : null,
  };
}
