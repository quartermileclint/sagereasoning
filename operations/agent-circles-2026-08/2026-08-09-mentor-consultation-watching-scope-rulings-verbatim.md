# Mentor consultation — `watching` (per-cycle record table) scope: RULED (verbatim)

**Context:** relayed by the founder, 2026-08-09 (AEST), in direct response to the scope document `operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md` (offered at the predecessor session's close, after its PR19 adversarial review with all eight confirmed findings folded and disclosed — `D-WATCHING-PER-CYCLE-RECORD-TABLE-SCOPED-2026-08-09`). Recorded here verbatim per the project's standing discipline for mentor consultations — **verbatim wins** over any summary or paraphrase elsewhere, including the RULED annotations applied to the scope document on the strength of this ruling. The `watching` records commit (`36e42bd`) was already pushed before the ruling arrived, so this fold is its own records commit, each fold citing this record.

---

**§1 Settled ground — confirmed:**

All eight items carry forward unchanged. The two-table shape resolves the cycle-level / candidate-level tension cleanly. The external-state ruling and the fresh endpoint's stateless posture coexist without tension as the document correctly states. Nothing in §1 is re-opened.

---

**§2 Proposals — rulings:**

**§2.1 — Schema shape:** Two tables confirmed: `idea_loop_cycles` + `idea_loop_candidates` with FK → cycle ON DELETE CASCADE. The denormalised alternative is correctly set aside — update anomalies on timeout/cost fields that are only known at cycle end are a real defect, not a theoretical one. The proposed columns are confirmed as a build-time starting point with the ruled fields fixed. The compatibility note on guardrail fail-closed handling is correctly deferred to the generation-step scope document — the nullable fields and CHECK vocabulary are the right posture for a table that must represent whatever that document rules.

**§2.2 — Outcome vocabularies:** Candidate-level seven-value CHECK confirmed: `pending | rejected_by_guardrail | rejected_by_novelty | winner | null_cycle | dependency_unavailable | terminated_by_timeout`. Cycle-level four-value CHECK confirmed, and QW-C is ruled here: **`terminated_by_timeout`** is confirmed as the uniform spelling for the cycle-level token. Q5's verbatim list uses "timeout" as a field description, not a token specification. Uniformity with Q6's ruled candidate-level value is the correct principle — a CHECK constraint that uses two different spellings for the same semantic concept across two related tables is a latent defect. The token is `terminated_by_timeout` at both levels.

The `pending` value discipline is confirmed — a `pending` row should never appear in a completed cycle's record. If the runner writes mid-cycle snapshots in future, that is a new question; the current proposal of one write per completed cycle is correct.

**§2.3 — Write path and QW-B:** POST /api/practice/watching confirmed. Handler-split confirmed. Bearer-only confirmed. One call per completed cycle confirmed.

QW-B: **A dedicated `watching_write` capability added to the write-class set is confirmed** — the AI's recommendation is correct. The reasoning is precise and the document states it well: `fresh` computes and stores nothing; `watching` writes the durable record the founder's calibration judgement reads. The granularity argument that was unnecessary for a read seam is exactly the standing house reason write surfaces are classed separately. The cost — a founder-walked `api_keys` CHECK widening, the `WRITE_CLASS_CAPABILITIES` constant, and mint-surface support — is the right cost to pay for a surface that leaves durable rows. Reusing `consult` would invert the house discipline that distinguishes writes precisely because they are durable. Option 3's named alternatives (existing write-class values) are correctly set aside as semantically false.

Carry forward to the runner scoping session: the `watching_write` capability must be provisioned on the runner credential at that session. The 6e §A owner+agent invariant will require owner+agent binding at mint — that session satisfies it.

**§2.4 — Read path:** GET /api/founder/watching confirmed. Founder-facing dashboard page confirmed following the founder-hub pattern. `FOUNDER_USER_ID` Bearer JWT confirmed — this is the founder's operational dashboard, same audience and sensitivity class as founder-hub. The standing discipline of naming which admin gate a new surface uses rather than assuming it is correctly applied.

**§2.5 — Honesty posture:** All four honesty posture items confirmed. The runner-composed disclosure rendered on the dashboard (not just documented in the schema) is confirmed as a build requirement, not optional — this is carried into §2.10's required review dimensions. `maximum_duration_ms` as runner-declared configuration, recorded as declared and disclosed as such, is confirmed. Traceability as affordance not gate is confirmed — the write is not refused for missing refs.

**§2.6 — loopId and sessionId composition:** Confirmed as proposed. The two identifiers remain separate and both visible. The boundary with the generation-step scope document on trust-event composition is correctly kept.

**§2.7 — Retention and data-rights posture:** Full house discipline from the start confirmed — `collaboration_records` precedent, not the deferred-rider posture. `retain_until` 90-day confirmed. `owner_user_id` FK → profiles ON DELETE CASCADE confirmed. `/api/user/delete` + `/api/user/export` + trust-core retention sweep wiring at build confirmed. `/api/credential/erase` coverage confirmed as cheap and correct regardless of the runner credential's ownership shape, which the runner scoping session fixes.

**§2.8 — Flag posture:** `SUBSTRATE_WATCHING_ENABLED` confirmed, UNSET everywhere, honest 503 on both routes. Migration authored at build and applied founder-walked before any flag flip confirmed — the migration-before-flag order is standing discipline. Activation is its own founder-walked code-critical step at or after the first build gate.

**§2.9 — What watching does not do:** All items confirmed. The settled statement on no trust-event write carries with equal force from the fresh ruling. The counter non-enforcement is confirmed — the table records outcomes and mode; QW-A's answer governs the runner's counting, not any table logic.

**§2.10 — Required review dimensions:** All four confirmed and carried. The runner-composed disclosure rendered on the dashboard is added explicitly as a fifth: (5) the `watching_write` capability correctly provisioned and the write-class discipline verified end-to-end at build.

---

**Open questions — rulings:**

**QW-A — dependency_unavailable / fallback-counter distinction:** Both parts ruled together because they are logically connected.

**(i) The counter question:** Option (c) confirmed — pass transparently; the chain neither advances nor resets. The AI's analysis is correct and the perversity of option (a) is real, not theoretical. The counter's purpose is detecting novelty exhaustion of heuristics 1–6. A dependency outage carries no information about novelty. Counting it toward the trigger would mean an infrastructure failure could push the loop toward friction-only mode — the exact mechanism whose dependency failed. Option (b) is equally wrong in the other direction: a sustained outage could silently erase evidence of genuine novelty exhaustion by repeatedly resetting the chain. Option (c) is the only reading that keeps the counter honest about what it is measuring.

**(ii) Cycle-level semantics:** The proposed reading is confirmed — the cycle-level outcome reads `dependency_unavailable` only when no active heuristic could produce an assessable pool. In normal mode a task-list outage is candidate-level only and the cycle outcome comes from the other six heuristics. In friction-only mode, friction is the sole active mechanism and its dependency is down, so no assessable pool is possible — the cycle-level outcome is `dependency_unavailable`. Under (c) and this reading, a friction-only-mode `dependency_unavailable` cycle neither satisfies nor disturbs the fallback-exit condition. It is not a non-null result from an active mechanism. It is not a null cycle. It is a third thing — an honest record of infrastructure unavailability — and the counter treats it as transparent.

Carry this ruling into the generation-step scope document and the runner scoping session as settled ground.

**QW-B:** Ruled above — `watching_write` dedicated capability confirmed.

**QW-C:** Ruled above — `terminated_by_timeout` uniform spelling confirmed at both cycle and candidate level.

No other questions remain open in this scope.

---

**Sequencing confirmation:**

watching scope: ruled. Next item: generation-step scope document. The first build gate does not open until the generation-step scope document is ruled. Nothing in this ruling licenses a build, a route, a flag, a credential, or a schema.

Two carry-forwards for the generation-step scope document: (1) QW-A's ruling on dependency_unavailable / counter semantics is now settled ground and should be carried verbatim; (2) the brief's §3 item 1 — how the runner handles a guardrail call that fails closed — remains open and must be surfaced in the generation-step scope document as a named question, not resolved by default. The candidate row's nullable guardrail fields are ready to represent whatever that document rules.

One carry-forward for the runner scoping session: the `watching_write` capability must be provisioned on the runner credential; the 6e §A owner+agent invariant requires owner+agent binding at mint; that session satisfies it.
