# Scope: C2 (the fifth-circle orientation reading) and C1c (its trust-event class)

**Status: APPROVED by the mentor, 2026-08-06, both flagged open questions RULED — RE-CONFIRMED 2026-08-07 on a full-document review alongside items 14–16.** Ruling one (`D-C1C-NAMING-RESOLVED-2026-08-06`): §0's naming ambiguity is resolved — "C1c" in the binding sequence names the trust-event class for C2's orientation reading (§4 below); the dependency graph's "circle-4" phrasing was a drafting slip, corrected to "circle-5 orientation reading." The original build-plan C1c (first-circle failure/demonstration events) is confirmed as a separate, still-outstanding item, not addressed here. Ruling two (`D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06`): §4.1's storage-home election is resolved to Option A (reuse `agent_trust_events`, three `'flag'`-effect event types, one migration, no sibling table); §4.3's `virtue_domain: NULL` recommendation is confirmed, no CHECK widening needed there. The §1.3 prose-framing correction, the §2.2 `generativePrompt`/`OikeiosisGap` resolution, and the §3 novelty-detection honest-limitation are all confirmed as written. **§7 and §8 (added 2026-08-07 — this document's connections to items 14 and 15, the permission scrutiny layer and the second-order impact analysis mechanism) were part of the same 2026-08-07 full-document review that approved items 14–16, and are confirmed sound alongside them — no correction required.** See the decision-log entries for the rulings verbatim and full disposition.

**Session:** 2026-08-06 (continuation). Tier: `governance`/`code-elevated` — a scope document, no code written. Per the binding ruling (`D-C2-C1C-ORDERING-RULED-CROSSCHECK-BUILT-2026-08-05`, sharpened by `D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05`): **C2 builds first, C1c builds second, both are scoped together before either builds** — C1c's schema has to describe what C2's reading actually produces. This is item 2b/3 of the binding sequence (`06-PLAIN-TEXT-MIRROR.md` §Sixth element), now unblocked by both upstream prerequisites (`OikeiösisGap`/`GeneratedCandidate` — approved; the IDEA loop configuration shape + shared task-list storage — approved). This document does **not** scope the generation step (now separately unblocked, still queued), does not touch D4, and does not touch the Stoa activation.

**Method:** as with the prior two scope documents in this arc, every field is justified against an existing binding ruling (cited) or an existing architectural surface (cited, mechanism-level only, per PR20). Two genuine open questions surfaced while grounding this document are named as open, with recommendations, rather than resolved silently.

---

## 0. A naming ambiguity, flagged before anything else is scoped

The 2026-08-01 build plan (`2026-08-01-agent-circles-practice-on-build-plan.md:54`) defines **C1c** as: *"new event classes (first-circle failure → phronesis or sophrosyne per locus; first-circle demonstration → positive sophrosyne)"* — the trust-event classes for **C1's own first-circle correction**, deferred from the initial build (`D-STOA-Q5C-Q13A-BUILT-DARK...` build-close entry: *"deferred C1c (the trust-event classes + `agent_trust_events` CHECK widening) to its own session"*). That item remains genuinely unbuilt and is not addressed by this document.

The current dependency graph's item 3 (`06-PLAIN-TEXT-MIRROR.md:154`) describes C1c differently: *"the trust-ledger event classes for a circle-4 failure"* — and the mentor's own 2026-08-05 ordering ruling (`D-C2-C1C-ORDERING-RULED-CROSSCHECK-BUILT-2026-08-05`) reasons about it as *"C1c's schema needs to describe C2's actual output; you cannot name that correctly before C2 exists"* — which only makes sense if C1c-in-this-sequence is the trust-event schema for **C2's orientation reading** (a circle-5/telos-directional signal), not a circle-4 event (circle 4, cosmopolis, already has its trust machinery via C3, which the build plan states enters "the existing justice machinery... with no new mechanism" — no new event type needed there).

