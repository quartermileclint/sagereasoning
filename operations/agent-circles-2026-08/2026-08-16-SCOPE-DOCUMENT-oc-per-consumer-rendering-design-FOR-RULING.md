# SCOPE DOCUMENT — O-C per-consumer rendering: the design session's own scope (for mentor ruling)

**Date:** 2026-08-16. **Produced by:** the post-R1 arc-continuation session, opened under
`operations/handoffs/founder/2026-08-16-post-R1-arc-continuation-NEXT-SESSION-PROMPT.md`, itself
routing to the O-C scoping session named in `2026-08-15-concurrent-arc-plan.md` (D/O-C). **Gate:**
this is **Gate 2** of the three-gate chain the mentor set 2026-08-16
(`2026-08-16-mentor-ruling-oc-scoping-license-verbatim.md`) — *"Gate 2: O-C scoping session runs
(AI-run, documents-only, M2 shape), produces a scope document, returns for mentor ruling. No
design is produced at this gate — only the scope document."* **Gate 1** (the §6 report compiled
and ruled on) discharged the same day
(`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`, report at
`2026-08-16-idea-loop-S6-report.md`). **Gate 3** (the design session itself, producing a design
document for its own ruling) is what this document scopes — it does not run Gate 3, and it does
not answer any of Gate 3's questions.

**Status: FOR RULING.**

**Input records:** `2026-08-15-SCOPE-DOCUMENT-layer3-per-consumer-rendering-FOR-RULING.md` (the C3
scope document — L-1 through L-5, RULED as Ruling Set D) and its own input,
`2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md` (as amended 2026-08-14). This
document does not re-litigate L-1 through L-5 — those are closed. It scopes the ONE item Ruling Set
D opened but explicitly declined to license: O-C, *"a design question only… not licensed by this
ruling… requires a separate scoping session, which itself requires a ruling before execution"*
(L-1, verbatim). **This document is that separate scoping session's output.**

