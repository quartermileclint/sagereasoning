# ADR-Ring-2-01 — MentorProfile vs MentorProfileData Shape Adapter

**Status:** Accepted — founder approved on 25 April 2026 (selected Option C with MentorProfile canonical, C-α field placement). Implementation deferred to subsequent sessions per the staged transition in §7. Located at `/compliance/`.
**Date:** 2026-04-25
**Version history:** v1 (Option A recommendation) archived to `/archive/2026-04-25_ADR-Ring-2-shape-adapter_v1-Option-A-recommendation.md` after the founder selected Option C with MentorProfile canonical. v2 draft promoted from `/drafts/ADR-Ring-2-shape-adapter.md` to this file on adoption.
**Related rules:** R17 (intimate data — encryption pipeline; specifically R17b application-level encryption, R17c genuine deletion, R17f implementation safety), PR1 (single-endpoint proof before rollout), PR3 (safety systems are synchronous), PR6 (safety-critical changes are Critical risk), PR7 (deferred decisions are documented).
**Supersedes:** —
**Superseded by:** —
**Related decisions:** D-Ring-2 (carried from 2026-04-25 ring-wrapper session), D-PE-2 (a) (deferred under D-PE-2 in the 2026-04-25 pattern-engine handoff), ADR-R17-01 (profile-store retrieval cache — adopts v1 of `loadMentorProfile()`'s wrapping; this ADR changes the wrapped function's return type, so coordination is required).

---

## 1. Context

The website has two profile shapes that describe the same practitioner:

- **`MentorProfile`** — defined in `/sage-mentor/persona.ts`. Consumed by the Ring Wrapper (`executeBefore`, `executeAfter`, `buildBeforePrompt`, `buildAfterPrompt`), pattern-engine (`analysePatterns`, regression detection, narrative-prompt building), persona builders (morning check-in, evening reflection, weekly mirror), and journal-ingestion / reflection-generator / proactive-scheduler / llm-bridge / support-agent / mentor-ledger inside `/sage-mentor/`.
- **`MentorProfileData`** — defined in `/website/src/lib/mentor-profile-summary.ts`. Returned by `loadMentorProfile()` in `/website/src/lib/mentor-profile-store.ts`, which is the only retrieval function for the persisted (encrypted) profile. Consumed by `/api/founder/hub`, `/api/mentor/private/reflect`, `/api/mentor-baseline-response`, `/api/mentor-profile`, and the practitioner-context / private-mentor-context loaders.

The two shapes are similar but not identical (full enumeration in §2 below). The mismatch is the blocker preventing live-profile-driven integration of:

1. **Ring Wrapper** — currently exercised on `/api/mentor/ring/proof` using a TEMPORARY hand-constructed `PROOF_PROFILE: MentorProfile` fixture in `/website/src/lib/mentor-ring-fixtures.ts`.
2. **Pattern-Engine** — wired into the same proof endpoint as of 2026-04-25, augmented by a TEMPORARY `PROOF_INTERACTIONS: InteractionRecord[]` fixture in the same file.

Both fixtures' file headers explicitly mark them TEMPORARY, retiring when the live loader and the shape adapter land.

This ADR resolves the shape question once for both subsystems. It does not write code. It does not change R17 itself. It changes `loadMentorProfile()`'s return type (Critical surface — consumes encryption-pipeline output and is on the live request path of safety-critical surfaces). The eventual code changes are staged across multiple sessions under PR1.

## 2. Side-by-side type comparison

### 2.1 Top-level fields

| Field | `MentorProfile` (sage-mentor) | `MentorProfileData` (website) | Status |
|---|---|---|---|
| `user_id` | string | string | Equivalent |
| `display_name` | string | string | Equivalent |
| `journal_name` | — | string | Website-only |
| `journal_period` | — | string | Website-only |
| `sections_processed` | — | number | Website-only |
| `entries_processed` | — | number | Website-only |
| `total_word_count` | — | number | Website-only |
| `founder_facts` | — | `FounderFacts \| undefined` | Website-only |
| `passion_map` | `PassionMapEntry[]` (sage shape) | `PassionMapEntry[]` (website shape) | Differs (entry-level — see §2.2) |
| `causal_tendencies` | `CausalTendency[]` | `{ primary_breakdown, description, specific_breakdowns }` | Differs (array-of-objects vs single record) |
| `value_hierarchy` | `ValueHierarchyEntry[]` | `{ explicit_top_values, primary_conflict, classification_gaps }` | Differs (array-of-objects vs summary record) |
| `oikeiosis_map` | `OikeioisMapEntry[]` | `Record<circle, { level, evidence }>` | Differs (array vs keyed record) |
| `virtue_profile` | `VirtueDomainAssessment[]` | `Record<virtue, VirtueEntry>` | Differs (array vs keyed record) |
| `senecan_grade` | `'pre_progress' \| 'grade_3' \| 'grade_2' \| 'grade_1'` | inside `proximity_estimate.senecan_grade` (string) | Differs (location, type strictness) |
| `proximity_level` | `KatorthomaProximityLevel` | inside `proximity_estimate.level` (string) | Differs (location, type strictness) |
| `proximity_estimate.description` | — | string | Website-only |
| `dimensions` | `DimensionScores` (4 fields, levels) | — | Sage-only |
| `direction_of_travel` | `'improving' \| 'stable' \| 'regressing'` | — | Sage-only |
| `persisting_passions` | `string[]` | — (computable from `passion_map` frequency) | Sage-only (denormalised from `passion_map`) |
| `preferred_indifferents` | `string[]` | `preferred_indifferents_aggregate: string[]` | Equivalent (renamed) |
| `journal_references` | `JournalReference[]` | — | Sage-only |
| `current_prescription` | `ProgressionPrescription \| null` | — | Sage-only |
| `last_interaction` | string (timestamp) | — | Sage-only |
| `interaction_count` | number | — | Sage-only |

