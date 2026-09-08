# Cognitive OS — Phase 1 Gap Analysis

**Step 1 deliverable** of `inbox/mentor cognitive os instructions.rtf`. Written 2026-09-08 AEST
(`date`), after the thirteen pre-build questions were relayed and **ruled**
(`2026-09-08-mentor-rulings-cognitive-os-thirteen-questions-verbatim.md` — **canonical; it wins over
this document**).

> **STOP POINT. This document is the end of Step 1.** Per the instruction: *"Produce the gap analysis
> as a written document. Stop. Do not proceed to implementation until the founder has reviewed it."*
> **No code, no schema, no new surface names, no migration, no flag has been created.** The only files
> written by this arc are in `operations/cognitive-os-2026-09/`.

**Governance state at writing, verified first-hand:** observation window RUNNING (baseline 2 of 5);
byte-identity guard ARMED and green (250/0); both SHA pins unchanged; production unchanged since
2026-09-06; `HEAD` = `origin/main`. **S11 flip REFUSED; weights BLOCKED; 0h call the founder's.**

---

## 1. Method

Every claim about the current codebase below names the check that produced it. Checks were run
first-hand today; none is carried from a summary. Where the finding is a **negative** (something does
not exist), the search that failed to find it is named, because a negative claim is only as good as
its search.

**One event to record before the substance.** While writing this arc's records, the at-action
guardrail returned **`do_not_proceed`** — an ENFORCE deny, the first this session — on a `cat >`
redirect creating the verbatim ruling file. The deny was **honored, not retried**. Grounds:
`andreia` floored to `reflexive` because *"the `examined_before_acting` claim on a carried-out grave
act is uncorroborated/contradicted"*; the graveness signal is the overwrite-redirect, which is on the
guard's own irreversible-action set. The target file was then confirmed **not to exist** (so nothing
could be destroyed) and the action was **adjusted** — a create via the Write tool rather than a
truncating redirect — which is what the guard's own message instructs (*"Re-examine the action, or
adjust it"*). The adjusted action's frame returned **`principled`**. Recorded here rather than
omitted, because a deny that is worked around silently is the failure mode this project measures.

---

## 2. Repository map

### 2.1 Agents that exist

| Agent identity | Form | Status |
|---|---|---|
| `sagereasoning:s9-loop@v1` | the founder's dogfooded Gate-1 harness loop | **live**, gen-2 credentials |
| `sagereasoning:idea-loop@v1` | IDEA-loop runner | **live**, `consult` + `watching_write` |
| `sagereasoning:org-tech@v1`, `…org-ops@v1`, `…org-growth@v1` | org role-agents | **live**, signed + harnessed |
| `sagereasoning:gate1-dogfood@v1` | the standing `pre_decision_harness` marker credential | **live** |

**Support was deliberately deferred.** These are *organisational* agents. **None is an environment.**

### 2.2 The Stoic harness — where it actually fires

Four hooks, registered in `.claude/settings.local.json` (read today, keys only):

| Hook | Event | Function |
|---|---|---|
| H1 | `UserPromptSubmit` | calling frame; declared-purpose telos line |
| H3 | `PreToolUse` | **per-tool-call** consult (`/api/reason`) + guard (`/api/guardrail`, can deny) |
| H4 | `Stop` | reflect turn + accreditation write |
| H5 | `PostToolUse` (`Task\|Agent`) | delegation hand-back |

**It is a per-action mechanism inside a Claude Code loop, not a commitment stage in a pipeline.**
Per the Q5 ruling this is untouched by Phase 1; the Cognitive OS pipeline sits **alongside** it.

### 2.3 State objects that exist (the ones that matter to Phase 1)

