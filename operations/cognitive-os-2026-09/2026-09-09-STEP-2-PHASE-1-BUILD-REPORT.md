# Cognitive OS — Step 2 / Step 4 REPORT: Phase 1 built, critical test passing

**Session:** 2026-09-09 AEST (= 2026-09-08 UTC), `code-elevated`, opened under
`2026-09-09-SESSION-cognitive-os-STEP-2-phase-1-build-SESSION-PASTE.md`.
**Governing documents, in precedence order:** the 2026-09-09 review verbatim; the 2026-09-08 thirteen
rulings verbatim; the Phase-1 gap analysis; the instruction; the specification. **Verbatim wins over
this report.**

> **STOP POINT. This document is the end of Step 4.** Phase 1 is implemented and the critical first
> test passes. **Phase 2 has NOT been started and must not be without the founder's explicit
> instruction.**

**AC7 not engaged.** No table, no migration, no SQL, no flag set or unset, no credential, no deploy,
no push, no harness file, no `GUARD_RE` file touched. Nothing is wired to any live response.

---

## 1. What was built, and where it was inserted

A pure, deterministic, dependency-free TypeScript library at **`website/src/lib/cognitive-os/`** —
2,462 lines of library across ten files, plus two test files.

| File | Phase-1 component | What it is |
|---|---|---|
| `types.ts` | — | Injected clock/ids; the ordinal confidence scale; the non-combinable scalar wrappers |
| `claim.ts` | 1 Claim | The Claim object, provenance-derived ordinal confidence, status vocabulary |
| `belief-state.ts` | 2 BeliefState, 4 Versioning | Versioned immutable state; structured epistemic debt |
| `event-store.ts` | 3 EventStore | In-memory append-only log; replay; version reconstruction |
| `dependency-graph.ts` | 5 DependencyGraph | Cycle-safe forward/backward transitive traversal |
| `truth-maintenance.ts` | 6 TruthMaintenanceSystem | Stale-conclusion detection over the claim graph |
| `belief-revision.ts` | 7 BasicBeliefRevision | Retraction, reinstatement, propagation + DecisionRecord |
| `handoff-envelope.ts` | 8 HandoffEnvelope | Envelope, receipt validation, external-view stripping |
| `permissions.ts` | 9 PermissionModel | The four scopes, six verbs, grant table, egress boundary |
| `index.ts` | — | Barrel + the mandatory placement note |

**Insertion point: nowhere yet, deliberately.** Nothing imports this library. It is a standalone state
library with no callers, no route, no flag and no table. That is what a reviewable Phase 1 is.

### Where the file list came from, and one deviation

The ruled file list is the gap analysis §5 list, and it is followed exactly. The specification's
**DecisionRecord (§19)** is not on it but is required by the Step-3 scenario, so it lives in
`belief-revision.ts` rather than in a tenth file — every operation on a decision (commit, review,
supersede) is a revision event, so that is where it belongs. **No file outside the ruled list was
created.**

---

## 2. What existing components were reused — and HOW

**Every reuse in this library is SEMANTIC. There is not one structural reuse.** The library imports
nothing from the harness, the substrate, the trust core, or `loop-closure-gate.ts` — verified by
reading every import in every file, and pinned by a battery assertion that greps for the forbidden
specifiers with comments stripped first.

| Existing thing | How it was reused | Structural? |
|---|---|---|
| **`analyseLoopClosure`** (accreditation write boundary) | Its three semantics — **supersession by explicit ref link**, the **same-depth rule**, **indeterminate treated as NOT closed** — reimplemented independently in `truth-maintenance.ts`. Read for semantics; **changed nothing**. | **No — forbidden, and pinned** |
| **`agent_trust_events`** | Its append-only PATTERN copied: no update path, no delete path, a fold derivable from history. **The table is NOT extended** — its `event_type` CHECK is a closed virtue-domain vocabulary under D2 sequencing. | **No** |
| **`validateAuthorityBoundary`'s `@ts-expect-error` lock** | The idiom copied: an unwaivable rule expressed as a compile-time property. Applied to C4, C5 and C6. | **No** |
| **`PRACTICE_CAPABILITIES` chokepoint** | The shape copied: one enumerated capability set, one fail-closed check function. | **No** |
| **AE-2's `occurred_at_basis: "submission_order"` honesty** | The discipline copied: a logical `seq` is authoritative ordering, the timestamp is descriptive and never compared. | **No** |

