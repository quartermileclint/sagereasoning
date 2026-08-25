# Session Close — 2026-08-26 — Provenance ledger: mentor escalation, four questions

**Stream:** founder. **Tier:** `governance` — documents only. **Risk:** Standard. **AC7 not engaged.**
No code, schema, migration, flag, credential, public surface, or live operation. **Production
byte-equivalent.**

## What was done

You elected to escalate the provenance-ledger scope to the mentor, overriding its own §15 conclusion
that no question was owed. Before anything was sent, two rounds of independent adversarial review ran
against the scope document — one immediately, one specifically to check the first round's own design
arguments. **Both found real problems, including in the scope's own self-assessment of whether a
question was owed.** Everything is corrected in the scope document in place, with a notice at its head,
rather than silently rewritten.

**Result: four questions, not three.**
`operations/agent-circles-2026-08/2026-08-26-MENTOR-QUESTION-provenance-ledger-identity-and-policy.md`

## Decisions Made

- `D-PROVENANCE-LEDGER-MENTOR-QUESTION-RAISED-2026-08-26`

## The four questions, in one line each

**Q1 — the identity conflict is real, and the scope's own first-draft fix for it is blocked.** F-1
corrected the ledger's identity unit to protect your own harness. Verified: it cannot, because your two
credentials can only both be active while the consult one is owner-less — a database constraint, not a
misconfiguration — and the fix the scope first proposed (mint a fresh bound credential) hits the same
constraint. All three ways out trade away something already ruled or already documented. Unresolved.

**Q2 — the ledger's central policy question was never ruled, and this session missed it too until an
independent reviewer caught it.** What happens when a lookup succeeds and reads `supplied`? Left open,
the ledger records the exact fact that matters and gates nothing on it — the mandatory-supplied plugin
path would sail through untouched.

**Q3 — a departure from your ruling's exact wording, made without saying so.** F-2 named
`coverage_gaps` as the surface, twice, verbatim. The scope recommends a different field instead, on a
sound technical argument, but the first draft called it "answered" rather than "a departure I am asking
you to bless."

**Q4 — found only on the second review pass.** The threshold for turning enforcement on may never be
satisfiable for an agent that legitimately resubmits an old artifact, on a population that keeps
growing. And separately: the public record 404s for an agent with no evidence at all — exactly the
agent this fix is supposed to make visible — so its coverage gaps would render nowhere.

## Founder Verification

Two things, both already named in the prior scoping close and unchanged by this session:

1. **The s9-loop consult credential's live `owner_user_id`.** Query in the mentor-question doc §1.5's
   footer and the prior scope's §12.1. It decides how live Q1 is, not whether it's a real question.
2. **Nothing else.** No live surface was touched.

## Status Changes

- The ledger: **Scoped, then escalated.** Still unscheduled as a build.
- The scope document itself: corrected in eight places following adversarial review; not superseded,
  amended in place with the correction history visible.

## Next Session Should

Nothing self-starts. When you have the mentor's ruling on Q1–Q4, the next session resumes the scope
with those answers folded in, then slices the build per the (now-provisional) §13.

## Blocked On

The mentor's ruling on Q1–Q4.

## Open Questions

All four, above.

## Cross-references

- `operations/agent-circles-2026-08/2026-08-26-MENTOR-QUESTION-provenance-ledger-identity-and-policy.md`
- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md` — corrected in place
- `operations/decision-log.md` — `D-PROVENANCE-LEDGER-MENTOR-QUESTION-RAISED-2026-08-26`

**Rollback:** `git revert` the session commit. Documents only.