**RULED 2026-08-06 — confirmed as read.** The mentor's disposition (`D-C1C-NAMING-RESOLVED-2026-08-06`): "C1c" in the current binding sequence (item 3) names **the trust-event class(es) required to record C2's orientation reading** — the reading this document's §1 scopes. The dependency graph's "circle-4" phrasing was a drafting slip, corrected to "circle-5 orientation reading" (`06-PLAIN-TEXT-MIRROR.md` item 3). The original build-plan C1c (first-circle failure/demonstration events, phronesis/sophrosyne per locus) is confirmed as a **distinct, separately-outstanding item**, not addressed by this document, not to be silently folded in or dropped — it needs its own future session.

---

## 1. C2(i) — the orientation reading itself

### 1.1 The Layer-1 signal it reads

Per the mentor's Q4 ruling (`2026-08-01-...-practice-on-verbatim.md:97`): the reading asks *"not what the reasoning produced but what the reasoning was reaching toward"* — habit-vs-genuine-examination, not a positional score. Per the build plan's C2a (`2026-08-01-...-build-plan.md:60`): Layer 1 extracts this over *"the examination's own features (habit-vs-genuine-examination observables; evidence spans)."*

Following the existing `obligation_assessment` precedent exactly (`layer1-extractor.ts:180-187`, `:1056-1073` — an OPTIONAL, additive field on an existing extraction shape, populated whenever the relevant condition applies, absent/null otherwise, never required):

```typescript
/** ADR-agent-circles §C2a. Optional; populated whenever the examination shows
 *  observable habit-vs-genuine-examination markers. Absent when neither is
 *  clearly present — feeds the conservative-by-default rule in §1.2, never
 *  a forced choice between the two readings. */
export interface OrientationObservation {
  /** Which observable class was found — the mentor's own contrast (Q4):
   *  reasoning that shows genuine examination of the affected circles and
   *  the telos of right reason, vs. reasoning that produces a
   *  correct-looking output through pattern/habit without examining why. */
  observed: 'genuine_examination_markers' | 'habitual_output_markers'
  /** Verbatim span from the submitted text grounding the observation —
   *  mirrors evidence_span / the obligation_assessment.justification
   *  precedent (layer1-extractor.ts:1073); never a paraphrase. */
  evidence: string
}

// On the existing top-level extraction shape (layer1-extractor.ts:556 area):
orientation_observations?: OrientationObservation[]
```

