# Session Close — 2026-08-26 — Provenance ledger: the two missing cases done and sent

**Stream:** founder. **Tier:** `governance` — documents only. **Risk:** Standard. **AC7 not engaged.**
No code, schema, migration, flag, credential, public surface, or live operation. **Production
byte-equivalent.**

## What was done

The two pieces of work flagged as owed but not yet done: Q3's case (already written, never actually
sent) and a genuine argued case for the 404 question (previously just two names on a list). Both are
now sent in one relay.

## Decisions Made

- `D-PROVENANCE-LEDGER-Q3-AND-404-CASED-2026-08-26`

## What I found while doing the 404 work

A claim I'd made earlier — that a "stub record" fix would be nearly free because it reuses existing
machinery — was wrong, and I only found that by actually tracing the code instead of asserting it a
third time. The relevant branch in the response-builder has never actually run: it's reachable in
principle but the one real code path that calls it never hits it. Building the fix means genuinely
exercising that branch for the first time, not reusing something proven.

Tracing it also clarified what the fix actually is, more precisely than before: it's not "compose a new
kind of response," it's one boolean condition. The record 404s today because of a single check — "does
any domain have evidence" — and a zero-evidence agent otherwise gets a perfectly normal, honestly
self-describing profile. Widening that one check to also admit "does this agent have a named provenance
refusal" is a smaller, more precise change than I'd framed it as.

## The case I ended up making

That widening is the right call, argued on the original reason the 404 exists in the first place — not
just "F-2 wants it visible." The 404 was built to reject a specific bad pattern: a bare row that looks
like evidence but isn't. A provenance refusal isn't that — it's the ledger genuinely looking at
something and reaching a real verdict. I made the case that extending the gate to admit it is honoring
what the 404 rule was actually for, not working around it.

I also weighed the separate-endpoint alternative seriously rather than dismissing it, and concluded it
only stays honest if the existing 404 itself points to it — otherwise you'd have a working endpoint
nobody following the documented path would ever find. Once that's priced in, it's not actually simpler.

## What's sent

`operations/agent-circles-2026-08/2026-08-26-MENTOR-QUESTION-round4-provenance-ledger-q3-and-404.md` —
whenever you're ready to relay it.

## Founder Verification

Nothing new to verify — this round was source verification I did myself, not something requiring your
access.

## Status Changes

- Q3: cased and sent (was: cased, not sent).
- The 404 question: cased and sent (was: two names, no case).
- Everything else: unchanged from the prior close.

## Next Session Should

Relay the round-4 question when ready. Separately, §12.0's population query is still worth running when
convenient — not blocking, but it decides how much of §9's threshold work is actually needed.

## Cross-references

- `operations/agent-circles-2026-08/2026-08-26-MENTOR-QUESTION-round4-provenance-ledger-q3-and-404.md`
- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
- `operations/decision-log.md` — `D-PROVENANCE-LEDGER-Q3-AND-404-CASED-2026-08-26`

**Rollback:** `git revert` the session commit. Documents only.
