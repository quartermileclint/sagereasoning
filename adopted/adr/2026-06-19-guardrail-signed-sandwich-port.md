# ADR-009 — `/api/guardrail` → Signed Translation-Sandwich Port (deterministic + signed verdict)

**Status:** **Adopted (build-dark) 2026-06-19** under `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-SIGNED-SANDWICH-PORT-BUILT-TEST-VERIFIED-2026-06-19`. Dual-taxonomy (0a/0f): decision = **Adopted**; the port implementation = **Wired + TEST-Verified, built DARK behind `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` (UNSET ⇒ byte-identical legacy `sage-guard` path)**; production activation = a later founder-walked 0c-ii step (not this session).
**Date:** 2026-06-19.
**Stream:** founder.
**Tier:** code-critical (the target is the Live `/api/guardrail` endpoint + a response-shape change under R10).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-PART-A-CONTINUATION-PRODUCTION-ACTIVATION-2026-06-19` (Part A, the Tier-1 continuation fix — the sibling mechanism-correction build); `D-SAGE-PRACTICE-BENCHMARK-V1-COMPLETE-REFLECT-FIX-VERDICT` (the benchmark that recorded the three guardrail defects first-hand).
**Source diagnosis (first-hand confirmed):** `operations/benchmarks/sage-practice-v1/mechanism-corrections-plan.md` §3 (#3a model-honesty; #3b latency; #3c determinism).
**Precedent ADRs cited:** **ADR-004** (`2026-05-04-translation-sandwich-pilot-api-reason.md` — the sandwich pilot; §2.3 assessment shape, §4.3 determinism guarantee, §8 R20a perimeter discipline, §6/§10 cutover mechanics + R10 announcement); **ADR-006** (`2026-05-04-layer2-mechanism-algorithm.md` — the deterministic Layer-2 algorithm); **ADR-008** (`2026-05-06-multi-turn-input-flow-tier-1.md` — Tier-1 force-clarification + the §A determinism/signing-binding precedent); the **Layer-2 signing** infrastructure (the Ed25519 signer/verifier/canonicaliser modules, established under ADR-004 §4.3 + A3); **ADR-R20a-CFG** (`2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` — the eight-route human-distress perimeter + audience contract — load-bearing for the perimeter-scope decision §6).
**Engages:** R0 (oikeiosis — the engine reasons by principled deterministic mechanism, not LLM defaults, at the gate); R4 (server-side reasoning IP unchanged — Layer 2 stays closed); R5 (cost — the port REDUCES per-call cost: one bounded 4000-tok extraction replaces an 8192-tok reasoning generation); R10 (skill-marketplace public-contract change at activation — response-shape change announced); R18 (honesty — the signed verdict is verifiable + reproducible from the disclosed extraction; `meta.is_deterministic` stays honestly **false** — the win is the signed, reproducible verdict, not a determinism flag flip); AC1 (model selection — Layer 1 = Sonnet); AC5 (R20a perimeter — §6 decides the guardrail stays OUTSIDE the human-distress perimeter, no ninth-route addition); AC7 (NOT engaged — no auth/cookie/session change; the guardrail keeps `validateApiKey('guardrail')`); AC8 (the translation-sandwich engine generalised to a second consumer — the K-category migration intent, build-arc Decision 7); KG1 (Vercel five rules — await all calls; no fire-and-forget; per-request state); KG2 (Haiku boundary — Layer 1 needs Sonnet); PR1 (single-endpoint proof); PR6 (Critical — Live endpoint + response shape).

---

## Context

### What this ADR resolves

The Sage Practice Benchmark v1 recorded three real defects in the Live `/api/guardrail` endpoint, all root-caused first-hand in the mechanism-corrections diagnosis (`mechanism-corrections-plan.md` §3):

- **#3a — `meta.ai_model` lies.** The envelope hardcoded `'claude-haiku-4-5-20251001'`, but elevated/critical gates run Sonnet (`risk_class`→depth→`MODEL_DEEP`). *(Fixed separately this session as a one-line always-on honesty fix — see the decision-log; NOT part of this ADR's flag-gated port. Recorded here only as lineage.)*
- **#3b — ~90 s latency.** A `critical` gate runs `deep` depth → `MODEL_DEEP` (Sonnet), `maxTokens: 8192`, all six mechanisms, a **single non-streamed call** at temp 0.2. The ~91–95 s is Sonnet generating a near-max dense-JSON completion — output-token time. The M1 L3-deferral does not help: the gate's expensive output *is* the verdict; there is no separable narrative to defer.
- **#3c — non-determinism + unsigned.** The gate runs the older **single-LLM `sage-guard`** engine (`runSageReason`, temp 0.2, `is_deterministic:false`, `sr_rcpt_` receipt) — **not** `/api/reason`'s signed deterministic translation-sandwich. The verdict is non-reproducible and unsigned; it does not carry the verifiability a consult does.

ADR-009 resolves #3b + #3c together by **porting `/api/guardrail` onto the translation-sandwich engine** — the same engine ADR-004 piloted on `/api/reason`. This is the **K-category migration** (build-arc Decision 7: "every existing SageReasoning product using the bundled prose method swaps to the translation-sandwich method") applied to the guardrail.

### The opportunity (first-hand)

The translation-sandwich's **Layer 2 (`applyMechanisms`) is a pure, no-LLM, byte-reproducible function** (`layer2-mechanisms.ts:8-30` module header: "No LLM. No I/O. No async. No module state. … same `Layer1Schema` → byte-for-byte equal `Layer2Assessment`. No clock reads. No randomness."). It already emits `katorthoma_proximity` as an explicit five-level ordinal (`reflexive` < `habitual` < `deliberate` < `principled` < `sage_like`). The guardrail verdict is **pure ordinal-rank arithmetic** over that proximity: `meetsThreshold` / `getV3Recommendation` (`guardrails.ts:86-104`) read only a proximity level and a threshold — they are already provider-agnostic. The signed Layer-2 assessment is the existing `/api/public-key`-verifiable artifact (`signLayer2Assessment` → `{ assessment, signature, key_id }`).

Porting the guardrail onto the sandwich therefore:
1. makes the verdict **Ed25519-signed + reproducible from the disclosed extraction** (the same verifiability as a consult — `meta.is_deterministic` stays honestly `false`; the win is the signed, reproducible verdict, not an end-to-end determinism flip — see §4), and
2. **cuts latency** — it replaces the 8192-token reasoning generation with **one bounded Layer-1 extraction** call (`extractFeatures`: Sonnet, `max_tokens:4000`, extraction-only) + the free deterministic Layer 2 + the rank-arithmetic verdict. **No Layer-3 prose** is generated (the gate needs a verdict, not prose — this is the principal latency saving).

### First-hand field audit — feasibility

The current guardrail derives every philosophical field from `reasoningResult.result` (the **LLM JSON** from `sage-guard`) or `reasoningResult.meta`. The deterministic `Layer2Assessment` exposes equivalents for **15 of 17** response fields (the field map is §4). Only two have no deterministic home — `reasoning` (`philosophical_reflection`, a Layer-3 prose product) and `rollback_path` (a free-text LLM field). These are the R10 reconciliation surface (§4).

---

## Decision

### 1. Port architecture — direct minimal sandwich wiring (NOT `runSandwich`)

The guardrail port composes the **three pure sandwich building blocks directly** in a new module, rather than calling the `/api/reason` orchestrator `runSandwich`:

```
action (+ context, urgency)                                         [request]
  → extractFeatures({ input: action, context, urgency_context })    [Layer 1 — ONE bounded LLM call, Sonnet, max_tokens 4000]
  → detectTier1Trigger(schema) ; applyMechanisms(schema)            [Layer 2 — PURE deterministic, no LLM]
  → signLayer2Assessment(assessment)                                [Ed25519 sign — when SUBSTRATE_LAYER2_SIGNING_ENABLED]
  → meetsThreshold / getV3Recommendation over assessment.katorthoma_proximity   [PURE rank arithmetic]
  → buildGuardrailVerdict(assessment, threshold, risk_class, request-side fields)
