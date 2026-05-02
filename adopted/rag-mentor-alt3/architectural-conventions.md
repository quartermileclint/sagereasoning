# Alt-3 Architectural Conventions Catalogue

**Status:** Adopted (founder approval per Path A on 2026-05-02; D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02. Promoted from D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (Validation Addendum) under PR8 third-recurrence promotion.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 promoted to a permanent architectural-conventions catalogue under PR8 (third-recurrence promotion). The Validation Addendum's three adjustments + description correction + scope limitation are made first-class architectural conventions referenced by all downstream alt-3 deliverables in lieu of being inlined repeatedly.

**Cross-references:**
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (the validation source — three adjustments + description correction + scope limitation).
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 v1.0.0 — the rule book whose Validation Addendum section is this catalogue's source content; D8 retains its v1.0.0 + Addendum until a future v1.1.0 revision pass folds the adjustments into the per-rule sections).
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 — the canonical 9+1 mechanism set the adjustments operate over; Rule 9 ↔ mechanism 9; Rule 8 ↔ mechanism 8; Rule 7 ↔ mechanism 7; Rule 6 ↔ mechanism 6; Rule 10 ↔ mechanism 10).
- `/adopted/rag-mentor-alt3/rule-dependency-map.md` (D9 — engine sequencing; Dependency 4 [Rule 8 compound severity interaction] and Dependency 5b [Rule 7 operative-circle dependency on Rule 6] make the adjustments operative at sequencing time).
- `/adopted/rag-mentor-alt3/layer-3-translation.md` (D11 — Refinement 5 specifies the Adjustment 1 prose projection at Layer 3 output composition time; Refinement 5 is the runtime mechanism this catalogue's prose patterns reference).
- `/adopted/rag-mentor-alt3/d-a16-catalogue.md` (D-A16 — three stems carry `validation_addendum_aware: true`: T3-002 PRAXIS_MOTIVATION_AMBIGUITY for Adjustment 1; T2E-001 STATED_OPERATIVE_CONFLICT for Adjustment 3; RIT-E-003 evening-virtue-deficiency-pattern for Adjustment 1 unity-check interpretation).
- `/adopted/rag-mentor-alt3/progression-delta.md` (D17 — composite direction with profile-tension flag disambiguation; Adjustment 1's unstable-vs-false distinction interacts with longitudinal direction interpretation).
- `/adopted/rag-mentor-alt3/residual-seams.md` (D19 — full SELF_REPORT_DEPENDENT and CONFIDENCE_WEIGHTED specifications; Adjustment 1's interpretive seam is the canonical CONFIDENCE_WEIGHTED activation case).
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (the alt-3 architecture handoff — Validation Addendum section added 2026-05-02 under D-RAG-MENTOR-ALT3-VALIDATED; this catalogue's prose is consistent with that handoff section).
- `/manifest.md` R6b (unity of virtue — Adjustment 1's distinction preserves R6b's substance), R6d (passions diagnostic, not punitive — Adjustment 2's compound severity is a more accurate diagnostic), R7 (source fidelity — adjustments trace to Stoic source material on phronesis development, value-error compounding, and oikeiosis-circle dependence), R19 (honest positioning — description correction replaces "fully deterministic" with corrected language), ES1 (Zone 2 eval inputs include founder-profile inputs — scope limitation makes the philodoxia-calibration assumption explicit at the architectural level).

---

## Plain-language summary

The Validation Addendum to D8 (the rule book) recorded three adjustments to the alt-3 design, one description correction, and one scope limitation. After D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29, several Phase-1 design sessions have referenced the addendum's findings — D9 (Dependency map), D11 (Layer 3 translation Refinement 5), D13 (three-tier intake), D17 (progression delta), D19 (residual seams), and D-A16 (catalogue's three flagged stems). The addendum's content has therefore reached the third-recurrence promotion threshold per PR8 and is now promoted to a permanent architectural-conventions catalogue.

This catalogue is the single home for the Validation Addendum prose patterns. D8 retains its v1.0.0 plus the Addendum text (per its approval-gate footer). Downstream deliverables reference *this* catalogue rather than re-inlining the patterns. A subsequent D8 v1.1.0 revision pass will fold the adjustments into D8's per-rule sections; this catalogue persists as the standalone architectural reference.

The promotion is a documentation consolidation. It does not introduce new design content — every prose pattern below traces to D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 and to D8's Validation Addendum text. The catalogue makes the patterns first-class so they can be referenced by ID rather than restated in each downstream deliverable.

## §1 — Adjustment 1: Rule 9 unstable-vs-false phronesis distinction

### The pattern

Rule 9 (`VIRTUE-DOMAIN-ENGAGED-001`) operates on cardinal-virtue engagement and applies a unity check across phronesis / dikaiosyne / andreia / sophrosyne. As drafted in D8, the unity check resolves a per-instance virtue-rating conflict to weakest-link aggregation: set `unity_inconsistency: true`; weight the weakest virtue.

For progressors — the practitioner population the product is designed for per ES1 — this is too aggressive. The architecture distinguishes two cases:

- **Unstable phronesis.** The practitioner's phronesis is genuine but not yet stable enough to reliably inform the other virtues across all situations. The unity-check inconsistency reflects developmental noise, not a value-judgement failure. The flag is diagnostic only; the composite proximity score (mechanism 10) does not force weakest-link aggregation.
- **False phronesis.** The practitioner's phronesis is misidentified — what they read as phronesis is actually a passion-shaped judgement wearing phronetic language. The flag indicates a serious failure that propagates to the composite.

### Architectural locus

Rule 9 retains the unity check (D8 §"Rule 9"). The interpretation of the resulting `unity_inconsistency: true` flag is conditional in Rule 10 (KATORTHOMA-PROXIMITY-001), per D8 Validation Addendum implementation guidance. The conditional uses Rule 5 (PASSION-FALSE-JUDGEMENT-001) profile-prior signals plus longitudinal evidence:

- Single-instance `UNITY_INCONSISTENCY` from a practitioner with stable phronesis history → **unstable phronesis** (diagnostic only; composite not forced to weakest-link).
- `UNITY_INCONSISTENCY` consistent with a practitioner's known false-judgement pattern → **false phronesis** (propagates to composite).
- Insufficient longitudinal evidence to distinguish → AC-17 `CONFIDENCE_WEIGHTED` flag fires (the residual-seams convention; D19 is the canonical specification).

### Runtime projection

D11 §Refinement 5 specifies the Layer 3 prose projection. Mechanism 10's interpretation of `unity_inconsistency` produces one of three named cases at Layer 3:
1. **Unstable phronesis case** — prose names the developmental noise interpretation; does not flag failure.
2. **False phronesis case** — prose names the misidentification; flags as serious failure with corrective direction.
3. **Insufficient evidence case** — prose carries the AC-17 `CONFIDENCE_WEIGHTED` caveat (D11 Refinement 3 specifies the per-surface flag-projection rules; D19 specifies the seam-handling convention).

Per D11 Refinement 5 cleanliness rating: PARTIAL — three named cases plus AC-17 default. Prose names the case; case identification depends on Mechanism 10's conditional logic (which is itself PARTIAL per D9).

### What flags interact with this convention

- D8 Rule 5 `dominant_false_judgement` (profile-prior signal feeding the unstable / false determination).
- AC-17 `CONFIDENCE_WEIGHTED` (the seam acknowledged when longitudinal evidence is insufficient).
- AC-17 `SELF_REPORT_DEPENDENT` (covers the directional-modifier dependency on practitioner self-report — D19 §SELF_REPORT_DEPENDENT specifies the per-surface projection).
- D17 progression-delta composite-direction signal (uses the unstable-vs-false distinction to disambiguate breakthrough vs regression vs lateral movement per D17 §"Composite direction with confidence_weighted thresholds").
- D-A16 catalogue stems carrying `validation_addendum_aware: true`: T3-002 PRAXIS_MOTIVATION_AMBIGUITY (the stem distinguishes virtue from convention — Adjustment 1's distinction bears on the resolution prose); RIT-E-003 evening-virtue-deficiency-pattern (the unity-check interpretation surfaces in evening reflection prose).

### Examples (illustrative, drawn from D8 + D17 + D19)

- *Unstable phronesis example.* Practitioner with strong longitudinal evidence of stable phronesis and dikaiosyne reports an instance where their patience (sophrosyne) wavered. Unity check fires (`unity_inconsistency: true`). Composite is not forced to weakest-link; the prose names developmental noise.
- *False phronesis example.* Practitioner whose profile shows `dominant_false_judgement: "recognition is genuinely good"` reports an instance where their action expresses generous (`dikaiosyne`-positive) framing of a reputation-driven choice. Unity check fires (`unity_inconsistency: true`); pattern matches the known false-judgement signature; composite propagates the inconsistency. The prose names the misidentification — phronesis-language wearing philodoxia.
- *Insufficient evidence example.* New practitioner (no longitudinal record). Unity check fires once. Without evidence to disambiguate, AC-17 `CONFIDENCE_WEIGHTED` fires; the prose carries the caveat per D19's per-surface specification.

## §2 — Adjustment 2: Rule 8 compound severity for INFLATION/DEFLATION same-root errors

### The pattern

Rule 8 (`VALUE-INDIFFERENT-001`) outputs `value_errors[]` — a list of independent error types: INFLATION (treating a preferred indifferent as genuinely good), DEFLATION (treating a dispreferred indifferent as genuinely bad), INVERSE_DEFLATION (treating a preferred indifferent as genuinely bad — the inverted case).

The drafted vocabulary does not name the **compound case** where two of these errors are two expressions of the same false root judgement. The primary example: craving recognition (INFLATION on the preferred indifferent of recognition) and fearing humiliation (DEFLATION on the dispreferred indifferent of humiliation) are two faces of one false judgement that recognition is genuinely good and humiliation is genuinely bad. Treating them as two independent errors under-states the severity.

### Architectural locus

Add a compound severity level to Rule 8's value-error vocabulary (per D8 Validation Addendum implementation guidance for Adjustment 2; full instantiation deferred to D8 v1.1.0 revision pass). The convention name: `COMPOUND_INFLATION_DEFLATION` with a severity weighting higher than either component error.

The detection logic identifies same-root pairs by checking whether two value errors target the same axis (preferred / dispreferred sides of the same indifferent). Implementation lives at Rule 8's Logic step at v1.1.0; the engine-sequencing dependency lives at D9 Dependency 4 (Rule 8 compound severity interaction).

### Runtime projection

Mechanism 10's composite proximity uses `value_errors[]` aggregated per Rule 8. When `COMPOUND_INFLATION_DEFLATION` fires, Mechanism 10's directional modifier (and ruling-faculty-state derivation) reflects the higher severity weighting. Layer 3 prose names the compound pattern as one false root judgement with two faces, not as two independent errors.

This is the **primary value-error pattern for the philodoxia profile** (per ES1) and for any practitioner whose dominant value-distortion is reputation-shaped. The recalibration assumption (per Scope limitation §5 below) applies — practitioners with different dominant passions may have different primary compound patterns; the compound severity level is a vocabulary expansion, the *threshold* is calibrated against ES1 and recalibrated per profile at coverage expansion time.

### What flags interact with this convention

- D9 Dependency 4 (engine sequencing — Rule 8 compound severity dependency on the per-passion same-root analysis).
- Rule 5 `dominant_false_judgement` (the profile-prior signal that identifies which compound pattern is the practitioner's primary).
- D17 progression-delta `value_error_pattern` signal (longitudinal tracking of compound-error-frequency reduction is a key progress measure).

### Examples (illustrative)

- *Philodoxia compound example.* Practitioner reports anxiety about an upcoming presentation. Rule 8 detects two errors: INFLATION on `reputation` (craving the audience's approval); DEFLATION on `humiliation` (fearing public failure). Same-root pair detected (both target the reputation-axis). `COMPOUND_INFLATION_DEFLATION` fires with severity weighting > sum of components. Mechanism 10's directional modifier reflects the compound severity; Layer 3 prose names the single false judgement underlying both expressions.
- *Non-compound example.* Practitioner reports two unrelated value errors — INFLATION on `wealth` and DEFLATION on `discomfort` (in an unrelated context). No same-root pair. `value_errors[]` carries both as independent entries; no compound flag fires.

## §3 — Adjustment 3: Rule 7 explicit operative-circle dependency on Rule 6

### The pattern

Rule 7 (`OIKEIOSIS-OBLIGATION-001`) takes Rule 6's circle outputs as inputs but does not specify *which* circle (stated or operative) it uses for obligation classification. Rule 6 explicitly distinguishes `primary_circle` (stated — the circle the practitioner names when describing the action) from `oikeiosis_contraction` (operative narrower than stated — the circle from which the action actually operates, when those differ).

Rule 7's obligation status must use the **operative circle** — not the stated circle. Otherwise the dikaiosyne classification in Rule 9 (which depends on accurate obligation status) silently uses whichever circle the upstream pass produced first, inheriting Rule 6's `STATED_OPERATIVE_CONFLICT` ambiguity.

### Architectural locus

Rule 7's Inputs section explicitly names "operative circle (per Rule 6 — `primary_circle` if `oikeiosis_contraction: false`; the contracted circle if `oikeiosis_contraction: true`)" as the input field. Rule 7's Logic states the dependency upfront. The seam between Rule 6's `STATED_OPERATIVE_CONFLICT` detection and Rule 9's dikaiosyne classification is closed by making the dependency explicit at Rule 7 rather than implicit at Rule 7 / explicit at Rule 9.

The engine-sequencing dependency lives at D9 Dependency 5b (Rule 7 explicit operative-circle dependency on Rule 6). At D8 v1.1.0 revision pass, Rule 7's per-rule section folds in the explicit input naming.

### Runtime projection

Layer 3 prose translates the operative-circle distinction. When `STATED_OPERATIVE_CONFLICT` fires at Rule 6 (the practitioner names one circle but the action operates from another), Layer 3 prose carries the distinction explicitly per D11's per-mechanism translation rules. The dikaiosyne classification in Rule 9 reads from Rule 7's operative-circle obligation status, ensuring the downstream prose names the dikaiosyne posture relative to the *actual* circle of operation.

### What flags interact with this convention

- D9 Dependency 5b (engine sequencing — Rule 7 reads operative circle from Rule 6).
- Rule 6 `STATED_OPERATIVE_CONFLICT` (the upstream flag that surfaces when stated and operative differ).
- Rule 9 dikaiosyne classification (the downstream rule whose accuracy depends on Rule 7 using the operative circle).
- D-A16 catalogue stem T2E-001 STATED_OPERATIVE_CONFLICT carries `validation_addendum_aware: true` (Adjustment 3 is the architectural reason this stem fires — when the engine detects stated-vs-operative ambiguity, the Tier 2 intake clarification stem invokes the practitioner to clarify which circle their action operates from).

### Examples (illustrative)

- *Stated = operative example.* Practitioner reports helping a colleague with a project. Stated circle: community (workplace). Operative circle: community (the action genuinely operates in the workplace context). Rule 6 produces `oikeiosis_contraction: false`; Rule 7 uses `primary_circle = community`. No conflict.
- *Stated ≠ operative example.* Practitioner reports "helping the team" by completing work that benefits primarily their own reputation. Stated circle: community. Operative circle: self (the action operates from self-interest). Rule 6 produces `oikeiosis_contraction: true`; `STATED_OPERATIVE_CONFLICT` fires. Rule 7 uses the contracted circle (self) for obligation classification. Rule 9's dikaiosyne classification reflects the actual operative posture, not the stated one.
- *Tier 2 clarification example.* Practitioner narrative is genuinely ambiguous — stated and operative could be either. T2E-001 STATED_OPERATIVE_CONFLICT stem fires; practitioner clarifies; the clarification feeds Rule 6's resolution; Rule 7 reads the resolved operative circle.

## §4 — Description correction: deterministic-for-rule-like + soft-gating-for-interpretive-core

### The convention

The alt-3 architecture is described accurately as:

> *"a deterministic engine for the rule-like components of Stoic reasoning, with honest soft-gating for the components that are not rule-like"*

Not as:

> *"a fully deterministic system"*

### Why this matters

The OPEN_DEFERRAL mechanism (AC-14) is honest precisely because it acknowledges that the deterministic frame does not reach the interpretive core. The architecture's design goal (per AC-13 / AC-14 / AC-17) is that every mechanism has a deterministic core; mechanisms that would otherwise be INTERPRETIVE are restructured (split into smaller mechanisms, or have their interpretive seams hoisted to Tier 1 intake clarification, or honestly soft-gated via Tier 3 deferral or AC-17 named flags).

Calling the system "fully deterministic" obscures the OPEN_DEFERRAL mechanism's load-bearing role and miscommunicates the architectural commitment. The corrected formulation preserves R19 (honest positioning) — the architecture does what it says it does and acknowledges where it doesn't.

### Where this convention applies

Apply the corrected formulation in:
- The alt-3 ADR (D1) at any standing-language site referencing "deterministic system."
- The architecture handoff (`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`) at standing-language sites — the Validation Addendum section already carries this correction.
- D8 Validation Addendum (v1.0.0) — already carries this correction.
- This catalogue (the canonical home).
- Future user-facing or developer-facing copy that describes the engine. "Deterministic where rules apply; honest soft-gating where they don't" is the standing summary.

The convention does **not** require retroactive editing of historical session closes or decision-log entries (per 0f append-only discipline). The convention applies prospectively.

## §5 — Scope limitation: philodoxia calibration; recalibration needed for other primary passions

### The convention

The 10 rules in D8's rule book are **calibrated against one practitioner profile** — philodoxia primary (the founder's profile per ES1). Severity weightings, prior probabilities, and compound-passion thresholds (including the new compound severity level introduced by Adjustment 2) reflect that calibration.

Other primary passions (philoplousia-strong, agonia-strong, penthos-strong) require **recalibration** before the rule book is applied across the full coverage envelope.

### Why this matters

This is a scope limitation, not a design flaw. ES1 (Zone 2 eval inputs include founder-profile inputs) already names the founder profile as the safety-critical first-user case. The architectural-level acknowledgement makes the calibration assumption explicit so:

- Phase-2 build proceeds against the founder's profile knowing the rule book is calibrated for it.
- Future coverage expansion to differently-passioned practitioners triggers a calibration pass, not a redesign.
- Worked examples in D8's per-rule sections that draw from philodoxia patterns, orge with children, agonia in catastrophising, and adjacent founder-profile passions are honest about their calibration scope.

### Coverage expansion path

Coverage of differently-passioned practitioners is deferred to:
- Phase 1's open-questions register (D23 — among the 28 open questions).
- Corpus expansion as a parallel track (D-A10 interaction logged in D-A16 catalogue's awareness flags; not blocking).
- A focused recalibration session at coverage-expansion time (post-launch; not Phase 1 / Phase 2 scope).

The convention does **not** prohibit using the rule book for differently-passioned practitioners during R&D or testing — it requires the recalibration assumption to be named at the time of use. Recalibration is a calibration pass, not a redesign.

## §6 — Where these patterns surface at runtime (cross-reference table)

| Adjustment / Convention | Engine-sequencing locus (D9) | Layer 3 projection locus (D11) | D-A16 catalogue stem flag | Other interactions |
|---|---|---|---|---|
| Adjustment 1 — Rule 9 unstable-vs-false phronesis | Rule 9 unity check + Rule 10 conditional interpretation | Refinement 5 (three named cases + AC-17 default) | T3-002 PRAXIS_MOTIVATION_AMBIGUITY (`validation_addendum_aware: true`); RIT-E-003 evening-virtue-deficiency-pattern (`validation_addendum_aware: true`) | D17 composite direction (breakthrough vs regression vs lateral movement); D19 CONFIDENCE_WEIGHTED activation case |
| Adjustment 2 — Rule 8 compound severity (INFLATION/DEFLATION same-root) | Dependency 4 (Rule 8 compound-severity dependency on per-passion same-root analysis) | Mechanism 10 directional modifier reflects compound severity; prose names single false judgement underlying two faces | (no dedicated flag — the compound vocabulary lives at Rule 8 itself) | D17 value_error_pattern signal; ES1 calibration (philodoxia primary case) |
| Adjustment 3 — Rule 7 operative-circle dependency on Rule 6 | Dependency 5b (Rule 7 reads operative circle from Rule 6) | Layer 3 prose carries STATED_OPERATIVE_CONFLICT distinction; dikaiosyne classification names operative posture | T2E-001 STATED_OPERATIVE_CONFLICT (`validation_addendum_aware: true`) | Rule 9 dikaiosyne classification (downstream) |
| Description correction (deterministic-for-rule-like + soft-gating) | n/a — convention applies to standing language, not runtime sequencing | n/a — applies to user/developer copy | n/a | AC-14 OPEN_DEFERRAL (the honest soft-gating mechanism); R19 honest positioning |
| Scope limitation (philodoxia calibration) | n/a — convention applies to recalibration discipline, not runtime sequencing | n/a — applies to per-rule worked examples | n/a | ES1 (founder profile); D23 §coverage expansion open question |

## §7 — Promotion provenance (PR8 — third-recurrence promotion)

The Validation Addendum's content reached the third-recurrence threshold per PR8 across the following Phase-1 design sessions since D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29:

1. **First recurrence — D8 Validation Addendum drafting (2026-05-02 morning, under D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED).** The Addendum text was drafted into D8's header section per the validation-driven amendment to D8. The three adjustments + description correction + scope limitation became part of D8 v1.0.0.

2. **Second recurrence — Phase-1 session-2 deliverables (D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02).** D9 (Dependency map — Dependencies 4 + 5b operationalise the engine-sequencing implications); D11 (Refinement 5 — Layer 3 prose projection for Adjustment 1); D13 (back-edge interaction notes referencing the Adjustment 3 operative-circle dependency); D14a / D14b (referencing the addendum awareness in their own design specifications).

3. **Third recurrence — Phase-1 session-3 deliverables and D-A16 catalogue (D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02 + D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02).** D17 (composite direction with profile-tension flag disambiguation drawing on Adjustment 1); D19 (full SELF_REPORT_DEPENDENT and CONFIDENCE_WEIGHTED specifications integrating with Adjustment 1 prose); D-A16 catalogue (three stems explicitly carrying `validation_addendum_aware: true` flags as catalogue-level acknowledgement).

The third recurrence — D-A16's three explicit `validation_addendum_aware: true` flags pointing at "the prose patterns these flags reference" — is the final trigger. The flags are catalogue-level acknowledgements; the prose patterns the flags point at have lived inline at D11 Refinement 5 plus D8 Validation Addendum. Promotion to a permanent architectural-conventions catalogue makes the patterns referable by ID rather than restated per deliverable, satisfying PR8 promotion's documentation-consolidation purpose.

This catalogue is the third-recurrence promotion artefact. PR8 promotion of subsequent observations (e.g., a v1.1.0 D8 revision pass folding the adjustments into per-rule sections) does not re-promote — it consumes this catalogue.

## §8 — Open questions / future revisions

1. **D8 v1.1.0 revision pass remains pending** (per D8's blocker text). The architecture-exercise transcript is the source for that revision when it lands. The revision will fold Adjustments 1, 2, 3 into D8's per-rule sections themselves; this catalogue persists as the standalone architectural reference. The transcript-faithful redo is named in D8's blocker per Q2 convention; not scheduled.

2. **Compound severity threshold calibration for non-philodoxia profiles** (per Scope limitation §5). When coverage expansion to philoplousia / agonia / penthos primary practitioners is undertaken, the COMPOUND_INFLATION_DEFLATION threshold (and the pair-detection logic for non-reputation-axis pairs) requires recalibration. Logged here for the calibration session; not Phase 1 / Phase 2 scope.

3. **Whether the operative-circle dependency convention generalises beyond Rule 7 → Rule 6** (per Adjustment 3). The current convention is stated as a Rule 7 obligation. If future analysis surfaces other rules that read circle outputs from Rule 6 (e.g., a Phase-2 longitudinal-pattern rule reading historic operative-circle data), the convention may extend to a generalised rule for any cross-rule circle-output read. Logged here for awareness; not blocking.

4. **Whether Adjustment 1's three-cases-plus-default disambiguation should add a fourth case** for "high confidence in unstable interpretation" (where longitudinal evidence is rich enough to confirm unstable phronesis specifically rather than fall back to AC-17 CONFIDENCE_WEIGHTED default). Today the prose lands on "unstable phronesis case" when the practitioner has stable phronesis history; the additional case would name explicit confidence in unstable rather than implicit. Whether this granularity adds value is a v1.1.0 question; logged here.

5. **Whether the description correction's "honest soft-gating" formulation should appear in user-facing copy at any surface** (e.g., on the marketplace page or the public limitations page once those land per P2 task 2e). Today the convention applies to architectural standing language; whether to surface it to users depends on whether the architectural framing is useful at the user surface or whether a different formulation serves the user better. Logged here for the limitations-page-design session.

---

*End of catalogue. The Validation Addendum content from D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 is now promoted to a permanent alt-3 architectural-conventions reference per PR8. Downstream alt-3 deliverables reference this catalogue rather than re-inlining the prose patterns. D8 retains v1.0.0 + Addendum until the v1.1.0 revision pass folds the adjustments into per-rule sections.*