**Why an array, not a single field:** an examination can show BOTH markers in different parts of its reasoning (e.g. genuine examination of one circle's obligation alongside habitual handling of another) — collapsing to one value at extraction time would force a premature verdict; §1.2's threshold computation resolves the array to one reading deterministically, the same division of labour the existing extraction/mechanism split already uses everywhere else in this codebase.

**Gaming dimension, named per the build plan's own instruction (`2026-08-01-...-build-plan.md:60`):** *"the reading exists to be harder to game than proximity, so the review must attack exactly that claim"* — the reading is bounded by the same extraction-trust ceiling as every other Layer-1 signal (`gaming-robustness-extraction-trust-locus-split` memory: honest extraction defends against harm-in-text, is defeated by self-report omission). This document does not resolve that; it is named here so the eventual PR19 review inherits it as a required dimension, not a discovery.

### 1.2 The threshold condition

Per C2b (`2026-08-01-...-build-plan.md:61`): *"Layer-2 computes `toward | away | indeterminate` + a `*_basis`, conservative-by-default (`indeterminate` on thin evidence — the house evidence-floor discipline; never a defaulted `toward`)."*

```typescript
export type OrientationReading = 'toward' | 'away' | 'indeterminate'

/**
 * Pure, deterministic — mirrors computeProximity's own weakest-link discipline
 * (per-signal, conservative default) rather than inventing a new pattern.
 * Never called with a confidence override; never an LLM call (Q5: the
 * instrument computes the reading deterministically FROM extracted features,
 * the agent's reasoning stays free — the same relationship as the existing
 * proximity reading, per the mentor's own Q5 answer).
 */
function computeOrientationReading(
  observations: OrientationObservation[] | undefined
): { reading: OrientationReading; basis: string } {
  if (!observations || observations.length === 0) {
    return { reading: 'indeterminate', basis: 'no_orientation_observations_extracted' }
  }
  const genuine = observations.filter(o => o.observed === 'genuine_examination_markers').length
  const habitual = observations.filter(o => o.observed === 'habitual_output_markers').length
  if (genuine > 0 && habitual === 0) return { reading: 'toward', basis: 'genuine_examination_markers_only' }
  if (habitual > 0 && genuine === 0) return { reading: 'away', basis: 'habitual_output_markers_only' }
  // Mixed evidence, or a tie: conservative default is indeterminate, never a
  // defaulted 'toward' (the house evidence-floor discipline, EVIDENCE_FLOOR
  // precedent in trajectory-delta.ts:125 — never manufacture a positive read
  // from ambiguous evidence).
  return { reading: 'indeterminate', basis: genuine === habitual ? 'mixed_or_tied_observations' : 'insufficient_extraction' }
}
```

**Never fed back into the verdict — structural, not just documented.** Per C2b's own engineering consequence (`2026-08-01-...-build-plan.md:62`, point 1): the computation "must live **outside** `applyMechanisms`' returned assessment." `computeOrientationReading` above takes no `Layer2Assessment` and returns nothing consumed by `computeProximity` — it is called AFTER the assessment is finalised, from the stored extraction, the same structural discipline `computeOrientationReading`'s non-participation in `applyMechanisms`'s call graph already enforces by construction (mirrors the trajectory-delta / practice-suggestion overlays, which read a finished assessment and never write back into one — `D-AGENT-EXTENSION-AE1-...`).

### 1.3 The "Layer-3 prose framing" element, corrected against the placement ruling

The original four-element C2 description (from before the 2026-08-05 widening, referenced in `D-MENTOR-ARCHITECTURE-MAP-REVIEW-INSTRUCTIONS-RECEIVED-2026-08-05:17701`) named "the Layer-3 prose framing" as one of C2's four elements. Read literally, "Layer-3" names the live LLM prose-generation call in the examination pipeline (Layer 1→2→3) — but the C2c placement ruling, settled the SAME day the four elements were first named and BEFORE the widening, is explicit that the reading is **never rendered in any practice-voiced surface** and **never fed back to the agent** (`2026-08-01-...-build-plan.md:62`, point 3 and the placement text itself). There is no live LLM call that produces agent-facing prose about this reading — that would BE the surfacing the ruling forbids.

**What "prose framing" correctly means, per the placement ruling's own template pattern:** a fixed, deterministic entry-text template, mirroring the not-attestable clause's own inline template (`2026-08-01-...-practice-on-verbatim.md:209`: *"The reading says: this examination moved toward the rational order or this examination moved away from it. It does not say: this agent is oriented toward the rational order."*):

```typescript
const ORIENTATION_ENTRY_TEXT: Record<OrientationReading, string> = {
  toward: 'This examination moved toward the rational order.',
  away: 'This examination moved away from the rational order.',
  indeterminate: 'This examination showed insufficient evidence to read a direction.',
}
```

No LLM call composes this text; it is selected from `computeOrientationReading`'s deterministic output, the same way the S10 envelope's fixed strings are selected rather than generated (`trust-record-payload.ts:41-49`). This element of C2's scope is corrected to name a template selection, not a Layer-3 generation call — flagged here rather than silently renamed, since "Layer-3 prose framing" in the original description could otherwise be read as licensing exactly the kind of surfacing the placement ruling forbids.

### 1.4 The trust-event type C1c writes (see §4 for the full class)

The orientation reading, once computed, is the thing C1c's event describes. Named here as the connection point; the event shape itself is scoped in §4, per the widened-scope requirement that both be visible together.

---

## 2. C2(ii) — the generative-prompt field

### 2.1 The settled format

Per `D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05` ruling 5, made exact by the mentor: **one sentence, maximum**, of the form *"this action engaged circle N but left room to extend toward circle N+1 by [gap description]."* Never a prescribed action — the instruction/prescription happens in the IDEA loop's own generation step, never here.

```typescript
/**
 * Populated only when computeOrientationReading (§1.2) returns 'away' or
 * 'indeterminate' on an examination that DID engage at least one identified
 * circle (§2.2 — never on an examination with no circle engagement at all,
 * since there is no "engaged circle N" to name). Absent on 'toward' readings
 * — a reading that shows genuine examination toward the telos names no gap
 * to seed, per the mentor's own field-shape guidance (the prebrief document,
 * §5: a description of the gap, never an instruction).
 */
generativePrompt?: string  // e.g. "this action engaged circle 3 but left room
                            // to extend toward circle 4 by naming the affected
                            // parties' own stated interests, not only the
                            // requester's."
```

**Population condition, named as a design call this document makes explicit (not directly stated by either ruling):** the field only fires on `away`/`indeterminate` readings, never `toward` — a `toward` reading has nothing to seed a gap description from; forcing one would either fabricate a gap that doesn't exist or repeat the same "toward" fact the reading itself already states, neither of which is a gap description. This mirrors the null-cycle rule's own honesty discipline (`D-IDEA-LOOP-EXAMINATION-COST-RULED-NULL-CYCLE-2026-08-05` §5: never manufacture a result where none exists) applied one layer upstream, at generation rather than at examination.

### 2.2 The connection to `OikeiosisGap` — a genuine tension, named not silently resolved

`OikeiosisGap.targetCircleMeaning` is documented (`2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md:26-30`) as: *"Free text, not a computed field — this is the human-authored (or mentor-authored) framing the generation step reads, not something the type itself derives."* C2's `generativePrompt` is, by construction, a **computed field** (a deterministic template over an examination's extracted observations, §1.2/§2.1) — the two cannot be the same field without contradicting the already-approved type's own documented character.

