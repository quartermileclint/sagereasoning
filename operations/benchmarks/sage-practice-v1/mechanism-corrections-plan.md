# Sage Practice — Mechanism-Corrections Plan (post-Benchmark v1)

**Stream:** founder. **Tier:** code-critical (targets are Live endpoints: `/api/reason`, `/api/guardrail`, `/api/practice/reflect`, `/api/accreditation/[agent_id]`).
**Governing frame:** `/adopted/standing-protocol-cache.md`. **Date:** 2026-06-18.
**Source evidence:** Sage Practice Benchmark v1 run (`operations/benchmarks/sage-practice-v1/runs/2026-06-16/`) — `verdict-memo.md` (+ 2026-06-18 ADDENDUM), `forensic-execution-analysis.md` (§10), `leg-d-harnessed-v2/practice-log.md` (Calls 1–16).
**Session prompt:** `operations/handoffs/founder/2026-06-18-sage-practice-mechanism-corrections-NEXT-SESSION-PROMPT.md`.

**Goal:** determine what the *mechanisms* need so the Sage Practice functions deliver without error. This is product-mechanism work, not benchmark work. Every item below was **diagnosed to root cause read-only and first-hand confirmed** before any proposed change. Dispositions: `DONE` (landed this session) · `BUILD+WALK` (safe, build now + founder-walk the prod step) · `ELECTION` (design decision — founder chooses direction, then build) · `DOCUMENT` (won't-fix-the-mechanism; record the semantics, R18-faithful).

---

## Priority table (disposition at a glance)

| # | Item | Root cause (one line) | Risk | Disposition |
|---|---|---|---|---|
| 1 | Reflect completion drift | A1 schema drift; **clean post-fix** across all 4 completion writes | code-standard | **DONE** — drift-guard test landed |
| 2 | Loop-closure continuation | **Broken by construction** — ADR-008 internal contradiction + trigger never threaded to engine | **Critical** | **Design A elected** → build+walk (follow-up Critical session; couples #6a) |
| 3a | Guardrail model-reporting | Envelope hardcodes Haiku; elevated/critical run Sonnet → `meta.ai_model` lies | code-elevated | **Folded into #3 guardrail session** (founder: not stand-alone) |
| 3b/c | Guardrail latency + determinism | Sonnet 8192-tok single call (~90s); unsigned non-deterministic `sage-guard` | Critical | **Separate Critical session** (port to signed sandwich; incl. #3a) |
| 4 | Public-contract self-sufficiency | 3/5 load-bearing shapes absent from all public docs; no worked examples | R18 / code-standard | **DONE (staged) + SDK follow-up** — `public-contract-docs-staged.md` |
| 5 | `l1_supply` reuse semantics | Reusing a prior extraction makes L2 echo the prior situation | R18 / governance | **DONE (staged)** — staged docs §5 |
| 6a | Chain-close semantics | Re-examination fires but no terminal "closed" marker ever sets | governance | **Couple with #2** (Design A session) before reject-mode 6c |
| 6b | `typical_kathekon_quality` read-back | Omitted seed field → DB `DEFAULT 'contrary'` (conservative) | — | **DONE (staged)** — not a bug; staged docs §1 |
| 6c | Guardrail facts agent-supplied | The gate is not a fact-checker (correct) | — | **DONE (staged)** — staged docs §6 |

**Founder elections (2026-06-18):** #2 → **Design A** (answer channel + suppression). #3a → **folded into the #3 guardrail session** (the whole guardrail moves at once). #4 → **Both** (docs staged this session + SDK follow-up).

---

## 1 — Reflect completion: FIXED + hardened — **DONE this session**

**Root cause (confirmed):** `persistCompletion` spreads `deriveCrossSessionScalars()` (A1/PR7) into its UPDATE, writing `complexity` + `calibration_all_correct` — two columns in **no** migration → PostgREST PGRST204 → 503 on **every** completion, **every** agent, latent because reflect-completion was never exercised in prod. Fixed 2026-06-18 by `website/supabase-sage-reflect-a1-columns-migration.sql` (founder-applied to prod; additive; no redeploy) + the CREATE in `website/supabase-sage-reflect-migration.sql:80-83`.

**Drift audit (first-hand + agent):** all four completion-path writes reconcile against migrations — `sage_reflect_sessions` (persistCompletion, 19 cols), `evaluated_actions` (evaluatedActionToRow, 13 cols), `sage_reflect_proximity_domains` (upsertProximityDomains, 7 cols), `agent_accreditation` (feedSageAssent → accreditationRecordToRow, incl. the K1 trio LIVE since M3-CI-11). **No remaining drift.**

**Fix landed:** `website/src/lib/sage-reflect/__tests__/reflect-completion-schema-drift.test.ts` — a no-env `tsx` guard that parses the **actual migration SQL** per table and asserts every column the completion row-builders **emit** exists in a migration. Stays correct as both migrations and builders evolve; would have caught the original bug. **9 pass / 0 fail**; tsc-clean; **negative-control-proven** (inject a bogus column → it FAILs naming the column + the prod impact). Covers the three reflect-owned tables (the exact 503 locus + the two the prompt asked to check). `agent_accreditation` is intentionally out of this no-env guard (its store imports `supabase-server`; it is covered by the M3/ATL suite and confirmed clean).

**Risk:** code-standard (new test, no prod/auth/perimeter touch). **Disposition: DONE.**
**Optional follow (not required):** extend the guard to `agent_accreditation` behind `--env-file`; add a periodic real open→Q1–Q6→complete smoke against the TEST project (heavier; the drift-guard is the CI-suitable permanent tripwire).

---

## 2 — Loop-closure continuation is unusable — **BROKEN BY CONSTRUCTION** — ELECTION

**Severity:** a **Live** mechanism that **no caller can use.** Every Tier-1 force-clarification fire is a dead-end: it spends a paid Layer-1 call and issues a `continuation_token` that can never be redeemed. Benchmark Call 4: ~6 calls + 26¢ wasted; the agent reached the conclusion by its own reasoning. Tier-1 *is* live in prod (the benchmark got a real token + a real `continuation_token_input_mismatch`, not a 503 — so `TRANSLATION_SANDWICH_TIER1_SECRET` is set).

**Root cause (first-hand, decisive):** two independent faults, either of which alone breaks it.

1. **ADR-008 is internally contradictory.** `/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` §1 + §34 (founder-confirmed "Option B") say the client re-submits *"the original input **augmented** with the answer"* and the engine *"restarts at Position 1 with the augmented input."* But §4.4 step 5 requires `sha256(current input) == sha256(original input)` — i.e. **byte-identical**. Augmenting changes the hash → these cannot both hold.
2. **The code faithfully implements the contradiction AND never resolves the ambiguity.** `tier1-token.ts:276-279` enforces byte-identical (`continuation_token_input_mismatch` otherwise). The validated trigger is extracted at `route.ts:1022-1023` (`previousTrigger`) but used **only for meta logging** (`route.ts:1605-1610`, `meta.previous_trigger`). It is **not** among the `runSandwich({…})` args (`route.ts:1144-1178`), so the engine re-extracts the byte-identical input with zero knowledge a clarification was answered → **the same trigger re-fires.** There is also **no request field that carries the answer** (the route reads only `input` + `continuation_token`).

→ **No input string can both pass the hash check (requires byte-identical) and resolve the trigger (requires a changed/answered input).** Every benchmark failure mode is reproduced by this: side-field answer → ignored → re-fires; answer folded into input → hash mismatch 400; answer-only as input → mismatch/empty 400.

**Fix options (this amends a founder-confirmed ADR; Critical per `tier1-token.ts` header §PR6):**

- **A — explicit answer channel + trigger suppression (recommended).** Add a typed `clarification_response` request field. Keep `input` byte-identical (preserve the strong hash binding — no token reuse across inputs). Thread `previousTrigger` + `clarification_response` into `runSandwich`; the orchestrator (i) folds the answer into the Layer-1 extraction context and (ii) **suppresses re-firing the answered trigger**. Deterministically clears the trigger; typed answer field consistent with the existing `clarification.{question_text,slot_fills}` response shape; keeps the security property; robust against the un-implemented loop-guard. *Cost: ADR-008 amendment + Critical route/engine change + the already-specced harness fixtures F7–F9 / Phases 11–12.*
- **B — prefix-augmentation (ADR-faithful).** Token additionally carries the original input's byte-length; validation checks `sha256(currentInput.slice(0,len)) == input_hash` (prefix match) and the engine restarts on the augmented input. Smallest deviation from §1's wording, but **inherits the loop-guard risk**: if the appended answer doesn't shift Layer-1 enough, the same trigger re-fires and the next token re-binds to the augmented input (ADR-008 §10.3 leaves the loop-guard unimplemented).
- **C — downgrade Tier-1 from hard-halt to advisory for agents.** Return the best-effort assessment + a `clarification_suggested` flag instead of halting. Best agent-UX (the benchmark showed agents don't want a hard wall) — **but** it touches the three-tier intake model (D13), which is arguably **methodology** (scoped OUT by the prompt → mentor-consultation gate).
- **D — won't-fix-now: stop dead-ending callers.** Make Tier-1 not issue an un-redeemable token (advisory-only, or suppress issuance) and document the limitation. Lowest effort; removes the broken path; loses force-clarification.

**Recommendation: A.** It restores the *intent* (a real answer round-trip) without the loop-guard fragility, keeps the cryptographic binding, and gives the answer a typed home. Couple with **#6a** (define what "closed" means) since the same machinery feeds the CI-4 loop-closure markers.

**Risk class: Critical** (AC-13 perimeter, PR6, AC5 — R20a must keep firing on both turns; the fix must not move token validation ahead of the distress check). **Disposition: ELECTION → build dark/flag-gated + founder-walk + adversarial review.**

---

## 3 — Guardrail latency + non-determinism

### 3a — Model-reporting bug — **BUILD + WALK** (clear honesty fix)

**Root cause (first-hand):** `buildEnvelope({ … model: 'claude-haiku-4-5-20251001' … })` at `guardrail/route.ts:306` is hardcoded, but `risk_class` elevated+critical map to `deep`/`standard` depth → `MODEL_DEEP = 'claude-sonnet-4-6'` (`sage-reason-engine.ts:393-396`, `model-config.ts:25`). So `meta.ai_model` reports **Haiku for every elevated/critical gate while it actually ran Sonnet** — exactly what the benchmark recorded (`claude-haiku-4-5` on a critical eval). The honest *cost* figure is unaffected (it's computed from `reasoningResult.meta.ai_model`, the real model — `route.ts:185,194`); only the displayed model lies.

**Fix:** one line — `model: reasoningResult.meta.ai_model` at `route.ts:306`. Confirmed safe: `buildEnvelope` uses the explicit `costUsd` override (always supplied here) and never reaches the `model`-based `estimateCostUsd` branch (`response-envelope.ts:173-178`), so the change affects **only** `meta.ai_model` (line 206). `reasoningResult.meta.ai_model` is always a truthful string on every engine return path incl. cache-hit (`sage-reason-engine.ts:509/631/699`) — no fallback needed.

**Risk:** code-elevated (meta-field honesty on a Live endpoint; no auth/verdict/perimeter/threshold touch). **R18 honesty.** Add a regression test asserting elevated/critical → `meta.ai_model` is the deep model. **Recommend folding into this session's founder-walked commit.**

### 3b/3c — ~90s latency + determinism gap — **ELECTION** (separate Critical session)

**Latency root cause (first-hand):** critical → `deep` depth → `MODEL_DEEP` (Sonnet), `maxTokens: 8192`, all 6 mechanisms, **single non-streamed call** at temp 0.2 (`sage-reason-engine.ts:396`, `561-567`). ~91–95s is Sonnet generating a near-max dense-JSON completion — output-token time, not compute-wait. **The consult-path L3 deferral does NOT help** — the guardrail's expensive output *is* the verdict; there is no separable narrative to defer.

**Determinism gap (first-hand):** the guardrail runs the older **single-LLM `sage-guard`** engine (temp 0.2, unsigned, `is_deterministic:false`, `sr_rcpt_` receipt) — unlike `/api/reason`'s signed deterministic translation-sandwich. The verdict is non-reproducible and unsigned, so it does **not** carry the verifiability a consult does.

**The opportunity:** the sandwich's **Layer-2 is a pure, no-LLM, byte-reproducible, Ed25519-signed function** that already emits `katorthoma_proximity` (`layer2-mechanisms.ts`), and the guardrail verdict is **pure ordinal-rank arithmetic** over that proximity (`meetsThreshold`/`getV3Recommendation`). Porting the guardrail onto the sandwich would (i) make the verdict **deterministic + signed** (a truthful `is_deterministic:true`, same verifiability as a consult), and (ii) **cut latency** — replace the 8192-token reasoning generation with one **bounded Layer-1 extraction** call + free deterministic L2 + verdict. *Cost: a genuine port (the sandwich is `/api/reason`-only today) + a response-shape reconciliation for guardrail-bespoke fields (`deliberation_quality`, `hasty_assent_risk`, `rollback_path`) — not a flag flip.*

**Recommendation:** land 3a now; **scope 3b/3c as its own Critical session** (the port is the real latency + determinism win and deserves its own ADR + adversarial review). Interim latency mitigations to weigh in that session: stream/early-return the verdict ahead of the prose; cap `maxTokens`; or the full sandwich port (preferred — it solves latency *and* determinism together).

---

## 4 — Public-contract self-sufficiency (the biggest adoption risk) — **ELECTION → staged docs**

**Root cause (agent audit, verifiable):** the public surfaces (`llms.txt`, `agent-card.json`, api-docs `page.tsx`, `mcp-contracts.ts`) are far from self-sufficient for the two flows that matter to an agent integrator (the `/api/reason` consult in its full M1/CI-4 form, and the accreditation write). Of five load-bearing shapes: **three are absent from every surface** (`prior_feedback {prior_loop_id, prior_depth_tier}`; the clarification-continuation contract; the `public_key_pem` field name — never stated as `public_key_pem` *or* `pem`), the **accreditation write body is auth-only** (the `provenance.signed_assessments` array the R18f gate requires is undocumented), and **`layer1_schema`** is described by its gating rules with its actual schema withheld. No worked end-to-end example exists for either flow; `/api/reason` isn't even in the api-docs `endpoints[]` table. This is why the benchmark agent read 25 source files.

**Fix options:** (i) **enrich the public docs** with worked examples + exact shapes — highest-leverage single addition is a worked **accreditation-write example** (full body `{ kind, profile, provenance: { signed_assessments: [{ assessment, signature, key_id }] } }` + the non-empty-array R18f requirement + a sample 200), which also forces publishing where `signed_assessments` come from and the `public_key_pem` field; (ii) **ship a thin client SDK** (the structural fix — encodes the shapes once); (iii) both.

**Critical caveat:** **do NOT document the clarification-continuation field until #2 is fixed** (R18 — there is nothing correct to document; publishing the broken contract is dishonest). `prior_feedback`, `layer1_schema`, the accreditation body, and `public_key_pem` **can** be documented now (they work).

**Risk:** R18 (public materials must be faithful to live behaviour — stage the additions; founder applies; nothing public changes this session). Doc additions = governance/code-standard; an SDK = code-standard/elevated. **Recommendation:** enrich docs now (stage the worked examples), defer the SDK as a follow-up. **I can draft the staged doc additions this session** for the founder to apply.

---

## 5 — `l1_supply` reuse semantics — **DOCUMENT**

**Root cause (benchmark Call 3, confirmed):** supplying a prior consult's `extraction` as `layer1_schema` correctly skips L1 (`layer1_source:supplied`, 0 ms, 0¢) **but** makes Layer-2 reason over the **prior** situation's features — so the verdict is an **echo** of the earlier framing, not a fresh diagnosis of a new sub-question. The agent correctly did not treat Call 3's `value_error` as a critique of its new question.

**Why a content-match guard is largely infeasible:** the *entire point* of `l1_supply` is to skip L1; the server cannot cheaply verify the supplied L1 "matches" the new `input` without **running L1** — which defeats the purpose. A cheap heuristic (e.g. warn if the supplied extraction's `evidence` strings don't appear in the new `input`) is possible but adds surface for marginal value.

**Fix:** **document** the intended use — *re-run the **same** situation cheaply; do not reuse a prior extraction for a genuinely new sub-question.* Optional (founder election): a lightweight advisory `meta` note whenever `layer1_source:supplied` reminding the integrator the verdict reflects the **supplied** features. **Recommendation:** document-primary; the guard is low-value. Stage the doc note with #4.

---

## 6 — Smaller observations

**6a — Chain-close semantics — ELECTION (couple with #2).** The CI-4 loop-closure DETECT gate honestly annotated the accreditation write `unclosed` (correct), but in the benchmark the chain **re-examined without ever formally "closing"** (`examination_open` stayed `true`; no terminal marker). **What makes a chain "closed" must be specified before reject-mode 6c is ever enabled** — else legitimate chains 422. This shares machinery with #2 (the continuation/loop affordance), so fold it into the #2 design.

**6b — `typical_kathekon_quality:"contrary"` read-back — DOCUMENT (not a bug).** Confirmed first-hand: the accreditation route does **not** set `typical_kathekon_quality` (zero references in the route/substrate write path); `accreditationRecordToRow` passes `record.typical_kathekon_quality`, and an omitted seed field → DB `NOT NULL DEFAULT 'contrary'`. This is correct **consumer-unforgeable** honesty (a self-seeded profile can't forge a high kathekon aggregate; the aggregate is distinct from a single consult's `kathekon:"strong"`, which is about that one consult, not the credential). Document the semantics so integrators understand the seed can't inflate it.

**6c — Guardrail facts are agent-supplied — DOCUMENT.** The gate evaluates the reasoning over the **supplied** premises; it is **not** a fact-checker (it caught/verified nothing independently in the benchmark — the agent supplied the arithmetic and the gate reflected it). Correct behaviour; document it so integrators don't over-trust the gate as a verifier.

---

## What lands this session vs what needs a founder election

**Landed (no election):**
- **#1** drift-guard test — DONE (9/0, negative-control-proven, tsc-clean).

**Ready to build + founder-walk on election:**
- **#3a** guardrail model-honesty one-liner (+ regression test) — recommend folding into this session's commit.
- **#4 / #5 / #6b / #6c** staged doc additions (R18-faithful; founder applies) — I can draft this session.

**Design elections (founder chooses → then build + founder-walk, likely separate Critical sessions):**
- **#2** continuation fix direction (A recommended) — couples #6a.
- **#3b/3c** guardrail → signed-sandwich port (recommended as its own Critical session).
- **#4** docs-enrichment-now vs thin-SDK vs both.

**Not in scope (per prompt):** the benchmark verdict (stands), Stoic-methodology change (mentor-consultation gate — note #2-C touches this), re-running the legs, the 0h launch call (founder's).

---

*End of plan. Diagnosis complete + first-hand confirmed; #1 landed; the remaining items are sequenced by the elections above.*
