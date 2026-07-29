# Session Close — 2026-07-29 — Fix `emitAccreditationTrustEvents` correlationId Ordering

**Stream:** founder (substrate / Trust Layer S1).
**Governing frame:** `/adopted/standing-protocol-cache.md`. Not a build-sessions-protocol session.
**Tier:** `code-elevated`. Live production code (Trust Layer S1, flag already on since 2026-07-11), but a narrowly-scoped single-function fix with a regression test — not a schema/flag/perimeter change. AC7/PR6/PR17 not engaged.
**Date:** 2026-07-29.

## Decisions Made

`D-EMISSION-HOOKS-CORRELATIONID-ORDER-FIX-2026-07-29` appended (`operations/decision-log.md`). The correlationId-ordering defect confirmed and deliberately deferred at the 2026-07-28 A2 session is now fixed at the root.

## What was wrong

`emitAccreditationTrustEvents` derived its idempotency `correlationId` by hashing the write's signed-assessment signatures **in submitted array order**, not a canonical order. A retry resubmitting identical evidence in a different order produced a different `correlationId`, bypassing the `(correlation_id, event_type, virtue_domain)` unique-index dedup and potentially double-counting one accreditation write as two events in the live S1 `agent_trust_state` fold.

## What was verified before fixing

The paired next-session prompt explicitly warned not to assume the prior session's framing ("still open") was still accurate. Checked: `git log --since="2026-07-28"` on the file returned nothing since `679d343` (well before the finding); direct source read confirmed the unsorted `.join('|')` was still present. Confirmed genuinely open before touching anything.

## The fix

Sort the signature array before joining/hashing (`.slice().sort()`). One function, one file (`website/src/lib/substrate/trust-core/emission-hooks.ts`, `emitAccreditationTrustEvents` only) — the other three emission functions key off a session ID string, not a hashed array, and were confirmed unaffected by reading each directly.

## Status Changes

| Item | Old | New |
|---|---|---|
| `emitAccreditationTrustEvents` correlationId | unsorted signature join — order-sensitive, can double-count on retry | sorted before hash — order-independent |
| `emission-hooks.test.ts` | 15/0 | **19/0** (+leg D, 4 assertions, non-vacuity proven) |

## Verification

- `emission-hooks.test.ts`: 19/0.
- `tsc --noEmit`: clean.
- The sole live caller's battery, `accreditation/[agent_id]/__tests__/route.test.ts`: **90/90** (run with `--env-file=.env.local` per the standing `supabase-server.ts` module-load requirement; the process hung post-completion on the known `tsx`-keepalive class — output was read directly and confirmed complete and green *before* the process was killed, not inferred from a truncated run).
- Adjacent batteries unaffected: S1 trust-core 98/0, S3 combiner 106/0, loop-fold 181/0, kathekon-engagement 105/0.
- `grep` confirmed no other file references `sigDigest` — the change is isolated to its one call site.

## What went wrong, and what it taught

Nothing went wrong in the fix itself. The one friction point was environmental: the Bash tool's working directory silently reverted to the repo root between some commands (not every `cd` persisted as expected), and a `timeout`-wrapped test run failed because `timeout` isn't installed on this macOS host — both diagnosed from their actual error output rather than assumed, and worked around with `nohup ... &` plus explicit `cd` on each command that needed the `website/` directory. Worth remembering for future sessions on this same host: don't assume Bash cwd persistence across every command type, and `timeout` needs `coreutils`/`gtimeout` or an alternative (background + poll) on macOS.

## Next Session Should

Nothing is gated on this session. See the paired next-session prompt for the standing list of non-blocking follow-ups — none newly urgent from this session, one newly closed (this fix).

## Production State at Session Close

**Not byte-equivalent — deliberate.** The fixed file is already-live, already-flag-on production code (`SUBSTRATE_TRUST_CORE_ENABLED=true` since 2026-07-11), so the founder's next push **is** the activation of this fix; there is no separate flag to flip. Before the push, production runs the pre-fix (order-sensitive) formula; after, the fixed one.

## Files touched

- `website/src/lib/substrate/trust-core/emission-hooks.ts`
- `website/src/lib/substrate/trust-core/__tests__/emission-hooks.test.ts`
- `operations/decision-log.md` (this session's entry)
- `operations/handoffs/founder/2026-07-29-emission-hooks-correlationid-fix-CLOSE.md` (this file)
- `operations/handoffs/founder/2026-07-29-emission-hooks-correlationid-fix-NEXT-SESSION-PROMPT.md` (paired next prompt)

**Committed** — `d32f6a8` (the code + test only; the decision-log and handoff files are uncommitted as of this close, per usual — the founder folds records commits in on their own cadence unless asked to do it now).

## Blocked On

Nothing. The one item this session was scoped to is closed. A retroactive audit of `agent_trust_events` for historical double-counting under the pre-fix formula is named but not scoped — the founder's call whether it's worth pursuing.
