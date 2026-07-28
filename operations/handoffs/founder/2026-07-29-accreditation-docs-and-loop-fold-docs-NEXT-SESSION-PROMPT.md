# Next-Session Prompt — Post Docs-Truing-Up: Confirm the Correlation-ID Fix, Then Founder's Choice

**Stream:** founder (substrate / general).
**Tier:** open — depends what the founder wants to do; the recommended first step below is small and diagnostic (`code-elevated` at most), everything after it is the founder's pick from a long-standing list, not a mandated continuation.
**Prior session:** `operations/handoffs/founder/2026-07-29-accreditation-docs-and-loop-fold-docs-CLOSE.md` (`D-ACCREDITATION-DOCS-AND-LOOP-FOLD-R18-DOCS-2026-07-29`) — closed the two named follow-ups from the 2026-07-28 A3 close: the accreditation-write `llms.txt` example is now genuinely complete (3-source cross-checked against `AccreditationRecord`/`WindowConfig`/the store), and the `loop_fold` (AE-2) block is now documented on all three R18 surfaces (schema `agent-loop-fold-v2`, `agent-card.json` now at 20 extensions).

**This is not a continuation of a build arc.** Nothing is gated on the prior session; there is no forced next step. Read `/adopted/standing-protocol-cache.md` at open per usual, then use your judgement — this prompt exists to hand you the state cleanly, not to prescribe a task.

---

## Recommended first step (small, ~15 minutes): confirm the `emitAccreditationTrustEvents` correlation-ID fix status

At the 2026-07-28 A2 session, a confirmed, adversarially-verified defect was found in `emission-hooks.ts` — a non-order-independent `correlationId` in trust-event emission, affecting the LIVE S1 trust ledger's `agent_trust_state` fold. It was deliberately NOT fixed in that session (out of that session's `code-elevated` scope — the file is live production code) and was instead flagged via `spawn_task` as its own follow-up chip.

**Nobody has confirmed since whether that spawned task has run.** Before treating it as open:
1. Check whether a session already picked it up (git log on `website/src/lib/substrate/trust-core/emission-hooks.ts` since 2026-07-28; the decision log for a matching entry; ask the founder directly if it's ambiguous).
2. If genuinely still open, this is a live-production correctness defect in a currently-active feature (Trust Layer S1, `SUBSTRATE_TRUST_CORE_ENABLED=true` since 2026-07-11) — treat it as its own `code-elevated` (at minimum) session, not a rider on anything else. Do not fold it into a documentation or unrelated build session.
3. If already fixed, close the loop in a short note (decision-log addendum or just tell the founder) and move to whichever of the items below the founder prefers.

## Everything else is the founder's call — standing, non-blocking, carried across at least three prior sessions unchanged

None of these are mandated. Ask the founder which (if any) they want to work on, or propose one if they defer to your judgement:

- **The logos byte-identity guard** — still explicitly named across multiple sessions as "the founder's call to scope or retire." Re-confirmed clean at the last check (248 passed / 1 failed, the same transient-red-while-uncommitted class as always). If the founder wants this resolved rather than carried forever, that conversation needs to happen with them directly — don't decide it unilaterally.
- **The B5 per-session-granularity decline signal** (practice-reminders arc, deliberately silent in v1).
- **The fold-open closure class** — pre-settled per the 2026-07-28 verbatim record, awaiting the CI-4 marker-persistence schema step (its own founder-walked step, not yet scheduled).
- **R17 on `milestones`** — data-rights coverage gap, not yet closed.
- **Human Phases 0–1 independent-review re-runs** (the Remaining Principles arc's first-hand-only reviews still awaiting a fresh independent pass — see the 2026-07-25 AE1-S11b prompt if it hasn't run yet either; check before assuming still open).
- **The journal UTC pace-gate mismatch** and **the day-55 evening-pole case** — both small, named, not yet investigated in depth.
- **`/api/milestones` + `/api/baseline` on the `scoring` rate-limit bucket** — a bucket-sharing question, not yet resolved.
- **`oikeiosis_context` never written** — a named gap, scope not yet assessed.
- **CLAUDE.md's own staleness** — this session's changes (loop_fold now v2/20 extensions; A3's "19 extensions" line was already one behind at this session's open) haven't been folded into CLAUDE.md's compressed status blocks. That's the founder's own PR18 pass by convention, not something to fold into an unrelated session — but worth flagging if the founder is doing a CLAUDE.md refresh soon anyway.
- **The larger open threads in CLAUDE.md** (P2's 0h call, the S11 ENFORCE gate readiness standard, the Resend email provisioning, the retroactive independent reviews, the consult-lookup resilience follow-up) remain exactly as CLAUDE.md's own "Awaiting commencement" list describes them — none newly urgent from this session.

## Boundaries (carried forward, still apply)

- Do not touch `stoic-brain.ts` or reopen the logos byte-identity guard question unilaterally.
- If the founder wants a live verification of either doc fix from this session (a mint → accreditation-write → revoke cycle using the new `llms.txt` example, or a live consult+write producing a real `loop_fold` block to spot-check against the new docs field-by-field), that's a quick, low-risk `code-elevated`-at-most side quest — the founder holds the only usable production admin JWT in this environment, so it needs their participation (or their JWT) either way.

## Forecast

Success for the recommended first step = a clear, source-confirmed answer on whether the correlation-ID defect is fixed, expressed as either a closed loop or a properly-scoped new session — not another summary that itself needs re-verifying next time.

End of prompt.