**A judgement call with a cost, named rather than buried:** `truth-maintenance.ts` uses a *different*
rigour vocabulary (`cursory/standard/thorough`) from the harness's `quick/standard/deep`. Same ordering
semantics, separate scale. The reason is separability — identical identifiers invite a future session
to "unify" them by importing one into the other. **The cost is real: a reader comparing the two systems
must map the scales.** Part of that choice also served the *appearance* of separation as well as the
fact of it. The fact is independently verifiable (no import, independent logic); the naming was partly
rhetorical, and the founder may prefer identical vocabulary.

---

## 3. Governance interactions — every one, and how it was handled

### 3.1 The binding constraints C1–C9

| # | How it is handled | Enforcement |
|---|---|---|
| **C1** placement note | Verbatim in `index.ts` AND `types.ts`, stating the location was window-driven, may be revisited, and **must not be treated as architecturally settled**. | Battery asserts the text survives; mutation-verified |
| **C2** scopes not actors | The four names are defined once, in `permissions.ts`, as `PermissionScope`. **The library has no `actor` field anywhere.** Nothing instantiates an agent. | Battery greps every file (comments stripped) for `actor` assignment and for actor/agent construction |
| **C3** ordinal confidence | A five-member string union. No confidence field is typed `number` anywhere. | Battery + tsc |
| **C4** no agent-supplied confidence | `CreateClaimInput` types `confidence` and `agent_confidence` as **`never`** — supplying either is a **compile error**. `deriveConfidence` reads only `verification`, which the system sets. | **Compile-time**, mutation-verified: relaxing `never` makes tsc fail |
| **C5** no scalar combined with proximity | The scalars are wrapper **objects**, not branded numbers, so `debt + proximity` is a **compile error**. The envelope carries them as separate fields. | **Compile-time**, mutation-verified |
| **C6** omit unmeasured fields | `identity_relevance` / `interpretive_context` are **absent** from the Claim and typed `never` on the input. Never `0.0`. The envelope carries no `identity` block. | **Compile-time** + battery |
| **C7** routing scores not agent-writable | `routing_score` carries **no write verb for any scope**, in every row. Scores are **derived**, never stored — the dependency graph has no score field and no setter. | Battery checks the helper **and independently re-walks the whole table**, plus a non-vacuity check that the resource IS readable |
| **C8** internal scores never leave | `assertNoInternalScoreEgress` detects **both** the wrapper form and the **flattened-key** form (what a serializer would emit), cycle-safe, and refuses egress to an external consumer. `toExternalView` removes the debt block **entirely** — not zeroed. | Runtime, mutation-verified, incl. a score hidden in `payload` |
| **C9** proposal never execution | `commitDecision` returns an `AuthorisedProposal`. **No executor exists in the library** — no exec/spawn/fetch/timer, battery-checked across every file. An `EXECUTE` event requires naming an **external** executor. | Battery + source grep |

### 3.2 The specification's own constraints 1–10

Constraint 1 (no silent mutation) is **structural**: `nextVersion` requires a revision event id, so a
belief change with no event cannot be produced. Constraint 2 (no destruction of history): every
operation returns a new frozen value; the store has no update or delete path. Constraint 4 (no
score-only reasoning): the structured debt object is authoritative and the summary score is re-derived
from it on every version, so it cannot drift or be set independently. Constraint 6 (no automatic
reinstatement): **Attic holds no write verb at all**, and `reinstateClaim` refuses without a warrant
carrying system-verified evidence. Constraint 7 (no automatic commitment): Threshold alone holds
`COMMIT`. Constraint 8 (no black boxes): every status and event type is explicitly enumerated.
Constraint 10 (traceability): every event carries scope, cause, reason and causal dependencies, and a
dangling causal link is refused.

### 3.3 Constraints checked and NOT engaged

The observation window and `GUARD_RE` (placement keeps every path clean — re-derived and tested this
session, with positive controls proving the regex live); D2 / `computeVirtueDomains` (nothing here
touches virtue-domain tagging); harness separation (no harness file added, nothing repositioned, the
live Gate-1 harness fired per action throughout this session); the S11 flip and weights (**untouched;
C7 tightens rather than relaxes the weights position**).

