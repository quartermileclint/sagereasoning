# Relay draft — the W2 window's work (F-1) and the R8-D7 sampling policy: summary, questions, recommendations

**Drafted 2026-09-13 ~11:15 AEST (corrected from a "~12:20" context-clock artifact) by session `sagereasoning-dd [856dc7]` at the founder's request, for the
founder to pass to the mentor. **SENT by the founder and RULED 2026-09-13 — verbatim, canonical: `2026-09-13-mentor-ruling-eight-questions-w2-work-s11d2-sequencing-r8d7-under-w-verbatim.md`; that ruling wins over every recommendation below.** NOT sent by the session. Recommendations are the session's and are
marked as such; every decision named below remains the founder's or the mentor's.** Sources: the
two drafts committed at `4127cd6` (`2026-09-13-w2-window-work-designation-ASSESSMENT-DRAFT.md`;
`2026-09-13-R8-D7-sampling-policy-SCOPING-DRAFT.md`) and the primary records they cite. Verbatim wins.

**Surfaces a ruling would land on (PR20):** the W2 window's work designation and its clock (Q-S1);
the byte-identity guard (`human-practitioner-boundary.test.ts`, `GUARD_RE` + the three SHA pins);
`layer2-mechanisms.ts` (S11-D2); the public trust record (`trust-record-payload.ts`) and ADR-013 §8
(the staged compliance-not-virtue clause); `/api/guardrail`'s default band and ADR-010 §4 floor
semantics (R8-D7); the three R18 surfaces. **Nothing has changed on any of them; all facts below
were re-derived today from source.**

---

## 1. Summary for the mentor

**1.1 The current window.** Part (1)'s mark is tonight, `2026-09-13T09:44:55Z` (19:44 AEST). It closes
the current window at three of four parts met, part (2) structurally unmet (Q-S1), and starts nothing.
The founder records it (F-4). Window at this writing: 544 records; andreia 4 on the consult path, 0 on
the guard path.

**1.2 The 2026-09-13 ruling's three W2-window candidates, read against the record.**

- **(a) W2 activation's remaining authored work — small.** The L4 rule is built; the schema election
  is decided and applied (21→22, TEST + production, 2026-09-12); the compliance-not-virtue clause's
  inline half is built and its record-level half is **already composed and staged**, waiting only
  on the founder's R18 signature (F-3) and one edit. The only undrafted authoring is the R18
  documentation of the `enforcement_outcomes` field and `regime` marker, which the staged file
  sequences to activation, and activation is coupled to the flip (register §F W3-d). Two follow-ons
  (the accreditation-row regime column; the original C1c first-circle class) are unscheduled code in
  `GUARD_RE` files.
- **(b) The pre-flip report's outstanding items — on the record, none remain as authored work.**
  The Part-1 script defect was fixed 2026-09-12 under the B1 waiver (the ruling's own recording
  note says so). **The D2 "engaged" definitions are not pending:** three D2 rulings were adopted
  2026-09-06 (the principal tagging ruling; the natural-relationship follow-on, whose header reads
  *"this leaves no open axis"*; the mid-window sequencing ruling), and the S11 register's D2 row ends
  *"D2's SPECIFICATION IS NOW COMPLETE; NO OPEN AXIS REMAINS."* The phrase *"scoped-for-ruling, relay
  pending"* survived in three secondary records (the window specification §3, the 2026-09-12 summary
  close, the drafted opener's `Q-D2-ENGINE` row) and reached the relay from there. **We could find no
  unanswered D2 question in the repository.** What is open on D2 is the S11-D2 *build*, on a
  SHA-pinned guarded file, under the mid-window ruling's own waiver shape, after *"five ordinary days
  with consult records"* (the count half is met — every UTC day 09-06→09-13 carries ≥1 consult record;
  the "ordinary" half is a judgement).
- **(c) The standing-runner track — the only candidate whose authored work is not exposed to the
  guard.** R8, R9 and R10 have run as design sittings; what remains as Write/Edit work is R8-D7's
  sampling-policy design (now scoped), the manifest ATRF item-3 amendment draft for ruling, and the
  build brief's second increment; the build itself would touch `idea-loop-watching-store.ts`
  (`/substrate/`, guarded) and, for A2, `/api/guardrail` (guarded, `code-critical`).

**1.3 The structural fact under all three.** The window needs consult records on the measured
checkout, where the guard binds on any uncommitted `GUARD_RE` line while capture is on. The W2 build
avoided the guard by working in a worktree with capture unset, which is exactly why the ruling says
it *"did not happen."* Every guarded-file item above therefore has two routes: a recorded per-commit
waiver on the measured checkout (the shape the D2 mid-window ruling prescribes for one file), or a
worktree the window cannot see. **Whether the W2 window's discipline tolerates guarded-file waivers as
the window's own work has not been ruled.**

**1.4 R8-D7.** W is elected as doctrine; no sampling layer exists on the live gate; the election
licenses no code. The scoping draft finds: under worst-of-K, K only ever tightens and an adverse
first draw is final, so R8's symmetric fixpoint (rejections can recover; winners can be dethroned)
becomes one-directional; on the measured population 21 of 24 inputs are deterministic, so any policy
is a policy about ~3 inputs in 24; no first-draw signal has a measured relation to variance, so a
"confidence" trigger cannot be designed today without failing the Prerequisite Criterion; and K=1 is
consistent with W, so "no sampling, disclosure carried" is W at K=1, not a rejection of W.

---

## 2. Questions for the mentor (for ruling)

