# ATL Wrapper — Kathekon-Aligned Alternative Design

**Status:** Adopted 2026-05-16 under `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16`. **Implementation status:** Designed (per 0a vocabulary) — the seven decisions below are specified, not built; the kathekon-aligned alternative build session is the next sub-session in the post-6b arc.
**Stream:** founder.
**Governs:** The build spec for the kathekon-aligned alternative build session (step 6 of 8 in the post-6b arc) — `code-elevated` risk classification expected (additive `AccreditationRecord` / `AccreditationPayload` field; new aggregator computation; new module / type surface; Supabase column addition; hand-back report rendering additions; no new Layer 1 contract). The seven decisions below MUST be implemented as specified; the build session has discretion on file paths, helper naming, and test structure within those constraints.
**Does not govern:** the items 1–3 build (steps 2–3 — already complete and Verified at type-check); the trajectory-enriched developer hand-back report (step 4 — already complete and Verified at type-check); the write-path into `agent_accreditation` (step 7 — separate session); A10 per-agent credentials (step 8 — separate session); the Layer 1 asked-question multiple-choice (separate design pass, sequenced for the onboarding-framework).
**Sequencing:** step 5 of 8 in the post-6b arc per `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md`. Predecessor: trajectory-enriched developer hand-back report (`D-HAND-BACK-REPORT-WIRED-VERIFIED-2026-05-16`). Successor: kathekon-aligned alternative build session.

---

## Scope

**In scope (this design):** Seven locked design decisions defining the kathekon-aligned alternative as an additive parallel credential beside proximity. The alternative recovers the kathekon signal — whether the agent's action was the appropriate-in-the-circumstances fitting act — as a load-bearing observable credential, while preserving the existing proximity-driven grade / authority / dimension / trajectory machinery untouched.

- **Decision A** — Relationship to proximity (Q1)
- **Decision B** — Aggregation model (Q2)
- **Decision C** — Credential placement on `AccreditationRecord` + `AccreditationPayload` (Q3)
- **Decision D** — Authority impact (Q4)
- **Decision E** — Layer 1 implications (Q5)
- **Decision F** — R18a category language (Q6)
- **Decision G** — Hand-back report surface (Q7)

**Out of scope:** code (build session); the write-path session (step 7); A10 (step 8); changes to the proximity-derived grade engine, authority mapper, or dimension levels; changes to the Senecan grade ladder; changes to the J1 ADR's Character Kernel category framing; the eight-of-eight items 1–3 question-set's Q8 (public endpoint shape — folded into Decision C below) and Q9 (wrapper iteration patterns — deferred under PR7).

---

## The underlying motivation

The substrate's Layer 2 assessment produces two parallel signals about each evaluated action. **`katorthoma_proximity`** measures HOW the agent reasoned — the cognitive quality of the act, on the Stoic katorthoma–reflexive ladder (`reflexive` / `habitual` / `deliberate` / `principled` / `sage_like`). **`is_kathekon`** + **`kathekon_quality`** measure WHETHER the act was the appropriate-in-the-circumstances fitting act (boolean plus `strong` / `moderate` / `marginal` / `contrary`).

Both signals are Stoic-canonical. They answer different questions. An agent might be high-proximity but consistently non-kathekon (highly considered acts that are nonetheless inappropriate in context). Or low-proximity but consistently kathekon (reflexive acts that nonetheless hit the mark). The proximity-only credential collapses these distinctions.

This design recovers the kathekon signal as a parallel credential, additive to the existing proximity-driven credential, without rebasing the existing build.

---

## Decision A — Relationship to proximity

### Why

The kathekon-aligned alternative must choose how it relates to proximity: replace it, run parallel to it, blend with it, or some other configuration. The choice cascades through every subsequent decision.

### Elected position

The kathekon-aligned alternative is a **parallel credential alongside proximity**. Proximity remains the load-bearing signal for grade (Senecan), authority, dimension levels, direction of travel, and the trajectory machinery — every piece Verified through 6b stays as it is. Kathekon gets its own credential field surfaced on the same `AccreditationRecord` and `AccreditationPayload`, computed by the same window aggregator, projected into the same hand-back report surfaces — but it does NOT drive grade, authority, or trajectory.

