# Scope: the IDEA loop configuration shape, and shared task-list storage

**Session:** 2026-08-06 (continuation). Tier: `governance`/`code-elevated` — two design/shape scope documents, no code written. Per the binding sequence (`06-PLAIN-TEXT-MIRROR.md` §Sixth element, item 13), these are prerequisites for the generation step's own scope document. This document does **not** scope the generation step (the seven heuristics' implementation, still queued last) and does **not** touch C2/C1c (independent, unblocked by this).

**Method:** as with the prior type-scope document, every field is justified by an existing binding ruling (cited) or an existing architectural surface (cited, mechanism-level only, per PR20). Where a genuine open question surfaces that no ruling has settled, it is named as open rather than resolved silently.

**Status: APPROVED by the mentor, 2026-08-06 (same day), both open architectural questions resolved.** Ruling one confirms A.1's recommended option 1 (external-only configuration) and adds a `loopId` field to `IdeaLoopConfiguration`. Ruling two confirms B.4's recommended option 2 (shared task list stored external to SageReasoning). A companion amendment adds a sixth `cycleOutcome` value, `'dependency_unavailable'`, to `GeneratedCandidate` (applied directly to the type-scope document, not repeated here). See `D-IDEA-LOOP-CONFIG-AND-SHARED-TASKLIST-RULED-2026-08-06` for the ruling verbatim and full disposition. The recommendation prose in A.1 and B.4 below is left in place, marked resolved rather than deleted, so the reasoning that led to each ruling stays legible alongside the ruling itself.

---

## Part A — the IDEA loop configuration shape

### A.1 The tension this scoping session has to resolve first

Before any parameter shape is fixed, one thing needs resolving: the IDEA loop is ruled **externally-driven** (`06-PLAIN-TEXT-MIRROR.md` §Sixth element, the 2026-08-05 ruling) — "the loop lives OUTSIDE SageReasoning's own servers... SageReasoning stays stateless and request-scoped on every call." The four configuration parameters (`minimumInterval`, `maximumDuration`, `randomOffsetPercent`, `minimumIncubationInterval`) were introduced in session reasoning as *loop* parameters — but a loop, on this architecture, is not a SageReasoning-hosted process. So: whose configuration is this?

**Three candidate answers, named rather than picked silently:**

1. **The external runner owns and enforces the configuration entirely.** SageReasoning never sees these values — they're config for the founder's Claude Code session, a dedicated harness, or a future purpose-built runner, living wherever that runner's own settings live (an env file, a settings.json block, a CLI flag). SageReasoning's per-call contract (examination, novelty check, trust-event write) doesn't change shape at all.
2. **SageReasoning exposes the values as advisory, the runner is expected (not required) to honour them.** A configuration record lives server-side, readable by any runner on request, but SageReasoning has no mechanism to enforce cadence on a process it doesn't control — a runner that ignores `minimumInterval` and calls every second faces only the ordinary rate limits, nothing loop-aware.
3. **SageReasoning enforces a subset server-side, structurally.** E.g., `minimumInterval` and `maximumDuration` could plausibly be enforced through the existing rate-limit + gate machinery (a per-credential minimum-interval check on the consult endpoint) even though the loop itself is external — but `minimumIncubationInterval` and `randomOffsetPercent` are meaningless to enforce server-side (incubation is about *not calling*, and jitter is a scheduling choice the runner makes, not something SageReasoning can see or verify from a single stateless call).

**Recommendation (not a ruling — for the mentor to confirm or override): option 1, with a documented advisory contract.** The externally-driven ruling's own stated reasoning — "a cron-tick model... destroys the exact thing that makes generation different from scheduled processing" — is a ruling about where *state* lives, and configuration is a kind of state (cycle-to-cycle memory of "when did I last run, how long am I allowed to run"). Keeping configuration external is the same move as keeping cycle state external: consistent, not a new design surface. SageReasoning's contract already gives the runner everything it needs to *compute* whether a call is due (the trust-event history it writes per cycle carries timestamps) — the runner doesn't need SageReasoning to tell it its own configuration back. Option 3's partial server-side enforcement would create a split-brain contract (some parameters enforced, some not, for reasons a runner author would have to intuit) without a stated purpose it serves that option 1 doesn't already serve via ordinary rate limiting.

**This recommendation is flagged for the mentor precisely because it changes what "scope the configuration shape" means.** If option 1 holds, the deliverable below is a **documented external-configuration contract** (a shape a compliant runner is expected to hold, validated against nothing server-side) rather than a SageReasoning-hosted table or schema. If the mentor prefers option 2 or 3, the shape below still applies but gains a server-side read (and, for option 3, a partial enforcement point) not designed here.

