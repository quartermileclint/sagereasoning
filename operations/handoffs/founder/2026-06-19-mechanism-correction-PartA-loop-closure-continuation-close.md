# Session Close — 2026-06-19 — Mechanism-correction Part A (Tier-1 clarification-continuation fix, Design A) + #6a chain-close

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Tier:** code-critical (target is the Live `/api/reason` perimeter) — but what **landed** is **Standard risk**: a dark, flag-UNSET build (byte-identical when off) + a test + an ADR amendment. **No prod / flag / auth / perimeter / schema change.**
**Predecessor:** `operations/handoffs/founder/2026-06-18-sage-practice-mechanism-corrections-close.md` (diagnosis + plan + Design-A election).
**Prompt built under:** `operations/handoffs/founder/2026-06-18-sage-practice-mechanism-corrections-FOLLOWUP-NEXT-SESSION-PROMPT.md` — **Part A elected.**

## What happened
Built **Part A** — the Tier-1 clarification-continuation fix (ADR-008 **Design A**) + the **#6a loop-closure chain-close semantics** — **dark, flag-gated, TEST-Verified at the assertion level, adversarially pre-activation-reviewed (GO)**. The build was already substantially in the working tree at session open (tasks 1–4 done); this session **verified it green, ran the Critical pre-activation review, folded all six findings, and closed.** The AI performed no Supabase/Vercel/git op.

The fix resolves a defect that was **Live in prod and broken by construction**: no caller could close a Tier-1 force-clarification (ADR-008 §1-vs-§4.4-step-5 contradiction + the validated trigger never threaded into the engine). Design A keeps `input` byte-identical (hash binding preserved), adds a typed `clarification_response` field, suppresses re-firing the answered trigger, and folds the answer into the Layer-1 extraction context — all behind `SUBSTRATE_TIER1_CONTINUATION_ENABLED` (UNSET ⇒ byte-identical, machine-verified). The R20a perimeter is **extended** to distress-check `input + clarification_response` (closes the AC5 gap). §A.5 specifies the loop-closure terminal "closed" condition (the reject-mode-6c prerequisite) — **no change to the LIVE CI-4 gate**, which already implements the rule.

## Decisions Made
- `D-MECHANISM-CORRECTION-PART-A-LOOP-CLOSURE-CONTINUATION-BUILT-TEST-VERIFIED-2026-06-19` appended — the build, the review, the folded findings, the verification.

## Pre-activation adversarial review (ultracode — 8 dimensions / 15 agents): **GO**
- **4 dimensions PROVEN CLEAN first-hand:** flag-off byte-identity; R20a/AC5 perimeter (no path where the answer reaches the engine un-checked; A7 reuses the route gate computed over input+answer); token/hash forgery (`previousTrigger` only from a validated token; input still hashed alone; no cross-input replay); suppression correctness (all three Tier-1 exits covered; the suppressed assessment is a real deterministic signable Layer2Assessment).
- **6 findings, ZERO critical/high — all folded this session:**
  - **CF-2 (high→med, FIXED):** `l1_supply`/plugin + continuation dropped the answer (extraction skipped) while still suppressing the trigger → a false success. Fixed with a flag-on **400** (`clarification_response_with_supplied_layer1_schema`). Not a perimeter bypass.
  - **#1 (med):** AC5 distress-augmentation wiring guard → added.
  - **#3/#5/#6 (low):** route 400/billing + suppress-threading regression guards → added (source-grep INV pattern).
  - **#4 (low):** stale "augmented input" ADR wording → in-place superseded markers.