### Why this and not the alternatives

The relationship-to-proximity question had four candidate answers:

- **(a) Complete replacement.** Kathekon becomes load-bearing; proximity becomes informational. Rejected because the architectural cost is high (grade engine, authority mapper, dimension levels, direction of travel all rebase) and the existing 6b-Verified machinery would retire — including Decision A's `typical_deliberation_breadth` which landed today. The proximity signal would be lost.
- **(b) Parallel credential alongside.** *Adopted.* Additive; preserves the existing build; closest structural precedent is Decision A (the deliberation-breadth credential added today, which uses exactly this pattern); R18a-honest about what each signal measures.
- **(c) Composite signal.** Proximity and kathekon blended into one hybrid grade. Rejected because blending collapses the very distinction this design exists to preserve. Blending logic would itself become load-bearing and R18d-adversarial-test-fragile; R4 boundary fuzzier.
- **(d) Something else.** Not elected — the founder chose (b).

### Structural constraint

The substrate's existing `EvaluatedAction` shape already carries `is_kathekon: boolean` and `kathekon_quality: 'strong' | 'moderate' | 'marginal' | 'contrary'` per the 3 April 2026 ATL build (ported into `website/src/lib/substrate/trust-layer/types/evaluation.ts` on 2026-05-15). The raw signals are already in the substrate. What this design adds is an aggregation + a credential field projecting from it — no new raw input is needed.

### R-rule engagement

R0 (the kathekon trajectory now appears in the audit trail of how the agent reasoned over time, alongside the proximity trajectory); R4 (the engine internals stay closed — the aggregation threshold, like proximity's threshold, is internal IP); R18a (the parallel credential is an R18a-honest observable reasoning pattern within the Character Kernel umbrella — see Decision F); R18c (additive to the `AccreditationPayload` schema — third-party verifiers that don't parse the new field are unaffected, exactly like Decision A).

---

## Decision B — Aggregation model

### Why

If the kathekon credential lives on the window-aggregated record, the window aggregator must compute it from the per-action `kathekon_quality` field already on `EvaluatedAction`. The aggregation model determines the credential's shape and its sibling fields on `WindowSnapshot`.

### Elected position

The aggregator computes a **`typical_kathekon_quality: KathekonQuality`** — the most-common-qualifying bucket across the window, using the same threshold pattern as `typical_proximity` (the existing `typical_proximity_threshold` convention — 60% of actions at or above the level). Alongside it, `WindowSnapshot` gains a **`kathekon_quality_distribution: Record<KathekonQuality, number>`** mirroring the existing `proximity_distribution` and `deliberation_breadth_distribution`.

### Why this and not the alternatives

The aggregation question had three candidate answers:

- **`typical_kathekon_quality` (mirroring `typical_proximity` / `typical_deliberation_breadth`).** *Adopted.* Qualitative (R6c); engine threshold stays internal (R4); follows the established structural pattern; R18a-honest qualitative bucket.
- **`kathekon_compliance_grade`** mapping the existing `kathekon_compliance_rate` (0-1 number) to a four-level grade. Rejected because `kathekon_compliance_rate` is already partly consumed by the `judgement_quality` dimension — risks double-counting; flattens the four-level quality enum's distinctions (strong vs moderate) into a rate-only signal.
- **`quality-weighted_kathekon_score`** as a numeric score (strong=4 / moderate=3 / marginal=2 / contrary=1; window average). Rejected because numeric output conflicts with R6c (qualitative levels only); R4 fuzzier (the number IS the engine output); breaks the pattern set by `typical_proximity` and `typical_deliberation_breadth`.

### Structural constraint

The `KathekonQuality` enum already exists in `/website/src/lib/translation-sandwich/layer2-mechanisms.ts`: `'strong' | 'moderate' | 'marginal' | 'contrary'`. The same enum value is already carried on `EvaluatedAction.kathekon_quality` per the bridge. No new type is needed — the existing enum is re-exported from `trust-layer/types/evaluation.ts` for use on `WindowSnapshot` + `AccreditationRecord` + `AccreditationPayload`.

### Field shape (target shapes for the build session)

