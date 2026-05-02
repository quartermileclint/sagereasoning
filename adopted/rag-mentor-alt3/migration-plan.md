# Deliverable 21 — Migration Plan

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-19 (reflect-endpoint-first build order — non-negotiable; Phase-2 pass 1 builds D14b first); AC-7 (Phase-1 conversation surface scope); PR1 (single-endpoint proof discipline); PR6 (safety-critical changes are always Critical); PR2 (build-to-wire verification immediate); AC4 (invocation testing); AC5 (R20a perimeter discipline); AC7 (Session-7b standing constraint — auth/cookie/session/redirect = Critical).

**Cross-references:**
- All 22 other Phase-1 deliverables — D21 sequences Phase-2 build against them.
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — load-bearing for Phase-2 pass 1)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — Phase-2 pass 2)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — Phase-2 pass 3)
- `/drafts/rag-mentor-alt3/index-schema.md` (D5 — schema migration before any pass)
- `/drafts/rag-mentor-alt3/retrieval-interface.md` (D6 — retriever wiring per pass)
- `/drafts/rag-mentor-alt3/re-rank-design.md` (D7 — heuristic re-rank wiring)
- `/drafts/rag-mentor-alt3/strict-prompting.md` (D12 — Layer 3 prompt wiring)
- `/drafts/rag-mentor-alt3/verification.md` (D18 — verifier wiring per pass)
- `/drafts/rag-mentor-alt3/test-plan.md` (D22 — test plan that runs verification)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — Phase-3+ migration projections per route)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1–AC7, R5, R17, R20a
- `/operations/decision-log.md` D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02 (the snapshot already produced)

---

## Plain-language summary

Phase-1 ends when all 23 deliverables are approved as drafts and moved to `/adopted/rag-mentor-alt3/`. Phase 2 begins after that, building the alt-3 architecture against the design.

Per AC-19 (non-negotiable), Phase-2 pass 1 is the **deferral-resolution surface (D14b)** — building an entirely new route and page that did not exist before, alongside two new schema tables and the application-level encryption wiring. Phase-2 pass 2 is the **daily-reflection ritual surface (D14a)** — substituting the deterministic engine into the existing `/api/mentor/private/reflect` route while preserving today's visible output. Phase-2 pass 3 is the **conversation surface migration** — replacing today's `/api/founder/hub` mentor pipeline with the alt-3 engine while preserving backward-compat fields. Score-family endpoints (`/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`) are Phase 3+; they migrate per route after Phase 2 lands.

This deliverable specifies the **build sequencing in full**: per-pass build steps, rollback paths, founder verification, AC4 invocation testing, Critical Change Protocol (per PR6 + AC5 + R17 for Pass 1), and the preconditions that must be satisfied before Phase 2 begins (D-A16 catalogue promotion; the two snapshots; encryption wiring coordination). The deliverable is the load-bearing build-sequencing artefact for Phase 2.

## Glossary

- **Pass** — a discrete build stage. Phase-2 has three passes (D14b first, D14a second, conversation surface third).
- **Single-endpoint proof (PR1)** — Pass 1 must reach Verified status (per 0a) before any further alt-3 work proceeds. The architectural commitment is that the new pattern is proven on one endpoint before being rolled out across multiple.
- **Critical Change Protocol** — the protocol per project instructions 0c-ii for Critical-risk changes. Plain-language explanation; what could break; rollback plan; verification step; explicit approval.
- **Env flag (`MENTOR_RAG_V1`)** — the deployment gate for alt-3 wiring. With the flag false (default), alt-3 routes do not engage the engine; with true, they do. Rollback path: flip to false.
- **Pre-alt-3 snapshot** — documentary records of today's behaviour at named git refs. Phase-2 pass-2 verification compares observed behaviour post-substitution to the snapshot.
- **D-A16 catalogue promotion** — the focus-question-stem corpus catalogue needs promotion (per D4 Coverage Gap 1) before Phase-2 build pass 1's full operationalisation.

## Phase-2 preconditions

