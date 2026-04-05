import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.24.2';
import { handleCors } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import { getServiceClient } from '../_shared/db.ts';
import { parseBody, getIdempotencyKey } from '../_shared/validation.ts';
import { ok, errorResponse } from '../_shared/response.ts';
import { notFound, invalidState, forbidden } from '../_shared/errors.ts';

const RequestSchema = z.object({
  assignmentId: z.string().uuid(),
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

    // 1. Fetch assignment with quest
    const { data: assignment, error } = await db
      .from('daily_assignments')
      .select('*, quest:quests(*)')
      .eq('id', body.assignmentId)
      .single();

    if (error || !assignment) {
      throw notFound('Assignment');
    }

    // 2. Validate ownership
    if (assignment.user_id !== userId) {
      throw forbidden('This assignment does not belong to you');
    }

    // 3. Validate state
    if (assignment.status === 'active') {
      // Already started — idempotent success
      return ok(formatResponse(assignment));
    }

    if (assignment.status !== 'pending') {
      throw invalidState(
        `Cannot start assignment in '${assignment.status}' state. Must be 'pending'.`,
      );
    }

    // 4. Mark as started
    const { data: updated, error: updateError } = await db
      .from('daily_assignments')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', body.assignmentId)
      .eq('status', 'pending') // optimistic lock
      .select('*, quest:quests(*)')
      .single();

    if (updateError || !updated) {
      // Race condition — another request already started it
      const { data: current } = await db
        .from('daily_assignments')
        .select('*, quest:quests(*)')
        .eq('id', body.assignmentId)
        .single();

      if (current?.status === 'active') {
        return ok(formatResponse(current));
      }
      throw invalidState('Assignment state changed during request');
    }

    const response = formatResponse(updated);

    // Store idempotency key
    if (idempotencyKey) {
      await db.from('idempotency_keys').upsert({
        key: idempotencyKey,
        user_id: userId,
        function_name: 'quest-start',
        response,
      });
    }

    return ok(response);
  } catch (err) {
    return errorResponse(err);
  }
});

function formatResponse(assignment: Record<string, unknown>) {
  const quest = assignment.quest as Record<string, unknown> | null;
  return {
    assignment: {
      id: assignment.id,
      questId: assignment.quest_id,
      assignedDate: assignment.assigned_date,
      slotNumber: assignment.slot_number,
      status: assignment.status,
      startedAt: assignment.started_at,
    },
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
