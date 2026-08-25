# Session Close — 2026-08-26 — Provenance ledger: scoping arc closed

**Stream:** founder. **Tier:** `governance` — documents only. **Risk:** Standard. **AC7 not engaged.**
No code, schema, migration, flag, credential, public surface, or live operation. **Production
byte-equivalent.**

## What was done

Recorded the mentor's ruling on the last two open questions, folded both into the scope document, then
folded in the results from all three prerequisite queries you ran. Every question this arc raised is
now ruled. The two facts the document had carried as "record claim, not verified" from the very first
close are now confirmed on live data.

## Decisions Made

- `D-PROVENANCE-LEDGER-SCOPING-ARC-CLOSED-2026-08-26`

## What's ruled

**Use `provenance_gaps`, not `coverage_gaps`.** The mentor accepted the case in full — reusing the
existing field would corrupt its meaning, and widening it would fold two genuinely different kinds of
fact into one.

**Relax the record's 404 gate.** An agent whose every mint is refused now gets a real record instead of
a 404, because a provenance refusal is exactly the kind of genuine examination the 404 rule was built
to require, not the empty-row case it was built to reject. Tied to the ledger's own flag, so it's inert
until the ledger ships.

**The dependency between those two is closed, not just resolved by coincidence.** Deferring the
harness's accreditation only stays honest once its refusal is actually visible — that was flagged two
rounds ago as an open gap, and it's now explicitly shut, in the mentor's own words.

## What your queries confirmed

**Nobody else is affected.** The population query came back with exactly one row — the harness itself.
Nothing else needed for that threshold to be defined.

**The identity conflict is real on the live row, not just in the record.** Your active consult
credential really is owner-less; your active write credential really is owner-bound. Confirmed, not
assumed.

**The window basis holds, and the one exception explains itself.** Four of five sampled agents write
within minutes of consulting, which is what justified the 90-day window. The fifth is the harness, with
a 45-day gap between its last successful write and its ongoing consults — which is exactly what a
credential stuck behind this identity mismatch looks like, not a counter-example to the pattern.

## Founder Verification

Nothing new. Everything in this close was either your own query results or documentation.

## Status Changes

- The scoping arc: **closed.** All four original questions and their sub-questions ruled.
- What's left before a build slice opens: the live attestation wording (§10 — likely just your sign-off,
  not another mentor round) and the build-shape slicing already in §13.

## Next Session Should

Whenever you're ready — either sign off on the §10 wording, or open the first build slice per §13.
Neither needs the mentor again on the strength of what's ruled so far.

## Cross-references

- `operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-ledger-q3-and-404-verbatim.md`
- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
- `operations/decision-log.md` — `D-PROVENANCE-LEDGER-SCOPING-ARC-CLOSED-2026-08-26`

**Rollback:** `git revert` the session commit. Documents only.