Before Phase 2 begins, the following must be satisfied:

### Precondition 1 — All 23 Phase-1 deliverables approved and moved to `/adopted/rag-mentor-alt3/`

Phase-1's 23 deliverables (per the alt-3 handoff §"Phase-1 Deliverables (twenty-three)"):

- Critical path: D2 (canonical framework), D3 (passion taxonomy), D8 (operationalised rules) — already moved to `/adopted/` per D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02.
- Session 2: D4 (corpus inventory), D9 (rule dependency map), D10 (Layer 1), D11 (Layer 3), D13 (three-tier intake), D14a (ritual), D14b (deferral-resolution), D15 (long-deferred questions). Status: Drafted, under founder review per D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02. Move to `/adopted/` is Elevated risk per the deliverables' approval-gate footers.
- Session 3 (this session): D1, D5, D6, D7, D12, D16, D17, D18, D19, D20, D21, D22, D23. Status: Drafting in this session.
- D24 (consumer workflow audit): reviewed.

Each move from `/drafts/` to `/adopted/` is Elevated risk and requires a separate decision-log entry.

### Precondition 2 — D-A16 catalogue promotion

Per D4 §"Coverage gaps" Gap 1 and per D14b §"Pre-build prerequisites":

- The focus-question-stem catalogue must be promoted to corpus content before Phase-2 pass 1 reaches operational completeness.
- Phase-2 pass-1 minimum requirement: stems for `EUPATHEIA_BOUNDARY` and `PRAXIS_MOTIVATION_AMBIGUITY` Tier 3 trigger codes.
- Other trigger code stems may land at later Phase-2 passes.

The catalogue assembly process is per D5 §"Step 2 — D-A16 catalogue promotion":
1. Extract current `mentor-knowledge-base.ts` question patterns and `REFLECTION_PROMPT` evening-prompt patterns.
2. Decompose each into stem with `[VARIABLE]` placeholders + `slot_fields[]` JSONB.
3. Tag with `passage_type: focus_question_stem`, `trigger_condition`, `intake_tier`, `slot_fields`.
4. Insert into `corpus_passages` with `source_file: 'focus-questions'` (or fold into `scoring.json` per founder direction).
5. Honest source citation for alt-3-derived stems.

### Precondition 3 — The two snapshots

Per D24 §"Snapshots needed":

