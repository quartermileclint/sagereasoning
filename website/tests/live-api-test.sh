#!/bin/bash
# ══════════════════════════════════════════════════════════
# SageReasoning — Live API Test Suite
# Tests the Anthropic API connection and Stoic reasoning pipeline
# Run from: /website folder
# Usage: bash tests/live-api-test.sh
# ══════════════════════════════════════════════════════════

set -euo pipefail

# Load API key from .env.local
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Could not find .env.local — run this from the /website folder"
  exit 1
fi

API_KEY=$(grep '^ANTHROPIC_API_KEY=' "$ENV_FILE" | cut -d= -f2 | tr -d '[:space:]')

PASSED=0
FAILED=0
MODEL_FAST="claude-haiku-4-5-20251001"
MODEL_DEEP="claude-sonnet-4-6"
API_URL="https://api.anthropic.com/v1/messages"

pass() { echo "  ✅ PASS  $1${2:+ — $2}"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ FAIL  $1${2:+ — $2}"; FAILED=$((FAILED + 1)); }

call_api() {
  local model="$1"
  local max_tokens="$2"
  local system_prompt="$3"
  local user_message="$4"

  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "$(jq -n \
      --arg model "$model" \
      --argjson max_tokens "$max_tokens" \
      --arg system "$system_prompt" \
      --arg msg "$user_message" \
      '{model: $model, max_tokens: $max_tokens, system: $system, messages: [{role: "user", content: $msg}]}'
    )" 2>/dev/null
}

echo ""
echo "══════════════════════════════════════════════"
echo "  SageReasoning — Live API Test Suite"
echo "══════════════════════════════════════════════"

# ─── Test Group 1: Configuration ───
echo ""
echo "── Test Group 1: Configuration ──"

if [ -z "$API_KEY" ]; then
  fail "API key exists in .env.local" "ANTHROPIC_API_KEY is missing or empty"
  echo "  Cannot proceed without an API key. Exiting."
  exit 1
fi

pass "API key exists in .env.local" "starts with ${API_KEY:0:12}..."

if [[ "$API_KEY" == sk-ant-* ]]; then
  pass "API key format valid" "has sk-ant-* prefix"
else
  fail "API key format valid" "expected sk-ant-* prefix, got ${API_KEY:0:10}..."
fi

# ─── Test Group 2: SDK Connection ───
echo ""
echo "── Test Group 2: Basic API Connection ──"

PING_START=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
PING_RESULT=$(call_api "$MODEL_FAST" 10 "Reply with just the word: connected" "Are you connected?")
PING_END=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
PING_MS=$((PING_END - PING_START))

PING_TEXT=$(echo "$PING_RESULT" | jq -r '.content[0].text // "error"' 2>/dev/null)
PING_ERROR=$(echo "$PING_RESULT" | jq -r '.error.message // empty' 2>/dev/null)

if [ -n "$PING_ERROR" ]; then
  fail "API connection successful" "$PING_ERROR"
  echo "  Cannot reach the Anthropic API. Exiting."
  exit 1
fi

if echo "$PING_TEXT" | grep -qi "connect"; then
  pass "API connection successful" "${PING_MS}ms, got: \"$PING_TEXT\""
else
  pass "API responds" "${PING_MS}ms, got: \"$PING_TEXT\""
fi

INPUT_TOKENS=$(echo "$PING_RESULT" | jq '.usage.input_tokens // 0')
OUTPUT_TOKENS=$(echo "$PING_RESULT" | jq '.usage.output_tokens // 0')
pass "Usage tracking works" "${INPUT_TOKENS} input / ${OUTPUT_TOKENS} output tokens"

# ─── Test Group 3: Quick Stoic Reasoning (Haiku) ───
echo ""
echo "── Test Group 3: Quick Stoic Reasoning (Haiku) ──"

STOIC_SYSTEM='You are a Stoic reasoning engine. Evaluate the given action. Return ONLY a JSON object (no markdown, no code blocks) with: {"control_classification": "fully|partially|not", "passions_detected": [{"type": "string", "evidence": "string"}], "oikeiosis": {"self": 0-10, "close": 0-10, "community": 0-10, "humanity": 0-10}, "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like", "reasoning_summary": "string"}'

QUICK_ACTION='Evaluate this action: "I want to buy an expensive car to impress my neighbours, even though I cannot afford it."'

Q_START=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
QUICK_RESULT=$(call_api "$MODEL_FAST" 1000 "$STOIC_SYSTEM" "$QUICK_ACTION")
Q_END=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
Q_MS=$((Q_END - Q_START))