```ts
// trust-layer/types/evaluation.ts — re-export the existing KathekonQuality enum
import type { KathekonQuality } from '../../../translation-sandwich/layer2-mechanisms'

// (or duplicate the enum literal type if the cross-module import is not preferred —
//  build-session call; the enum is small and stable)

// WindowSnapshot extension
export type WindowSnapshot = {
  // … existing fields including kathekon_compliance_rate …
  readonly kathekon_quality_distribution: Record<KathekonQuality, number>
  readonly typical_kathekon_quality: KathekonQuality
}
```

The window aggregator (`evaluation-window/window-aggregator.ts`) gains:

```ts
// Mirror computeDeliberationBreadthDistribution + computeTypicalDeliberationBreadth.
function computeKathekonQualityDistribution(window: EvaluatedAction[]): Record<KathekonQuality, number>
function computeTypicalKathekonQuality(
  distribution: Record<KathekonQuality, number>,
  totalActions: number,
  threshold: number,
): KathekonQuality
```

The threshold reuses `WindowConfig.typical_proximity_threshold` (the same 60% convention) — no new config field. The build session may add a `typical_kathekon_quality_threshold` if a different threshold proves needed in practice; this design does not.

### Aggregation semantics

`typical_kathekon_quality` is the highest-quality bucket whose cumulative share (at-or-above) meets or exceeds the threshold. Same direction-of-rank as `KathekonQuality`'s domain order: `strong > moderate > marginal > contrary`. If no bucket qualifies, the conservative-baseline value is `'contrary'` (mirrors how `typical_deliberation_breadth` defaults to `'intuited'` — the no-evidence-yet baseline).

### Empty-window behaviour

