# Scope: `OikeiösisGap` and `GeneratedCandidate` types

**Session:** 2026-08-06. Tier: `governance`/`code-elevated` — a type-shape scope document, no code written. Per the binding sequence (`D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05`), this is the item upstream of C2's own scope document. Per the same ruling: the generation step itself (the seven heuristics' implementation) is explicitly NOT scoped here — that remains queued for its own later session. This document also does not scope C2.

**Status: APPROVED by the mentor, 2026-08-06, with one ruling and two clarifications — folded into this document below.** See `D-OIKEIOSIS-GAP-GENERATED-CANDIDATE-TYPES-APPROVED-2026-08-06` in the decision log for the ruling verbatim and its disposition. **Amended 2026-08-06 (same day, config/shared-task-list scope review):** `cycleOutcome` gains a sixth value, `'dependency_unavailable'`, with a companion `unavailableDependency` field — see §2 below and `D-IDEA-LOOP-CONFIG-AND-SHARED-TASKLIST-RULED-2026-08-06`. **Amended 2026-08-09 (design-brief rulings, Q6):** `cycleOutcome` gains a seventh value, `'terminated_by_timeout'` — the honest candidate-level status for candidates in-flight when a cycle hits `maximumDuration` (*"leaving them 'pending' indefinitely is a false impression the record would present"* — the mentor, verbatim record `2026-08-09-mentor-consultation-autonomous-loop-design-brief-rulings-verbatim.md`; `D-AUTONOMOUS-LOOP-DESIGN-BRIEF-RULED-2026-08-09`). It sits alongside, not instead of, the cycle-level timeout record on the (separately-scoped) per-cycle table. **Note:** the committed-but-dark `website/src/lib/substrate/idea-loop-types.ts` transcribes the pre-amendment six-value shape and now lags this ruled shape by the one value — a named small code follow-up for the next code session that touches the module (no code edited under the design-brief session's scoping boundary).

**Method:** every field below is justified by an existing binding ruling (cited) or an existing architectural surface (cited, mechanism-level only, per PR20). Nothing here is invented past what the rulings already settled.

---

## 1. `OikeiösisGap` — the loop's direction input

Per the prebrief technical-feedback document (§1): nothing in the codebase generates a candidate action today; the discernment engine takes already-decided candidates and selects among them. Generative mode needs a new input type sitting *before* generation — a structured expression of the oikeiosis expansion gap the loop is meant to act on.

```typescript
export interface OikeiosisGap {
  schema: 'idea-loop-oikeiosis-gap-v1'

  /** The oikeiosis circle the agent is currently operating within. */
  currentCircle: OikeiosisCircleRank

  /** The circle the loop is oriented toward for this cycle. ALWAYS currentCircle + 1
   *  — never a jump. Enforced at construction, not just documented (see §3). */
  targetCircle: OikeiosisCircleRank

  /** Plain-language description of what serving targetCircle would mean in the
   *  context of the current project goal. Free text, not a computed field — this
   *  is the human-authored (or mentor-authored) framing the generation step reads,
   *  not something the type itself derives. */
  targetCircleMeaning: string
}
```

**On `OikeiosisCircleRank`:** the existing `OikeiosisCircle` type (`profiles.ts:53`) is `export type OikeiosisCircle = string` — a free-form deployer-defined string, not an enum, and not ordered. The "current + 1, never jump" rule requires an *ordered* representation, which the existing type cannot express on its own. Rather than widen `OikeiosisCircle` itself (used across the trust core, K1 identity, and the S1–S9 engine — out of scope to touch here), this type needs its own local ordinal wrapper:

```typescript
/** The five-circle oikeiosis ordering, LOCAL to the IDEA loop's gap/candidate
 *  types. Deliberately NOT a widening of the existing OikeiosisCircle (profiles.ts) —
 *  that type is free-form and used across the live trust core; this is a closed,
 *  ordered enumeration scoped to the generation step's own "current+1" rule. */
export type OikeiosisCircleRank = 1 | 2 | 3 | 4 | 5
```

A separate, later mapping between `OikeiosisCircleRank` and the live engine's `OikeiosisCircle` string vocabulary (`self_preservation | household | local_community | political_community | cosmopolis`, per the kathekon-engagement predicate) is needed wherever a `GeneratedCandidate` is eventually fed into the existing `DiscernmentInput.candidates` shape — named here as a connection point (§4), not built.

## 2. `GeneratedCandidate` — a not-yet-taken action

Distinct from `CandidateProfile` (`profiles.ts:168`), which describes an action/agent that already exists and is being evaluated for selection. `GeneratedCandidate` describes something a generation step proposed and that has not yet been examined, or is mid-examination.

```typescript
export interface GeneratedCandidate {
  schema: 'idea-loop-generated-candidate-v1'

  /**
   * Links back to the gap this candidate was generated to address. SETTLED by
   * mentor ruling, 2026-08-06 (not TBD): a cycle-local, self-describing identifier,
   * concatenating the session id, the cycle number within that session, and the
   * gap's own currentCircle/targetCircle values — human-readable on the dashboard
   * without external lookup, unique within any session, and requiring no separate
   * gap registry or foreign-key relationship to be meaningful.
   *
   * Format: `{sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}`
   * Example: `sess_9f2a:14:3->4`
   *
   * The generation-step scoping session inherits this format as settled.
   */
  gapRef: string

  /** Which of the seven generation heuristics produced this candidate. Load-bearing
   *  for the filtering pipeline (D-IDEA-LOOP-GENERATION-HEURISTICS-CAPTURED-2026-08-05)
   *  and for future review of heuristic productivity. */
  heuristic:
    | 'analogous_transfer'
    | 'combinatorial_generation'
    | 'synthesis_over_novelty'
    | 'context_transfer'
    | 'fifth_circle_weighting'
    | 'anomaly_detection'
    | 'friction_detection'

  /** The proposed action, in plain language. What the generation step produced —
   *  not yet taken, not yet examined. */
  proposedAction: string

  /** The circle this candidate is oriented toward (mirrors OikeiosisGap.targetCircle
   *  for the six virtue-domain-tagged heuristics). ABSENT for a friction_detection
   *  candidate — see the classification split below. */
  targetCircle?: OikeiosisCircleRank

  /**
   * The candidate's initial classification. Six of seven heuristics tag by virtue
   * domain (D-IDEA-LOOP-GENERATION-HEURISTICS-CAPTURED-2026-08-05); friction_detection
   * tags by preferred-indifferent status instead — a genuinely different initial
   * classification, per D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05:
   * "friction-detection candidates carry a preferred-indifferent tag at generation
   * time, not a virtue-domain tag; examination determines afterward whether one
   * incidentally engages a virtue domain, and if not, it remains a valid candidate
   * anyway (appropriate action, kathekon, even when not perfect action, katorthoma)."
   * Modelled as a discriminated union so a friction candidate cannot be forced into
   * the virtue-domain shape the other six use.
   */
  initialClassification:
    | { kind: 'virtue_domain'; domains: VirtueDomain[] }
    | { kind: 'preferred_indifferent' }

  /**
   * How strongly the generation step believes this candidate genuinely addresses
   * the gap. SETTLED by mentor ruling, 2026-08-06 (not TBD): a 0.0–1.0 scale,
   * expressed to two decimal places, where 0.0 means the heuristic produced the
   * candidate but has no basis for believing it addresses the gap, and 1.0 means
   * the heuristic has strong structural reason to believe the candidate directly
   * addresses the gap.
   *
   * NOT a probability estimate, and NOT a prediction of the examination outcome —
   * a generation-time relevance signal only. generationConfidence and the
   * examination result (guardrailResult / passedNoveltyCheck below) are
   * ORTHOGONAL: a low-confidence candidate that passes the guardrail examination
   * is still a valid candidate; a high-confidence candidate that fails the
   * guardrail examination is still rejected. Neither signal substitutes for or
   * predicts the other.
   */
  generationConfidence: number

  /**
   * Guardrail-shaped examination result — populated for ALL candidates during the
   * filtering pass (D-IDEA-LOOP-EXAMINATION-COST-RULED-NULL-CYCLE-2026-08-05: "each
   * of the six passes through the guardrail-shaped examination only — proximity +
   * virtue-domain assessment, no Layer 3 prose call"). Absent before filtering runs.
   */
  guardrailResult?: {
    proximity: KatorthomaProximity
    virtueDomainsEngaged: VirtueDomain[]
  }

  /**
   * Full-examination prose — populated ONLY for the eventual cycle winner (the
   * highest-proximity candidate that also passes the novelty threshold), per the
   * same ruling: "gets the full examination shape (Layer 3 prose included) — that
   * prose becomes the dashboard's human-legible cycle result." Populated at a LATER
   * pipeline stage than guardrailResult, never both at once for a non-winning
   * candidate.
   */
  fullExaminationProse?: string

  /** Whether this candidate passed the novelty-detection check (populated after
   *  guardrailResult, before fullExaminationProse). Absent = not yet checked. */
  passedNoveltyCheck?: boolean

  /**
   * ADDED by mentor ruling, 2026-08-06 (clarification two). Makes the cycle's
   * disposition of this candidate a first-class, named outcome in the type system
   * rather than something inferred from which optional fields are populated —
   * consistent with the honest-claims discipline: the loop does not manufacture
   * novelty, and the type records that fact explicitly instead of leaving a gap
   * in the cycle history.
   *
   * 'null_cycle' is set specifically on the candidate the fallback mode produces
   * when three consecutive cycles return no candidate passing the novelty
   * threshold and the loop shifts to friction-detection-only mode (the fallback
   * rule, D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05). A null-cycle
   * candidate always carries heuristic: 'friction_detection' and
   * initialClassification: { kind: 'preferred_indifferent' } — it is not a
   * variant classification, it is the specific shape the fallback produces.
   */
  /**
   * ADDED by mentor ruling, 2026-08-09 (design-brief Q6): 'terminated_by_timeout' —
   * set on candidates in-flight when the cycle hits maximumDuration; the honest
   * candidate-level status, alongside the cycle-level timeout record on the
   * (separately-scoped) per-cycle table. Never left 'pending' indefinitely.
   */
  cycleOutcome: 'pending' | 'rejected_by_guardrail' | 'rejected_by_novelty' | 'winner' | 'null_cycle' | 'dependency_unavailable' | 'terminated_by_timeout'

  /**
   * ADDED by mentor ruling, 2026-08-06 (config/shared-task-list scope review).
   * Present only when cycleOutcome === 'dependency_unavailable' — names which
   * dependency was unreachable. The first named instance of this outcome is
   * friction detection attempting to read the shared task list and finding it
   * unreachable (per the null-cycle rule's honesty discipline extended to this
   * case, D-IDEA-LOOP-CONFIG-AND-SHARED-TASKLIST-RULED-2026-08-06): the loop
   * records the honest fact that a required dependency could not be reached,
   * rather than silently treating the attempt as a null cycle indistinguishable
   * from "generation produced nothing new."
   */
  unavailableDependency?: string
}
```

## 3. The current+1 rule — where it's enforced

Per the mentor's ruling that the loop targets "always current + 1, never jumping": this is a construction-time invariant on `OikeiosisGap`, not a runtime check on `GeneratedCandidate`. A `GeneratedCandidate.targetCircle` inherits its gap's `targetCircle` by construction (the generation step reads the gap and writes candidates against it) — the rule lives once, on `OikeiosisGap`, not duplicated as a re-derived check on every candidate. Noted here so the eventual generation-step build doesn't accidentally re-implement (and risk drifting) the same rule twice.

## 4. Connection points — one sentence each (PR20 mechanism naming)

- **`DiscernmentInput.candidates`** (`discernment-engine.ts:281`) — once a `GeneratedCandidate` has a `guardrailResult` and (for the winner) `fullExaminationProse`, it is the natural shape to eventually adapt into a `CandidateDiscernmentInput` if the IDEA loop's winning candidate is ever routed through the existing discernment engine rather than acted on directly; not built here.
- **`CandidateProfile`** (`profiles.ts:168`) — describes an existing candidate/agent being evaluated for selection; `GeneratedCandidate` is deliberately NOT this type, since it describes a not-yet-taken action, not an agent.
- **The guardrail-shaped examination path** (`/api/guardrail`, `guardrail-sandwich.ts`) — the mechanism `guardrailResult` is meant to be populated from, per the null-cycle ruling; the field's shape (`proximity` + `virtueDomainsEngaged`) mirrors that endpoint's existing response fields rather than inventing a new verdict shape.
- **The full-examination path** (`/api/reason`, Layer 1→2→3) — the mechanism `fullExaminationProse` is meant to be populated from, for the cycle winner only.
- **`agent_assessment_history`** — the existing per-consult trajectory table; a future per-cycle dashboard table (named in the prebrief document §3 as still-unscoped) is a distinct, new table, not an extension of this one.

## 5. Known-adjacent requirement, named but not solved here

Per `D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05`: the shared task-list state that friction detection (heuristic 7) reads from must be shared, externally-readable, multi-writer, multi-reader storage — structurally different from the append-only, one-writer per-cycle dashboard table also named as still-unscoped. Neither `OikeiosisGap` nor `GeneratedCandidate` needs to solve this; it is recorded here as an adjacent requirement for whichever session eventually scopes the storage layer, so it is not rediscovered mid-scoping.

**Added to the dependency graph by mentor ruling, 2026-08-06:** *Shared task-list storage* — blocks the friction-detection heuristic's implementation only. Does not block C2, does not block the other six heuristics, does not block these type definitions being committed. See `06-PLAIN-TEXT-MIRROR.md` §Sixth element for the graph update.

## 6. What this document does not do

- Does not scope the generation step's prompt structure or the seven heuristics' actual implementation (queued, per the standing sequence).
- Does not scope C2 (the orientation-reading generative-prompt field) — that follows this document, per the ruling.
- Does not write any TypeScript file into the codebase — the interfaces above are a proposed shape for review, not a committed module.
- Does not touch the Stoa trust-flag activation (independent, founder-walked whenever elected).

---

*This document was offered for the mentor's review per the established pattern (author the shape, name the connecting surfaces, bring it before writing generation logic) and was APPROVED 2026-08-06 with the ruling and two clarifications folded in above. No code, schema, or flag change accompanies it — the mentor's approval covers the type shape; committing an actual TypeScript module is a separate step, unblocked by this approval per the mentor's own note ("does not block the type definitions being committed") but not yet performed in this session.*
