import { callFunction } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type {
  QuestStartRequest,
  QuestStartResponse,
  QuestCompleteRequest,
  QuestCompleteResponse,
} from '../../types/api';

/**
 * Start a quest: marks assignment as active.
 */
export async function startQuest(
  assignmentId: string,
  idempotencyKey?: string,
): Promise<QuestStartResponse> {
  return callFunction<QuestStartResponse, QuestStartRequest>(
    'quest-start',
    { assignmentId },
    idempotencyKey ? { idempotencyKey } : undefined,
  );
}

/**
 * Complete a quest with proof.
 */
export async function completeQuest(
  params: QuestCompleteRequest,
  idempotencyKey?: string,
): Promise<QuestCompleteResponse> {
  return callFunction<QuestCompleteResponse, QuestCompleteRequest>(
    'quest-complete',
    params,
    idempotencyKey ? { idempotencyKey } : undefined,
  );
}

/**
 * Upload proof photo to Supabase Storage.
 * Returns the storage path (not a public URL).
 */
export async function uploadProofPhoto(
  userId: string,
  assignmentId: string,
  fileUri: string,
): Promise<string> {
  const ext = fileUri.split('.').pop() ?? 'jpg';
  const path = `${userId}/${assignmentId}.${ext}`;

  // Read the file and upload
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('quest-proofs')
    .upload(path, blob, {
      contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
      upsert: true,
    });

  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  return path;
}
