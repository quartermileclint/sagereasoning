# Mentor ruling — verbatim — C2 reachability, and the step-5 record correction

**Ruled 2026-08-30.** Answers
`2026-08-30-MENTOR-QUESTION-provenance-ledger-C2-reachability.md`. **This file is canonical; where any
summary, close, or decision-log entry differs from the text below, the text below wins.**

> **⚠ PREMISE CORRECTION — RAISED AND RESOLVED, 2026-08-30.** The first ruling's stated premise —
> *"No completed accreditation write has occurred in the trailing 30 days by any agent"* — **was
> false**, and the error was this project's, in the question. One agent
> (`sagereasoning:stoa-q5c-smoke@v1`) wrote on 2026-08-12. The mentor **accepted the erratum,
> WITHDREW the first ruling's option-(a) discharge, and issued a REVISED conditional ruling** — see
> **§ Revised ruling (2026-08-30)** at the foot of this file. **The condition was verified and holds;
> option (a) is reinstated on the corrected basis.** The first ruling's text below is **NOT altered**
> — it is the record of what was ruled on the facts as given.

**Dispositions in brief** (a reader's index, not a substitute for the text):

| Question | Ruling |
|---|---|
| Sub-question — correct step 5 now? | **Yes, before any other action, not waiting on the C2 ruling** |
| C2 — population | **Option (a)** — vacuous as C1 is, with a mandatory re-check at switch-on |
| C2 — observation | **Option (d)** — reading B reinstated, **scoped**: point-in-time, run once, not scheduled |
| Option (b) — classify on the 409 path | **Ruled out** |
| Option (c) — give the harness an update path | **Ruled out** |

---

## Sub-question — should the carried step 5 instruction be corrected in the record now?

> Yes, independently of everything else.
>
> The instruction tells the founder to watch classify log lines accumulate. That observation cannot
> succeed on current mechanics. The Stoa incident's lesson is stated correctly in the question: the
> durable harm is the contradiction persisting in the record, not the inert interval.
>
> The step 5 instruction is corrected now to read: "the classification pipeline is active and
> record-only; on current mechanics it will not produce log lines until the C2 discharge path below is
> implemented; the watch instruction is superseded by this correction."
>
> That correction goes into the record before any other action. It does not wait on the C2 ruling.

---

## C2 — How should it be discharged?

> The ruling is: option (a) for the population question, option (d) for the observation question, with
> a defined scope that addresses the sync-drift objection directly. The two parts are separable and
> ruled separately.
>
> **On the population question — C2 is vacuous as C1 is.**
>
> C2's denominator is empty. No completed accreditation write has occurred in the trailing 30 days by
> any agent. The only agent that could populate it is the one §3.3 defers by name. The C1 precedent
> applies: an empty population satisfies a universal claim vacuously, and the mandatory re-check at
> switch-on is the honest companion to that declaration.
>
> C2 is declared satisfied on an empty population as of the measurement date, with a mandatory
> re-check at switch-on if any agent onboards.
>
> The question the executing session raised — whether C2's two-week clause prevents the vacuous
> discharge — is examined and answered. The two-week clause requires observation across at least two
> consecutive weeks of record-only operation. Its purpose is to prevent a single-point measurement
> from standing in for a pattern. On an empty population, there is no pattern to observe and no
> single-point measurement to guard against. The clause's purpose is not defeated by the vacuous
> discharge — it is simply inapplicable when the denominator is zero. The re-check at switch-on is
> what gives the clause its force when the population becomes non-empty.
>
> **On the observation question — reading B, scoped.**
>
> The prior ruling rejected reading B for an ongoing observation on the ground that a mirrored script
> is the wrong shape for ongoing observation and the right shape for a retrospective audit. That
> reasoning was correct given the assumption that there was an ongoing stream to observe. The
> mechanism facts now establish there is no ongoing stream. The situation is precisely the one the
> prior ruling named as reading B's proper domain: a retrospective audit of a population that is not
> actively generating new records.
>
> Reading B is reinstated for this purpose only: a founder-run retrospective tally against the ledger,
> scoped to the C2 discharge, not to ongoing monitoring.
>
> The sync-drift objection is addressed by scope definition: the tally runs once, at the time of C2
> discharge, against the ledger as it stands at that moment. It does not run on a schedule. It does
> not attempt to track an ongoing stream. Its output is a point-in-time record of what the ledger
> contains, used to confirm the vacuous population finding and to establish the baseline the re-check
> at switch-on will measure against. A point-in-time retrospective tally does not drift because it
> makes no claim about a subsequent state.
>
> Options (b) and (c) are ruled out.
>
> Option (b) classifies on the conflict path — 409 responses — and the honest objection the question
> raises is correct: a refused write is not an accreditation write in C2's sense. Generating
> observations from refused writes would produce a record that appears to answer C2's question while
> answering a different one. That is the confidence-exceeds-evidence failure the disclosure rulings
> have consistently named.
>
> Option (c) gives the harness an update path, which changes harness behaviour and starts writing
> trust events for the harness again. Every resulting classification would be identity_mismatch by
> construction, producing observations of a known refusal at the cost of a behaviour change. That is a
> higher cost than the problem warrants, and the observations it produces would not advance C2's
> purpose.

---

## What this ruling does not touch

> The §3.3 deferral is working as designed and is not revisited. Slice 2 is not defective — it does
> what its documents say, and the mechanism that prevents classification from running is orthogonal to
> slice 2's correctness. Slice 3 is unblocked and reads a table that is legitimately empty. None of the
> standing constraints — weights-BLOCKED, Q1, the §A boundary — are affected.

---

## Implementation notes (this document's, NOT the mentor's)

Everything above this line is the mentor's text. Everything below is the executing session's reading
of what it obliges, and is subordinate to it.

1. **The step-5 correction was applied first, alone, in commit `8a34e18`** — ahead of this file, which
   is why the correction's pointer to this file was a forward reference at its commit time. That was a
   deliberate choice to honour *"before any other action"* literally rather than bundle for tidiness.
2. **The tally is scoped by the ruling itself and must not exceed it.** Run **once**, point-in-time,
   **no schedule**, no ongoing-stream claim. Anything that made it recurring would reinstate exactly
   the sync-drift shape the round-6 ruling rejected and this ruling only conditionally reopened.
3. **Two outputs are required of it,** both named in the ruling: *confirm the vacuous population
   finding*, and *establish the baseline the re-check at switch-on will measure against.*
4. **The re-check at switch-on is now a hard C2 obligation, not a courtesy.** It must be carried into
   the slice-5 prerequisites so it cannot be lost between here and switch-on.
5. **C2's discharge does not discharge C3 or C4.** C3 (90-day soak) is at 4 days; C4 (the surface live)
   is slice 3's job. C2 being satisfied moves one of four conditions.


---

# Revised ruling (2026-08-30) — verbatim — after the premise correction

Answers `2026-08-30-MENTOR-CORRECTION-C2-population-premise-was-wrong.md`. **This supersedes the
first ruling's population disposition and leaves everything else standing.**

## The erratum is accepted and the prior ruling is corrected

> The prior ruling declared C2 satisfied on an empty population. That declaration rested on a stated
> basis that is now confirmed false: the claim that no completed accreditation write had occurred in
> the trailing 30 days. `sagereasoning:stoa-q5c-smoke@v1` had a seed write on 2026-08-12, inside the
> window. The `credential-completed` signal under-reported because the Q5c teardown deleted that
> agent's trust-event rows while leaving its accreditation row standing.
>
> The stated basis is wrong. C2 is not declared discharged. The prior ruling's option (a) discharge is
> withdrawn.
>
> The sub-question ruling stands independently. The step 5 instruction is corrected in the record
> regardless of how C2 is ultimately discharged. That correction does not depend on the population
> premise and is not affected by the erratum.

## C2 — Revised ruling on the population question

> The population question must now be re-examined on the correct basis. The correct basis is SCOPE's
> pre-ledger exclusion, which the erratum names as a possible surviving ground. The question is
> whether the stoa-q5c-smoke write on 2026-08-12 falls inside or outside the ledger's scope.
>
> The ruling is: the pre-ledger exclusion applies, and the population remains effectively empty for
> C2's purposes, but the reasoning is different from the prior ruling and must be stated precisely.
>
> SCOPE's pre-ledger exclusion excludes writes that predate the ledger from C2's denominator. The
> ledger's activation date and the stoa-q5c-smoke write date determine whether the exclusion applies.
> If the write on 2026-08-12 predates the ledger's activation, it falls outside C2's scope by SCOPE's
> own terms. If it postdates activation, it is in scope and the population is non-empty.
>
> The executing session must verify this against the ledger's activation date before the revised
> ruling is applied. This is a named contested fact — not asserted, verified before acting. The
> §PRE/§VERIFY discipline applies here exactly as it applied to the migration question in the Q1
> ruling.
>
> The revised ruling is conditional: if the 2026-08-12 write predates ledger activation, the
> pre-ledger exclusion applies, the population is empty on the correct basis, and option (a) is
> reinstated with the corrected reasoning. If the write postdates activation, the population is
> non-empty, option (a) is not available, and the C2 discharge question returns for a further ruling
> with the correct population stated.

## What does not change

> The option (d) ruling — reading B reinstated for retrospective tally, scoped to a point-in-time
> record — stands regardless of the population question's resolution. Whether the population is empty
> or non-empty, the observation mechanism question remains: the record-only classification pipeline
> cannot produce the observation C2 asks for on current mechanics. Option (d) is the correct shape for
> a retrospective audit of a population that is not actively generating new records. That reasoning is
> not affected by whether the population contains one agent or zero.
>
> Options (b) and (c) remain ruled out for the reasons stated in the prior ruling. The erratum does not
> change the analysis of either.

---

## §VERIFY — the named contested fact, verified before acting (this session, 2026-08-30)

**The condition HOLDS under four independent lines, which agree:**

| Check | Value | Source |
|---|---|---|
| Ledger **activation** date | **2026-08-26** | `D-PROVENANCE-LEDGER-SLICE2-ACTIVATION-LIVE-2026-08-26` |
| Consult-side write **code** first committed | **2026-08-26** (`935fae6`) | `git log` on `provenance-ledger-store.ts` |
| Earliest ledger row, **global** | **2026-08-26T06:28:15.863Z** | live production read |
| Ledger rows **ever for that identity** | **0** | live production read |
| **The contested write** | **2026-08-12T04:47:29Z** | `agent_accreditation.created_at` |

**The write predates ledger activation by 14 days.** On 2026-08-12 the ledger's consult-side write
path **did not exist in the codebase**, so it could not have recorded for any identity under any flag
state — the strongest of the four lines, and independent of the other three.

**Both readings of SCOPE's clause were computed and agree** (`readings_agree: true`,
`reading_divergence: []`): the GLOBAL reading (write < earliest ledger row) and the literal
PER-IDENTITY reading (*"began recording for its identity"*). The tally applies the exclusion only when
**both** hold.