### 2.2 PassionMapEntry comparison

| Field | sage-mentor | website | Status |
|---|---|---|---|
| `passion_id` | string | string | Equivalent |
| `sub_species` | string | string | Equivalent |
| `root_passion` | union of 4 (`epithumia\|hedone\|phobos\|lupe`) | string (broader) | Differs (typing strictness) |
| `false_judgement` (singular) | string | — | Sage-only |
| `false_judgements` (plural) | — | `string[]` | Website-only |
| `frequency` | union of 4 (`rare\|occasional\|recurring\|persistent`) | number 1–12 | Differs fundamentally |
| `max_intensity` | — | string | Website-only |
| `sections_present` | — | `string[]` | Website-only |
| `first_seen` | string | — | Sage-only |
| `last_seen` | string | — | Sage-only |
| `journal_references` | `string[]` | — | Sage-only |

### 2.3 The two shapes serve different epistemic models

This explains why the mismatch is broad rather than narrow.

- **`MentorProfile`** is a *current-state* shape. It carries denormalised aggregates the ring uses live (e.g., `persisting_passions`, `current_prescription`, `direction_of_travel`, `dimensions`, `interaction_count`, `last_interaction`). Each passion entry carries temporal observation pointers (`first_seen`, `last_seen`, `journal_references[]`) for use during reasoning.
- **`MentorProfileData`** is a *journal-ingestion-output* shape. It carries provenance counts (`sections_processed`, `entries_processed`, `total_word_count`), founder biographical context (`founder_facts`), and frequency-as-count (`passion_map[].frequency: 1–12`). It is built by the journal pipeline and persisted through `saveMentorProfile()`.

The founder's selection of `MentorProfile` as canonical (over `MentorProfileData` or a merged shape) is grounded in the observation that `MentorProfile` already carries the richer current-state semantics. Adopting it as canonical centralises those semantics. The `MentorProfileData`-only fields (`founder_facts`, `journal_name`, provenance counts) become **additions to the canonical type** during the migration.

### 2.4 An existing canonical mapping for `frequency`

`mentor-profile-summary.ts` line 126 already contains a frequency-bucket mapping in code:

```ts
const persistence = p.frequency >= 7 ? 'persistent'
  : p.frequency >= 4 ? 'recurring'
  : p.frequency >= 2 ? 'occasional'
  : 'rare'
```

This is the de-facto canonical mapping. Boundaries: 1 → `'rare'`, 2–3 → `'occasional'`, 4–6 → `'recurring'`, 7–12 → `'persistent'`. Under Option C with `MentorProfile` canonical, the `frequency` field on the canonical type retains the string-union shape; the journal pipeline's number-based counting is preserved as a separate field (e.g., `frequency_count: number`) on the canonical type so no information is lost during transition.

## 3. Call-site enumeration (drives cost estimates)

### 3.1 `MentorProfile` (sage-mentor) — files that import the type

**Inside `/sage-mentor/` — 13 files, ~80 occurrences:**

| File | Occurrences | Surface (named functions consuming `MentorProfile`) |
|---|---|---|
| `persona.ts` | 9 | DEFINES the type. Consumers: `buildMentorPersona`, `buildMentorPersonaCore`, `buildProfileContext`, `buildBeforePrompt`, `buildAfterPrompt`, `buildMorningCheckIn`, `buildEveningReflection`, `buildWeeklyPatternMirror`. |
| `ring-wrapper.ts` | 5 | `executeBefore`, `executeAfter`, `buildBeforePrompt` (re-export), `buildAfterPrompt` (re-export), `findRelevantJournal`, `checkPersistingPassions`. |
| `pattern-engine.ts` | 4 | `analysePatterns`, `detectRegressions`, `buildPatternNarrativePrompt`, internal helpers. |
| `journal-interpreter.ts` | 6 | Interpretation that operates on / produces MentorProfile. |
| `journal-ingestion.ts` | 7 | Produces MentorProfile from raw journal data. |
| `llm-bridge.ts` | 5 | Wrapping LLM calls with profile context. |
| `support-agent.ts` | 4 | Support-agent reasoning. |
| `proactive-scheduler.ts` | 2 | Scheduling reflection prompts. |
| `reflection-generator.ts` | 7 | Building reflections from profile. |
| `session-bridge.ts` | 7 | Session orchestration. |
| `mentor-ledger.ts` | 4 | Ledger entries. |
| `private-hub-types.ts` | 2 | Private hub types. |
| `profile-store.ts` | 17 | Alternate Supabase-targeted profile store — **UNUSED by the website** (the website has its own `mentor-profile-store.ts`). |
| `index.ts` | 1 | Re-exports. |

**Inside `/website/src/` — 2 files actively import:**

| File | Occurrences | Notes |
|---|---|---|
| `lib/mentor-ring-fixtures.ts` | 4 | DEFINES `PROOF_PROFILE: MentorProfile` (TEMPORARY fixture per its file header). Imports `MentorProfile` from `'../../../sage-mentor'`. |
| `lib/sage-mentor-ring-bridge.ts` | 6 | Re-exports `MentorProfile` so route code can import via the bridge. Used by `/api/mentor/ring/proof`, the ring functions themselves consume the imported type. |

The website code path for live data **never instantiates `MentorProfile` today.** Only the fixture does.

### 3.2 `MentorProfileData` (website) — files that import the type

**6 files, 31 occurrences:**

