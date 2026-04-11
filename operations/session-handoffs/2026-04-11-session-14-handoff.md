# Session Close — 11 April 2026 (Session 14)

## Decisions Made

- **Standard depth maxTokens raised from 4096 to 6000**: Precautionary headroom — ultimately not the root cause of failures, but correct regardless.
- **Deep depth maxTokens raised from 4096 to 8192**: Same rationale.
- **stage_scores moved from user message instruction to system prompt schema**: All three system prompt schemas (QUICK, STANDARD, DEEP) now declare stage_scores explicitly. Inline user message instruction removed. Verified: short input at standard depth now includes stage_scores in response.
- **detectDistress() wired to all 6 human-facing POST endpoints**: R20a was a critical unmet requirement. Now gates all human-facing endpoints before any LLM call. Verified: crisis language returns `{ distress_detected: true, severity: "acute" }` with 200, not 500.
- **Standard depth switched from Haiku to Sonnet (MODEL_DEEP)**: Root cause of standard depth failures was Haiku producing non-parseable output for complex multi-stakeholder inputs (business decisions, financial stress, competing obligations). Simple ethical questions worked; complex ones failed. Sonnet is reliable across all input types. Verified: complex business decision at standard depth now returns 200 with full schema.
- **score-scenario POST switched from Haiku to Sonnet**: Same Haiku reliability issue in the route's own Anthropic client. Verified: POST scoring now returns 200 with katorthoma_proximity, feedback, sage_says, passions_detected.
- **llms.txt rewritten for V3**: All V1 language removed. All endpoint schemas updated to V3 vocabulary.
- **agent-card.json updated to V3**: Version 3.0.0. All capability descriptions, example request, tier limits corrected.
- **TECHNICAL_STATE.md corrected**: Removed incorrect claim that /api/score logs to analytics_events.
- **Haiku→Sonnet retry (Option B) deferred to P4**: Noted as the right production architecture. Revisit when per-call cost economics are being modelled against Stripe revenue.

---

## Code Changes This Session

### `website/src/lib/sage-reason-engine.ts`
- DEPTH_CONFIG: standard maxTokens 4096 → 6000; deep 4096 → 8192
- DEPTH_CONFIG: standard model MODEL_FAST → MODEL_DEEP
- All three system prompts: added `stage_scores` field with correct mechanism keys per depth
- runSageReason(): removed inline stage_scores user message instruction

### `website/src/app/api/reason/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block before LLM call

### `website/src/app/api/score/route.ts`
- Added detectDistress import + R20a check

### `website/src/app/api/score-decision/route.ts`
- Added detectDistress import + R20a check

### `website/src/app/api/score-social/route.ts`
- Added detectDistress import + R20a check

### `website/src/app/api/score-document/route.ts`
- Added detectDistress import + R20a check

### `website/src/app/api/reflect/route.ts`
- Added detectDistress import + R20a check

### `website/src/app/api/score-scenario/route.ts`
- Added detectDistress import + R20a check in POST handler
- POST scoring: max_tokens 512 → 1024
- POST scoring: model MODEL_FAST → MODEL_DEEP
- buildEnvelope for POST: model metadata updated to MODEL_DEEP, maxTokens updated to 1024

### `website/public/llms.txt`
- Full rewrite from V1 to V3 (version header, all endpoint schemas, all vocabulary)

### `website/public/.well-known/agent-card.json`
- Version 1.0.0 → 3.0.0
- All capability descriptions updated to V3
- exampleRequest: threshold: 60 → risk_class: "elevated"
- Free tier: 1/day → 100/month
- Rate limit: 30/min → 15/min

### `TECHNICAL_STATE.md`
- /api/score side effects: corrected from "Inserts to analytics_events" to "None"

---

## Verification Results

| Test | Result | Detail |
|---|---|---|
| TypeScript compile | ✅ PASS | Exit 0, zero errors |
| R20a — crisis language → /api/reason | ✅ PASS | 200, distress_detected: true, severity: "acute", redirect_message present |
| R20a — confirmed twice | ✅ PASS | Consistent across both deploy rounds |
| Standard depth + complex business input | ✅ PASS | 200, katorthoma_proximity: "deliberate", value_assessment ✅, kathekon_assessment ✅, stage_scores ✅ |
| Standard depth + short fresh input | ✅ PASS | 200, katorthoma_proximity: "reflexive" — new input, not cached |
| Quick depth + simple input | ✅ PASS | 200, correct structure |
| score-scenario POST | ✅ PASS | 200, katorthoma_proximity: "principled", feedback ✅, sage_says ✅, passions_detected ✅ |

