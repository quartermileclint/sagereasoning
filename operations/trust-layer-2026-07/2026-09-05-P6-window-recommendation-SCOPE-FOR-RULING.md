# P6 — should the new observation window measure the decision table's recommendation? (SCOPE, FOR RULING)

**Status:** Authored 2026-09-05. **`governance` — documents only.** No code, schema, flag, credential,
migration, deploy, live op, or public-surface change; nothing built, activated, or pre-approved. This
document exists because the prior session identified the gap (Option C, Finding E) and **deliberately
declined to decide it**, judging it a ruling rather than an AI election.

**Routing recommendation: MENTOR RULING, not founder election.** The question is what part (3) of the
2026-07-12 readiness standard measures — *"a measured false-hold rate over the live distribution"* —
when "hold" is, under G6(a), what a `do-not-proceed` produces. That is an interpretation of a binding
ruling's own terms, and P6's design has been ruled on once already. §7 states what I would recommend,
disclosed as a recommendation.

**Binding context, unchanged by anything below:** the S11 flip is **REFUSED**
(`2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md`). Register **P4** (one evaluated
cardinal domain), **P5**, **P6** are open. Nothing here is progress toward the flip, and a ruling
either way moves none of them.

**⚠ The prior session's framing of this question carried a sequencing deadline. §4 finds that the
deadline's premise is not established.** That result is against the interest of the session that
produced it — the deadline was the reason this question was picked up first.

---

## 1. The question

`2026-08-15-false-hold-new-window-scoping-note.md` specifies what the new window captures: v3
regime-stamped records, the narrowed predicate frozen as the classifier, guard-path records, coverage
accounting, printed bounds, a representativeness break-out. **It never mentions the decision table or
the recommendation** — verified by grep this session, zero hits for `decision table`,
`recommendIntervention`, `InterventionRecommendation`, `do_not_proceed`.

So the window measures **hold classification** — `assessKathekonEngagement`, the rule's *input* — and
not **what the table would have recommended**, the rule's *output*. Under G6(a) a hold is what a
`do-not-proceed` produces, so part (3)'s object arguably sits one step downstream of what is captured.

**Should the window's purpose widen to cover the recommendation?**

---

## 2. Present-tense mechanism facts, timestamp-checked (PR20)

Each fact below was read at HEAD this session, and dated against the commit that last moved it. Two
were **stale in the documents that state them.**

| # | Fact (current) | Verified | Note |
|---|---|---|---|
| 1 | The P6 scoping note does not name the decision table or the recommendation | grep, HEAD | as of 2026-08-15, unchanged |
| 2 | `interventionInputFromAtAction` exists and has **no production caller** — its only callers are its own battery and a read-only script | grep across `website`, `harness` | built 2026-09-04 |
| 3 | **Guard-path capture EXISTS and is built.** `buildGuardHoldRecord` (schema v4, `path: "guard"`, `guardHold`, `guardOutcome`, `captureBasis`) is wired at three call sites in `at-action-hook.mjs`, gated on the same `GATE1_FALSE_HOLD_CAPTURE` flag | source + `git log` | **commit `3e8f231`, 2026-08-17, "R2b item 8 (P8a)"** |
| 4 | Register **P5** still reads `OPEN` and states in the present tense that *"`runGuard` writes nothing"* | register line 27 | **STALE** — true 2026-08-15, false since 2026-08-17 (fact 3). No changelog entry records the P8a build |
| 5 | Option C's Finding C repeats the same present-tense claim (*"`runGuard` writes no record; capture fires only inside `runConsult`"*) | scope doc §4 | **STALE**, same cause, written 2026-09-04 |
| 6 | Capture flag `GATE1_FALSE_HOLD_CAPTURE` appears nowhere in `.claude/settings.local.json` — the clock is stopped | grep | consistent with the 2026-07-17 stop |
| 7 | The live buffer `~/.sage-gate1/false-hold-record.jsonl` is unchanged since **2026-07-17 23:58** (138 records, all `v1`) | `ls -l`, parse | see §9 |
| 8 | Capture records store `signals` = `{proximity, virtueDomainsEngaged, obligationStatuses, circles, subSpeciesPassions}`; consult records also store `depth` | source | v3 since 2026-07-19 |
| 9 | `recordHash` hashes `JSON.stringify(r.signals)`, so any field added **inside** `signals` re-hashes every existing record and breaks ingest idempotency; top-level additions do not | `false-hold-capture.mjs` header + report script | P8a's own stated precedent |
| 10 | `interventionInputFromAtAction` reads exactly four assessment fields (`katorthoma_proximity`, `virtue_domains_engaged`, `oikeiosis`, `passion_diagnosis`) plus optional `originalDepth`, `habitualReExaminationCount`, `engagement` | `at-action-seam.ts:88-140` | built 2026-09-04 |
| 11 | No re-examination counter exists anywhere in the harness | grep `harness/**/*.mjs` — every `habitual` hit is a proximity level, not a count | see §6 |

