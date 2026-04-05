import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import { getServiceClient } from '../_shared/db.ts';
import { ok, errorResponse } from '../_shared/response.ts';
import { notFound } from '../_shared/errors.ts';
import { getTodayInTimezone } from '../_shared/timezone.ts';
import { generateDailyAssignments } from '../_shared/assignments.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const userId = await getAuthenticatedUserId(req);
    const db = getServiceClient();

    // 1. Fetch profile
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw notFound('Profile');
    }

    // 2. Get or generate today's assignments
    const today = getTodayInTimezone(profile.timezone ?? 'UTC');
    const assignments = await generateDailyAssignments(db, userId, today);

    // 3. Compute weekly completed count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: weeklyCompleted } = await db
      .from('quest_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', sevenDaysAgo.toISOString());

    // 4. Fetch user's archetype scores for display
    const { data: archetypeScores } = await db
      .from('user_archetype_scores')
      .select('archetype_id, score, quest_count, archetype:archetypes(slug, name, emoji)')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(3);

    // 5. Build response
    const response = {
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        level: profile.level,
        xp: profile.xp,
        xpToNext: profile.xp_to_next,
        streak: profile.streak,
        longestStreak: profile.longest_streak,
        totalCompleted: profile.total_completed,
        timezone: profile.timezone,
      },
      progress: {
        level: profile.level,
        xp: profile.xp,
        xpToNextLevel: profile.xp_to_next,
        streak: profile.streak,
        longestStreak: profile.longest_streak,
        totalCompleted: profile.total_completed,
        weeklyCompleted: weeklyCompleted ?? 0,
      },
      assignments: assignments.map(formatAssignment),
      archetypes: (archetypeScores ?? []).map((s) => ({
        archetypeId: s.archetype_id,
        slug: (s.archetype as Record<string, unknown>)?.slug,
        name: (s.archetype as Record<string, unknown>)?.name,
        emoji: (s.archetype as Record<string, unknown>)?.emoji,
        score: s.score,
        questCount: s.quest_count,
      })),
      today,
    };

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
    assignmentType: a.assignment_type,
    status: a.status,
    startedAt: a.started_at,
    completedAt: a.completed_at,
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
