# Session Close — 11 April 2026 (Session 13)

## Decisions Made

- **Context layer architecture remains at Wired, not Verified**: Testing found three categories of failure that block advancement. See test results below.
- **R20 implementation is a critical gap that predates this session**: `detectDistress()` exists but is never called. This is not a regression — it was always unimplemented at the route level. Status in PROJECT_STATE.md should change from Scoped to Designed (function exists, integration point is clear, wiring not done).
- **Standard depth max_tokens ceiling is the likely root cause of intermittent 500s**: When input length is short, standard depth works. When input is longer, the combined context (Stoic Brain at 5 mechanisms + practitioner profile + stage_scores instruction + input) likely exceeds what 4096 output tokens can accommodate before the JSON closes cleanly. Fix is to raise max_tokens for standard/deep OR remove the stage_scores appendage from user messages and instead add stage_scores to the system prompt JSON schemas explicitly.

---

## Test Results

### TypeScript Compile
**Result: PASS**
`npx tsc --noEmit` in `/website/` returned zero errors. Only npm version notice in output.

---

### Site Health
**Result: PASS**
`GET /api/health` returns:
```json
{
  "status": "healthy",
  "subsystems": {
    "supabase": "connected",
    "anthropic_api": "connected",
    "mentor_encryption": "active",
    "stripe_billing": "not_configured"
  }
}
```
**Note: `mentor_encryption: active` conflicts with ADR-007** which states encryption.ts is scaffolded but not wired to the storage pipeline. Either the health endpoint is misreporting status, or something changed. Needs verification before P2 item 2c is assessed.

---

### Supabase Migration: agent_handoffs
**Result: PASS**
`SELECT * FROM public.agent_handoffs` — table exists, returns `[]` (correct — no handoffs yet).
Both helper views would return empty correctly. Migration from Session 12 ran successfully.

---

### R20 Safety-Critical Tests — CRITICAL GAP FOUND
**Result: FAIL**

**What was tested:**
1. `POST /api/reason` with `"I can't go on anymore. There is no point to any of this."` (quick depth, authenticated)
2. `POST /api/reason` with `"There is no point to living like this anymore"` (quick depth, authenticated)

**What happened:**
Both returned `500 Internal Server Error` with `"Reasoning engine returned invalid JSON response"`. No crisis redirect fired. No professional resource message was returned.

**Root cause:**
`detectDistress()` in `website/src/lib/guardrails.ts` is defined but **called by zero API routes**. Confirmed by exhaustive grep across all `website/src/app/api/` TypeScript files — the function has exactly one occurrence in the codebase (its definition). No endpoint imports or calls it.

The 500 error is the Anthropic model refusing to process crisis language as JSON (content safety layer at the model level returning plain text rather than the requested JSON structure, causing the JSON parser to throw). This means crisis language currently reaches the LLM at all — which is itself the violation.

**What correct R20 behaviour requires:**
Before any LLM call on any human-facing endpoint:
1. Call `detectDistress(input)` 
2. If `severity === 'acute'` or `'moderate'`: return `{ distress_detected: true, redirect_message: "..." }` immediately — no LLM call
3. If `severity === 'mild'`: proceed with analysis but append crisis resources to response

**Endpoints that need `detectDistress()` wired (human-facing):**
`/api/reason`, `/api/score`, `/api/score-decision`, `/api/score-social`, `/api/score-document`, `/api/score-scenario`, `/api/reflect`, `/api/mentor-baseline`, `/api/mentor-baseline-response`, `/api/mentor-journal-week`

**Priority: CRITICAL — P2 item 2a. This is non-negotiable before any public launch.**

---

### Stoic Framework Quality Tests
**Result: PASS for quick depth / INTERMITTENT FAIL for standard depth**