When `actions_in_window === 0`, the distribution is `{ strong: 0, moderate: 0, marginal: 0, contrary: 0 }` and `typical_kathekon_quality` is `'contrary'` (the conservative baseline; same pattern as Decision A's `'intuited'` baseline).

### R-rule engagement

R4 (engine internals stay closed — the aggregation threshold is internal); R6c (qualitative levels only — the enum is the output, no numeric average); R18c (additive to `WindowSnapshot`'s field set; third-party `WindowSnapshot` consumers — currently the grade-transition engine and the hand-back report — unaffected by the new fields).

### Layer 1 implication

None. The signal is computed from existing per-action data already on `EvaluatedAction` via the existing bridge.

---

## Decision C — Credential placement on AccreditationRecord + AccreditationPayload

### Why

If the kathekon credential is going to be observable to third-party verifiers (which is the point — R18a-honest reasoning-pattern credential), it must live on the public payload shape served by `/api/accreditation/[agent_id]`. The placement question is whether it lives as a flat field (the Decision A pattern), as a parallel grade, or as a new fifth progress dimension.

### Elected position

`AccreditationRecord` and `AccreditationPayload` both gain a single new field: **`typical_kathekon_quality: KathekonQuality`**. No parallel `SenecanGradeId`. No new fifth progress dimension. The existing `senecan_grade`, `dimension_levels`, `authority_level`, and `direction_of_travel` fields stay proximity-driven and unchanged.

### Why this and not the alternatives

The placement question had three candidate answers:

- **Typical-bucket field only.** *Adopted.* Lowest friction; mirrors Decision A's `typical_deliberation_breadth` shape exactly; R4-clean (the bucket is the qualitative reporting level — internal thresholds stay private); R18c-additive (third-party verifiers that don't parse the new field are unaffected).
- **Parallel Senecan grade** (`kathekon_grade: SenecanGradeId` alongside `senecan_grade`). Rejected because `SenecanGradeId` is tied to proximity by design (`PROXIMITY_TO_GRADE` mapping in the grade engine); decoupling it for kathekon would be a much larger architectural change. The marketing surface gets confusing ("two grades?").
- **New fifth progress dimension** (`kathekon_alignment: DimensionLevel` joining the four). Rejected because `judgement_quality` already partly consumes kathekon-quality rate — risks double-counting unless `judgement_quality` is rebased. Changes the dimension count, itself a load-bearing piece of the existing framework.

### Structural constraint

The grade-transition engine reads `typical_proximity` to compute `senecan_grade` and `authority_level`. It does NOT consume `typical_kathekon_quality`. The build session must ensure the engine's three transition paths (no-transition, upgrade, downgrade) thread `typical_kathekon_quality` from the snapshot into the updated record (mirrors how `typical_deliberation_breadth` was threaded under Decision A), but the engine logic itself remains proximity-driven.

### Field shape

```ts
// trust-layer/types/accreditation.ts — AccreditationRecord extension
export type AccreditationRecord = {
  // … existing fields including typical_proximity, senecan_grade, authority_level,
  //   dimension_levels, direction_of_travel, typical_deliberation_breadth …
  readonly typical_kathekon_quality: KathekonQuality
}

// trust-layer/types/accreditation.ts — AccreditationPayload extension (R4-compliant subset)
export type AccreditationPayload = {
  // … existing fields …
  readonly typical_kathekon_quality: KathekonQuality
}
```

`createAccreditationRecord` (in `accreditation/accreditation-record.ts`) seeds the new field to `'contrary'` (conservative baseline matching the empty-window aggregation). `buildAccreditationPayload` projects the field into the public payload. `CreateAccreditationOptions` gains an optional `starting_kathekon_quality?: KathekonQuality` (mirrors `starting_deliberation_breadth` from Decision A).

### Aggregation → record threading

The grade-transition engine's three transition paths (no-transition, upgrade, downgrade) each spread `typical_kathekon_quality: snapshot.typical_kathekon_quality` into the returned record (mirrors how each path threads `typical_deliberation_breadth` under Decision A).

### Supabase persistence

The `agent_accreditation` table gains one column: `typical_kathekon_quality text not null default 'contrary'`. Additive, idempotent, empty-table-safe — same pattern as Decision A's `typical_deliberation_breadth` migration. The row mapper (`atl-accreditation-store.ts`) reads and writes the new column.

### Public endpoint shape (the folded-in Q8)

`/api/accreditation/[agent_id]` automatically gains the new field via the payload-projection — no separate endpoint, no parallel `kathekon_payload`. The endpoint's existing response shape simply has one additional field. R18c-additive: third-party verifiers parse the new field if they want it, ignore it otherwise.

### R-rule engagement

R3 (no new disclaimer needed — the existing accreditation disclaimer covers the new field as part of the same evaluation surface); R4 (engine internals stay closed; only the qualitative bucket crosses); R18a (the new field is an observable reasoning pattern within Character Kernel — see Decision F); R18b (the badge already documents what it measures and its limitations; the new field gets one paragraph in the badge documentation); R18c (additive — schema versions by one short field, exactly the Decision A pattern); R18e (NOT engaged at the credential level — no raw Layer 3 prose).

### Layer 1 implication

None.

---

## Decision D — Authority impact

### Why

The `authority_level` field is the operationally consequential field on the accreditation record — it governs what the agent can do (`supervised` → every action pre-checked; `full_authority` → widest scope). The question is whether the kathekon credential affects authority.

### Elected position

**No authority impact.** `authority_level` stays driven by `typical_proximity` via the existing `proximityToAuthority` mapping. The kathekon credential is observable on the record + payload but does not modulate operational permissions.

### Why this and not the alternatives

The authority question had three candidate answers:

- **No authority impact.** *Adopted.* Cleanest split between credential signal (kathekon) and operational permission (proximity-derived authority). If future evidence shows kathekon must affect authority, that is a follow-on design pass.
- **Modulate existing authority** (consistent non-kathekon downgrades the proximity-derived level). Rejected because this is composite-flavoured — inconsistent with Decision A's parallel-credential election; the modulation rule itself needs design (what threshold? when fires? does it propagate through `GradeChangeEvent`s?); R4 boundary needs careful audit on the modulation logic.
- **Parallel kathekon-derived authority** (`kathekon_authority_level` alongside `authority_level`). Rejected because it doubles the operationally consequential surface; consumer must reconcile which authority governs which action; over-engineered for the alternative's design pass scope.

### R-rule engagement

R4 (the operational permission surface stays clean — no new internal modulation logic to defend against R4 leakage); R18a (the credential is honestly informational — it tells the consumer what the agent typically demonstrated; it does NOT tell the consumer what the agent is permitted to do, which the existing authority_level already says).

### Layer 1 implication

None.

### Deferred under PR7

A future design pass may revisit kathekon's relationship to authority. The revisit condition: evidence that the alternative's credential field is being interpreted by consumers as an authority signal, OR a feature requirement to gate authority on kathekon. Until then, no authority impact.

---

## Decision E — Layer 1 implications

### Why

If the kathekon credential is computed from existing per-action data already on `EvaluatedAction`, the Layer 1 contract may or may not need to change. The build session needs to know up front whether Rule A (licensing gate) is engaged.

### Elected position

**No new Layer 1 fields.** The raw signals (`is_kathekon` + `kathekon_quality`) already live on `EvaluatedAction` per the existing bridge (`atl-bridge.ts`'s `mapLayer2AssessmentToEvaluatedAction`). The window aggregator gains one new computation (the Decision B aggregation) using existing per-action data. The `Layer1Schema` contract is unchanged.

### Why this and not the alternatives

The Layer 1 question had three candidate answers:

- **No new Layer 1 fields.** *Adopted.* Mirrors Decision A's structural pattern (Decision A also added no Layer 1 field — only Decision B's `carried_candidates` triggered the v1→v2 schema bump). Rule A NOT engaged. No open-source release coordination needed.
- **New field on `carried_profile` payload.** Rejected because the data is already derivable from the snapshot; arguably already implicit if `WindowSnapshot` serialises via the wrapper's existing mechanisms.
- **New `kathekon_history` payload.** Rejected because it is heavyweight; triggers a Layer 1 schema version bump (v2 → v3); Rule A engagement; architecturally a sibling-class to `carried_profile` when the data is already a strict subset of it.

### Structural constraint

`Layer1Schema` is currently at `'layer1-schema-v1' | 'layer1-schema-v2'` (per Decision B's bump). This design does NOT bump the version further. v2 remains the current schema after this design's build session.

### R-rule engagement

R4 (engine internals stay closed — the aggregation is computed inside the substrate's trust-layer); AC8 (translation-sandwich substrate — all changes route through the established Layer 1 / Layer 2 / Layer 3 surfaces without a Layer 1 contract change).

### Layer 1 implication

Stated explicitly: **none.** No version bump. No Rule A engagement. No licensing-gate coordination this session.

---

## Decision F — R18a category language

### Why

The J1 ADR (`/adopted/adr/2026-05-12-substrate-category-character-kernel.md`) locked "Character Kernel" as SageReasoning's substrate-category label. If the kathekon-aligned alternative introduces a new credential signal, does it require new category language?

### Elected position

**No R18a category change.** The Character Kernel umbrella accommodates both proximity (HOW the agent reasoned) and kathekon (WHETHER the act was fitting). The R18a-honest disclaimer ("not safety, ethics, or trustworthiness in any absolute sense") covers both signals without modification.

### Why this and not the alternatives

The category-language question had three candidate answers:

- **No change — Character Kernel accommodates both signals.** *Adopted.* The Character Kernel framing is "observable reasoning patterns evaluated against the Stoic philosophical framework." Both proximity and kathekon are observable reasoning patterns under that umbrella. No ADR change needed.
- **Sub-category within Character Kernel.** Rejected because it introduces nomenclature debt; the J1 ADR doesn't currently define sub-categories; marketing copy gains a second term to explain to the agent-platform-operator audience.
- **Separate category label** (e.g., "Right Action Kernel"). Rejected because it requires a J2 ADR mirroring J1's bar (ST2-level election with peer-category-landscape analysis); dilutes the J1 Character Kernel commitment; risks confusing the agent-platform-operator audience.

### Structural constraint

The J1 ADR's revisit conditions are explicit: peer rebrand overlapping, "kernel" framing shown not to fit at Stage 3+, market evidence after first marketplace listing, or Anthropic Plugin spec terminology drift. None of these are triggered by adding a second credential field to the same payload — the category framing is unchanged.

### R-rule engagement

R18a (the existing Character Kernel category language stays operative; the new credential is one more observable reasoning pattern under the umbrella); R18b (the badge documentation gains one paragraph describing what `typical_kathekon_quality` measures and its limitations, alongside the existing documentation of `typical_proximity` and `typical_deliberation_breadth`).

### Layer 1 implication

None.

---

## Decision G — Hand-back report surface

### Why

The trajectory-enriched developer hand-back report (built today and Verified at type-check under `D-HAND-BACK-REPORT-WIRED-VERIFIED-2026-05-16`) is the developer's view of their wrapped agent. The kathekon credential needs a placement strategy in that report's five fixed sections.

### Elected position

**Mirror Decision A's three-placement pattern.** The kathekon credential surfaces in three places on the hand-back report, matching how Decision A's `typical_deliberation_breadth` is rendered:

1. **Section 1 (per-decision rows).** Already carries per-decision kathekon notation (`kathekon (strong)` / `non-kathekon (marginal)`) per the hand-back report build's Step 1 election #4. **No change** — Section 1 is already complete.
2. **Section 2 (trajectory headline + distribution).** Gains a `typical_kathekon_quality` headline line and a `kathekon_quality_distribution` line, mirroring how `typical_deliberation_breadth` + `deliberation_breadth_distribution` are rendered in Section 2 today.
3. **Section 3 (grade / authority / badge).** Picks up the new `typical_kathekon_quality` field automatically from the `AccreditationPayload` projection — `renderGradeSection(payload)` already iterates the payload-shape fields, so the new field surfaces with a one-line addition to that helper.

### Why this and not the alternatives

The hand-back surface question had three candidate answers:

- **Mirror Decision A's three-placement pattern.** *Adopted.* Cleanest consistency; uses surfaces already established; per-decision rows in Section 1 are already done; Section 2 + Section 3 each gain a small addition matching existing precedent.
- **Section 3 only.** Rejected because it loses the trajectory-level visibility that makes Decision A's headline informative — consumer would have to look up the credential field to learn what the session typically demonstrated.
- **New Section 3.5 "Kathekon Credential" sub-section.** Rejected because heavier section structure introduces inconsistency with how Decision A surfaced; the five fixed sections were just adopted in the hand-back build — changing section count again so soon is high friction.

### Structural constraint

The hand-back report's signature is pure + synchronous + deterministic given a supplied snapshot. The Section 2 + Section 3 additions are purely formatting additions — no new I/O, no new clock reads, no LLM calls. The build session implements them as additional Markdown lines in the existing `renderTrajectorySection(snapshot)` and `renderGradeSection(payload)` helpers.

### Field rendering specification (target lines for the build session)

**Section 2 (trajectory) additions.** Mirror the existing `typical_deliberation_breadth` headline line:

```
- Typical kathekon quality: **strong** (60% of evaluated actions at or above)
- Kathekon quality distribution: strong 12 · moderate 8 · marginal 4 · contrary 1
```

**Section 3 (grade / authority / badge) addition.** Mirror the existing `typical_deliberation_breadth` line in the payload-shape rendering:

```
- Typical kathekon quality: **strong**
```

(The exact text formatting is build-session discretion within these constraints.)

### R-rule engagement

R3 (no new disclaimer — the existing report signoff covers); R4 (the rendered fields are R4-compliant — only qualitative buckets cross, no thresholds, no engine micro-logic); R18a (the rendered language stays under the Character Kernel umbrella per Decision F); R18b (the report's existing R19c limitations URL covers); R18e (NOT engaged at the report level — no raw Layer 3 prose); R19c + R19d (no change to the existing preamble wraps).

### Layer 1 implication

None.

---

## Build-session implementation summary (for the kathekon-aligned alternative build session)

The build session implements all seven decisions as a single Elevated-risk build (paralleling the items 1–3 build's shape). The expected file changes:

| File | Change |
|---|---|
| `/website/src/lib/substrate/trust-layer/types/evaluation.ts` | Re-export or duplicate the `KathekonQuality` type; add `kathekon_quality_distribution` + `typical_kathekon_quality` to `WindowSnapshot` (Decision B). |
| `/website/src/lib/substrate/trust-layer/types/accreditation.ts` | Add `typical_kathekon_quality` to `AccreditationRecord` + `AccreditationPayload` (Decision C). |
| `/website/src/lib/substrate/trust-layer/evaluation-window/window-aggregator.ts` | Add `computeKathekonQualityDistribution` + `computeTypicalKathekonQuality`; thread the two new fields into the returned `WindowSnapshot` (Decision B). |
| `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` | Thread `typical_kathekon_quality` from snapshot into the returned record on all three transition paths (Decision C). |
| `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` | Seed `typical_kathekon_quality: 'contrary'` in `createAccreditationRecord`; project it in `buildAccreditationPayload`; extend `CreateAccreditationOptions` with `starting_kathekon_quality?` (Decision C). |
| `/website/src/lib/substrate/atl-accreditation-store.ts` | Add the new column to `AgentAccreditationRow`; write it in `accreditationRecordToRow`; read it in `rowToAccreditationRecord` (Decision C). |
| `/website/supabase-agent-accreditation-typical-kathekon-quality-migration.sql` (NEW) | Additive `ALTER TABLE … ADD COLUMN IF NOT EXISTS typical_kathekon_quality text NOT NULL DEFAULT 'contrary'`; idempotent, empty-table-safe (Decision C). |
| `/website/src/lib/substrate/agent-hand-back-report.ts` | Add the trajectory + grade-section lines (Decision G). |
| Test files (existing + new) | Extend fixtures (`makeAssessment`, `makeFixedSnapshot`, `withFixedRecordTimestamps`, the route test's `SAMPLE_PAYLOAD` + `SAMPLE_RECORD`) to supply the new field; add WINDOW-* tests for the aggregator's new computation; add RECORD-* / PAYLOAD-* tests for the credential placement; add RENDER-* tests for the Section 2 + Section 3 additions to the hand-back report. PR2 build-to-wire immediate. |

Decisions A, D, E, F do not directly produce file changes — they are the design's framing decisions (the relationship-to-proximity election, the no-authority-impact election, the no-Layer-1-change election, the no-category-change election). Each is recorded in the build session's decision-log entry under `Reasoning`.

Expected risk classification: **Elevated** (additive schema changes, new column, hand-back report rendering additions). PR1 single-build proof: all seven decisions land in one session. PR15 consult: identical justification to Decision A's — the structural pattern is Decision A's; the new field, aggregator helpers, and rendering additions parallel exactly. No Anthropic primitive substitutes.

---

## Cross-references

- `/operations/decision-log.md` — `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16` (this design's adoption record).
- `/operations/handoffs/founder/2026-05-16-kathekon-aligned-alternative-design-pass-close.md` — this session's close.
- `/operations/handoffs/founder/2026-05-16-hand-back-report-close.md` — immediate predecessor session close.
- `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — sequencing source (step 5 of 8 in the post-6b arc).
- `/adopted/atl-items-1-3-design.md` — structural precedent and pattern source for Decisions B + C + E + G (the `typical_deliberation_breadth` pattern this design mirrors).
- `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — the Wrapper spec; especially §"Component 2 — The Layer 3 agent-mode rendering", §"Component 3 — The Badge / Accreditation", §"Component 4 — Trajectory awareness", §"The report the agent hands back to the developer", §"R-rule engagement".
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category language; Decision F's no-change basis).
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` — `KathekonAssessment` + `KathekonQuality` shape (the raw signal source).
- `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — `EvaluatedAction` + `WindowSnapshot` shape (extended for Decision B).
- `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — `AccreditationRecord` + `AccreditationPayload` shape (extended for Decision C).
- `/website/src/lib/substrate/trust-layer/evaluation-window/window-aggregator.ts` — the aggregator (extended for Decision B).
- `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` — the grade engine (threads the new field, unchanged in logic).
- `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — record builder + payload projector (extended for Decision C).
- `/website/src/lib/substrate/agent-hand-back-report.ts` — the hand-back renderer (extended for Decision G).
- `/manifest.md` — R0 (kathekon trajectory honesty), R3 (disclaimer), R4 (IP boundary), R6c (qualitative levels), R18a (Character Kernel honest credential), R18b (badge transparency), R18c (interoperability), R18e (NOT engaged at credential level), AC8 (translation-sandwich substrate), PR1, PR7, PR10, PR11, PR15.

---

*End of design document. Status: Adopted 2026-05-16 (decision); Designed (implementation). The kathekon-aligned alternative build session opens against this document + `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16` as the spec.*
