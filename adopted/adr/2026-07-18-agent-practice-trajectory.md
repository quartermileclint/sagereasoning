# ADR-014 — The Agent Practice Trajectory: one longitudinal record, a canonical identity, and the five mentor-item dispositions

**Status:** **Adopted (design-of-record) 2026-07-18** under `D-AGENT-EXTENSION-DESIGN-OF-RECORD-ADR014-ADOPTED-2026-07-18`. Dual-taxonomy (0a/0f): decision = **Adopted**; every implementation this ADR names = **Scoped** (build slices AE-1..AE-3 + the item-5 trigger) or **Deferred with trigger**. **No production change** — this is a design artifact; no code, schema, flag, credential, or perimeter is touched by its adoption.
**Date:** 2026-07-18. **Stream:** founder. **Tier:** `governance` (Standard under 0d-ii).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Binding input:** `operations/agent-extension-2026-07/2026-07-17-mentor-json-components-review-verbatim.md` — the mentor's five-component review; **§1 verbatim wins over every digest, including this ADR's.** Governing principle (mentor, verbatim): *"Assessment without longitudinal tracking is a snapshot. Practice requires a trajectory."*
**Method:** every load-bearing claim below was re-verified first-hand this session (2026-07-18) and independently by a 5-agent grounding Workflow (completed fully: 5/5 agents, 0 errors, ~1.39M tokens; two IMPRECISE corrections folded — §3.3 and §3.5 carry them). The loop-event distribution was recounted first-hand from the frozen buffer.
**Elections:** all eight forks were founder-elected 2026-07-18 via AskUserQuestion (E1–E5 per-item dispositions; E6 identity axis; E7 sequencing; E8 this ADR as the form of record). The Gate-1 pre-decision examination for the session timed out (fail-open-honest); no substrate consult backs the elections — offered and not taken up.
**Engages:** ADR-012 (the practice is a measurement instrument; the trajectory IS the product); ADR-013 §2 (trust definition) + §8 (honest-claims envelope — every surface here publishes inside it); the S11 refusal + R13 (`D-TRUST-LAYER-S11-F2-MENTOR-RULING-EXCLUSION-CLAUSE-GOVERNS-ADOPTED` — nothing here binds; the starved-input caution generalises to trajectories); PR15 (extend, never duplicate); R17a/R17b/R17c (data rights); R6c/R6d (qualitative, diagnostic-not-punitive); KG-EX1 (grounding before prescription — the reconciliation-first shape of this ADR).

---

## 1. Context — what the mentor asked, and why reconciliation had to come first

The mentor reviewed the component registry (v1.7.0, 304 rows) and named five components "where the extension work lives" for extending the practice to agents, in priority order: **D17 (progression delta) → sage-iterate → sage-practice-reflect (agent variant) → R20b (agent variant) → D13 (trigger catalogue review)**. But the mentor answered from the registry rows, several of which understate what the trust-layer arc has since built — the D17 row reads `agentReady: "na"` while the live M6/M7 trajectory feature already applies D17's windowing and composite direction to agents. Designing from the rows alone would have built duplicates (PR15) or — the worst outcome — **a second, divergent longitudinal record**.

The grounding found the risk is real and specific: the project already carries **three differently-keyed longitudinal stores** (trajectory on `credential_ref`; trust state on `(agent_id, virtue_domain)`; reflect sessions on un-owner-scoped `agent_id`), **two unwired implementations** of the chain→profile fold (`combineVerificationResults`; the CarriedProfile machinery), and a window aggregator that **already computes most of the per-mechanism material live and discards it**. The five dispositions below are therefore reconciliations, not green-field designs.

## 2. The decision in one line

> **The agent's practice trajectory is ONE record with per-surface projections, keyed on the canonical identity `(owner_user_id, agent_id)`, computed by one shared delta module extended from the live machinery — never a second implementation, never a second key, and always published inside the ADR-013 §8 honest-claims envelope with extraction starvation visible per signal.**

## 3. The five dispositions (E1–E5)