| Table | What it is | Immutability |
|---|---|---|
| `agent_trust_events` | typed trust-event ledger, 21 event types, `artifact_ref NOT NULL` | **APPEND-ONLY** — `BEFORE UPDATE` trigger raises |
| `agent_trust_state` | materialised per-`(agent_id, virtue_domain)` fold of the above | mutable projection, **rebuildable from events** |
| `collaboration_records` | delegation record: `authority_boundary`, `l4_audit_result`, purpose ack | **two write-once columns**, trigger-enforced |
| `agent_provenance_ledger` / `agent_provenance_gaps` | per-examination provenance + gap ledger | append-only |
| `agent_hold_observations` | the false-hold observation ingest | append-only + immutability trigger |
| `substrate_audit_events` | A12 call-grain audit, masked/structural | append-only |
| `credential_audit` | credential lifecycle | append-only, `RESTRICT` on delete |
| `agent_assessment_history` | per-consult trajectory, `retain_until`-swept | mutable rows, retention-bounded |
| `agent_handoffs` | **org-agent inbox** (tech/growth/support/ops/founder) | mutable, status-tracked |

### 2.4 Handoff shapes that exist — and one name collision to avoid

- **`agent_handoffs`** (migration `20260411`) is an **organisational inbox**: `source_agent` /
  `target_agent` constrained to `('tech','growth','support','ops','founder')`, with `category`,
  `priority`, `status`. **It is not an environment handoff and must not be extended into one.** The
  Cognitive OS `HandoffEnvelope` and this table share a word and nothing else. **Flagged so a future
  session does not conflate them.**
- **`collaboration_records`** is the genuine permissioned handoff: a two-dimensional
  `authority_boundary` (action scope + circle scope) that is **unwaivable by trust** — enforced
  structurally, since `validateAuthorityBoundary` takes **no trust parameter** and that is
  `@ts-expect-error`-locked — plus a write-once `l4_audit_result`. **This is the closest existing
  analogue to the HandoffEnvelope's permission half, and it is better than the spec's, because the
  unwaivability is a compile-time property rather than a documented rule.**

---

## 3. The twelve environments — the sharpest finding

**Instruction, Step 1.1:** *"Identify where each of the twelve environments currently exists and in
what form."*

**Search run today:** each of the twelve names grepped across `website/src` (`*.ts`, `*.tsx`), then
every hit disambiguated by reading it.

| Environment | Files in `website/src` | Verdict |
|---|---|---|
| Laboratory, Workshop, Forest, Observatory, Attic, Cellar, Garden, Arena, Cloister, Archive | **0** | absent |
| Library | 3 | **false positives** — "V3 Deliberation Chain Library", "V3 Core Reference Library", a test comment |
| Threshold | 24 | **false positives** — 102 occurrences, all numeric: `meetsThreshold`, `distanceThresholds`, `threshold_reached`, Stripe/rate-limit thresholds |

**Also checked and also absent:** a room/environment **attribute** on `idea_loop_candidates`. R10
records the v1 design as *"attribute of a candidate, runner-attested"* — that design is **not built**;
the only `environment` strings in those migrations mean TEST-vs-production.

### **Finding: none of the twelve environments exists in code, in any form.**

They exist as **design vocabulary in `operations/` documents only** — R9, R10, the priority index,
the governing brief. R10's *"three host a live production heuristic"* refers to existing mechanisms a
room would *correspond to*, not to code that names a room.

### Why this matters to Phase 1, and what it obliges

The Q1 ruling says the four Phase-1 environments are *"permission scopes with defined read/write
boundaries, not actors."* **There is nothing to wire them to.** The scopes must be created from
nothing, which means:

> **⚠ FLAGGED FOR GOVERNANCE REVIEW (instruction constraint 2).** Introducing `Laboratory`, `Attic`,
> `Archive`, `Threshold` as **code-level identifiers** creates **four new governed surfaces**.
> Constraint 2: *"If the Cognitive OS requires new surfaces, name them distinctly and flag them for
> governance review before building."* **This is that flag.** They are not renames or repurposings of
> anything existing — the namespace is empty — but they become settled names the moment they ship.
> **Founder review is owed on the four names before any code uses them.**

**A consequence worth stating plainly:** Phase 1 will be the first time the twelve-environment
vocabulary exists anywhere except in design documents. That is a larger step than "wiring", and the
gap analysis should not disguise it as one.