**Reading recommended, not yet ruled:** `generativePrompt` is a **per-examination seed**, one output of one consult — it is not itself an `OikeiosisGap`. The IDEA loop's external runner (or a human/mentor, per the approved type's own "human-authored or mentor-authored" framing) reads one or more `generativePrompt` values across a session's examinations and **authors** the next cycle's `OikeiosisGap.targetCircleMeaning` from them — consumption, synthesis, and authorship remain a runner/human act, consistent with both the externally-driven ruling (`06-PLAIN-TEXT-MIRROR.md:146`: the runner holds developing context, SageReasoning stays stateless per call) and `OikeiosisGap`'s own documented non-derivation. `generativePrompt` is downstream-consumable raw material for that authorship, not a substitute for it. This reading is offered for mentor confirmation, since it is the connection point between two independently-ruled shapes that were never explicitly reconciled with each other until this document.

### 2.3 Never feeds back into the verdict — the tension already resolved

Per ruling 5 (`D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05`): *"the field's output can never be consumed generatively by a downstream process" is NOT what the constraint means* — the constraint targets only THIS examination's own proximity verdict. `generativePrompt` feeding a LATER cycle's generation step is downstream consumption of a completed result, not feedback into its own verdict. Already settled; restated here only as the connection point §2.1's field depends on.

---

## 3. C2(iii) — the novelty detection specification

Per `D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05` ruling 3: **structural novelty only**, reusing `trajectory-delta.ts`'s existing 3-occurrence evidence floor (`EVIDENCE_FLOOR = 3`, `trajectory-delta.ts:125`).