| Snapshot | Status |
|---|---|
| `/api/mentor/private/reflect` ritual flow | ✅ **Done** — per `D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02`. Located at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`. |
| `/api/reason` engine entry point | **Deferred** — not Phase-1 blocking; can land alongside Phase-2 pass-3 planning. |

The completed snapshot serves Phase-2 pass-2 verification (D14a engine substitution against the snapshot's documented behaviour). The `/api/reason` snapshot is needed before Phase-2 pass 3 (conversation surface migration) but does not block Pass 1 or Pass 2.

### Precondition 4 — Encryption wiring coordination (P2 task 2c)

Per D14b §"R17 intimate data protection conformance":

- The application-level encryption module (per R17b) must be operational for the new `open_deferrals` and `deferral_resolutions` tables.
- P2 task 2c (per project instructions Priority 2) covers the encryption wiring — this is a Critical-risk task with its own Critical Change Protocol.
- Phase-2 pass 1 build coordinates: either P2 task 2c lands first and pass 1 builds against the wired module, OR pass 1 includes the encryption wiring as part of the Critical Change Protocol's scope.

**Recommendation:** P2 task 2c lands first. Phase-2 pass 1 builds against the wired module. This decouples the encryption wiring's Critical change from the new-route Critical change; failures in one don't compound the other.

### Precondition 5 — Founder approval of Phase-2 commencement

Phase 2 is Critical risk per PR6 + AC5 ninth-route discipline + R17 perimeter expansion. The Critical Change Protocol applies. The founder reviews the per-pass plan (this deliverable's contents) and approves the pass-1 commencement explicitly.

## Phase-2 Pass 1 — D14b deferral-resolution surface

**Risk classification:** Critical under PR6 + AC5 + R17.
**Architectural commitment:** AC-19 (this surface builds first); AC-15 (1b structured intake); AC-18 (no-shareable-artifact non-negotiable); AC-14 (deterministic withhold as kathekon).
**PR1 single-endpoint proof discipline:** this is the proof endpoint. Must reach Verified status before any further alt-3 work proceeds.

### Pass 1 Build Steps

1. **Schema migrations.** Standard-risk decision-log entry per D14b §"Schema additions" + D5 §"The `corpus_passages` table — schema". Three new tables: `open_deferrals`, `deferral_resolutions`, `corpus_passages`. RLS policies enabled per the schemas. Indexes created. Reversible via DROP TABLE (no data exists pre-build).

2. **Encryption wiring (P2 task 2c coordination).** Per Precondition 4. The `open_deferrals.encrypted_payload` and `deferral_resolutions.reflection_content` use `lib/encryption.ts`. Verifies decrypt-test against canonical seed data before flag is set true.

3. **Index population.** Phase-2 build script reads `stoic-brain-compiled.ts` constants, decomposes per D5 §"Migration shape", embeds each passage via OpenAI text-embedding-3-small, inserts into `corpus_passages`. Build cost: ~$0.001 per D20.

4. **D-A16 catalogue minimum population.** Per Precondition 2 — at minimum, EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger code stems populated.

5. **Implement the new route source.** `/website/src/app/api/mentor/private/deferral-resolve/route.ts`. Per D14b §"Server-side workflow" — 15 steps: rate limit, founder-only auth, body parse, OPEN_DEFERRAL lookup, R20a check, Layer 1 translation, engine sequencing, Tier 1/2/3 dispatch, retrospective score update, OPEN_DEFERRAL closure, response build (AC-18 minimal), persistence, self-improving feedback loop, pattern-engine pass, response return.

6. **Implement the new page route.** `/website/src/app/private-mentor/deferred-questions/page.tsx` (or founder-approved name). Per D14b §"Practitioner-facing surface" — list view + resolution view. AC-18 explicit (no proximity, no perspective, no celebratory artefact).

7. **Implement engine integration.** Layer 1 + Engine (Rules 1–10 per D9) + Layer 3 Table 4b NULL projection per D11/D12.

8. **Add R20a perimeter ninth route.** Per AC5 ninth-route discipline:
   - Registry entry in `r20a-invocation-guard.test.ts`.
   - Import `detectDistressTwoStage` and `enforceDistressCheck` in route source.
   - Call pattern: `await enforceDistressCheck(detectDistressTwoStage(reflection_content))`.
   - Passing AC4 invocation test.

9. **Wire verifier into CI.** Per D18 — narrative trace verification + score consistency verification on canonical test inputs (D22). Both verdicts must `pass` before merge.

10. **Add env flag `MENTOR_RAG_V1=true`.** Per AC-19 the env flag is the single deployment gate. With the flag false (default), the new route exists but does not produce engine-driven output (the page is removed from navigation; the route is gated off behind a feature-flag check).

11. **Critical Change Protocol responses.** Per D14b §"Critical Change Protocol":
   - **What is changing — plain language.** New endpoint, new page, two new schema tables, R20a perimeter expanding from 8 to 9 routes.
   - **What could break.** R20a miswire (caught by AC4 invocation test); encryption miswire (caught by decrypt-test); engine produces unexpected output (Tier 1 halts, Tier 3 re-cascades — handled per D14b workflow); retrospective score update miswires (KG3 verification); schema migrations reversible via DROP TABLE.
   - **Existing sessions.** None — additive change.
   - **Rollback plan.** Flip `MENTOR_RAG_V1=false`; the new route remains in code but doesn't engage. If schema needs revert: `DROP TABLE deferral_resolutions; DROP TABLE open_deferrals; DROP TABLE corpus_passages;`.
   - **Verification step.** D14b §"Founder-performable verification protocol" (8 verifications). All must pass.
   - **Explicit approval.** Founder approves before deployment.

### Pass 1 Founder Verification

Per D14b §"Founder-performable verification protocol" — 8 verifications:

1. Schema migrations applied (table + index + RLS check via SQL).
2. Engine produces an OPEN_DEFERRAL on a test scenario (EUPATHEIA_BOUNDARY narrative submitted).
3. Deferral-resolve route accepts a resolution and closes the flag (full round-trip test).
4. AC-18 holds end-to-end (page renders only acknowledgement; response carries NULL visible_*).
5. R20a distress redirection works on the new route (Zone 3 input fires redirect; no resolution data persists; flag remains open).
6. Tier 1 force trigger surfaces correctly (REFLECTION_NARRATIVE_THIN test).
7. Tier 3 re-cascade works (engine produces new OPEN_DEFERRAL on reflection itself).
8. RLS enforcement (cross-user read attempt blocked).

**Pass 1 does NOT progress to Pass 2 until all 8 verifications pass.** Per PR1.

### Pass 1 Rollback Path

- **If verification fails on a specific test:** the route is left in code with `MENTOR_RAG_V1=false`; founder receives a debrief explaining the failure mode; build investigates and re-attempts.
- **If R20a or encryption miswire is detected:** revert the deployment immediately (flip env flag). Schema migrations remain (reversible); the route is not engaged.
- **If a Critical-risk failure surfaces post-deployment** (e.g., RLS bypass, encryption defect): deploy-time rollback per the protocol (env flag false; schema DROP if needed); decision-log entry; debrief; re-attempt.

The rollback path is named explicitly per the Critical Change Protocol.

## Phase-2 Pass 2 — D14a daily-reflection ritual surface

**Risk classification:** Critical under PR6 (R20a perimeter Route 8).
**Architectural commitment:** AC-12 (translation-sandwich); D2 Table 4a (Option 1 — visible output preserved).
**Precondition:** Pass 1 reaches Verified status.

### Pass 2 Build Steps

Per D14a §"Phase-2 build steps for D14a":

1. **Snapshot already exists** — per Precondition 3.
2. **Implement Layer 1 + engine + Layer 3 Table 4a projection.** Engine implementation is shared with Pass 1; this step's specific output is Layer 3's Table 4a projection (vs Pass 1's Table 4b NULL projection).
3. **Add env flag check.** With `MENTOR_RAG_V1=false` (default), the route falls back to today's `REFLECTION_PROMPT` direct-call path (today's behaviour preserved). With true, the engine path runs.
4. **Verify engine substitution against snapshot.** Side-by-side test with both flag values: false → today's behaviour reproduced; true → engine path produces equivalent visible output. Layer 3 prose may differ in wording; structural fields (proximity, passions, what_you_did_well, sage_perspective, evening_prompt) are present in both with same semantic content.
5. **Move the surface to its own page** — if founder calls own-page per D14a §"Surface design — own page or embedded view". Page-side flow becomes the new page; `/private-mentor`'s MorningView/EveningView are removed (or kept as deprecated aliases for transition).
6. **Add `ritual_type` parameter.** Body schema addition with backward-compat fallback to `how_i_responded` presence.
7. **Surface `mentor_observation`** if founder calls visible per D14a's open question.
8. **Add D24 audit finding fixes** (founder calls separately): `/api/reflect`'s fire-and-forget analytics inserts await pattern fixes are out-of-scope for D14a but logged as separate triage.

### Pass 2 Founder Verification

Per D14a §"Founder-performable verification specification" — 6 verifications:

1. Visible output preserved (engine path produces same shape as REFLECTION_PROMPT path).
2. Persistence pipeline preserved (reflections insert; KG7 verification — passions_detected[] is array not string).
3. Profile feedback loop preserved (passion map updates from new reflection).
4. Pattern-engine pass preserved (per ADR-PE-01 cache hit / cache miss branches fire correctly).
5. R20a distress detection preserved (canonical Zone 3 inputs fire redirect; analytics_events row persists).
6. Tier 1 force trigger surfacing (REFLECTION_NARRATIVE_THIN fires; engine restarts post-clarification).

### Pass 2 Rollback Path

- **If verification fails:** flip `MENTOR_RAG_V1=false`. Today's REFLECTION_PROMPT path preserved.
- **If schema migration for `ritual_type` and `engine_diagnostics` columns surfaces issues:** drop the columns (reversible).
- **Rollback target:** today's `/api/mentor/private/reflect` ritual flow per the snapshot at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`.

