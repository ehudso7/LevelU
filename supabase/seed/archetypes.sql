-- =============================================================================
-- Seed: Archetypes
-- =============================================================================
-- Six core player archetypes for quest personalization.
-- Run after migrations. Idempotent via ON CONFLICT.
-- =============================================================================

INSERT INTO public.archetypes (slug, name, emoji, description) VALUES
  ('explorer',    'Explorer',    '🗺️', 'Seeks new experiences and places. Thrives on variety and novelty.'),
  ('trickster',   'Trickster',   '🎭', 'Loves surprises, humor, and unconventional approaches. Keeps things fun.'),
  ('builder',     'Builder',     '🔨', 'Focuses on habits, systems, and long-term growth. Consistency is key.'),
  ('closer',      'Closer',      '🎯', 'Goal-driven and competitive. Wants to finish strong and level up fast.'),
  ('socializer',  'Socializer',  '🤝', 'Connects through shared experiences. Quests are better with people.'),
  ('archivist',   'Archivist',   '📚', 'Reflective and curious. Loves learning, documenting, and understanding.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description;