```typescript
/**
 * Query the history table (agent_assessment_history — the same table
 * trajectory-delta.ts already windows over) for the circle/virtue-domain-
 * combination distribution within the session window. A GeneratedCandidate's
 * (targetCircle, initialClassification.domains) combination is flagged novel
 * if it falls outside that distribution OR has appeared fewer than
 * EVIDENCE_FLOOR (3) times — reusing the exact constant, not a re-derived
 * threshold, per the ruling's own instruction ("the existing 3-occurrence
 * evidence floor, reused").
 */
function assessStructuralNovelty(
  candidate: Pick<GeneratedCandidate, 'targetCircle' | 'initialClassification'>,
  historyWindow: /* the same windowed row set trajectory-delta.ts reads */ AssessmentHistoryRow[]
): { novel: boolean; confidence: number } {
  // ... count matching (circle, domain-combination) rows in historyWindow;
  // novel = count < EVIDENCE_FLOOR; confidence scales with how far below/
  // above the floor the count sits (a build-time detail, not fixed here —
  // the ruling fixes the QUERY shape and the floor value, not the exact
  // confidence curve).
}
```

**Where this reuses existing surfaces, exactly:** `agent_assessment_history` (already queried by `trajectory-delta.ts` for the same window discipline — no new table); `EVIDENCE_FLOOR` (the exact constant, not a re-derived number); the session-window scoping (`trajectory-delta.ts`'s own D17 windowing pattern, narrowed here to one loop's session rather than the 90-day/30-instance trajectory window — a build-time parameter, named as a design call this document does not fix, since neither ruling specifies the window's exact bound for the IDEA-loop case as opposed to the trajectory-delta case it's borrowed from).

**Result storage, per ruling 3's own instruction:** *"Store the result as a boolean + confidence score on the `GeneratedCandidate` type"* — already present as `passedNoveltyCheck?: boolean` on the approved `GeneratedCandidate` type (`2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md:145-147`); the `generationConfidence` field on the same type is a DIFFERENT, orthogonal signal (§2 of that document, explicitly: *"generationConfidence and the examination result... are ORTHOGONAL"*), so novelty's own confidence needs its own field, not a reuse of `generationConfidence`:

```typescript
/** ADDED per this scope's C2(iii). Distinct from generationConfidence (a
 *  generation-time relevance signal) and distinct from passedNoveltyCheck
 *  (the boolean verdict) — the novelty check's own confidence in that
 *  boolean, per the structural-novelty method's inherent imprecision
 *  (the honest limitation named in the prebrief: "two structurally
 *  identical but substantively different actions won't be distinguished"). */
noveltyConfidence?: number  // on GeneratedCandidate, alongside passedNoveltyCheck
```

**Honest limitation, documented at build time per the ruling's own instruction, not discovered later:** structural novelty cannot distinguish two structurally identical but substantively different actions (same circle, same virtue domains, genuinely different content) — named explicitly in the prebrief document (`2026-08-05-...-prebrief-technical-feedback.md:27`) and restated here as a build-time requirement, not an implementation afterthought. Content novelty (embeddings / LLM-as-judge) remains a named future upgrade, not required for this build.

---

## 4. C1c — the trust-ledger event class(es) for the orientation reading

Per §0's adopted reading: this section scopes the trust-event class C2's own output feeds — separate from, and not to be confused with, the original build-plan C1c (first-circle failure/demonstration events, still separately outstanding).

### 4.1 Whether this needs an `agent_trust_events` type at all — the storage-home election

The C2c placement ruling itself names this as an open build-time election (`2026-08-01-...-build-plan.md:62`, point 2): *"storage home (a new event class in the same CHECK-widening step as C1c, vs a sibling store) is a build-time election."* This document takes the election up, since C2/C1c is now the build-time session the ruling deferred it to.