## Phase-2 Pass 3 — Conversation surface migration

**Risk classification:** Critical under PR6 (R20a perimeter Route 6 / `/api/reason` for the founder-hub backend; perimeter Route via founder-hub for the conversation flow).
**Architectural commitment:** AC-7 (conversation surface scope); AC-9 (score-in-reply); AC-11 (proximity ring data contract wired in Phase 1; UI render in Phase 2); D2 Tables 1+2.
**Precondition:** Pass 2 reaches Verified status. **`/api/reason` snapshot completed.**

### Pass 3 Build Steps

1. **`/api/reason` snapshot.** Documentary baseline of today's behaviour at git ref. Per D24 audit recommendation. Captures: dual-auth pattern, three-depth shape, the four-layer context architecture per AC6, the existing engine entry point's behaviour. Lives at `/archive/<date>_api-reason_pre-alt-3-snapshot.md`.

2. **Implement conversation-surface engine substitution.** The conversation route (`/api/founder/hub` for the founder; future split for the broader practitioner audience) substitutes the deterministic engine for today's mentor pipeline.

3. **Implement Layer 3 Table 1+2 projection.** Per D11 / D12 / D16 — the conversation surface's full structured score fields + narrative prose.

4. **Wire the proximity ring data contract.** Per AC-11 + D16 — the response envelope carries `proximity_ring_data` per D16's contract. UI render is Phase-2 pass 4 (or post-launch).