### 3.4 ⚠ THREE THINGS THE FOUNDER SHOULD SEE, not buried

**(a) A genuine spec-vs-ruling collision, resolved by precedence and flagged.**
Spec §6's event example carries `"actor": "Laboratory"`. Ruling C2 says these names are **not actor
names**. Both cannot be honoured literally. Precedence gives the rulings the win, so the event carries
`scope` (the permission scope the transition was authorised under) plus `caused_by` (the agent/service
identity, for Constraint 10). **The instruction says to flag conflicts and not resolve them
unilaterally; precedence supplied the resolution, and this flag preserves your authority to overrule
it.**

**(b) A contradiction inside the critical scenario's own requirements.**
Step 9 says Decision D **becomes REVIEW_REQUIRED**; step 10 says the original decision **remains
immutable**. Those are incompatible if status is a field on the record. Resolved using the spec's own
rule — *"current state should be derivable from the event history"*: the DecisionRecord is frozen and
never edited, and status is **derived from the event log**. Ordinary engineering, not a governance
call, but a reader should not have to discover it.

**(c) One design inference that is mine, not ruled.**
**Attic having zero write verbs** is my reading of Constraint 6 (*"Attic may surface an old belief.
Laboratory/Cellar must establish whether it should return"*). It makes Constraint 6 structural rather
than procedural, which I judged correct — but it is an inference, and you may want Attic to hold a
narrower write.

### 3.5 The data-rights obligation, carried forward as instructed

**Not owed at Step 2 — owed at the table step, and it opens with this already on the surface**: schema,
**data-rights wiring** (`/api/user/access`, `/export`, `/delete`, `/api/credential/erase`), a
`retain_until` column, a retention sweep, and the migration — founder-walked. A store holding claims,
provenance and later identity narrative is squarely personal-data-adjacent. This project has been
bitten by that omission twice. It is stated in `index.ts` as well as here.

---

## 4. What the critical first test produced

**PHASE 1 GATE: PASSED. 30 assertions, 0 failed, and determinism PROVEN rather than asserted** — the
entire scenario runs **twice**, from scratch, with two independently constructed clocks, and the two
full serialised traces are compared byte-for-byte.

Every numbered step of the instruction's Step-3 scenario is asserted: evidence registered (OBSERVE) →
claim A's confidence re-derived to `unsupported` → A retracted (RETRACT) → version incremented at
every stage → B and C marked stale via transitive propagation (CHALLENGE) → decision D identified as
affected → epistemic debt increased → D derives as **REVIEW_REQUIRED** → **the original decision record
is byte-identical after the whole flow** → re-examinations evaluated → a new decision version supersedes
D → the complete trajectory replays from the log.

**Battery:** `cognitive-os.test.ts` **147 passed, 0 failed** (124 before the PR19 fold) across belief revision, temporal
integrity, epistemic debt, confidence, permissions, egress, handoffs, threshold, the constraints, and
the TMS semantics from both sides. **Project-wide `tsc --noEmit`: 0 diagnostics.**

### 4.1 What mutation testing found — including two of my own vacuous pins

Sixteen mutations were applied to the battery and eleven to the critical scenario, each with the
mutation's landing **verified by SHA** (a mutation that silently fails to apply produces a false
negative — the S7 lesson) and each restore SHA-verified.

**Two pins were VACUOUS on the first pass, and both were in the semantics the review named as
load-bearing:**

- **M6** — inverting the conservative direction (treating `indeterminate` as **resolved**) left the
  critical scenario **green at 27/0**. The scenario never produced an indeterminate item, so the third
  reused semantic was **not tested at all**. Closed by adding a dependent whose establishing rigour is
  unrecorded, plus a positive control proving a clean verdict is still reachable.
- **M9** — a re-examination whose **own** rigour is unrecorded was allowed to resolve, untested. Same
  semantic from the other side. Closed in the battery (§10.2) with its reachability control.

**After the fixes: 16/16 battery mutations kill, 11/11 scenario mutations kill, zero survivors**,
including all three compile-time pins (relaxing `never`, or making the debt score a bare number, makes
`tsc` fail — proving those pins are real and not decorative).

