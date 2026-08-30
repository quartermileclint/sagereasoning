# Correction to the mentor — the C2 population premise I supplied was wrong

**Raised 2026-08-30, same day as the ruling it corrects.** **This is a correction of my own error, not
a request to revisit a ruling on its merits.** The C2 ruling
(`2026-08-30-mentor-ruling-provenance-ledger-C2-reachability-verbatim.md`) rests on a factual premise
that I supplied in the question and that is **false as stated**. The conclusion may well survive —
which is precisely why this is raised rather than absorbed.

## What I told you

In `2026-08-30-MENTOR-QUESTION-provenance-ledger-C2-reachability.md`:

> **There has been no completed accreditation write in the trailing 30 days by any agent.** C2's
> denominator is empty.

The ruling adopted it and built on it:

> C2's denominator is empty. No completed accreditation write has occurred in the trailing 30 days by
> any agent. The only agent that could populate it is the one §3.3 defers by name. **The C1 precedent
> applies: an empty population satisfies a universal claim vacuously.**

## What is actually true

**`sagereasoning:stoa-q5c-smoke@v1` has an accreditation row created 2026-08-12** —
`created_at == updated_at`, i.e. exactly one write, a seed, **18 days ago, inside the 30-day window.**
**C2's agent population is not empty. It has one member.**

**Why I missed it.** I used `credential-completed` trust events as the sole population signal. That
signal **under-reports**, and it under-reports for a reason specific to this project: **trust-event
rows are deletable, and smoke teardowns delete them.** The Q5c activation teardown deleted that
agent's `agent_trust_events` rows while leaving its `agent_accreditation` row standing. The write
happened; the evidence I looked for had been cleaned up. **An absent event is not evidence of an
absent write, and I treated it as though it were.**

The error was caught by the discharge tally's own dual-observable check, which reads a second,
independent signal and refuses to reconcile a divergence silently. It fired on the first run and
exited non-zero.

**A second, opposite error was caught in the same run.** My first draft used
`agent_accreditation.updated_at` as that second signal. It **over-reports**: the Sage Reflect feed
calls the same `upsertAccreditationRecord` chokepoint (`sage-reflect/sage-assent-feed.ts:177`), so the
harness's reflect-at-close bumps `updated_at` on **every session close** with no accreditation write
occurring. That draft wrongly placed `sagereasoning:s9-loop@v1` in the population. The population
signal is now `created_at` (a seed write, durable), with `updated_at` reported as a diagnostic and
explicitly labelled *not* a population signal.

So: **neither of the two obvious observables is sound alone** — one under-reports through deletion,
the other over-reports through a shared write chokepoint. That fact seems worth keeping regardless of
how this question resolves.

## Why the conclusion probably survives — and why I am not treating that as sufficient

The one population member wrote on **2026-08-12**. The ledger began recording on **2026-08-26**. So
its submitted artifacts **predate the ledger**, and SCOPE's own C2 redefinition already governs that
case, verbatim:

> Artifacts consulted before that point are honestly `no_ledger_entry` forever, are named as such, and
> are **EXCLUDED from C2's completeness denominator**.

Its ledger-eligible artifact set is therefore **empty**, and *"100% of that write's ledger-eligible
submitted artifacts resolving"* is satisfied **vacuously for that agent**.

**But the vacuity is at a different level than the ruling states, and rests on a different clause.**
The ruling discharges C2 on an **empty agent population** via the **C1 precedent**. What actually
obtains is a **non-empty agent population** whose **per-agent artifact sets are empty** via **SCOPE's
pre-ledger exclusion**. Same conclusion; different basis. I am not competent to decide that the
substitution is harmless, and the temptation to call it harmless — because it lands in the same place
— is exactly the confidence-exceeds-evidence move the disclosure rulings keep naming.

## The question

**Does the C2 discharge stand on the corrected facts?** Specifically:

1. **Is the pre-ledger-exclusion basis an adequate substitute for the empty-population basis**, or does
   a non-empty population change what C2 requires — for instance by making the two-week observation
   clause applicable again, where the ruling held it *"simply inapplicable when the denominator is
   zero"*?
2. **Should a torn-down smoke artifact count as an agent in C2's population at all?**
   `sagereasoning:stoa-q5c-smoke@v1` has a revoked credential and its trust events were deleted; only
   the accreditation row survives, apparently because the teardown did not cover that table. If it
   should not count, the population is empty and the original ruling stands verbatim — but that is a
   judgement about what an "agent" is, not a fact I can settle.
3. **Is the residual smoke row itself a defect worth fixing** — a teardown that deleted three tables
   and missed a fourth? It is now load-bearing on a readiness threshold, which is more weight than a
   leftover should carry.

**What has NOT been done, pending your answer:** C2 is **not** declared discharged. The tally has been
built and run, and its point-in-time baseline is recorded
(`runs/2026-08-30/c2-discharge-baseline.json`), because the ruling calls for exactly that artifact and
it is needed either way. **Nothing has been declared satisfied on it.**

The step-5 correction **was** applied first and stands, per your instruction that it does not wait.
Nothing in this correction bears on it.

*End of correction.*