## Status Changes
| Item | Old | New |
|---|---|---|
| Tier-1 continuation (#2) | Live, **broken by construction** | **Fixed — built dark, flag-UNSET, TEST-Verified + GO-reviewed** (activation = founder 0c-ii) |
| #6a chain-close semantics | unspecified | **Specified** (ADR §A.5); reject-mode-6c prerequisite named; LIVE CI-4 gate confirmed already-correct |
| CF-2 l1_supply×continuation false-success | latent (found by review) | **closed by construction** (flag-on 400) |
| ADR-008 internal contradiction | shipped | **resolved** (Design A) + stale wording marked |

## Verification (founder-performable — all green this session)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit                                                                 # exit 0
npx tsx src/lib/translation-sandwich/__tests__/tier1-continuation.test.ts        # 42 pass / 0 fail
# flag-off byte-identity (unchanged by Part A):
npx tsx src/lib/translation-sandwich/__tests__/layer2-canonical-json.test.ts     # 15/0
npx tsx src/lib/translation-sandwich/__tests__/layer2-signer.test.ts             # 14/0
npx tsx src/lib/translation-sandwich/__tests__/layer2-verifier.test.ts           # 18/0
npx tsx src/lib/translation-sandwich/__tests__/reason-loop-closure.test.ts       # 33/0
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts   # 50/0
npx tsx src/lib/translation-sandwich/__tests__/prose-deferral.test.ts            # 26/0
npm run build                                                                    # exit 0; /api/reason registered
```

## Blocked On — founder commit (PR17; no prod change)
The founder commits + pushes by name. **Nothing goes to Vercel/Supabase** — the flag stays UNSET; the pushed code is byte-identical to pre-Part-A behaviour (flag-off paths test-asserted). Files to stage:
```
git add adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md \
        website/src/lib/translation-sandwich/layer2-mechanisms.ts \
        website/src/lib/translation-sandwich/parallel-run.ts \
        website/src/lib/translation-sandwich/tier1-token.ts \
        website/src/app/api/reason/route.ts \
        website/src/lib/translation-sandwich/__tests__/tier1-continuation.test.ts \
        operations/decision-log.md CLAUDE.md \
        operations/handoffs/founder/2026-06-19-mechanism-correction-PartA-loop-closure-continuation-close.md
git commit -m "M-Corr Part A: Tier-1 clarification-continuation fix (ADR-008 Design A) + #6a chain-close — dark, flag-gated, GO-reviewed"
```
(Note: `website/tsconfig.tsbuildinfo` is a build artifact — include or ignore per the founder's convention. The pre-existing `brand/~$and_Guidelines.docx` deletion in the working tree is unrelated to Part A.)

## Next Session Should
Elect the next mechanism-correction follow-up build: **Part B** (guardrail #3a model-honesty + #3b/3c signed-sandwich port — its own Critical session + ADR) or **Part C** (apply the staged public-contract docs + scope the thin SDK). **After Part A activation** (the founder-walked flag step), publish the clarification-continuation contract to the public docs (deliberately excluded from the staged-docs file pending this fix — R18).

## Production state at session close: **UNCHANGED.**
Nothing went to prod — no flag, no schema, no auth/perimeter/code-path change. All Live state per `CLAUDE.md` holds (M1, CI-14 UPC, B1 trajectory, B2 CI-4, CI-10, R20a, M3-CI-11, M5, the 2026-06-18 reflect-completion fix). Part A is **built dark, flag UNSET** — inert until a founder-walked activation. The **0h launch call remains the founder's**.

## Cross-references
- `operations/decision-log.md` — `D-MECHANISM-CORRECTION-PART-A-LOOP-CLOSURE-CONTINUATION-BUILT-TEST-VERIFIED-2026-06-19`.
- `adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` — ADR-008, amended §A.0–§A.7 (Design A) + §A.5 (#6a chain-close).
- `operations/benchmarks/sage-practice-v1/mechanism-corrections-plan.md` — §2 (loop-closure) + §6a (chain-close).
- `operations/handoffs/founder/2026-06-18-sage-practice-mechanism-corrections-FOLLOWUP-NEXT-SESSION-PROMPT.md` — Parts A/B/C (B + C remain).
- `website/src/app/api/reason/__tests__/r20a-audience-rendering.test.ts` — the INV source-grep test pattern reused for the wiring guards.

*End of session close. Part A built dark + GO-reviewed + all findings folded; production byte-unchanged; activation + Parts B/C + the 0h call remain the founder's.*