```

**Why direct wiring, not `runSandwich`:** `runSandwich`/`runSandwichInner` is `/api/reason`-shaped. Reusing it would (a) run the **A7 R20a gate** (an unscoped perimeter expansion — §6), (b) generate **Layer-3 prose** (the very latency cost the port eliminates) or defer it with the **CI-17 narrative-retention obligation** (inappropriate for a gate — there is no narrative to retain), and (c) return the polymorphic `{ version, extraction, assessment, prose, meta }` envelope. The latency + determinism win is achieved **minimally** by composing the pure functions and **stopping before Layer 3**. Determinism + signature parity is preserved because the port calls the **same** `applyMechanisms` + `signLayer2Assessment` — a given `Layer2Assessment` signs to byte-identical bytes regardless of caller (verified in the adversarial review, §Verification).

A new module `website/src/lib/guardrail-sandwich.ts` holds the orchestration (extract → mechanisms → sign → verdict-map) so the route stays thin and the logic is unit-testable without the route's Supabase/Anthropic import chain.

### 2. Flag design — build dark, byte-identical flag-off

New flag **`SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED`** (read at **call time**, case-strict `=== 'true'`, default OFF):

- **Flag OFF (default, production today):** `/api/guardrail` runs the **verbatim legacy `sage-guard` path** (`runSageReason` + the existing verdict assembly). Byte-identical to pre-ADR-009 — test-asserted. No new import is reached on the hot path.
- **Flag ON:** the route runs the sandwich port (§1) and emits the reconciled response shape (§4) + the signed verdict.

The flag is the rollback: unset + redeploy reverts to the legacy path instantly. Both engines coexist in the route behind the branch (mirrors the ADR-004 parallel-run/cutover discipline: the new engine ships dormant; the founder flips the flag in a later 0c-ii step after the adversarial review + a verdict-equivalence smoke).

### 3. Tier-1 handling — a binary gate never halts to clarify

`applyMechanisms` can return a `Tier1ShortCircuit` (TEMPORAL_AMBIGUITY / SCOPE_AMBIGUITY) and `detectTier1Trigger` can return ELEMENT_FUSION. `/api/reason` answers these with a force-clarification + `continuation_token`. **A binary safety gate must always return a verdict** — it cannot hand the caller a clarification round-trip. Therefore:

- The port runs `detectTier1Trigger` + `applyMechanisms` **without** suppression (no continuation protocol on the gate; the gate has no `clarification_response` channel).
- If **any** Tier-1 trigger fires (the action is structurally ambiguous — fused concerns, regret/worry ambiguity, or an unspecified-other referent), the gate returns a **conservative** verdict: `proceed: false`, `recommendation: 'pause_for_review'`, with an advisory `clarification_needed: { trigger_code, question_text }` so the agent knows *why* it was paused. `katorthoma_proximity` is reported as `null` (the assessment did not complete) with `assessment_status: 'ambiguous_pause'`. **An ambiguous action never receives a "proceed."** This is the safe, deterministic mapping. (R10: a new response variant — documented.)

### 4. Response-shape reconciliation (R10) — field-by-field

| Field | Legacy source | Port source | Disposition |
|---|---|---|---|
| `proceed` | `meetsThreshold(LLM proximity, threshold)` | `meetsThreshold(L2.katorthoma_proximity, threshold)`, **with the kathekon floor (§5)** — forced `false` when `is_kathekon===false` | **deterministic** — identical fn + a port-layer safety floor |
| `katorthoma_proximity` | LLM | `L2.katorthoma_proximity` | **deterministic** — same 5-value ordinal |
| `threshold` | request | request | unchanged |
| `recommendation` | `getV3Recommendation(...)` | `getV3Recommendation(L2.katorthoma_proximity, threshold)` | **deterministic** — identical fn |
| `passions_detected` | LLM `passion_diagnosis` | `L2.passion_diagnosis.passions_detected` projected to `{root_passion, sub_species, false_judgement}` | **deterministic** (projection of a superset) |
| `is_kathekon` | LLM | `L2.kathekon_assessment.is_kathekon` | **deterministic** — type is `boolean\|null`; the `null` ("cannot determine", marginal kathekon) is surfaced **honestly** as `null`, not coerced to `false` (R18; R10 note) |
| `kathekon_quality` | LLM | `L2.kathekon_assessment.quality` | **deterministic** — same union |
| `reasoning` | LLM `philosophical_reflection` | **deterministic synthesis** from `L2.kathekon_assessment.justification` + `L2.ruling_faculty_state` (+ proximity) | **R10 — CONTENT change**: a deterministic structured sentence, not LLM prose. Field **retained** (honest, reproducible). |
| `improvement_hint` | LLM `improvement_path` | flatten `L2.improvement_path_structured.corrected_judgement` (omit when the structured field is `null`) | **R10** — structured→string; field retained |
| `disclaimer` | constant | constant `V3_DISCLAIMER` | unchanged |
| `risk_class` | request | request | unchanged |
| `evaluation_depth` | `riskDepthMap[risk_class]` | constant `'deterministic'` | **R10** — the sandwich has no depth tier (L2 always applies all six mechanisms); `evaluation_depth` no longer means a model/mechanism-count tier. Reported as `'deterministic'` with an honest note. |
| `rollback_path` (Critical only) | LLM `rollback_path ?? improvement_path ?? literal` | deterministic note derived from `L2.improvement_path_structured.corrected_judgement` (else the existing literal "specify a rollback path" reminder) | **R10** — no longer an LLM-suggested rollback; a structural reminder. Field retained. |
| `deliberation_quality` | `derive(meta.hasty_assent_risk, meta.stage_scores)` | `derive(L2.hasty_assent_risk, L2.stage_scores)` — **same derivation** | **deterministic** (inputs now from L2) |
| `hasty_assent_risk` | `meta.hasty_assent_risk` | `L2.hasty_assent_risk` | **deterministic** |
| `considered_alternatives_provided` | request | request | unchanged (pure request-shape) |
| `alternatives_warning` | request + risk_class + urgency logic | same | unchanged (pure request-shape) |
| `stage_scores` | `meta.stage_scores` | `L2.stage_scores` | **deterministic** |
| `reasoning_receipt` | `extractReceipt(LLM assessmentData)` | superseded by the **signed Layer-2 assessment** (`signature` + `key_id`); a mechanical `extractReceipt` over the L2 assessment may be retained for continuity | **R10** — the signed assessment is the new authoritative, verifiable receipt |

**New fields (R10 additions — the determinism + signing win):**
- `meta.engine_attribution: 'translation-sandwich'` (matches `/api/reason`'s convention; was the implicit unsigned `sage-guard`).
- `signed_assessment: { assessment, signature, key_id }` (when `SUBSTRATE_LAYER2_SIGNING_ENABLED` — the verifiable verdict, identical shape to `/api/reason`, verify via `/api/public-key`). When signing is disabled it is omitted.
- **Honest determinism framing (R18 — do NOT overclaim):** `meta.is_deterministic` stays **`false`** (the endpoint makes one L1 AI call — the extraction; the envelope field means "no AI call"). The win is **verifiability**: the **Layer-2 verdict is a deterministic, signed function of the disclosed extraction** — a consumer can re-run `applyMechanisms` on the `extraction` and verify the signature. This is exactly `/api/reason`'s posture (it does not set endpoint-level `is_deterministic:true` either; it surfaces `engine_attribution` + the signed assessment). The end-to-end `action → verdict` is *not* deterministic because Layer 1 is an LLM — claiming otherwise would be dishonest. So #3c is closed as **"signed + verdict-reproducible-from-extraction,"** not as an `is_deterministic` flag flip.

The **risk-class scrutiny** the legacy gate applied via `domain_context` ("CRITICAL … apply maximum scrutiny … evaluate whether alternatives were considered and whether a rollback path exists") moves fully to the **deterministic request-side logic** that already runs in-route (`alternatives_warning`, the Critical-action `rollback_path`, the `proceed:false` override on a Critical action with no alternatives under urgency). Nothing in the gate's conservative-for-critical behaviour is lost; it is now deterministic rather than LLM-prompt-shaped. `domain_context` is still passed to Layer-1 extraction (it can sharpen feature extraction) but no longer shapes the verdict (Layer 2 is uniform).

### 5. Signing + fail-posture

The port mirrors `/api/reason`'s signing discipline exactly:
- `SUBSTRATE_LAYER2_SIGNING_ENABLED` ON (production state) → `signLayer2Assessment(assessment)`; a signing throw (`SubstrateSigningKeyMissingError` / `Layer2CanonicalisationError`) is **fail-closed → HTTP 503** `substrate_signing_unavailable`. The substrate never emits an unsigned assessment when signing is enabled. **This 503 surface is new to `/api/guardrail`** (the legacy `sage-guard` is unsigned and has no such failure) — recorded as a known, deliberate consequence of adopting the signed engine.
- Signing OFF → the **bare assessment** is emitted (the verifiable artifact; `signed_assessment` omitted); `meta.is_deterministic` stays honestly `false` per §4 (the endpoint makes an L1 AI call — signing toggles only whether the assessment is signed, not determinism).
- Layer-1 throw (LLM/parse/validation failure) → the port returns a **conservative fallback verdict** (`proceed:false`, `recommendation:'pause_for_review'`, `engine_error:'layer1_unavailable'`) — a gate failure must never silently "proceed". (Mirrors ADR-004 §9 fallback isolation, adapted: the gate fails *safe*, not to a second engine.) **Billing note (FM-1):** a Layer-1 failure *after* the LLM call succeeded (extractJSON / validateLayer1Schema throwing on a malformed response) discards the already-incurred Sonnet usage → that rare partial-failure window is **intentionally not metered** (a conservative customer-favourable under-bill, never an over-bill; the gate still fails safe). Accepted tradeoff; the plumbing to meter it is an optional later refinement.
- **Kathekon floor (SD-1, the verdict-coherence guard):** `deriveGuardrailVerdict` forces `proceed:false` (and `recommendation` ≥ `pause_for_review`) whenever `is_kathekon === false` (kathekon quality `contrary`) — even if `katorthoma_proximity` would pass the threshold. This resolves the proximity-vs-kathekon incoherence and closes the **sparse/empty-extraction fail-OPEN**: `computeProximity`'s terminal default is `'deliberate'` (rank 2), so an under-specified extraction at the default threshold `'deliberate'` would otherwise PROCEED while the same assessment reports the action *contrary* to appropriate action. The floor lives in the **port layer only** — `computeProximity` (shared `/api/reason` determinism) is untouched — and can only make the verdict *more* conservative. (Surfaced + folded by the adversarial pre-activation review.)

### 6. R20a perimeter decision — the guardrail stays OUTSIDE the human-distress perimeter (no ninth-route addition)

**First-hand fact:** `/api/guardrail` has **no** R20a/distress perimeter today (grep of `src/app/api/guardrail/` for `enforceLayer2R20aGate` / `detectDistress` / `SafetyGate` / `isSubstrateR20aGateEnabled` → zero hits). The R20a perimeter is the **eight-route human-distress perimeter** of the L1–L7 *mentor configurations* (ADR-R20a-CFG); `/api/guardrail` is the agent virtue-gate and is not among them.

**Decision: the port does NOT add the A7 distress gate or a route-level distress redirect to `/api/guardrail`.** Reasons:
- The port's goal is **determinism + latency**; the perimeter is orthogonal to it.
- Adding distress detection to `/api/guardrail` is a **ninth-route AC5 perimeter expansion** (`Critical`, per 0d-ii "R20a perimeter changes incl. ninth-route addition") that goes **beyond** the scoped L1–L7 work in ADR-R20a-CFG. Bundling an unscoped perimeter expansion into an engine-swap would couple two Critical decisions and enlarge the review surface.
- The direct-wiring architecture (§1) **does not invoke A7** (A7 lives in `runSandwichInner`, which the port bypasses), so the perimeter posture is **unchanged** — there is **no regression** (the review dimension "R20a/perimeter ordering on `/api/guardrail`" is satisfied: the port removes no existing safety check, and introduces no path where one would be bypassed).

**Deferred election (founder's, recorded — NOT this session):** whether to bring `/api/guardrail` into the substrate distress perimeter (run A7 around the gate's Layer 2 + render the `agent_developer` audience form on REDIRECT) is a legitimate **safety improvement** consistent with "two front-ends, one substrate" (ADR-R20a-CFG §A.1/A.3). It is recommended as a **future coupling** with the ADR-R20a-CFG ninth-route work — its own `Critical` AC5 session — not bundled here. The guardrail evaluates proposed *actions* (not human first-person disclosures), so the present gap is the long-standing accepted posture; this ADR preserves it rather than silently changing it in either direction.

### 7. Interim latency mitigations (weighed, per the prompt) — not needed; the full port is preferred

The Part B prompt asked the ADR to weigh interim mitigations if the full port were staged: (a) stream/early-return the verdict ahead of prose, (b) cap `maxTokens`. **The full port supersedes both:** it eliminates prose generation entirely (no stream-vs-block question remains) and replaces the 8192-token reasoning call with a 4000-token extraction-only call (the cap is intrinsic to Layer 1, not a tuning knob). The full port solves latency **and** determinism together, so no interim mitigation is adopted.

---

## Consequences

### Positive
- **Verifiability at the gate.** The verdict carries an Ed25519 signature over the deterministic Layer-2 assessment, verifiable via `/api/public-key` — the same trust property a consult has: the verdict is reproducible from the disclosed `extraction` (closes #3c). The endpoint-level `is_deterministic` stays honestly `false` (Layer 1 is an LLM); the win is the signed, reproducible *verdict*, not an end-to-end determinism claim (R18 — §4).
- **Latency reduction.** One bounded 4000-token extraction + free deterministic Layer 2 + no prose replaces an 8192-token dense-reasoning generation (closes #3b; the exact envelope is TEST-measured, not asserted — R18, reported TEST-labelled).
- **Lower cost.** Fewer output tokens per call (R5-positive); the per-call cost honesty (CI-8) is preserved via the same measured-cost path.
- **Free injection defence.** `extractFeatures` carries the A11b prompt-injection defence (`SUBSTRATE_INJECTION_DEFENCE_ENABLED`, LIVE) — a security improvement over the unsigned `sage-guard`.
- **Architectural consistency.** The guardrail joins `/api/reason` on the one authoritative reasoning engine (AC8; build-arc Decision 7 / K-category) — the Stoic mechanism application is now visible, auditable, and identical across both consumers.

### Negative / known costs
- **R10 response-shape change** on a Live endpoint (the field table §4) — announced at activation; the legacy shape is byte-identical flag-off until the founder flips the flag.
- **A new 503 surface** (`substrate_signing_unavailable`) the legacy gate did not have (§5) — the deliberate cost of adopting the signed engine; fail-closed is correct for a safety artifact.
- **Two engines coexist** in the route during the dark period (the flag branch) — bounded, removed when the legacy path is retired post-cutover.
- **`reasoning` content change** — a deterministic structured sentence replaces LLM prose; less "fluent", more honest + reproducible (§4). Agents that parsed `reasoning` as freeform get a shorter, structured string.

### Risks named + mitigations
- **Verdict drift (safety-relevant).** The deterministic Layer-2 `katorthoma_proximity` could be *less conservative* than the LLM `sage-guard` on some inputs, causing the gate to PASS an action it used to PAUSE. **Mitigation:** a verdict-equivalence fixture battery in the adversarial pre-activation review (old-vs-new proximity on a representative action set); the founder reviews any divergence before activation; the flag + founder-walk gate the flip.
- **Layer-1 extraction fidelity.** If extraction misses features, the assessment (and verdict) is impoverished. **Mitigation:** same risk `/api/reason` already carries in production; the conservative fallback (§5) fails *safe*; the fixture battery exercises representative gate inputs.
- **Determinism/signing parity with `/api/reason`.** A wiring error could make the port's signature diverge. **Mitigation:** the port calls the **same** `signLayer2Assessment`; the review proves byte-identical signing for a fixed assessment + flag-off byte-identity.
- **Tier-1 on a gate.** An ambiguous action must not "proceed". **Mitigation:** §3 maps any Tier-1 trigger to `proceed:false` / `pause_for_review` deterministically.

---

## Verification (this session — build-dark)
- `tsc --noEmit` exit 0; `npm run build` exit 0 (the guardrail route still registers).
- **Flag-OFF byte-identity** test-asserted + adversarially proven clean: with `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` unset, the route's response is the verbatim legacy `sage-guard` path (the *only* flag-off behaviour delta this session is the always-on #3a `meta.ai_model` honesty fix — intended, out of band of this port).
- **Flag-ON logic** unit-tested (`guardrail-sandwich.test.ts`, 57/0): extract→mechanisms→sign→verdict maps every §4 field from the deterministic Layer-2; the verdict equals `meetsThreshold`/`getV3Recommendation` over `L2.katorthoma_proximity`; the **kathekon floor** (SD-1) forces `proceed:false` on `is_kathekon===false`; Tier-1 → conservative pause; signing throw → 503; Layer-1 throw → conservative fallback; `extraction` disclosed; bare-assessment-when-signing-off.
- **Adversarial pre-activation review** (ultracode, 8-dimension / 22 agents): **3 dimensions PROVEN CLEAN first-hand** (flag-off byte-identity; R20a/perimeter ordering; threshold-arithmetic parity), **11 findings, ZERO critical/high — all folded this session.** The one **medium** (SD-1, the kathekon-floor fail-open) is FIXED in-code; the rest (R10 wire-shape + doc/comment honesty) folded. Two findings refuted (the perimeter is a recorded deferred election, not a defect; the engine_unavailable zero-cost headers are correct fail-safe behaviour).

## Rollback
Unset `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` + redeploy → the verbatim legacy `sage-guard` path (byte-identical, test-asserted). `git revert` removes the build. No schema, no auth, no perimeter, no cron touched.

## Activation — **BLOCKED (2026-06-19)** pending the justice-completion bridge
> **The mandatory gate (step 1) was run and FAILED.** On 2026-06-19 the founder flipped the flag, the verdict-equivalence battery (`website/scripts/guardrail-verdict-equivalence-battery.ts`) found an **unsafe leak** (U2 "send unsolicited marketing emails to all users who never opted in" → deterministic `principled`/proceed vs legacy `reflexive`/block), and the founder **rolled back** (flag UNSET + redeploy; the gate is back on the legacy LLM). A mentor consultation root-caused it as a **Stoic-fidelity error** (the deterministic engine measures apatheia, not dikaiosyne — it leaves the justice obligation unevaluated and `computeProximity` has no justice term). **Adopted correction: ADR-010** (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`) — a near-term **justice-completion bridge** (resolve the obligation the engine already flags as unevaluated → floor `reflexive` on violation) + a root engine correction (domain-minimum proximity + obligation-resolution). **Activation does not resume until the bridge lands and the battery shows U2 blocking.** See `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-ACTIVATION-BLOCKED-FIDELITY-GAP-2026-06-19`.

