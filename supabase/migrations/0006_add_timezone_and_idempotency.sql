-- =============================================================================
-- Migration 0006: Add timezone to profiles + idempotency key table
-- =============================================================================

-- Timezone on profiles — needed for streak evaluation at local midnight
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC';

-- Idempotency keys — prevents duplicate mutations from retried requests
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key         text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  function_name text NOT NULL,
  response    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_idempotency_keys_user ON public.idempotency_keys (user_id);
CREATE INDEX idx_idempotency_keys_created ON public.idempotency_keys (created_at);

-- RLS: only service_role writes; user can read own keys (not strictly needed but safe)
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys FORCE ROW LEVEL SECURITY;

CREATE POLICY idempotency_keys_service_all ON public.idempotency_keys
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Cleanup old keys (run periodically via cron)
-- Keys older than 24h can be safely deleted