> **⚠ `SUBSTRATE_LAYER3_ENABLED` remains UNSET, live-verified 2026-08-15 at the C3 session and
> unchanged since (no commit since touches `layer3-service.ts`, `layer3-prose.ts`, or
> `/api/substrate/layer3/route.ts` — confirmed by `git log` at this session's open). Its activation
> is a founder-walked step and is NOT licensed by this document, by the design session it scopes,
> or by any ruling on either short of an explicit activation ruling plus the founder-walked 0c-ii
> step.** Restated at the mentor's standing instruction, carried through both prior documents in
> this chain.

**Why `governance` and not `code-elevated`:** this document scopes a future design session; it
proposes no code, sets no flag, and answers none of the design questions it names.

---

> **✅ ANSWERED 2026-08-23 — all five questions RULED; Gate 3 licensed conditionally.** Verbatim
> record, which wins over this document and every summary:
> `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-oc-gate2-verbatim.md`
> (`D-MENTOR-RULINGS-OC-GATE2-ADOPTED-GATE3-LICENSED-2026-08-23`). Headlines: Q1 agenda order
> (c) → (d) → (a)/(b)/(e), with (a)/(b)/(e) on existing architectural material only; Q2 yes — L-5's
> discipline is the confirmed generalisation candidate; Q3 B/R-6 and O-C are genuinely distinct, the
> practitioner-audience question IS in scope, with the transport-level honest-limit constraint
> inherited; Q4 the nine-candidate classification stays R8's gate — Gate 3 designs from the one
> verified instance's class and degrades gracefully; Q5 the caveat is carried by this document, with
> the ruled one-sentence form at every point of citation in Gate 3's design document. **Gate 3 opens
> on founder election** under the five rulings as its agenda; every §5 constraint inherited
> verbatim; `SUBSTRATE_LAYER3_ENABLED` stays unset — activation is not licensed.

## 1. The question this document answers

Not "what should an agent-calibrated rendering contain" — that is Gate 3's question, and Gate 3
does not open from this document; it opens from a ruling on this document. This document answers:
**given the real usage data the §6 report now supplies, what should the design session's own
agenda be, and in what order should it take up the five inherited distinction dimensions (Ruling
Set D, L-2)?**

The mentor's own sequencing rationale for gating O-C behind the §6 report names three data
classes: *"proximity distributions, delivery classifications, passion readings, the cross-endpoint
asymmetries named in the cycle 10–18 review"* (`2026-08-16-mentor-ruling-oc-scoping-license-
verbatim.md`). §2 below verifies each of those four against the §6 report and, where the report
itself only summarises, against the run log it distils. §3 maps each data class onto the L-2
dimensions it bears on, and states — as a scoping question for Gate 3, not an answer — which
dimensions the data can inform and which it cannot.

---

## 2. The real usage data, verified against its sources

### 2.1 Proximity distributions

The run's outcome distribution (§6 report §2): 15/20 cycles `winner` (75%), 3/20
`dependency_unavailable` (15%), 2/20 `null_cycle` (10%). Of 120 total candidates generated across
the run, 9 were rejected by the guardrail at the `reflexive` floor and 37 failed novelty; 74 passed
both gates (§6 report §7). **This is proximity-outcome data from the agent practitioner's actual
consult traffic** — the run's runner is a real, credentialed agent practitioner
(`sagereasoning:idea-loop@v1`) consuming `/api/reason` and `/api/guardrail` exactly as any other
agent caller would, not a synthetic fixture.

### 2.2 Delivery classifications

The §6 report §12 gives the orientation-reading delivery-class split directly: **22 orientation
events on the runner's agent_id, 19 classed `observed`, 3 classed `examined`** (`~86%`
`observed`) — a direct, DB-derived measurement of how often a real agent consult's own examination
completes within the `ORIENTATION_DELIVERY_TIMEOUT_MS` bound versus not. This is delivery
classification in the literal sense the mentor named it: not proximity (what was decided) but
**how the decision itself was delivered and classified** — directly bearing on what the rendering
can honestly claim the agent practitioner "sees" of its own examination.

### 2.3 Passion readings

The heuristic productivity table (§6 report §4) is passion/heuristic-level data: h7
(`friction_detection`) won 5/15 (33%), but the corrected win-record split (§6 report, h7's
subsection) shows **zero of those five were won by out-scoring a contested field on proximity** —
four were tie-breaks, one was an empty-field default. h5 (`fifth_circle_weighting`) never won
despite being the standing highest-reach, highest-irreversibility candidate throughout (§6 report
§7, the reach-vs-irreversibility finding, mentor-flagged as *"beyond the run's designed
measurements"*). Both are passion/heuristic-level readings of what the candidate-generation and
selection machinery actually produced, not proposals about what a rendering should say.

### 2.4 Cross-endpoint asymmetries

Verified first-hand against the run log this session (`RUN-LOG.md:422-437`, the B7 ruling, 2026-08-11
— not itself reproduced in the §6 report, which names it only in passing at §9's B7 mention): **a
standing, per-cycle mechanism, in force from cycle 6, that compares the `/api/guardrail` extraction
and the `/api/reason` extraction of the SAME winner action text** — element counts per category
(`control_filter_elements`, `oikeiosis_circles_engaged`, `kathekon_factors`), the virtue-domain set,
and the resulting proximity, on both readings. This is the run's own, already-running answer to a
narrower version of the question O-C's dimension (c) asks: **when the same agent practitioner
action is read by two different endpoints, do the two readings agree, and if not, is the divergence
disclosed anywhere the practitioner can see it?** The mechanism as it stands is a founder-facing
diagnostic (per Ruling Set D's B/R-6, *"read-side, founder-facing run-analysis only; never surfaced
to the agent or the public record"*) — it exists and runs, but nothing in the current architecture
renders its findings back to the practitioner whose action produced them.

### 2.5 What this data is, and is not

All four classes above are **behavioural evidence from one real agent practitioner's real
20-cycle consult history**, not a design proposal and not a survey of practitioner preference. The
run is a single credentialed loop identity; it is not a sample of agent practitioners in general,
and its own §6 report names the limits on generalising from it (the null-owner/session-boundary
constraints on h6, the run's own two-period split at cycle 11). Gate 3 should treat this as **one
concrete, verified instance** of what an agent practitioner's consult experience currently looks
like — sharpening the design questions with a real case, not licensing an inference to "how agent
practitioners in general experience the surface."

---

## 3. Mapping the data onto the five inherited dimensions (L-2) — for Gate 3's agenda, not for its answer

Ruling Set D's L-2 ruled all five dimensions in scope for O-C and named dimension (c) — the honesty
dimension — load-bearing and first. This section states, for each dimension, whether the §6 data
bears on it directly, indirectly, or not at all — a scoping judgement about **what evidence Gate 3
has to reason from**, not a design judgement about what to build.

- **(c) Which interior-access presumptions the language makes — LOAD-BEARING, DIRECTLY EVIDENCED.**
  Three independent data points converge here. The delivery-classification split (§2.2) shows the
  agent practitioner's own examination completing outside the observed timeout bound 14% of the
  time (3/22) — a real, measured instance of the gap between what the system did and what the
  practitioner can be told it did within a bounded window. The cross-endpoint check (§2.4) is the
  architecture's own standing acknowledgment that two readings of the same action can diverge, with
  the divergence currently visible to no one but the founder. Cycle 3's production contamination
  (§6 report §2 — *"a served-200 response, plausible and well-formed, but substantively wrong"*) is
  a third, sharper instance: the agent practitioner received a confident-looking answer that was
  not reliable, and had no signal from the rendering itself that it should not be trusted. **All
  three are instances of the same gap dimension (c) already named as the load-bearing one at
  Ruling Set D's L-5** (the reflect-wording residual: an invitation presuming interior access the
  architecture declines to trust). Gate 3's first question should be whether the same disclosure
  discipline L-5 already applies to the reflect surface — name the posture rather than presume the
  access — generalises to the consult surface's rendering, and if so, what it would say about
  cross-endpoint divergence and delivery-timeout gaps specifically, given they are now measured,
  not hypothetical.

- **(a) Who the reader is presumed to be — INDIRECTLY EVIDENCED.** The run's own practitioner is
  the clearest case there is: a standing agent identity making its own direct API calls, with no
  human relay anywhere in the loop. The run supplies no data at all on the "relayed-human" case
  Ruling Set D's L-3 named as an open honest limit (an agent operator whose end-user is human) —
  the runner has no end-user. Gate 3 should treat the run as confirming, not settling, that direct
  agent-to-agent consumption is a real and current pattern; it supplies no evidence either way on
  the relay case.

- **(b) Direct address vs structured relay — NOT EVIDENCED BY THIS RUN.** The run consumes
  `/api/reason` and `/api/guardrail` programmatically throughout; it never exercises the
  crisis-path relay pattern (`suggested_user_message`) the C3 document names as precedent, because
  no cycle in 20 crossed the R20a distress perimeter. Gate 3 has no fresh data here beyond what the
  C3 document already established from the crisis precedent itself.

- **(d) Which affordances are named — DIRECTLY EVIDENCED, one sharp instance.** The guardrail
  calibration limit the §6 report ruled (§7): a rejection correctly identified a harm but
  attributed it to the wrong party, because *"the extraction assented to [the framing] without
  examining whether the described behaviour was the proposer's or the system's."* This is a live
  instance of the question dimension (d) asks — when an agent practitioner's proposal is rejected,
  what does it get told about why, and can the rendering distinguish "you did something wrong" from
  "your proposal describes something wrong being fixed"? The §6 report's own honest incompleteness
  matters here: of 9 guardrail rejections across the run, only this one was read closely enough to
  surface the attribution gap; the report explicitly declines to classify the other 8 (§7,
  *"a full test of the hypothesis is therefore NOT completed here"*). **The nine-candidate
  qualitative-classification task the mentor named as gating R8's close** (not this document's
  concern directly, but the same underlying data) would sharpen this dimension considerably if it
  runs before Gate 3 rather than after.

- **(e) Role-calibration / relational context — NOT EVIDENCED BY THIS RUN.** The run is a single
  agent identity with no relational dyad — no co-practitioner, no human counterpart, no declared
  `relationship_type`. It supplies zero data on the two minimum pieces L-4 named (role in a
  relationship; examined-vs-assumed impressions about it). Gate 3 has nothing fresh here beyond
  what the C3 document and the C2 kathêkon ruling (Ruling Set A) already establish — the runner's
  own remit statement (Ruling Set A's A/R-3) is the closest existing analogue, and it is a
  self-declaration honest-limit case, not a relational one.

**Scoping conclusion for Gate 3's agenda, stated as a question, not an answer:** the §6 data
sharpens dimension (c) considerably and dimension (d) partially; it does not sharpen (a), (b), or
(e) beyond what was already known at Ruling Set D. **Should Gate 3 therefore take up the five
dimensions in the order the data supports — (c) first (as already ruled), then (d), then (a)/(b)/(e)
on the existing architectural material alone — or does the mentor want all five addressed with
equal weight regardless of which the run happened to evidence?** This is presented as the first
scoping question for ruling (§4, Q1).

---

## 4. Questions for ruling

- **Q1 — agenda ordering.** Should Gate 3 sequence the five L-2 dimensions by evidentiary weight
  (c → d → a/b/e), per §3's mapping, or address all five without regard to which the §6 run
  happened to evidence? (§3)
- **Q2 — the disclosure-generalisation question.** Should Gate 3's dimension-(c) work start from
  the specific question of whether L-5's "disclose the posture, don't presume the access" discipline
  generalises from the reflect surface to the consult-rendering surface — given the two now-measured
  instances (delivery-timeout gap, cross-endpoint divergence) that make it concrete rather than
  hypothetical? (§3, first bullet)
- **Q3 — the cross-endpoint finding's audience.** The B7 cross-endpoint check (§2.4) is a live,
  running, founder-facing-only mechanism. Should Gate 3 treat "should any form of this comparison's
  result ever reach the practitioner whose action produced it" as in scope for the per-consumer
  rendering design, or is that a distinct question belonging to the standing-runner design (R8) or
  its own scoping session, given Ruling Set D's B/R-6 already scoped it as read-side/founder-facing
  only for the loop's own reporting purposes? **This document takes no position** — B/R-6 governs a
  different question (a range measure inside the loop's own report) from what O-C's design would
  govern (a rendering the practitioner receives from the consult surface itself), but the two are
  close enough that a ruling should say explicitly whether they are the same question wearing two
  names or genuinely distinct.
- **Q4 — the nine-candidate classification task's timing.** Given §3's dimension-(d) finding, should
  the nine-guardrail-rejected-candidates classification task (mentor-named as gating R8's close, not
  O-C's) be re-sequenced to run BEFORE Gate 3 rather than only before R8's close, since its output
  would sharpen dimension (d) for the design session that most needs it? **This document flags the
  question; it does not recommend re-sequencing a mentor-set gate on R8** — that gate is R8's, not
  O-C's, and this document has no standing to move it.
- **Q5 — generalisability caveat, explicit or implicit.** Should Gate 3's design document carry an
  explicit statement that the §6 data is a single-loop-identity instance, not a survey (§2.5), or is
  that caveat sufficiently carried by this scoping document already, such that Gate 3 need not
  restate it?

---

## 5. Constraints inherited from Ruling Set D and the O-C licence ruling — binding, not for ruling

Carried verbatim from `2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md` (L-1
through L-5) and `2026-08-16-mentor-ruling-oc-scoping-license-verbatim.md`. Nothing in this section
is open for this document's own ruling — it is restated so Gate 3 inherits it without re-deriving
it.

- **All five distinction dimensions are in scope for Gate 3's design; dimension (c) is load-bearing
  and must be the first design question addressed** (Ruling Set D, L-2; restated at the licence
  ruling).
- **The discriminator-reuse constraint is binding.** No second practitioner-type discriminator may
  be introduced. Any Gate 3 design reuses `auth.user?.id` (`route.ts:805`) — verified unchanged at
  this session's open (§0 header).
- **Both named honest limits carry explicitly:** transport-level classification (the signal
  classifies the caller, not the downstream practitioner) and the flag-off asymmetry (historical,
  not live — the audience-rendering flag has been on since 2026-05-31).
- **The relay pattern is the precedent to follow.** Any calibrated rendering not following it must
  answer the relayed-human case (§3's dimension-(a) finding: this run supplies no data on that
  case) before execution.
- **The `relationship_type` distinctness constraint is binding** and must be stated in any design
  document carrying the four relational-context placeholder fields (`relational_context`,
  `practitioner_role`, `relationship_type`, `examination_status` — still named-not-built,
  re-confirmed absent from `website/src` by grep at this session's open, no change since 2026-08-15).
- **The R20d boundary binds on all surfaces regardless of practitioner type** — engage the
  self-side, decline the other-side.
- **`SUBSTRATE_LAYER3_ENABLED` stays unset throughout the scoping → design → ruling chain.**
  Activation is not licensed at any of the three gates; it requires an explicit activation ruling
  plus the separately-walked founder step, neither of which this document is or produces.
- **F-b (the relational-context fields as additive-optional request fields) is a distinct, already-
  opened post-run execution track** (Ruling Set D, L-4) — not this document's subject, not
  re-scoped here, and not gated on Gate 3's outcome. Its R17 co-requisite stands as stated at
  Ruling Set D.
- **L-5 (the reflect-wording recalibration) is a distinct, already-ruled execution track** with
  mentor-vetted verbatim in hand (`2026-08-15-mentor-review-reflect-q1-q6-vetted-verbatim.md`) —
  slotted to R2 or its own post-run step, per the arc plan. This document's Q2 (§4) asks whether its
  *discipline* generalises to O-C's design; it does not touch L-5's own execution, wording, or
  timing.

---

## 6. Affected architectural surfaces (PR20)

| Item | Files/surfaces named | Live today | Touched by this document | Touched by Gate 3 |
|---|---|---|---|---|
| The B7 cross-endpoint check | Runner-side mechanism (not in this repo); reads `/api/guardrail` + `/api/reason` extractions | Yes, running since cycle 6 | Named, verified, not modified | Possibly — Q3 asks whether its output belongs in the design's scope |
| Delivery-classification data | `agent_trust_events`, `orientation-reading-*` rows | Yes, live since C2/C1c | Read-only query cited from the §6 report | No — data source only |
| Guardrail rejection data | `idea_loop_candidates`, `guardrail_proximity` | Yes, live | Read-only citation from §6 report §7 | No — the 9-candidate classification is R8's task, not this document's or Gate 3's, per Q4 |
| `ConsumerContext` / per-mode templates | `layer3-service.ts`, `layer3-prose.ts`, `/api/substrate/layer3/route.ts` | No — dormant, flag unset | Not touched | Yes — Gate 3's eventual design target, per Ruling Set D O-C |
| The four relational-context fields | Named, not built, anywhere in `website/src` | No | Confirmed absent (grep) | No — F-b is its own post-run track, not gated on Gate 3 |
| Reflect Q1–Q6 wording | `question-bank.ts` | Yes, live, unchanged wording | Not touched | No — L-5 is its own execution track |

No row in this table implies a flag set, a schema change, or a trust-event vocabulary change. The
Q1 hard constraint (the loop proposes; it never executes) is untouched by this document. Weights
remain BLOCKED.

---

## 7. Boundary against other open items

- **R8 (standing-runner design).** R8 is gated on this document's own Gate 2 being produced (the
  ruling that opened this session, `2026-08-16-mentor-ruling-r1-s6-report-accepted`, restated in the
  post-R1 prompt). **This document IS that Gate 2 output** — producing it is what unblocks R8's
  open, not R8's close. R8's own gate (classify the nine guardrail-rejected candidates before R8's
  close) is untouched here; Q4 above only asks whether that same classification should ALSO inform
  Gate 3, not whether R8's gate should move.
- **The C2 kathêkon and hegemonikon sessions (Ruling Sets A/B).** Neither is re-opened. The
  runner-remit self-declaration honest-limit class (Ruling Set A, A/R-3) is the nearest existing
  analogue to dimension (e)'s role-declaration honest limit — noted, not merged, per the same
  boundary discipline the C3 document applied to Ruling Set A.
- **The false-hold observation window (R4's last step).** Untouched. Different instrument, different
  gate.

---

## 8. Not asked / out of scope

- **Any design of what an agent-calibrated rendering contains.** That is Gate 3's question; this
  document names Gate 3's agenda, not its answer.
- **`SUBSTRATE_LAYER3_ENABLED` activation.** Not licensed by this document or any ruling on it.
- **Any build, code edit, flag, or schema change.** M2's shape governs: documents only.
- **Re-litigating L-1 through L-5.** Closed at Ruling Set D. This document scopes the one item that
  ruling left open (O-C's design session's own scope), nothing else.
- **F-b execution, L-5 execution, O-A's disclosure, A/R-5's guardrail wording.** All separately
  slotted post-run tracks (arc plan), unaffected by this document.
- **The nine-candidate classification's own execution.** Named as a scoping question (Q4) for
  whether Gate 3 should draw on it; not performed here. It remains R8's own gating task.
- **The 0h call, the S11 flip, weights (BLOCKED), the P0 hold.** Standing, unchanged.

---

## 9. Sequencing note

Per M2 and the O-C licence ruling: this document goes to the mentor at the founder's cadence.
**No session opens from this document except by ruling.** If ruled, Gate 3 (the design session
itself) is licensed to open, taking up this document's Q1–Q5 as its own opening agenda alongside
the inherited constraints in §5. This document self-starts nothing — no build, no design draft, no
flag.

*End of scope document. Status: FOR RULING.*

---

## Dated relay-time verification note (2026-08-23; PR20 amendment — added by the relaying session, not part of the 2026-08-16 document)

Re-checked before relay, per PR20's timestamp-check-at-relay requirement. **Still true:**
`SUBSTRATE_LAYER3_ENABLED` has no activation entry in the decision log and the three Layer-3 files
(`layer3-service.ts`, `layer3-prose.ts`, `/api/substrate/layer3/route.ts`) are untouched since
drafting (git-verified) — the dormant claim holds; the four relational-context fields remain absent
from `website/src` (grep clean); the guardrail-rejection data source (`idea_loop_candidates`) is
schema-unchanged. **Two drifts, both benign, neither changing what Q1–Q5 ask:** (1) §6's "Reflect
Q1–Q6 wording — unchanged" is stale — `question-bank.ts` was recalibrated at `9bfd69e` (2026-08-17,
*"R2 Spec 3: reflect Q1-Q6 agent recalibration (D/L-5, Ruling Set D)"*): the L-5 execution track §8
lists as separately slotted has since RUN, which strengthens Q2's premise (the disclosure discipline
is now executed on the reflect surface, not merely ruled). (2) §6's B7 row says "running since cycle
6" — the bounded validation run closed at 20 cycles on 2026-08-16; the row describes the run period,
now ended. Everything else in the document stands as drafted.