**Fact 3 is the one that most changes the picture, and it was not visible from the question as posed.**
Both documents that frame this question describe the guard path as recordless. It has not been
recordless since 2026-08-17.

---

## 3. Finding A — the gap is real

Nothing below dissolves the substance. The window as scoped freezes `assessKathekonEngagement` as the
measured classifier and reports its classifications. Part (3)'s ratio is *"false holds on kathekon-free
actions ≤ correct holds on genuinely problematic ones"*. Under G6(a), whether an action is **held** is
decided by the table's row, not by the predicate alone: the predicate's engagement result is one input
to `interventionInputFromAtAction`, which combines it with proximity and the reducer's justice read
before `recommendIntervention` produces `do-not-proceed` / `pause` / `proceed`.

So a window that records only the classification measures a **proxy** for the quantity part (3) names.
The proxy is tight — the P1 ruling makes the filter the thing that decides the false-positive class —
but it is not the same object, and the difference was never examined when P6 was scoped, because the
seam did not exist on 2026-08-15 (it was built 2026-09-04, fact 2).

## 4. Finding B — the sequencing deadline's premise is not established

Option C §6 concludes: *"if the seam is ever to serve the window, it must land in R2 (dark, with P8a) —
not after the window opens."* The reasoning is P6's contamination rule: a capture-layer edit changes
the measured instrument, so it cannot happen mid-window.

**That reasoning is sound and its premise is that measuring the recommendation requires a capture-layer
edit. It does not.**

The recommendation is **derivable at report time from records as they already stand.** This is not an
argument; it is what this session's own verification run does, green, before any of this was written:

- `website/scripts/p1-frozen-buffer-reclassification.ts` lifts stored `signals` into an
  `AtActionAssessment`, calls `interventionInputFromAtAction`, and calls `recommendIntervention` — over
  the frozen buffer, offline, with **no capture-layer involvement whatsoever**.
- Its lift is verified non-vacuously: `✓ all 130 records round-trip exactly (130 non-vacuous
  comparisons)`, with the run aborting if the round-trip fails.
- Fact 10 confirms why this works: the seam reads exactly the four fields the stored `signals`
  projection preserves.

**Consequence: the choice is not "land it in R2 or lose the window". It is a genuine choice between
computing the recommendation at capture time (a stored field) and deriving it at report time (no
instrument change at all).** The report-time route has **no R2 deadline, no contamination exposure, and
no `recordHash` risk** (fact 9). It can be added after the window closes, or never, without touching
the measured instrument.

I would not have this document be read as saying the gap is unimportant. I am saying the *urgency*
attached to it does not survive checking, and the urgency was the stated reason to decide it now.

## 5. Finding C — P8a is built, so the precondition everyone is waiting on is partly discharged

Fact 3. Guard-path capture landed 2026-08-17 as R2b item 8, dark, behind the same flag, with its own
PR19 fold and two separately-pinned safety properties (fail-soft capture; fail-safe placement after the
deny emit). Guard records carry `guardHold` (deny only — a caution allows the tool and would make the
denominators incommensurable) and `captureBasis` distinguishing a classifiable assessment from an
outage with none.

