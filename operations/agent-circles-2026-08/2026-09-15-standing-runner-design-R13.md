# R13 — the standing-runner design track's sixth sitting: the anchor's engagement question, what anchors B4's core for the v1 producer, and the amended R8-D7 against the single backward edge

**Authored 2026-09-15** (from `date`). **Tier `governance` / design. AC7 not engaged. Nothing is
built, activated, flipped, deployed, migrated, minted or pushed by this document. It licenses no
build and elects nothing.** No file under `website/` or `harness/` touched. Byte-identity guard
**ARMED, 250/0**. The window admits design authoring in `operations/` (Q-M3); **Q-R12-B forbids the
build regardless.**

**The track:** R8 → R9 → R10 → R11 → R12 → **R13**. Opened on the founder's act 2026-09-15, the
re-homing act the Q-A ruling reserved to them.

> **⚠ THIS IS THE POST-REVIEW TEXT. PR19 ran as three blind reviewers and the first draft did not
> survive it.** Findings folded at the root, not annotated around: **R13-D2 was substantially wrong
> and is rewritten**; **R13-D3's central claim was wrong twice over** (it over-read Q-M5, and it
> re-asserted a ground R9 had already corrected) **and is reframed**; **R13-D1's Prerequisite-Criterion
> invocation was a misapplication and is withdrawn** in favour of the ground that actually carries it.
> A false novelty claim, a false exhaustiveness claim, a miscount and a mis-discharge are corrected.
> **Section 8 records what changed and why.** The first draft is in git history; nothing is hidden.

**Sources — verbatim wins over this document.** The 2026-09-15 Q-A/Q-B/Q-C and Q-P1 rulings; the
2026-09-14 R12 rulings (Q-R12-C); the 2026-08-30 Q1a/b/c + Q2 ruling; Q-M5 and Q-M7; Q-R11-B1/B2;
R8 §4.9; R9 §3.1, §3.3, §11 (R9-D10); R11 §1.3; R12 §3.3.

---

## 0. What this sitting carries

> **⚠ THE METHOD WAS WRONG, AND A RULING SAYS SO. Corrected here rather than defended.** The first
> draft scoped this sitting's load to *"the register's standing-runner rows."* **The 2026-09-04 A2
> ruling forbids exactly that equation:** *"**Additive.** The brief's named-input list does not
> replace the items the record routes to the standing-runner track. It supplements them. The full
> named-input load for the session when it opens includes: the M-vs-W floor-semantics deferral,
> Ruling Set E's A2, A3, and A4, item D's guard end-condition, the four Gate-3 §11 handoff items, the
> ten [R8:…] register rows, and everything in the brief."* The index itself says the same — *"where
> they and the brief differ the verbatim brief wins."* **R9 §0 carried that full load; this sitting's
> first draft did not, and did not even cite the governing brief.**
> **Disposition of the load A2 enumerates, checked rather than assumed:** the **M/W/S deferral** is
> discharged (W elected 2026-09-13); **Ruling Set E's A2/A3/A4** and the **four Gate-3 §11 handoff
> items** were consumed by R9 (R9-D6/D7/D8) — **their substance is not lost, but none of them has a
> register row**, which is why a register-only method could not see them; **item D's guard
> end-condition** is not re-opened here. **So the four items below remain the right four to take —
> but that is now a checked result, not a by-product of trusting one surface.**

**The register holds seventeen `Standing-runner design` rows** — sixteen named-input rows at 583–598
plus a *gates-table* row at 473 that defers to them (*"do not rely on this cell alone"*). Twelve are
marked CONSUMED, DESIGNED or carried-orienting by R8/R9/R10. One (row 584) is expressly redirected
away from this track. **Three rows are live**, and a fourth item arrives from R8 §4.9 rather than from
a row — **worth stating, because an off-register input is exactly the class the register exists to
make findable**:

| # | item | source |
|---|---|---|
| 1 | **Q-R12-C** — must the runner explicitly engage the anchor's disclosed limitations? | row 598, re-homed by Q-A |
| 2 | **A5.2** — what anchors B4's core for the v1 producer? | row 597 |
| 3 | **R8-D7 against the single backward edge, AS AMENDED BY Q-M5** | R8 §4.9 — **not a register row** |
| 4 | **The conjectural entry type ↔ GS-ATRF-4** | row 588 |

