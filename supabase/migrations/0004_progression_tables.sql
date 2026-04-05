-- =============================================================================
-- Migration 0004: Progression Tables
-- =============================================================================
-- xp_events: immutable log of every XP grant.
-- streak_events: immutable log of streak changes.
-- user_archetype_scores: running archetype affinity scores.
-- All server-written, client read-only.
-- =============================================================================

-- -------------------------------------------------------
-- Enums
-- -------------------------------------------------------

CREATE TYPE public.streak_event_type AS ENUM (
  'increment',    -- completed quest within streak window
  'reset',        -- missed a day, streak reset to 0
  'freeze',       -- streak protected (premium feature, future)
  'bonus'         -- bonus streak from special event
);

-- -------------------------------------------------------
-- Table: xp_events
-- -------------------------------------------------------
-- Append-only log of XP grants. Source of truth for XP history.
-- Never updated or deleted. Written by Edge Functions.
-- -------------------------------------------------------

CREATE TABLE public.xp_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id   uuid REFERENCES public.daily_assignments(id) ON DELETE SET NULL,
  amount          integer NOT NULL CHECK (amount != 0),  -- can be negative for penalties
  reason          text NOT NULL,         -- e.g. 'quest_completion', 'streak_bonus', 'level_up_bonus'
  balance_after   integer NOT NULL CHECK (balance_after >= 0),  -- XP total after this event
  level_after     integer NOT NULL CHECK (level_after >= 1),    -- level after this event
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.xp_events IS 'Append-only XP ledger. Written by server. Client read-only.';

-- -------------------------------------------------------
-- Table: streak_events
-- -------------------------------------------------------
-- Append-only log of streak mutations.
-- Written by the daily assignment cron / completion handler.
-- -------------------------------------------------------

CREATE TABLE public.streak_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type      public.streak_event_type NOT NULL,
  streak_before   integer NOT NULL CHECK (streak_before >= 0),
  streak_after    integer NOT NULL CHECK (streak_after >= 0),
  reason          text,  -- optional human-readable context
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.streak_events IS 'Append-only streak mutation log. Written by server. Client read-only.';

-- -------------------------------------------------------
-- Table: user_archetype_scores
-- -------------------------------------------------------
-- Running affinity scores per user per archetype.
-- Updated by server after quest completions.
-- Used for personalized quest selection.
-- -------------------------------------------------------

CREATE TABLE public.user_archetype_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  archetype_id    uuid NOT NULL REFERENCES public.archetypes(id) ON DELETE CASCADE,
  score           integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  quest_count     integer NOT NULL DEFAULT 0 CHECK (quest_count >= 0),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_archetype UNIQUE (user_id, archetype_id)
);

COMMENT ON TABLE public.user_archetype_scores IS 'Per-user archetype affinity scores. Server-written, used for quest personalization.';

CREATE TRIGGER user_archetype_scores_updated_at
  BEFORE UPDATE ON public.user_archetype_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------

-- XP history for progress screen
CREATE INDEX idx_xp_events_user
  ON public.xp_events (user_id, created_at DESC);

-- Streak history
CREATE INDEX idx_streak_events_user
  ON public.streak_events (user_id, created_at DESC);

-- Archetype scores lookup
CREATE INDEX idx_user_archetype_scores_user
  ON public.user_archetype_scores (user_id);

-- -------------------------------------------------------
-- RLS: xp_events (authenticated read-only to owner)
-- -------------------------------------------------------

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events FORCE ROW LEVEL SECURITY;

CREATE POLICY xp_events_select_own ON public.xp_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- RLS: streak_events (authenticated read-only to owner)
-- -------------------------------------------------------

ALTER TABLE public.streak_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_events FORCE ROW LEVEL SECURITY;

CREATE POLICY streak_events_select_own ON public.streak_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- RLS: user_archetype_scores (authenticated read-only to owner)
-- -------------------------------------------------------

ALTER TABLE public.user_archetype_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_archetype_scores FORCE ROW LEVEL SECURITY;

CREATE POLICY user_archetype_scores_select_own ON public.user_archetype_scores
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