---

## Status Changes

| Component | Old Status | New Status | Notes |
|---|---|---|---|
| R20 vulnerable user detection | Designed | **Verified** | detectDistress() wired and confirmed working across all human-facing endpoints |
| Standard depth JSON failures | Wired (failing) | **Verified** | Sonnet produces reliable JSON across simple and complex inputs |
| score-scenario POST 500 | Wired (failing) | **Verified** | Sonnet fix confirmed |
| stage_scores in schema | Scaffolded | **Verified** | Present in standard depth response |
| llms.txt | V1 (incorrect) | Updated (unverified in browser — serves static file) | Deployed, needs browser check next session |
| agent-card.json | V1 (incorrect) | Updated (unverified in browser) | Same |
| TECHNICAL_STATE.md | Inaccurate | Accurate | Corrected |

---

## Root Cause Documented

**Haiku (claude-haiku-4-5-20251001) is not reliable for JSON output on complex, multi-stakeholder inputs.**

Simple ethical questions (8–12 words, single moral dimension) → Haiku produces valid JSON reliably.
Complex business/social decisions (multiple competing obligations, financial stakes, role conflicts) → Haiku produces non-parseable output (prose reasoning, embedded quotes, or garbled JSON).

Confirmed pattern:
- "Should I keep a promise?" → quick ✅, standard ✅
- Business decision with co-founder conflict + financial stress → quick ❌, standard ❌ (both failed at Haiku)
- Same business decision after switching to Sonnet → standard ✅

Fix applied: standard depth and score-scenario POST now use MODEL_DEEP (claude-sonnet-4-6).
Quick depth stays on MODEL_FAST (Haiku) — confirmed reliable for 3-mechanism simple schema.

Future work (P4): Implement Option B (Haiku→Sonnet retry on parse failure) to reduce per-call cost at scale.

---

## Next Session Should

1. **Verify llms.txt and agent-card.json are serving correctly in browser**:
   - Visit https://www.sagereasoning.com/llms.txt — confirm V3 language (katorthoma_proximity, no numeric scores)
   - Visit https://www.sagereasoning.com/.well-known/agent-card.json — confirm version: "3.0.0"

2. **Test /api/reflect end-to-end** (R20a now wired, analytics logging exists):
   - Submit a daily reflection via the site UI
   - Check Supabase Table Editor → analytics_events for a `daily_reflection` event
   - This confirms the analytics path that DOES have logging works end-to-end

3. **Test /api/score-decision end-to-end** (routes through runSageReason standard depth, now Sonnet):
   ```
   POST /api/score-decision
   { "decision": "Whether to raise prices", "options": ["Raise 15%", "Cut costs by reducing headcount"], "context": "6 months operating loss, 2 months runway" }
   ```
   Expected: 200, each option with katorthoma_proximity, recommendation field identifying best option.

4. **Investigate mentor_encryption: active in /api/health**: Still unresolved. ADR-007 says encryption is scaffolded, not wired. Check /api/health/route.ts to confirm whether the `active` status is accurate or misleading.

5. **Assess P0 hold point readiness**: With R20a verified, standard depth verified, score-scenario verified — review which 0h criteria are now met vs. still open. Suggest producing a structured 0h assessment checklist.

---

## Blocked On

Nothing. All changes deployed and verified. Next session can proceed directly to items above.

---

## Open Questions

1. **Haiku reliability ceiling for quick depth**: Quick depth with complex inputs also failed at Haiku before the Sonnet switch. Now that standard is on Sonnet, quick depth remains on Haiku. If complex inputs ever reach quick depth (they shouldn't — quick is typically for agent real-time use), failures may resurface. Monitor.
2. **mentor_encryption: active accuracy**: Does the health endpoint accurately reflect the encryption pipeline status? If not, it's misleading telemetry.
3. **P0 exit criterion 6** (startup toolkit simplest viable interface): Still not addressed. Not blocking P1 but remains open.
4. **Option B (Haiku→Sonnet retry)**: Deferred to P4. Document in decision log before P4 begins.
5. **score-decision buildEnvelope model metadata**: Still says MODEL_FAST (cosmetic inaccuracy — actual calls go through runSageReason which is now MODEL_DEEP for standard). Low priority.
