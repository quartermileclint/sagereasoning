# Session Close — 2026-06-19 — Mechanism-correction Part B (guardrail #3a model-honesty + #3b/#3c signed-sandwich port, ADR-009)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** code-critical (target is the Live `/api/guardrail` endpoint + a response-shape change under R10) — but what **landed** is **Elevated + Standard**: one always-on honesty one-liner (#3a, Elevated) + a dark, flag-UNSET port (byte-identical when off) + an ADR + tests. **No prod / flag / auth / perimeter / schema / cron change.**
**Predecessor:** `operations/handoffs/founder/2026-06-19-mechanism-correction-PartA-loop-closure-continuation-close.md` (Part A — Tier-1 continuation, now LIVE).
**Prompt built under:** `operations/handoffs/founder/2026-06-19-mechanism-correction-PartB-guardrail-NEXT-SESSION-PROMPT.md`.

## What happened
Built **Part B** of the Sage Practice mechanism-corrections follow-up — the guardrail's three defects, all first-hand re-confirmed at session open (every cited file:line re-verified; line numbers had drifted only trivially):

- **#3a (model-reporting honesty) — LANDED, always-on.** `guardrail/route.ts:306` hardcoded `model: 'claude-haiku-4-5-20251001'` — a lie for every elevated/critical gate (which actually run Sonnet via `risk_class`→depth→`MODEL_DEEP`). Fixed to `model: reasoningResult.meta.ai_model` (the real model). Confirmed side-effect-free (the explicit `costUsd` override always bypasses the model-based estimate; the change touches only `meta.ai_model`). **This is the single flag-off behaviour delta to `/api/guardrail` this session.**
- **#3b (~90s latency) + #3c (non-determinism/unsigned) — BUILT DARK (ADR-009), flag-gated, TEST-Verified, GO_WITH_FIX-reviewed.** Ported the gate onto the translation-sandwich's three pure building blocks **directly** (not `runSandwich`): `extractFeatures` (one bounded 4000-tok Sonnet call) → `applyMechanisms` (pure deterministic L2) → `signLayer2Assessment` (Ed25519) → rank-arithmetic verdict, **no Layer-3 prose**. The verdict becomes **signed + reproducible from the disclosed extraction** (closes #3c — `is_deterministic` stays honestly false; the win is verifiability) at ~half the output budget with no prose generation (closes #3b). All behind `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` (**UNSET everywhere** ⇒ the verbatim legacy `sage-guard` path runs, byte-identical except #3a). The AI performed no Supabase/Vercel/git op.

## Decisions Made
- `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-MODEL-HONESTY-AND-SIGNED-SANDWICH-PORT-BUILT-TEST-VERIFIED` appended — the #3a fix, the dark port, ADR-009, the review, the folded findings, the verification.
- **ADR-009 adopted (build-dark):** `adopted/adr/2026-06-19-guardrail-signed-sandwich-port.md` — the engine choice (direct minimal wiring over `runSandwich`, §1), the §4 field reconciliation (incl. the two R10 prose-field changes + the kathekon floor), the §6 perimeter-scope decision (no ninth-route addition; distress-floor deferred), the §Activation mandatory verdict-equivalence gate.