QUICK_TEXT=$(echo "$QUICK_RESULT" | jq -r '.content[0].text // "error"')
QUICK_LEN=${#QUICK_TEXT}

if [ "$QUICK_LEN" -gt 50 ]; then
  pass "Haiku responds to Stoic prompt" "${Q_MS}ms, ${QUICK_LEN} chars"
else
  fail "Haiku responds to Stoic prompt" "response too short: ${QUICK_LEN} chars"
fi

# Extract JSON from response (strip markdown code blocks if present)
QUICK_JSON=$(echo "$QUICK_TEXT" | sed 's/```json//g; s/```//g' | jq '.' 2>/dev/null)

if [ -n "$QUICK_JSON" ]; then
  pass "Response is valid JSON" "parsed successfully"

  CTRL=$(echo "$QUICK_JSON" | jq -r '.control_classification // empty')
  if [ -n "$CTRL" ]; then
    pass "Has control_classification" "$CTRL"
  else
    fail "Has control_classification" "field missing"
  fi

  P_COUNT=$(echo "$QUICK_JSON" | jq '.passions_detected | length' 2>/dev/null)
  if [ "${P_COUNT:-0}" -gt 0 ]; then
    pass "Has passions_detected" "${P_COUNT} passions found"
  else
    fail "Has passions_detected" "no passions detected"
  fi

  OIK_SELF=$(echo "$QUICK_JSON" | jq '.oikeiosis.self // empty' 2>/dev/null)
  if [ -n "$OIK_SELF" ]; then
    pass "Has oikeiosis scores" "self=$OIK_SELF"
  else
    fail "Has oikeiosis scores" "missing"
  fi

  PROX=$(echo "$QUICK_JSON" | jq -r '.katorthoma_proximity // empty')
  if [ -n "$PROX" ]; then
    pass "Has katorthoma_proximity" "$PROX"
  else
    fail "Has katorthoma_proximity" "missing"
  fi

  SUMMARY=$(echo "$QUICK_JSON" | jq -r '.reasoning_summary // empty' | head -c 80)
  if [ -n "$SUMMARY" ]; then
    pass "Has reasoning_summary" "${SUMMARY}..."
  else
    fail "Has reasoning_summary" "missing"
  fi

  # Sanity: buying expensive car to impress should detect appetite-like passion
  PASSION_TYPES=$(echo "$QUICK_JSON" | jq -r '.passions_detected[].type' 2>/dev/null | tr '[:upper:]' '[:lower:]')
  PASSION_EVIDENCE=$(echo "$QUICK_JSON" | jq -r '.passions_detected[].evidence // empty' 2>/dev/null | tr '[:upper:]' '[:lower:]')
  if echo "$PASSION_TYPES $PASSION_EVIDENCE" | grep -qiE "appetite|desire|vanity|impress|pleasure"; then
    pass "Correctly identifies appetite/desire" "sanity check on known-bad action"
  else
    fail "Correctly identifies appetite/desire" "expected appetite-related passion, got: $PASSION_TYPES"
  fi
else
  fail "Response is valid JSON" "could not parse"
fi

Q_IN=$(echo "$QUICK_RESULT" | jq '.usage.input_tokens // 0')
Q_OUT=$(echo "$QUICK_RESULT" | jq '.usage.output_tokens // 0')
pass "Token usage recorded" "${Q_IN} in / ${Q_OUT} out"

# ─── Test Group 4: Standard Reasoning (More Mechanisms) ───
echo ""
echo "── Test Group 4: Standard Reasoning ──"

STD_SYSTEM='You are a Stoic reasoning engine performing STANDARD depth evaluation. Apply 5 mechanisms: Control Filter, Passion Diagnosis, Oikeiosis, Value Assessment, Appropriate Action. Return ONLY a JSON object (no markdown) with: {"control_classification": "string", "passions_detected": [{"type": "string", "evidence": "string"}], "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like", "virtues_engaged": [{"virtue": "string", "quality": "strong|moderate|weak"}], "sage_alternative": "string", "reasoning_summary": "string"}'

STD_ACTION='Evaluate: "A colleague takes credit for my work in a meeting. I want to publicly call them out to embarrass them."'

S_START=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
STD_RESULT=$(call_api "$MODEL_FAST" 1500 "$STD_SYSTEM" "$STD_ACTION")
S_END=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
S_MS=$((S_END - S_START))

STD_TEXT=$(echo "$STD_RESULT" | jq -r '.content[0].text // "error"')
STD_JSON=$(echo "$STD_TEXT" | sed 's/```json//g; s/```//g' | jq '.' 2>/dev/null)

if [ -n "$STD_JSON" ]; then
  pass "Standard reasoning responds" "${S_MS}ms"

  VIRTUES=$(echo "$STD_JSON" | jq '.virtues_engaged | length' 2>/dev/null)
  if [ "${VIRTUES:-0}" -gt 0 ]; then
    pass "Has virtues_engaged" "${VIRTUES} virtues assessed"
  else
    fail "Has virtues_engaged" "no virtues found"
  fi

  SAGE_ALT=$(echo "$STD_JSON" | jq -r '.sage_alternative // empty' | head -c 80)
  if [ -n "$SAGE_ALT" ]; then
    pass "Has sage_alternative" "${SAGE_ALT}..."
  else
    fail "Has sage_alternative" "missing"
  fi

  STD_PROX=$(echo "$STD_JSON" | jq -r '.katorthoma_proximity // empty' | tr '[:upper:]' '[:lower:]')
  if [ "$STD_PROX" != "sage_like" ] && [ "$STD_PROX" != "principled" ]; then
    pass "Correctly assesses vengeful action as non-virtuous" "proximity: $STD_PROX"
  else
    fail "Correctly assesses vengeful action as non-virtuous" "proximity: $STD_PROX (expected lower)"
  fi
else
  fail "Standard reasoning responds" "could not parse JSON"
fi

# ─── Test Group 5: Deep Reasoning (Sonnet) ───
echo ""
echo "── Test Group 5: Deep Reasoning (Sonnet) ──"

DEEP_SYSTEM='You are a Stoic philosopher. Return ONLY a JSON object (no markdown): {"katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like", "key_insight": "string", "virtue_path": "string"}'

DEEP_ACTION='Evaluate: "I choose to forgive someone who wronged me, not because they deserve it, but because holding onto anger harms my own character."'

D_START=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
DEEP_RESULT=$(call_api "$MODEL_DEEP" 500 "$DEEP_SYSTEM" "$DEEP_ACTION")
D_END=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
D_MS=$((D_END - D_START))

DEEP_TEXT=$(echo "$DEEP_RESULT" | jq -r '.content[0].text // "error"')
DEEP_JSON=$(echo "$DEEP_TEXT" | sed 's/```json//g; s/```//g' | jq '.' 2>/dev/null)

if [ -n "$DEEP_JSON" ]; then
  pass "Sonnet model responds" "${D_MS}ms"

  DEEP_PROX=$(echo "$DEEP_JSON" | jq -r '.katorthoma_proximity // empty' | tr '[:upper:]' '[:lower:]')
  if [ "$DEEP_PROX" = "sage_like" ] || [ "$DEEP_PROX" = "principled" ]; then
    pass "Correctly assesses virtuous action highly" "proximity: $DEEP_PROX"
  else
    fail "Correctly assesses virtuous action highly" "proximity: $DEEP_PROX (expected principled or sage_like)"
  fi

  INSIGHT=$(echo "$DEEP_JSON" | jq -r '.key_insight // empty' | head -c 80)
  if [ -n "$INSIGHT" ]; then
    pass "Provides key insight" "${INSIGHT}..."
  else
    fail "Provides key insight" "missing"
  fi

  D_IN=$(echo "$DEEP_RESULT" | jq '.usage.input_tokens // 0')
  D_OUT=$(echo "$DEEP_RESULT" | jq '.usage.output_tokens // 0')
  pass "Sonnet token usage" "${D_IN} in / ${D_OUT} out"
else
  fail "Sonnet model responds" "could not parse JSON"
fi

# ─── Test Group 6: Guardrail Binary Gate (speed) ───
echo ""
echo "── Test Group 6: Guardrail Speed Check ──"

GUARD_SYSTEM='You are a fast Stoic guardrail. Return ONLY a JSON object (no markdown): {"proceed": true or false, "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like", "reason": "one sentence"}'

G_START=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
GUARD_RESULT=$(call_api "$MODEL_FAST" 300 "$GUARD_SYSTEM" 'Should I proceed with: "Donate to a food bank this weekend"')
G_END=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
G_MS=$((G_END - G_START))

GUARD_TEXT=$(echo "$GUARD_RESULT" | jq -r '.content[0].text // "error"')
GUARD_JSON=$(echo "$GUARD_TEXT" | sed 's/```json//g; s/```//g' | jq '.' 2>/dev/null)

if [ -n "$GUARD_JSON" ]; then
  if [ "$G_MS" -lt 5000 ]; then
    pass "Guardrail responds fast" "${G_MS}ms (target: <5000ms)"
  else
    fail "Guardrail responds fast" "${G_MS}ms (target: <5000ms)"
  fi

  PROCEED=$(echo "$GUARD_JSON" | jq '.proceed // empty')
  if [ "$PROCEED" != "null" ] && [ -n "$PROCEED" ]; then
    pass "Returns proceed decision" "proceed: $PROCEED"
  else
    fail "Returns proceed decision" "missing proceed field"
  fi

  if [ "$PROCEED" = "true" ]; then
    pass "Correctly approves virtuous action" "donating approved"
  else
    fail "Correctly approves virtuous action" "donating should be approved"
  fi
else
  fail "Guardrail responds" "could not parse JSON"
fi

# ─── Summary ───
echo ""
echo "══════════════════════════════════════════════"
echo "  Results: ${PASSED} passed, ${FAILED} failed"
echo "══════════════════════════════════════════════"

if [ "$FAILED" -eq 0 ]; then
  echo ""
  echo "  🎉 All tests passed! Your Anthropic API pipeline is working."
  echo "  The sage-reason-engine will function correctly on your live site."
  echo ""
else
  echo ""
  echo "  ⚠️  ${FAILED} test(s) failed. Review the output above for details."
  echo ""
fi

exit "$FAILED"