A third defect was found by the tests themselves: my cycle-safety assertion was **wrong**, expecting a
node to be its own dependent. Corrected by **strengthening** — asserting the documented property and
adding a 3-cycle plus the backward-traversal case.

**A defect I introduced and caught only by running the project's own gate:** two unused imports in the
battery broke `tsc` under the repo's `noUnusedLocals`, which my isolated `tsc` invocations did not
apply. Fixed; project-wide tsc is now clean. **The standing lesson holds: run the project's gate, not
a convenient subset of it.**

---

## 5. PR19 independent review — 14 findings upheld, ALL folded

**Method:** an 8-dimension independent fleet, each finding then passed to a separate **adversarial
verifier** instructed to refute it. **22 agents, 0 errors, ~6.8M tokens, 336 tool calls.**
**Model: `sonnet` throughout, per the founder's explicit permission to drop the review model.** Finders
ran at **low** effort as permitted; verifiers at **medium**, because a bad refutation silently discards
a real finding. Breadth (8 dimensions) was used to compensate for reduced per-agent depth.
**Disclosed:** one agent's work carried a harness note that the safety classifier was rate-limited
during its review; its findings were read against source before being folded, not taken on trust.

**Result: 14 upheld, 0 refuted** — and *0 refuted* is itself worth flagging as a limitation: a verify
stage that refutes nothing may be insufficiently adversarial. Each finding was therefore re-read
against source before folding, and each fold is mutation-verified below.

**PR19 found a class my own review structurally could not**, because I was checking my code against my
own comments. That is the ninth time in this project's record that independent review has caught what
first-hand review missed.

### The two HIGH findings that mattered most — C4 was satisfied only in its shallow form

I blocked a caller from writing `confidence` directly (compile-time, genuinely solid). But
**`EvidenceRef.verification` was a plain, caller-settable field, and NO verification subsystem exists
anywhere in this library** — while three separate file headers asserted the field was *"SET BY THE
SYSTEM."* **That was false.** Live-reproduced by the reviewer: a caller holding only ordinary
Laboratory grants (`READ evidence` + `REVISE claim`) fabricates four `verification: 'verified'` refs
from two fabricated sources, and `deriveConfidence` promotes the claim to **`established`** — the top
of the scale — with nothing ever examined. Worse, the *sanctioned* mutator `registerEvidence`, whose
own docstring cites C4, takes the ref as a caller parameter.

**The fold has three parts, and the third is the honest one:**
1. **`EvidenceRef` is now BRANDED** — constructible only via `attestEvidence`. A bare object literal is
   no longer assignable to it: a **compile error**, mutation-verified.
2. **Every attestation must name a `VerifierAuthority`**, recorded on the evidence.
3. **⚠ Phase 1 still ships NO verifier, and now says so loudly.** `phase1UnverifiedAuthority` marks
   every attestation `unverified_phase1`, `allEvidenceGenuinelyVerified` reports **false** for all of
   them, and the false "set by the system" language is **removed from every header**. The chokepoint
   makes the authority position explicit, typed and greppable — one place a real verifier plugs in —
   **but naming a seam is not filling it. A REAL EVIDENCE VERIFIER IS A NAMED PHASE-2 PREREQUISITE.**

### The C8 cluster — four live bypasses of a boundary I had called "machine-enforced"

`findInternalOnlyScores` walked with `Object.entries`, which silently misses **Map/Set contents,
non-enumerable own properties, prototype-defined getters, and Symbol keys**. The reviewer chained one
into an end-to-end leak through the real public API: `sendExternally` shipped a live
`epistemic_debt_score` to an `external_consumer` with no error.

**The fix is not four patches — it is FAIL-CLOSED BY CONSTRUCTION.** The scan now recognises only what
it can exhaustively read (primitives, arrays, and plain objects walked via `Reflect.ownKeys`, which
covers non-enumerable *and* Symbol keys). **Any other container — Map, Set, class instance, function,
Date, Proxy, or any accessor property — is reported UNSCANNABLE and REFUSED at egress.** You cannot
certify what you cannot read. All four bypasses are now regression-pinned, each mutation-verified.

### Every upheld finding and its disposition

