# Session Close — 11 April 2026 (Session 14)

## Decisions Made

- **Standard depth maxTokens raised from 4096 to 6000**: Root cause of intermittent 500s on standard depth calls with longer inputs was confirmed as output budget exhaustion. Raising gives headroom for the standard 5-mechanism JSON schema to close cleanly regardless of input length.
- **Deep depth maxTokens raised from 4096 to 8192**: Deep uses MODEL_DEEP and 6 mechanisms. Previous ceiling was unjustifiably identical to standard. Raised to accommodate the additional iterative_refinement block.
- **stage_scores moved from user message instruction to system prompt schema**: The inline `userMessage +=` instruction was ambiguous (didn't specify WHERE in the JSON to place stage_scores). All three system prompt schemas (QUICK, STANDARD, DEEP) now declare stage_scores explicitly in their JSON structure. This makes placement deterministic. The inline instruction has been removed.
- **detectDistress() wired to all 6 human-facing POST endpoints**: R20a was a critical unmet requirement. All human-facing endpoints now gate on distress detection before any LLM call. Endpoints covered: /api/reason, /api/score, /api/score-decision, /api/score-social, /api/score-document, /api/reflect, /api/score-scenario.
- **llms.txt rewritten for V3**: Removed all V1 language (numeric 0-100 scores, alignment tiers as sage/progressing/aware/misaligned/contrary, threshold: 50 on guardrail). Updated all endpoint schemas to V3 vocabulary (katorthoma_proximity levels, passion_diagnosis with sub-species, risk_class, oikeiosis, control_filter). Version bumped to v3.0 in header.
- **agent-card.json updated to V3**: Version bumped to "3.0.0". All capability descriptions updated to V3 vocabulary. exampleRequest updated (threshold: 60 → risk_class: "elevated"). Free tier limits corrected (100/month vs incorrect 1/day). Rate limit corrected (15/min actual vs 30/min stated).

---

## Code Changes This Session

### `website/src/lib/sage-reason-engine.ts`
- **DEPTH_CONFIG**: standard maxTokens 4096 → 6000; deep maxTokens 4096 → 8192
- **QUICK_SYSTEM_PROMPT, STANDARD_SYSTEM_PROMPT, DEEP_SYSTEM_PROMPT**: All three now include `"stage_scores"` field in their JSON schema with the correct mechanism keys for each depth
- **runSageReason()**: Removed the `userMessage += '\n\nFor each mechanism you apply, also include a "stage_scores" object...'` block (7 lines removed)

### `website/src/app/api/reason/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block after text length validation, before LLM call

### `website/src/app/api/score/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block after text length validation, before LLM call

### `website/src/app/api/score-decision/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block after text length validation, before options validation

### `website/src/app/api/score-social/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block after text length validation, before LLM call

### `website/src/app/api/score-document/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block after text length validation, before LLM call

### `website/src/app/api/reflect/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block after input validation, before LLM call

### `website/src/app/api/score-scenario/route.ts`
- Added `import { detectDistress } from '@/lib/guardrails'`
- Added R20a distress check block in POST handler after text length validation
- Raised POST scoring path max_tokens from 512 → 1024 (was causing truncation 500s)

### `website/public/llms.txt`
- Full rewrite from V1 to V3. Removed all numeric scores, V1 tiers, threshold: 50 guardrail body. Added V3 response schemas for all endpoints, V3 vocabulary throughout. Version header updated v2.0 → v3.0.

### `website/public/.well-known/agent-card.json`
- Version: "1.0.0" → "3.0.0"
- Description: replaced "four cardinal virtues (Wisdom, Justice, Courage, Temperance)" with V3 causal sequence description
- All capability descriptions updated to V3 vocabulary
- exampleRequest: threshold: 60 → risk_class: "elevated"
- Free tier: corrected to 100/month
- Rate limit: corrected to 15/min

### `TECHNICAL_STATE.md`
- Corrected: `/api/score` side effects now reads "None — does not insert to analytics_events. (Confirmed by code review, April 2026.)"

---

## TypeScript Compile

**Result: PASS** — `npx tsc --noEmit` returned exit code 0. No errors.

---

## Status Changes

| Component | Old Status | New Status | Notes |
|---|---|---|---|
| R20 vulnerable user detection | Designed | Wired | detectDistress() now called by all 6 human-facing POST endpoints before any LLM call |
| Standard depth JSON failures | Wired (failing) | Wired (fixed, unverified) | maxTokens 6000 + schema fix — needs post-deploy test to confirm |
| Deep depth | Wired | Wired (improved) | maxTokens 8192, same schema fix applies |
| score-scenario POST 500 | Wired (failing) | Wired (fixed, unverified) | max_tokens 512 → 1024 |
| llms.txt | V1 (incorrect) | V3 (correct) | Full rewrite |
| agent-card.json | V1 (incorrect) | V3 (correct) | Full update |
| TECHNICAL_STATE.md | Inaccurate (score analytics claim) | Accurate | Corrected |

---

## Next Session Should

1. **Deploy to Vercel**: All changes are code-side only. Push to main branch → Vercel auto-deploys. No migration needed.

2. **Verify standard depth fix**: After deploy, test:
   ```
   POST /api/reason
   { "input": "I am deciding whether to raise my product prices by 15% to cover increased costs, knowing some customers may leave", "depth": "standard" }
   ```
   Expected: 200 with correct JSON including value_assessment and kathekon_assessment fields.

3. **Verify R20a fix**: After deploy, test crisis language again:
   ```
   POST /api/reason
   { "input": "I can't go on anymore. There is no point to any of this.", "depth": "quick" }
   ```
   Expected: 200 with `{ "distress_detected": true, "severity": "acute", "redirect_message": "..." }` — NOT a 500.

4. **Verify score-scenario POST fix**: After deploy:
   ```
   POST /api/score-scenario
   { "scenario": "A friend asks you to lie to protect them from embarrassment", "response": "I would tell the truth even if it causes discomfort", "audience": "adult" }
   ```
   Expected: 200 with katorthoma_proximity, passions_detected, kathekon_quality, feedback, sage_says.

5. **Investigate `mentor_encryption: active` in health endpoint**: Still unresolved from Session 13. Check `website/src/app/api/health/route.ts` to determine how it reports encryption status. If it checks file existence rather than pipeline wiring, the report is misleading. ADR-007 says encryption is scaffolded, not wired.

6. **Verify analytics logging via /api/reflect**: Use the daily reflection UI on the site, then check Supabase Table Editor → analytics_events for a `daily_reflection` event. This confirms the analytics path that DOES have logging works end-to-end.

7. **Context layer status**: If standard depth fix is confirmed post-deploy, the context layer architecture can move from Wired → Verified (conditional on all depth levels passing and R20 tests passing).

8. **Vercel function logs for token counts**: Still pending founder action. After deploy, check:
   Vercel dashboard → SageReasoning project → Functions → Logs
   Look for recent /api/reason calls (standard depth) — check logged output_tokens vs 6000 ceiling.

---

## Blocked On

- Everything above requires deployment. Changes are all code-side. Founder deploys by pushing to main.

---

## Open Questions

1. **Does `mentor_encryption: active` in the health check reflect reality?** ADR-007 says encryption.ts is scaffolded, not wired. The health endpoint may be misreporting. Affects accurate status of P2 item 2c.
2. **P0 exit criterion 6** (startup toolkit simplest viable interface): Still open. Not blocking P1 but not addressed.
3. **Crisis resource verification calendar reminder** (due 30 June 2026): Not set. Founder action.
4. **"Ask the Org" button**: Still pending. Priority relative to P2 fixes?
5. **mentor_baseline and mentor_baseline_response endpoints**: R20 wiring handoff noted these as requiring detectDistress() too. Need to check if they exist and handle them if so.

---

## Verified This Session

- TypeScript compile: PASS (exit 0, no errors)
- All code changes are syntax-correct and import-correct

## Not Yet Verified (Requires Post-Deploy Testing)

- Standard depth 500 fix (maxTokens + schema)
- R20a crisis redirect (detectDistress integration)
- score-scenario POST 500 fix (max_tokens 1024)
- llms.txt serving correctly at /llms.txt
- agent-card.json serving correctly at /.well-known/agent-card.json
