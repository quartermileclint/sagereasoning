# Session Close — 2026-08-26 — Provenance ledger: R18 sign-off recorded, scoping document fully closed

**Stream:** founder. **Tier:** `governance` — documents only. **Risk:** Standard. **AC7 not engaged.**
No code, schema, migration, flag, credential, public surface, or live operation. **Production
byte-equivalent.**

## What was done

Recorded your sign-off on the two remaining items. This finishes the scope document.

## Decisions Made

- `D-PROVENANCE-LEDGER-R18-SIGNOFF-2026-08-26`

## What I locked in, and one thing worth knowing

**The attestation wording is now an exact sentence, not a placeholder.** The document had only carried
an illustrative "e.g." version before — I didn't think that was precise enough to actually sign off on,
given this whole arc exists because a served claim's wording wasn't pinned down carefully enough once
already. So I locked a specific, minimal-diff replacement: only the trigger clause changes, from "is in
place" to "begins enforcing which events are minted." Everything else in the sentence stays untouched.
That's what's now signed, at `SCOPE.md §10`.

**While recording the build-sequencing sign-off, I found a real stale item and fixed it rather than
carry it forward.** Slice 4 in the plan still described minting the harness a new credential — the
very first fix I proposed for the identity conflict, before finding it was blocked by the same database
constraint driving the whole problem. That got superseded two rounds ago, but the slice list itself was
never updated to match. Under the ruling you already have (defer the harness, no general policy), no
credential action is needed there at all — slice 4 is now retired with that stated plainly, rather than
left as an instruction a future build session might have tried to literally execute.

## What sign-off on sequencing means, and what it doesn't

This approves the order to build in. It's not a "start now" — every slice in §13 is still its own
founder-walked step, opened individually whenever you elect to.

## Status

The scope document is done. Every question this arc raised across five mentor rounds is ruled. Both
things delegated to your own sign-off are signed. Nothing is built.

## Next Session Should

Whenever you're ready, open slice 1 (`SCOPE.md §13`) — the two migrations, TEST then production, inert.

## Founder Verification

Nothing new.

## Cross-references

- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
- `operations/decision-log.md` — `D-PROVENANCE-LEDGER-R18-SIGNOFF-2026-08-26`

**Rollback:** `git revert` the session commit. Documents only.