**Q-M1 — Correct the candidate list?** Given §1.2(b): does the ruled ordering (a) > (b) > (c) stand,
or is candidate (b) withdrawn as a source of window work, leaving the S11-D2 build as a separate,
already-sequenced item rather than window work?

**Q-M2 — Guarded-file waivers as window work.** May work that requires a recorded waiver on a
`GUARD_RE` file (with the guard left armed, per the D2 mid-window shape) be designated as the W2
window's work and produce consult records the window counts? Or must window work be confined to
unguarded surfaces, so that guarded builds happen either outside the window or under a rule the
mentor states now?

**Q-M3 — Is design authoring "on a live surface" in the clock rule's sense?** The 2026-09-13 ruling
characterises the standing-runner design work as *"a surface where getting it wrong has real
downstream consequences"*; Q-W1 says *"consequential decisions carried out through composed,
narrated actions"* and the clock rule says *"on a live surface."* Does a design document in
`operations/` satisfy the clock rule, so that the first consult record of a design sitting starts
the W2 window's clock?

**Q-M4 — The S11-D2 sequencing across the restarted window.** The mid-window ruling sequenced S11-D2
against the *current* window's baseline (five ordinary consult days). Q-S1 restarts the clock for the
W2 window. Does the S11-D2 baseline carry from the current window (met on the count), or restart
with W2's window?

**Q-M5 — R8-D7 under W: scope.** Does R8-D7's scope (*"decision-bearing verdicts only"*, with the
re-election fixpoint) survive the election, given that under worst-of-K a resampled rejection can
never recover and only winners can be dethroned? Or does W collapse the scope to K-sampling of the
would-be winner alone?

**Q-M6 — Does W oblige K>1 anywhere?** K=1 is worst-of-one. Is K a cost election for the founder, a
doctrinal minimum, or is single-draw-with-disclosure fully consistent with the elected doctrine?

**Q-M7 — Measure first?** R8 §7 #5 retained the tie-break *"with telemetry first."* Does the same
discipline require an Option-S-shaped measurement on the *live* loop (not the closed run) before any
worst-of-K policy lands, given the closed-run-population limit the 2026-09-04 ruling attached to the
existing data?

**Q-M8 — The R18 boundary for a sampled verdict.** If a worst-of-K verdict is ever served, what must
it disclose (every draw, the basis, the floor attributions) and what must it never carry (a
confidence scalar)? The published sentence *"treat one call as one draw"* would need amending.

*(Held back, not urgent: whether a provenance-triggered "previously rejected" stratum is a legitimate
live trigger; whether any first-draw signal is admissible before the near-boundary population is
measured; whether sampling reaches `/api/reason`; the `complete_series()` fix's sequencing — the
session is disqualified from that one.)*

---

## 3. Questions for the founder (decisions only you can make)

**Q-F1 — Designate the W2 window's work** (F-1), after Q-M1–Q-M3 if you relay them; or now, on the
record as it stands.
**Q-F2 — Sign the staged compliance-not-virtue clause** (F-3) — the one W2 item that is authored and
waiting.
**Q-F3 — Adopt the 2026-09-13 opener** (F-2), correcting its `Q-D2-ENGINE` row's "relay pending"
phrase to "rulings adopted 2026-09-06; the build is sequenced by the mid-window ruling."
**Q-F4 — Record tonight's mark** (F-4): run the report `--dry-run` after 19:44 AEST, cross-check
`gate1.log`, and record three of four; it starts nothing.
**Q-F5 — Elect whether an Option-S-shaped measurement on the live loop is worth its spend** (the
closed run cost ≈$3.40 for 240 calls) and a fresh credential — the Option S credential was ruled
revoked "immediately"; whether that revocation is done is unverified from a repo session.
**Q-F6 — Push `4127cd6`** (and this file's commit) when you are ready; nothing is pushed.

---

## 4. The session's recommendations (marked as such; not decisions)

**R-1 (F-1).** Designate the **standing-runner track's design work** as the W2 window's primary work —
first the R8-D7 policy design against the mentor's answers to Q-M5–Q-M8, then the build brief's
second increment — and fold candidate (a)'s staged-clause application in as secondary work once F-3
is signed. Reasoning: it is the only candidate with substantial composed authoring that is not
exposed to the guard; candidate (a)'s authored remainder is mostly already composed or coupled to the
flip; candidate (b) is a guarded build, not authored work. **Condition:** Q-M3 must come back
affirming that design authoring satisfies the clock rule; if it does not, the honest answer is that no
candidate currently produces unguarded, live-surface, composed work, and Q-M2 decides everything.

**R-2 (Q-M2).** Ask it before designating any guarded-file work. If the mentor rules waivers
tolerable, the S11-D2 build becomes eligible window work with the strongest live-surface claim of all
three candidates; if not, it stays outside the window as already sequenced.

**R-3 (Q-M1).** Relay §1.2(b) as a factual correction, on the same footing as the Part-1 note the
verbatim already carries. A ruling that ranks a candidate on two discharged items should be given the
chance to re-rank.

**R-4 (R8-D7).** Treat the live gate as **W at K=1** for now (Option A), and put Q-M7 to the mentor
before any policy is designed further: the only measurement that exists is on a closed run, on one
endpoint, and it says the policy would change ~3 inputs in 24. Recommend **Option E (measure first, on
the live loop)** as the next act if the mentor confirms telemetry-first, and no build until then.

**R-5 (the D2 "ordinary days").** Do not let S11-D2 open on the count alone; the "ordinary" half of the
threshold is yours to judge, and Q-M4 should settle which window the baseline belongs to.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