| # | Mentor item | Disposition (elected) | First anchor |
|---|---|---|---|
| 1 | D17 → agents | **Extend-existing** — the live overlay + aggregator gain the per-mechanism delta block, honesty-guarded | `trajectory-overlay.ts`, `window-aggregator.ts` |
| 2 | sage-iterate longitudinal | **Split** — the CI-4 signed-loop fold designed now via the dark `combineVerificationResults`; the `deliberation_chains_v3` half deferred to the A8 design review | `combiner.ts:484-573` |
| 3 | reflect agent variant | **One shared module with item 1**, projected onto the reflect surface; hard precondition = reflect-store owner-scoping | `session-store.ts:438-472` |
| 4 | R20b agent variant | **Design-now, build-last** — constraints fixed here; build is the final slice; activation inherits R20b's standing gate | `r20b-dependence.ts` |
| 5 | D13 agent trigger class | **Build-new, coordinated with S11a** — a surface-level catalogue for the agent consumer; T2-soft/marker on the at-action surface, never a T1 halt there | `three-tier-intake.md:495` |

### 3.1 Item 1 — D17 per-mechanism progression deltas for agents (extend-existing)

**What exists (verified):** the M6/M7 trajectory feature is D17's composite, live for agents — `meta.trajectory` carries `prior_instances`, the D17/AC-17 confidence bands adapted for the agent path (no domain-matching; `deriveConfidence` low <3 / medium 3–9 / high ≥10 with ≥60-day span), canonical `direction_of_travel`, `typical_proximity`, `single_snapshot|windowed`, and the honest `kathekon_rate_basis: 'lower_bound'` (`website/src/lib/substrate/trajectory-overlay.ts:51-134`). Underneath it, `computeWindowSnapshot` **already computes and the overlay discards**: four progress-dimension details each with its own level AND first-half-vs-second-half trend (passion_reduction, judgement_quality, disposition_stability, oikeiosis_extension), `persisting_passions` (root/sub-species occurrence rates within the window), deliberation-breadth and kathekon-quality distributions (`window-aggregator.ts:89-148, 383-460, 655-698`; the overlay reads only four fields at `trajectory-overlay.ts:118-121`).