**This matters to the question in two ways.** First, the denominator part (3) needs is no longer
unsourced at the build level — P5's blocking claim is discharged in code, awaiting activation.
Second, **guard records are exactly the population where the recommendation question bites hardest**:
`buildGuardHoldRecord` stores `guardOutcome` (the guard's own recommendation string) but stores no
table recommendation, and its `depth` is `""` — so a table row keyed on depth reads a default there.
Any ruling that widens the window's purpose has to say whether it ranges over both populations.

**Register consequence, owed independently of this ruling:** P5's row and its changelog should record
the 2026-08-17 build. The row currently asserts as present fact something a commit falsified eighteen
days ago, and Option C inherited the error from it. That is a record correction, not a status change —
activation is still open, so P5 is not closed.

## 6. Finding D — one residual binds both options equally

`habitualReExaminationCount` (the A8 two-then-escalate bound) is **not stored and not derivable** — no
re-examination counter exists anywhere in the harness (fact 11). Both a capture-time and a
report-time derivation would pass `undefined`, which the engine floors to 0
(`intervention-engine.ts:392`), so the A8 escalation row can never fire in either.

This is a real bound on any recommendation figure the window produces, and it must be **printed on the
rate** the way the mention-conversion and self-circle bounds already are (scoping note §2.5), not
footnoted. It is not a discriminator between the two options; it is a limit on the measurement itself.

## 7. The candidate resolution I would recommend, and its ground

**Recommendation: widen the window's stated purpose to cover the recommendation, and satisfy it by
report-time derivation — not by a capture-layer change, and therefore not in R2.**

1. **Yes, the window should report it.** Part (3) names a false-**hold** rate, and a hold is a table
   output. A report that shows classification alone leaves the reader to assume the mapping from
   classification to hold is total, which the P1 ruling shows it is not — the filter is precisely where
   a kathekon-free verdict stops producing a `do-not-proceed`. Reporting both columns makes the filter's
   effect visible in live data rather than only over a frozen legacy buffer.
2. **Derive it in the report script, from stored records.** §4's ground. It costs no instrument edit,
   carries no contamination exposure, and is already demonstrated working.
3. **Do not store it in the capture record.** Beyond the R2 cost, a stored recommendation freezes the
   table's reading at capture time, and the table is exactly the thing under active ruling — P1 moved
   its input on 2026-09-04, mid-arc. A derived column can be re-derived after a ruling; a stored one
   becomes stale evidence that looks authoritative.
4. **Report the two populations separately** (consult / guard, per `path`), and print the A8 bound (§6)
   and the `depth: ""` bound for guard records on the rate.
5. **Nothing is surfaced to any agent, response, or public surface.** Option C Finding D's argument
   holds unchanged: a `do-not-proceed` shown anywhere while ENFORCE is refused is claim-shaped.

**Disclosed against my own recommendation.** Three points a reviewer should press:

- **Report-time derivation is not reproducible in the way capture-time is.** A figure derived by
  today's code over old records is a statement about today's table, not about what the instrument did
  at the time. For a frozen-classifier window that is arguably a *feature*; for an audit trail it is a
  weakness. If the ruling values capture-time fidelity, that is a coherent reason to prefer storing it,
  and it would reinstate the R2 deadline. I do not think it outweighs (3), but it is the strongest
  contrary argument and it is not weak.
- **The lift's fidelity is proven on 130 v1 records, not on v3/v4 records.** The round-trip check is
  non-vacuous and the projection is a pure field map, so I expect it to hold — but "expect" is the
  honest word. A v3/v4 lift check should run before any figure is published from it.
- **Widening the window's purpose is itself the thing being ruled on**, and I am recommending it. If
  the ruling is that part (3) means the classification rate and always did, then §7.1 is simply wrong
  and the rest of this section is moot.

## 8. What this scope does NOT claim

- **Not** that P6 is discharged, scoped further, or ready to open. The window has not started; §7 is a
  recommendation about what its report should contain.
- **Not** that P8a's build discharges P5. **Activation is open**; a built-dark denominator is not a
  measured one.
- **Not** that anything here moves the flip. **P4 fails independently** (one evaluated cardinal domain);
  P5 awaits activation; P6 has not started. The flip remains **REFUSED**, needs its own founder-walked
  Critical activation, and **nothing in this document licenses it.**
- **Not** a licensing of R2's contents. §4's whole point is that this question need not consume R2 at
  all; R2's contents remain the founder's regardless.
- **Not** a re-opening of the four-part standard, Q2's staging, or the P1 ruling. All stand as given.
- **Not** verified against production. Every finding is a first-hand read of the repository at HEAD
  plus one green local script run.

## 9. Incidental finding, recorded rather than chased

**The frozen evidence buffer is a prefix of the live one, and the difference is undisclosed.**
`operations/trust-layer-2026-07/runs/2026-07-17/false-hold-record-FROZEN-2026-07-17.jsonl` holds 130
records; the live buffer holds **138**, all `v1`. The frozen file is an exact **prefix** of the live
file — the extra 8 were captured on 2026-07-17 from 12:15 onward, after the freeze snapshot was taken
and before the flag was unset that evening. There is no note in the `runs/2026-07-17/` directory
recording the cut.

**So every figure this project has published "over the frozen 130" is over a prefix of the first
window's capture, not over the whole of it.** I do not think this changes any conclusion — the buffer
is explicitly not reusable for part (3), P4 and P5 fail for unrelated reasons, and the 8 records are
the same tool class as the rest (`Edit`, `reopened`) so they would not repair representativeness. But
it is a discrepancy between a record and its description, it was found by checking rather than
assuming, and it should be either documented at the freeze or the freeze re-taken. **Not fixed here** —
touching a frozen evidence file is not a documents-only act, and the register's reproduction check is
calibrated against the 130.

---

*Sources read first-hand this session: `2026-08-15-false-hold-new-window-scoping-note.md` (in full);
`2026-09-04-C-at-action-seam-caller-SCOPE.md` (in full); `2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md`
(as the template this mirrors); `S11-FLIP-PREREQUISITES-REGISTER.md` §A P1/P2/P4/P5/P6, §D D4, changelog;
`at-action-seam.ts`; `false-hold-capture.mjs`; `at-action-hook.mjs:440-500`;
`p1-frozen-buffer-reclassification.ts`; `session-state.mjs`; `git log` for
`harness/.../lib/false-hold-capture.mjs`. Batteries re-run green at open: frozen-buffer script
(reproduced 129, Q2 floor HOLDS), `at-action-seam.test.ts` 59/0, `negative-battery.mjs` 251/0 RELEASE
GATE PASS.*