| # | Sev | Finding | Fold |
|---|---|---|---|
| 1–2 | HIGH | C4: `EvidenceRef.verification` caller-settable; no verifier exists; "set by the system" false | Branded ref + one chokepoint + honest limit disclosed; Phase-2 prerequisite named |
| 3–4 | HIGH | C8: score in a Map/Set, or a non-enumerable property, invisible → real leak via `sendExternally` | Fail-closed scan; `Reflect.ownKeys`; unscannable containers refused |
| 5 | HIGH | `markDecisionForReview` gated on **READ** — which **Archive** holds, so a documented read-only reconstructor could flip a committed decision's status | Gated on **UPDATE**; Threshold alone holds it; Archive/Laboratory refusal pinned |
| 6 | MED | C9 "no executor" pin was a bare identifier grep, defeated by `import { execSync as __x }` | Replaced by a strictly stronger invariant: **every library import must be a relative sibling** |
| 7–8 | MED | C8: prototype getter and Symbol key invisible | Both refused by the fail-closed scan |
| 9 | MED | `retractClaim` had no double-retraction guard → duplicate debt entry inflating the summary | Repeat retraction **refused** (a second RETRACT would also record a change that did not occur) |
| 10 | MED | C5 overclaim: `debt.value + WEIGHTS[rank]` compiles; header said "compile error, not convention" full stop | Claim **corrected in all four files** to state exactly what is and is not enforced; named as a live Phase-6 risk |
| 11 | LOW | §10 never pinned the **strength** of the same-depth rule (only the null cases) | Cursory-on-thorough and standard-on-thorough pins added, plus the equal-rigour reachability control |
| 12 | LOW | `commitDecision` has no readiness gate — commits with live contradictions | **Disclosed**: spec §21's gate is Phase 2 and is not built. A Phase-1 proposal is not a vetted one |
| 13 | LOW | C8 check is a function a caller must remember to call; not wired to a boundary | **Disclosed** in `permissions.ts`; wiring every egress path through it is an **obligation on the table/route step** |
| 14 | NIT | `withReplacedClaim` had an optional clock that threw at runtime; no callers | **Deleted** — dead code modelling the wrong idiom |

### Mutation verification of the folds

**9 fold-mutations applied, 9 kill, 0 survivors** — including reverting the egress scan to
`Object.entries` (5 pins fire), reverting the review gate to READ (2 fire), removing the retraction
guard, adding a non-relative import, weakening same-depth to strictly-greater, making the Phase-1
authority dishonestly claim to be a real verifier, and un-branding `EvidenceRef` (tsc fails).

**Session mutation total: 40 applied, 2 survivors, both found and closed.**

**Final state: battery 147/0 · critical scenario 30/0 · project-wide `tsc --noEmit` 0 diagnostics ·
byte-identity guard 250/0.**

---

## 6. What Phase 2 would require, and its interactions with standing constraints