## Pre-activation adversarial review (ultracode — 8 dimensions / 22 agents): **GO_WITH_FIX**
- **3 dimensions PROVEN CLEAN first-hand:** flag-off byte-identity (legacy path verbatim; clean flag-gated early-return; lazy imports); R20a/perimeter ordering (no regression — the port never calls `runSandwich`/A7); threshold-arithmetic parity (same `PROXIMITY_RANK`, same argument order, sound proximity cast).
- **11 findings, ZERO critical/high — all folded; 2 refuted:**
  - **SD-1 (medium → FIXED):** the kathekon floor — a sparse/empty extraction defaulted to proximity `'deliberate'` → `proceed:true` while labelling the action `is_kathekon:false` (contrary). Closed by a port-layer floor (`is_kathekon===false` ⇒ `proceed:false`); `computeProximity` (shared determinism) untouched.
  - **R10-1 / R10-2 (low → FIXED):** emit the bare assessment when signing is off; disclose the Layer-1 `extraction` on the wire (parity with `/api/reason`).
  - **R10-3 / FM-1 / SD-3 (low → folded to docs):** GET self-doc → ADR activation checklist; post-LLM Layer-1 under-bill → accepted-tradeoff note; verdict-equivalence battery → **mandatory pre-activation gate**.
  - **GS-DET-1 / F1 / F2 (nits → FIXED):** stale `is_deterministic:true` comments/ADR lines corrected to the honest `false` framing (R18).
  - **Refuted:** SD-2 (the LLM-would-block half is not code-provable; only the incoherence SD-1 fixes), R20A-OBS-1 (perimeter is a recorded deferred election), FM-2 (zero-cost headers are correct fail-safe).

## Status Changes
| Item | Old | New |
|---|---|---|
| #3a guardrail model-honesty | `meta.ai_model` hardcoded Haiku (lie) | **Fixed — always-on, Live-on-push** (truthful model) |
| #3b/#3c guardrail engine | unsigned `sage-guard`, ~90s, `is_deterministic:false` | **Ported to signed deterministic sandwich — built DARK, flag-UNSET, TEST-Verified + GO_WITH_FIX-reviewed** (activation = founder 0c-ii) |
| SD-1 sparse-extraction fail-open | latent (found by review) | **closed** (kathekon floor) |
| ADR-009 | — | **Adopted (build-dark)** |

## Verification (founder-performable — all green this session)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit                                                                 # exit 0
npm run build                                                                    # exit 0; /api/guardrail registered
npx tsx src/app/api/guardrail/__tests__/model-honesty.test.ts                    # 23 pass / 0 fail (#3a)
npx tsx src/lib/__tests__/guardrail-sandwich.test.ts                             # 57 pass / 0 fail (#3b/#3c)
# flag-off byte-identity (unchanged by Part B):
npx tsx src/lib/translation-sandwich/__tests__/layer2-signer.test.ts             # 14/0
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts   # 50/0
npx tsx src/lib/translation-sandwich/__tests__/tier1-continuation.test.ts        # 42/0
npx tsx src/lib/__tests__/loop-cost-tracker-ci10.test.ts                         # 16/0
```

## Next Session Should
Elect the next mechanism-correction follow-up: **Part C** (apply the staged public-contract docs incl. §7 + scope/build the thin SDK; `operations/handoffs/founder/2026-06-19-mechanism-correction-PartC-docs-SDK-NEXT-SESSION-PROMPT.md`). **Part B activation** (the founder-walked flag step) is its own 0c-ii: run the **mandatory verdict-equivalence fixture battery** (unsafe + under-specified actions through both engines — the sandwich must be no less conservative) → set `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED=true` + redeploy + a live smoke → publish the R10 response-shape change (incl. the in-route GET self-doc, R10-3). Also still pending from Part A: publish the clarification-continuation contract to the public docs (now Live).

## Blocked On — founder commit (PR17; no prod change)
The founder commits + pushes by name. **Nothing goes to Vercel/Supabase** — the port flag stays UNSET; the pushed code is byte-identical to the legacy path when the flag is off (test-asserted), **except** the intended always-on #3a `meta.ai_model` honesty fix. Files to stage:
```
git add website/src/app/api/guardrail/route.ts \
        website/src/lib/guardrail-sandwich.ts \
        website/src/app/api/guardrail/__tests__/model-honesty.test.ts \
        website/src/lib/__tests__/guardrail-sandwich.test.ts \
        adopted/adr/2026-06-19-guardrail-signed-sandwich-port.md \
        operations/decision-log.md CLAUDE.md \
        operations/handoffs/founder/2026-06-19-mechanism-correction-PartB-guardrail-signed-sandwich-port-close.md