**RULED 2026-08-06 — option 1 confirmed.** The mentor's disposition (`D-IDEA-LOOP-CONFIG-AND-SHARED-TASKLIST-RULED-2026-08-06`): "The external runner owns and enforces the IDEA loop configuration entirely. SageReasoning never sees these values." `IdeaLoopConfiguration` (A.2, now including `loopId`) is the documented external-configuration contract — it lives with the runner's own tooling, never as a SageReasoning-hosted schema or table. Options 2 and 3 are closed.

### A.2 The shape (four parameters, as given by the mentor's 2026-08-06 correction)

Written as a plain configuration record — a TypeScript interface for illustration, not proposed as a server-persisted type until A.1 is resolved:

```typescript
export interface IdeaLoopConfiguration {
  schema: 'idea-loop-configuration-v1'

  /**
   * ADDED by mentor ruling, 2026-08-06 (A.1 resolved to option 1 — external-only
   * configuration). Assigned at loop instantiation, by the runner, and carried
   * on every trust-event write that loop instance produces. Purpose: distinguishing
   * one loop instance's trust-event writes from another's in multi-loop operation
   * — the minimum coordination surface for multi-loop operation without requiring
   * SageReasoning to manage loop identity itself (consistent with SageReasoning
   * staying stateless and request-scoped per call). Required, not optional: a
   * runner without a loopId cannot be told apart from another runner's writes
   * once more than one loop is operating concurrently.
   */
  loopId: string

  /**
   * The minimum time (milliseconds) between the initiation of one cycle and the
   * initiation of the next. Computational throttling — prevents a runner from
   * hammering the examination/novelty-check/trust-event-write contract faster
   * than the loop is meant to run.
   */
  minimumInterval: number

  /**
   * The ceiling (milliseconds) on how long a single cycle may run before it is
   * terminated regardless of outcome — including a cycle stuck mid-generation,
   * mid-guardrail-filtering, or mid-full-examination. A hard timeout, not a
   * soft target.
   */
  maximumDuration: number

  /**
   * A percentage (0-100) of jitter applied to minimumInterval, for two stated
   * purposes (D-IDEA-LOOP-NEUROSCIENCE-ADDITIONS-RECORDED-2026-08-06): preventing
   * synchronisation problems when multiple loops run simultaneously (the
   * thundering-herd case), and introducing phantasia variation into the
   * generation step's input sequence (a deliberate, not incidental, use of
   * randomness — see A.3).
   */
  randomOffsetPercent: number

  /**
   * The mandatory wait (milliseconds) between the close of one cycle and the
   * initiation of the next generation step. Distinct from minimumInterval: not
   * a computational throttle but a design-encoded incubation period — the
   * neuroscience-grounded claim (D-IDEA-LOOP-NEUROSCIENCE-ADDITIONS-RECORDED-
   * 2026-08-06) that generative capacity increases when the system is not
   * actively processing, and that allowing new material to enter the
   * knowledge-base context between cycles increases the probability the next
   * generation step draws on richer, more varied inputs than the previous
   * cycle had access to. Configurable per loop instance; default TBD (A.4).
   */
  minimumIncubationInterval: number
}
```

**Ordering constraint, stated but not enforced by the type itself (construction-time validation, mirroring the `OikeiösisGap` current+1 precedent):** `minimumIncubationInterval` should not exceed `minimumInterval` in any configuration where both apply to the same gap between cycles — if the incubation wait is longer than the throttle interval, the incubation wait is simply the binding constraint and the throttle is vestigial. Not a hard type-level rule (a runner might legitimately want incubation-dominant behaviour), but worth a documentation note rather than silent surprise.

### A.3 `randomOffsetPercent`'s second purpose — a genuine oddity worth naming, not resolving here

The parameter's *first* purpose (anti-synchronisation jitter on a scheduling interval) is a standard pattern needing no further comment. Its *second* stated purpose — "introducing phantasia variation into the generation step's input sequence" — is a different kind of thing: not timing jitter, but a claim that the *randomness itself* should influence what the generation step sees or produces. This reads as scoping content for the generation step (how, mechanically, does an interval's random offset percentage translate into "phantasia variation" in an input sequence — is it selecting a different subset of history to draw from, varying which heuristics run, something else?), not for the configuration shape. **Left as a single numeric parameter here; the mechanism connecting it to generation-step input variation is explicitly deferred to the generation step's own scope document**, consistent with the sequencing rule that this session fixes the shape's parameters, not the generation step's behaviour.

### A.4 Defaults — explicitly TBD, not decided by this document

Per the heuristics document: "`minimumIncubationInterval`... default value TBD at generation-step scoping" (later corrected to "TBD at generation-step scoping" in the neuroscience-additions section, i.e. deferred past this session, not fixed here). **No default value for any of the four parameters is proposed in this document.** This is a genuine gap for the mentor to either fill now or explicitly re-defer to the generation-step session — naming it rather than picking a plausible-looking number and letting it calcify as a de facto ruling.

