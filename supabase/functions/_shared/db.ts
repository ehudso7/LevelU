import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

/**
 * Creates a Supabase client using the service role key.
 * This bypasses RLS — all writes in Edge Functions use this client.
 * Identity validation is done explicitly in auth.ts.
 */
export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