---

## 4. The six Cognitive OS services against what exists

Instruction Step 1.2 — *"Do not build what already exists."*

| Service | What already exists | Coverage |
|---|---|---|
| **4.1 Belief Revision + Truth Maintenance** | **Nothing.** Grep for `retract` / `reinstate` / `invalidat` across `website/src/lib` returned three files, all **false positives** (the word inside prose constants). No claim registry, no dependency graph, no retraction propagation. | **~0% — the genuine core gap** |
| **5 Knowledge / Epistemic State** | Partial and domain-scoped. `agent_trust_events` has a **typed 21-value event vocabulary** with effects mapped deterministically by type; evidence floors emit a **distinct `insufficient_extraction`** rather than a defaulted value; coverage gaps are named, not implied. But the vocabulary is trust-domain, not epistemic (`OBSERVE`/`INFER`/`RETRACT` do not exist). | **~30%, wrong domain** |
| **6 Event Store / Temporal State** | **Strong.** `agent_trust_events` is append-only with a DB trigger that *raises* on UPDATE; `agent_trust_state` is a **fold derivable from the event history** — precisely the spec's requirement. Idempotency via a partial-unique index on `(correlation_id, event_type, virtue_domain)`. Retention sweeps exist. | **~70% of the mechanism, one domain** |
| **10/11 Identity / Narrative** | Partial, and **not identity-as-narrative**. `agent_accreditation` + the public trust record carry earned per-domain levels, decay, a justice latch, coverage status, `credential_basis`. The calling gate carries a **declared purpose**. Stoa carries practitioner declarations. There is **no** commitments log, narrative themes, known tensions, or identity-change events. | **~25%** |
| **12 Conversation** | `founder_conversations` + `_messages` (plaintext at rest — a carried LOW); `sage_reflect_sessions`. **Neither models positions, claims introduced/challenged, agreements or unresolved questions.** Message passing, not conversation-as-object. | **~15%** |
| **13 Structural Coupling** | **Nothing** matching the spec. The closest is `substrate_audit_events` (call-grain, masked) and the harness's observability JSONL — telemetry, not coupling events. | **~5%** |
| **14 Multi-Agent Coordination** | **Stronger than the spec assumes.** The four-layer discernment engine (L1 honestum → L2 fit → L3 axia → L4 out-of-band passion audit) selects a delegate; `collaboration_records` carries the authority boundary; `closeDelegation` emits A8/A9 events; the A9 boundary is **unwaivable by trust, structurally**. | **~55%** |

---

## 5. Phase 1, component by component