### A.5 Connection points (PR20 mechanism naming)

- **The trust-event write per cycle** (per the externally-driven ruling — "providing only the examination, the novelty check, and the trust-event write per cycle") — under option 1 (A.1), this is the runner's own source of truth for computing elapsed time since the last cycle; no new SageReasoning read is needed for the runner to self-enforce `minimumInterval`/`minimumIncubationInterval`.
- **`GeneratedCandidate.gapRef`** (`2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md` §2) — already carries a `cycleNumber` component; a runner enforcing this configuration would use its own cycle counter to increment that field, not derive it from anything server-side.
- **The per-cycle dashboard table** (named, still unscoped, in the type-scope document §4 and the heuristics document) — if `maximumDuration` terminates a cycle mid-flight, the dashboard table's row for that cycle needs an honest outcome state for "terminated by timeout" alongside the existing `null_cycle` outcome named on `GeneratedCandidate.cycleOutcome` — named here as a consequence for that table's eventual scoping, not solved.
- **Existing rate-limit machinery** (`RATE_LIMITS`, referenced throughout the substrate) — the natural mechanism if the mentor selects option 3 (A.1); not designed here pending that decision.

---

## Part B — shared task-list storage

### B.1 What it's for

Per `D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05`: heuristic 7 (friction detection) reads "the current task list" to find routine tasks and the friction points they reveal. For that to work across more than one collaborating agent, the task list cannot be private state inside one loop runner's process — it must be **shared, externally-readable, multi-writer, multi-reader** storage.

### B.2 Structural distinctness from the per-cycle dashboard table — the fact to hold onto

Named twice already (the heuristics document, the type-scope document §5) and repeated here because it is the one fact this scoping session must not lose: the shared task list and the per-cycle dashboard table are **structurally different kinds of storage**, not two names for one table.

| | Shared task-list storage | Per-cycle dashboard table |
|---|---|---|
| Writers | Multiple — any collaborating agent may add, complete, or modify a task | One — the loop runner, once per cycle |
| Readers | Multiple — every collaborating agent, plus the friction-detection heuristic | The dashboard rendering surface (and, presumably, the runner itself for its own history) |
| Mutability | Mutable — tasks are created, claimed, completed, possibly reprioritised, over time | Append-only — one row per cycle, written once, never revised |
| Lifecycle | Ongoing, cross-session — a task can outlive many IDEA loop cycles | Per-cycle — one row is one cycle's complete record |
| Analogous to | A shared work-queue / kanban-shaped store | An audit log / trust-event ledger |

### B.3 A proposed shape — deliberately minimal, for review not commitment

```typescript
export interface SharedTask {
  schema: 'idea-loop-shared-task-v1'

  /** Stable identifier, assigned at creation. */
  taskId: string

  /** Plain-language description of the task. */
  description: string

  /**
   * Which agent (or process) created this task entry. Free text mirroring the
   * existing K1-canonical agent_id vocabulary used elsewhere (namespace:name@version)
   * where the creator is itself an agent identity; may also be a human-authored
   * task with no agent creator.
   */
  createdBy: string

  createdAt: string // ISO 8601

  /**
   * Status, kept deliberately small — this is a task list, not a project
   * management system. A task either hasn't been started, is being worked,
   * or is done. No "blocked"/"in review"/custom-workflow states — those are
   * a different tool's job, and adding them here risks turning "read the
   * current task list" into a heavyweight query the friction-detection
   * heuristic has to interpret rather than a simple read.
   */
  status: 'open' | 'in_progress' | 'done'

  /**
   * Populated only when a friction point is later detected against this task
   * (by heuristic 7, at generation time) — not set at task creation. Optional
   * because most tasks in the list at any moment will not yet have been
   * examined for friction; presence of this field does not mean the task
   * itself was slow, only that a friction assessment has run against it.
   */
  frictionAssessment?: {
    detected: boolean
    /** Present only when detected is true — the observed friction, in
     *  plain language, feeding heuristic 7's candidate generation. */
    description?: string
    assessedAt: string
  }
}
```

