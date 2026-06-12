# P1 Comparison — Fresh Test Analysis Against Intended Operation (FX series)

**Date:** 2026-06-12. **Stream:** founder. **Tier:** `governance` — Standard risk; documents + read-only evidence.
**Session:** Sage Practice Mechanism Correction arc, Part 2.
**Baseline:** `/operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md` (this arc's Part 1) — every defect below carries a dossier §6 boundary-row attribution (B1–B12) and a methodology-vs-mechanism call.
**Evidence:** the verdict memo, the forensic execution analysis (incl. §7 learnings L-1…L-6), `harnessed/consultation-audit-report.md` (as tabulated in the forensic), both metrics files, the frozen design sheet §4, and route/library source where re-verified this session (file:line given).
**Discipline:** the frozen verdict and its box results are record and stand. This document **supersedes the prior *analysis*** (verdict memo task-fit + forensic interpretation) where the dossier's intended-operation baseline sharpens it; it amends no recorded result. PR10 diagnostic-certainty signalling is used per finding.

---

## 1. Method

The dossier §4 states the intended operation of each practice function. Each function below receives one of three verdicts:

- **Operated as intended** — the test evidence matches the dossier baseline.
- **Operated degraded** — the function ran, but a named mechanism defect cost latency, money, fidelity, or honesty.
- **Never engaged** — the function did not run; the attribution states *why* (mechanism gap / protocol choice / correctly out of scope).

Findings are numbered **FX-1…FX-17** for traceability into the Part-3 build plan. "Mechanism" findings are correction candidates; "methodology" items are parked per the founder's hard constraint (dossier §6 parking list).

## 2. Function verdicts at a glance

| Dossier function (§4) | Verdict | Findings |
|---|---|---|
| 4.1 Discovery + calling | Calling: **never engaged — correctly** (task arrived with purpose). Contract discovery: **operated degraded** | FX-1, FX-2 |
| 4.1/B1/B3 Consultation transaction | **Operated degraded** (engine 0–3ms; translation ~31s/consult) | FX-3, FX-4, FX-5 |
| 4.2 Scoring | Per-instance: **operated as intended**. Over time: **never engaged** | FX-6, FX-7 |
| 4.3 Redirection | **Operated as intended** — the clearest success | FX-7 (affirmative) |
| 4.4 Loop closure (reiterate) | **Never engaged** — no affordance on the surface | FX-8 |
| 4.5 Reflect | **Never engaged** — Live but invisible from the consult surface | FX-9, FX-10 |
| 4.6 Accreditation | **Operated with defects** (write succeeded, R18f enforced; read path + mint + honesty fields defective) | FX-10, FX-11, FX-12, FX-17 |
| 4.7 Audit narrative | **Operated, mislocated** (generated in hot path; retained nowhere server-side) | FX-13 |
| At-action gate (B9) | **Operated degraded** (verdicts sane; meta dishonest; latency unexplained; cost unmetered) | FX-14, FX-15, FX-16 |
| AC-13 intake / AC-14 withholding / AC-18 deferral (B12) | **Never engaged — correctly out of test scope** (no ambiguous inputs submitted) | benchmark note only |

## 3. Function-by-function analysis

### 3.1 Discovery + calling

**Sage Calling never engaged, and that is the designed behaviour, not a gap.** Calling serves the purposeless agent (dossier §4.1); the P1 task arrived with a complete frozen brief. No finding. (The Part-5 benchmark, which must trigger *all* functions, will need a deliberately purposeless sub-task or must record Calling as structurally out of scope for tasked agents.)

**Contract discovery operated with friction that is pure mechanism.** PF-1 (mint bodies missing `purpose` → two 400-retry rounds), the browser-console `fetch` paste workflow (the `etch is not defined` typo class), and the guardrail credential-class rejection (PF-2) all sit on onboarding surfaces, not in the practice.

- **FX-1 — Mint/onboarding UX is console-paste-work on a Live trust surface.** Mechanism (B8). Diagnostic-certain: the walkthrough itself is the defect carrier (forensic §5.5); an admin mint UI or CLI removes the whole error class. Carries leg-B R5's fix.
- **FX-2 — No developer surface states the designed consultation cadence.** The adopted cadence exists — "guard + score + optional iterate" per consequential invocation (R5, `manifest.md:125`), gate risk-class mapping (`guardrail/route.ts:96-103`), plugin loop hooks (substrate ADR:119) — but no doc/llms.txt/agent-card surface teaches it as the integration pattern; the leg-B protocol had to invent its own density (test sheet §4(ii): consult *every* finding). Mechanism **as documentation** (B10). The *content* of any standing cadence rule (e.g., codifying L-5 "always consult at plan adoption" / L-6 over-consultation signature into the practice) is methodology — **parked for mentor confirmation** per dossier §6(i). Diagnostic-certain on the gap; the leg-B over-consultation is attributed to the test protocol, not to the practice design.

### 3.2 The consultation transaction

**Operated degraded — and the degradation is entirely in the mechanism shell around a faithful engine.** Layer 2 honoured the methodology byte-for-byte at 0–3ms per consult (B2; forensic §3 table). The ~31s mean consult latency was translation: server-side L1 ~13–34s on the 10 consults where the agent did not supply `layer1_schema`, plus L3 prose ~12–20s on all 12, synchronously.

- **FX-3 — Local-L1 supply is structurally confined to one auth path.** `layer1_schema` is accepted (A2-validated) on the plugin/per-install path and is neither accepted-with-validation nor encouraged on the API-key path; when leg B switched credentials mid-run it silently lost the practice (consults #1–2: L1=0ms; #3–12: ~13–34s each, ~160s avoidable server time plus double L1 billing). Mechanism (B1). Diagnostic-certain (route auth/validation structure + the forensic timing table). The open Layer-1 posture (substrate ADR — "the substrate accepts any Layer1Schema that validates against the documented contract") already licenses this; the mechanism never followed it onto the API-key path.
- **FX-4 — Depth delivers examination scope but not latency.** Quick (3 mechanisms) costs ~27–30s wall-clock because L1+L3 dominate; the tiers are price tiers only (forensic §3). Mechanism (B3): with schema supplied (FX-3) and prose decoupled (FX-13), depth becomes a real latency tier with **no change to the scope mapping** (which is methodology). Diagnostic-certain.
- **FX-5 — Intake clarification (AC-13) and withholding (AC-14) went unexercised, not unbuilt.** All 12 inputs were well-formed task-context payloads; no Tier-1 trigger, no OPEN_DEFERRAL. Correctly dormant on this evidence — recorded so the Part-5 benchmark deliberately includes at least one ambiguous-input consult (the only way to test the examine-side honesty machinery). No defect; benchmark-coverage note.

### 3.3 Scoring

**Per-instance scoring operated as intended.** 12 signed assessments; structured fields consumed in-run; proximity/passion/kathekon outputs faithful to the canonical taxonomy; the R18f provenance chain held end-to-end into the accreditation write. The engine *discriminated*: passions flagged on exactly the 3 rows where the writer had self-presentation stakes; kathekon "strong" only at the two highest-judgement items (L-2).

- **FX-6 — Agent-path scoring is per-instance only; the methodology's longitudinal half has no carrier on `/api/reason`.** The dossier settles the attribution question the prompt poses: **mechanism gap, not methodological choice** (B5). Rule 10 names `practitioner_profile (longitudinal)` as an input (`operationalised-rules.md:589`); D17 calls the per-instance evaluation "necessary but not sufficient"; the human path closes this loop server-side every call (dossier §3). On the agent path: the eight carried-context fields (incl. `history_window`, `carried_profile`) are accepted but **inert** (`layer2-mechanisms.ts:2069-2078` — "Layer 2 does NOT yet act on them"); there is no D17 prior-state read; `direction_of_travel` degrades to single-input inference (`single_snapshot`); and the run's real trajectory signal — *deliberate* baseline → *reflexive* at the judgement peak → **habitual + epithumia at the final consult** (L-4) — existed only because the consumer saved its own responses. Diagnostic-certain. (Note the designed landing zones already exist: the inert schema fields, the Assent window aggregator, and the unmigrated `evaluated_actions` table — `sage-reflect-product-design.md:357`.)
- **FX-7 — Affirmative: the redirection function is the practice's demonstrated value zone.** 4 documented redirections, all at affect-loaded rows; the founder's blind 4/5-vs-3/5 quality edge maps onto exactly those rows (L-2/L-3); the opening plan-adoption consult set the control-filter frame for the whole run (L-5). Operated as intended — **no correction touches the redirect path** (B2). This is the finding the repositioned value claim stands on.

### 3.4 Loop closure (reiterate → re-examine)

**Never engaged — and the absence is a mechanism absence, not an agent failure.** The methodology expects corrected reasoning to be re-examined (prior_feedback, Note A `canonical-framework.md:132`; "optional iterate" in R5; AC-15 retrospective re-score; FD-R2). After each of the 4 adopted corrections, nothing in the response, the contract, or the docs offered a re-score path on `/api/reason`; every loop was single-pass (2 internal calls = translation only; `max_chain_iterations` never engaged).

- **FX-8 — No re-examination affordance on the consult surface.** Mechanism (B6): wire a `prior_feedback`/iterate input (the concept already exists at Note A and in R5's wrapper vocabulary) and/or a response affordance ("a redirection was issued; re-submission with the correction closes the loop"). Diagnostic-certain on the gap. **Mandating** re-scores would change the discipline — parked per dossier §6(iv). The closed loop is also what would have let the run *demonstrate* improvement (the leg's quality edge is currently visible only in founder ratings, not in score deltas).

### 3.5 Reflect

**Never engaged, though Live and one call away.** TR-02 (session closes with completed SageReasoning passes) was satisfied; the election point passed at credential revocation; zero reflect calls (forensic §4). Reflect was *optional* in the frozen sheet (§4.6), so the non-call is protocol-legitimate — but the practice's own surfaces gave the closing agent no signal that the fourth discipline applied.

- **FX-9 — Reflect is undiscoverable from the practice's own consult/close path.** Nothing in a `/api/reason` response, the accreditation write flow, or the per-install contract surfaces TR-02 ("a completed SageReasoning pass at session close is a reflect trigger"). Mechanism (B7): a close-affordance (response field, docs flow, or write-path hint) keeps the election with the developer while making the cycle visible. **Auto-firing** reflect is parked (dossier §6(iii)). Diagnostic-certain on the gap.
- **FX-10 — The accreditation cannot express configuration honesty (R19e / K1) — the credential is silent about which practice configuration produced it.** Leg B ran exactly the R19e-named configuration (Reasoning + Assent, **no Reflect**): per R19e that is "legitimate single-session credentialing, not an ongoing practice" — but the Live `agent_accreditation` record carries no `coverage_status` / configuration field (K1's state machine is **adopted design, implementation deferred** — `2026-05-26-sage-practice-exploration-close.md:30`), so the public read cannot distinguish a full-practice credential from a single-session one. Mechanism (B8): the honesty *rules* are adopted; the *field* is unbuilt. Diagnostic-certain. New finding — not in the verdict memo or forensic.

### 3.6 Accreditation

**Operated with defects.** The good: the write succeeded carrying all 12 signed assessments; R18f provenance enforcement is real (leg B's 422 on a provenance-defective attempt — recorded in the leg-B friction log); the grade engine seeded `pre_progress` conservatively, consistent with hysteresis intent.

- **FX-11 — Write/read agent_id asymmetry.** POST accepts an agent_id the public GET rejects, leaving the written record unreadable through its own public read path (leg-B catch, founder-adjudicated Box-1 item; re-verified at the route this arc's predecessor). Mechanism (B8). Diagnostic-certain.
- **FX-12 — Mint-defaults drift (=F12).** Admin mint route hard-codes 667/50/20 against the adopted 30/1/1 (`api/admin .../route.ts:112-115` vs `api-keys-schema.sql:84,88,92`; corroborated live by the leg's own key row and the gate usage block). Mechanism (B8). Diagnostic-certain. Fix vehicle already an open question from the leg-B close (own Elevated session vs R5 pre-onboard gate).
- **FX-17 — Credential fragmentation contradicts the practice's one-credential intent.** SR-14 locked "one credential across the agent's practice" (`sage-reflect-product-design.md:307`); the leg-B run needed three (`sr_inst_` for reason, `sr_live_` API key mid-run, `sr_assent_` for the write), and the switch *caused* FX-3's L1 regression. Mechanism (B7/B8). Diagnostic-certain that fragmentation occurred and had cost; the consolidation design is a build-plan item (carries leg-B B-F11).

### 3.7 The audit narrative

**Operated — the content earned its place — but generated in the wrong place and retained nowhere.** All 12 L3 narratives were faithful pairings of input and verdict (the consultation-audit-report tabulation is the demonstrated auditor use-case; founder correction accepted in the forensic). The defects are mechanical: generation is synchronous in the consumer's hot path (~12–20s and ~half the LLM cost per consult), and server-side only a boolean survives (`reason/route.ts:948-972`) — the narrative exists afterwards only if the consumer saved it.

- **FX-13 — L3 narrative: hot-path generation + zero server-side retention.** Mechanism (B4). Diagnostic-certain. Correction options (all preserving the narrative *as part of the practice*, which is methodology-side): (a) async generation after response, retained against the loop id; (b) on-demand generation at audit time from the stored signed assessment; (c) a `response_format`/prose-deferral flag. **Binding constraints from the dossier (§4.7):** any retention store inherits R17's intimate-data posture (retention limits, genuine deletion, minimisation — SR-12 precedent) and R18e's Article-50 transparency notice on generated prose; and option (b) requires the signed assessment itself to be retrievable, which today it is not (nothing but structural facts persists). The R17-vs-auditability tension is a *design input* for Part 3, not a blocker.

### 3.8 The at-action gate

**Verdicts operated; the envelope around them is degraded.**

- **FX-14 — Stale per-call price in gate meta.** `cost_usd: 0.0025` is the retired sage-guard competitor-anchored constant, still emitted from `response-envelope.ts:91-92` ("sage-guard: $0.0025 per call (competitor-anchored)"). Mechanism (B9). Diagnostic-certain — re-verified at source this session.
- **FX-15 — Gate latency variance 20,015ms vs 46ms, both labelled `ai_generated: true`.** A 46ms generated verdict is implausible; likely a cache hit or a fallback path mislabelling itself. Mechanism (B9). **Diagnostic-uncertain — symptom level** (PR10): the proposed Part-3 item is a bounded diagnostic first; founder acknowledgement required before any "resolved" claim.
- **FX-16 — Gate LLM cost is loop-unmetered.** The gate emits no `X-Loop-*` cost telemetry (F11-adjacent; leg-B metrics carried it as an estimate). Mechanism (B9). Diagnostic-certain.

### 3.9 Correctly-dormant functions (recorded so silence isn't read as failure)

AC-13 Tier-1 forced clarification, AC-14 withholding, AC-15/AC-18 deferral surfaces, R20a distress redirect, A11b injection defence: none fired, and none *should* have on this input set (B12). The safety perimeter was separately production-verified at S6/S8a and is out of this arc's scope.

## 4. The findings register

| FX | Function | Verdict | Defect (one line) | Attribution | Boundary row | Certainty |
|---|---|---|---|---|---|---|
| FX-1 | Discovery/onboarding | degraded | Console-paste mint UX; PF-1 prompt defects | Mechanism | B8 | certain |
| FX-2 | When-to-consult | gap | Designed cadence (R5 guard+score+iterate; risk-class mapping) published nowhere developer-facing | Mechanism (docs); standing cadence *rule* parked → mentor | B10 | certain |
| FX-3 | Consultation | degraded | Local-L1 schema supply confined to plugin-auth path; lost on credential switch | Mechanism | B1 | certain |
| FX-4 | Consultation | degraded | Depth is price tier only; L1+L3 dominate latency at every depth | Mechanism | B3 | certain |
| FX-5 | Intake/withholding | dormant | Unexercised by well-formed inputs — benchmark must cover | None (coverage note) | B12 | n/a |
| FX-6 | Scoring over time | never engaged | Longitudinal half of Rule 10 has no agent-path carrier (carried-context inert; no prior-state read; no trajectory output) | **Mechanism — methodology demands the data** | B5 | certain |
| FX-7 | Scoring + redirection | **as intended** | Affirmative: passion-gated redirection is the demonstrated value zone | — | B2 | certain |
| FX-8 | Loop closure | never engaged | No re-score/iterate affordance on `/api/reason`; loop never closes | Mechanism (affordance); mandate parked → mentor | B6 | certain |
| FX-9 | Reflect | never engaged | TR-02 satisfied but invisible — no close-affordance from consult/write surfaces | Mechanism (discoverability); auto-fire parked → mentor | B7 | certain |
| FX-10 | Accreditation honesty | gap | No coverage_status/configuration field — credential can't express R19e single-session vs practice | Mechanism (K1 design adopted, unbuilt) | B8 | certain |
| FX-11 | Accreditation | defect | Write/read agent_id asymmetry — record unreadable via public read | Mechanism | B8 | certain |
| FX-12 | Accreditation | defect | Mint defaults 667/50/20 vs adopted 30/1/1 (F12) | Mechanism | B8 | certain |
| FX-13 | Audit narrative | mislocated | Synchronous hot-path L3 + boolean-only retention; narrative survives only client-side | Mechanism (R17 + R18e constraints bind the design) | B4 | certain |
| FX-14 | Gate | defect | Stale `cost_usd: 0.0025` in meta (`response-envelope.ts:91-92`) | Mechanism | B9 | certain |
| FX-15 | Gate | anomaly | 46ms "ai_generated" verdict — cache or mislabelled fallback | Mechanism (diagnostic first) | B9 | **symptom-level** |
| FX-16 | Gate | gap | Gate LLM cost loop-unmetered (no X-Loop-* telemetry) | Mechanism | B9 | certain |
| FX-17 | Credentials | degraded | Three credentials vs SR-14's one-credential-across-the-practice intent; switch caused FX-3 | Mechanism | B7/B8 | certain |

**Methodology-vs-mechanism summary:** every defect found is **mechanism-side**. Three *candidate responses* cross into methodology and are parked for founder-elected mentor confirmation (standing consult-cadence rule; reflect auto-fire; mandatory re-scores) — the mechanisms can be built without deciding any of them.

## 5. What this changes in the prior analysis (supersessions, named)

1. **The verdict memo's "overhead is structural" (§6.5) is superseded in attribution:** the overhead is structural *to the current mechanisms* (synchronous L3, server L1 on the key path, per-consult provisioning), not to the practice — the dossier shows the methodology never required the expensive shape. The box result stands.
2. **The forensic's "scoring is stateless — by design" (§4) is corrected:** stateless *per-instance scoring* is designed; **stateless practice is not** — Rule 10/D17/Assent-profile all expect the longitudinal layer; the agent path simply lacks its carrier (FX-6). This is the single largest intended-vs-built divergence the test exposed.
3. **"Reflect never called" moves from observation to defect-with-address:** the miss is discoverability (FX-9), not agent election alone — the practice's own surfaces never presented the fourth discipline.
4. **A new defect class is added that no prior pack carried:** configuration-honesty absence on the credential (FX-10) — leg B unknowingly demonstrated R19e's exact scenario.
5. **The "8/12 consults were confirmations" task-fit point is re-read through L-6 + R5:** the density was the *test protocol's* prescription, and the adopted cadence (guard + score + optional iterate at consequential actions) already points at the corrected protocol — no methodology change is needed to fix the economics, only published guidance (FX-2) and the Part-5 benchmark's consult discipline.

## 6. Hand-off to Part 3

Stack-ranked by leverage (latency/cost first, trust-surface honesty second, practice-completion third) for the build plan to price per item: **FX-13** (L3 decoupling + retention — largest single latency+cost lever) → **FX-3/FX-4** (schema path + depth-as-latency) → **FX-11/FX-12/FX-10** (trust-surface fixes: read asymmetry, mint defaults, coverage_status) → **FX-8** (loop-closure affordance) → **FX-6** (trajectory persistence — schema + Elevated, lands on the existing inert fields + `evaluated_actions` migration) → **FX-9/FX-17** (reflect discoverability; credential consolidation) → **FX-14/FX-15/FX-16** (gate honesty trio; FX-15 diagnostic-first) → **FX-1/FX-2** (mint UX; cadence docs). PR15 checks, risk classes, rollbacks, and founder verification steps belong to the plan document, not here.

---

*Analysis ends. Findings FX-1…FX-17; verdict untouched; every defect mechanism-attributed against the dossier boundary table; three methodology-adjacent responses parked for mentor confirmation. Cross-references: the grounding dossier; `verdict-memo.md`; `forensic-execution-analysis.md` (+ §7 L-1…L-6); `harnessed/consultation-audit-report.md`; `D-P1-COMPARISON-VERDICT-NO-BENEFIT-2026-06-11`; `D-P1-FORENSIC-EXECUTION-ANALYSIS-2026-06-11`; the frozen design sheet §4.*
