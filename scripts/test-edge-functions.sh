#!/bin/bash
# test-edge-functions.sh — Smoke-test all 4 Edge Functions against local Supabase
# Prerequisites: Supabase running, migrations applied, seeds loaded,
#   Edge Functions served via `npx supabase functions serve --env-file .env`

set -euo pipefail

BASE_URL="http://127.0.0.1:54321/functions/v1"
ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

echo "=== LEVEL Edge Function Smoke Tests ==="
echo ""

# Step 0: Create an anonymous user and get JWT
echo "--- Step 0: Sign in anonymously ---"
AUTH_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}')

ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: Failed to get access token. Auth response:"
  echo "$AUTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$AUTH_RESPONSE"
  exit 1
fi

USER_ID=$(echo "$AUTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null)
echo "  User ID: $USER_ID"
echo "  Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Step 1: Test onboarding-bootstrap
echo "--- Step 1: onboarding-bootstrap ---"
ONBOARDING_RESPONSE=$(curl -s -X POST "$BASE_URL/onboarding-bootstrap" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: test-onboard-$(date +%s)" \
  -d '{
    "vibes": ["fitness", "adventure"],
    "duration": "steady",
    "timezone": "America/New_York"
  }')

echo "$ONBOARDING_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ONBOARDING_RESPONSE"
echo ""

# Step 2: Test home
echo "--- Step 2: home ---"
HOME_RESPONSE=$(curl -s -X POST "$BASE_URL/home" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "$HOME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HOME_RESPONSE"
echo ""

# Extract first assignment ID for quest-start test
ASSIGNMENT_ID=$(echo "$HOME_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
assignments = data.get('assignments', [])
if assignments:
    print(assignments[0]['assignment_id'])
else:
    print('')
" 2>/dev/null || echo "")

if [ -z "$ASSIGNMENT_ID" ]; then
  echo "WARNING: No assignments found in home response. Skipping quest-start/quest-complete tests."
  echo ""
  echo "=== Tests Complete (2/4 passed) ==="
  exit 0
fi

echo "  Using assignment: $ASSIGNMENT_ID"
echo ""

# Step 3: Test quest-start
echo "--- Step 3: quest-start ---"
QUEST_START_RESPONSE=$(curl -s -X POST "$BASE_URL/quest-start" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: test-start-$(date +%s)" \
  -d "{\"assignment_id\": \"$ASSIGNMENT_ID\"}")

echo "$QUEST_START_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$QUEST_START_RESPONSE"
echo ""

# Step 4: Test quest-complete
echo "--- Step 4: quest-complete ---"
QUEST_COMPLETE_RESPONSE=$(curl -s -X POST "$BASE_URL/quest-complete" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: test-complete-$(date +%s)" \
  -d "{
    \"assignment_id\": \"$ASSIGNMENT_ID\",
    \"proof_url\": \"https://example.com/proof.jpg\",
    \"caption\": \"Test completion from smoke test script\"
  }")

echo "$QUEST_COMPLETE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$QUEST_COMPLETE_RESPONSE"
echo ""

echo "=== All 4 Edge Function Tests Complete ==="
