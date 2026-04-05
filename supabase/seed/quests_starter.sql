-- =============================================================================
-- Seed: Starter Quests (50 quests)
-- =============================================================================
-- Hand-written quests for Milestone A launch.
-- Categories: spark (12), momentum (10), explorer (10), social (8), boss (5),
-- plus 5 bonus quests for variety.
-- Run after archetypes seed. Idempotent via ON CONFLICT on title.
-- =============================================================================

-- Add a unique constraint on title for idempotent seeding
-- (this is safe because quest titles should be unique anyway)
ALTER TABLE public.quests ADD CONSTRAINT quests_title_unique UNIQUE (title);

-- -------------------------------------------------------
-- SPARK quests (12) — quick daily micro-tasks
-- -------------------------------------------------------

INSERT INTO public.quests (title, description, category, difficulty, xp_reward, estimated_minutes, proof_type, proof_prompt, tags, first_week_ok) VALUES
(
  'Take a 10-minute walk',
  'Step outside and walk for at least 10 minutes. No phone scrolling — just move and notice things around you.',
  'spark', 'easy', 30, 10, 'photo', 'Snap something interesting you saw on your walk.',
  ARRAY['fitness', 'mindfulness'], true
),
(
  'Drink a full glass of water right now',
  'Fill up a glass, drink it all the way down. Hydration is the simplest level-up.',
  'spark', 'easy', 15, 2, 'photo', 'Show your empty glass.',
  ARRAY['health', 'habit'], true
),
(
  'Do 20 jumping jacks',
  'Drop what you''re doing and knock out 20 jumping jacks. Get that heart rate up for 60 seconds.',
  'spark', 'easy', 25, 3, 'selfie', 'Post-workout selfie. You earned it.',
  ARRAY['fitness', 'energy'], true
),
(
  'Write down 3 things you''re grateful for',
  'Grab a piece of paper or open your notes app. Write three specific things you appreciate today.',
  'spark', 'easy', 25, 5, 'photo', 'Photo of your gratitude list.',
  ARRAY['mindfulness', 'reflection'], true
),
(
  'Stretch for 5 minutes',
  'Set a timer and stretch your whole body. Focus on any area that feels tight.',
  'spark', 'easy', 20, 5, 'selfie', 'Mid-stretch selfie.',
  ARRAY['fitness', 'wellness'], true
),
(
  'Tidy one surface in your space',
  'Pick one desk, counter, or table. Clear it off completely, then only put back what belongs.',
  'spark', 'easy', 30, 10, 'photo', 'Before and after of your clean surface.',
  ARRAY['organization', 'environment'], true
),
(
  'Take 10 slow, deep breaths',
  'Find a quiet spot. Breathe in for 4 counts, hold for 4, out for 6. Repeat 10 times.',
  'spark', 'easy', 15, 3, 'none', NULL,
  ARRAY['mindfulness', 'calm'], true
),
(
  'Put your phone on Do Not Disturb for 30 minutes',
  'Silence notifications and resist checking for half an hour. Be present wherever you are.',
  'spark', 'easy', 35, 30, 'screenshot', 'Screenshot your DND timer or screen time.',
  ARRAY['digital-wellness', 'focus'], true
),
(
  'Make your bed',
  'If you haven''t already, make your bed right now. Start the day with one win.',
  'spark', 'easy', 15, 3, 'photo', 'Photo of your freshly made bed.',
  ARRAY['organization', 'habit'], true
),
(
  'Listen to one full song with your eyes closed',
  'Pick a song you love. Close your eyes and listen — really listen — from start to finish.',
  'spark', 'easy', 20, 5, 'text_note', NULL,
  ARRAY['mindfulness', 'music'], true
),
(
  'Do a 1-minute plank',
  'Get into plank position and hold for 60 seconds. Modify if you need to — just keep going.',
  'spark', 'medium', 40, 3, 'selfie', 'Plank selfie or post-plank victory face.',
  ARRAY['fitness', 'strength'], true
),
(
  'Write a to-do list for tomorrow',
  'Before the day ends, write down 3–5 things you want to accomplish tomorrow. Be specific.',
  'spark', 'easy', 25, 5, 'photo', 'Photo of your to-do list.',
  ARRAY['productivity', 'planning'], true
)
ON CONFLICT (title) DO NOTHING;

