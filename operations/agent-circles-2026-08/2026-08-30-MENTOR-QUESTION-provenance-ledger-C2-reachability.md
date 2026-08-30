# Mentor question — the round-6 ruling was implemented exactly, and C2 still cannot be observed

**Raised 2026-08-30.** One question. **It reopens nothing.** The round-6 Q5 ruling was implemented
faithfully — this document does not dispute it, and the evidence below is that it was followed to the
letter. The question is what to do about a fact that neither the round-6 question nor its ruling had
in view.

**Evidence document:**
`2026-08-30-provenance-ledger-C2-observation-input-unreachable-FINDING.md` (same directory) — every
figure below was counted first-hand this session against production and the founder-loop log.

---

## The situation

Round 6 asked whether slice 2 should build §5's classification logic in record-only mode (reading A)
or defer it to a standalone founder-run script (reading B). **You ruled reading A, and the stated
reason was measurability:**

> *"The reasoning is in §9's C2 threshold itself… There is no way to observe that without something
> classifying each submitted artifact against the ledger during the record-only window."*

and

> *"A mirrored script is the wrong shape for an ongoing observation — it is the right shape for a
> retrospective audit."*

Slice 2 built it that way. `classifyProvenanceArtifact` is pure, its eligibility predicate is in its
own contract as you directed, and it is wired at `emitAccreditationTrustEvents`, record-only —
classify, log, return, never refuse, never write a gap row. It was activated live on 2026-08-26.

**In the four days since, it has classified nothing, and on current mechanics it never will.**

## Why — the mechanism neither the question nor the ruling had

Classification is reached only from the accreditation-write route. But the route disambiguates seed
from update *before* the emission call:

```ts
if (validated.body.kind === 'seed' && existing !== null) {
  return buildWriteConflictResponse()          // 409 — returns here
}
```

The only agent writing accreditations is the harness, and its close hook sends exactly one body kind:
`kind: "seed"`. The `sagereasoning:s9-loop@v1` row already exists. So every close-hook write returns
409 before classification.

| | |
|---|---|
| Ledger rows accumulated since activation | **187** — the write side is healthy |
| Session closes since activation | **15**, of which `accred=already-exists` | **15 of 15** |
| `accred=written` anywhere in the log's 2026-07-12 → 2026-08-30 span | **0** |
| `credential-completed` trust events since activation | **0** |
| Most recent completed accreditation write **ever** | 2026-07-29 — **32 days ago**, a smoke agent |

So: reading A was chosen over reading B **because B could not observe C2**, and A, correctly built,
also does not observe C2 — for a reason orthogonal to the choice between them.

## A second fact, which may be the more important one

C2 is scoped to *"every agent with an accreditation write in the trailing 30 days."* **There has been
no completed accreditation write in the trailing 30 days by any agent.** C2's denominator is empty.

This has an exact precedent in your own §9 reasoning for **C1**, which SCOPE resolves this way:
*"the population is empty — every other agent already coheres… C1 is satisfied as of the measurement
date"*, with a prudent re-check at switch-on. Whether the same move is available to C2 is not
obvious, because C2 carries a clause C1 does not: *"observed across at least two consecutive weeks of
record-only operation."* An empty population can be 100% resolved vacuously; it is less clear it can
be *observed* for two weeks.

## The question

**Given that the record-only classification pipeline is structurally unable to produce the
observation C2 asks for, and that C2's population is in any case empty — how should C2 be
discharged?**

Four shapes, **offered as a case rather than a decision**, and not mutually exclusive:

**(a) C2 is vacuous, as C1 is.** The only agent that could populate it is the one §3.3 defers by
name. Declare C2 satisfied on an empty population as of the measurement date, with a mandatory
re-check at switch-on if any agent onboards. Cheapest, and consistent with C1's treatment — but it
discharges a threshold by observing nothing, which may be exactly what C2's two-week clause was
written to prevent.

**(b) Classify on the conflict path too.** Move or duplicate the record-only classification so it
also runs when a seed write 409s. Record-only, so it changes no outcome and refuses nothing. The
honest objection: a 409 is not *"an accreditation write"* in C2's sense — it is a refused one — so
this may generate observations that do not answer the question C2 asks.

**(c) Give the harness an update path.** Its close hook only ever seeds; a hook that sent `update`
when a row exists would complete, emit, and classify. This makes C2 observable with real traffic —
but it changes harness behaviour, starts writing real trust events for the harness again, and every
resulting classification would be `identity_mismatch` anyway (all 187 rows are
`identity_kind: 'credential'`; the harness consult credential is owner-less, so it refuses by
construction, exactly as §3.3 intends). So it would produce observations of a *known* refusal, at the
cost of a behaviour change.

**(d) Reinstate reading B for this purpose only.** A founder-run retrospective tally against the
ledger. You rejected this for an *ongoing* observation, and rightly — but there is no ongoing stream
to observe, which is precisely the situation you said a script is the right shape for: *"the right
shape for a retrospective audit."* The sync-drift objection stands and would need managing.

**A sub-question, if it bears:** should the slice-2 close's carried step 5 — *"watch the classify log
lines accumulate"* — be corrected in the record now, independently of which shape you choose? It
instructs the founder to perform an observation that cannot succeed, and this arc's own standing
lesson from the Stoa incident is that **the durable harm is the contradiction persisting in the
record**, not the inert interval.

## What is not being asked

- **Not** whether slice 2 is defective. It is not; it does what its documents say.
- **Not** whether the harness should stop being deferred. §3.3's deferral is ruled and is working as
  designed.
- **Not** anything bearing on weights (BLOCKED), Q1, the §A boundary, or the 0h call.
- **Not** slice 3, which is unblocked and reads a table that is legitimately empty.

*End of question.*