**Option A — a new `agent_trust_events` event type.** There is a direct, working precedent for exactly this shape: `stoa-declaration-diverges-from-calling` (`derive-trust-events.ts`, `trust-transition.ts:63-67` and the surrounding comment) is ALREADY a `'flag'`-effect event — documented in-code as *"a genuine no-op here"* — added specifically to measure a divergence without ever moving a domain level. The orientation reading is the same shape: a measured fact that must never bind. Reusing this pattern means one derivation module (`derive-trust-events.ts`), one migration (widening the existing `event_type` CHECK, `[trust-core-migration].sql:121-134`), and no new table.

**Option B — a sibling store** (a new, dedicated table, mirroring `collaboration_records`'s or `agent_hold_observations`'s standalone pattern). Structurally isolates the reading from any possibility of ever being picked up by `EVENT_EFFECT`/`computeAggregate`/decay — the isolation is by construction (a different table `readTrustVerdict` never queries), not by convention (a CHECK'd-in event type that must never be added to a real effect branch).

**RULED 2026-08-06 — Option A confirmed** (`D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06`): reuse `agent_trust_events`, on the strength of the Stoa precedent — the codebase already has one measure-only, no-op-effect event type on this exact ledger, proving the pattern is safe in practice, not just in theory. One migration, widening only the `event_type` CHECK. No new table.

### 4.2 The event type(s)

```typescript
// New event_type CHECK values (agent_trust_events.event_type):
'orientation-reading-toward'
'orientation-reading-away'
'orientation-reading-indeterminate'
```

**Three types, not one type with a payload field, mirroring the existing pattern:** `justice-surface-{violated,unevaluated,indeterminate,transparently-handled}` already encodes a multi-way outcome as distinct event types rather than one type with a status field (`[trust-core-migration].sql:121-134`) — "event_type is the single source of truth for the event's effect on trust state" (the migration's own comment). Three types keeps orientation consistent with that existing discipline rather than introducing a new pattern for one signal.

**`EVENT_EFFECT` entry, all three `'flag'`:**

```typescript
'orientation-reading-toward': 'flag',
'orientation-reading-away': 'flag',
'orientation-reading-indeterminate': 'flag',
```

Identical to `stoa-declaration-diverges-from-calling`'s own effect — a genuine no-op, structurally incapable of moving a domain level, pinned by the same battery discipline that pins the Stoa event (`stoa-claim-contradicted-*` / `stoa-declaration-diverges-from-calling` regression tests). This is the mechanism that makes C2c's own pin ("no basis code, no event, no suggestion derives from [reading-vs-reflection divergence]") true by construction rather than by discipline alone — the SAME structural technique the codebase already uses for its one other measure-only ledger event.

### 4.3 `virtue_domain` — NULL, not a cardinal

The `virtue_domain` CHECK admits `phronesis | dikaiosyne | andreia | sophrosyne | oversight` (`[trust-core-migration].sql:104-105`) — none of which is the orientation reading's actual axis (direction toward/away from the telos across ALL examined circles, not one cardinal virtue's engagement). Forcing it under `phronesis` (the closest conceptual fit — practical wisdom oriented at right reason) would risk the reading being read, by a future session, as ordinary phronesis-domain evidence — exactly the kind of accidental binding §2.3/C2c's pin exists to prevent.

**RULED 2026-08-06 — confirmed** (`D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06`): `virtue_domain: NULL`, following the EXACT precedent of `reflect-completed-honest` — an agent-wide event, not tied to one domain (`[trust-core-migration].sql:99-100`: *"NULL for AGENT-WIDE events... reflect-completed-honest modulates decay across all of an agent's domains and is not tied to one"*). The orientation reading is agent-wide in the same sense: it describes the whole examination's directional character, not one virtue domain's engagement. **No `virtue_domain` CHECK widening needed** — only the `event_type` CHECK needs widening (§4.1).

### 4.4 `artifact_kind`/`artifact_ref` — the R18f-parallel proof

Every existing event requires a verifiable artifact (`artifact_kind NOT NULL CHECK (... IN ('signed_layer2_assessment', 'reflect_completion'))`, `[trust-core-migration].sql:139-143` — "no trust event without a verifiable artifact"). The orientation reading is derived from the SAME signed Layer-2 assessment C2's reading is computed over (§1.2) — `artifact_kind: 'signed_layer2_assessment'` applies unchanged, no new artifact kind needed. The derivation re-verifies the signature before deriving the event, the same R18f-parallel rule every other derivation follows (`derive-trust-events.ts`'s own header discipline).

