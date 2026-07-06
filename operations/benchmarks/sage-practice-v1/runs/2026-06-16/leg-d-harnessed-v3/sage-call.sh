#!/usr/bin/env bash
# sage-call.sh <METHOD> <PATH> <BODYFILE|-> <OUTNAME> [noauth]
# Writes body -> raw/<OUTNAME>.json, headers -> raw/<OUTNAME>.headers
# Prints: epoch_start, time_total, http_code, and the meter headers.
set -euo pipefail
LEG="operations/benchmarks/sage-practice-v1/runs/2026-06-16/leg-d-harnessed-v3"
KEY="sr_prac_7d0a66ff-REDACTED"  # full token redacted before archival (2026-07-07); credential revocation is a founder step
BASE="https://www.sagereasoning.com"
M="$1"; P="$2"; BF="$3"; OUT="$4"; AUTH="${5:-auth}"
H=(); H+=(-H "Content-Type: application/json")
[ "$AUTH" = "auth" ] && H+=(-H "Authorization: Bearer $KEY")
ARGS=(-sS -X "$M" "${H[@]}" -D "$LEG/raw/$OUT.headers" -o "$LEG/raw/$OUT.json" \
      -w '%{http_code} %{time_total}')
if [ "$BF" != "-" ]; then ARGS+=(--data @"$BF"); fi
START=$(date -u +%s.%N)
read -r CODE TIME < <(curl "${ARGS[@]}" "$BASE$P"; echo)
echo "epoch_start=$START http_code=$CODE time_total=${TIME}s"
grep -iE '^(x-loop-|x-anthropic-|x-overage-|x-loop-internal)' "$LEG/raw/$OUT.headers" || echo "(no meter headers)"
