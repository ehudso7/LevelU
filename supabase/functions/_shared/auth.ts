import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { unauthorized } from './errors.ts';

/**
 * Extracts and validates the authenticated user from the request.
 * Uses the anon key client to verify the JWT — does NOT use service role for auth.
 * Returns the user ID (uuid).
 */
export async function getAuthenticatedUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw unauthorized('Missing or malformed Authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw unauthorized('Invalid or expired token');
  }

  return user.id;
}