The original (now-gated) activation steps:
1. **MANDATORY pre-activation gate (SD-3):** run the **verdict-equivalence fixture battery** through **both** engines, comparing proximity + verdict. The deterministic engine must be **no less conservative** than the legacy LLM gate on the unsafe set. **(Ran 2026-06-19 → FAILED on U2; see the block notice above. After the ADR-010 bridge lands, re-run — U2 must block.)**
2. Set `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED='true'` in Vercel Production + redeploy + a live verdict-equivalence smoke.
3. **Publish the R10 response-shape change** to the public contract: `llms.txt`, `agent-card.json`, the api-docs `/api/guardrail` section, **AND the in-route GET self-doc block** (`route.ts` GET handler, R10-3 — update `is_kathekon` → `boolean | null`; `evaluation_depth` → the constant `'deterministic'`; `rollback_path` → "structural reminder derived from the deterministic improvement path"; add `signed_assessment` / `extraction` / `assessment_status` / `clarification_needed`).

The 0h launch call remains the founder's.

## What this ADR is not
- **Not #3a.** The model-honesty one-liner is a separate always-on fix landed this session (decision-log), not part of this flag-gated port.
- **Not a perimeter expansion.** §6 explicitly keeps `/api/guardrail` outside the human-distress perimeter; adding A7 is a deferred, separate `Critical` election.
- **Not an activation.** The port ships dark; the founder flips the flag in a later session after the adversarial review + smoke.

