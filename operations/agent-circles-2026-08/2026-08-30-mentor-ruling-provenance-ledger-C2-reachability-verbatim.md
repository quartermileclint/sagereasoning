# Mentor ruling — verbatim — C2 reachability, and the step-5 record correction

**Ruled 2026-08-30.** Answers
`2026-08-30-MENTOR-QUESTION-provenance-ledger-C2-reachability.md`. **This file is canonical; where any
summary, close, or decision-log entry differs from the text below, the text below wins.**

> **⚠ PREMISE CORRECTION — 2026-08-30, same day, raised BEFORE any discharge was declared.** The
> ruling's stated premise — *"No completed accreditation write has occurred in the trailing 30 days by
> any agent"* — **is false**, and the error was mine, in the question. One agent
> (`sagereasoning:stoa-q5c-smoke@v1`) wrote on 2026-08-12. **The mentor's text below is NOT altered**
> — it is the record of what was ruled on the facts as given. **C2 is NOT declared discharged**
> pending the mentor's answer to `operations/agent-circles-2026-08/2026-08-30-MENTOR-CORRECTION-C2-population-premise-was-wrong.md`. The step-5 correction is unaffected and stands.

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
