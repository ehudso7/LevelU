import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

/**
 * Daily assignment generator.
 *
 * Generates 3 assignments per day with slot structure:
 *   Slot 1: Quick win (spark, easy)
 *   Slot 2: Variety (momentum/explorer/social, easy-medium)
 *   Slot 3: Value (any category, matches user level)
 *
 * Respects:
 *   - Preferred vibe weighting
 *   - 7-day same-quest cooldown
 *   - Category variety (no two same-category in one day)
 *   - First 7 days: only first_week_ok quests
 *   - Starter/tutorial shaping
 */

interface SlotConfig {
  slotNumber: number;
  categories: string[];
  difficulties: string[];
  preferFirstWeekOk: boolean;
}

/**
 * Get the number of active days since the user signed up.
 */
async function getUserActiveDays(
  db: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data: profile } = await db
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  if (!profile) return 0;

  const created = new Date(profile.created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // Day 1 = signup day
}

/**
 * Get quest IDs assigned to this user in the last 7 days (cooldown).
 */
async function getRecentQuestIds(
  db: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split('T')[0];

  const { data } = await db
    .from('daily_assignments')
    .select('quest_id')
    .eq('user_id', userId)
    .gte('assigned_date', cutoff);

  return new Set((data ?? []).map((r) => r.quest_id));
}

/**
 * Get the user's vibe preferences for weighting.
 */
async function getUserVibes(
  db: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data } = await db
    .from('user_preferences')
    .select('vibes')
    .eq('user_id', userId)
    .single();

  return data?.vibes ?? [];
}

/**
 * Build slot configs based on user's active days and difficulty.
 */
function getSlotConfigs(activeDays: number): SlotConfig[] {
  const isFirstWeek = activeDays <= 7;

  if (isFirstWeek) {
    // First week: all easy, first_week_ok only, guided variety
    return [
      {
        slotNumber: 1,
        categories: ['spark'],
        difficulties: ['easy'],
        preferFirstWeekOk: true,
      },
      {
        slotNumber: 2,
        categories: ['momentum', 'explorer'],
        difficulties: ['easy'],
        preferFirstWeekOk: true,
      },
      {
        slotNumber: 3,
        categories: ['social', 'spark', 'explorer'],
        difficulties: ['easy'],
        preferFirstWeekOk: true,
      },
    ];
  }

  // After first week: introduce variety and difficulty
  return [
    {
      slotNumber: 1,
      categories: ['spark'],
      difficulties: ['easy', 'medium'],
      preferFirstWeekOk: false,
    },
    {
      slotNumber: 2,
      categories: ['momentum', 'explorer', 'social'],
      difficulties: ['easy', 'medium'],
      preferFirstWeekOk: false,
    },
    {
      slotNumber: 3,
      categories: activeDays > 14
        ? ['boss', 'momentum', 'explorer', 'social']
        : ['momentum', 'explorer', 'social', 'spark'],
      difficulties: activeDays > 14
        ? ['medium', 'hard']
        : ['easy', 'medium'],
      preferFirstWeekOk: false,
    },
  ];
}

/**
 * Score a quest for a slot based on preferences and variety.
 */
function scoreQuest(
  quest: { id: string; category: string; tags: string[]; archetype_id: string | null },
  userVibes: string[],
  usedCategories: Set<string>,
  usedQuestIds: Set<string>,
): number {
  let score = 10; // base score

  // Penalty: same category already used today
  if (usedCategories.has(quest.category)) {
    score -= 8;
  }

  // Bonus: matches user's preferred vibes
  const vibeOverlap = quest.tags.filter((t) => userVibes.includes(t)).length;
  score += vibeOverlap * 3;

  // Small random factor for variety
  score += Math.random() * 4;

  return score;
}

/**
 * Generate daily assignments for a user on a given date.
 * Returns the created assignment rows.
 *
 * Idempotent: if assignments already exist for this user+date, returns existing ones.
 */
export async function generateDailyAssignments(
  db: SupabaseClient,
  userId: string,
  date: string,
): Promise<Array<Record<string, unknown>>> {
  // Check for existing assignments (idempotent)
  const { data: existing } = await db
    .from('daily_assignments')
    .select('*, quest:quests(*)')
    .eq('user_id', userId)
    .eq('assigned_date', date)
    .order('slot_number');

  if (existing && existing.length > 0) {
    return existing;
  }

  // Gather context
  const [activeDays, recentQuestIds, userVibes] = await Promise.all([
    getUserActiveDays(db, userId),
    getRecentQuestIds(db, userId),
    getUserVibes(db, userId),
  ]);

  const slotConfigs = getSlotConfigs(activeDays);
  const usedCategories = new Set<string>();
  const usedQuestIds = new Set<string>(recentQuestIds);
  const assignments: Array<{
    user_id: string;
    quest_id: string;
    assigned_date: string;
    slot_number: number;
    assignment_type: string;
    status: string;
    expires_at: string;
  }> = [];

  for (const slot of slotConfigs) {
    // Build query for eligible quests
    let query = db
      .from('quests')
      .select('id, category, tags, archetype_id, difficulty')
      .eq('active', true)
      .in('category', slot.categories)
      .in('difficulty', slot.difficulties);

    if (slot.preferFirstWeekOk) {
      query = query.eq('first_week_ok', true);
    }

    const { data: candidates } = await query.limit(50);

    if (!candidates || candidates.length === 0) {
      // Fallback: get any active quest
      const { data: fallback } = await db
        .from('quests')
        .select('id, category, tags, archetype_id, difficulty')
        .eq('active', true)
        .limit(20);

      if (!fallback || fallback.length === 0) continue;

      // Pick the first non-recent fallback
      const pick = fallback.find((q) => !usedQuestIds.has(q.id)) ?? fallback[0];
      usedCategories.add(pick.category);
      usedQuestIds.add(pick.id);

      assignments.push({
        user_id: userId,
        quest_id: pick.id,
        assigned_date: date,
        slot_number: slot.slotNumber,
        assignment_type: 'daily',
        status: 'pending',
        expires_at: `${date}T23:59:59.999Z`,
      });
      continue;
    }

    // Filter out recently used quests
    const eligible = candidates.filter((q) => !usedQuestIds.has(q.id));
    const pool = eligible.length > 0 ? eligible : candidates;

    // Score and sort
    const scored = pool
      .map((q) => ({
        ...q,
        score: scoreQuest(q, userVibes, usedCategories, usedQuestIds),
      }))
      .sort((a, b) => b.score - a.score);

    const pick = scored[0];
    usedCategories.add(pick.category);
    usedQuestIds.add(pick.id);

    assignments.push({
      user_id: userId,
      quest_id: pick.id,
      assigned_date: date,
      slot_number: slot.slotNumber,
      assignment_type: 'daily',
      status: 'pending',
      expires_at: `${date}T23:59:59.999Z`,
    });
  }

  if (assignments.length === 0) {
    return [];
  }

  // Insert assignments
  const { data: created, error } = await db
    .from('daily_assignments')
    .insert(assignments)
    .select('*, quest:quests(*)');

  if (error) {
    // Handle race condition: another request already created assignments
    if (error.code === '23505') {
      // Unique violation — return existing
      const { data: raceExisting } = await db
        .from('daily_assignments')
        .select('*, quest:quests(*)')
        .eq('user_id', userId)
        .eq('assigned_date', date)
        .order('slot_number');
      return raceExisting ?? [];
    }
    throw error;
  }

  return created ?? [];
}