### 4.5 S10's read side — the bounded exception

Per C2c's own engineering note (`2026-08-01-...-build-plan.md:62`, point 2): *"S10's state-fold-only posture gains a deliberate, bounded exception — a capped recent-entries list of orientation readings, each carrying the inline clause (the reflect-summary cap precedent)."* S10's own documented design ("The event ledger. Only the state fold is served," `trust-record-payload.ts:19-22`) explicitly declines raw-event serving as a general policy — this is a NAMED, SCOPED exception to that policy, mirroring the reflect-summary cap already carried (`trust-record-payload.ts`'s honest-reflect-summary composition, capped, per the S10 build record's "capped 500... honest payload note").

```typescript
// GET /api/trust-record/{agent_id} — new capped field, per C2c/C2d:
orientation_readings?: Array<{
  reading: OrientationReading
  entry_text: string          // ORIENTATION_ENTRY_TEXT[reading], §1.3 — the
                                // examination-not-agent template
  not_attestable_clause: string  // carried inline, EVERY entry — C2d, verbatim
  occurred_at: string
}>  // capped at N most recent (N a build-time parameter; mirrors the reflect
    // -summary cap, not proposed here)
```

This list is composed from the three `orientation-reading-*` events (§4.2) — the EXACT mechanism the S10 build already uses to compose the reflect summary from its own bounded event slice, not a new read pattern. **§4.3's `virtue_domain: NULL` means these events are excluded from `readTrustVerdict`'s per-domain aggregation by construction** (the aggregation folds by domain; a NULL-domain event has no domain to fold into, same as `reflect-completed-honest` today) — a second, independent structural reason (alongside `'flag'`, §4.2) the reading cannot bind.

### 4.6 The not-attestable clause (C2d) — where it lands

Per C2d (`2026-08-01-...-build-plan.md:63`): the mentor's exact two sentences — *"The record can attest that specific examinations were oriented toward the rational order. It cannot attest that the agent is fifth-circle-aligned."* — go into (a) ADR-013 §8's dated amendment, (b) `TRUST_RECORD_ENVELOPE` in `trust-record-payload.ts` verbatim, and (c) all three R18 public surfaces (`llms.txt`, `agent-card.json`, api-docs), per the SAME founder-sign-off-before-any-public-surface-change pattern every prior R18 change in this arc has followed. **Founder sign-off on the exact wording, before any public file changes** — restated here as a hard gate on the eventual build, not a build-time detail to improvise.

---

## 5. Connection points — one sentence each (PR20 mechanism naming)

- **`layer1-extractor.ts:180-187`** (`obligation_assessment` on `OikeiosisCircleEngaged`) — the direct precedent `OrientationObservation` (§1.1) follows: optional, additive, evidence-spanned, populated only when the condition applies.
- **`derive-trust-events.ts` / `trust-transition.ts:40-67`** (`EVENT_EFFECT` map + the `stoa-declaration-diverges-from-calling` `'flag'` precedent) — the exact mechanism §4.2's three new event types reuse, not a novel pattern.
- **`trust-record-payload.ts:19-22, 41-49`** (`TRUST_RECORD_ENVELOPE`, the state-fold-only design decision) — where C2d's clause lands, and the design principle §4.5's bounded exception is named against.
- **`trajectory-delta.ts:125`** (`EVIDENCE_FLOOR = 3`) — the exact constant §3's novelty check reuses, not a re-derived threshold.
- **`2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md`** (`OikeiosisGap.targetCircleMeaning`, `GeneratedCandidate.passedNoveltyCheck`/`generationConfidence`) — the already-approved types §2.2/§3 connect to, with §2.2's tension named rather than silently assumed compatible.
- **`kathekon-engagement.ts:1-40`** (the Q3 predicate, self-circle narrowing) — NOT touched by this scope; the orientation reading is a separate axis from kathekon engagement, named here only to confirm no overlap/collision was found.

