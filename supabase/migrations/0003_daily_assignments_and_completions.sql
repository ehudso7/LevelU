-- =============================================================================
-- Migration 0003: Daily Assignments and Quest Completions
-- =============================================================================
-- daily_assignments: server-generated quest slots per user per day.
-- quest_completions: proof submission and quality rating for completed quests.
-- Both are read-only to the client; writes happen via Edge Functions.
-- =============================================================================

-- -------------------------------------------------------
-- Enums
-- -------------------------------------------------------

CREATE TYPE public.assignment_status AS ENUM (
  'pending',     -- assigned, not started
  'active',      -- user has started
  'completed',   -- proof submitted
  'expired',     -- day passed without completion
  'skipped'      -- user explicitly skipped
);

CREATE TYPE public.assignment_type AS ENUM (
  'daily',       -- standard daily quest
  'bonus',       -- optional extra quest
  'challenge'    -- time-limited special quest
);

CREATE TYPE public.completion_quality AS ENUM (
  'standard',    -- basic completion
  'good',        -- above-average effort
  'excellent'    -- outstanding / went above and beyond
);

-- -------------------------------------------------------
-- Table: daily_assignments
-- -------------------------------------------------------
-- Each row = one quest slot for one user on one date.
-- Server generates these (via Edge Function or cron).
-- Client reads only.
-- -------------------------------------------------------

CREATE TABLE public.daily_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id        uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  assigned_date   date NOT NULL DEFAULT CURRENT_DATE,
  slot_number     smallint NOT NULL CHECK (slot_number >= 1 AND slot_number <= 5),
  assignment_type public.assignment_type NOT NULL DEFAULT 'daily',
  status          public.assignment_status NOT NULL DEFAULT 'pending',
  started_at      timestamptz,
  completed_at    timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- One slot per user per date — prevents duplicate assignments
  CONSTRAINT unique_user_date_slot UNIQUE (user_id, assigned_date, slot_number)
);

COMMENT ON TABLE public.daily_assignments IS 'Server-generated quest slots. One per user per date per slot. Client read-only.';

CREATE TRIGGER daily_assignments_updated_at
  BEFORE UPDATE ON public.daily_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- Table: quest_completions
-- -------------------------------------------------------
-- Records proof and outcome of a completed assignment.
-- Created by Edge Function when user submits proof.
-- Client read-only.
-- -------------------------------------------------------

CREATE TABLE public.quest_completions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   uuid NOT NULL UNIQUE REFERENCES public.daily_assignments(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id        uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  proof_url       text,            -- storage path to proof image
  proof_note      text,            -- optional text note
  quality         public.completion_quality NOT NULL DEFAULT 'standard',
  xp_earned       integer NOT NULL CHECK (xp_earned >= 0),
  streak_bonus    integer NOT NULL DEFAULT 0 CHECK (streak_bonus >= 0),
  completed_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quest_completions IS 'Proof and outcome of completed quests. Created by Edge Function. Client read-only.';

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------

-- Home screen: fetch today's assignments for a user
CREATE INDEX idx_daily_assignments_user_date
  ON public.daily_assignments (user_id, assigned_date);

-- Status filtering
CREATE INDEX idx_daily_assignments_status
  ON public.daily_assignments (user_id, status);

-- Expiration sweep
CREATE INDEX idx_daily_assignments_expires
  ON public.daily_assignments (expires_at)
  WHERE status IN ('pending', 'active');

-- Completion history for a user
CREATE INDEX idx_quest_completions_user
  ON public.quest_completions (user_id, completed_at DESC);

-- Completion by assignment (for reward lookup)
CREATE INDEX idx_quest_completions_assignment
  ON public.quest_completions (assignment_id);

-- -------------------------------------------------------
-- RLS: daily_assignments (authenticated read-only to owner)
-- -------------------------------------------------------

ALTER TABLE public.daily_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_assignments FORCE ROW LEVEL SECURITY;

CREATE POLICY daily_assignments_select_own ON public.daily_assignments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- RLS: quest_completions (authenticated read-only to owner)
-- -------------------------------------------------------

ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_completions FORCE ROW LEVEL SECURITY;

CREATE POLICY quest_completions_select_own ON public.quest_completions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
