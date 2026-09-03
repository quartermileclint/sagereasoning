# The standing-runner design session, second sitting (R9) — the pre-generate stage, the generation step's internal architecture, the environment tag, and the four routed items (A2, A3, A4, D)

**Date:** 2026-09-04. **Tier:** `governance` — a design session. **It designs; it does not build.**
No code, schema, flag, credential, or activation is licensed by this document. Every proposal that
would touch code or production is named as a candidate follow-on `code-*` session requiring its own
founder election. **Session model:** `claude-fable-5-1`, per the founder's setting at open.

**Opened by the founder, in-conversation, 2026-09-04** — *"pushed, open the session here"* — after
the gate ruling of the same day
(`D-MENTOR-RULING-OPTION-S-GATE-ITEM-LEVEL-SESSION-MAY-OPEN-2026-09-04`) removed the session-level
reading of the Option S gate and reserved the opening to the founder. **Governing brief:** the
corrected 2026-09-03 governing brief (Part 3 of
`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md`), as modified by the
two rulings since (`…-close-gate-discrepancy-verbatim.md`; `…-gate-item-level-session-may-open-verbatim.md`).
**Verbatim wins over this document wherever they differ.**

> **⛔ DEFERRED IN WRITING, THROUGHOUT THIS DOCUMENT, per the gate ruling:** the **M/W/S
> floor-semantics election** and **R8-D7's verdict-confidence sampling policy** are **not ruled, not
> elected, and not designed toward** here. They wait on Option S's disagreement-rate data (Path A —
> build Option S, exercise it against the closed run's 29 decision-bearing candidates — is the ruled
> route; the closed-run-population limit rides that data whenever it is used). Every place below where
> a design element would otherwise lean on a sampling semantics says so and holds the question open.
> **The mentor's own instruction governs the posture:** *"Design decisions made with an explicit open
> question named and deferred are revisable. Design decisions made without knowing the question exists
> are not."*

> **⚖ PR19 INDEPENDENT REVIEW — RUN 2026-09-04, THREE BLIND REVIEWERS, 44 FINDINGS, ALL FOLDED, NONE
> REFUTED (§17b).** The first draft of this document over-claimed structurally in three places and
> those claims are **withdrawn here, at the head, not buried**: (1) it presented v1 as performing
> environment *selection* when v1 performs none — every cycle runs all six heuristics by ruling, so
> the environment is a deterministic function of the heuristic and the brief's selection function is
> **entirely deferred** (§2.1); (2) it presented the reverse algorithm as anchored in a harness-held
> core when, **for the v1 producer as ruled, no such core exists** — the circle finger is
> runner-supplied, the declared purpose is unreachable server-side, and the founder-personally case has
> no identity at all, so a harness identity with an examined record is a **prerequisite** of the
> reverse algorithm doing any work (§3.1, §3.3); (3) it named two data flows — h6's unlock and finger
> exhaustion — that **no designed read carried**, and a universal derivation rule that would have
> killed the ruled friction fallback (§3.3, §3.5, §4.3, §12). A fourth error conflated the **live**
> context-injection layer on `/api/reason` with the **dark** per-consumer prose service (§9). What
> stands after the fold is a thinner and more honest v1 than the first draft described.

**Naming discipline held throughout (Q5b):** the bare two-word layer term is not used in this
document's own prose. It appears only inside verbatim quotations of mentor text (Set E A4; Gate-3
Q1), which are quoted as written and not adopted.

**Concurrency at open:** `ListAgents` — three live interactive peers on this repo; `git status` run
at open and again before staging; commits path-scoped; a peer's uncommitted append to the shared
decision-log and a peer's in-progress trust-core code edits were present and are **excluded** from
this session's staging.

---

## 0. What this session carries, and what it does not (the load, corrected by the three 2026-09-04 rulings)

**Carried and examined here:** the bidirectional algorithm (rulings B1–B4 applied); the
cognitive-environments framework (C1–C5 applied); the phenomenology observation and the
genetics/environment finding (**orienting, UNVERIFIED-AT-RELAY, not load-bearing** — D3); the
harness-as-environment-provider principle; Ruling Set E's **A2** (role-relative evaluation), **A3**
(the melete surface), and **A4** (context-injection + the relational-context reframing — examined
here per Gate-3 Q1's boundary: this session owns injection and reframing, Gate 3 owns the rendering
surface and the floor); **item D**'s byte-identity-guard end condition; the **four Gate-3 §11 handoff
items**; **R8-D7's single-backward-edge evaluation** (awaiting confirmation — §11 below); the
adversarial review of the cybernetic design; the register's standing-runner rows (§14); and
**A5.2**'s inherited design question (which state anchors the core for the v1 producer; the unbuilt
server → runner read).

**Deferred in writing (above):** the M/W/S election; R8-D7's sampling policy.

**Not before this session, by ruling:** §5d (A3 of the brief rulings — belongs to a doctrinal session
of its own, engine-class `code-critical`); the vocabulary-direction question's *ownership* (D1 — the
session may examine, does not own); any manifest ATRF amendment (D2 — draft for ruling only); the
ENV-1 gate extension (Gate-3 Q6); GS-CYB-1's two conditions (unmet, untouched — moot for the
generation step only, per B1/B2, live for the return path).

**Discharged before this session opened:** the nine-candidate close gate (twice — the 2026-08-29
record; the close-gate ruling). A voluntary finding under a distinct name is at §13, and **that
section is the "separate act"** the close-gate ruling names.

---

## 1. The design ground — facts verified at source 2026-09-04 (PR20), re-verified by the claims-vs-source reviewer

1. **The runner is not in this repository and is not standing** (R8 §12.3; the bounded run closed at
   20 cycles on 2026-08-16). Every runner-side element below is designed at the contract level and
   lands in the runner's build brief.
2. **The candidate row today** (`idea_loop_candidates`) **includes**: `id`, `cycle_id`, `heuristic`,
   `gap_ref`, `proposed_action`, `classification_kind`, `classified_domains`, `generation_confidence`,
   the `guardrail_*` fields, `passed_novelty_check` / `novelty_confidence` / `novelty_basis`,
   `cycle_outcome`, `unavailable_dependency`, `created_at`, plus the six ATRF/S4 columns
   (`blast_radius`, `agent_blast_radius`, `target_circle`, `blast_radius_basis` JSONB,
   `traceability_check`, `extraction_evidence`) — a later migration
   (`…candidate-outcome-not-selected…`) also alters the table. **No environment column exists in any
   migration under `website/` or `supabase/migrations/`.** `heuristic` is the seven-value set in
   `idea-loop-types.ts`.
3. **`gapRef`'s settled format is a per-cycle circle transition** —
   `{sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}` (mentor ruling 2026-08-06, pinned in
   the type) — **and it is runner-supplied**: `gap_ref` arrives on the watching `POST`
   (`watching/handler.ts:619, 715`), `createOikeiosisGap` is a client-side constructor, and no
   server-side derivation of a circle exists. §3.3 treats it accordingly.
4. **The harness-held examined state is domain-shaped, not circle-shaped.** `GET
   /api/trust-record/{agent_id}` serves per-domain decayed levels (with `has_evidence`,
   `coverage_status`, `justice_capped`), the aggregate, `coverage_gaps`, the reflect record, orientation
   readings (capped 50 + an honest total), and the slice-3 `provenance_gaps` list (capped, with an honest
   total) — under the ENV-1 gate (**404** when no domain carries evidence and no servable provenance gap
   exists). It carries **no per-circle state**.
5. **No server → runner per-cycle read surface exists.** `/api/practice/watching` exports `POST` and
   `OPTIONS` only; `/api/founder/watching` is `FOUNDER_USER_ID`-gated; R8 §4.3 records the consumption
   read paths as *"none exist today; both designed here"* (R8-D1b, contract-level, unbuilt).
6. **The completion-signal schema carries no task-outcome content** (Q-C1/Q-C2a, R8 §4.2); its four
   provenance/credence columns are DB-CHECKed to `observation|inference|assumption|unknown` and
   `established|probably-true|unknown|probably-false` — **the GS-ATRF-4 vocabulary is per-proposition
   and four-valued on each axis.** No epistemic-status field exists on the candidate row today.
