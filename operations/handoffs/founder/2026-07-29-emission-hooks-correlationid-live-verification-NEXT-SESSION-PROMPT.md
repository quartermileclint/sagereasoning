# Next-Session Prompt — Post correlationId Live Verification: Founder's Choice

**Stream:** founder (substrate / general).
**Tier:** open — depends entirely what the founder wants to work on. Nothing is gated on the prior session.
**Prior session:** `operations/handoffs/founder/2026-07-29-emission-hooks-correlationid-live-verification-CLOSE.md` (`D-EMISSION-HOOKS-CORRELATIONID-ORDER-FIX-LIVE-VERIFICATION-2026-07-29`) — closed the one remaining open item from the fix session earlier the same day: the correlationId order-independence fix (commit `d32f6a8`) was **confirmed working end-to-end against real production data**, founder-walked. A throwaway `sr_prac_` credential ran two genuine consults, a seed write with evidence `[A,B]`, and an update write with the same evidence reversed `[B,A]`; the resulting `agent_trust_events` rows showed exactly one row per `(event_type, virtue_domain)` pair, both writes sharing one `correlation_id` — proof the fix's dedup held where the pre-fix formula would have double-counted. **PASS.** The throwaway credential was revoked; the verification script was deleted (never committed).

**This supersedes** `operations/handoffs/founder/2026-07-29-emission-hooks-correlationid-fix-NEXT-SESSION-PROMPT.md` — that file's "verify this fix" section is now done; everything else in it (the standing non-blocking list) carries forward unchanged below.

**This is not a continuation of a build arc.** Read `/adopted/standing-protocol-cache.md` at open per usual, then use your judgement. There is no forced next step.

---

## Closed this cycle

- ~~Verify the correlationId fix~~ — **DONE, live-verified 2026-07-29.** No further action needed unless the founder wants the historical-audit follow-up below.

## Still open, not mandated

- **Historical double-counting audit.** Whether any `agent_trust_state` double-counting actually occurred under the *pre-fix* formula (live since well before this fix, not just since 2026-07-28) is unknown and unaudited — this fix only prevents new occurrences going forward. A retroactive query for `agent_trust_events` rows with matching evidence but differing `correlation_id`s could answer it, if the founder wants historical accuracy re-established. Not scoped; purely their call whether it's worth the effort.

## Otherwise: the standing, non-blocking list (carried across five prior sessions, largely unchanged)

None of these are mandated. Ask the founder which (if any) they want to work on, or propose one if they defer to your judgement:

- **The logos byte-identity guard** — still explicitly named across multiple sessions as "the founder's call to scope or retire." If the founder wants this resolved rather than carried forever, that conversation needs to happen with them directly.
- **The B5 per-session-granularity decline signal** (practice-reminders arc, deliberately silent in v1).
- **The fold-open closure class** — pre-settled per the 2026-07-28 verbatim record, awaiting the CI-4 marker-persistence schema step (its own founder-walked step, not yet scheduled).
- **R17 on `milestones`** — data-rights coverage gap, not yet closed.
- **Human Phases 0–1 independent-review re-runs** (the Remaining Principles arc's first-hand-only reviews still awaiting a fresh independent pass).
- **The journal UTC pace-gate mismatch** and **the day-55 evening-pole case** — both small, named, not yet investigated in depth.
- **`/api/milestones` + `/api/baseline` on the `scoring` rate-limit bucket** — a bucket-sharing question, not yet resolved.
- **`oikeiosis_context` never written** — a named gap, scope not yet assessed.
- **CLAUDE.md's own staleness** — the AE-2/`loop_fold` bullet (schema, extension count) and A3's "19 extensions" line both need refreshing to match the 2026-07-29 accreditation-docs session's changes (now 20 extensions, schema v2). That's the founder's own PR18 pass by convention.
- **The larger open threads in CLAUDE.md** (P2's 0h call, the S11 ENFORCE gate readiness standard, the Resend email provisioning, the retroactive independent reviews, the consult-lookup resilience follow-up) remain exactly as CLAUDE.md's own "Awaiting commencement" list describes them.

## Boundaries (carried forward)

- Do not touch `stoic-brain.ts` or reopen the logos byte-identity guard question unilaterally.
- Any live production verification write needs the founder's participation or JWT — this environment cannot mint prod admin credentials on its own. (This cycle demonstrated the reliable workaround when the password-grant path 403s on an account/project mismatch: pull a live JWT from the browser's `sb-*-auth-token` localStorage entry and pass it as `MINT_CLI_ADMIN_JWT`, skipping the password grant entirely.)
- `sdk/` is a sibling directory of `website/`, not nested inside it — a `cd sdk/typescript` from inside `website/` will fail; use `cd ../sdk/typescript` or an absolute path.

## Forecast

Success = the founder gets a clean, working session on whatever they actually want next — not a forced continuation of documentation or bugfix housekeeping just because that's what the prior sessions happened to be.

End of prompt.