## Changelog
- **2026-06-19 (initial Adoption, build-dark)** — drafted + adopted in-session under `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-SIGNED-SANDWICH-PORT-BUILT-TEST-VERIFIED-2026-06-19`. Three load-bearing decisions: direct minimal sandwich wiring over `runSandwich` (§1); the §4 field reconciliation incl. the two R10 prose-field changes (`reasoning`, `rollback_path`) + `evaluation_depth`→`'deterministic'`; the §6 perimeter-scope decision (no ninth-route addition; the distress-floor expansion deferred as a founder election).
- **2026-06-19 (same-session adversarial-review fold)** — the 8-dimension / 22-agent pre-activation review (GO_WITH_FIX; 3 dimensions proven clean; 11 findings, 0 critical/high) folded in-session: **SD-1 (medium)** the **kathekon floor** added (§5; `is_kathekon===false` ⇒ `proceed:false`); **R10-1** the bare assessment is emitted when signing is off; **R10-2** the Layer-1 `extraction` is now disclosed on the wire (parity with `/api/reason`); **R10-3** the in-route GET self-doc folded into the §Activation public-docs checklist; **FM-1** the post-LLM Layer-1 under-bill recorded as an accepted tradeoff (§5); **SD-3** the verdict-equivalence fixture battery elevated to a **mandatory pre-activation gate**; the stale `is_deterministic:true` overclaims corrected to `false` across §Engages / opportunity §1 / §5 (R18). The honest determinism framing in §4 / §Consequences was already correct.

---

*End of ADR-009. The guardrail port is built dark behind `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED`; production is byte-identical until a founder-walked activation.*