-- -------------------------------------------------------
-- MOMENTUM quests (10) — habit-building, streak-friendly
-- -------------------------------------------------------

INSERT INTO public.quests (title, description, category, difficulty, xp_reward, estimated_minutes, proof_type, proof_prompt, tags, first_week_ok) VALUES
(
  'Read for 15 minutes',
  'Pick up a book — physical or digital — and read for at least 15 uninterrupted minutes.',
  'momentum', 'easy', 40, 15, 'photo', 'Show what you''re reading.',
  ARRAY['learning', 'reading'], true
),
(
  'Journal for 10 minutes',
  'Open a notebook or notes app and write freely for 10 minutes. No rules, just thoughts.',
  'momentum', 'easy', 35, 10, 'photo', 'Photo of your journal entry (blur if private).',
  ARRAY['reflection', 'writing'], true
),
(
  'Cook a meal from scratch',
  'No takeout, no microwave meals. Cook something real, even if it''s simple.',
  'momentum', 'medium', 60, 30, 'photo', 'Photo of your finished dish.',
  ARRAY['cooking', 'self-care'], true
),
(
  'Go phone-free for one hour',
  'Put your phone in another room for a full hour. Read, cook, clean, create — anything but scroll.',
  'momentum', 'medium', 50, 60, 'text_note', NULL,
  ARRAY['digital-wellness', 'focus'], false
),
(
  'Do a 15-minute bodyweight workout',
  'Push-ups, squats, lunges, sit-ups — mix and match. No equipment needed. Just 15 minutes of effort.',
  'momentum', 'medium', 55, 15, 'selfie', 'Post-workout selfie.',
  ARRAY['fitness', 'strength'], true
),
(
  'Practice a skill for 20 minutes',
  'Guitar, drawing, coding, cooking technique, language app — pick a skill and deliberately practice.',
  'momentum', 'medium', 50, 20, 'photo', 'Show your practice session.',
  ARRAY['learning', 'growth'], false
),
(
  'Meditate for 10 minutes',
  'Use an app or just sit quietly. Focus on your breath. When your mind wanders, gently return.',
  'momentum', 'easy', 35, 10, 'none', NULL,
  ARRAY['mindfulness', 'meditation'], true
),
(
  'Take a cold shower (or end with 30 seconds cold)',
  'Turn the water cold for at least 30 seconds at the end of your shower. Embrace the discomfort.',
  'momentum', 'medium', 45, 5, 'selfie', 'Post-cold-shower face.',
  ARRAY['discipline', 'wellness'], false
),
(
  'Walk 5,000 steps today',
  'Check your step counter. If you''re under 5K, keep moving until you hit it.',
  'momentum', 'easy', 40, 45, 'screenshot', 'Screenshot of your step count.',
  ARRAY['fitness', 'daily'], true
),
(
  'Prep tomorrow''s outfit tonight',
  'Before bed, lay out exactly what you''ll wear tomorrow. Remove one decision from your morning.',
  'momentum', 'easy', 20, 5, 'photo', 'Photo of your laid-out outfit.',
  ARRAY['organization', 'habit'], true
)
ON CONFLICT (title) DO NOTHING;

-- -------------------------------------------------------
-- EXPLORER quests (10) — try something new
-- -------------------------------------------------------