| # | Component | What exists | What is missing | Where it goes |
|---|---|---|---|---|
| 1 | **`Claim`** | nothing | the whole object | **new** `website/src/lib/cognitive-os/claim.ts` |
| 2 | **`BeliefState`** | `agent_trust_state` is a versioned fold, but of trust levels, not claims | claim-set state, revision-event list, active dependencies | **new** `belief-state.ts` |
| 3 | **`EventStore`** | `agent_trust_events` — append-only, trigger-enforced, fold-derivable, idempotency-indexed. **The pattern is proven in production.** | a **generic** event store (the existing one's `event_type` CHECK is a closed 21-value trust vocabulary; `virtue_domain` is a required axis) | **new table + `event-store.ts`**, *modelled on* the trust-events migration — reuse the pattern, not the table |
| 4 | **Versioning** | `agent_trust_state` fold; `mentor_profile_snapshots`; the S11b **regime-boundary** discipline (never mix regimes; a dated boundary; a one-day uncertainty band excluded and counted) | claim/belief-state version increments | in `belief-state.ts` |
| 5 | **`DependencyGraph`** | **nothing** | the whole graph | **new** `dependency-graph.ts` |
| 6 | **`TruthMaintenanceSystem`** | **nothing.** The nearest relative is `analyseLoopClosure`, which already does **supersession by explicit ref link** + a **same-depth rule** + treats **`indeterminate` as not closed** — the right instincts, applied to examinations rather than claims | stale-conclusion detection over a claim graph | **new** `truth-maintenance.ts`; **reuse the closure semantics deliberately** |
| 7 | **`BasicBeliefRevision`** | **nothing** | retraction, reinstatement, propagation | **new** `belief-revision.ts` |
| 8 | **`HandoffEnvelope`** | `collaboration_records`' `authority_boundary` (write-once, two-dimensional, unwaivable-by-trust, compile-time-locked) is a **better permission half than the spec's** | the envelope schema itself; validation on receipt; stale-version rejection | **new** `handoff-envelope.ts`; **do not extend `agent_handoffs`** (§2.4) |
| 9 | **`PermissionModel`** | **strong.** `PRACTICE_CAPABILITIES` = `consult, l1_supply, accreditation_write, calling, reflect, watching_write, completion_signal_write`, one `validatePracticeCredential` chokepoint, fail-closed 403, DB CHECK kept in sync with the write-class list. **Machine-enforced, exactly as the spec demands.** | environment-scoped read/write/revise/retract/commit permissions | **new** `permissions.ts`, **modelled on** the capability chokepoint |

### 5.1 The honest headline

**Phase 1's mechanisms are ~40% already built — but for one domain (agent trust/examination), not for
claims.** What is genuinely absent is the *epistemic* core: **Claim, DependencyGraph, TruthMaintenance
and BeliefRevision have no analogue anywhere in the codebase.** The Event Store, versioning discipline
and permission model exist as **proven production patterns to copy**, not as code to extend.

**Recommendation:** copy the patterns; do not extend the trust tables. `agent_trust_events`' event
vocabulary is a closed CHECK constraint tied to virtue domains and is under active mentor sequencing
(D2). Widening it for Cognitive OS events would couple the two systems at exactly the layer the
instruction's constraint 1 says must stay separate.

---

## 6. Governance interactions — every one flagged

Instruction Step 1.4: *"Identify any interaction between Phase 1 and the governance constraints listed
above. Flag every interaction explicitly before proceeding."*

### 6.1 ⚠ MANDATORY PLACEMENT NOTE (Q4 ruling — *"The note is not optional"*)

**The Cognitive OS is to be placed at `website/src/lib/cognitive-os/`, OUTSIDE `substrate/`.**

**This placement was constraint-driven by the observation window, not chosen on architectural
grounds, and may be revisited after the window closes.** The constraint: the byte-identity guard runs
`git status --short` and matches `GUARD_RE` against **every line including `??` untracked entries**;
`GUARD_RE` contains `/substrate/` and `trust-core`. Verified by testing the regex against candidate
paths today:

| Path | Result |
|---|---|
| `website/src/lib/substrate/cognitive-os/claim.ts` | **TRIPS THE GUARD** |
| `website/src/lib/substrate/trust-core/belief-state.ts` | **TRIPS THE GUARD** |
| `website/src/lib/cognitive-os/claim.ts` | clean |

So a **brand-new file** in the architecturally natural home turns the battery red and blocks the
commit gate, though a new file cannot perturb the measurement. **A future session must not treat
`cognitive-os/` as architecturally settled.** Per the ruling, a per-commit waiver was rejected because
it *"normalises waivers for routine build work, which is precisely what the D2 stand-down mechanics
were designed to keep exceptional."*

### 6.2 ⚠ NAMED SCHEMA CONSTRAINT — the Phase-6/weights collision, raised now (Q10 ruling)

**Carried into this document as instructed.** Phase 6 would route on `epistemic_debt_score` and
siblings. If an agent can influence the score that routes it, that is a **gameable scorer inside an
optimisation loop** — GS-CYB-1 arriving from the other end.

> **Binding Phase-1 schema constraint:** the scores a future routing mechanism would read **must not
> be writable by the agents being routed.** The dependency graph and permission model together
> enforce this: **an agent's write permissions do not include the scores that govern its own
> routing.** This is a Phase-1 design constraint, not a Phase-6 problem.

### 6.3 Self-report exclusion (Q6 ruling)

Phase 1's `Claim` **derives confidence only from provenance the system can verify.** An
agent-supplied confidence scalar is structurally in the **A2 self-report class** — the disclosed,
published, structurally-uncloseable residual that is the reason weights are BLOCKED. If an
agent-supplied value is ever retained it must be a **separate field, never merged, never aggregated**,
with names that make the distinction unambiguous **at the schema level**.

### 6.4 Ordinal discipline (Q7 ruling)

**`Claim.confidence` is ORDINAL, not cardinal `[0,1]`** — the spec's schema is overridden here on the
`lower_median` grounds (*"averaging ordinal ranks produces numbers that may not correspond to any
actual rank on the scale"*).

> **Standing rule established:** **no Cognitive OS scalar may be combined with a proximity rank in any
> derived figure** — including `epistemic_debt_score` and `identity_coherence_score`. Never
> aggregated with, averaged against, or used to modify a proximity rank. The HandoffEnvelope carries
> them as **separate fields, never merged.**

### 6.5 Omit unmeasured fields (Q8 ruling)

`identity_relevance` and `interpretive_context` are **omitted from the Phase-1 Claim.** If a
placeholder is ever needed for forward-compatibility the value is **`null` with an explicit
`not_yet_measured` status field — never `0.0`.** Grounds: the `caller_class` lesson — a
reserved-unpopulated `0.0` reads as *"no identity relevance"*, which is a false claim.

### 6.6 Prerequisite Criterion — machine-enforced non-export (Q9 ruling)

`epistemic_debt_score` and `identity_coherence_score` **never leave the system**: never on the public
trust record, never in a handoff to an outside consumer, never published. **That boundary must be
machine-enforced, not documented** — *"internal means genuinely internal, not internal-by-convention
while being accessible via an API route a consumer could call."* **If the permission model cannot
enforce it, the schema must not produce the scores until it can.** (Phase 2/3 concern; recorded now
because the permission model is Phase 1.)

### 6.7 Constraints that Phase 1 does NOT engage — checked, not assumed

| Constraint | Engaged? | Evidence |
|---|---|---|
| **4 — observation window / `GUARD_RE`** | **No**, given §6.1's placement | regex tested against the planned path |
| **5 — D2 / `computeVirtueDomains`** | **No.** Phase 1 touches no virtue-domain tagging | D2 lives in `layer2-mechanisms.ts`, SHA-pinned `60cefedb…`; Phase 1 adds no file that imports it |
| **1 — harness/Cognitive OS separation** | **Honoured.** Phase 1 adds no harness file and repositions nothing | Q5 ruling: the two coexist |
| **6 — S11 flip / weights** | **Not cleared by anything here.** Both remain as they were | §6.2 tightens rather than relaxes |
| **Q1 hard constraint (loop proposes, never executes)** | **Compatible** — Threshold produces an *authorised proposal* | Q11 ruling, confirmed |

### 6.8 ⚠ AN INTERACTION THE SPECIFICATION DOES NOT MENTION — data rights and retention

**Not in the spec, not in the instruction, and binding in this project.** Every table this project has
added since R17 is wired into `/api/user/access`, `/api/user/export`, `/api/user/delete`,
`/api/credential/erase` where applicable, **and a retention sweep enforcing `retain_until`**. The
project has been bitten twice by omissions here (`sage_reflect_sessions` erasure; the
`agent_hold_observations` / `stoa_entries` retention parity gap, still carried).

> **A Cognitive OS event store holding claims, provenance and — later — identity narrative is
> squarely personal-data-adjacent.** Any Phase-1 table must ship with: data-rights wiring, a
> `retain_until` column, and a sweep. **Flagged as owed at the schema step, not after.**

### 6.9 R9/R10 reconciliation — owed before Phase 2 (Q2 ruling)

The Cognitive OS `HandoffEnvelope` **does not supersede** R9's handoff design. **Reconciliation is
owed before Phase 2 opens**, when the actor architecture begins consuming the state services.
Recorded here so it is not rediscovered. R9's unmet prerequisite (an executing actor with an examined
record) **does not gate Phase 1**. **R11 is not superseded and remains the founder's to open.**

### 6.10 Manifest amendment — owed at Phase 3, not now (Q3 ruling)

The Consciousness and Continuity Obligation's **component one is moved into the build sequence** by
this instruction. **A manifest amendment is owed before Phase 3**, and must **name explicitly** the
boundary: Phase 3 builds *the queryable record*, **not** *the deepening disposition*, and claims no
continuity of experience in a morally relevant sense. **Nothing is owed at Phase 1** — the Event Store
and Belief State are the foundation component one rests on, not component one itself.

### 6.11 Settled surface names — built vs reserved (Q12 ruling)

| Name | Status | Checked how |
|---|---|---|
| `practice-on` / `practice-off` | **BUILT** | `.claude/skills/` |
| `fresh`, `watching` | **BUILT** | live routes since 2026-08-10 |
| `sagereasoning:idea-loop@v1` | **BUILT** | live runner credential |
| `logos-on` / `logos-off` | **RESERVED, NOT BUILT** | no skill; named in ADR-012 as the future ENFORCE mode |
| `idea-on` / `idea-off` | **RESERVED, NOT BUILT** | no skill; named in `project-context.json` + mentor records |

**Reserved-unbuilt names carry the same protection as built names.** A session finding nothing built
should conclude *the names are reserved*, not that the list is stale.

---

## 7. The smallest Phase 1 that satisfies the specification

Per spec §28. **Proposed, not started.**

1. **`website/src/lib/cognitive-os/`** — pure, deterministic, env-free modules: `claim.ts`,
   `belief-state.ts`, `event-store.ts`, `dependency-graph.ts`, `truth-maintenance.ts`,
   `belief-revision.ts`, `handoff-envelope.ts`, `permissions.ts`, `types.ts`, `index.ts`.
2. **One new append-only table**, modelled on `agent_trust_events`' proven pattern — `BEFORE UPDATE`
   trigger that raises, service-role-only RLS, idempotency index, `retain_until` + sweep (§6.8),
   data-rights wiring.
3. **Four permission scopes** — `Laboratory`, `Attic`, `Archive`, `Threshold` — as read/write
   boundaries only, **pending the §3 governance review of the names**.
4. **Deterministic tests** including the spec §27 / Step-3 critical scenario, which must pass
   **deterministically** or Phase 1 is not complete.
5. **PR19 independent review** — required by process, and this window has seen independent review
   find HIGHs that first-hand review missed eight separate times.

**Everything flag-gated and dark by default**, per this project's standing build discipline: nothing
in Phase 1 changes any live response, and flag-off byte-identity is test-asserted.

---

## 8. Open questions for the FOUNDER before Step 2

1. **The four environment names as code identifiers** (§3) — governance review is owed. Approve the
   names, or direct different ones.
2. **New table vs pure-lib-only for Phase 1.** A new table makes this `code-critical` (schema +
   data-rights + retention + a founder-walked migration). A pure-library Phase 1 with an in-memory
   event store would be `code-elevated` and could be reviewed before any DB step. **Recommendation:
   pure library first, table as its own founder-walked step** — it lets the critical test pass and be
   reviewed before any migration is written.
3. **Does the arc continue in this session or open its own?** Per Q13 this is one arc, cleanly
   separated from the window arc. This session has now written the questions, the verbatim and this
   analysis; a fresh session for Step 2 would open with a clean context.

---

## 9. State

**Step 1 COMPLETE. Step 2 NOT STARTED and not licensed until the founder reviews this document.**

Nothing built. No code, no schema, no migration, no flag, no new surface name in code. No governing
surface amended. The window ran untouched throughout; the guard is armed and green; both SHA pins
unchanged; `classifyCaller` byte-unchanged; nothing committed, nothing pushed.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