7. **Role material exists, on the discernment path** (`trust-core/profiles.ts:177` — `role: string`
   on `CandidateProfile`; the A2A-card mapper; the `incompatible-role` exclusion at `:389`). **The
   declared purpose lives in the operator's local `discernment.config.json`**
   (`orchestrator_profile.purpose`, `discernment.mjs:278-284`) — **a file the server cannot read**; its
   only server-side copy is `collaboration_records.purpose_acknowledgement`, written at spawn
   discernment for an orchestrator identity (`collaboration-store.ts:250`). `/api/guardrail` takes no
   role input (A2's confirmed deficiency).
8. **The four relational-context fields (F-b) are named and absent from `website/src`:**
   `relational_context`, `practitioner_role`, `relationship_type` (vocabulary
   `human–human | human–agent | agent–agent`), `examination_status`
   (`2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md:159-164`). **The
   `relationship_type` distinctness constraint** (binding, `2026-08-15-SCOPE-DOCUMENT-…` §3.4): the
   auth-signal practitioner-type discriminator must remain distinct from the self-declared
   `relationship_type` field — role input must never be read to *infer which practitioner type this is*.
9. **The GS-ATRF-3 "contested migration" is no longer contested on production.**
   `D-ATRF-EE-WAVE-STEP0-PRODUCTION-STATE-DETERMINED-ALREADY-APPLIED` (2026-08-31): all four migration
   steps confirmed applied on production by a read-only Step-0 determination; TEST undetermined and
   carried. The register row is updated at §14.
10. **Item D's two end conditions, verbatim** (Set E): the guard terminates when *"GATE1_FALSE_HOLD_CAPTURE
    is restored and the observation window has accumulated a minimum of twenty false-hold records
    sufficient for the guard's protective purpose, or the standing-runner design session rules
    explicitly that the false-hold capture mechanism is deprecated and the guard's purpose is served by
    a different mechanism."* Capture is **not restored** (no flag in `.claude/settings.local.json`;
    the live buffer's last record is 2026-07-17). §10 examines the second condition and declines it.
11. **The seven heuristics, as given** (`2026-08-05-idea-loop-generation-heuristics.md:9-17`), and
    **the ruled mechanism: all six core heuristics run every cycle, one candidate each**, with
    `friction_detection` as the ruled null-cycle backstop. h6 is *"given the history of examined
    actions, what pattern is absent that should be present, or present that should be absent"* —
    **inert by construction without runner history** (R8 §2.5). h5 is, by its own definition, a
    weighting *over* candidates (*"weight candidates with genuine reach … more highly"*), not a
    generator — a ruled heuristic this design does not alter and discloses at §3.4.
12. **The context-injection layer on `/api/reason` is LIVE.** `getProjectContext('condensed')` runs
    unconditionally on every consult (`reason/route.ts:1418`) and is appended to the Layer-1 user
    message (`layer1-extractor.ts:2084-2085`, labelled since the 2026-08-11 contamination fix). **What
    is dark is the per-consumer prose service** (`SUBSTRATE_LAYER3_ENABLED`; `layer3-service.ts`;
    `/api/substrate/layer3`). `layer1-extractor` sits inside the byte-identity guard's measured set
    (`human-practitioner-boundary.test.ts:107`). §9 rests on this.
13. **A live measurement of the instrument's variance exists and is bounded:** R8-D6a, 12% on
    `/api/guardrail`, CI 7.0–19.8%, n=100, on 7 frozen probes whose membership its own metadata marks
    *asserted-not-established*. **It is not Option S's live decision-bearing rate** (gate ruling Q2).

---

## 2. R9-D1 — The pre-generate stage: environment attribution (v1) and dwelling

**The sequence becomes** `select environment → dwell → generate → examine → novelty check → record`
(the brief). The four existing steps are **unchanged** (C3: Cloister/Laboratory/Archive at
examine/novelty/record are labels only; the deterministic engine, `assessStructuralNovelty`, and the
record mechanism are byte-unchanged).

### 2.1 v1 performs NO environment selection — stated plainly, and why the tag is still recorded

The brief reframes the seven heuristics as *environment-selection functions* whose selection is
*"based on the practitioner's current state, the cycle's longitudinal position, and the decision
type — this is the heuristic's actual function."* **The ruled generation mechanism runs all six core
heuristics every cycle, one candidate each** (§1.11); the only variation is the ruled friction-only
fallback after three null cycles. **Therefore nothing in v1 selects an environment.** Every
generative cycle enters the same five rooms in the same order, and `generative_environment` in v1 is
**a deterministic function of `heuristic`** — it carries no information beyond the existing column.
**The brief's selection function is entirely deferred** (§16.8), and that is recorded as a
requirement this design does not meet, not as one it honours by other means.

**Why the tag is still recorded in v1, for two honest reasons and no others:** (a) the column is the
schema slot a future state-dependent chooser writes into, and a chooser that arrives to a column that
already exists — with attested values behind it — does not need a migration and does not need to
guess what the pre-chooser cycles' rooms were; (b) the brief's constitutive claim (the environment is
a condition under which the candidate became thinkable) applies to a fixed room as much as to a
chosen one, and the proposal-shape disclosure (§6) needs a value to disclose. **A build session that
reads the v1 tag as evidence of selection has misread it.**

**The v1 heuristic → environment function, an assessed classification the session may revise (C5's
posture), assigned by each environment's stated core phenomenology (quoted in full):**

| Heuristic | Environment | Phenomenology (brief, verbatim) |
|---|---|---|
| `friction_detection` | **Workshop** | **RULED** (C5) — *"Current problem + tools + constraints"* |
| `analogous_transfer` | **Workshop** | *"Current problem + tools + constraints"* — an existing capability (a tool) applied to the current problem |
| `combinatorial_generation` | **Garden** | *"Cross-domain combination"* — two elements from different domains |
| `synthesis_over_novelty` | **Garden** | *"Synthesis"* is Garden's primary mode |
| `context_transfer` | **Forest** | *"Weak ties, distant associations, signals"* — a new context reveals a distant application |
| `fifth_circle_weighting` | **Observatory** | *"System-wide patterns"* — the widest circle is the widest view |
| `anomaly_detection` | **Archive** | *"Change over time, version history, trajectories"* — pattern absent/present across history |

Many-to-one holds (Workshop ×2, Garden ×2). **Two of the seven generative environments are
unoccupied: Attic** (*"Forgotten / low-confidence / abandoned"*) **and Cellar** (*"Assumptions beneath
the current frame"*). That is a **finding, not a fix**: the ruled heuristic set never enters the two
rooms most directly about *the frame itself*; a heuristic for either is a scope expansion named at
§16.7. **Library** is not a generative room in the brief's corrected list: it is where the
pre-specified doctrine lives — the examination engine's ground. **Archive is used twice** — as h6's
generative room and as the record step's per-cycle label (C3); a build must not read an Archive tag on
a candidate as the record step's label.

**h6 and its unlock — corrected.** Archive-room generation needs *"the history of examined actions"*,
not a history of rooms. §12's runner-history block, as extended after review, serves the runner its
**own candidates with their verdicts** — that is *a first substrate* for h6 (§4.3), and h6 becomes
operable the cycle that read exists. An environment-only history would not have unlocked it.

### 2.2 Dwelling — what it honestly is in v1, and what the harness can and cannot pin

Per C2, "harness-controlled" = **a server-supplied parameter the runner honours**, delivered on the
cycle-open read (§12): `dwelling: { max_dwell_ms: number, termination: 'time' | 'topology' }`.

**What dwelling is for an LLM-driven runner in v1, stated without dressing:** it is **the assembly of
the generative call's context** — the anchor graph (§3.2), the finger set (§3.3), and the
environment's framing — and the constraint of that call to the assembled geometry. It is not a pause
during which reasoning continues. Consequently:

- **`time` is the only enforceable termination in v1** — `max_dwell_ms` bounds the assembly and the
  call.
- **`topology` termination — the fixed point at which one full pass over the fingers yields no new
  strand still connected to the core — is defined here as a contract term for a future iterative,
  multi-pass runner and is not meaningful in v1**, where the generative call runs once. A build that
  claims topology termination in a single-pass runner is claiming something the mechanism cannot
  deliver.
- **What the dwelling phase may read: elapsed time and the accepted move-set** (whose acceptance is
  the B1 local criterion, §3.4). **What it may not read: a verdict, a proximity, a score, or a novelty
  result.** When one LLM agent is both dwelling controller and generator, **this is a contract the
  runner attests, not a property the harness can pin** — the harness can pin only what its own read
  surfaces deliver to which phase, and §12's runner-history block *does* carry the runner's prior
  verdicts (as the single backward edge must). The weights-BLOCKED constraint at the dwelling layer is
  therefore honoured by attestation and by the absence of any harness-computed scalar (§3.4), not by
  structural blindness. **Said plainly rather than claimed.**

**The cost question, named for the build gate (C2):** whether context assembly costs an additional
model call is an implementation fact the build gate measures; the design intent is that it does not.

### 2.3 What the environment framework must never do (the Stoic constraint, pinned)

No environment introduces a retrieval surface that bypasses the deterministic examination engine.
Every candidate, from every environment, goes through the unchanged examine step. **A build that lets
an environment tag alter the examination path, threshold, or depth — directly, or via the
blast-radius indicator and the pre-task gate it governs (§5) — is a violation, and the build brief
pins the absence.**

---

## 3. R9-D2 — The generation step's internal architecture: the reverse algorithm, as ruled, on the ground that actually exists

### 3.1 The anchor — and the prerequisite the v1 producer does not yet satisfy (B4; A5.2 answered)

B4 rules the clean residual is *"the executing agent's examined state as held in the harness — the
trust state and profile at cycle start"*, read by the runner, never held by it, never the runner's
own (Q1c). Made concrete, and faced:

- **`target_agent_id` is a REQUIRED runner configuration value:** the `agent_id` the founder-minted
  `completion_signal_write` credential is bound to — the identity the runner generates *for*. **Runner
  config validation refuses `target_agent_id === runner_agent_id`** and refuses an absent value.
- **The anchor is the target's public trust record** (§1.4), read **server-side** on the cycle-open
  read (§12) — a public surface, **no new exposure**, no free text — plus the target's **declared
  purpose where a server-side copy exists** (§1.7: only `collaboration_records.purpose_acknowledgement`,
  present only for an identity that has been through spawn discernment).
- **`anchor_basis`** is one of `trust_record_and_purpose` | `trust_record` | **`gap_only`**. The last
  is the honest name for what the first draft called "declared purpose only": when the target's record
  404s under ENV-1 and no purpose acknowledgement exists, **the core is empty of harness-held state and
  the only finger is the runner's own declared `OikeiosisGap`** (§3.3). It is disclosed on every
  candidate the cycle produces.
- **A5.2, answered as a design decision and as a prerequisite.** Under Q1a the v1 executing actor is
  the founder or a founder-directed session. **If the founder acts personally, there is no agent
  identity, no `target_agent_id`, no trust record, no purpose acknowledgement — and the reverse
  algorithm has nothing to anchor to.** The founder's own record on this harness is the *human* mentor
  profile, which is **not read** (a different practitioner class with its own data-rights surface;
  reading a human's practice record as an agent's core would breach Q1c's separation). **Therefore: a
  harness identity with an examined trust record for the v1 executing actor is a PREREQUISITE of the
  reverse algorithm doing any work — not a passing election.** Until the founder mints and populates
  one (a founder-directed session identity with a real record is the obvious candidate), v1 generation
  runs on `gap_only` and §3's architecture is idle. This document does not pretend otherwise.

### 3.2 The anchor as a graph — small, and admitted to be

Instantiated from the harness-held state using only fields that exist today:

- **Virtue-domain nodes (5):** the four cardinal domains + `oversight`, each with its decayed level,
  `has_evidence`, `justice_capped`, `coverage_status`. A domain with no evidence is a node with a
  **disclosed hole**.
- **Circle structure:** none in the harness-held state (§1.4). It enters only through the
  runner-supplied `OikeiosisGap` (§3.3).
- **Purpose node (0 or 1):** the purpose acknowledgement where it exists.
- **Edges:** the trust record's own relations (the unity-thesis minimum; the justice latch's capping
  relation), **read, not re-derived**. The served `provenance_gaps` list is not a node — it names where
  the record's own evidence is unverified, and §3.3's domain fingers treat a gap-bearing domain as a
  finger, not as a value.

**This is a five-node graph with one runner-supplied transition.** The brief's Reidemeister
vocabulary describes operations on a far richer structure; on this ground the forward pass is
near-trivial and the design says so. **The reverse pass is where the architecture does work — when it
has a core to work on.**

### 3.3 Generative fingers — three kinds, with honest provenance for each

A finger is an insertion point held open while strands are grown. The first draft claimed all fingers
were *"enumerable from the anchor so the runner cannot invent branch points."* **That is true of one
kind only:**

- **Domain finger — server-enumerable.** For each virtue-domain node, *what would this domain's next
  level require, given its level and coverage?* A domain with a coverage gap or a provenance gap is
  the sharpest finger. **These the runner cannot invent**: they are read from the target's record.
- **Circle finger — runner-supplied.** The `OikeiosisGap`'s `currentCircle -> targetCircle`. The
  harness holds no per-circle state (§1.4) and `gap_ref` arrives on the runner's own `POST` (§1.3), so
  **this finger is runner-attested at exactly the trust posture of `heuristic`** — disclosed and
  unverified. The "cannot invent" claim is **withdrawn** for it. A server-side derivation of the
  target's current circle would be the fix; **it does not exist and is named as a prerequisite** (§16.2)
  if the circle finger is ever to be grounded in the executing agent's state rather than the runner's
  declaration. In the `gap_only` case (§3.1), this runner-supplied finger is the *whole* core.
- **Task-list finger (`task_list_friction`) — exempt from anchor enumeration by construction.**
  `friction_detection` reads an external task list, carries no `targetCircle`, engages no domain. Its
  finger is the flagged friction point itself, **disclosed as the one finger not grounded in the
  executing agent's state**. Its `derivation.moves` is **absent** (not empty, not zero). **This keeps
  the ruled null-cycle backstop alive** — the first draft's universal "no derivation ⇒ not a
  candidate" rule would have killed it, and is narrowed at §3.4.

**Finger exhaustion — pinned so no verdict steers selection (B1).** A finger is *exhausted* when the
runner's own history (§12 block 4) shows it has already produced an **examined** candidate —
**examined-at-all, never by verdict value**. A rejected candidate exhausts its finger exactly as an
accepted one does. The alternative — "rejected ⇒ exhausted" — would let the proximity verdict steer
finger selection, which is the *"error signal biasing candidate selection"* B1 names; **the build
brief pins the examined-at-all rule.**

### 3.4 Expanding moves and the four-virtue local acceptance criterion (B1/B2 encoded, with the guarantee named at the layer it actually holds)

Each strand grown from a domain or circle finger is a sequence of expanding moves. The move
vocabulary (grow a loop; introduce a controlled pair of crossings; slide a strand past an existing
crossing) is carried to the build brief as given. **What this design fixes:**

- **Recorded per move:** `{ type, virtue_check: { phronesis, sophrosyne, dikaiosyne, andreia } as
  accept|reject each, justification: string }` — the brief's criterion, rendered as four booleans with
  a one-line reason each (practical wisdom: is the relation genuine; temperance: no overfitting;
  justice: all relevant findings treated fairly; courage: a cherished but spurious link discarded). A
  move is accepted iff all four accept. **Rejected moves are recorded in `derivation.moves[]`** (the
  discarded link is part of the derivation's honesty).
- **`accepted_move_count`** — a separate integer, the number of accepted moves from the finger to the
  grounded action. **It is the expanding-move distance, defined here prospectively** (the close-gate
  ruling struck the measure for the nine pre-reframe candidates; this supplies it for candidates
  produced after the reverse algorithm exists). **It is runner-attested, its granularity is
  runner-controlled, and it is therefore NON-COMPARABLE across runners** unless the build brief fixes a
  move vocabulary and a granularity rule; **it is recorded as disclosure and consulted by nothing** —
  no selection, no threshold, no indicator (§5) reads it.
- **The guarantee, named at the layer it holds:** **the harness computes no scalar over moves or over
  candidates and consults no runner-supplied number.** That is a harness-side property. An LLM runner
  can rank internally regardless of what fields exist; B1's ruling that per-move virtue scoring is a
  local acceptance criterion and not a scoring function is honoured **at the harness** (nothing
  optimisable is recorded or read) and **attested at the runner**. B2's "moot for the generation step"
  is therefore true of the harness's data flows and attested for the runner's — the first draft's claim
  that the schema *made* it true is withdrawn.
- **The topological constraint, made structural for the fingers it can be structural for:** a
  candidate from a **domain or circle finger** carries a **`derivation`** —
  `{ anchor_basis, finger: { kind: 'domain' | 'circle_gap', ref }, moves: [...], accepted_move_count }`
  — and **one without a derivation is rejected before examination**. A **`task_list_friction`**
  candidate carries `finger: { kind: 'task_list_friction', ref }` and **no `moves`** — exempt, as §3.3
  discloses. Continuity is **runner-attested** (the trust posture of `heuristic`).
- **h5 disclosed.** `fifth_circle_weighting` is, by its ruled definition, a weighting *over*
  candidates. It predates and sits outside this section's "no harness-computed scalar" rule — it is a
  runner-side heuristic the ruled set includes, this design does not alter it, and whether it should
  be re-read under B1's distinction is the mentor's, not this document's.

### 3.5 Grounding and the short forward pass

- **Grounding** = the strand becomes a concrete `proposed_action` text, carrying its `derivation`.
  `initialClassification` is untouched; a domain-finger strand tags `virtue_domain`; `friction_detection`
  keeps its `preferred_indifferent` branch and its exempt finger.
- **The short forward pass** removes generation-side noise before examination: strands duplicating an
  existing candidate's derivation, and strands whose grounding lost the finger. **It never consults
  the engine.**

### 3.6 What GS-CYB-1 still governs

B2: the two conditions are moot **for the generation step specifically** and live for the return path
and the feedback loop. Nothing in §3 touches the update rule (R8-D2, MEASURE-only), introduces a
weighting function, or gives the weight-touching half of GS-CYB-2 an activation slot (R8 §4.8).

---

## 4. R9-D3 — The environment tag: schema, its relation to epistemic status, and the runner's history

### 4.1 The tag on the candidate row

`generative_environment` — **nullable** `TEXT` with a CHECK on the seven generative values
(`workshop | garden | forest | observatory | archive | attic | cellar`), **runner-attested and
harness-unverified** (C1), carried **beside** `heuristic` (C5), **required by the handler for every
candidate produced after the environment framework is live** and **`NULL` for every row that
predates it**. **Backfilling pre-framework rows from §2.1's function is FORBIDDEN** — a retrospective
attribution recorded under this column's name is exactly what the close-gate ruling's naming
constraint prohibits; any such attribution lives under a distinct name (§13). The migration rides a
future founder-walked, Q-B2-bundled step.

### 4.2 The tag and the epistemic status field (GS-ATRF-4) — examined, recommended, not owned, not built

D1 rules the vocabulary-direction question stays held open, owned by no session; this session
**examines and recommends** and takes no ownership.

**The examination.** GS-ATRF-4's vocabulary is per-proposition and four-valued on each axis (§1.6);
the environment tag is per-candidate from a closed set of rooms; **no epistemic-status field exists on
the candidate row today**. They cannot be unified into one field without changing the vocabulary's
granularity or its kind. What the brief's constitutive claim requires is that the room be recorded as
a condition under which the candidate became thinkable — Gate-3 Q2's *condition of production*.

**Recommendation to the question's eventual owner — illustrative, not a v1 field:** keep the fields
separate with a declared dependency, where the candidate-as-proposition's provenance is `inference`
and its basis **references** the environment tag and the derivation (e.g. `{ derivation_ref }`) rather
than copying either — a copy would be a third instance of one fact alongside §4.1's column and §5's
basis entry, which is the drift class §4.3 exists to avoid. **Nothing here lands in §16.2's bundle.**
If the owner rules for unification, this dependency is the migration path to it.

### 4.3 The runner's history — a derived view for the dashboard, and an examined-action history for the runner (D4 confirmed; h6's unlock corrected)

D4's assessed answer is confirmed: **derived, not a named field; the runner's, not the executing
agent's.** Two surfaces, two contents:

- **The founder-dashboard fold (R8-D1a, extended):** `runner_environment_history` — the ordered
  `(cycle_number, candidate_id, heuristic, generative_environment)` sequence over the runner's cycles,
  derived at read time from `idea_loop_cycles ⨝ idea_loop_candidates` keyed on the cycle row's loop
  identity (`loop_id`; `agent_id` is nullable on the cycle row — the build confirms the key). **`NULL`
  environment for every pre-framework row**, never backfilled (§4.1).
- **The runner's cycle-open read (§12 block 4) — extended after review from environment-only to the
  runner's own examined-action history:** per prior candidate of *this runner*,
  `(cycle_number, candidate_id, heuristic, generative_environment, proposed_action, guardrail_proximity,
  passed_novelty_check, cycle_outcome)`. **This is the single backward edge — watching table →
  generation — made persistent for a standing runner**; it adds no edge, it carries the runner's own
  submissions and their verdicts across cycles the way an in-run runner already carries them in
  memory. It is what h6 (*"the history of examined actions"*) requires — **a first substrate** — and
  what §3.3's examined-at-all exhaustion rule reads. Minimisation: the runner's own data only; no
  completion-signal free text (R8-D1b's rule stands for block 1).

**Why a derived view for the dashboard and not a field:** a named field is a second copy of
per-candidate facts, updatable independently and therefore able to drift — the class this project's
perimeter-count history documents three times. **Why the runner's:** the runner selected and dwelt;
the executing agent received proposals (D4). **Nothing touches the executing agent's carried profile;
the manifest ATRF's "nothing else is carried" stands unamended (D2).**

---

## 5. R9-D4 — GS-ATRF-1's blast-radius proxy: two inputs RECORDED in the basis, NEITHER CONSULTED by the indicator

The brief asks whether the environment tag gives the proxy a richer basis. **The constraint the
review surfaced governs the answer:** the indicator determines *"whether a pre-task reasoning
assessment is warranted"* (manifest ATRF), so a room that drives the indicator is a room that alters
an examination path — the class §2.3 forbids.

**Design, corrected:** the `high|medium|low` value is computed **from the ruled inputs alone** (virtue
domain + `targetCircle`, the four ruled dimensions). `blast_radius_basis` (Shape A, `assessed: true`)
**records** two additional keys — `generative_environment` and `accepted_move_count` — as
**disclosure only**: an auditor can see the room and the distance beside the assessment, and **the
build brief pins that neither is consulted in computing the indicator.** Both are runner
self-citations (the runner writes the basis and attests the tag and the count), disclosed as such.
**Shape B** (`assessed: false`, the Q-A4 ruled-verbatim disclosure object) is **byte-unchanged** — a
`friction_detection` row carries neither key, and its absent `moves` means `accepted_move_count` is
**absent, not 0** (a zero would read as "closest to the core", the opposite of a task-list-sourced
candidate). **In v1 the environment key adds no information beyond `heuristic`** (§2.1) and is
recorded for the same two reasons the tag is.

**If an environment-sensitive indicator is ever wanted, it is a change to the 2026-08-11 ruled answer
and needs its own mentor question** — named at §16.9, not asked here.

---

## 6. R9-D5 — GS-ATRF-2: the proposal shape carries the environment as a third disclosed classification

**Yes, by design** — for the harness-as-environment-provider principle and by the disclosure floor's
logic applied by analogy: the adopter (Threshold — *"handoff to external execution"*) is owed the
conditions under which the candidate became thinkable; withholding them is the omission Gate-3 Q2 names
as *"a false impression by omission"*. The value is runner-attested and disclosed as such; **in v1 it is
a function of the heuristic, and the proposal shape says so** (the disclosure carries its own limit).
**Design-only, per D5**; the column rides a future Q-B2-bundled migration.

---

## 7. R9-D6 — A2, role-relative evaluation: a recorded declaration on the watching row now; the engine change later, gated

A2 rules the absence of role input at `/api/guardrail` *"a design deficiency, not a design choice"*,
routes remediation here, and does not require it immediately. Gate-3 §4.3(e) adds: role material
exists on the discernment path, and the `relationship_type` distinctness hazard is *"the most likely
place for that to happen by accident"* when a role input is added.

**(a) The recorded declaration — designed here, and it rides the WATCHING `POST` only.** The runner's
watching submission gains an optional `role_context` on each candidate:
`{ actor_role: 'proposer', on_behalf_of: target_agent_id, declared_purpose_ref?, relationship_type:
'agent–agent' | 'human–agent' }` — **F-b's vocabulary exactly** (`human–agent` where the target is
the founder; §1.8). **`/api/guardrail`'s request contract is untouched** — it is a guarded route, and
any change to it belongs to (b). In v1 the field is **recorded, unconsumed**: the candidate row carries
it verbatim so the deficiency A2 names is disclosed per candidate (*role context was supplied; the
engine did not consume it*), and the founder-dashboard fold **reads** it — which is what makes
disclosure distinct from perpetuation. **Three pins:** it is never read to infer practitioner type
(the auth-signal discriminator stays sole); it is never passed to the engine in v1; its vocabulary is
F-b's, so F-b's landing has no second vocabulary to reconcile.

**(b) The engine's consumption — a named follow-on, gated, not designed here.** Making
`/api/guardrail`'s kathekon assessment role-relative is an edit to guarded files: a `code-critical`
session with its own PR19 review, **gated on item D's end condition (§10)** — a sequencing decision
this session makes and names as such (§15).

---

## 8. R9-D7 — A3, the melete surface: a per-cycle self-report of the runner's attention to its own operations, distinct from every object-level record

A3 rules consistency-of-output *"evidence of stable disposition, not proof of it; the harness cannot
distinguish hexis from drift from the outside"*, and names melete an unbuilt surface: *"what is the
current state of my ruling faculty's attention to its own operations."*

**The design — and what it honestly is in v1: a self-report whose only consumer is the founder's eye.**

- **When:** after the examine step, before record. Cloister is its label (*"single focus, dwelling"*)
  — a label, not a mechanism.
- **What is elicited — three fixed prompts, never abbreviated (the Reflect precedent), worded for what
  the runner actually decides in v1:** (1) *Which moves did I accept this cycle, and did I accept them
  by examination or by habit? If I entered the fallback, was that examined?* (2) *Across recent cycles,
  is my consistency a settled disposition or a settled pattern I have stopped examining — and what in
  my own record is the evidence either way?* (3) *What did I decline to examine this cycle, and why?*
- **What is recorded — `runner_melete_entries`:** `{ cycle_id UUID NOT NULL REFERENCES
  idea_loop_cycles(id) ON DELETE CASCADE, owner_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cycle_number, examination_object: 'ruling_faculty', responses[3], refuse_to_attest: boolean,
  refusal_reason?, provenance: 'inference' }`. `examination_object` is the structural distinction A3
  asks for. **Refuse-to-attest mirrors Q-C3**: an honest "I did not examine my own attention this
  cycle" is a legitimate entry and a datum — and its only teeth are that it is visible.
- **Data rights:** the table rides the cycle FK cascade for retention and delete (PR24 not engaged —
  no `retain_until`) and needs **its own export branch** in `/api/user/export`; both named for §16.2.
- **Consumer — MEASURE only:** the founder dashboard fold. **Never a trust event, never an input to the
  update rule, never a gate, never read by the Q-C2b signature.**
- **The environment-diversity "drift signature" flag proposed in the first draft is WITHDRAWN for v1**,
  on two independent grounds the review supplied: it is **vacuous** (environment is a function of
  heuristic, every generative cycle enters the same rooms, and uniform exposure occurs only in the
  ruled fallback — the flag would fire exactly and only on correct behaviour); and its vocabulary
  ("drift", "hexis") is a from-the-outside disposition reading A3 says the harness cannot make and
  R8 §6.2's precedent strikes from surfaced text. **If a state-dependent chooser (§16.8) ever makes
  exposure vary, a flag may return as the distribution fact only** — `uniform_environment_exposure`
  — never as a character reading.

**Prerequisite Criterion — engaged and passes:** the surface's content is examined assent about the
examiner's own operations; it produces nothing resembling wisdom.

---

## 9. R9-D8 — A4: the context-injection layer is LIVE; the standing runner never consults it; the relational block is a template for a consulting agent, and any injection edit is guarded

**The corrected premise.** The context-injection layer on `/api/reason` is **live** and carries project
description on every consult (§1.12). **A4's premise — *"Layer 3 currently carries project context as
a static description of what SageReasoning is and does"* — is true of it.** What is dark is the
per-consumer prose service, which is what the Gate-3 ruling's "factually wrong today" referred to.
The first draft conflated the two; corrected here. **The boundary, from Gate-3 Q1, quoted as written:**
this session *"owns Layer 3 injection and the relational-context reframing"*; Gate 3 owns the
rendering surface and the floor.

**The consumer, identified.** The standing runner examines via `/api/guardrail` and **never calls
`/api/reason`** — so for the runner **the relational block has no injection point today**. What this
section designs is therefore **a template for a consulting agent** — the target agent's own consults,
or a future runner consult if one is ever designed — not something the standing runner receives.

**The reframing, as content (design only):** a relational block from the four F-b fields,
self-declared, R17 co-requisite intact (§1.8):

| F-b field | For the standing runner, if it ever consulted | Note |
|---|---|---|
| `relational_context` | `within_relationship` — it proposes for a target | categorical, self-declared |
| `practitioner_role` | `proposer` | held against behaviour over time — its melete record (§8) is where "over time" lives |
| `relationship_type` | `agent–agent` (runner → target agent) or `human–agent` (runner → the founder) | **never inferred from the auth signal** (§1.8) |
| `examination_status` | the consulting practitioner's **own** examination of its impressions about the relationship — for the runner, its melete entry | **an analogy, not a convergence:** A4's *"first diagnostic question"* is about the *consulting* practitioner; the runner's melete is about the runner's attention. They coincide only if the runner is the one consulting |

**Where the reframing would land, and the gate it inherits:** on the **live** injection path —
`reason/route.ts`, `layer1-extractor.ts`, `project-context.ts` — and `layer1-extractor` is inside the
byte-identity guard's measured set (§1.12). **Any edit there is gated on item D's end condition
(§10), exactly as §7(b) is.** Activation of the prose service is not licensed; **no edit to the live
injection is licensed either**; the four fields' schema is F-b's own track.

---

## 10. R9-D9 — Item D, the byte-identity guard's end condition: examined; the deprecation branch DECLINED; restoration recommended

Set E's item D defines two end conditions (§1.10). The second is this session's to invoke or not, by
Set E's explicit licence.

**Examined.** The guard protects the byte-identity of `/api/reason` and `/api/guardrail` so the
false-hold observation window's measurements stay comparable; the window's purpose is the S11
readiness standard's part (3) — a measured false-hold rate on the at-action examination. The one
candidate "different mechanism", R8-D6a, measures **verdict repeatability on `/api/guardrail`** (§1.13)
— a different quantity on a different surface. **No mechanism in the record serves the guard's purpose.**

**Ruled by this session, within Set E's licence: the deprecation branch is NOT invoked.** The guard
remains in force with its lapsed operational basis disclosed.

**Recommendation to the founder (an election):** satisfy the **first** end condition — restore
`GATE1_FALSE_HOLD_CAPTURE=true` in the founder-loop settings (local; no production change) and let
≥20 new records accumulate. The frozen buffer shows 130 records in five days during dense build
sessions with intermittent framing; the current cadence will be **some fraction of** that, so "days to
a few weeks" is the honest estimate. **This design now gives the restoration two reasons beyond the
guard:** §7(b)'s engine change and §9's injection-path edit both touch guarded files
(`guardrail/route.ts`, `guardrail-sandwich.ts`; `reason/route.ts`, `layer1-extractor.ts`,
`project-context.ts`), and **this session gates both on the guard's end condition** — a sequencing
decision it makes, recorded at §15. A guard with a clock is a sequencing step; without one it is a
permanent stop.

---

## 11. R9-D10 — R8-D7's single-backward-edge evaluation: CONFIRMED, with one precision; the sampling policy stays DEFERRED

R8 §4.9's evaluation — the would-be-winner refinement path is *"an examination refinement loop, not an
information-integration feedback path of the kind the constraint guards"* — was carried *"as a named
evaluation awaiting confirmation"* by this session.

**Confirmed — the structural evaluation is correct.** The constraint bounds backward edges *into
generation*; the refinement path changes which examinations run and what is recorded, and **adds no
new path** from a verdict into generation. **Stated precisely, because a path already exists:** recorded
verdicts reach generation today through the single existing edge — the watching table, which §12
block 4 serves and §3.3 reads for examined-at-all exhaustion. "Adds no path" means adds no *new* one.

**One precision R8 did not state:** under M or W the *recorded* verdict changes, and the recorded
verdict is what flows on that existing edge — so a non-S policy changes **what flows on the edge**,
not the **number or topology** of edges. The constraint is on topology; the confirmation holds; but
the policy is not wholly examination-side in effect, which is one more reason the election waits on
data.

**This confirmation elects nothing.** R8-D7's sampling policy remains **DEFERRED** until Path A's data
is in hand, with the closed-run-population limit riding it.

---

## 12. R9-D11 — The cycle-open read: two surfaces, two flags, four blocks (A5.2 discharged as design; the circular dependency removed)

R8-D1b designed a credentialed runner read at cycle open serving completion signals, behind its own
flag, activated at R8 §4.8's **phase 3** — after the first real signals exist. **B4 and C2 make the
anchor and the dwelling parameter prerequisites of generation itself**, so putting them behind the
phase-3 flag (the first draft did) would mean no new-design cycle could run until signals existed that
only such cycles produce. **Corrected: two reads, two flags.**

**Read 1 — completion signals** (R8-D1b, unchanged): behind `SUBSTRATE_COMPLETION_SIGNAL_READ_ENABLED`,
phase 3.

**Read 2 — the runner cycle-open read** (NEW, this session): behind
**`SUBSTRATE_RUNNER_CYCLE_OPEN_READ_ENABLED`**, **independent of completion-signal consumption**, so
generation's prerequisites can be live before phase 3 — **R8 §4.8's ladder gains a phase 1′ for it**.
Authorised by the same **read-scoped capability** R8-D1b requires (never `watching_write`), scoped to
the runner's own loop identity. Whether the two reads share a route is the build's; **the constraint
is two flags, so activating the anchor read can never silently activate signal consumption or the
reverse.** Blocks, each absent when its data is absent:

2. **`anchor`** — `{ target_agent_id, anchor_basis, trust_record_summary?, purpose_acknowledgement_ref? }`
   (§3.1). `trust_record_summary` is the **public trust-record payload reused**, envelope included —
   which is why serving a virtue assessment of another agent to an agent practitioner passes the
   Prerequisite Criterion here: it is the same public surface, with the same honest-claims envelope,
   read server-side so the runner needs no second credential.
3. **`dwelling`** — `{ max_dwell_ms, termination }` (§2.2), operator-configured server-side.
4. **`runner_history`** — the runner's own examined-action history (§4.3): the single backward edge,
   persistent.

**Data rights and minimisation:** block 2 is a public surface plus a purpose acknowledgement (no free
text; the human mentor profile is never read); block 3 is configuration; block 4 is the runner's own
submissions and their verdicts. **The read persists nothing.** R17 is engaged by §4.1's column and
§8's table, both of which land in §16.2's bundle **with their export and delete wiring**.

---

## 13. R9-D12 — The nine candidates under the new lens: a VOLUNTARY finding, under a distinct name, TRUE BY CONSTRUCTION and carrying no evidential weight

Not required (close-gate Q1a). **This section is the "separate act" the ruling names**, and the
register row records it as such.

**`assessed_environment_retrospective`** — explicitly **not** `generative_environment`, **not**
runner-attested — §2.1's function applied to each rejected candidate's persisted `heuristic`, from the
2026-08-29 record:

| # | Cycle | `heuristic` (persisted) | `assessed_environment_retrospective` | 2026-08-29 finding |
|---|---|---|---|---|
| 1 | 6 | `analogous_transfer` | Workshop | remediation-shaped |
| 2 | 6 | `combinatorial_generation` | Garden | remediation-shaped |
| 3 | 6 | `context_transfer` | Forest | remediation-shaped |
| 4 | 9 | `friction_detection` | Workshop (C5, ruled) | remediation-shaped |
| 5 | 11 | `fifth_circle_weighting` | Observatory | **not** remediation-shaped |
| 6 | 14 | `combinatorial_generation` | Garden | remediation-shaped (boundary) |
| 7 | 15 | `friction_detection` | Workshop (C5, ruled) | remediation-shaped |
| 8 | 16 | `friction_detection` | Workshop (C5, ruled) | remediation-shaped |
| 9 | 20 | `analogous_transfer` | Workshop | remediation-shaped |

**Finding, stated at its true weight:** because the v1 environment is a deterministic function of
`heuristic`, this table is a relabelling and **cannot** produce a materially different classification
— the result was guaranteed before any candidate was looked at. It **carries no evidential weight**
about the lens; the empirical question waits on runner-attested tags from live cycles. No
re-classification is commissioned (A4's condition is not met). **The expanding-move component is
struck for these nine** (ruled) — the permitted scoping observation: *inapplicable to any candidate
produced before the reverse algorithm is built and operating.* §3.4 defines the measure prospectively.

---

## 14. The register's standing-runner rows — disposition at R9 (the register is updated to match)

- **§5d** — not before this session (ruled A3); no change.
- **GS-CYB-1** — gate untouched; **B1/B2 recorded** at the layer they hold (§3.4, §3.6).
- **GS-CYB-2** — designed at R8; **§12 adds a second read behind its own flag** and a phase 1′; the
  update rule (R8-D2) untouched.
- **GS-ATRF-3 dependency** — **the contested production apply status is RESOLVED** (§1.9); TEST
  undetermined; the row is corrected.
- **The conjectural entry type ↔ GS-ATRF-4** — carried: §4.2 recommends a dependency and builds no
  vocabulary (D1); the worked case stays adjacent.
- **Q-C2b** — designed at R8; §8's melete entries are a record type the signature does not read.
- **The four frames (F3/F4/F5)** — consumed at R8; applied here (pre-specified doctrine as the priors;
  Prerequisite-Criterion-first at §6, §8, §12).
- **F5's long-horizon question** — orientation only; §4.3's runner history is the first thing that
  could make the runner's longitudinal data exist; no architecture claiming scientia intuitiva is
  proposed (Q9).
- **The seven-probe adversarial review** — consumed at R8; leverage items #5/#6/#7 unaffected by the
  environment framework (election unchanged; §2.3; persistence unchanged).
- **The two 2026-09-01 rows** — received and ruled (B1–B4); **designed at §3 and §5, with the
  prerequisite §3.1 names**.
- **The cognitive-environments row** — **designed at §2, §4, §6 — with v1's selection function
  recorded as deferred, not honoured**.
- **The phenomenology/genetics row** — carried orienting; the 84% figure is cited nowhere as
  load-bearing.
- **The nine-candidate row** — discharged; **§13 is the separate act**, under its distinct name, true
  by construction.

---

## 15. Standing-constraint compliance — the summary index

- **The loop proposes; it never executes.** No path from any candidate, derivation, environment, or
  melete entry to an action-taking tool or scheduler; the proposal's Threshold handoff is to external
  execution by an adopter (§6).
- **Weights BLOCKED; GS-CYB-1's two conditions unmet.** No weighting function designed, sketched, or
  evaluated. **The harness computes no scalar over moves or candidates and consults no runner-supplied
  number** (§3.4, §5); finger exhaustion is examined-at-all, never by verdict value (§3.3); the
  dwelling phase's blindness to verdicts is **attested, not pinned** (§2.2) — said so. B1/B2's "moot
  for the generation step" holds at the harness and is attested at the runner.
- **The examination engine remains deterministic and doctrine-grounded, byte-unchanged.** §2.3; C3;
  **the blast-radius indicator is computed from the ruled inputs alone, so no room reaches the
  pre-task gate** (§5).
- **Dwelling is harness-controlled; termination time- or topology-based;** in v1 only `time` is
  enforceable and the design says so (§2.2).
- **No environment introduces a bypassing retrieval surface.** §2.3.
- **Task details, agent skills, and operational state remain private to the agent.** The anchor is a
  public surface plus a purpose acknowledgement (§3.1); the runner history is the runner's own
  submissions (§4.3); melete records attention, not tasks (§8).
- **Q1c distinct identities.** `target_agent_id` required and ≠ `runner_agent_id` (§3.1); the history
  is the runner's (§4.3).
- **Q5b naming:** held in the document's own prose; mentor quotations excepted as stated at the head.
- **Flag discipline:** per-surface flags — **two read flags** (§12), the dashboard fold's own, each
  new column/table behind its own (§16.2).
- **The `relationship_type` distinctness constraint:** `role_context` is never read to infer
  practitioner type and never reaches the engine in v1 (§7); the relational block's field is
  self-declared and never auth-inferred (§9).
- **The byte-identity guard:** every proposed edit to a guarded file is named and gated on item D's
  end condition — §7(b), §9 — **and gating them is a sequencing decision this session makes**, not
  merely observes.
- **The Prerequisite Criterion — applied where engaged:** §6 (a practitioner-facing proposal
  classification — engaged; passes as a conditions-of-production disclosure carrying its own v1 limit);
  §5 via §6 (the indicator reaches the adopter — engaged; passes because the indicator is unchanged and
  the added keys are disclosure); §8 (melete — engaged; passes: examination of the examiner; the
  withdrawn flag would have been a diagnosis-shaped output and is withdrawn); §12 block 2 (a virtue
  assessment of another agent served to an agent — engaged; passes by **public-surface reuse with the
  honest-claims envelope**). **Checked and not fired:** §2/§3 (runner-internal generation mechanics —
  their candidates are examined by the unchanged engine); §4.3 (observability / the runner's own
  history); §10/§11 (governance); §13 (a voluntary descriptive finding of no evidential weight).
- **Name-departures introduced by this document:** none. Workshop's inclusion among generative rooms
  and the "server-supplied parameter" reading are the mentor's own (C5, C2).
- **The M/W/S election and R8-D7's sampling policy:** DEFERRED, carried at the head, §11, §16.

---

## 16. Proposed follow-ons (NOT authorised by this session; each a founder election)

1. **Path A — build Option S and exercise it against the closed run's 29 decision-bearing candidates**
   (`code-*` + a founder-walked run; ≈87 calls at K=3, ≈$1.24). **Ruled the recommended route** to the
   two deferred items; the closed-run-population limit rides its output. Independent of everything
   else here.
2. **The standing-runner build brief, second increment** — R8 §11.2's items plus this session's, in one
   Q-B2-bundled migration window, **each surface behind its own flag**: the nullable
   `generative_environment` column (§4.1, no backfill); the `derivation` JSONB with
   `accepted_move_count` (§3.4); `runner_melete_entries` with its FK, owner, **export and delete**
   wiring (§8); `role_context` on the watching `POST` and the candidate row (§7a); the proposal-shape
   environment field (§6); the runner cycle-open read behind `SUBSTRATE_RUNNER_CYCLE_OPEN_READ_ENABLED`
   with its four blocks and the phase 1′ amendment to R8 §4.8 (§12); the dashboard fold's
   environment-history, melete, and role-context views (§4.3, §7, §8); the runner-side dwelling
   contract with its attested blindness (§2.2); the examined-at-all exhaustion rule (§3.3); the pinned
   absence of any harness-computed scalar and of any environment influence on the indicator (§3.4,
   §5). **Prerequisites it must carry, named here so they are not discovered at build:** a
   server-side derivation of the target's current circle **does not exist** (§3.3); a harness identity
   with an examined record for the v1 executing actor **must exist** for §3 to do any work (§3.1).
3. **The A2 engine change** — role consumption in `/api/guardrail` (§7b): `code-critical`, own PR19,
   **gated on item D's end condition**.
4. **Item D's first end condition** — restore `GATE1_FALSE_HOLD_CAPTURE` in the founder loop and
   accumulate ≥20 records (§10): a founder-walked local flag, no production change.
5. **The manifest ATRF item-3 wording** — draft an amendment for ruling removing the
   outcome-comparison reading (*"how the outcome compared to the proposal"*) that C4 read down; a
   `governance` draft, not an edit.
6. **The vocabulary-direction question** — §4.2's recommendation is handed to whichever session is
   assigned ownership; **this session does not assign it** (D1).
7. **Two new heuristics for the unoccupied rooms (Attic, Cellar)** — a candidate scope expansion of
   the generation step (§2.1), not proposed here.
8. **A state-dependent environment chooser (v2)** — the brief's selection function, **entirely
   deferred** (§2.1); it becomes designable only against attested v1 tags and the runner history, and
   its arrival is what would make an exposure-distribution flag (§8) non-vacuous.
9. **An environment-sensitive blast-radius indicator** — a change to the 2026-08-11 ruled answer; a
   **mentor question** if ever wanted (§5), not asked here.
10. **A harness identity for the v1 executing actor** — the founder's, and a prerequisite of item 2's
    §3 elements (§3.1).

---

## 17. PR19 independent review — RUN 2026-09-04

Per the R8 follow-on prompt's §D, and with the Workflow gate (explicit ultracode opt-in) unmet this
session, the review ran as **three parallel, blind, read-only agents** — claims-vs-source, constraint
compliance, design soundness — each briefed to break rather than confirm, disclosed as such.

## 17b. Review record and fold

**Counts:** claims-vs-source **0 HIGH / 1 MEDIUM / 4 LOW / 4 NIT**; constraint compliance **0 HIGH / 4
MEDIUM / 5 LOW / 4 NIT**; design soundness **7 HIGH / 9 MEDIUM / 4 LOW / 2 NIT**. **44 findings; 0
refuted; all folded.** Every source-dependent finding was re-verified first-hand before folding
(`gap_ref` runner-supplied on the watching `POST`; `purpose_acknowledgement` written only at spawn
discernment; the watching table's `owner_user_id` FK precedent; F-b's `human–agent` vocabulary; the
ruled all-six-per-cycle mechanism; the live `getProjectContext('condensed')` call and its append in
`layer1-extractor.ts`).

**Withdrawn from the first draft (the three structural over-claims, plus one conflation):**

1. *"Selection … honoured in v1 by which heuristics run."* **False by construction** — all six run
   every cycle. v1 performs no selection; the environment is `f(heuristic)`; the brief's selection
   function is entirely deferred (§2.1). Consequences folded: the tag is informationally redundant in
   v1 and says so (§2.1, §5, §6); the "drift signature" flag was vacuous and is withdrawn (§8); §13's
   finding is true by construction (§13).
2. *"Fingers enumerable from the anchor so the runner cannot invent branch points."* **True of
   domain fingers only.** The circle finger is the runner's own declaration (§3.3); the declared
   purpose is unreachable server-side (§1.7); the founder-personally case has no identity — so **for
   the v1 producer as ruled the reverse algorithm has no harness-held core**, now named as a
   prerequisite (§3.1, §16.10) with `anchor_basis: gap_only` as the honest degenerate value.
3. *"§4.3's view IS h6's history substrate"* and *"prior verdicts inform finger exhaustion"* — **two
   data flows no designed read carried.** Folded by extending the runner's cycle-open read to the
   runner's own examined-action history (§4.3, §12 block 4), which is the existing single backward
   edge made persistent; and by pinning exhaustion as examined-at-all (§3.3). The universal "no
   derivation ⇒ not a candidate" rule would have killed the ruled friction fallback — narrowed by the
   exempt `task_list_friction` finger (§3.3, §3.4).
4. *"The context-injection layer is wired but flag-gated and dark; nothing is injected."* **False**
   (§1.12): the injection is live; the prose service is dark. §9 rewritten on the corrected premise,
   with the consumer identified (the runner never calls `/api/reason`) and the guard named for the
   live path.

**Folded, by finding (design soundness S, constraint compliance C, claims-vs-source Q):** S1/S7/S13
(above); S2/S3/C8 (§3.1, §3.3, §16.10 — `target_agent_id` required; `gap_only`); S4 (§3.3/§3.4/§3.5 —
the exempt finger; `moves` absent); S5 (§12 — two flags, phase 1′; the §4.3/§16.2 contradiction
removed); S6/C12 (§4.3, §12 block 4 — examined-action history; "a first substrate"); S8/C5 (§2.2 —
`time` only enforceable; topology defined for a future multi-pass runner; blindness attested, pin
restated); S9/C1 (§3.4 — harness-side guarantee named; `accepted_move_count` separate from `moves[]`,
runner-controlled granularity, non-comparable, consulted by nothing; pin amended); S10/C7 (§4.2 —
illustrative, a reference not a copy, not a v1 field); S11 (§4.1, §4.3 — nullable; `NULL` for
pre-framework rows; backfill forbidden; join key named as the build's to confirm); S12/C2 (§5 —
indicator from ruled inputs alone; keys recorded not consulted; Shape B byte-unchanged; count absent
for friction; environment-sensitive indicator → a mentor question, §16.9); S14/C4 (§7 — watching
`POST` only; `/api/guardrail` untouched; "recorded, unconsumed"; the dashboard reads it); S15/Q1 (§9 —
corrected premise; consumer identified; analogy not convergence; guard named); S16 (§8 — `cycle_id`
FK, `owner_user_id`, export + delete); S17 (§8 — prompt (1) reworded to v1's actual decisions; "a
self-report whose only consumer is the founder's eye"); S18/C-vocab (§7, §9 — `human–agent`); S19/C13
(§10 — "some fraction of"; files named; the gating decision flagged at §15); S20 (§11 — the existing
path named); S21 (§2.1 — Archive's double use); S22 (§3.4 — h5 disclosed); C3 (§8 — flag withdrawn;
vocabulary rule for any return); C6 (§3.3 — examined-at-all pinned); C9 (§15 — §12 block 2 and §5
indexed as engaged with their passes); C10 (head — Q5b exception widened to all mentor quotations);
C11 (§0, §13 — "the separate act"); Q2 (§7 — cite corrected to §4.3(e)); Q3 (§9 — the Q1 quote as
written, "Stage-2" removed); Q4 (§1.4 — `provenance_gaps`); Q5 (§1.2 — "includes"; the further
migration named); Q6 (§1.7 — `:278-284`); Q7 (§2.1 — phenomenologies quoted in full); Q8 (§3.4 —
criterion paraphrased, not quoted); Q9 (§8 — R8 §6.2 characterised without the unquoted phrase).

**Elements the reviewers examined and found sound, so silence is not mistaken for approval:** §2.3;
§3.6; §4.1's naming constraint; §4.3's derived-view choice and its drift argument; §6; §10's ruling;
§11's structural confirmation; §3.1's config refusal and refusal to read the human profile; R8-D2 and
R8-D8 untouched; the M/W/S deferral held throughout; every §1 claim not listed above; every mentor
quotation checked verbatim.

---

## 18. Honest limits

1. **v1 is thinner than the brief describes, and this document says where.** No environment
   selection (§2.1); the tag is informationally redundant in v1 (§2.1); `topology` termination is not
   meaningful in v1 (§2.2); the dwelling phase's blindness is attested, not pinned (§2.2); the
   exposure-distribution flag is withdrawn (§8); §13 carries no evidential weight.
2. **For the v1 producer as ruled, the reverse algorithm has no harness-held core** (§3.1). A harness
   identity with an examined record is a prerequisite the founder elects; until then §3 is idle and
   generation runs on the runner's own declared gap.
3. **The circle finger is the runner's declaration** (§3.3); grounding it in the executing agent's
   state needs a server-side circle derivation that does not exist.
4. **The runner is not in this repo**; every runner-side element is contract-level.
5. **No candidate has ever been produced by the reverse algorithm, no environment attested, no
   melete entry written.** The first live cycles are the first evidence; v2 items (§16.8) wait on it.
6. **`accepted_move_count` is runner-controlled and non-comparable across runners** unless the build
   brief fixes granularity (§3.4).
7. **The M/W/S election and R8-D7's sampling policy are deferred**, and §11 shows a non-S policy
   changes what flows on the existing edge — one more reason the election waits on Path A's data.
8. **This design was produced by a session inside the system it designs for** (the Probe 6 condition);
   PR19 review was run and folded before it is treated as final; the mentor's reception is the external
   check.
9. **The 84% figure is cited nowhere as load-bearing** (D3); the directional principle appears once, at
   §6, as one of two independent reasons for a disclosure.

---

## 19. Cross-references

`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md` (the governing
brief; A1–A4, B1–B4, C1–C5, D1–D5) ·
`2026-09-04-mentor-ruling-standing-runner-close-gate-discrepancy-verbatim.md` (the naming
constraint; the expanding-move strike; "a separate act") ·
`2026-09-04-mentor-ruling-standing-runner-gate-item-level-session-may-open-verbatim.md` (the
item-level gate; Path A; the founder opens) ·
`2026-08-30-standing-runner-design-R8.md` (§2, §4.3 R8-D1b, §4.8, §4.9, §5.3, §6.2, §9, §11, §12) ·
`2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md` (Q1a/Q1c; Q3) ·
`2026-08-30-mentor-ruling-set-E-A2-A3-A4-D-verbatim.md` (A2, A3, A4, D — verbatim wins) ·
`2026-09-03-DESIGN-DOCUMENT-oc-per-consumer-rendering-FOR-RULING.md` §4.3(e), §11 ·
`2026-09-03-mentor-rulings-oc-gate3-verbatim.md` (Q1; Q2; Q6) ·
`2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md` (F-b) ·
`2026-08-15-SCOPE-DOCUMENT-layer3-per-consumer-rendering-FOR-RULING.md` §3.4 ·
`2026-08-05-idea-loop-generation-heuristics.md` · `2026-08-29-nine-candidate-remediation-shape-classification.md` ·
`2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md` (Q-A4; Q-C1/Q-C2a; Q-C3) ·
`D-ATRF-EE-WAVE-STEP0-PRODUCTION-STATE-DETERMINED-ALREADY-APPLIED` · `operations/agent-circles-2026-08/d6a/` ·
`manifest.md` (ATRF; the Prerequisite Criterion) · `website/src/lib/substrate/idea-loop-types.ts`,
`website/src/app/api/practice/watching/handler.ts`, `website/src/lib/substrate/trust-core/profiles.ts`,
`website/src/lib/substrate/trust-core/collaboration-store.ts`, `website/src/lib/substrate/trust-core/trust-record-payload.ts`,
`website/src/app/api/trust-record/[agent_id]/handler.ts`, `website/src/app/api/reason/route.ts`,
`website/src/lib/translation-sandwich/layer1-extractor.ts`, `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`,
`harness/gate1-pre-decision/claude-code/hooks/lib/discernment.mjs` (the design ground, read at source).

*End of design. It self-starts nothing. The M/W/S election and R8-D7's sampling policy remain deferred
until Path A's data is in hand; every build item is a founder election; the gate's item-level reading
is the mentor's, the opening was the founder's, and the first draft's over-claims are withdrawn at the
head rather than absorbed.*
