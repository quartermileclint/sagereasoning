# Next-Session Prompt — Post correlationId Fix: Founder's Choice

**Stream:** founder (substrate / general).
**Tier:** open — depends entirely what the founder wants to work on. Nothing is gated on the prior session.
**Prior session:** `operations/handoffs/founder/2026-07-29-emission-hooks-correlationid-fix-CLOSE.md` (`D-EMISSION-HOOKS-CORRELATIONID-ORDER-FIX-2026-07-29`) — closed the one item the 2026-07-28/07-29 sessions carried forward: `emitAccreditationTrustEvents`'s idempotency `correlationId` no longer depends on the submitted signature array's order. Committed as `d32f6a8`. The fix ships live on the founder's next push (the file it touches is already flag-on in production, so pushing the commit *is* the activation — no separate flag step).

**This is not a continuation of a build arc.** Read `/adopted/standing-protocol-cache.md` at open per usual, then use your judgement. There is no forced next step.

---

## If the founder wants to verify this fix specifically

The fix was verified via unit test + the sole live caller's battery, both passing (19/0, 90/90). It was **not** verified via a live production round-trip (no admin JWT was minted this session — consistent with the standing constraint that only the founder holds a usable prod admin JWT in this environment). If the founder wants live confirmation:

- After pushing `d32f6a8`, mint a throwaway `sr_prac_` credential with `accreditation_write`, submit an accreditation write with a multi-signature `provenance.signed_assessments` array, then retry the identical write with the array **reversed** — the second call should now dedupe (honest 409/already-exists) rather than silently double-count. Revoke the credential after.
- Separately, whether any **historical** double-counting occurred under the pre-fix formula (live since well before 2026-07-28) is unaudited. A retroactive query for `agent_trust_events` rows sharing identical evidence but distinct `correlation_id`s would answer it, if the founder wants historical accuracy re-established rather than just the fix going forward. Not scoped — purely the founder's call whether it's worth the effort.

## Otherwise: the standing, non-blocking list (carried across at least four prior sessions, largely unchanged)

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
- Any live production verification write needs the founder's participation or JWT — this environment cannot mint prod admin credentials on its own.

## Forecast

Success = the founder gets a clean, working session on whatever they actually want next — not a forced continuation of documentation or bugfix housekeeping just because that's what the prior two sessions happened to be.

End of prompt.