Phase 2 is the **Epistemic Debt** phase: the debt object as a first-class service, debt calculation,
contradiction tracking, stale-evidence tracking, unresolved-assumption tracking, decision-readiness
checks (spec §21's eight questions, which must **not** reduce to a single threshold score).

**Phase 1 already carries the structured debt object and its summary score**, so Phase 2 is mostly the
calculation and readiness services rather than new state.

**What must happen BEFORE Phase 2 opens:**

1. **R9/R10 handoff reconciliation is OWED** (Q2 ruling). The Cognitive OS `HandoffEnvelope` does not
   supersede R9's handoff design; the two must be reconciled when the actor architecture begins
   consuming these state services. **This is a prerequisite, not a follow-up.**
2. **The table step**, if Phase 2 is to persist anything — with its full data-rights and retention
   obligation (§3.5), founder-walked.

**Standing-constraint interactions Phase 2 will hit:**

- **C7 tightens as Phase 2 makes the debt score real.** The moment debt calculation exists, the score a
  Phase-6 router would read becomes meaningful. The Phase-1 design already forbids any scope writing it;
  Phase 2 must not introduce a write path, and must keep the score **derived**.
- **C8 becomes load-bearing.** Phase 1's egress refusal is currently guarding a score nobody consumes.
  Phase 2 gives it something real to guard. **If the permission model cannot enforce non-export, the
  schema must not produce the scores** (Q9).
- **Spec §21 vs Constraint 4.** The decision gate must produce `DECISION READY` / `DECISION REQUIRES
  REVIEW` **with explicit reasons**, never a threshold score. This is the same discipline as the
  project's own "no score-only reasoning" and should be built structurally, not documented.
- **Weights remain BLOCKED and the S11 flip remains REFUSED.** Nothing in Phase 2 clears either.

**And before Phase 3 — a manifest amendment is OWED** (Q3 ruling), naming the boundary explicitly:
**Phase 3 builds *the queryable record*, NOT *the deepening disposition*,** and claims no continuity of
experience in a morally relevant sense. Nothing is owed at Phase 1 or Phase 2.

---

## 7. Session-conduct disclosures

**Tool mode, and a finding worth your attention.** The session paste predicted this session would
author with `Write`/`Edit` and disclosed that this adds consult records. **The harness's auto-mode
directed authoring via `Bash` heredocs instead**, and Bash is dropped from the consult floor — so this
session added **near-zero consult records**, the *opposite* of what the paste anticipated. The choice
was made on the harness directive and the task's merits, never on the counter. **Quantified at close:
this session wrote 52 window records — 51 guard, and exactly ONE consult.** A Write/Edit-authored
session of the same length would have produced roughly fifty. **The finding: a harness-level tool-mode
setting silently controls whether a session contributes to the gated baseline counter.** That is the S9 structural dependency arriving from a direction nobody named, and it bears
directly on standing founder item **F-K**. Late in the session a rate-limit on the safety classifier
forced two `Edit` calls, which *did* add consult records — the tool mode was moved by infrastructure,
not by judgement, in both directions.

**Harness observations.** The at-action guardrail fired on essentially every action. Most read
`is_kathekon=false, quality=contrary` ("no kathekon factors were extracted"). **Two did not**: writing
`index.ts` and one `Edit` both read `is_kathekon=true, quality=moderate, "role obligation engaged;
justification offered"` — the two actions whose composed text was densest in explicit obligation and
justification language. One consult returned **"no assessment in response"** (an examination that did
not complete; the action proceeded unexamined and is recorded as such). One frame opened a redirection.
The elicitation was answered genuinely at every firing, and one answer changed the work: naming the
stake in the critical test as *"I wrote it, it gates my own work, and I want it to pass"* is what drove
the mutation verification that then found M6 and M9.

**Concurrency.** `ListAgents` at open showed **12 interactive peers + this one**, up from 10 at the
standing opener's writing, against a standing ruling to consolidate. Founder item **F-E**.

**Peer work untouched.** The three files in the tree that are not mine
(`environmental-context.json`, the Condition-2 prompt, the S10 working notes) were never staged, never
read for content, and are unchanged.

---

## 8. State at close

**Phase 1 COMPLETE. The critical first test passes deterministically. Phase 2 NOT STARTED and not
licensed.**

### Verified first-hand at close (re-derived immediately before writing, never quoted)

| Claim | Check | Result |
|---|---|---|
| Byte-identity guard | battery **run** | **250 passed, 0 failed** — armed and green |
| `layer2-mechanisms.ts` SHA pin | `shasum -a 256` | `60cefedb5f4f7882…` — **unchanged** |
| `stoic-brain.ts` SHA pin | `shasum -a 256` | `fa8895ec949b9f6d…` — **unchanged** |
| Any of my paths matching `GUARD_RE` | regex tested, with positive controls | **none** |
| Cognitive OS battery | `npx tsx` | **147 passed, 0 failed** |
| Critical scenario | `npx tsx`, twice-run determinism | **30 passed, 0 failed** |
| Project-wide typecheck | `npx tsc --noEmit` (repo tsconfig) | **0 diagnostics** |
| False-hold buffer | parsed record-by-record | **360** rows; window **221** |
| Baseline days (≥1 consult) | grouped by `capturedAt` UTC day | **3 of 5** (09-06, 09-07, 09-08 UTC) |
| This session's contribution | attributed by the buffer's own `session` field | **52 records — 51 guard, 1 consult** |
| Peer sessions | `ListAgents` | **12 interactive + this one** |
| Vercel / Supabase state | — | **unverified from a repo session** |

Nothing committed, nothing pushed — **the founder commits by name**. No table, no migration, no SQL, no
flag, no credential, no deploy, no harness file, no governing surface amended. The byte-identity guard
is **armed and green (250/0)**; both SHA pins unchanged; `classifyCaller` byte-unchanged; the
observation window ran untouched throughout.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
