# Session Close — P2 Harnessed-Arm Leg (leg B)

**Date:** 2026-07-21. **Decision-log entry:** `D-AGENT-ORG-P2-LEG-B-HARNESSED-RUN-2026-07-21`. **Governing spec:** `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md`.

## What happened

1. Opened fresh, with no leg-A transcript visibility (per the no-shared-context guard). Re-confirmed the build-state precondition live.
2. Minted credentials via founder-walked live steps (PR17) — no admin JWT exists in any repo env file by design, so the founder obtained one via a real login and ran every mint/revoke command live, guided step by step.
3. Two mint-side errors, both corrected in-session before compounding: an `sr_inst_` (install) credential was wrongly picked first — re-minted as `sr_live_` (`mint api`); the first assent-mint attempt used a non-canonical `agent_id` — re-minted under `sagereasoning:p2-leg-b@v1`.
4. Ran the harnessed protocol across the same three sealed scenarios leg A used: consult at each decision point, guardrail before the consequential action, one closing accreditation write. All calls succeeded; S2 raised a genuine Tier-1 clarification, answered honestly and resolved.
5. Built the incorporation log (pre-consult positions recorded before verdicts, per the anti-self-grading device), scored against the sealed answer keys, compared to leg A, and wrote the verdict memo.
6. Founder revoked both credentials at close (confirmed).

## Result

**No benefit shown** under the frozen thresholds — 0 material decisions/errors changed (leg B matched leg A's substantive recommendations on all three scenarios), wall-clock not clearly within ceiling on a like-for-like basis, cost well within ceiling. Full verdict + honest task-fit analysis (where signal appeared beyond the binary catches metric — a genuine gate deny on tested bad-action variants, a non-over-flooring null result on well-calibrated writing, a durable signed record with no bare equivalent, and a disclosed scenario-design gap in S2's exercise of the corroboration check specifically): `operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md`.

## ERRATUM (added 2026-07-21, same day) — the model-tier control was not honored

**Both legs ran under Sonnet 5 at low reasoning effort (a token/usage-limit constraint at the time), not Fable 5 — the model the frozen spec (§2) and the program plan (§3-P2) both named specifically to hold the model-tier variable constant against the 2026-06-11 precedent.** This was discovered and disclosed the same day, before the founder acted on the memo as a settled result. Consequence: the "no benefit" verdict stands as a record of what happened in *this* run, but this run no longer functions as a clean, model-controlled comparison point against the 2026-06-11 verdict or against any future run. The verdict memo now carries the full erratum + its reasoning; this close does not restate it in full. **P2 is NOT closed as a settled arc-in-full** — see "What's carried" below, revised from the original close.

## What's carried

**A repeat of P2's leg A + leg B, under Fable 5 (the frozen model), is warranted and carried — Fable 5 is unavailable until Saturday 2026-07-25, 8am.** Next-session prompt authored for the interim + the standing return-to-this note: `operations/handoffs/founder/2026-07-21-interim-and-P2-Fable5-rerun-standing-note.md`. The memo's S2 scenario-design finding (the corroboration check wasn't cleanly exercised) should be folded into the repeat's scenario briefs, not just noted.

**The 0h call remains the founder's.** This memo informs it; it does not make it, and a negative (or positive) result here — model-uncontrolled as it is — should not be treated as settled evidence either way until the controlled repeat runs.

## Rollback

Documents + two throwaway credentials, both revoked at close (confirmed). The accreditation record for `sagereasoning:p2-leg-b@v1` was deliberately left standing as a genuine artifact of the benchmark — not test-flagged for teardown. No schema, flag, or code change occurred this session. `git revert` the records commit if the memo needs rework.

## Risk classification

`code-critical` per the plan's whole-arc tier — live credential mint/revoke + live production API calls this session, all founder-walked per PR17 (AC7 engaged; the AI performed no mint/revoke op itself, only guided + built the runner script + read results).