git commit -m "M-Corr Part B: guardrail #3a model-honesty (always-on) + #3b/#3c signed-sandwich port (ADR-009) — dark, flag-gated, GO_WITH_FIX-reviewed"
```
(Note: `website/tsconfig.tsbuildinfo` is a build artifact — include or ignore per the founder's convention. The pre-existing `brand/~$and_Guidelines.docx` deletion in the working tree is unrelated to Part B.)

**On push, the one always-on behaviour change is #3a:** `/api/guardrail`'s `meta.ai_model` now reports the real model (Sonnet on elevated/critical gates) instead of the hardcoded Haiku. Verdict/threshold/cost/auth/perimeter byte-unchanged. The `#3b/#3c` port is inert (flag UNSET).

## Production state at session close: **UNCHANGED (except the always-on #3a meta-field honesty on push).**
No flag, no schema, no auth/perimeter/cron change. All Live state per `CLAUDE.md` holds (Part A Tier-1 continuation, M1, CI-14 UPC, B1 trajectory, B2 CI-4, CI-10, R20a, M3-CI-11, M5, the reflect-completion fix). The #3b/#3c port is **built dark, flag UNSET** — inert until a founder-walked activation. The **0h launch call remains the founder's**.

## Open Questions
- **Guardrail-into-perimeter (deferred founder election, ADR-009 §6):** whether to bring `/api/guardrail` into the substrate distress perimeter (run A7 + the `agent_developer` audience form) — a future ninth-route AC5 `Critical` session coupling ADR-R20a-CFG. Revisit condition: when the ADR-R20a-CFG ninth-route work proceeds.

## Founder Verification (Between Sessions)
Run the verification block above (plain `npx tsx` for all — none need `--env-file`; the port's import chain is lazy). Confirm `npm run build` registers `/api/guardrail`. After push, spot-check that `/api/guardrail` on an elevated/critical call reports `meta.ai_model: "claude-sonnet-4-6"` (the #3a fix) and that the response is otherwise unchanged (the port flag is UNSET).

## Risk Classification Record
Critical **target** (Live endpoint + R10 response-shape); **Elevated** for the landed #3a (always-on meta-field honesty, no verdict/threshold/auth/perimeter touch); **Standard** for the dark port (flag UNSET = byte-identical). AC7 not engaged. R20a/signing-keys/UPC untouched. CCP step 3 = N/A (build-arc no-users note).

## PR5 Knowledge-Gap Carry-Forward
KG1 honoured (the port's analytics + finalizeLoopResponse are awaited; no fire-and-forget; no self-call; metering uses the single L1 usage once). KG2 honoured (Layer 1 = Sonnet). The nextjs-route-export gate (`npm run build`, not just `tsc`) was run and passed.

## Orchestration Reminder
Two ultracode workflows ran this session: a 6-agent sandwich-architecture map (the design grounding) and an 8-dimension / 22-agent adversarial pre-activation review (GO_WITH_FIX). Both first-hand-cited; the review's findings were refute-verified then folded.

## Cross-references
- `operations/decision-log.md` — `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-MODEL-HONESTY-AND-SIGNED-SANDWICH-PORT-BUILT-TEST-VERIFIED`.
- `adopted/adr/2026-06-19-guardrail-signed-sandwich-port.md` — ADR-009.
- `operations/benchmarks/sage-practice-v1/mechanism-corrections-plan.md` — §3 (the diagnosis).
- `operations/handoffs/founder/2026-06-19-mechanism-correction-PartB-guardrail-NEXT-SESSION-PROMPT.md` — this session's prompt.
- `operations/handoffs/founder/2026-06-19-mechanism-correction-PartA-loop-closure-continuation-close.md` — sibling Part A.
- `operations/handoffs/founder/2026-06-19-mechanism-correction-PartC-docs-SDK-NEXT-SESSION-PROMPT.md` — Part C (next).

*End of session close. Part B built dark + GO_WITH_FIX-reviewed + all findings folded; #3a honesty fix lands always-on on push; production otherwise byte-unchanged; activation + Part C + the 0h call remain the founder's.*