| File | Occurrences | Surface |
|---|---|---|
| `lib/mentor-profile-summary.ts` | 2 | DEFINES the type and `buildProfileSummary`. |
| `lib/mentor-profile-store.ts` | 4 | `loadMentorProfile()` returns `{ profile: MentorProfileData; summary; version } \| null`; `saveMentorProfile()` accepts it. |
| `lib/context/practitioner-context.ts` | 5 | `getPractitionerContext`, `getFullPractitionerContext` consume it. |
| `lib/context/mentor-context-private.ts` | 5 | The private mentor context loader. |
| `app/api/mentor-baseline-response/route.ts` | 4 | Uses `buildProfileSummary`. |
| `app/api/mentor-profile/route.ts` | 6 | GET / PUT endpoint. |
| `app/api/mentor/private/baseline-response/route.ts` | 4 | Uses `buildProfileSummary`. |

**Indirect consumers via `loadMentorProfile`** (these import `loadMentorProfile`, which returns `MentorProfileData` inside its return type):

- `app/api/founder/hub/route.ts` — the founder hub.
- `app/api/mentor/private/reflect/route.ts` — the live private mentor reflect endpoint.

### 3.3 Sanity check: what code touches both?

Only `lib/mentor-ring-fixtures.ts` (1 occurrence each — the file's docstring names both shapes). The fixture is the bridge between the two universes today, and it does so by hand-constructing one of them.

## 4. Decision drivers

- **R17 surface containment.** The transition path must not put plaintext profile data at any new at-rest location. Existing rows in `mentor_profiles.encrypted_profile` were written under `MentorProfileData`; the canonical-type migration must either (a) migrate the persisted rows (Critical R17 because it touches encrypted intimate data and the encryption pipeline) or (b) keep a read-time adapter inside `loadMentorProfile()` that converts the persisted shape to the canonical shape on every read (until the journal pipeline is also updated to write the canonical shape).
- **PR1 — single-endpoint proof before rollout.** Changing `loadMentorProfile()`'s return type from `MentorProfileData` to `MentorProfile` would break every caller atomically. PR1 is honoured by introducing a parallel `loadMentorProfileCanonical()` first, proving it on `/api/mentor/ring/proof`, and migrating consumers one at a time. The legacy `loadMentorProfile()` is retired only after every consumer has migrated.
- **PR3 — safety systems are synchronous.** The read-time adapter inside `loadMentorProfileCanonical()` must be a pure synchronous function, no I/O. It receives the decrypted plaintext from the existing decryption step and returns a transformed object.
- **PR6 — safety-critical changes are Critical risk.** Any change to `mentor-profile-store.ts` is encryption-adjacent. The persisted-row migration (if chosen) is Critical in full (encryption pipeline + at-rest data change). The introduction of the parallel function and the consumer migrations are Elevated each, except where the consumer is itself a Critical surface (the live reflect endpoint inside the R20a perimeter — AC5).
- **sage-mentor encapsulation.** Today `/sage-mentor/` has zero imports from `/website/`. Adopting `MentorProfile` as canonical preserves this — the canonical type lives in sage-mentor; the website imports it. (Adopting `MentorProfileData` as canonical would have inverted this and broken the encapsulation; the founder rejected that variant.)
- **Operational simplicity.** The transition adds one new function (`loadMentorProfileCanonical`) and an internal adapter. The end state removes `MentorProfileData` and the adapter, leaving a single canonical type. Net code reduces over the migration's lifetime.
- **Coordination with ADR-R17-01.** The retrieval cache adopted today (2026-04-25) wraps `loadMentorProfile()` and stores ciphertext. The cache wrap is unchanged by Option C — it sits below the adapter. The cache is invalidated by `saveMentorProfile()`; under Option C the eventual unified canonical write path needs the same invalidation guarantee.
- **Cost of churn across `/sage-mentor/`.** **Zero.** Option C with `MentorProfile` canonical does not touch any sage-mentor file. All churn is on the website side: the persistence boundary, the type-consumer files, and the journal pipeline output stage.

## 5. Options considered

The session prompt named three approaches (a/b/c). The founder selected **Option C with MentorProfile canonical** after considering all three.

### 5.1 Option A — One-way adapter `MentorProfileData → MentorProfile` (NOT SELECTED)

A pure synchronous function in the website transforms `MentorProfileData` to `MentorProfile` at every call site that needs the canonical shape. Two website files touched at adoption (the new adapter file + the proof endpoint). Sage-mentor unchanged. R17 surface unchanged.

**Why not selected.** Two type definitions persist indefinitely. Drift risk grows over time. The adapter is a permanent intermediary, not a migration scaffold. End state has more types than it started with, not fewer.

### 5.2 Option B — Refactor sage-mentor to consume `MentorProfileData` (NOT SELECTED)

Change every sage-mentor function signature that takes `MentorProfile` to take `MentorProfileData`. Rewrite each function's internal field accesses.

**Why not selected.** Highest sage-mentor churn (~13 files, ~80 occurrences). Breaks sage-mentor's zero-import-from-website encapsulation. PR1 hard to honour cleanly.

### 5.3 Option C — Unify the two shapes, with `MentorProfile` canonical (SELECTED)

Adopt `MentorProfile` (from `/sage-mentor/persona.ts`) as the single canonical profile shape. Retire `MentorProfileData`. Migrate all website consumers, the persistence layer, and the journal pipeline output to use `MentorProfile`.

| Aspect | Detail |
|---|---|
| sage-mentor changes | **Zero.** No file touched. The canonical type already lives there. |
| website changes — types | Add the website-only fields (`founder_facts`, `journal_name`, `journal_period`, provenance counts, `proximity_estimate.description`) to `MentorProfile` as optional fields. Decision: extend in-place vs introduce a separate "context envelope" — see §6.1. |
| website changes — persistence | `loadMentorProfile()`'s return type changes to `MentorProfile`. A read-time adapter inside the function handles existing rows written under `MentorProfileData`. Transition path: parallel `loadMentorProfileCanonical()` introduced first, consumers migrated one at a time, legacy retired. |
| website changes — journal pipeline | `saveMentorProfile()` and the journal-ingestion output stage update to write `MentorProfile`. Coordinated with the persistence migration. |
| website changes — consumer files | 6 type-consumer files migrate. Each consumer's exact field accesses change (e.g., `profile.proximity_estimate.level` → `profile.proximity_level`; `profile.virtue_profile[virtue]` → finding the matching `VirtueDomainAssessment` entry by `domain`). |
| Files touched at adoption (whole transition) | ~10–14 over the staged sessions: 1 type extension to `MentorProfile`; 1 new function + adapter inside `mentor-profile-store.ts`; 6 consumer migrations; 1 journal-ingestion output update; 1 fixture update; legacy retirement edits. |
| Estimated session count | **5 sessions for the staged transition** (plus 1 optional row-migration session if the founder later chooses to migrate persisted rows rather than keep the read-time adapter permanently). |
| What breaks if partial | TypeScript prevents partial breakage at type level — the parallel function approach lets each consumer migrate independently. Worst case: a consumer misses migration and continues calling the legacy `loadMentorProfile()` returning `MentorProfileData`. The legacy function continues to work until explicitly retired. |
| Rollback | Per session. Session 1 rollback: delete `loadMentorProfileCanonical` and the adapter, revert the proof endpoint. Session N rollback: revert the consumer migration in question; the legacy `loadMentorProfile` still serves it. |
| sage-mentor encapsulation | **Preserved.** The canonical type lives in sage-mentor. Website imports from there (via the existing bridge file pattern). |
| Where website-only fields go | Added as optional fields to `MentorProfile` (Option C-α — extend in place) **OR** carried in a thin context envelope alongside `MentorProfile` (Option C-β — separate envelope). See §6.1 for the trade-off. The implementation session decides; the ADR commits to one method per session. |
| R17 footprint | The read-time adapter operates on decrypted plaintext (post-decryption, pre-return). No new at-rest plaintext surface. The persistence layer continues to store ciphertext encrypted from `MentorProfileData` until the journal pipeline switches to writing `MentorProfile`. **R17 surface unchanged during transition.** A persisted-row migration (if chosen later) is Critical in full. |
| PR6 footprint | Higher than Option A. Each session that touches `mentor-profile-store.ts` is **Elevated** (encryption-adjacent). Consumer migrations are **Standard** unless the consumer is a Critical surface (the live reflect endpoint per R20a/AC5). The persisted-row migration, if chosen, is **Critical** in full. |
| Long-term value | **Cleanest end state.** One source of truth. No adapter. No type drift in future amendments. |

The variant selected is **Option C with MentorProfile canonical** (not the merged-shape or `MentorProfileData`-canonical version). This preserves sage-mentor's encapsulation while moving toward a single canonical type.

## 6. Open questions the ADR must resolve regardless of approach

These apply at the same time the chosen approach is implemented. Each is named here so the implementation sessions have a checklist.

### 6.1 Where do website-only fields go on the canonical type?

`MentorProfileData` has fields with no counterpart on `MentorProfile`: `journal_name`, `journal_period`, `sections_processed`, `entries_processed`, `total_word_count`, `founder_facts`, `proximity_estimate.description`. These fields are real and used (the founder hub references `founder_facts`; baseline endpoints reference journal metadata). Three placement options:

- **C-α — Extend `MentorProfile` in place.** Add the website-only fields as optional fields on `MentorProfile`. Sage-mentor's existing functions ignore the optional fields; website's existing readers find them where they expect. Pro: single canonical type, simplest end state. Con: adds website-shaped fields to a sage-mentor file. The sage-mentor module's purity weakens slightly because it now carries fields no sage-mentor function reads.
- **C-β — Companion envelope.** Keep `MentorProfile` exactly as it is. Introduce `MentorProfileEnvelope` in the website that wraps `MentorProfile` and adds the website-only fields:
  ```ts
  type MentorProfileEnvelope = {
    profile: MentorProfile
    journal_name: string
    journal_period: string
    founder_facts?: FounderFacts
    // …other website-only fields
  }
  ```
  `loadMentorProfileCanonical()` returns `MentorProfileEnvelope`. Sage-mentor functions take `envelope.profile`. Website-only readers take the envelope. Pro: keeps sage-mentor pure. Con: still two types — `MentorProfile` and `MentorProfileEnvelope`. Less canonical than C-α.
- **C-γ — Add to sage-mentor explicitly.** Move the website-only fields into sage-mentor as part of the canonical definition (e.g., add `meta` block to `MentorProfile`). Pro: most canonical. Con: requires editing sage-mentor (changes from "zero sage-mentor changes" to "one sage-mentor edit").

**Adopted variant:** **C-α — extend `MentorProfile` in place** is most canonical, minimises types, and keeps sage-mentor untouched. The optional fields signal "carried alongside the philosophical profile, used by the website's user-facing surfaces." If Session 2 surfaces friction with C-α (e.g., a sage-mentor function would now need to handle an undefined website-only field unexpectedly), the implementation falls back to **C-β** with founder approval. The fallback is named in advance so it isn't a session-time scramble.

### 6.2 What happens to `MentorProfile.persisting_passions` (denormalised array) and other sage-only fields under Option C?

`MentorProfile` already carries `persisting_passions`, `current_prescription`, `direction_of_travel`, `dimensions`, `interaction_count`, `last_interaction`, `journal_references`. Under Option C these become canonical — every consumer of profile data sees them. The read-time adapter inside `loadMentorProfileCanonical` populates them as follows:

- **`persisting_passions`** — computed on the fly from `passion_map[].frequency >= 'recurring'` (after the frequency-mapping conversion below). Pure derivation.
- **`current_prescription`** — defaulted to `null` until a progression-tracking surface exists. Logged as O1 below.
- **`direction_of_travel`** — defaulted to `'stable'` until interaction-history analysis exists.
- **`dimensions`** — defaulted to `'developing'` for all four. Real values come from a future progression-tracking surface.
- **`interaction_count`** — defaulted to `0` until the live `mentor_interactions` loader (D-PE-2 (c)) lands; then sourced from a count query.
- **`last_interaction`** — defaulted to the persisted profile's `last_updated` timestamp until the live loader lands.
- **`journal_references`** — defaulted to `[]`. The ring's `findRelevantJournal` degrades to a no-op until a journal-references loader exists. Logged as O2.

Each default is honest (a sentinel, not fabricated data). The journal-ingestion output stage migration (Session 4 below) populates the fields it can compute at write-time so future reads don't pay the adapter cost.

### 6.3 The `frequency` mapping (string union vs number 1–12)

Under Option C with `MentorProfile` canonical, the canonical `PassionMapEntry.frequency` is the **string union** (`'rare' | 'occasional' | 'recurring' | 'persistent'`). The number-based count is preserved as a separate optional field (e.g., `frequency_count?: number`) on the canonical type so the journal pipeline's signal is not lost.

The conversion uses the existing canonical mapping from `mentor-profile-summary.ts:126`:

| Number range | Bucket |
|---|---|
| 1 | `'rare'` |
| 2–3 | `'occasional'` |
| 4–6 | `'recurring'` |
| 7–12 | `'persistent'` |

The adapter exports `frequencyBucketFromCount(n: number)` so `buildProfileSummary` (and any future consumer) imports from a single source of truth.

### 6.4 Does the adapter need to handle missing/partial data?

Yes. Three cases:

- **Profile not seeded** (`loadMentorProfileCanonical()` returns null): callers handle the null-profile case explicitly. The proof endpoint either uses the fixture as a fallback or routes to a different code path for un-seeded users (founder picks at session open).
- **Profile partially populated** (e.g., `passion_map` empty, `founder_facts` undefined, `causal_tendencies.specific_breakdowns` empty): the adapter produces a canonical `MentorProfile` with empty arrays and honest sentinels. No silent fabrication.
- **Profile fields with stale or invalid data** (e.g., `frequency_count` is `0` or `13`): the adapter clamps to nearest valid bucket and logs a warning. It does not throw — the request path continues with degraded but defined input.

### 6.5 R17 footprint of the adapter touching the decrypted profile

The read-time adapter inside `loadMentorProfileCanonical` receives plaintext (post-decryption) and returns plaintext (the canonical `MentorProfile`). Both objects live only for the request lifetime and die at end-of-request, identical to how `loadMentorProfile` handles plaintext today.

The adapter does not:
- Touch ciphertext, the encryption pipeline, or `server-encryption.ts`.
- Persist data anywhere (the wrapping cache from ADR-R17-01 stores ciphertext only — unchanged).
- Add any new at-rest storage location.

R17 surface is **unchanged** during the transition. **A persisted-row migration (if chosen later) is Critical** because it touches every encrypted row.

### 6.6 Coordination with ADR-R17-01 (profile-store retrieval cache)

The retrieval cache wraps `loadMentorProfile()` and stores ciphertext. Under Option C, the cache wrap continues to apply to the legacy `loadMentorProfile()` during transition. The new `loadMentorProfileCanonical()` either:

- Wraps the same cache (sharing the ciphertext store, applying the canonical adapter on each call's plaintext output) — preferred. The cache invalidation rules from ADR-R17-01 apply unchanged.
- Or introduces its own cache. Doubles the cache footprint, complicates invalidation. Not recommended.

The implementation session names this coordination explicitly and avoids cache-bypass paths.

## 7. Adopted plan

**Option C with MentorProfile canonical, staged transition, C-α field placement (extend `MentorProfile` in place with optional website-only fields).**

### Reasoning

1. **End-state is the cleanest of the three options.** One canonical type. No adapter in the long run. No drift risk in future amendments. The other options either preserve the dual-type structure (Option A) or invert sage-mentor's encapsulation (Option B and the `MentorProfileData`-canonical variant of Option C).

2. **sage-mentor encapsulation is preserved.** Today `/sage-mentor/` has zero imports from `/website/` (verified by the 2026-04-25 pattern-engine handoff). Adopting `MentorProfile` as canonical maintains that — the canonical type lives in sage-mentor; the website imports it via the existing bridge pattern. C-α adds optional website-only fields to the canonical type definition, with no sage-mentor file edits required (the type definition itself is in sage-mentor; the additions extend rather than rewrite it — implementation session confirms this is achievable without breaking sage-mentor's existing readers, otherwise C-β fallback applies).

3. **PR1 is honoured by staging.** The transition introduces `loadMentorProfileCanonical()` first and proves it on `/api/mentor/ring/proof` before any consumer migration. Each consumer migrates as its own PR1 single-endpoint proof. The legacy `loadMentorProfile()` retires only after every consumer has migrated.

4. **The adapter relocates, it doesn't disappear.** The AI's stated concern at supersession was that Option C does not eliminate the adapter — it moves the logic to the persistence boundary inside `loadMentorProfileCanonical()`. The founder accepted this trade-off: the adapter is internal to `mentor-profile-store.ts` rather than a per-call site concern, and it retires when the journal pipeline writes canonical (Session 4) and (optionally) the persisted rows are migrated.

5. **R17 surface is unchanged during transition.** The read-time adapter is post-decryption, pre-return. No new at-rest plaintext surface. Existing persisted rows continue to be readable; the journal pipeline migration (Session 4) and any optional row migration are the gates that retire the read-time adapter.

6. **Coordinates cleanly with ADR-R17-01.** The retrieval cache wraps the same Supabase fetch; the canonical adapter applies after decryption. The cache invalidation rules from R17-01 apply unchanged to both legacy and canonical functions during transition.

### What we accept by choosing Option C

- **Higher session count than Option A.** Five sessions for the staged transition, vs Option A's two. Each session has its own PR1 single-endpoint proof.
- **Persisted-row migration deferred.** Existing rows continue to be written under `MentorProfileData` until Session 4 (journal pipeline). After Session 4, *new* writes are canonical; *old* rows are still in the previous shape. The read-time adapter remains in place for old rows. A future session can migrate old rows to canonical (Critical R17), or the read-time adapter can stay permanently — both are acceptable end states. The founder decides at the time.
- **One sage-mentor consideration.** C-α adds optional fields to `MentorProfile`. If the implementation session finds this materially weakens sage-mentor's purity, the implementation falls back to C-β (companion envelope) with founder approval.

### What this is not

- This decision does **not** force a persisted-row migration. The read-time adapter handles existing rows indefinitely if that's the founder's preference. A row migration is a separate, optional, Critical-risk session that can happen after the transition is otherwise complete.
- This decision does **not** change `loadMentorProfile()`'s contract during transition. The legacy function continues to return `MentorProfileData` until it is explicitly retired in the final cleanup session.
- This decision does **not** retire the temporary fixtures (`PROOF_PROFILE`, `PROOF_INTERACTIONS`). They retire when Session 1 is **Verified** and the proof endpoint runs on live data.

### Estimated session count for the eventual code change

**Five sessions for the staged transition:**

- **Session 1 (PR1 single-endpoint proof — canonical loader on the ring proof).** Add `loadMentorProfileCanonical()` to `mentor-profile-store.ts` alongside the existing `loadMentorProfile()`. Implement the read-time adapter as a pure function. Wire `loadMentorProfileCanonical()` into `/api/mentor/ring/proof` to replace `PROOF_PROFILE`. Verify (TypeScript clean, live-probe). Adapter reaches **Verified** status. **Risk: Elevated** (encryption-adjacent, production request path).

- **Session 2 (extend the canonical type — C-α).** Add the website-only optional fields to `MentorProfile`. Verify TypeScript clean across the existing sage-mentor consumers. If any sage-mentor function breaks, fall back to C-β (envelope) with founder approval. **Risk: Standard** (additive type extension).

- **Session 3 (consumer migrations, Standard surfaces).** Migrate `mentor-profile-summary.ts` (`buildProfileSummary` consumes `MentorProfile`), `practitioner-context.ts` (`getPractitionerContext`, `getFullPractitionerContext`), `mentor-context-private.ts`, the GET / PUT endpoints (`/api/mentor-profile/route.ts`, `/api/mentor-baseline-response/route.ts`, `/api/mentor/private/baseline-response/route.ts`), and `/api/founder/hub/route.ts`. Each consumer migrates by switching its `loadMentorProfile()` import to `loadMentorProfileCanonical()` and updating field accesses. Each is a PR1 single-endpoint proof. **Risk: Elevated** (each consumer is on the production request path; some are encryption-adjacent via the canonical-loader call).

- **Session 4 (live reflect + journal pipeline write-side).** Migrate `/api/mentor/private/reflect/route.ts` (Critical surface — R20a perimeter, AC5). Update the journal-ingestion output stage to write canonical `MentorProfile` rather than `MentorProfileData`. **Risk: Critical** (R20a perimeter + encryption pipeline + journal pipeline). Critical Change Protocol (0c-ii) in full.

- **Session 5 (legacy retirement).** Once every consumer is on `loadMentorProfileCanonical()` and the journal pipeline writes canonical, retire `loadMentorProfile()` and `MentorProfileData`. Rename `loadMentorProfileCanonical` to `loadMentorProfile` (single canonical name). Remove `mentor-profile-summary.ts`'s legacy type definition (keep `buildProfileSummary` if still useful, now consuming `MentorProfile`). The read-time adapter remains in place for un-migrated persisted rows; remove only if a row migration also happened. **Risk: Elevated** (cleanup, but on the encryption surface).

**Optional Session 6 (persisted-row migration, founder choice).** Decrypt every existing `mentor_profiles` row, transform to canonical, re-encrypt, write back. After this, the read-time adapter can be removed entirely. **Risk: Critical** (touches every encrypted row).

### Risk classification for the eventual code change

| Element | Classification | Reasoning |
|---|---|---|
| The ADR itself (this document) | **Standard** | Documentation only. |
| Session 1 (canonical loader + proof) | **Elevated** | Encryption-adjacent; production request path. |
| Session 2 (type extension C-α) | **Standard** | Additive type-level change. |
| Session 3 (consumer migrations, Standard surfaces) | **Elevated** per consumer | Each is on the production request path; canonical-loader call is encryption-adjacent. |
| Session 4 (live reflect + journal pipeline) | **Critical** | R20a perimeter (AC5) + encryption pipeline + journal pipeline write-side. |
| Session 5 (legacy retirement) | **Elevated** | Cleanup on the encryption surface. |
| Session 6 (optional row migration) | **Critical** | Touches every encrypted row in the table. |

The founder may reclassify upward at any time per 0d-ii.

## 8. Consequences

### 8.1 Performance

- Read-time adapter cost: pure synchronous transform, microseconds. Not measurable in any user-facing metric.
- The retrieval cache from ADR-R17-01 continues to apply. Cache hits skip the DB round-trip; the adapter still runs on each canonical-loader call (it operates on the decrypted-and-cached plaintext path).
- After Session 4, the journal pipeline writes canonical, so the adapter is no longer the only conversion path — newly written rows skip the adapter (the persisted shape already matches the canonical shape).

### 8.2 R17 surface

- During transition: unchanged. Read-time adapter is post-decryption, pre-return. Persisted shape unchanged.
- After Session 4: the journal pipeline writes canonical. Future writes are canonical at rest.
- After optional Session 6: every persisted row is canonical. Read-time adapter removable.

### 8.3 sage-mentor encapsulation

- Preserved by C-α (additive optional fields on the canonical type) or C-β (companion envelope). Either preserves zero-imports-from-website inside `/sage-mentor/`.
- The decision between C-α and C-β happens in Session 2 of the implementation. C-α is the default; C-β is the named fallback if Session 2 surfaces friction.

### 8.4 Drift risk during transition

- Two profile types coexist for Sessions 1–5. The adapter is the only translation between them. Mitigation: TypeScript test that exercises the adapter on a representative `MentorProfileData` and asserts the resulting `MentorProfile` is structurally complete. Test lives alongside the adapter file.
- Inline reference comments in both type definitions point at the adapter so any future amendment to either type is flagged.

### 8.5 Coordination with ADR-R17-01

- Cache wrap continues to wrap the canonical loader. Invalidation rules unchanged.
- `saveMentorProfile()` invalidation must apply equally to both legacy and canonical caches (or — preferably — they share one cache).

### 8.6 Fixture retirement

- `PROOF_PROFILE` and `PROOF_INTERACTIONS` retire when Session 1 is **Verified** and the proof endpoint runs on live data.

### 8.7 Permanent end state

- Single canonical type: `MentorProfile`. No `MentorProfileData`. No adapter (after optional Session 6) or a thin internal adapter (if Session 6 is skipped).
- One source of truth for the frequency-bucket mapping (`frequencyBucketFromCount` exported from the persistence layer).
- Reduced type surface area in the codebase.

## 9. Open questions

- **O1 — Where do values for sage-only fields come from in production?** The adapter defaults them honestly (sentinels, computed from `passion_map`). Real values for `interaction_count`, `last_interaction`, `current_prescription`, `dimensions` come from D-PE-2 (c) (live `mentor_interactions` loader) and a future progression-tracking surface. Logged for revisit when each upstream source lands.
- **O2 — `journal_references` source.** `MentorProfile.journal_references: JournalReference[]` is rich data. Two options: default to empty array and let the ring's `findRelevantJournal` degrade to a no-op until a journal-references loader exists; or build a journal-references loader alongside Session 4. Decision deferred.
- **O3 — C-α vs C-β decision in Session 2.** C-α is the default. C-β fallback is named so Session 2 isn't a scramble. Decision belongs in Session 2 with founder approval if C-β is chosen.
- **O4 — Persisted-row migration (Session 6) — when?** Optional. Can happen any time after Session 5 completes. Or not at all if the read-time adapter for legacy rows is acceptable indefinitely. Founder decides at the time.
- **O5 — Sequencing of the other two ring proof endpoints (`/api/support/agent/proof`, `/api/founder/hub/ring-proof`).** Out of scope of this ADR. Become candidates once Session 1 is Verified. Logged for future PR1 sequencing.

## 10. Founder verification

| Check | Method |
|---|---|
| Canonical loader returns the right shape | After Session 1, founder pastes a DevTools Console snippet at sagereasoning.com (signed in) hitting `/api/mentor/ring/proof`. Response shows `pattern_analysis.interactions_analysed > 0` (or `=== 15` if `PROOF_INTERACTIONS` is retained as the interaction source for now). The profile fields (proximity, dimensions, persisting passions) reflect the founder's actual seeded profile. |
| Type extension does not break sage-mentor | After Session 2, `npx tsc --noEmit` exit 0 in both `/website/` and any sage-mentor consumer scripts. |
| Each consumer migration preserves behaviour | Each session in 3 ends with a live-probe of the consumer's surface. Founder confirms the surface still produces the same user-visible output as before the migration. |
| Live reflect endpoint works after Session 4 | Critical Change Protocol verification: founder signs in, sends a reflect request, receives expected response. Distress-classifier wrapper still fires (AC5/AC4). Rollback exercised in a dry-run before the founder commits to keeping the change. |
| Legacy retirement is complete | After Session 5, `grep \"MentorProfileData\" website/src` returns zero results (or only in archived files). The fixture file no longer references it. |
| Frequency mapping is single-sourced | After Session 1, `frequencyBucketFromCount` is the only place numbers convert to buckets. After Session 5, `mentor-profile-summary.ts:126` either imports it or has been removed alongside `MentorProfileData`. |
| TypeScript clean at every checkpoint | `npx tsc --noEmit` exit 0 at the end of every session. |
| No regression on existing flows | Run all three proof endpoints (`/api/mentor/ring/proof`, `/api/support/agent/proof`, `/api/founder/hub/ring-proof`) at the end of every session and confirm no errors. |

## 11. Rollback plan

### Per-session rollback (recommended)

Each session of the transition has its own narrow rollback. The legacy `loadMentorProfile()` and `MentorProfileData` continue to exist throughout Sessions 1–4, so any session can be reverted without breaking the system as a whole.

- **Session 1 rollback:** delete `loadMentorProfileCanonical()` from `mentor-profile-store.ts`; delete the adapter; revert the proof endpoint to use `PROOF_PROFILE`. ~5 minutes. Push, verify with the existing DevTools probe.
- **Session 2 rollback:** revert the type extension on `MentorProfile`. The added fields were optional, so consumers that read them (none yet, since they're new) tolerate revert without TypeScript errors. ~5 minutes.
- **Session 3 rollback (per consumer):** revert that consumer's migration; the import of `loadMentorProfileCanonical` reverts to `loadMentorProfile`; field accesses revert to the website shape. Each consumer is independent.
- **Session 4 rollback:** revert the live reflect migration first (highest-stakes surface); revert the journal pipeline write-side migration second. The adapter inside `loadMentorProfileCanonical` continues to handle un-migrated rows; new writes after the journal-pipeline revert go back to `MentorProfileData`.
- **Session 5 rollback:** restore the deleted `MentorProfileData` type definition and the legacy `loadMentorProfile()`. Cleanup-only session, so the rollback is restoration-only.

### Catastrophic rollback (full transition undone)

If the transition itself proves wrong: the legacy `loadMentorProfile()` is retired in Session 5, so a full undo after Session 5 requires restoring it. Before Session 5, all transition state is reversible per-session.

### Persisted-row migration (Session 6) rollback

The most expensive rollback in the transition. If the row migration fails partway: every row that was migrated needs to be reverted to its pre-migration shape. Mitigation: take a Supabase backup before Session 6 begins; pause the journal pipeline during the migration window; verify a sample of migrated rows before continuing.

## 12. Notes for implementation sessions

### Session 1 (canonical loader on the ring proof)

- New function `loadMentorProfileCanonical(userId)` in `mentor-profile-store.ts`. Internally: same Supabase fetch + decrypt as the legacy function (or — preferred — both wrap a shared internal helper); applies the read-time adapter; returns `{ profile: MentorProfile; summary: string; version: number } | null` (the same envelope as today, just with the canonical shape inside).
- Adapter implemented as a pure function. Exports `frequencyBucketFromCount` for cross-file reuse.
- Wiring into `/api/mentor/ring/proof` replaces `PROOF_PROFILE` with the canonical loader's output (with un-seeded-profile fallback decided at session open).
- Coordinates with ADR-R17-01: the canonical loader wraps the same retrieval cache (preferred) so cache invalidation rules apply equally.
- TypeScript pre-deploy verification (`npx tsc --noEmit`).
- Live-probe post-deploy via the existing DevTools Console snippet pattern.
- Add reference comments in both `MentorProfile` and `MentorProfileData` type definitions pointing at the adapter file so future amendments are flagged.
- Risk: **Elevated**.

### Session 2 (extend canonical type — C-α)

- Add optional fields to `MentorProfile` for the website-only data: `journal_name?`, `journal_period?`, `sections_processed?`, `entries_processed?`, `total_word_count?`, `founder_facts?`, `proximity_estimate_description?`.
- Verify TypeScript clean across all sage-mentor consumers. The fields are optional, so existing functions ignore them.
- If any sage-mentor function fails to compile or surfaces a runtime concern with the optional fields, fall back to **C-β** (companion envelope) with founder approval.
- Risk: **Standard**.

### Session 3 (consumer migrations, Standard surfaces)

- Migrate one consumer per session-step. Order: simplest first, working up to harder.
  1. `mentor-profile-summary.ts` — `buildProfileSummary` rewrite to consume `MentorProfile`. The function is the existing summariser; rewriting it tests the canonical type's expressive completeness.
  2. `practitioner-context.ts` — `getPractitionerContext`, `getFullPractitionerContext`.
  3. `mentor-context-private.ts`.
  4. `/api/mentor-profile/route.ts` (GET/PUT).
  5. `/api/mentor-baseline-response/route.ts`.
  6. `/api/mentor/private/baseline-response/route.ts`.
  7. `/api/founder/hub/route.ts`.
- Each consumer's migration ends with a live-probe of its surface.
- Each is its own PR1 single-endpoint proof.
- Risk: **Elevated** per consumer.

### Session 4 (live reflect + journal pipeline write-side)

- Critical Change Protocol (0c-ii) in full at session open. The five steps appear in the conversation before deployment.
- Migrate `/api/mentor/private/reflect/route.ts` first. Live-probe with the founder's account before continuing.
- Update the journal-ingestion output stage to write canonical `MentorProfile`. Verify by ingesting the founder's journal and confirming the persisted row decrypts to a canonical shape.
- After Session 4: new writes are canonical; old rows continue to be served by the adapter.
- Risk: **Critical**.

### Session 5 (legacy retirement)

- Remove `loadMentorProfile()` and `MentorProfileData`. Rename `loadMentorProfileCanonical` to `loadMentorProfile` (single canonical name post-retirement).
- `mentor-profile-summary.ts` either retains `buildProfileSummary` (now consuming `MentorProfile`) or the function moves elsewhere if cleaner.
- `grep \"MentorProfileData\" website/src` returns zero results (excluding archived files).
- Reference comments in the canonical type updated.
- Risk: **Elevated**.

### Optional Session 6 (persisted-row migration)

- Critical Change Protocol in full.
- Supabase backup before starting.
- Pause journal pipeline during the migration window.
- Decrypt → transform → re-encrypt → write back, in batches with checkpoints.
- Verify a sample of migrated rows before continuing each batch.
- After Session 6: read-time adapter can be removed entirely.
- Risk: **Critical**.

### Discipline carried from prior sessions

- PR1 — single-endpoint proof discipline before rollout. Session 1 is the proof; Sessions 3–4 are per-consumer proofs; Sessions 5–6 are cleanup.
- PR2 — verification is immediate. Live-probe in the same session as each wire.
- PR4 — model selection is a session-opening checkpoint. The adapter does not select a model (no LLM in path).
- PR5 — knowledge-gap carry-forward. KG3 (hub-label consistency) does not apply (no `mentor_interactions` writes). KG7 (JSONB shape) does not apply (no JSONB read/write in adapter). Other entries scanned and respected per session.
- PR6 — safety-critical changes are Critical. Session 4 and Session 6 are Critical.
- PR7 — deferred decisions are documented. O1–O5 above.
- AC7 — Session 7b standing constraint. Sessions 1, 4, 5 touch the encryption-adjacent surface; Session 4 additionally touches a route handler. None of them change authentication, cookie scope, session validation, or domain-redirect behaviour. Each session's plan names this explicitly at the start.

---

*End of ADR. Adopted 25 April 2026.*
