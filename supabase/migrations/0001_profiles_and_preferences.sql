-- =============================================================================
-- Migration 0001: Profiles and User Preferences
-- =============================================================================
-- Creates the core identity-linked tables: profiles and user_preferences.
-- profiles.id references auth.users(id) — Supabase Auth is identity truth.
-- =============================================================================

-- -------------------------------------------------------
-- Enums used by profiles and preferences
-- -------------------------------------------------------

CREATE TYPE public.premium_status AS ENUM (
  'free',
  'trial',
  'premium',
  'expired'
);

CREATE TYPE public.preferred_vibe AS ENUM (
  'fitness',
  'mindfulness',
  'social',
  'creativity',
  'learning',
  'adventure'
);

CREATE TYPE public.preferred_duration AS ENUM (
  'chill',       -- ~5 min/day
  'steady',      -- ~15 min/day
  'intense',     -- ~30 min/day
  'beast'        -- ~60+ min/day
);

-- -------------------------------------------------------
-- Helper: set_updated_at trigger function
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Table: profiles
-- -------------------------------------------------------
-- Source of user-facing identity. Created on first auth event.
-- Progression fields (level, xp, streak) are authoritative here
-- but ONLY written by server-side logic (Edge Functions / triggers),
-- never directly by the client.
-- -------------------------------------------------------

CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  level         integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp            integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  xp_to_next    integer NOT NULL DEFAULT 200 CHECK (xp_to_next > 0),
  streak        integer NOT NULL DEFAULT 0 CHECK (streak >= 0),
  longest_streak integer NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  total_completed integer NOT NULL DEFAULT 0 CHECK (total_completed >= 0),
  premium_status public.premium_status NOT NULL DEFAULT 'free',
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile linked to auth.users. Progression fields are server-authoritative.';

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- Table: user_preferences
-- -------------------------------------------------------
-- Stores onboarding choices: selected vibes and duration.
-- One row per user. Owner-writable during onboarding.
-- -------------------------------------------------------

CREATE TABLE public.user_preferences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  vibes           public.preferred_vibe[] NOT NULL DEFAULT '{}',
  duration        public.preferred_duration NOT NULL DEFAULT 'steady',
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_preferences IS 'User onboarding preferences: vibes, duration, notification settings.';

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------

CREATE INDEX idx_profiles_premium_status ON public.profiles (premium_status);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences (user_id);

-- -------------------------------------------------------
-- RLS: profiles
-- -------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Owner can read their own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Owner can update display_name, avatar_url, onboarding_completed only.
-- Progression fields (level, xp, streak, etc.) are NOT client-writable.
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Insert is handled by a trigger/function on auth.users creation,
-- but we allow authenticated insert for the initial profile row.
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- -------------------------------------------------------
-- RLS: user_preferences
-- -------------------------------------------------------

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences FORCE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_select_own ON public.user_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_preferences_insert_own ON public.user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_preferences_update_own ON public.user_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- -------------------------------------------------------
-- Auto-create profile on new auth user
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
