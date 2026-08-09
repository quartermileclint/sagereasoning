# Mentor consultation — generation-step scope document: RULED (verbatim)

**Context:** relayed by the founder, 2026-08-09 (AEST), in the same conversation that authored the scope document (`operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md`, offered after its PR19 adversarial review with all six confirmed findings folded — `D-GENERATION-STEP-SCOPE-DOCUMENT-SCOPED-2026-08-09`). The relay carried three instruction sets; this file records **instruction set two of three** — the mentor's rulings on the generation-step scope — verbatim per the project's standing discipline: **verbatim wins** over any summary or paraphrase elsewhere, including the RULED annotations applied to the scope document on the strength of this ruling. Instruction sets one and three (the ATRF governing-document addition and the project-context update) are recorded in the companion file `2026-08-09-mentor-instruction-atrf-and-project-context-verbatim.md`. The mentor's covering instruction, verbatim: *"Record the following as the mentor's rulings on the generation-step scope document (2026-08-09). Update the sequencing to reflect the runner scoping session's confirmed position. Carry the six build-gate review dimensions as stated. Do not editorially adjust any ruling."*

---

**GENERATION-STEP SCOPE DOCUMENT — MENTOR RULINGS (2026-08-09)**

**§1 Settled ground — confirmed in full.**

All twelve items carry forward unchanged. The Q1 hard constraint is confirmed at the exact point of temptation. The QW-A verbatim carry is confirmed complete. The validation/standing-runner boundary is confirmed honoured throughout. Nothing in §1 is re-opened.

---

**§2 Proposals — rulings:**

**§2.1 — Per-heuristic implementation shape confirmed.** Fixed-template / named-input-slots / uniform-output-contract structure confirmed. Three-part template shape confirmed. The knowledge context as a named term confirmed — runner-owned, external by construction, no server read beyond the ruled seams.

**QG-D ruled here:** The generative-only reading is confirmed. Heuristic 5 produces a candidate with genuine reach toward all rational beings; no selection-time weight is applied. A selection-time weight would modify the ruled winner rule (highest proximity among novelty-passers); that rule is not amended. The heuristic's name describes its generative orientation — what kind of candidate it is instructed to produce — not a thumb on the selection scale.

The instruction stanza for heuristic 5 should read faithfully to: *"given the gap, what action would address it in a way that has genuine reach toward all rational beings, not only immediate project needs?"* Output: one candidate with `virtue_domain` classification. No weighting at selection. Row is now settled.

The deliberately-not-an-input list confirmed in full. Seven template executions per normal-mode cycle, one candidate per template, confirmed.

**§2.2 — Candidate pool size confirmed.** Normal-mode pool of up to seven candidates confirmed as the fixed per-pass count. Task-list outage in normal mode → friction candidate to `dependency_unavailable` at candidate level, cycle proceeds on six — confirmed per QW-A(ii).

**QG-B ruled:** One candidate per qualifying friction point, capped at seven per cycle, in friction-only mode confirmed. The one-per-heuristic rule governs normal mode; in friction-only mode friction is the sole active mechanism and a single-candidate pool makes the filtering pass degenerate. The cap at seven keeps the cost profile inside the ruled normal-mode shape. The textual tension resolves in favour of one-per-friction-point in friction-only mode — the one-per-heuristic rule was written for a context where friction is one of seven heuristics, not the sole active mechanism. This is not an amendment to the ruled mechanism; it is the correct application of the mechanism's purpose to a mode the original text did not explicitly address.

**§2.3 — Friction-detection threshold confirmed.** Qualitative and binary in v1 confirmed. Three-slot operational test confirmed — task, specific step, which marker. Dedup guard on `assessedAt` confirmed as a required structural element, not optional discipline. Numeric-threshold deferral to validation-run data confirmed.

**§2.4 — Phantasia-variation mechanism confirmed.** One random draw per cycle used twice confirmed. Additive-only jitter confirmed. Deterministic per-cycle permutation applied to presentation order and selection only confirmed. Confinement list confirmed and carried into §2.11 as a required review dimension. Single-seed reproducibility confirmed as a build requirement.

**§2.5 — All five configuration defaults confirmed as validation-run defaults.**

| Parameter | Confirmed default |
|---|---|
| `loopId` | No default value — convention: `{k1AgentId}#{instance}`, e.g. `sagereasoning:idea-loop@v1#001`. Assigned at instantiation, immutable for the instance's life, uniqueness the runner's responsibility. |
| `minimumInterval` | 14,400,000ms (4 hours) |
| `maximumDuration` | 1,800,000ms (30 minutes). Hard ceiling, not a soft target. |
| `randomOffsetPercent` | 20 |
| `minimumIncubationInterval` | 3,600,000ms (1 hour). Subordinate to `minimumInterval` — throttle stays binding, incubation guaranteed-but-not-dominant. |

**§2.6 — Null-cycle rule's architectural enforcement confirmed.** All three structural layers confirmed. Discriminated-union return type `{ kind: 'winner', candidate } | { kind: 'null_cycle' }` confirmed — forbidden state unrepresentable, not discouraged. Full-examination call inside winner branch only confirmed. Battery pin including mutation check confirmed as a named build requirement carried into §2.11.

**§2.7 — loopId / sessionId trust-event composition.**

