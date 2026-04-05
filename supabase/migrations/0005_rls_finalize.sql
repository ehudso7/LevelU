-- =============================================================================
-- Migration 0005: RLS Finalization and Service Role Policies
-- =============================================================================
-- Adds service_role write policies for server-side operations.
-- Verifies all tables have RLS enabled.
-- Adds storage bucket for quest proof photos.
-- =============================================================================

-- -------------------------------------------------------
-- Service role write policies
-- -------------------------------------------------------
-- Edge Functions run as service_role and bypass RLS by default,
-- but we add explicit policies for defense-in-depth and so that
-- Supabase client calls with service_role key also work correctly.
-- -------------------------------------------------------

-- profiles: service_role can update progression fields
CREATE POLICY profiles_service_update ON public.profiles
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- daily_assignments: service_role can insert/update
CREATE POLICY daily_assignments_service_insert ON public.daily_assignments
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY daily_assignments_service_update ON public.daily_assignments
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- quest_completions: service_role can insert
CREATE POLICY quest_completions_service_insert ON public.quest_completions
  FOR INSERT TO service_role
  WITH CHECK (true);

-- xp_events: service_role can insert
CREATE POLICY xp_events_service_insert ON public.xp_events
  FOR INSERT TO service_role
  WITH CHECK (true);

-- streak_events: service_role can insert
CREATE POLICY streak_events_service_insert ON public.streak_events
  FOR INSERT TO service_role
  WITH CHECK (true);

-- user_archetype_scores: service_role can insert/update
CREATE POLICY user_archetype_scores_service_insert ON public.user_archetype_scores
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY user_archetype_scores_service_update ON public.user_archetype_scores
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- archetypes: service_role can insert (for seeding)
CREATE POLICY archetypes_service_insert ON public.archetypes
  FOR INSERT TO service_role
  WITH CHECK (true);

-- quests: service_role can insert/update (for seeding and content management)
CREATE POLICY quests_service_insert ON public.quests
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY quests_service_update ON public.quests
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- Storage bucket for quest proof photos
-- (only runs if storage schema exists — skipped when storage is disabled)
-- -------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'quest-proofs',
      'quest-proofs',
      false,
      5242880,  -- 5MB max
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Storage RLS policies (safe to create even if bucket doesn't exist yet)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage'
  ) THEN
    EXECUTE 'CREATE POLICY quest_proofs_insert ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = ''quest-proofs''
        AND (storage.foldername(name))[1] = auth.uid()::text
      )';

    EXECUTE 'CREATE POLICY quest_proofs_select ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = ''quest-proofs''
        AND (storage.foldername(name))[1] = auth.uid()::text
      )';
  END IF;
END $$;

-- -------------------------------------------------------
-- Verification: ensure all tables have RLS enabled
-- This is a sanity check — if any table is missing RLS,
-- the migration will fail loudly.
-- -------------------------------------------------------

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles',
        'user_preferences',
        'archetypes',
        'quests',
        'daily_assignments',
        'quest_completions',
        'xp_events',
        'streak_events',
        'user_archetype_scores'
      )
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = tbl.tablename
        AND c.relrowsecurity = true
    ) THEN
      RAISE EXCEPTION 'RLS is NOT enabled on public.%', tbl.tablename;
    END IF;
  END LOOP;
END $$;
