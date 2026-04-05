-- =============================================================================
-- Migration 0002: Archetypes and Quests
-- =============================================================================
-- Archetypes define player personality dimensions.
-- Quests are the core content units — immutable templates assigned to users.
-- Both are read-only to authenticated users.
-- =============================================================================

-- -------------------------------------------------------
-- Enums
-- -------------------------------------------------------

CREATE TYPE public.quest_category AS ENUM (
  'spark',        -- quick daily micro-tasks
  'momentum',     -- habit-building, streak-friendly
  'explorer',     -- try something new / go somewhere
  'social',       -- connect with another person
  'boss'          -- larger challenge, higher XP
);

CREATE TYPE public.quest_difficulty AS ENUM (
  'easy',
  'medium',
  'hard'
);

CREATE TYPE public.proof_type AS ENUM (
  'photo',
  'selfie',
  'screenshot',
  'text_note',
  'none'
);

-- -------------------------------------------------------
-- Table: archetypes
-- -------------------------------------------------------
-- Six player archetypes used for personalization.
-- Seeded once, read-only to clients.
-- -------------------------------------------------------

CREATE TABLE public.archetypes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  emoji       text NOT NULL,
  description text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.archetypes IS 'Player personality archetypes used for quest personalization.';

-- -------------------------------------------------------
-- Table: quests
-- -------------------------------------------------------
-- Immutable quest templates. Assigned to users via daily_assignments.
-- Never modified by clients.
-- -------------------------------------------------------

CREATE TABLE public.quests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  description       text NOT NULL,
  category          public.quest_category NOT NULL,
  difficulty        public.quest_difficulty NOT NULL,
  xp_reward         integer NOT NULL CHECK (xp_reward > 0 AND xp_reward <= 500),
  estimated_minutes integer NOT NULL CHECK (estimated_minutes > 0 AND estimated_minutes <= 120),
  proof_type        public.proof_type NOT NULL DEFAULT 'photo',
  proof_prompt      text,  -- hint shown to user when capturing proof
  archetype_id      uuid REFERENCES public.archetypes(id) ON DELETE SET NULL,
  tags              text[] NOT NULL DEFAULT '{}',
  first_week_ok     boolean NOT NULL DEFAULT false,  -- safe for brand-new users
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quests IS 'Immutable quest templates. Assigned to users via daily_assignments.';
COMMENT ON COLUMN public.quests.first_week_ok IS 'If true, this quest is safe to assign to brand-new users.';

CREATE TRIGGER quests_updated_at
  BEFORE UPDATE ON public.quests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------

CREATE INDEX idx_quests_category ON public.quests (category);
CREATE INDEX idx_quests_difficulty ON public.quests (difficulty);
CREATE INDEX idx_quests_active ON public.quests (active) WHERE active = true;
CREATE INDEX idx_quests_first_week ON public.quests (first_week_ok) WHERE first_week_ok = true;
CREATE INDEX idx_quests_archetype ON public.quests (archetype_id);

-- -------------------------------------------------------
-- RLS: archetypes (authenticated read-only)
-- -------------------------------------------------------

ALTER TABLE public.archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archetypes FORCE ROW LEVEL SECURITY;

CREATE POLICY archetypes_select_authenticated ON public.archetypes
  FOR SELECT TO authenticated
  USING (true);

-- -------------------------------------------------------
-- RLS: quests (authenticated read-only)
-- -------------------------------------------------------

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests FORCE ROW LEVEL SECURITY;

CREATE POLICY quests_select_authenticated ON public.quests
  FOR SELECT TO authenticated
  USING (true);