INSERT INTO public.quests (title, description, category, difficulty, xp_reward, estimated_minutes, proof_type, proof_prompt, tags, first_week_ok) VALUES
(
  'Visit a place you''ve never been in your neighborhood',
  'Walk to a street, park, shop, or cafe you''ve never visited. Discover what''s been hiding nearby.',
  'explorer', 'easy', 45, 20, 'photo', 'Photo of the new place you discovered.',
  ARRAY['adventure', 'local'], true
),
(
  'Try a food you''ve never eaten before',
  'Go to a store or restaurant and try something completely new. Be adventurous with your taste buds.',
  'explorer', 'easy', 40, 15, 'photo', 'Photo of your new food experience.',
  ARRAY['adventure', 'food'], true
),
(
  'Take a different route to a familiar place',
  'Going to work, school, the gym, or the store? Take a completely different path than usual.',
  'explorer', 'easy', 30, 15, 'photo', 'Photo of something you noticed on the new route.',
  ARRAY['adventure', 'mindfulness'], true
),
(
  'Watch a documentary on a topic you know nothing about',
  'Pick a subject that''s totally outside your world. Deep-sea creatures, medieval history, fermentation — go wild.',
  'explorer', 'easy', 40, 30, 'text_note', NULL,
  ARRAY['learning', 'curiosity'], true
),
(
  'Learn 5 words in a language you don''t speak',
  'Pick a language and learn 5 useful words or phrases. Practice saying them out loud.',
  'explorer', 'easy', 35, 10, 'text_note', NULL,
  ARRAY['learning', 'language'], true
),
(
  'Find and photograph street art or graffiti',
  'Walk around your area and find street art, murals, or interesting graffiti. Document it.',
  'explorer', 'easy', 40, 20, 'photo', 'Photo of street art you found.',
  ARRAY['adventure', 'art', 'urban'], false
),
(
  'Sit in a public space and people-watch for 10 minutes',
  'Find a bench, a cafe, or a park. Sit down and just observe. Notice the stories around you.',
  'explorer', 'easy', 30, 10, 'photo', 'Photo from your people-watching spot.',
  ARRAY['mindfulness', 'social'], false
),
(
  'Try a new workout style',
  'If you usually run, try yoga. If you lift, try a dance workout. Step outside your fitness comfort zone.',
  'explorer', 'medium', 50, 20, 'selfie', 'Selfie during or after your new workout.',
  ARRAY['fitness', 'variety'], false
),
(
  'Listen to an album from a genre you never play',
  'Jazz, classical, K-pop, country, electronic — pick something foreign to your ears and listen to a full album.',
  'explorer', 'easy', 35, 40, 'text_note', NULL,
  ARRAY['music', 'curiosity'], true
),
(
  'Draw or sketch something in front of you',
  'Grab any paper and pen. Spend 10 minutes sketching whatever is in front of you. Skill doesn''t matter.',
  'explorer', 'easy', 35, 10, 'photo', 'Photo of your sketch.',
  ARRAY['creativity', 'art'], true
)
ON CONFLICT (title) DO NOTHING;

-- -------------------------------------------------------
-- SOCIAL quests (8) — connect with people
-- -------------------------------------------------------

INSERT INTO public.quests (title, description, category, difficulty, xp_reward, estimated_minutes, proof_type, proof_prompt, tags, first_week_ok) VALUES
(
  'Send a genuine compliment to someone',
  'Text, call, or tell someone in person something specific you appreciate about them. Be real.',
  'social', 'easy', 35, 5, 'text_note', NULL,
  ARRAY['kindness', 'connection'], true
),
(
  'Call a friend or family member you haven''t talked to recently',
  'Not a text — an actual call. Catch up for at least 5 minutes.',
  'social', 'easy', 45, 10, 'text_note', NULL,
  ARRAY['connection', 'relationships'], true
),
(
  'Have a conversation with a stranger',
  'At a coffee shop, in line, at the gym — start a genuine conversation with someone you don''t know.',
  'social', 'medium', 55, 5, 'text_note', NULL,
  ARRAY['social', 'courage'], false
),
(
  'Share a meal with someone',
  'Eat lunch or dinner with another person. No phones at the table.',
  'social', 'easy', 45, 30, 'photo', 'Photo of your shared meal.',
  ARRAY['connection', 'food'], true
),
(
  'Write a thank-you message to someone who helped you',
  'Think of someone who made a difference — a teacher, mentor, friend, coworker. Write them a real thank-you.',
  'social', 'easy', 40, 10, 'text_note', NULL,
  ARRAY['gratitude', 'connection'], true
),
(
  'Introduce yourself to a neighbor',
  'If you don''t know your neighbors, go say hi. If you do, ask them something you''ve never asked before.',
  'social', 'medium', 50, 5, 'text_note', NULL,
  ARRAY['community', 'courage'], false
),
(
  'Plan an outing with a friend',
  'Don''t just say "we should hang out." Pick a date, time, and activity. Send the invite.',
  'social', 'easy', 35, 10, 'screenshot', 'Screenshot of the invite or plan you sent.',
  ARRAY['connection', 'planning'], true
),
(
  'Give a genuine "thank you" to a service worker',
  'Tell a barista, cashier, bus driver, or delivery person that you appreciate them. Make eye contact.',
  'social', 'easy', 25, 2, 'none', NULL,
  ARRAY['kindness', 'gratitude'], true
)
ON CONFLICT (title) DO NOTHING;

