# Session Close — 2026-07-29 — Live Verification of the correlationId Ordering Fix

**Stream:** founder (substrate / Trust Layer S1).
**Governing frame:** `/adopted/standing-protocol-cache.md`. Not a build-sessions-protocol session.
**Tier:** `code-elevated` verification — no code change recorded this session; a throwaway prod credential mint + two real writes + one SQL read, all founder-performed (only the founder holds a usable prod admin JWT in this environment). AC7/PR6/PR17 not engaged.
**Date:** 2026-07-29 (same day as, and a direct continuation of, `2026-07-29-emission-hooks-correlationid-fix-CLOSE.md`).

## Decisions Made

`D-EMISSION-HOOKS-CORRELATIONID-ORDER-FIX-LIVE-VERIFICATION-2026-07-29` appended (`operations/decision-log.md`). The correlationId order-independence fix from the prior close (commit `d32f6a8`) is confirmed working end-to-end against real production data.

## What this session did

Picked up the prior session's own carried recommendation: the fix shipped with a passing unit test + route battery, but neither exercises the real Postgres unique-index dedup path against genuine signed evidence submitted twice in different orders — that gap is exactly the live-distribution class the fix targets. This session closed it with a founder-walked production round-trip.

## Method

Built a throwaway driver (`sdk/typescript/examples/correlationid-order-verify.ts`, deleted after use, never committed) on the existing thin SDK, reusing the `gate1-3b-walk.ts` consult/sign/verify/write pattern (PR15 — no re-implementation). The founder:

1. Minted a throwaway `sr_prac_` UPC (`consult,accreditation_write`) — hitting and clearing two real obstacles along the way:
   - A `403 Unauthorized` on the password-grant mint path (a Supabase-project/account mismatch); resolved by pulling a live JWT directly from the browser's `sb-*-auth-token` localStorage entry (the standing `human-routes-bearer-jwt-console-smoke` technique) and passing it as `MINT_CLI_ADMIN_JWT`, bypassing the password grant entirely.
   - A `400` for a write-class UPC minted without the required `--owner-email`/`--agent-id`; resolved by supplying both.
2. Ran the driver: two genuine `assessment_first` consults (each independently signature-verified) → a **seed** accreditation write with `provenance.signed_assessments = [A, B]` → an **update** write carrying the identical evidence **reversed** (`[B, A]`), with a minimal `transition_result` confirmed against the route's actual wire-boundary validator (only `grade_changed` + `record` are enforced there, despite the richer internal `TransitionResult` type).
3. Ran the SQL check the driver printed, against production, in the Supabase SQL editor.

## Result

```
event_type                     | virtue_domain | correlation_id                          | occurred_at
credential-completed           | dikaiosyne    | accr:c143552949842bd1c3846527aa4f327a   | 2026-07-29 00:59:34.83+00
justice-surface-indeterminate  | dikaiosyne    | accr:c143552949842bd1c3846527aa4f327a   | 2026-07-29 00:59:34.83+00
```

Two rows, not four; both share one `correlation_id` and one `occurred_at`. The seed write (`[A,B]`) and the reversed update write (`[B,A]`) hashed to the **identical** correlationId (order no longer matters), so the update write's insert attempt hit the `(correlation_id, event_type, virtue_domain)` unique index and was correctly suppressed as a duplicate. Pre-fix, the reversed order would have produced a different key, bypassed the dedup index, and genuinely double-recorded both event types. **Live verification: PASS.**

## Teardown (founder-performed)

- Throwaway credential `1c6f79a8-c96c-465c-bb3a-9048109600fe` revoked via `mint-credential.ts revoke practice --id ...`.
- Verification driver script deleted (not part of the standing SDK examples set).
- `sdk/typescript/package-lock.json` — a side effect of installing the SDK's own declared devDependencies to typecheck the driver — left in place, untracked, harmless (matches the package's existing `package.json`).
- The two rows in `agent_trust_events`/`agent_trust_state` for `sagereasoning:correlationid-verify@v1` are real-but-throwaway test traffic. **Exclude from any billing/trajectory/trust-state sample.** No special sweep was run; they age out under the standing S1 retention sweep like any other row.

## What went wrong, and what it taught

Nothing wrong with the fix or the verification method. Friction was entirely in the founder's local execution, all self-corrected once the actual error was read rather than guessed at:
- `cd sdk/typescript` from inside `website/` failed — `sdk/` is a sibling of `website/`, not nested inside it (`cd ../sdk/typescript` or an absolute path was needed).
- The admin mint's `403` and `400` were each diagnosed from the literal error text (an auth mismatch, then two missing required fields) rather than guessed — no retries burned on the wrong fix.

## Next Session Should

Nothing is gated on this. See the paired next-session prompt for the standing, non-blocking list — unchanged from the prior close, minus this item (now closed).

## Production State at Session Close

Unchanged from the prior close — the fix has been live since commit `d32f6a8`'s push (the file it touches was already flag-on). This session added no code; it verified the already-live behavior against real production data and left two harmless throwaway ledger rows.

## Files touched

- `operations/decision-log.md` (this session's addendum entry)
- `operations/handoffs/founder/2026-07-29-emission-hooks-correlationid-live-verification-CLOSE.md` (this file)
- `operations/handoffs/founder/2026-07-29-emission-hooks-correlationid-live-verification-NEXT-SESSION-PROMPT.md` (paired next prompt, supersedes the prior one)
- `sdk/typescript/examples/correlationid-order-verify.ts` — created, used, then deleted; does not survive this session.

**Uncommitted as of this close** (the decision-log addendum + this pair of files) — folded into the next commit alongside the earlier session's own uncommitted decision-log entry, per the founder's own commit cadence, unless asked to commit now.

## Blocked On

Nothing. The one item this session was scoped to (live-verify the fix) is closed. The historical-double-counting audit (whether any pre-fix double-counting actually occurred, live since well before this fix) remains named, unaudited, and unscoped — the founder's call whether it's worth pursuing.
