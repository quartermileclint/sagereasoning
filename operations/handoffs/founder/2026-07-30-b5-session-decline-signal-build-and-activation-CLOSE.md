# Session Close — 2026-07-30 — R17 Milestones, Consult-Lookup Retry, and B5 (Build + Full Activation)

**Stream:** founder (substrate / practice-suggestion / general).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** Mixed — `code-elevated` for the three builds; `code-critical`/AC7 for B5's production activation (founder-walked throughout).
**Date:** 2026-07-30 (session opened 2026-07-29, spanned the date change).

## Decisions Made

- `D-B5-SESSION-DECLINE-SIGNAL-BUILT-ACTIVATED-LIVE-2026-07-30` appended (`operations/decision-log.md`). Covers all three items closed this session and B5's full activation.

## What happened, in order

1. **Picked up the three "buildable now" items** named at the end of the prior session's carried-forward list: R17 milestones coverage, the consult-lookup resilience retry, and B5.
2. **R17 + the retry built and verified straightforwardly** — no design questions, both `code-elevated`, both additive/flag-gated.
3. **B5 turned out not to be simply buildable.** The real blocker was architectural (no session concept in the data model), and which of the two ways to fix that — infer a boundary from timing, or require the calling agent to declare one — is a genuine Stoic-evidentiary-standard question, not an engineering coin-flip. Put to the mentor rather than decided unilaterally.
4. **Mentor's binding verdict:** require a positively declared session boundary; an inferred one is never adequate evidence for the claim. Built accordingly.
5. **Founder asked to walk through activation.** TEST leg run by the AI directly (local dev server against the TEST Supabase project); production leg founder-walked throughout (migration, flag, credential mints).
6. **A real mistake happened and was caught:** the flag was set and Vercel redeployed before the code was ever committed, so the first live smoke correctly found the old code still running (a 200 instead of the expected 400) — not a B5 defect, an AI process error. Corrected by committing (three separate commits) and the founder pushing via GitHub Desktop.
7. **Re-verified live against the real deploy** — the malformed-`session_marker` 400 confirmed both the code and the flag are genuinely live. All four throwaway smoke credentials revoked.

## Status Changes

| Item | Old | New |
|---|---|---|
| `milestones` table in `/api/user/access`, `/api/user/export`, `/api/user/delete` | absent (FK-cascade backstop only) | present, explicit |
| `validatePracticeCredential`'s transient-error handling | fail-closed on first hiccup | retried once, behind `SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED` (unset in every environment) |
| `session-decline-signal.ts` | did not exist | exists, pure, 15/0 |
| B5 (`dimension_declining_across_sessions` / `deepen_examination`) | reserved-but-unreachable since 2026-07-28 | wired into the precedence chain |
| `SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED` | did not exist | **Live in production** |
| `agent_assessment_history.session_marker` | did not exist | migrated on TEST and production |

## Method notes worth keeping

**The mentor question was framed and answered inline**, not as a scheduled consultation-briefing file — the founder asked a direct question mid-session and got a direct binding answer, recorded verbatim in this session's own transcript and paraphrased faithfully in the decision-log entry. No separate briefing/verbatim-record file exists for this one; if that's wanted for the standing record, it would need to be authored retroactively from the transcript.

**The positive-fire path was never observed through the live `/api/reason` response** — a higher-precedence candidate (B1, an unrelated open-loop signal) kept winning on every one of 18 real consults across two attempted TEST sessions. Verified instead by reading the signal directly off real persisted rows (bypassing response precedence entirely, zero LLM cost) — `passion_reduction` and `judgement_quality` both correctly read `declining`. This is a legitimate, arguably stronger verification (it isolates the mechanism from precedence noise), but it's a different claim than "observed in a live response," and the decision log says so explicitly rather than blurring the two.

**The flag-before-code mistake** is worth internalizing as a standing procedural rule, not just this session's footnote: commit and push before touching a production flag that gates the new code, every time, no exceptions — "redeploy green" only means what it should mean if the code being deployed is the intended code.

## Verification

session-decline-signal **15/0** (new) · practice-suggestion **791/0** (was 759/0, extended) · trajectory-delta 76/0 · agent-assessment-history-store 120/0 · a2-developmental-reminders 41/0 · practice-credential **45/0** (new retry tests) · security 20/0 · plugin-install-auth 22/0 · api-key-defaults 12/0 · `tsc --noEmit` 0 · `npm run build` 0 (re-run after every code change). Live-verified on TEST (18 real consults, plus a direct DB signal read confirming genuine decline detection) and on production (the malformed-marker 400, twice — first correctly exposing the pre-push gap, then correctly confirming the fix).

## Next Session Should

Nothing is blocked or pending from this session specifically — B5 is fully live and closed out. See the next-session prompt for the open items this leaves standing and the founder's live options.

## Blocked On

Nothing. All three commits are pushed; the production activation is complete and live-verified; all four throwaway credentials are revoked.

**Production state at session close:** NOT byte-equivalent to session open — a deliberate, intended standing change. `SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED=true` in Vercel Production; the `session_marker` column + CHECK live on production `agent_assessment_history`; B5 dark-by-default for any caller that doesn't opt in (byte-identical for existing callers), fires only for a caller that positively declares session boundaries and shows a genuine sustained decline. `SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED` remains unset everywhere (built, not activated this session — no design question blocks it, just wasn't asked for). The R17 milestones fix is live on push (no flag, always-on).

## Open Questions

- **The B5 suggestion line's exact wording** — concept mentor-confirmed, wording not mentor-vetted verbatim (unlike most of its siblings). Flagged in-code.
- **CLAUDE.md's "Live in production" list** — does not yet carry a B5 bullet; out of this session's explicit scope, still awaits a founder PR18 pass.
- **`SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED` activation** — built, TEST-verifiable, not yet turned on anywhere; whether the s9-loop dogfood's 401 rate has actually improved without it is unmeasured (the fix isn't live yet).
- Carried unchanged: the logos byte-identity guard (founder's call), the fold-open closure class, P2's 0h call, S11 ENFORCE readiness, Resend email provisioning, the journal UTC pace-gate mismatch, the day-55 evening-pole case.

## Founder Verification

Nothing to verify that wasn't already verified live during the session — the production smoke test (the malformed-`session_marker` 400 against the real deployed code) already stands as the founder-witnessed proof. If you want an independent re-check at any point: mint one more tiny throwaway `sr_prac_` credential the same way, POST `{"input": "...", "session_marker": "invalid"}` to `/api/reason`, expect `HTTP 400` with the exact message `session_marker must be one of: session_open, session_close, mid_session`, then revoke it.