5. **Backward-compat aliases.** Per D16 §"Pre-migration vs post-migration" — preserve `reply`, `recommended_action`, `observation` aliases for existing consumers; new fields are additive.

6. **Env flag gating.** Same `MENTOR_RAG_V1=true` flag. With false: today's mentor pipeline preserved. With true: engine path runs.

7. **Critical Change Protocol responses.** Per PR6 — touches R20a perimeter; touches the existing mentor pipeline. Plain-language explanation; what could break (engine output shape mismatch with existing consumers — caught by aliases); rollback plan (env flag false); verification (founder-performable per below); explicit approval.

### Pass 3 Founder Verification

Founder verification protocol (5 verifications):

1. **Conversation reply preserved.** With `MENTOR_RAG_V1=false`, submit a conversation message; receive today's mentor reply shape. With true, receive the new envelope; the page renders the same kind of mentor reply (philosophical_reflection paragraph + improvement_path paragraph + oikeiosis_context where relevant).
2. **Structured score fields populated.** Open developer tools; confirm response carries `score.passions_detected[]`, `score.virtue_engagement[]`, `score.proximity_level`, etc.
3. **Proximity ring data contract present.** Confirm `proximity_ring_data` block in the response (UI render is Phase-2 pass 4; data contract wired now).
4. **R20a perimeter conformance.** Distress-shaped narrative fires the redirect; engine path does not run.
5. **Open deferral observation.** Domain-matched deferral fires per D15 Principle 3; the prose includes the observation coda.

### Pass 3 Rollback Path

- **If verification fails:** flip `MENTOR_RAG_V1=false`. Today's mentor pipeline preserved.
- **Backward-compat aliases preserve existing consumers** during transition.
- **Rollback target:** today's `/api/founder/hub` mentor pipeline per the snapshot.

## Phase-3+ — Score-family endpoint migrations

Per AC-7, score-family endpoints stay on baked-in prompts in Phase 1. Phase 3+ migrates them per D24's Phase-3+ migration projection sections. Per-route projections:

| Route | Projection | Phase-3+ migration scope |
|---|---|---|
| Route 1 — `/api/score` | D2 Table 1 + D24 amendment for `prior_feedback` projection | Implement engine substitution; Table 1 Layer 3 projection; backward-compat with existing fields |
| Route 2 — `/api/score-decision` | D2 Table 1 + D24 amendment for aggregate-across-options projection | Engine runs N times (once per option); aggregate decision-comparison projection; backward-compat |
| Route 3 — `/api/score-document` | D2 Table 1 + new D24 Table 6 for policy-mode-specific fields | Architecturally distinct — direct `client.messages.create` rather than `runSageReason`; largest of the score-family migrations |
| Route 4 — `/api/score-scenario` | D2 Table 5 (compact V3) | Practice surface; lower priority; AC-13 / AC-17 partially applicable per D24 |
| Route 5 — `/api/score-social` | D2 Table 5 (compact V3) + D11 Refinement 1 invitation-language | Compact V3 surface; mapping is clean per D2 |

Each Phase-3+ pass:
1. Snapshot the route at the pre-migration git ref.
2. Implement Layer 1 + engine + Layer 3 projection per the route's table.
3. Env flag `MENTOR_RAG_V1=true` gates the engine path.
4. Backward-compat aliases preserve existing consumers.
5. Founder verification per the route's snapshot.
6. AC4 invocation testing per AC5 (existing perimeter; no new ninth-route addition needed).

The Phase-3+ migrations are sequenced after Phase 2 lands. Order recommendation: Routes 1, 2 (most-used), then Routes 4, 5 (compact variants), then Route 3 (architecturally distinct, largest scope).

## D-A16 catalogue promotion as Phase-2 build precondition

Per Precondition 2 — the focus-question-stem catalogue must be promoted before Phase-2 pass 1 reaches operational completeness. The promotion process is a separate Phase-2 work item that lands before pass 1's verification:

**Promotion workflow:**
1. **Source extraction.** Read `mentor-knowledge-base.ts` and the existing `/api/mentor/private/reflect` route's `REFLECTION_PROMPT` for question patterns.
2. **Stem decomposition.** For each pattern, decompose into `[VARIABLE]` placeholders + `slot_fields[]` JSONB structure per D13.
3. **Catalogue table population.** Insert into `corpus_passages` with `passage_type: focus_question_stem`, `trigger_condition`, `intake_tier`, `slot_fields`. Per D5.
4. **Source citation.** Honest provenance — alt-3-derived stems carry `source_citation: "alt-3 handoff 2026-04-29 (alt-3 derived)"`. Stoic primary-source stems (rare initially) carry the citation.
5. **Founder review of the catalogue.** The catalogue's stems are reviewed before insertion — the founder confirms the patterns are accurate to the architecture exercise's named anchors.
6. **Phase-2 pass 1 minimum coverage.** EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger codes covered at minimum.

The promotion is **Standard risk** under 0d-ii — the catalogue is documentation; insertion into `corpus_passages` is a Standard schema-write under the build operator's RLS policy. No live-system effect until `MENTOR_RAG_V1=true` engages the engine that reads the catalogue.

## Two snapshots before Phase-2 begins

Per D24 §"Snapshots needed":

