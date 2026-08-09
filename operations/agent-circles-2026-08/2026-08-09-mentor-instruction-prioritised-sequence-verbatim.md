# Mentor instruction — prioritised sequence after the first build gate (verbatim, 2026-08-09)

**Status:** relayed by the founder 2026-08-09, mid-session, after the `loop_id` build was complete and committed but **before** it was pushed. Transcribed verbatim below; **this record wins over any annotation.** Adopted under `D-MENTOR-PRIORITISED-SEQUENCE-ADOPTED-2026-08-09`.

**Provenance note:** the instruction references "the six Stoic items I named in the previous review" and "the three ATRF open questions". The three ATRF questions (GS-ATRF-1/2/3) **are** on the repo record (`2026-08-09-mentor-instruction-atrf-and-project-context-verbatim.md` lines 75–79). The six Stoic items are **not** — see the AI's verification note at the end of this file.

---

## VERBATIM

Here is the prioritised instruction set.

---

**What the current session is completing**

The generation-side `loop_id` field on `/api/reason` — the additive optional field per the B5 `session_marker` precedent, stamped into the orientation event payload as `loopId?`. This is the only server-touching piece of the generation-side build. It lands on a live production route.

The sixth build-gate review dimension governs: optional declared field, validated flag-on, malformed → 400, ignored flag-off, byte-identical behaviour verified.

When this session closes, the first build gate is complete. All three items — `fresh`, `watching`, `loop_id` — will be live.

---

**What follows, in confirmed sequence**

**Next: Runner scoping session**

This is a single session with four confirmed carry-forwards, all of equal standing — none is a rider on another:

