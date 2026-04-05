-- Combined seed file for Supabase CLI (npx supabase db reset)
-- This file imports both seed scripts in the correct order.

-- 1. Seed archetypes first (quests reference them indirectly via tags)
\i supabase/seed/archetypes.sql

-- 2. Seed starter quests
\i supabase/seed/quests_starter.sql