**Deliberately NOT taken:** R8-D7's open parameters (K, trigger, vocabulary, persistence) — deferred
to Deliverable A's live measurement by Q-M7, not to a design sitting; the M/W/S election (closed, W
elected); anything Q-P1, Q1a/b/c or Q2 settled.

---

## 1. R13-D1 — Q-R12-C: a bare attestation is worth nothing; the examination the ruling names is not the server's to build

**What is ruled and not re-opened:** the anchor serves coverage and confidence state only, without
per-domain levels. **What is open:** whether the runner's explicit engagement is *required as a
structural constraint* — *"not ruled as mandatory at this stage, but… the correct direction for the
design to develop toward."*

**The ruling's own sentence, which the first draft omitted and which governs this section:**

> *"If the runner's generation step is designed to include an explicit examination of the anchor's
> disclosed limitations before reasoning from it, **that examination is the prerequisite the envelope
> cannot supply by itself.**"*

**The first draft claimed an engagement requirement has "exactly two available shapes." That claim is
false and is withdrawn.** At least five forms exist, three of them already instantiated somewhere in
this project: a bare attestation; a designed examination in the generation step (the ruling's own
direction); a **server-verifiable content constraint** (requiring the candidate's `derivation.moves`
to address the specific disclosed gap — R9 §3.3 already makes a coverage or provenance gap *"the
sharpest finger"*, and the server knows exactly what it served); **payload shaping so non-engagement
is unavailable** (which is what the Q-R12-C ruling itself did by stripping per-domain levels); and
**attestation plus sampled audit** (the posture R8-D6a and worst-of-K already embody). **Ruling on an
exhaustiveness claim that was never checked was the first draft's real error here.**

**R13's position, on the ground that actually carries it:**

**(i) A bare attestation is worth nothing at a server boundary, and the standing rule — not the
Prerequisite Criterion — is why.** The harness cannot verify it, the declaring actor controls it
entirely, and an agent treating the envelope as metadata declares engagement as readily as one that
does not. This project's *"no self-report is credited"* discipline disposes of it completely.

> **The first draft ruled it out on the Prerequisite Criterion. That invocation is WITHDRAWN as a
> misapplication.** The Criterion's ruled trigger is a design *"claim[ing] to produce
> practitioner-facing outputs — scores, recommendations, diagnoses, virtue assessments."* An
> engagement attestation is none of those; it is an internal record field. The first draft
> substituted "engagement" for the Criterion's "the destination" and presented an extension as a
> plain reading. **And it never faced the obvious rebuttal:** an attestation in v1 would be *recorded
> and consumed by nothing*, which is the very second ground on which R12 §10's other rows pass. A
> Criterion case can be made — that it simulates a remedy rather than disclosing a deficiency — but
> the first draft did not make it, and the self-report rule reaches the same conclusion without
> needing it.

**(ii) The examination the ruling names is not the server's to build, and that is the sharper
finding.** Generation is **runner-owned by ruling**. A designed examination inside the generation
step is therefore something the harness can require by contract and observe only through what the
runner records — it cannot construct it, and cannot verify it was performed. **So the prerequisite
the ruling identifies lives in the one component the server does not build.** That is not a v1
scheduling limit; it is a standing property of the architecture's own division of ownership.

**(iii) What this leaves as genuinely designable server-side is the content constraint** — the third
form above. It is the only one on the list that the server can both impose and check against a record
it holds. **It is named here as the direction worth designing, and it is not designed here** — it
needs the `derivation` vocabulary settled, which this sitting does not touch.

**Carried for whichever session designs the requirement:** a bare attestation is ruled out on the
self-report rule; the designed examination is the ruling's direction and is runner-side; the
server-verifiable content constraint is the designable complement; and **whatever is built must not
be described as establishing that the runner engaged** unless it can be checked.

---

## 2. R13-D2 — A5.2: the core is empty *of harness-held state*, and the runner's own declared gap is the whole core

> **⚠ The first draft's heading read "the core is EMPTY." That is wrong and was the most
> build-consequential error in it.** R9's actual words: *"the core is **empty of harness-held state**
> and the only finger is the runner's own declared `OikeiosisGap`"*, and — decisively — *"In the
> `gap_only` case, **this runner-supplied finger is the *whole* core**."* **The core is NOT empty. It
> is non-empty and runner-attested**, which is a materially worse epistemic situation than emptiness
> and carries its own disclosure. A build reading "empty" would drop that disclosure.

**A5.2's answer for the v1 producer, stated correctly:** the core is empty of *harness-held* state;
the runner's own declared `OikeiosisGap` is the whole of it; and R9 already fixes that finger's trust
posture — *"runner-attested at exactly the trust posture of `heuristic`"*, disclosed and unverified,
with the **"cannot invent" claim expressly withdrawn** for it. `anchor_basis` records `gap_only`, and
that value is *"disclosed on every candidate the cycle produces."*

**What Q-P1 did and did not settle, corrected.** Q-P1 settled **blocking-versus-degraded**: the
condition is degraded-posture, not blocking. **It did not answer A5.2's own question** of what
anchors the core — the first draft's *"largely answers it"* overstates and is withdrawn. What Q-P1
contributes here is that this posture is **honest and permitted**, not that it is empty.

**The first draft proposed that `anchor_basis` "must distinguish" a founder-personal branch from a
founder-directed-session branch. That proposal is WITHDRAWN, for three reasons, each verified:**

1. **The enum already distinguishes what is distinguishable.** `anchor_basis` is
   `trust_record_and_purpose | trust_record | gap_only`. A *populated* session-identity anchor is
   already not `gap_only`. The proposal was redundant wherever it was knowable.
2. **Where it was not redundant it was unbuildable.** The only case needing a new distinction is
   *unpopulated session identity* versus *founder-personal* — and at the read these are
   indistinguishable, because the separation they turn on is `agent_id` distinctness whose
   **mint-level enforcement is unbuilt** (Q1c). The first draft asserted the branch was "knowable at
   read time" two paragraphs before stating that the enforcement it depends on does not exist. **That
   was a self-contradiction.**
3. **The first draft's "Branch A" was mis-described.** It said the founder-personal case has ENV-1
   return 404 — but a 404 presupposes an id to look up, and R9 says the founder-personal case has
   *no* `target_agent_id`, which is a **required** runner configuration value that *refuses an absent
   value*. So what the draft called Branch A was in fact a session identity before its record is
   populated.

**What stands instead:** `gap_only` is the honest and already-designed marker for the v1 producer;
the runner-supplied finger is the whole core and is disclosed as unverified; and **Q-P1's own ruled
build consequence — the proposal shape must carry the operative generation mode as a REQUIRED field —
is the field that actually carries the v1-posture distinction**, which the first draft never
reconciled against its own proposal.

**Carried, not resolved:** whether a session identity, once populated, satisfies Q1c's distinctness
*in fact*. Until mint-level enforcement exists, it rests on convention — which is what Q1c ruled
against.

---

## 3. R13-D3 — R9 already confirmed this evaluation; Q-M5 then amended the object, and the confirmation survives on R9's terms, not on R8's

> **⚠ The first draft treated this as an unconfirmed evaluation and claimed to strengthen it. Both
> were wrong.** R9 §11 (R9-D10) **already performed the confirmation** — *"the constraint is on
> topology; the confirmation holds"* — and added a precision the first draft then contradicted.

**What R9 already settled, and this sitting does not redo:** the constraint is topological; R8's
evaluation holds; **and** — R9's precision — *"under M or W the **recorded verdict changes**, and the
recorded verdict is what flows on that existing edge — so a non-S policy changes **what flows on the
edge**, not the number or topology of edges… **but the policy is not wholly examination-side in
effect**."*

**The first draft re-asserted R8's uncorrected ground 2 ("examination-side only… never what
generation produces") as a surviving ground, and claimed the verdict rested "on stronger grounds than
R8 could claim." Both are withdrawn.** R9 had already struck that ground's unqualified form, and the
path by which it fails is concrete: **block 4 `runner_history` carries `guardrail_proximity` to the
runner at the next cycle's open**, so a changed recorded verdict does reach the generation step —
**cross-cycle**, not within-cycle. The first draft answered the within-cycle question (*"the proposal
goes to the adopter at Threshold"*) when the live path is cross-cycle. **That was a category slip in
the ground carrying the most weight.** R9 is explicit that generation's blindness here *"is a contract
the runner attests, not a property the harness can pin."*

**What is genuinely live for this sitting:** R9 confirmed the *pre-amendment* object. **Q-M5 (2026-09-13)
amended R8-D7 after R9** — removing the rejection re-election fixpoint, keeping the dethronement path
for winners. **So the open question is whether R9's confirmation survives the amendment**, and that
is a proper question for a post-Q-M5 sitting.

**It does, and the amendment strengthens exactly one thing — termination, not iterativeness.**

> **The first draft claimed "there is no re-election, so there is no loop at all… a single pass over
> one candidate." That is FALSE and is withdrawn.** Q-M5 removed the fixpoint **for rejections only**
> and expressly kept *"the dethronement path for winners."* R11 §1.3 sets out what remains: *"Elect…
> → `w₁`. Sample `w₁`… If any draw floors, `w₁` is blocked under W, leaves the field… **Re-elect on
> the remaining survivors → `w₂`. Repeat.**"* It is iterative — **a monotone descending chain**, each
> candidate sampled at most once, bounded by the field.

**Verdict, on the corrected object:** the amended path adds no edge. R8's ground (i) genuinely
strengthens — from "bounded over a field that can grow and shrink" to R11's *"termination is trivial
and stronger than R8's"*, because the recovery path is closed and the field can only shrink. R8's
ground (iii) (inert under Option S) is unchanged. **R8's ground (ii) does not survive unqualified and
must carry R9-D10's precision wherever it is cited.** R8 §4.9 states **three** grounds, not four; the
first draft manufactured a fourth by splitting one.

**The topological premise, stated openly because it is the load-bearing one:** a change in a recorded
value on an existing path is not a new path, and the constraint is about paths. **Contestable, and
the reason the verdict is "no new edge" rather than "no new influence" — those are different claims
and only the first is made.**

**On R8 §4.9's condition.** It requires the evaluation be carried *"to whatever session adopts
R8-D7."* **The first draft said the condition was "thereby met." It is not**, and cannot be while
adoption remains an election nobody has made. **This sitting is a link in the carrying chain, not its
terminus** — the formulation R11 already used correctly.

---

## 4. R13-D4 — the conjectural entry type ↔ GS-ATRF-4 is BLOCKED on a question owned by no session

Row 588 has carried this since 2026-08-19, redirected here by the ruling that created the
redirect-not-void template. R8 left it untouched as *"adjacent to the epistemic-status handling, not
needed by it."* **R13 reaches it and finds it cannot be resolved here, for a structural reason.**

The item is a *connection* between the conjectural entry type and **GS-ATRF-4's vocabulary
direction** — and that direction sits on the register's *"held open, owned by no session"* list, where
the register records that **neither source document elaborates the question beyond the phrase
itself.** **A connection cannot be designed to a terminus that has no stated content.**

**Disposition: the item stays on the register with its blocking dependency now named.** It previously
read as an unexamined carry-forward; it is examined and blocked. **This sitting does NOT assign the
GS-ATRF-4 vocabulary direction to any session** — expressly reserved by the 2026-09-04 D1 ruling,
which holds it unowned. **Naming a blocker is not assigning it.**

*(This section survived PR19 unchanged — all three dimensions that reached it found no objection.)*

---

## 4b. R13-D5 — three items found behind "consumed" markers, one of them a genuine carry-loss out of R12

**PR19's completeness dimension found that rows marked consumed still carry live obligations.** The
first draft read the opening markers and moved on; §6 limit 5 admitted the markings were *"read, not
re-verified"*, **and this is precisely where that hid.** Recorded as findings, not resolved here.

**(1) ⚠ A REQUIRED BUILD-BRIEF ADDITION IS MISSING FROM THE BUILD BRIEF — the sharpest of the three.**
Row 583 sits behind `[R10: RECEIVED and EXAMINED]`, but R10 §4.6 item 2 is an obligation, not an
observation: the cycle-open read *"should be authorised per-identity, not hard-coded to a single
runner… **Recorded as a required addition to any build brief** for R9 §16.2's bundle, **not as
something already discharged**."* R10 §4.4 names the biting constraint — the write-side
`UNIQUE (loop_id, cycle_number)`. **R12 is that build brief, and it contains neither: a grep for
`uq_ilc_loop_cycle` and `per-identity` across R12 returns ZERO**, and both §3.3 (the cycle-open read)
and §7's prerequisites are silent. **This is a live carry-loss, surfaced here for the founder, and it
belongs in R12 §7's prerequisites.** *Mitigating and stated: v1 runs one runner, so the collision is
contingent on generalisation — but R10 worded it as required, not contingent.*

**(2) An unfired, explicitly-timed obligation on rows 593/594.** Both record *"not yet ruled — a
relayed instruction, no ruling request has been raised on it."* The 2026-09-13 Q6 ruling is a timing
instruction keyed to this event: *"Both are design inputs held for the standing-runner track… **Raise
them when the receiving session opens.**"* **This sitting opened the track and did not raise them.**
The counter-reading is real and recorded: the same ruling sets the threshold as *"whether a session is
blocked, not elapsed time"*, and nothing here is blocked. **But the instruction is keyed to the
opening, so it is dispositioned rather than left silent: the raising is the founder's relay act, and
it is named as owed.**

**(3) Two rows whose "consumed" marker overstates.** Row 595's own *"Open for the session:"* list is
undispositioned — and its first item (environment tag vs GS-ATRF-4 epistemic status) **is blocked by
the identical unowned-vocabulary blocker R13-D4 names for row 588**; a reader of the first draft would
think only one GS-ATRF-4 item outstanding. Row 592's leverage item **#6 (functional novelty) is
RE-DEFERRED with a named unlock condition** — *"sequenced behind GS-CYB-2, not dropped"* — which is
live, not consumed.

---

## 5. Standing-constraint compliance

- **Q1 holds:** the loop proposes; it never executes. Nothing here creates a candidate → execution path.
- **Weights BLOCKED.** No mechanism here weights, scores or biases generation. **R13-D3 records the
  honest qualification** that a changed recorded verdict does reach generation cross-cycle, protected
  by runner attestation rather than structural blindness — R9's finding, restated, not softened.
- **No self-report is credited** — R13-D1's load-bearing ground.
- **Prerequisite Criterion — invoked in the first draft and WITHDRAWN as a misapplication** (§1). The
  first draft also claimed this was *"the first item in this track's run where the Criterion decides
  against a design element."* **That is false**: Q-R12-C is itself recorded as *"a Prerequisite
  Criterion finding"* at R12, and R8 §4.10 already had the Criterion converging with weights-BLOCKED
  to refuse the weight-touching half. **The claim and the self-congratulation it carried are removed.**
- **No new retrieval surface.** R13 designs no read beyond R12 §3.3's — **and, with R13-D2's branch
  proposal withdrawn, this is now true without qualification**; the first draft's proposal would have
  required the read to surface a fact block 2 does not carry.
- **No backfill.**

---

## 6. Honest limits

1. **R13-D1 recommends against a form the mentor called "the correct direction."** The position is
   that a *bare attestation* is the wrong form of it, and that the ruling's own form — a designed
   examination — is runner-side and not the server's to build. **If the mentor reads the direction as
   requiring a recorded attestation in v1, R13-D1 is overturned and should be.**
2. **R13-D1's five-form list is not claimed exhaustive.** Having been wrong once about
   exhaustiveness, this sitting does not repeat the shape.
3. **R13-D3's topological premise is contestable** and is stated as such; the verdict is "no new
   edge," never "no new influence."
4. **This sitting read R10 and R11 in part, not in full.** No claim rests on an unread section, but
   completeness against them is not asserted.
5. **Twelve register rows marked consumed by earlier sittings were read, not re-verified.**
6. **All three PR19 dimensions returned and are folded** (§8). The first draft's method — equating the
   register with the inbound set — was itself a finding, corrected at §0.
7. **R13-D3's verdict is stated more cleanly than the record fully supports.** The 2026-09-13 Q5
   ruling holds that *"Q-M5's would-be-winner scope interacts with the total gap on role input, and
   that interaction should be examined"* — and assigns that examination to the **role-relative
   evaluation session**, not this track. So it is not a missed deliverable; **but R13-D3 clears
   Q-M5's scope structurally without touching an interaction a ruling has named, and says so here
   rather than letting the verdict read as unqualified.**
8. **Register drift is real and is not this sitting's to repair.** Items routed to this track by
   ruling — Ruling Set E's A2/A3/A4, the four Gate-3 §11 handoff items — **have no register row at
   all.** R9 consumed them, so nothing is lost; but the register cannot be trusted as the whole load,
   which is what §0 now says.

---

## 7. What this document does NOT do

Authorises no build, migration, flag, mint, capability or deploy. Elects nothing. Re-opens nothing
ruled. Assigns the GS-ATRF-4 vocabulary direction to no session. Sets no R8-D7 parameter. Does not
open any successor sitting. **Does not discharge R8 §4.9's condition.**

---

## 8. PR19 — what the review changed

Three blind reviewers, separate dimensions. **Two independently converged on three findings** (the
false "first Criterion" claim; three-vs-four grounds; the register miscount) — genuine convergence,
not one reviewer's idiosyncrasy.

| finding | severity | disposition |
|---|---|---|
| "No re-election, so no loop at all" over-reads Q-M5; R11 §1.3 sets out a descending chain | **HIGH** | **Folded** — §3 reframed |
| R9 §11 had already confirmed the evaluation, with a precision the draft contradicted | **HIGH** (found in verification) | **Folded** — §3 now builds on R9 |
| Ground 2 ("never what generation produces") was struck by R9-D10; block 4 carries proximity cross-cycle | **HIGH** | **Folded** — ground withdrawn, path named |
| "Exactly two available shapes" is false; ≥5 exist | **HIGH** | **Folded** — claim withdrawn, forms listed |
| R13-D2 self-contradiction: branch "knowable at read time" vs unbuilt mint enforcement | **HIGH** | **Folded** — proposal withdrawn |
| "The core is EMPTY" drops R9's "of harness-held state"; the runner finger is the whole core | **MED-HIGH** | **Folded** — §2 rewritten |
| Prerequisite Criterion misapplied to a non-practitioner-facing field; rebuttal never faced | **MED-HIGH** | **Folded** — invocation withdrawn |
| Ruling's "that examination IS the prerequisite" omitted, and contradicted | **MEDIUM** | **Folded** — quoted and governing |
| "R8 §4.9's condition is thereby met" — runs to the adopting session | **MEDIUM** | **Folded** — withdrawn |
| "First item where the Criterion decides against" — false | **MEDIUM** | **Folded** — removed |
| "R8's four grounds" — R8 gives three | **LOW** | **Folded** |
| Register arithmetic 12+1+4≠16; seventeen rows | **NIT** | **Folded** |
| "Ruled out" diction from a non-ruling sitting | **LOW** | **Folded** — diction corrected |
| **Method: the register ≠ the inbound set — A2 rules the load additive and larger** | **HIGH** | **Folded** — §0 rewritten; the full A2 load dispositioned item by item |
| **R10 §4.6's "required addition to any build brief" is absent from R12** (`uq_ilc_loop_cycle`, per-identity authorisation) | **HIGH** | **Folded as a FINDING** — new §4b(1); belongs in R12 §7 |
| **Q6's "raise them when the receiving session opens" unfired on rows 593/594** | **HIGH** | **Folded** — §4b(2), dispositioned as owed |
| Row 595's "Open for the session" list undispositioned; same GS-ATRF-4 blocker | **MEDIUM** | **Folded** — §4b(3) |
| Row 592's leverage item #6 re-deferred with a named unlock, not consumed | **MEDIUM** | **Folded** — §4b(3) |
| Q5's ruled role-input interaction bears on R13-D3 and is untouched | **MEDIUM** | **Folded** — §6 limit 7 |
| Ruling Set E A2/A3/A4 + four Gate-3 items routed by ruling, no register row | **MEDIUM** | **Folded** — §6 limit 8 (R9 consumed them; drift only) |
| Q-P1's ruled generation-mode REQUIRED field unreconciled with D2's proposal | **MEDIUM** | **Folded** — §2, proposal withdrawn, ruled field named |

**Clean on:** re-opening anything ruled (all seven checked); assigning GS-ATRF-4; claiming build,
election or successor-opening authority; R13-D4 entire.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