| Snapshot | Status | Phase-2 use |
|---|---|---|
| `/api/mentor/private/reflect` | ✅ Done — `D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02` at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md` | Pass-2 verification reference |
| `/api/reason` | Deferred — can land alongside Phase-2 pass-3 planning | Pass-3 verification reference |

Both snapshots are Standard risk (documentary). The first is complete; the second lands before Phase-2 pass 3 commences.

## AC4 invocation testing per pass

Per AC4 (Invocation Testing for Safety Functions) — both functional and invocation tests required:

| Pass | Routes touched | AC4 test scope |
|---|---|---|
| Pass 1 | `/api/mentor/private/deferral-resolve` (new ninth route) | Add to `r20a-invocation-guard.test.ts`; verify `detectDistressTwoStage` import + `enforceDistressCheck` call pattern |
| Pass 2 | `/api/mentor/private/reflect` (existing 8th route) | Verify the existing AC4 test still passes post-substitution; the call pattern is preserved |
| Pass 3 | `/api/founder/hub` and downstream routes | Per existing AC5 perimeter; verify call patterns post-substitution |
| Phase 3+ | Score-family routes (Routes 1, 2, 3, 4, 5) | Per existing AC5 perimeter; verify call patterns post-substitution |

Phase-2 build's CI runs the AC4 tests on every commit. Merge requires pass.

## Cleanliness rating

The Phase-2 sequencing is **HIGH cleanliness** — the three-pass order is fixed by AC-19 (non-negotiable); per-pass build steps are structurally bounded; rollback paths are named explicitly per pass.

The preconditions are **HIGH cleanliness** — five named preconditions with deterministic satisfaction criteria. One is already satisfied (the snapshot); two are nominally satisfied but require formal sign-off (deliverables approval; founder approval); two are Phase-2 work items (D-A16 promotion; encryption wiring coordination).

The Phase-3+ migrations are **HIGH cleanliness** at the per-route projection level (per D24's Phase-3+ projection sections); **PARTIAL cleanliness** at the sequencing level (the order is recommended but not strictly mandated; founder calls based on observed Phase-2 readiness).

The AC4 invocation test coverage is **HIGH cleanliness** — explicit per-pass scope.

## R5 / R17 / R20a compliance

- **R5 (cost guardrail):** per-pass cost analysis in D20. Phase-2 build's per-call cost stays within the cost-model envelope. R5 alerts wired post-Pass 1.
- **R17 (intimate data protection):** Pass 1's encryption wiring; cascading deletion via ON DELETE CASCADE; RLS policies enforced. Per D14b R17 conformance.
- **R20a (vulnerable user detection):** AC5 ninth-route discipline at Pass 1. AC4 invocation testing per pass.

## Open questions

1. **Order of Phase-3+ migrations.** Recommendation: Routes 1, 2 first; then 4, 5; then 3. Founder may prefer a different order based on observed Phase-2 production usage. Logged for Phase-3+ planning.
2. **Whether D-A16 catalogue promotion is a separate Phase-2 step or folded into Pass 1's build.** Recommendation: separate step (Standard risk; lands before Pass 1 verification). Folding it into Pass 1's Critical Change Protocol expands Pass 1's scope unnecessarily.
3. **`/api/reason` snapshot timing.** Recommendation: land before Phase-2 pass 3 commences (i.e., during Pass 2's verification or shortly after). Founder calls.
4. **Whether the proximity ring UI renders at Phase-2 launch or post-launch.** AC-11 specifies data contract in Phase 1; UI render in Phase 2. Recommendation: render after Pass 3 (the data contract is wired at Pass 3 on the conversation surface). Phase-2 build resolves.
5. **Per-pass deployment cadence.** Recommendation: each pass is its own deploy; stabilise on production for a week or more before commencing the next pass. Phase-2 build coordinates with founder availability.

## Honest disclosure

The migration plan is build-sequencing for Phase 2. Phase-1 design ends here; Phase-2 build implements against the design. The plan is structurally bounded — the three passes are the canonical sequence per AC-19 — but Phase-2 production observation will surface refinements (e.g., per-pass deployment cadence; specific verification thresholds; alert tuning) that adjust the implementation without changing the sequencing.

Pre-Pass-1 preconditions are explicit. P0 0h's hold-point status remains active until the founder commences Phase 2 — the migration plan itself is design only and does not progress P0.

The Critical Change Protocol responses for each pass are named. Pass 1 is the first Critical change in Phase 2; the protocol governs from there.

## Approval gate

This deliverable is the load-bearing build-sequencing artefact for Phase 2. Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii — design only; no live-system effect). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

The Phase-2 commencement itself is governed by the Critical Change Protocol per pass. The founder's explicit approval at each pass commencement is required.

---

*End of Deliverable 21.*