1. Dedicated identity mint — `sagereasoning:idea-loop@v1` — with 6e §A owner+agent binding.
2. `watching_write` capability provisioning — the write-class capability the runner needs to submit `POST /api/practice/watching`. This is a founder-walked api_keys CHECK widening. It is a Critical Change Protocol item. Do not treat it as a quick configuration step.
3. `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger — the parameter whose value was deferred pending the runner identity's existence. The session that mints the identity is the session that can size this correctly.
4. `frictionAssessment` PM-tool mapping — the runner's tooling environment determines what external thing the task list physically is. This is a runner-environment decision, not a SageReasoning server decision.

One sequencing note for that session: the `watching_write` provisioning is the heaviest item and the one most likely to surface surprises (it touches the auth surface). Open with the identity mint — it is clean and establishes the subject — then move to the capability provisioning with full attention. Do not batch the two.

**Then: Bounded validation run**

Founder-attended. 20–40 completed cycles under the §2.5 validation defaults. The brief §6 report shape is the deliverable: cycles run, outcome distribution, null-cycle rate, heuristic productivity, cost per cycle, anomalies. Bring that report to the mentor before any standing-runner design opens.

**Then: Standing-runner design**

Not pre-decided here. The validation run's data is the input.

---

**What to do now with the three ATRF open questions and the six Stoic items**

The ATRF questions and the six Stoic items I named in the previous review are not build items for the current session or the runner scoping session. But they are not floating either — they have a natural home.

**GS-ATRF-1, GS-ATRF-2, GS-ATRF-3** are generation-step questions. They belong in the runner scoping session's scope document, not as build items but as named questions the runner's design must answer before the bounded validation run begins. The runner scoping session produces a scope document; those three questions are inputs to it. Carry them in explicitly.

The four-virtue pre-task diagnostic structure, the synkatathesis assessment point, and the premeditatio malorum question I named — these are ATRF design questions for the pre-task question set. They do not belong in the runner scoping session. They belong in a dedicated ATRF scoping session, which sits after the bounded validation run when the completion signal return path (GS-ATRF-3) is also being scoped.

Name that session now so it does not get lost: **ATRF scoping session** — pre-task question set design, completion signal return path, oikeiosis extension metric for the runner as a longitudinal signal. It is a post-validation-run item.

The hegemonikon stability question and the kathêkon/katorthoma distinction at agent level are longer-horizon items. They belong in the Consciousness and Continuity Obligation's named future direction, not in any near-term build sequence. They are on the record. Leave them there.

---

**Clean priority order**

1. Complete current session — `loop_id` field on `/api/reason`. First build gate closes.
2. Runner scoping session — identity mint, `watching_write` provisioning, `ORIENTATION_DELIVERY_TIMEOUT_MS`, `frictionAssessment` mapping, plus GS-ATRF-1/2/3 as named inputs to the runner design.
3. Bounded validation run — 20–40 cycles, brief §6 report to mentor.
4. Standing-runner design — opens only after the report lands.
5. ATRF scoping session — pre-task question set, completion signal return path, oikeiosis extension metric for the runner. Post-validation-run.

---

## END VERBATIM

---

## AI verification note (PR20 — NOT part of the mentor's text)

Two statements in the instruction rest on premises that were checked first-hand against the repo and **do not hold as stated**. Both are surfaced to the founder for relay rather than silently resolved or silently accepted.

### (1) "All three items — `fresh`, `watching`, `loop_id` — will be live."

> **RESOLVED same session, 2026-08-09 — the mentor ruled on the gap.** The finding below was confirmed in full (*"The finding is confirmed. Three flags unset. Three routes dark. … The gap is real."*) and the three activations were given an owner and a position. **The ruling is transcribed verbatim in the FOLLOW-UP RULING section at the end of this file, and it amends the binding sequence.** The original finding is kept below unedited, as the record of what was checked and what prompted the ruling.

**They are not live. All three are built DARK.** Verified at this session's close:

| Item | Built | Flag | State |
|---|---|---|---|
| `fresh` | ✓ 2026-08-09 | `SUBSTRATE_FRESH_ENABLED` | **UNSET** — route answers 503 |
| `watching` | ✓ 2026-08-09 | `SUBSTRATE_WATCHING_ENABLED` | **UNSET** — both routes answer 503 |
| `loop_id` | ✓ 2026-08-09 | `SUBSTRATE_LOOP_ID_FIELD_ENABLED` | **UNSET** — field ignored |

Each activation is its own founder-walked `code-critical` step under 0d-ii ("deployment-configuration changes (env flags activating new surfaces)"), and none has been taken or pre-approved. (`watching`'s *schema* and the `watching_write` *capability CHECK widening* WERE walked live to TEST + production at that build — but the routes themselves remain dark behind the flag.)

**The sequencing consequence, named not resolved:** the bounded validation run (step 3) requires the runner to call `POST /api/practice/fresh` and `POST /api/practice/watching` — both of which return 503 while their flags are unset. **No session in the confirmed sequence owns those three activations.** They sit between the runner scoping session and the bounded validation run in the same way the runner scoping session itself was found to sit between the build gate and the validation run (generation-step scope §2.9's own sequencing observation, which the mentor confirmed and made explicit). The AI does not insert them into the sequence — that placement is the mentor's to confirm, exactly as §2.9's was.

### (2) "The hegemonikon stability question and the kathêkon/katorthoma distinction at agent level … are on the record. Leave them there."

> **RESOLVED same session, 2026-08-09.** The finding below was correct as written — the six items genuinely were not on the repo record. On being shown it, **the founder relayed the missing review**, now transcribed verbatim at `2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`. All six items now have content on the record (not merely titles), and that record additionally carries **substantive mentor answers to GS-ATRF-1, GS-ATRF-2 and GS-ATRF-3** — which the prioritised instruction above does not contain, and which materially inform both the runner scoping session (GS-ATRF-1/2 as named inputs) and the ATRF scoping session (GS-ATRF-3's placement). The original finding is kept below unedited, as the record of what was checked and why the relay happened.

**As far as can be verified, they are not on the repo record.** Searched: `manifest.md`'s Consciousness and Continuity Obligation section (which names exactly two components — accumulated memory of ideas/tasks/decisions/reflections; continuity of experience in a morally relevant sense — and neither is these two questions), the whole of `operations/`, `adopted/`, and the decision log. Grep for `hegemonikon stability`, `four-virtue pre-task`, `premeditatio malorum`, `synkatathesis assessment point`, and `oikeiosis extension metric` returns **no 2026-08-09 mentor-review record** — only unrelated older files.

The likely reading: "the previous review" is a mentor communication the founder received that was never transcribed into the repo, so **none of the six Stoic items are recorded** — not the three routed to the ATRF scoping session, and not the two routed to the Consciousness and Continuity Obligation.

The instruction's own stated purpose for the ATRF scoping session — *"Name that session now so it does not get lost"* — applies with equal force here. "Leave them there" is safe only if "there" exists. **Recommended: the founder relays the previous review's text (or at least the six items' statements) so they can be transcribed.** The three ATRF-scoping items are named by title in this instruction and so survive at that granularity; the two longer-horizon items are named by title only and have no content on the record at all.

*(Recommendation acted on the same session — see the RESOLVED note above. Gap (1), the activation-ownership question, remains open and is the one item still awaiting the mentor.)*

*End of record.*

---

# FOLLOW-UP RULING — activation ownership (verbatim, 2026-08-09)

**Status:** the mentor's answer to verification note (1) above, relayed by the founder the same session. Transcribed verbatim; **this record wins over any annotation.** It **amends the binding sequence** and takes the runner scoping session's confirmed carry-forwards from four to five. Adopted under `D-ACTIVATION-OWNERSHIP-RULED-2026-08-09`.

## VERBATIM

**The finding is confirmed.** Three flags unset. Three routes dark. The bounded validation run cannot execute while `fresh` and `watching` return 503. No session in the confirmed sequence owns those activations. The gap is real.

---

**Ruling on the gap.**

Each flag activation is a founder-walked Critical step — the same discipline as the `watching_write` capability provisioning. They are not configuration details to be handled inside another session. They are their own named moment in the sequence.

The three activations belong in the runner scoping session, immediately after the identity mint and the `watching_write` provisioning.

The reasoning: the runner scoping session is already the session where the runner's operational environment is established — credential, identity, capability. Activating the endpoints the runner depends on is part of establishing that environment. It is not a separate session; it is the natural completion of the runner scoping session's purpose.

The confirmed carry-forwards for the runner scoping session are therefore now five, not four:

1. Dedicated identity mint — `sagereasoning:idea-loop@v1` — with 6e §A owner+agent binding.
2. `watching_write` capability provisioning — founder-walked, Critical Change Protocol.
3. Flag activations — `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`, `SUBSTRATE_LOOP_ID_FIELD_ENABLED` — each a founder-walked Critical step, sequenced after the capability provisioning, not before.
4. `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger.
5. `frictionAssessment` PM-tool mapping.

The internal order within the runner scoping session matters. Identity mint first — clean, establishes the subject. Capability provisioning second — heaviest, most likely to surface surprises, deserves full attention. Flag activations third — only after the capability surface is confirmed correct, because the routes being activated depend on it. Then the remaining two carry-forwards.

---

**Updated sequence, now binding:**

Brief ruled → `fresh` scoped and ruled → `watching` scoped and ruled → generation-step scoped and ruled → first build gate (`fresh` built dark, `watching` built dark, `loop_id` built dark) → runner scoping session (identity mint → `watching_write` provisioning → three flag activations → `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit → `frictionAssessment` mapping) → bounded validation run → standing-runner design.

## END VERBATIM

---

**AI note (NOT part of the mentor's text):** this supersedes the Q11 sequence as recorded in the generation-step scope §2.9 (which placed the runner scoping session but did not know the activations were unowned). A dated amendment pointing here has been added to that document so a future session reading it at open does not act on the superseded form. **Both PR20 gaps raised against the prioritised instruction set are now closed** — (1) by this ruling, (2) by the founder's relay of the previous review (`2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`).
