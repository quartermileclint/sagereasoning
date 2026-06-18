# Next-Session Prompt — Sage Practice mechanism corrections (FOLLOW-UP: the elected builds)

**Stream:** founder. **Tier:** **code-critical** (Parts A + B touch Live endpoints `/api/reason` + `/api/guardrail`). Full Critical Change Protocol; every prod step founder-walked (PR17).
**Governing frame:** `/adopted/standing-protocol-cache.md`. **Model:** per AC1.
**Predecessor close:** `operations/handoffs/founder/2026-06-18-sage-practice-mechanism-corrections-close.md`.
**Diagnosis + dispositions:** `operations/benchmarks/sage-practice-v1/mechanism-corrections-plan.md` (root causes first-hand confirmed; elections recorded).

## How to use this prompt
The 2026-06-18 diagnosis session root-caused every Sage Practice mechanism item, **landed #1** (the reflect drift-guard test), and **staged the #4/#5/#6 docs**. What remains are **three independent elected builds**. **Elect ONE at session open** (Rule B — founder elects scope at open; the session works without mid-session decisions). Each is scoped to start cold below.

---

## Part A — Loop-closure continuation fix (#2 + #6a) — **Critical; founder elected Design A**

**Why:** the Tier-1 force-clarification continuation is **broken by construction** — no caller can close a Tier-1 clarification (the benchmark wasted ~6 calls + 26¢ and could not). Live in prod. Root cause (first-hand): ADR-008 §1/§34 ("re-submit input *augmented* with the answer") contradicts §4.4-step-5 (hash must match the *original* input byte-for-byte); the code (`tier1-token.ts:276-279`) enforces byte-identical, and the validated trigger is used **only** for `meta.previous_trigger` (`route.ts:1605-1610`) — never threaded into `runSandwich` (`route.ts:1144-1178`), so the same trigger re-fires.

**Elected fix — Design A (answer channel + trigger suppression):**
1. **Amend ADR-008** (`/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md`) to resolve the §1-vs-§4.4-step-5 contradiction in favour of: `input` stays byte-identical (hash binding preserved — no token reuse across inputs); a **new typed request field `clarification_response`** carries the answer; the engine **suppresses re-firing the answered trigger** and folds the answer into the Layer-1 extraction context.
2. **Route** (`route.ts`): read `clarification_response`; on a validated `continuation_token`, pass `previousTrigger` + `clarification_response` into `runSandwich({…})`. Preserve order-of-operations (R20a distress check stays BEFORE token validation — AC5/AC4; `route.ts:938`).
3. **Engine** (`parallel-run.ts` `runSandwichInner` + the Tier-1 detection in `layer2-mechanisms.ts`): when a valid continuation for trigger X + an answer are present, **suppress** re-firing X for this turn and incorporate the answer.
4. **#6a chain-close semantics (couple here):** specify **what makes a loop-closure chain "closed"** (a terminal marker / `examination_open:false` condition) — required before the CI-4 loop-closure gate reject-mode (6c) can ever be enabled. The benchmark showed re-examination fires but the chain never formally closes.
5. **Harness:** ADR-008 already specs F7–F9 + Phases 11–12 (`§8`); add the second-turn-resume assertions (token + answer → assessment, not a re-fire).

**Risk:** **Critical** (AC-13 perimeter, PR6, AC5). Build dark / flag-gated where possible; adversarial pre-activation review; founder-walk the prod step. **Rollback:** the new field is additive (absent ⇒ today's behaviour); flag-gate the suppression.
**After it ships:** publish the clarification-continuation contract to the public docs (the staged-docs file deliberately EXCLUDED it pending this fix — R18).

---

## Part B — Guardrail latency + determinism (#3a + #3b + #3c) — **Critical; whole guardrail moves at once**

**Why:** (3a) `meta.ai_model` **lies** — the envelope hardcodes Haiku (`guardrail/route.ts:306`) while elevated/critical run Sonnet (`MODEL_DEEP`); (3b) ~90 s — critical→deep→Sonnet generating `maxTokens:8192` single-shot (`sage-reason-engine.ts:396`); (3c) the gate runs the old **unsigned, non-deterministic** `sage-guard` engine, not the signed sandwich.

**Scope:**
1. **3a (do first — clean honesty fix):** `model: reasoningResult.meta.ai_model` at `guardrail/route.ts:306` (+ a regression test asserting elevated/critical ⇒ deep model in `meta.ai_model`). Confirmed side-effect-free (`buildEnvelope` uses the explicit `costUsd`; only `meta.ai_model` changes). R18 honesty.
2. **3b/3c (the real win — ADR it):** port the guardrail onto the **deterministic signed translation-sandwich**. The sandwich's Layer-2 is a pure no-LLM byte-reproducible Ed25519-signed function that already emits `katorthoma_proximity`; the guardrail verdict is pure rank arithmetic over it (`meetsThreshold`/`getV3Recommendation`). Result: verdict becomes **deterministic + signed** (`is_deterministic:true`), and latency drops (one bounded Layer-1 extraction replaces the 8192-token reasoning generation). Reconcile the guardrail-bespoke response fields (`deliberation_quality`, `hasty_assent_risk`, `rollback_path`) — re-derive from L1/L2 or drop. The sandwich is `/api/reason`-only today, so this is a genuine port + a guardrail response-shape change (announce under R10).

**Risk:** **Critical** (Live endpoint + response-shape change). New ADR for the port; adversarial review; founder-walk. **Rollback:** flag-gate the engine swap (old `sage-guard` path retained behind the flag).

---

## Part C — Apply the staged public docs + scope the thin SDK (#4) — **R18 / code-standard**

**Why:** the public contract isn't self-sufficient (the benchmark agent read 25 source files). Founder elected **Both**.

**Scope:**
1. **Apply** `operations/benchmarks/sage-practice-v1/public-contract-docs-staged.md` to `website/public/llms.txt`, the api-docs `page.tsx`, and `agent-card.json` (§1 accreditation write body first — highest-leverage). **Re-verify each shape against its cited live path at apply time (R18).** Founder-walk the push. **Do NOT** add the clarification-continuation field until Part A ships.
2. **Scope the thin client SDK** (the structural fix): a small TS client encoding consult (incl. `assessment_first` / `layer1_schema` reuse / `prior_feedback`), signature verification (the canonical-form footgun), and the accreditation `provenance.signed_assessments` round-trip. Worked end-to-end example. Could be its own session.

**Risk:** R18 (faithful to live behaviour) + code-standard (the SDK). **Rollback:** `git revert` the docs.

---

## Not in scope (per the original prompt)
Benchmark verdict (stands), Stoic-methodology change (mentor-consultation gate — note Part-A option C would have touched it; Design A does not), re-running the legs, the **0h launch call** (the founder's — this corrections arc is the "execution" gating work the verdict named).

*Open code-critical on `main`. Elect ONE part at open. Diagnosis is done + first-hand confirmed — start from the plan + the cited file:lines.*