---

## 6. What this document does not do

- Does not build C2 or C1c — the mentor's approval covers the shape; committing code, the migration, and the derivation module is a separate, still-unstarted build session.
- Does not address the original build-plan C1c (first-circle failure/demonstration events) — confirmed by ruling as a distinct, separately-outstanding item, its own future session.
- Does not touch D4 (`derive-trust-events.ts`'s reducer divergence) — independent, its own track.
- Does not touch the Stoa activation (independent, founder-walked whenever elected).
- Does not open the generation step's own scope document (now separately unblocked; not this session's task) — though §2.2's `generativePrompt`/`OikeiosisGap` design principle and §3's novelty-detection honest-limitation are confirmed to carry forward into it, so neither needs rediscovery there.
- Does not write any TypeScript file, migration, or RLS policy into the codebase — every shape above is proposed for review and approved as a shape; nothing is committed.

## 7. Connection to permission scrutiny layer (2026-08-07)

The C2 orientation reading's output — toward/away/indeterminate — is one of three inputs to the permission scrutiny layer's second-pass trigger condition (`06-PLAIN-TEXT-MIRROR.md` §Sixth element, item 15). An `away` or `indeterminate` reading on an action that also engages circle 3 or above and requests a tier-(c) or tier-(d) permission is the clearest case for the second scrutiny pass. The orientation reading does not itself determine the permission level — it is one signal among three (circle-width, indifferent-rank, orientation direction). This connection is named here to prevent the C2 build from being treated as self-contained when it is in fact an upstream input to the permission layer. **The permission layer's own scope document (item 15) is the authoritative home for how these signals compose** — this section is a pointer, not a restatement.

## 8. Connection to blast_radius field (2026-08-07)

The value-stake extraction step of the second-order impact analysis (item 14) produces the `blast_radius` field. The orientation reading's `away`/`indeterminate` signal is a **trigger** for that extraction step — it is **not itself the `blast_radius` value**. The `blast_radius` value is the output of the full three-step analysis (structured elicitation + independent LLM search + value-stake extraction), not a direct derivative of the orientation reading alone. This distinction must be preserved in the permission layer's scope document and in any future build that touches both mechanisms.

**Ruled by mentor consultation, 2026-08-07** (`D-C2-PERMISSION-LAYER-CONNECTION-NAMED-2026-08-07`): C2's orientation reading is a named upstream input to the permission scrutiny layer's second-pass trigger condition. Neither §7 nor §8 changes anything about C2's own build (scoped and approved 2026-08-06) — they name a connection to two mechanisms scoped the following day (items 14–16), so the C2 build does not proceed unaware of what it feeds.

---

*This document was offered for the mentor's review per the established pattern (author the shape, name the connecting surfaces at mechanism level, flag genuine open questions rather than resolve them silently, bring the whole thing before writing generation logic) and was APPROVED 2026-08-06, with both flagged open questions ruled — §0 to the orientation-reading reading of C1c (the graph's "circle-4" phrasing corrected to "circle-5"; the original build-plan C1c confirmed separately outstanding), and §4.1/§4.3 to Option A (reuse `agent_trust_events`, `virtue_domain: NULL`). See `D-C1C-NAMING-RESOLVED-2026-08-06` and `D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06` for the rulings verbatim. C2 builds first; C1c builds second; neither builds until the founder elects to open the build session.*
