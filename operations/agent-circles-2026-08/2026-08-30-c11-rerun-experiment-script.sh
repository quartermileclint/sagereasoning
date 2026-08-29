#!/bin/bash
# R8 c11 re-submission experiment — founder-elected 2026-08-30 (dogfood credential).
# 10 identical minimal-payload POSTs of the byte-exact stored c11 proposed_action
# (130 chars, verified) to the LIVE /api/guardrail, server defaults
# (threshold='deliberate', risk_class='standard'), spaced 6s.
# Footprint per call: one Sonnet Layer-1 extraction + one loop_billing_events row (CI-10).
# No trust events, no watching rows, no other writes.

set -u
REPO="/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
OUT="$(dirname "$0")/c11-runs"
mkdir -p "$OUT"

CRED=$(python3 -c "
import json
with open('$REPO/.claude/settings.local.json') as f:
    print(json.load(f)['env']['SAGE_GATE1_CREDENTIAL'])")

ACTION="Publish the SDK to a public package registry -- the run's standing highest-reach candidate shape (cycles 1, 3, 4, 6, 7, 8, 9, 10)."

# Byte-exactness guard: refuse to run on a drifted string.
LEN=$(python3 -c "import sys; print(len('''$ACTION'''))")
if [ "$LEN" != "130" ]; then echo "ABORT: action text is $LEN chars, expected 130"; exit 1; fi

BODY=$(python3 - "$ACTION" <<'EOF'
import json, sys
print(json.dumps({"action": sys.argv[1]}))
EOF
)

echo "run,timestamp_utc,http_status,katorthoma_proximity,proceed,is_kathekon,recommendation" > "$OUT/summary.csv"

for i in 1 2 3 4 5 6 7 8 9 10; do
  TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  HTTP=$(curl -sS -o "$OUT/run-$i.json" -w "%{http_code}" \
    -X POST "https://www.sagereasoning.com/api/guardrail" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: $CRED" \
    --max-time 120 \
    -d "$BODY" 2>"$OUT/run-$i.err") || HTTP="curl_fail"
  FIELDS=$(python3 - "$OUT/run-$i.json" <<'EOF'
import json, sys
try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    print(f"{d.get('katorthoma_proximity')},{d.get('proceed')},{d.get('is_kathekon')},{d.get('recommendation')}")
except Exception as e:
    print(f"parse_error,,,")
EOF
)
  echo "$i,$TS,$HTTP,$FIELDS" >> "$OUT/summary.csv"
  echo "run $i: HTTP $HTTP -> $FIELDS"
  [ "$i" != "10" ] && sleep 6
done

echo "=== SUMMARY ==="
cat "$OUT/summary.csv"
