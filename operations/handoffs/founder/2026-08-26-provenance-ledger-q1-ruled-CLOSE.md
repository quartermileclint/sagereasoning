# Session Close — 2026-08-26 — Provenance ledger: Q1 ruled, one dependency flagged

**Stream:** founder. **Tier:** `governance` — documents only. **Risk:** Standard. **AC7 not engaged.**
No code, schema, migration, flag, credential, public surface, or live operation. **Production
byte-equivalent.**

## What was done

Folded the mentor's Q1 ruling in. All four questions from this arc are now either ruled or carried
forward on an explicit, named basis — nothing remains silently open.

## Decisions Made

- `D-PROVENANCE-LEDGER-Q1-RULED-2026-08-26`

## Q1 — ruled

**Defer the harness's own accreditation, by name. Not a general policy toward every agent using a split
credential pair.** Merging the harness's two credentials into one would technically work, but the
mentor declined to rule it and told you plainly not to take it — the least-privilege split exists
because of a documented incident and a HIGH adversarial finding, and trading it away for provenance
coverage of a harness rather than a live practitioner surface is disproportionate. It's yours to elect
if you want it; it's not the mentor's to bless.

**A real bug in my own earlier work, caught while folding this in:** the scope document's §3 had never
been updated after a later section of the same document superseded its conclusion. §3 was still calling
"mint the harness a new bound credential" the recommended fix, when a different section — written later
that same session — had already shown that exact fix blocked by the same database constraint. It
survived two rounds of mentor consultation without being caught. Fixed now, with the old text kept
visible rather than deleted, so it's on the record rather than smoothed over.

**One thing the ruling states as settled that isn't yet, and I flagged it rather than let it pass.** The
mentor says deferring the harness is fine because "the refusal is named, not silent." That's only true
once the still-open 404 question from the prior round is answered — right now, an agent with zero
evidence gets no public record at all, so its refusal actually would be invisible. I've named this in
the document as the strongest candidate for a third mentor round, not treated it as already resolved.

## What changed structurally

The switch-on threshold in §9 is restructured, not just amended. The mentor's ruling reorders it: you
now need to measure how many agents besides the harness are in this situation *before* the threshold is
even defined, not after. If the answer is "just the harness," the whole cohort-freeze machinery I'd
built into the design last round is unnecessary — a single named exclusion replaces it. That query is
now in §12.0.

## Founder Verification

**New and load-bearing (§12.0):** the population-wide split-pair query. It's no longer just
confirmatory — it now gates how §9's threshold gets defined.

**Still owed from before:** the s9-loop consult credential's live `owner_user_id` (§12.1).

## Status Changes

- Q1: **Ruled.**
- Q2, Q3 (mechanism choice open), Q4 (404 half open): unchanged from the prior close.
- §9: restructured around the ruled sequencing.

## Next Session Should

Run §12.0's query when convenient — it's not blocking anything else, but it does gate C1's own
definition. Whether to raise the 404/harness-visibility dependency as its own mentor question, or fold
it into whenever §6.5's 404 question gets its own round, is your call — it's flagged either way.

## Blocked On

Nothing new. The 404/stub-record question (from the prior round) remains the one genuinely open design
fork.

## Cross-references

- `operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-ledger-q1-round2-verbatim.md`
- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
- `operations/decision-log.md` — `D-PROVENANCE-LEDGER-Q1-RULED-2026-08-26`

**Rollback:** `git revert` the session commit. Documents only.