**QG-C ruled:** Option (a) confirmed — additive optional `loop_id` request field on `/api/reason`, stamped by the server into the orientation event payload as `loopId?`, following the B5 `session_marker` precedent exactly. Composition confirmed: two identifiers on the same event as separate fields, never concatenated, both independently visible. Passthrough-label reading confirmed — `loopId` is the deliberate exception the ruling created; the never-sees line governs the four timing parameters whose enforcement is the runner's alone. AI-authored docstring characterisation accepted as a faithful paraphrase presented as such. Additive server change at the first build gate confirmed as inside the ruled Phase-5 sentence.

**§2.8 — Cycle composition, call order, timeout, write position confirmed.** Six-step order of operations confirmed. Invariant confirmed: unexamined candidates never enter the novelty batch and can never win — carried into §2.11. Full synchronous shape for winner's consult (no `assessment_first`) until a retrieval seam exists confirmed as a constraint, not a preference. Timeout handling confirmed — `maximumDuration` bounds steps 1–5; record write executes outside the ceiling.

**§2.9 — Validation-run shape confirmed.** Founder-attended run confirmed. 20–40 completed cycles confirmed as target range. Brief §6 ruled report shape confirmed as deliverable. Standing-runner boundary confirmed as binding.

**Sequencing observation confirmed and made explicit:** The runner scoping session sits between the first build gate and the bounded validation run. The Q11 sequence is amended as follows and is now binding:

Brief ruled → `fresh` scoped and ruled → `watching` scoped and ruled → generation-step scoped and ruled → **first build gate** → **runner scoping session** (credential, identity, `watching_write` provisioning, `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger) → **bounded validation run** → only then any standing-runner design.

The runner scoping session is no longer floating — it has a named position.

**§2.10 — What the generation step does not do — confirmed in full.**

**§2.11 — Required review dimensions — confirmed, with one addition.** The original five are confirmed. A sixth is added per the QG-C ruling:

6. The additive `loop_id` field on `/api/reason` correctly implemented per the B5 `session_marker` precedent — optional declared field, validated flag-on, malformed → 400, ignored flag-off, byte-identical behaviour verified.

---

**Open questions — rulings:**

**QG-A — Guardrail fail-closed handling ruled.**

The four failure classes are confirmed as observably distinct. The `ambiguous_pause` Tier-1 conservative pause is a genuine gate verdict on an examined-but-ambiguous action — confirmed as honest `rejected_by_guardrail`, not a failure.

Option 1 ruled out. Recording a refusal that never examined is a false impression to the loop's own operator. It poisons the dashboard's guardrail-calibration reading.

Option 2 confirmed — `dependency_unavailable` with `unavailableDependency: '/api/guardrail'` — for all four never-examined classes: HTTP 503, HTTP 500, network-level failure/timeout, and the served `engine_unavailable` 200 fallback. The QW-A logic extends naturally. The `unavailableDependency` companion field distinguishes task-list-outage from examination-seam-outage without CHECK widening.

Option 3 not adopted now. Not ruled out for future consideration if validation-run dashboard readability data shows the distinction is needed at a glance.

Sub-question rulings:

(i) Partial failure: affected candidates take `dependency_unavailable`, assessed survivors proceed. Total failure: cycle-level outcome reads `dependency_unavailable`. Extension of QW-A(ii) from generation-side to examination-side unavailability confirmed.

(ii) The served `engine_unavailable` 200 fallback classifies with the HTTP failures — confirmed. It is in the never-examined class.

(iii) One bounded retry per failed call within `maximumDuration` before outcome is recorded — confirmed. One retry, then record.

(iv) Invariant confirmed as a build requirement: a candidate without a gate verdict never enters the novelty batch and can never win.

**QG-B:** Ruled above — friction-only mode generates one candidate per qualifying friction point, capped at seven per cycle.

**QG-C:** Ruled above — option (a) confirmed.

**QG-D:** Ruled above — generative-only reading confirmed.

**Ownership statement on `frictionAssessment` PM-tool mapping:** Confirmed as assigned to the runner scoping session.

---

**Sequencing confirmation:**

Generation-step scope: ruled. The amended Q11 sequence above is now binding. The first build gate is its own election — which of `fresh` / `watching` / the generation-side runner code builds first is not pre-decided. The Q6 seventh-value code follow-up rides the first code session touching `idea-loop-types.ts`. Nothing in these rulings licenses a build, a route, a flag, a credential, or a schema.

---

**Runner scoping session carry-forwards (four confirmed items):**

1. `watching_write` capability provisioning
2. Dedicated identity mint with 6e §A owner+agent binding
3. `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger
4. `frictionAssessment` PM-tool mapping question

---

**Add one new entry at the top of the Recent list:**

2026-08-09: Generation-step scope document ruled. QG-A: `dependency_unavailable` with `unavailableDependency: '/api/guardrail'` confirmed for all never-examined failure classes; option 1 ruled out; one bounded retry confirmed. QG-B: friction-only mode generates one candidate per qualifying friction point, capped at seven per cycle. QG-C: option (a) confirmed — additive `loop_id` field on `/api/reason` per B5 precedent. QG-D: generative-only reading confirmed for heuristic 5 — no selection-time weight. Q11 sequence amended: runner scoping session confirmed between first build gate and bounded validation run. Six build-gate review dimensions confirmed (fifth: Q1 line verified in code review; sixth: `loop_id` field per B5 precedent). Nothing in these rulings licenses a build, a route, a flag, a credential, or a schema.

---

**Do not change anything else.**

---

*Application note (not part of the ruling):* the Recent-list entry above is the same entry instruction set three names as its second Recent-list item; the union is applied once via instruction set three's ordering (disclosed in `D-GENERATION-STEP-SCOPE-RULED-2026-08-09`).