**What is deliberately absent, and why:** no `assignee` field (multi-agent collaboration per the ruling does not imply single-agent ownership of a task — a task can be claimed by whichever agent picks it up next, and adding assignment semantics now would be scoping a coordination protocol this document has no ruling to base it on); no priority/urgency field (the fifth-circle-weighting heuristic and the guardrail-shaped filtering pass are where "which candidate matters more" gets decided — duplicating that judgment into the task list itself would create two competing priority signals); no due date (nothing in the heuristics document or either ruling names time-pressure on task completion as part of friction detection — friction is about *how the task goes*, not *when it's due*).

### B.4 The open question this part genuinely cannot resolve alone

**Where does this storage live, architecturally?** The type-scope document's §4 named `agent_assessment_history` as the existing per-consult trajectory table and explicitly said a future dashboard table is distinct from it — but named no existing table this shared task list is close kin to. Two real candidates, neither decided here:

1. **A new, dedicated Supabase table** (`shared_tasks` or similar) — RLS-scoped presumably per project or per collaborating-agent-group, following the pattern of every other new storage surface in this arc (`collaboration_records`, `agent_trust_events`, etc.). Straightforward, but multi-agent read/write access control is a genuinely new RLS shape this arc hasn't had to solve yet (every existing table is either single-owner-scoped or admin/service-role-only — nothing so far is "readable and writable by an open set of collaborating agent identities").
2. **Something outside SageReasoning's own database entirely** — consistent with the externally-driven loop ruling's spirit (state that belongs to the collaborating agents' own coordination, not to SageReasoning's examination/trust-event contract), in which case SageReasoning's role in the friction-detection heuristic is purely as a *consumer* the runner hands the task list to, not as the table's host.

**Recommendation (not a ruling): option 2, on the same reasoning as Part A's recommendation.** The externally-driven ruling drew its line at "examination, novelty check, trust-event write" as SageReasoning's per-call contract; a shared task list that multiple agents mutate outside any single loop cycle is coordination infrastructure, not an examination artifact — closer in kind to the loop runner's own state (explicitly kept external) than to the trust ledger (explicitly kept server-side). If the mentor rules option 1 instead, the shape in B.3 is the RLS-table starting point; the new access-control pattern it needs would then be its own small design note before any migration is written.

**RULED 2026-08-06 — option 2 confirmed.** The mentor's disposition (`D-IDEA-LOOP-CONFIG-AND-SHARED-TASKLIST-RULED-2026-08-06`): "The shared task list lives outside SageReasoning's own database. SageReasoning's role in friction detection is as a consumer — the runner hands the task list to the generation step. SageReasoning does not host, write to, or manage access control for the shared task list." The `SharedTask` interface (B.3) is a specification for the **external storage shape**, not a migration target — option 1 (the RLS-table alternative) is closed.

### B.5 Connection points (PR20 mechanism naming)

- **Heuristic 7 / friction detection** (`2026-08-05-idea-loop-generation-heuristics.md`) — the sole consumer named so far; reads `status` and looks for tasks whose friction (however friction ends up being detected — not specified by either ruling) crosses whatever threshold the generation step's own scope document will define.
- **The null-cycle fallback rule** (same document) — "when the active generation mechanisms return three consecutive null cycles, the loop shifts to friction-detection-only mode... until a non-null cycle returns." This makes the shared task list a **required-available** dependency, not optional infrastructure: if it's unreachable, the fallback mode has nothing to read, and the null-cycle rule's own honesty discipline (a null cycle is a named, honest outcome, not a manufactured result) presumably extends to "friction detection was attempted and the task list was unreachable" as its own distinct, honestly-recorded state — named here as a case the generation step's scope document will need to handle, not solved.
- **`GeneratedCandidate.heuristic: 'friction_detection'`** (type-scope document §2) — a friction-detection candidate's `proposedAction` is derived from a `SharedTask.frictionAssessment.description`; the exact derivation (verbatim copy, summarisation, something else) is generation-step scope, not this document's.

---

## What this document does not do

- Does not scope the generation step's prompt structure, the friction-detection threshold, or how `randomOffsetPercent`'s phantasia-variation purpose mechanically affects generation input (named in A.3 as deferred to that session).
- Both architectural options named in A.1 and B.4 are now **ruled, not open** — see the RULED notes inline and `D-IDEA-LOOP-CONFIG-AND-SHARED-TASKLIST-RULED-2026-08-06`.
- Does not write any TypeScript file, migration, or RLS policy into the codebase (`IdeaLoopConfiguration` is a documented external contract by ruling, not a SageReasoning-hosted schema; `SharedTask` is a specification for external storage, not a migration target).
- Does not touch C2/C1c, D4, or the Stoa activation (all independent of this item, per the dependency graph).

---

*This document was offered for the mentor's review per the established pattern (author the shape, name the connecting surfaces and open architectural questions, bring it before writing generation logic) and was APPROVED 2026-08-06 with both open questions ruled — A.1 to option 1 (external-only configuration, plus a new `loopId` field), B.4 to option 2 (task list stored external to SageReasoning) — and one companion amendment (`GeneratedCandidate.cycleOutcome` gains `'dependency_unavailable'`, applied to the type-scope document). Both trace back to the same root tension: configuration and coordination state for an externally-driven loop needs an explicit "whose state is this" answer before either shape can be called scoped rather than merely drafted — that answer is now settled in both cases: external, consistently.*