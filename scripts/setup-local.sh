#!/bin/bash
# setup-local.sh — Initialize local Supabase and run migrations + seeds
# Run this from the project root after `npx supabase start`

set -euo pipefail

echo "=== LEVEL Local Setup ==="

# 1. Check Supabase is running
echo "Checking Supabase status..."
npx supabase status || {
  echo "ERROR: Supabase is not running. Start it with: npx supabase start"
  exit 1
}

# 2. Get connection string
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo ""
echo "=== Running Migrations ==="
for f in supabase/migrations/*.sql; do
  echo "  -> $(basename "$f")"
  psql "$DB_URL" -f "$f" 2>&1 | grep -v "^$" | head -5
done

echo ""
echo "=== Running Seeds ==="
for f in supabase/seed/archetypes.sql supabase/seed/quests_starter.sql; do
  echo "  -> $(basename "$f")"
  psql "$DB_URL" -f "$f" 2>&1 | grep -v "^$" | head -5
done

echo ""
echo "=== Verifying Tables ==="
psql "$DB_URL" -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
"

echo ""
echo "=== Verifying Seed Data ==="
psql "$DB_URL" -c "SELECT count(*) as archetype_count FROM archetypes;"
psql "$DB_URL" -c "SELECT count(*) as quest_count FROM quests;"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and fill in local values (or use the generated .env)"
echo "  2. Start Edge Functions: npx supabase functions serve --env-file .env"
echo "  3. Start the app: npx expo start"
