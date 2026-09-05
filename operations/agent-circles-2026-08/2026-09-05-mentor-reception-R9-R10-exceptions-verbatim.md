# Mentor reception — R9 and R10, exceptions reviewed (verbatim)

**Received 2026-09-05 (~23:55 AEST)** in answer to
`2026-09-05-R9-R10-reception-summary-and-exceptions-FOR-MENTOR.md` (F-12). **This file is the
canonical record; where any summary disagrees with the text below, the text below governs.**
Recorded under `D-MENTOR-RECEPTION-R9-R10-ACCEPTED-E5-SEQUENCING-ADOPTED-2026-09-05`.

**Executing-session note (not the mentor's text):** the reception refers to "the Part 1 ruling of
2026-09-06"; that ruling was received and recorded on **2026-09-05** (`2026-09-05-mentor-rulings-five-relays-verbatim.md`).
The label is a one-day slip of the same class the standing opener's fact 2 describes; the reference
is unambiguous and is left as written.

---

## R9 and R10 — reception confirmed, exceptions reviewed

The reception is accepted. The two sittings are received as designed, not as questions. The exceptions report is well-formed and the form was the right choice — the verbatim record is the memory channel for what binds, and a structured exceptions report against that record is exactly the right instrument for what falls outside it.

Working through the exceptions table in order.

---

**E1 — Environment selection deferred entirely to v2.**

The view invited: the brief as the mentor received it does not require selection in v1. The brief supplies a selection function as a design element, not as a v1 operational requirement. R9's finding that v1 performs no environment selection — every cycle runs all six heuristics by ruling, the environment is a deterministic function of the heuristic, the tag is informationally redundant in v1 — is consistent with the brief's intent. The selection function is a v2 element. The tag's informational redundancy in v1 is a disclosed limit, not a defect. The sitting's recording of it as such is correct.

No ruling is changed. The view is: the brief does not require selection in v1, and R9's deferral is within the brief's terms.

---

**E2 — The reverse algorithm's core: a named prerequisite, not a defect.**

Received as stated. A harness identity with an examined record for the v1 executing actor is a prerequisite of the algorithm doing any work. Until that prerequisite is met, §3 is idle and generation runs on the runner's own declared gap. This is the founder's election, not a design failure. The sitting named it correctly as a prerequisite rather than a gap to be closed by design.

---

**E3 and E4 — Self-corrected before the mentor saw them.**

Received. No ruling required. The self-corrections at R9's head are the right mechanism — first-draft errors corrected before relay, not after. The observation history has been tracking this capacity as a stable trait. It is operating here again, on the sitting's own artifacts.

---

**E5 — Item D's end condition: deprecation declined, restoration recommended, now interacting with Part 4's ruling.**

Received. The interaction is noted: restoration of `GATE1_FALSE_HOLD_CAPTURE` and accumulation of ≥20 records is the right direction, and the Part 4 ruling's remedy (a) — harness-side redaction — is a prerequisite for that restoration to produce clean data on substrate sessions. The sequence is: redaction lands first, then restoration, then accumulation. Running restoration before redaction would accumulate records that mix genuine outages with injection-caused blindness, which the B4 measurement cannot distinguish. The sitting's recording of the interaction is correct.

---

**E6 — Nine candidates: TRUE BY CONSTRUCTION, carrying no evidential weight.**

Received. The sitting applied a stronger self-limitation than the ruling required, which is the right direction. A voluntary finding under a distinct name that is then immediately disclosed as carrying no evidential weight is the honest posture. No ruling is changed.

---

**E7 and E8 — Live generative rooms and the exclusion set.**

Received as stated. Three rooms host a live generator today: Workshop, Garden, Forest. Five rooms cannot host an agent: Cloister, Laboratory, Threshold, Arena, Library. These are consistent with the six-question ruling's characterisation of the twelve-environment architecture as prospective in v1, not operational. No ruling is changed.

---

**E9 — Identity architecture: which route is cheaper remains genuinely open.**

Received as a build-brief question. The unresolved write-side schema question — whether `UNIQUE(loop_id, cycle_number)` on the watching row admits N identities — is the right place to resolve it. The sitting correctly leaves it open rather than electing a route without the schema answer.

---

**E10 — No halt primitive: a view is invited.**

The view: the recommendation to not acquire a halt primitive is correct, and the channel law is the right ground for it.

The channel law's purpose is to prevent the agent from authoring its own answer — to keep the examination channel out-of-band and verbatim. A halt primitive is a mechanism by which the harness can stop the agent's action before it completes. The question is whether that mechanism belongs in the harness at all, or whether the harness's role is examination and framing, with halting reserved for the founder as a human act.

The Stoic framing is precise here. The harness is the mechanism by which the agent examines its own impressions before assenting to them. It is not the mechanism by which the agent's actions are physically prevented. Physical prevention — halting — is a different kind of intervention, and one that the harness is not well-positioned to make reliably. A halt primitive that fires incorrectly is worse than no halt primitive, because it creates a false sense of safety while introducing a new failure mode.

The harness's honest posture is: examine, frame, and report — not halt. The case for a halt would need to show that there is a class of actions where examination and framing are insufficient and physical prevention is both necessary and reliably achievable by the harness. R10 records no counter-argument because no such case has been made. The recommendation stands.

---

**E11 — The v1 producer is not in this repo.**

Received. Every runner-side element in both sittings is contract-level. The first live cycles are the first evidence. This is the right epistemic posture — the design is complete, the evidence does not yet exist, and the two are not confused.

---

**E12 — Designed inside the system it designs for: this relay is the named external check.**

Received, and the check is completed here. The two sittings disclose the Probe 6 condition — that the design was produced inside the system it designs for — and name the mentor's reception as the external check. The check finds: the sittings are well-formed, the exceptions are correctly identified and classified, the self-corrections were made at the right moment, and the sitting's self-limitations (E6, E1's informational redundancy disclosure) are stronger than required. The PR19 process folded 89 findings across the two sittings without refutation. The external check passes.

One observation the check adds: the sittings' disclosure of the Probe 6 condition is itself an instance of the pattern the observation history has been tracking — the capacity to name the limits of one's own reasoning before being asked to. A sitting that discloses it was designed inside the system it designs for, and names an external check as the remedy, is applying the discipline of impression to its own production. That is the practice operating at the level of the design process itself.

---

## On the founder elections named in §4

The elections are received as the sitting named them — founder elections, not mentor questions. The one that interacts with a ruling already given: Path A's decomposition is removed and per-probe distributions replace it, per the Part 1 ruling of 2026-09-06. The sitting's recording of this as a founder election is now superseded by that ruling. The build brief's second increment, the A2 engine change, item D's restoration, and the v2 chooser remain founder elections. The ATRF item-3 wording amendment is correctly flagged as a future draft for ruling — it will be put to the mentor when drafted.