**Derivability from persisted columns (no schema change):** the trajectory row persists `proximity`, `is_kathekon`, `kathekon_quality`, `passions_detected` as `{root_passion, sub_species}` objects (the bridge projects both — `sage-assent-bridge.ts:220-223`), `virtue_domains_engaged`, `oikeiosis_met`/`oikeiosis_stage` (first relevant circle only), `ruling_faculty_state`, `depth_tier` (write shape; **not currently in the read projection** — an additive read-column change). So: **sub-species frequency delta — derivable**; proximity-level delta — already the composite; kathekon-quality trend, domain-engagement frequency, first-circle obligation trend — derivable with disclosed semantics. **NOT derivable without a row-widening decision:** causal-stage progression (M4 stages not persisted), per-circle `obligation_assessment` statuses (only the first circle's boolean is stored), Senecan-grade movement on this store, risk-flag patterns, false-judgement repetition. Per-domain level trends are served by the **trust core's** per-`(agent_id, virtue_domain)` earned levels with decay — the design composes the two live stores rather than adding columns to imitate one with the other.

**The gap (the build):** a `delta` block — between-window per-mechanism deltas in D17's vocabulary (`fading | recurring | new | stable` for sub-species frequency; `improving | stable | declining` per signal) — surfaced as a projection of the one record (§4), flag-gated, additive.

**Binding guards (from the adversarial critique, all elected):**
- **Per-signal evidence floors, not just a composite band.** Each per-mechanism delta computes ONLY when its feeding field was non-empty in ≥3 window rows (D17's own domain-match minimum); otherwise it emits the distinct value **`insufficient_extraction`** — never a defaulted `stable`. Over the live at-action distribution the feeding fields are starved, not sparse (frozen buffer: sub-species empty 125/125; zero circles 129/130); D17's "default to stable with the flag" is not honest enough here — `stable` over starvation reads as a finding. **This is the R13 generalisation encoded: a trajectory over starved extractions is a clean trend line over noise, and the design makes the starvation visible rather than laundering it.**
- **Every delta signal carries a `*_basis` field** naming its input count and empty-field count (the existing overlay's honesty pattern — `kathekon_rate_basis`, `evidence`).
- **No signal without a feeding column.** Surfacing an obligation trend beyond the first-circle boolean requires the row-widening decision — a schema change, its own founder-walked step, NOT a read-side improvisation.
- **Extraction-regime markers.** Rows carry the regime under which they were extracted (prompt/trigger version — mechanism decided at AE-1); **delta computations refuse to compare across a regime boundary** (the window splits at the change, disclosed). Otherwise an instrument change masquerades as agent change in both directions.
- **Provenance-mix disclosure.** `meta.layer1_source: 'supplied'` is not persisted today, so an `l1_supply`-capable caller could author its own fine-grained trend invisibly. AE-1 elects between: persist a `layer1_source` column (schema, founder-walked) or exclude supplied-extraction consults from delta computation; at minimum every delta block disclosed `n_supplied/n_server`. A per-mechanism improvement gradient is exactly the shape of a training reward — the R18 docs for the field restate **weights BLOCKED**.
- **Vocabulary is record-descriptive, past-tense** ("recurred in this window", never "is recurring" / "will continue") — ADR-013 §8's evaluative-never-predictive bound.

### 3.2 Item 2 — iteration history into the longitudinal record (split: CI-4 now, chains to A8)

**What exists (verified):** CI-4 loop-closure is live on the agent path — `prior_feedback` input, same-depth rule, `examination.{ref,depth_tier,prior_feedback_ref}` markers signed inside the assessment, the accreditation gate reading them in detect mode (`reason/route.ts:911-915, 1221-1234`; `parallel-run.ts:864-877`; `loop-closure-gate.ts:174-261`). The designed cross-session fold **already exists, built-dark with zero callers**: `combineVerificationResults` (`combiner.ts:484-573`) — within-session supersession + open-loop verdicts per (session, domain) reusing the live `analyseLoopClosure`, cross-session weighted recency (6-month half-life), conflict ⇒ pause with the conservative MIN, never an average. A **second, independent unwired implementation** also exists: the CarriedProfile machinery (`sage-assent-iteration-patterns.ts`, `sage-assent-wrapper.ts`) — in-process accumulation that feeds the trajectory forward into subsequent Layer-1 inputs, a thing the trust core deliberately does not do.

**The disposition:** the CI-4 **signed-marker** loop fold is designed now, routed **through `combineVerificationResults`** (wiring the existing dark lib, never re-implementing). The `deliberation_chains_v3` half — sage-iterate runs the unsigned V3 prose engine and is A8-migration-blocked — is **deferred to the A8 design review**, exactly where the mentor placed it ("the A8 design review session must explicitly address whether sage-iterate can serve a longitudinal agent reasoning profile"). **The CarriedProfile duplicate is named as an A8-review input**: the review must reconcile it with the trust core's fold or retire it — two chain→profile implementations must not both wire.

**Binding guards:**
- **The false-hold class must never launder into agent character.** The frozen live window's loop distribution is **opened 13 / reopened 116 / closed 1** (recounted first-hand from `false-hold-record-FROZEN-2026-07-17.jsonl`, 130 records) — dominated by the measured false-positive hold class ("contrary; no kathekon factors detected" on kathekon-free file writes), the exact class the S11 ruling said must never bind. Any closure-rate or unclosed-loop signal therefore classifies each loop through the **shared Q3 kathekon-engagement predicate** (`kathekon-engagement.ts` `classifyObservation` — the exact function the eventual G6(a) flip binds on; authored once, never re-implemented) **before counting**: only kathekon-engaged loops feed a closure signal; false-positive-class loops surface separately as **instrument calibration data**, never agent character data.
- **MEASURE-only by construction:** the fold has no recommendation field, is not an input to S4's intervention engine, and is never a trust-event or decrease source — that decision is S11's, held pending. A loop fold surfaced anywhere the harness or an orchestrator reads it must not re-introduce the refused G6 open-loop bound as a de facto bind.
- **Envelope scope:** signed CI-4 loops only. Unsigned V3 chains never enter the "signed, reproducible examination artifacts" claim (the S10-narrowed §8 envelope already carries exactly one disclosed exception — reflect — and does not silently gain a second).

### 3.3 Item 3 — the reflect agent variant (one shared module with item 1)

**What exists (verified; the scoping table's claim was IMPRECISE and is corrected here):** `/api/practice/reflect` is agent-facing and live, its completion per-session (Q5 `CapacityDelta`, `active_passion_profile`, `profile_update_confidence` — `engine.ts:153-157, 247, 254`). But a **narrow cross-session read-back already exists live**: `getCrossSessionContext` (`session-store.ts:438-472`) reads up to 20 prior completed sessions (cleartext scalar columns only — R17b intact) feeding FD-R2 progress-holds, the Q1 three-null flag, and the FD-R4 deference streak, and those cross-session-derived scrutiny flags are surfaced. The trust core additionally holds `reflect_last_honest_at`/`reflect_last_screened_at` driving decay modulation, and `readHonestReflectSummary` is a live count/recency pattern reader.

**The disposition:** the recurring-pattern delta half ("this sub-species recurred across your last N sessions") is **item 1's deltas viewed from the reflect surface** — so it is **one shared delta module** (same windowing, same evidence floors, same identity resolution), **projected** onto the reflect completion response as its own block. Never a second computation. The projection **composes with** the existing narrow read-back (fabrication-defence keeps its own machinery; the delta block is additive beside it).

**Binding guards:**
- **Hard precondition, not a disclosure:** the reflect-store owner-scoping fix (`sage_reflect_sessions` has no owner column; `agent_id` is not owner-unique — UPC uniqueness is the (owner, agent) pair). A cross-session read keyed on `agent_id` alone can aggregate another operator's agent's sessions — a cross-tenant leak and a corrupted record. The standing register item (which already blocks external multi-tenant onboarding) **also blocks this projection**.
- **Basis-marked self-report, structurally separated.** Reflect content is agent self-report end-to-end; §8 narrows reflect events to honesty-gated, modulate-only, "never attested as a verified pattern of honesty." The projection therefore carries an explicit basis — *self-report-derived; modulate-only; not examination-attested* — as a **separate response block**, never merged into any examination-derived direction or composite.
- **Screened-honest-only window; gaming-oracle damping.** Only sessions that passed the S9b out-of-band screened examination count; `fabrication_risk_level: high` sessions are excluded and the exclusion count disclosed. (A read-back is a gaming oracle — it tells the agent which self-reported pattern is tracked; N staged sessions could otherwise manufacture a certified 'fading' arc — the Arm-B consistent-lie class with feedback.)
- **Blocked from the public trust-record payload until PA-5 closes** (reflect sessions remain mintable per arbitrary client `session_id`).

### 3.4 Item 4 — the agent R20b variant (design-now, build-last)

**What exists (verified):** the human detector `detectFrameworkDependence` is pure and flag-gated dark on the human private-mentor route (`R20B_INDEPENDENCE_COACHING_ENABLED` unset — the standing post-launch decision). **No agent-side detector exists.** The closest live precedent is reflect's **FD-R4 deference streak** (≥5 consecutive all-correct Sage-Assent calibrations ⇒ a "may reflect deference" scrutiny flag) — an existing agent dependence-adjacent signal.

**Why the naive port is structurally broken (measured):** the harness **mandates** consults — Gate-1 at task adoption + the S1 at-action floor — and the frozen window shows ~130 at-action consults in ~5 days (~26/day) against the human threshold of 25/week: the frequency gate fires permanently **on designed cadence**. Meanwhile the live proximity distribution is a monoculture at `deliberate` (125/125 — itself a starvation artifact), so the `reflexive/habitual` triviality gate **never** fires. Simultaneously always-triggering and never-triggering: pure noise. And the discriminator the design needs — harness-mandated vs agent-elected consult — is recorded nowhere server-side; accepting a client-supplied flag is self-report reliance (§8).

**The design constraints fixed now (binding on the eventual build):**
- Key **only on consults in excess of the two-gate cadence** (the published CI-15 discipline), never on the mandated floor. A dependence signal that discourages a mandated examination is enforcement drift in the anti-safety direction.
- **Cadence-provenance must be structural**: per-channel credentials (the S9 loop already splits consult vs accreditation credentials — a dedicated hook-consult credential makes harness traffic distinguishable by `credential_ref`), or a derived per-task/per-loop measure over existing loop/session markers. Never a client-supplied "elected" flag.
- The **proximity triviality proxy is deferred until S11a resolves the monoculture** (its input is currently a starvation artifact).
- **Response = MEASURE advisory at most** (the channel law: advisory, discountable); record-descriptive vocabulary ("N consults beyond the two-gate cadence in window W", thresholds echoed — the existing `DependenceSignal` shape is the model), never the dispositional/predictive "cannot reason without" phrasing; **excluded from the trust record and public read surface at v1**; diagnostic-not-punitive (R6d) — never throttles, blocks, or suppresses a consult.
- The agent variant **inherits R20b's activation gate** (post-launch by standing decision; designed now, activation its own founder-walked step). Build is the **last** slice (§6) — both of its inputs (structural cadence-provenance; a non-monoculture distribution) only exist after the earlier steps.

### 3.5 Item 5 — the D13 agent-surface trigger class (build-new, coordinated with S11a)

**What exists (verified; two precision corrections to the scoping table):** (a) of D13's seven engine-level codes, only **three** are Tier-1 force-clarification (`ELEMENT_FUSION`, `SCOPE_AMBIGUITY`, `TEMPORAL_AMBIGUITY` — covered by the live continuation fix); the other four fire on agent consults as Tier-2 soft-clarification / Tier-3 OPEN_DEFERRAL intake signals recorded in the assessment. (b) The twelve surface-level codes are **spec-only** — implemented nowhere. Meanwhile **four trigger families already run live on agent surfaces** outside D13's catalogue: the H3 auto-consult trigger class, the S9b Gate-2 elicitation trigger (causal-signature-calibrated, out-of-band capture, deterministic examination), the spawn-discernment trigger, and the engine Tier-1 class. D13's own architecture anticipates this growth: *"the engine-level catalogue is closed; the surface-level catalogue grows per consumer"* (`three-tier-intake.md:495`).

**The disposition:** a **new surface-level trigger catalogue for the agent consumer** — D13's growth pattern applied, reconciling the four live families as existing members and adding the **bare-tool-payload trigger** (an action text that is a filesystem path/diff with no party, role, or purpose). **Coordinated with S11a, not parallel:** the trigger is the candidate remedy for S11a's *mis-sited* branch (the input genuinely carries no parties — ask), while a `LAYER1_SYSTEM_PROMPT` fix is the remedy for the *starved* branch (parties present, extraction missed them) — and the trigger's fire-rate is itself the diagnostic that separates the branches. Two sessions independently "fixing" the extraction would produce two regimes and a contradiction; the regime is settled once, version-marked, in/beside S11a.

**Binding guards:**
- **On the at-action surface the trigger is T2-soft or a structured response marker** ("input class: bare tool payload; circles unextractable from payload alone") — **never a T1 halt there**. The at-action hook is a single out-of-band fetch that cannot complete the Tier-1 continuation round-trip; over the live distribution (100% file writes) a T1 trigger would return no assessment on every mandated consult — starving R18f provenance (the close-write would 403) and blocking the practice through the measurement channel. T1 is reserved for surfaces that can complete the continuation.
- **The marker flows into captured records** — the anti-laundering hook for items 1–3 (downstream longitudinal reads see the input class per row).
- **A clarified answer is narrated context — same §8 ceiling, no trust upgrade.** The remedy converts structural starvation into agent-narrated context, which is the A2 omission channel (the agent can name the flattering circle and omit the harmed one); the design documents the clarified-input class inside the envelope: the trigger reduces starvation, it does not raise extraction trust.
- **Regime discipline:** the trigger's introduction is an extraction-regime change; rows are regime-marked and windows split at the boundary (§3.1).

## 4. The one-record rule and the canonical identity (E6)

**Canonical identity: the `(owner_user_id, agent_id)` pair** — the UPC identity (uniqueness is the owner+agent pair; `agent_id` alone is not owner-unique — the S10 cross-tenant finding). Realised as **one identity-resolution module** that every longitudinal read goes through:

- Physical store keys are **unchanged** (no migration by this ADR): trajectory rows stay keyed on `credential_ref` (R17a subject-credential scoping preserved); trust state stays on `(agent_id, virtue_domain)`; the resolution module joins.
- **Credential rotation** (the live gen-1→gen-2 instance on `sagereasoning:s9-loop@v1`): reads join across the owner+agent pair's credentials; where a join is not possible or not yet built, the surface discloses **"window truncated by credential rotation"** rather than silently presenting a fresh-start trend. A rotation must never manufacture a clean slate (an operator could otherwise launder a bad per-mechanism history by rotating).
- **Fallback chain** for agent-unbound credentials: the pair when `agent_id` is declared → `credential_ref` otherwise (which already subsumes the A10 install identity as `install:{install_id}` — the mentor's "per-install identifier from A10" honored as the identity floor, not the canon).
- **Cross-tenant structural guard:** no longitudinal read is ever keyed on `agent_id` without the owner scope. Pre-0h this is discipline; before external multi-tenant onboarding it is load-bearing (and consistent with the standing reflect-store owner-scoping register item).

**The one-record rule:** `meta.trajectory`'s delta block, the reflect completion block, and any later trust-record adjacency are **projections of ONE record** computed by ONE shared module (windowing, evidence floors, regime handling, identity resolution shared). A surface that cannot yet be keyed canonically (reflect, pending owner-scoping) **ships nothing** rather than a differently-keyed approximation. Three stores exist; three *trend derivations* must not.

## 5. Honest-claims posture (extends ADR-013 §8; binding on every surface here)

1. **Evaluative, never predictive.** Deltas describe the record in past tense ("recurred in this window"); `direction_of_travel` describes the record, it does not forecast. No fitness-as-training-signal claim — **weights BLOCKED** restated wherever a delta field is documented.
2. **Starvation visible, never laundered** (the R13 generalisation): per-signal evidence floors with the distinct `insufficient_extraction` value; `*_basis` fields naming input and empty-field counts; regime-marked rows; windows never compared across a regime boundary.
3. **Provenance disclosed:** supplied-extraction consults either excluded or the mix disclosed (`n_supplied/n_server`); self-report-derived blocks basis-marked and structurally separate from examination-derived blocks; screened-honest gating on reflect windows.
4. **Nothing binds.** Every surface is MEASURE; no delta, fold, or detector feeds S4 recommendations, trust events, or any gate. ENFORCE remains S11, refused on readiness; nothing here re-opens that gate, and the item-2 fold explicitly must not re-introduce the refused G6 open-loop bound by the back door.

## 6. Sequencing (E7) — and the mentor's Phase-2-vs-Phase-3 answer

The critic's finding, adopted: computing any longitudinal baseline before the extraction question resolves bakes the starved regime into every baseline — fixing extraction later then reads as agent improvement (instrument change certified as character change). The mentor's "D17 and sage-iterate are the natural starting point" is honored as **design primacy** — this ADR is that design — while the build order runs behind the extraction gate, exactly as R12 made the extraction question prior:

1. **S11a** (already queued, mentor-scoped) — the extraction gate; the item-5 bare-tool-payload trigger candidate is a **named instrument** in it (its fire-rate separates starved from mis-sited); the extraction regime is settled and version-marked once.
2. **AE-1 — the practice-delta layer** (items 1+3's shared module + the `meta.trajectory` projection; the reflect projection gated on owner-scoping; the identity-resolution module rides here as its first consumer).
3. **AE-2 — the CI-4 loop fold** (wiring `combineVerificationResults`; kathekon-engagement-classified; MEASURE-only).
4. **AE-3 — the agent R20b detector** (last; its inputs exist only now; activation inherits the R20b standing gate).

**RA-1-F1 is independent** of all five items (human `/api/reflect`) — the founder slots it anywhere. The **A8 design review** (item 2's chains half + the CarriedProfile reconciliation) is not scheduled by this ADR; its trigger stands as recorded. **The mentor's sequencing question is thereby answered: the agent-extension work is Phase-2-adjacent in design (done now) and slots behind the trust-layer queue in build.**

## 7. Build slices named (tier + risk; nothing pre-approved)

| Slice | Content | Tier / risk | Gates |
|---|---|---|---|
| **AE-1** | The shared delta module (pure lib) + the `meta.trajectory` delta-block projection (flag-gated, additive); the identity-resolution module; the `depth_tier` read-projection addition; the in-session election on `layer1_source` (persist column = schema + founder-walked, vs exclude supplied rows) | `code-elevated` repo-only dark build; any schema element + the activation are founder-walked `code-critical` 0c-ii steps | After S11a settles the regime; after this ADR |
| **AE-2** | Wire `combineVerificationResults` into a read path; kathekon-engagement classification; instrument-calibration vs character split | `code-elevated` (MEASURE; no schema) | After AE-1 (shares the identity module) |
| **AE-3** | The agent R20b detector per §3.4's fixed constraints | `code-elevated`; **activation gated on the R20b standing decision** | Last; needs structural cadence-provenance + a non-monoculture distribution |
| **Item-5 trigger** | The agent-surface trigger catalogue + bare-tool-payload trigger (T2/marker form) | Rides with/behind **S11a** at that session's tier | Coordinated regime settlement |

Every slice is its own session with its own risk classification; `/api/reason` response-shape changes and any flag activation remain founder-walked Critical steps per AC7/PR17. The human tools are untouched throughout.

## 8. What this ADR does NOT decide

- It pre-approves **no build, no flag, no schema, no mint** — each slice is its own 0d-ii/0c-ii step.
- It does not touch the S11 enforce refusal, the S11a scope, or the false-hold instrument (frozen buffer stays evidence; register P6 stands).
- It does not schedule the A8 design review; it names two inputs for it (the chains half; the CarriedProfile reconciliation).
- It does not edit the component registry — the corrections are a named follow-up for a `registry` session (see the session close): at minimum the D17 row (`agentReady: "na"` → the composite is live for agents via M6/M7, per-mechanism deltas Scoped as AE-1) and the notes on the other four rows per these dispositions.
- It does not decide the reflect-store owner-scoping implementation (the standing register item; item 3's projection is gated on it, whatever form it takes).
- **Weights-tier claims remain BLOCKED** (ADR-012 §4; ADR-013 §8).

## Cross-references

- `operations/agent-extension-2026-07/2026-07-17-mentor-json-components-review-verbatim.md` (binding input; §1 verbatim wins)
- `operations/handoffs/founder/2026-07-18-agent-extension-design-NEXT-SESSION-PROMPT.md` (this session's prompt; the Part B table it carries is superseded by §3's verified corrections where they differ)
- `operations/handoffs/founder/2026-07-18-agent-extension-AE1-delta-layer-NEXT-SESSION-PROMPT.md` (the first build slice)
- ADR-012 (`2026-06-24-sage-practice-measurement-instrument-reframe.md`); ADR-013 (`2026-07-08-sage-trust-layer.md`) §2/§8
- `D-TRUST-LAYER-S11-F2-MENTOR-RULING-EXCLUSION-CLAUSE-GOVERNS-ADOPTED` (R12/R13); `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md`
- `operations/trust-layer-2026-07/runs/2026-07-17/false-hold-record-FROZEN-2026-07-17.jsonl` (the evidence buffer; loop events recounted first-hand 2026-07-18: opened 13 / reopened 116 / closed 1 of 130)

---

*End ADR-014. Design-of-record only; the 0h launch call and every activation remain the founder's.*