-- -------------------------------------------------------
-- BOSS quests (5) — larger challenges, higher XP
-- -------------------------------------------------------

INSERT INTO public.quests (title, description, category, difficulty, xp_reward, estimated_minutes, proof_type, proof_prompt, tags, first_week_ok) VALUES
(
  'Complete a full home workout',
  '30+ minutes of structured exercise. Push-ups, squats, burpees, planks — give it everything you have.',
  'boss', 'hard', 100, 35, 'selfie', 'Post-workout selfie. Show that effort.',
  ARRAY['fitness', 'discipline'], false
),
(
  'Cook a meal you''ve never made before from a recipe',
  'Find a recipe online. Buy the ingredients. Follow the steps. Eat something brand new that you made.',
  'boss', 'hard', 90, 60, 'photo', 'Photo of your finished creation.',
  ARRAY['cooking', 'adventure'], false
),
(
  'Write 500 words about anything',
  'A journal entry, a short story, a letter, a rant, a plan — just write 500 real words.',
  'boss', 'medium', 75, 25, 'photo', 'Photo or screenshot of your writing.',
  ARRAY['creativity', 'writing'], false
),
(
  'Spend one hour learning something completely new',
  'Pick a topic you know zero about. Watch tutorials, read articles, take notes. Go deep for 60 minutes.',
  'boss', 'hard', 100, 60, 'text_note', NULL,
  ARRAY['learning', 'growth'], false
),
(
  'Do something that scares you (safely)',
  'Start a conversation you''ve been avoiding. Try a food that grosses you out. Go to a class alone. Face a small fear.',
  'boss', 'hard', 120, 30, 'text_note', NULL,
  ARRAY['courage', 'growth', 'challenge'], false
)
ON CONFLICT (title) DO NOTHING;

-- -------------------------------------------------------
-- BONUS quests (5) — variety / cross-category
-- -------------------------------------------------------

INSERT INTO public.quests (title, description, category, difficulty, xp_reward, estimated_minutes, proof_type, proof_prompt, tags, first_week_ok) VALUES
(
  'Photograph something beautiful today',
  'Look around with fresh eyes. Find something beautiful — light, texture, nature, architecture — and capture it.',
  'spark', 'easy', 25, 5, 'photo', 'Your beautiful photo.',
  ARRAY['creativity', 'mindfulness'], true
),
(
  'Learn one new keyboard shortcut and use it 5 times',
  'Look up a shortcut you didn''t know for an app you use daily. Practice it until it feels natural.',
  'momentum', 'easy', 20, 5, 'text_note', NULL,
  ARRAY['productivity', 'learning'], true
),
(
  'Hold a wall sit for as long as you can',
  'Back against the wall, thighs parallel to the floor. Hold until failure. Write down your time.',
  'explorer', 'medium', 40, 3, 'selfie', 'Mid-wall-sit or post-collapse selfie.',
  ARRAY['fitness', 'challenge'], true
),
(
  'Leave a positive review for a small business',
  'Think of a local place you love. Leave them a thoughtful, specific review on Google or Yelp.',
  'social', 'easy', 30, 5, 'screenshot', 'Screenshot of your review.',
  ARRAY['kindness', 'community'], false
),
(
  'Create a playlist of 10 songs that match your current mood',
  'Open your music app and curate a playlist that captures exactly how you feel right now.',
  'spark', 'easy', 25, 10, 'screenshot', 'Screenshot of your mood playlist.',
  ARRAY['creativity', 'music'], true
)
ON CONFLICT (title) DO NOTHING;