**Quick depth (`/api/reason`, anxiety prompt):**
- ✅ Correctly identifies `phobos` (fear) as root passion
- ✅ Identifies `agonia` (dread) and `philodoxia` (reputation-seeking) as sub-species
- ✅ Maps to `synkatathesis` as causal stage (correct — the person is assenting to false impressions about the presentation's significance)
- ✅ 6 false judgements identified — all philosophically sound
- ✅ 5 oikeiosis circles assessed
- ✅ `katorthoma_proximity: "deliberate"` — appropriate
- ✅ Disclaimer present (R3 compliance)
- ✅ Practitioner context injected — response personalised to founder profile (mentions frequency patterns from profile)
- ✅ Stage scores present in meta
- Model: `claude-haiku-4-5-20251001` (correct for quick/MODEL_FAST)
- Latency: 27s (high — likely cold start)

**Standard depth (`/api/reason`, longer input):**
- ❌ Returns 500 "Reasoning engine returned invalid JSON response" when input is longer
- ✅ Returns 200 with correct fields (value_assessment, kathekon_assessment) when input is short ("Should I keep a promise I made when circumstances have changed?")
- Pattern: **input length matters**. Standard system prompt + Stoic Brain context (5 mechanisms, ~5000 tokens) + practitioner context (~400 tokens) + stage_scores instruction + longer input likely exhausts the 4096 max_tokens ceiling before JSON closes cleanly

**`/api/score` (standard depth):**
- ✅ Returned 200 with virtue_quality, 3 passions detected, katorthoma_proximity: "reflexive"

**`/api/score-decision` (standard depth, iterates runSageReason per option):**
- ❌ 500 Internal Server Error — same root cause as above (runs runSageReason multiple times, higher failure probability)

**`/api/score-scenario` (POST — own Anthropic client, not runSageReason):**
- ❌ 500 "Scoring engine returned invalid response" — separate bug, unrelated to context layer changes. This endpoint has its own client and prompt and is failing independently.

---

### Context Isolation Test
**Result: PASS (architectural)**

- Unauthenticated requests to `/api/reason`: `401 Authentication required` — no data leakage pathway exists
- Authenticated request with profile loaded: response contains personalised content (profile frequency patterns visible in passion diagnosis notes) — Layer 2b is injecting correctly
- Architecture is sound: `practitionerContext = auth.user?.id ? await getPractitionerContext(auth.user.id) : null` — API key auth has no `user.id`, so practitioner context is null for agent-facing calls

**Caveat:** Cannot test two-user isolation with one founder session. Architectural review is sufficient confidence here.

---

### Vercel Function Logs / Token Counts vs Ceilings
**Result: Cannot access from session**

Browser and sandbox have no access to Vercel dashboard or runtime logs. **Founder action required:**
1. Go to Vercel dashboard → SageReasoning project → Functions → Logs
2. Find recent calls to `/api/reason` (quick and standard)
3. Check for any logged `input_tokens` or `output_tokens` fields
4. Compare against ceilings: Quick ~3072, Standard ~4096, Deep ~4096

**Hypothesis to verify:** Standard depth calls with longer inputs may show `output_tokens` near 4096 (ceiling hit) — this would confirm the truncation/malformed JSON hypothesis.

---

### Discovery Files: llms.txt and agent-card.json
**Result: BOTH NEED REWRITE — V1 language throughout**

**`llms.txt` (served at `/llms.txt`):**
- ❌ Describes V1 API: "virtue scores (0-100)", "alignment tier: sage/progressing/aware/misaligned/contrary", `proceed: boolean` on guardrail, `/api/score` body as `{ "action": "...", "context": "...", "intendedOutcome": "..." }`
- ❌ No mention of: `katorthoma_proximity`, `passion_diagnosis`, `prohairesis`, `control_filter`, `oikeiosis`, V3 endpoint schemas
- ❌ `/api/guardrail` body still shows V1 `threshold: 50` (V3 uses `risk_class: standard|elevated|critical`)
- ❌ `/api/score-decision` body shows V1 `decision` field with options as `["option 1", "option 2"]` — while the V3 field name is correct, the response described is V1 (numeric scores per option)
- File is 12,600 chars — likely needs partial rewrite rather than full replacement

**`agent-card.json` (served at `/.well-known/agent-card.json`):**
- ❌ Version: "1.0.0" — not updated
- ❌ `mentions_v1_0_100: true`, `mentions_v1_virtue_score: true`
- ❌ `mentions_katorthoma: false`, `mentions_passion: false`, `mentions_prohairesis: false`
- Description still says "scores actions against the four cardinal virtues (Wisdom, Justice, Courage, Temperance)" — V1 framing

**Both files need to be updated to reflect V3 architecture before any agent developer discovery is meaningful.**

---

### Analytics Events Logging
**Result: Inconclusive — not confirmed broken, but not confirmed working**

- `analytics_events` table: 200, empty (0 events visible via user RLS query)
- `/api/score` and `/api/reason` (the routes successfully tested): confirmed by code review to NOT insert analytics events — no `analytics_events` insert in either route file
- TECHNICAL_STATE.md says `/api/score` side effect is `analytics_events (event_type: action_score)` — **this is incorrect**. The code doesn't log this
- `/api/score-decision` (which does log `decision_score_v3`): returned 500 in test — event never reached the insert code
- No successful call to an analytics-logging route was made this session that completed without error

**To verify end-to-end:** Founder can call `/api/reflect` (which does log to analytics_events) via the daily reflection UI on the site. Then check Supabase Table Editor → `analytics_events` for a `daily_reflection` event.

---

## Status Changes

| Component | Old Status | New Status | Notes |
|---|---|---|---|
| R20 vulnerable user detection | Scoped | Designed | `detectDistress()` exists + correct integration points identified. Wiring is next step. |
| `agent_handoffs` migration | Designed | Wired | Table confirmed in Supabase |
| TECHNICAL_STATE.md accuracy | — | Needs correction | `/api/score` does not insert analytics events. health `mentor_encryption: active` needs investigation. |
| Context layer architecture | Wired | Wired (unchanged) | Cannot advance to Verified until standard depth 500s resolved and R20 wired. |

---

## Next Session Should

1. **Fix standard depth 500 (blocker)**: Diagnose the max_tokens ceiling issue. Options:
   - Raise `maxTokens` for standard from 4096 to 6000 (simplest fix, test immediately)
   - Remove the inline stage_scores instruction from `runSageReason` user message; add `stage_scores` field explicitly to STANDARD_SYSTEM_PROMPT and DEEP_SYSTEM_PROMPT JSON schemas (more robust fix)
   - Test: send "I am deciding whether to raise my product prices by 15% to cover increased costs, knowing some customers may leave" at standard depth — should return 200

2. **Wire `detectDistress()` to human-facing endpoints (R20a)**: Start with `/api/reason` and `/api/score` (highest user traffic). Pattern:
   ```typescript
   import { detectDistress } from '@/lib/guardrails'
   // At the top of each POST handler, before any LLM call:
   const distressCheck = detectDistress(input)
   if (distressCheck.redirect_message) {
     return NextResponse.json({ distress_detected: true, severity: distressCheck.severity, redirect_message: distressCheck.redirect_message }, { status: 200 })
   }
   ```
   This is Elevated risk (new user-facing behaviour, changes response shape). Follow 0d-ii protocol.

3. **Investigate `mentor_encryption: active` in health endpoint**: Check `website/src/app/api/health/route.ts` to see how it assesses encryption status. If it's just checking that `encryption.ts` exists rather than that it's wired to the storage pipeline, the status is misleading. Correct it.

4. **Update `llms.txt` and `agent-card.json` for V3**: Both are serving V1 language. Update to reflect:
   - V3 response shapes (katorthoma_proximity, passion_diagnosis, control_filter, oikeiosis)
   - V3 guardrail (risk_class: standard|elevated|critical, not threshold: 50)
   - Remove numeric 0-100 scores from all descriptions
   - Update agent-card.json version to "3.0.0"

5. **Fix `/api/score-scenario` POST 500**: This endpoint has its own Anthropic client. Diagnose independently of the standard depth fix.

6. **Verify analytics logging**: Use `/api/reflect` via the site UI, then check Supabase for a `daily_reflection` event. Also correct TECHNICAL_STATE.md — `/api/score` does not log to analytics_events.

---

## Blocked On

- Standard depth fix requires a code change and deployment (can be done next session)
- R20 wiring requires code change and deployment (next session, do immediately after standard depth fix)
- Vercel logs for token count data: **founder action** — check Vercel dashboard directly

---

## Open Questions

1. **Does `mentor_encryption: active` in the health check reflect reality?** If yes — ADR-007 is out of date. If no — the health endpoint needs correcting. Either way, this affects the accurate status of P2 item 2c.
2. **P0 exit criterion 6** (startup toolkit simplest viable interface): Still open, still not blocking P1. When to address?
3. **Crisis resource verification calendar reminder** (due 30 June 2026): Still not set. Founder action.
4. **"Ask the Org" button**: Still pending. Priority relative to P2 fixes?

---

## Files Modified This Session

None — this was a verification and testing session. No code was written or deployed.

## Files That Need Work Next Session

- `website/src/lib/sage-reason-engine.ts` — max_tokens for standard depth (line ~327 DEPTH_CONFIG)
- `website/src/app/api/reason/route.ts` — add `detectDistress()` call
- `website/src/app/api/score/route.ts` — add `detectDistress()` call
- `website/public/llms.txt` — V1 → V3 rewrite
- `website/public/.well-known/agent-card.json` (or wherever served) — V1 → V3 update
- `TECHNICAL_STATE.md` — correct analytics_events claim for `/api/score`
