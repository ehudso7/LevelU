#!/bin/bash
# setup-local.sh — Initialize local Supabase with migrations + seeds
# Run this from the project root after `npx supabase start`

set -euo pipefail

echo "=== LEVEL Local Setup ==="

# 1. Reset DB (runs migrations + seed.sql automatically)
echo ""
echo "Resetting database (migrations + seeds)..."
npx supabase db reset

# 2. Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo ""
  echo "Creating .env from local Supabase credentials..."

  # Extract keys from supabase status
  ANON_KEY=$(npx supabase status -o env 2>/dev/null | grep ANON_KEY | cut -d= -f2 || echo "")
  SERVICE_KEY=$(npx supabase status -o env 2>/dev/null | grep SERVICE_ROLE_KEY | cut -d= -f2 || echo "")

  cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY:-sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_KEY:-sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz}
EOF
  echo "  .env created"
else
  echo ""
  echo ".env already exists — skipping"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Serve Edge Functions:  npx supabase functions serve --env-file .env"
echo "  2. Test Edge Functions:   bash scripts/test-edge-functions.sh"
echo "  3. Start the app:        npx expo start"