**Therefore, per the revised ruling's conditional: the pre-ledger exclusion applies, C2's population
is empty on the corrected basis, and option (a) is REINSTATED with the corrected reasoning.**

**C2 IS DISCHARGED** — on **SCOPE's pre-ledger exclusion**, *not* on the C1 empty-population
precedent. Evidence: `runs/2026-08-30/c2-discharge-baseline.json`.

### One thing surfaced, not relied on

Under the strict per-identity reading, an identity the ledger has **never** recorded for has no
*"began recording"* point, so every artifact for it is pre-ledger and excluded. That is the literal
text, and it is conservative in the right direction here. **But at switch-on, with a real population,
it could exclude an agent that simply never consulted** — a possible loophole in the clause as
written. **This run's conclusion does not depend on it** (the global reading gives the same answer),
so it is named for the mentor rather than resolved here.

### The standing obligations this discharge carries

1. **The re-check at switch-on is a HARD C2 obligation, not a courtesy** — it must ride into the
   slice-5 prerequisites. It is what gives the two-week clause its force when the population becomes
   non-empty.
2. **C2's discharge does NOT discharge C3** (90-day soak — at ~4 days) **or C4** (the surface live —
   slice 3's job). One of four conditions has moved.
3. **The tally must never be scheduled.** Recurring it reinstates the sync-drift shape round 6
   rejected.
