#!/usr/bin/env bash
# ============================================================================
# Sage Reflect — live smoke test (Stage B Critical Change Protocol, step 5/verify)
#
# USAGE (one line, in Terminal, from anywhere):
#   bash smoke-test-reflect.sh <SR_ATL_TOKEN> [agent_id] [domain]
#
# EXAMPLE (reuse the Sage Calling test credential):
#   bash smoke-test-reflect.sh sr_atl_PASTE_TOKEN agent_smoketest_v1 https://www.sagereasoning.com
#
# agent_id defaults to agent_smoketest_v1; domain defaults to https://www.sagereasoning.com.
# It creates sessions prefixed "smoke-reflect-" so you can clean them up afterwards.
# This is a throwaway local helper — delete it (and revoke the test credential) when done.
# ============================================================================
set -u

TOKEN="${1:-}"
AGENT_ID="${2:-agent_smoketest_v1}"
DOMAIN="${3:-https://www.sagereasoning.com}"

if [ -z "$TOKEN" ]; then
  echo "ERROR: pass your sr_atl_ token as the first argument."
  echo "  bash smoke-test-reflect.sh sr_atl_xxxxxxxx [agent_id] [domain]"
  exit 1
fi

URL="$DOMAIN/api/practice/reflect"
SID="smoke-reflect-$(date +%s)"
SUMMARY='{"purpose_at_open":"ship triage tooling","circle_at_open":"community","role_at_open":"maintainer","capacity_at_open":["triage"],"sage_reasoning_passes":1}'
ANSWER="I examined my impressions and assented carefully; my action was fitting for my role and the community circle it served, and the work remains the fitting work and continues."

hr(){ echo; echo "==== $1 ===="; }
# Build a request body cleanly with printf (avoids shell double-quote nesting bugs).
mkbody(){ printf '{"session_id":"%s","agent_id":"%s","session_summary":%s}' "$1" "$2" "$SUMMARY"; }
statusof(){ curl -s -o /dev/null -w '%{http_code}' "$@"; }

hr "1. AUTH: no token (expect 401 — proves the flag is ON; was 503 when off)"
code=$(statusof -X POST "$URL" -H 'Content-Type: application/json' --data "$(mkbody "$SID-a" "$AGENT_ID")")
echo "HTTP $code"

hr "2. AUTH: bad token (expect 401)"
code=$(statusof -X POST "$URL" -H 'Content-Type: application/json' -H 'Authorization: Bearer sr_atl_garbage000' --data "$(mkbody "$SID-b" "$AGENT_ID")")
echo "HTTP $code"

hr "3. AUTH: valid token + WRONG agent_id (expect 401)"
code=$(statusof -X POST "$URL" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" --data "$(mkbody "$SID-c" wrong_agent_xyz)")
echo "HTTP $code"

hr "4. OPEN with valid token (expect 200; status=in_progress; step=Q1)"
curl -s -X POST "$URL" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d "{\"session_id\":\"$SID\",\"agent_id\":\"$AGENT_ID\",\"session_summary\":$SUMMARY}" | head -c 700; echo

hr "5. WALK the sequence (answers each step until status=complete)"
for i in 1 2 3 4 5 6 7 8 9; do
  body=$(curl -s -X POST "$URL" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
    -d "{\"session_id\":\"$SID\",\"agent_id\":\"$AGENT_ID\",\"response\":\"$ANSWER\"}")
  status=$(echo "$body" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')
  step=$(echo "$body" | sed -n 's/.*"step":"\([^"]*\)".*/\1/p')
  echo "turn $i  ->  status=$status  step=$step"
  if echo "$body" | grep -q '"status":"complete"'; then
    echo "--- completion body (look for exit_path, profile, mandatory_note) ---"
    echo "$body" | head -c 900; echo
    break
  fi
done

hr "6. HARM PATH: harm-flagged open (expect 200; status=flagged; NOT reflected)"
curl -s -X POST "$URL" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d "{\"session_id\":\"$SID-harm\",\"agent_id\":\"$AGENT_ID\",\"session_summary\":$SUMMARY,\"safety_signal\":{\"harm_flagged\":true,\"detail\":\"smoke test harm flag\"}}" | head -c 700; echo

echo
echo "============================================================"
echo "PASS criteria:  steps 1-3 = HTTP 401 ; step 4 = status in_progress/Q1 ;"
echo "                step 5 ends status=complete ; step 6 = status=flagged."
echo "Session ids:    $SID  (happy path)   |   $SID-harm  (harm)"
echo "Next: run the Supabase SQL checks (see chat), then clean up the smoke rows."
echo "============================================================"
