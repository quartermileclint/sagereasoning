# Next-Session Prompt — Sage Reflect LIVE close-out + track election

**Stream:** founder.
**Tier:** founder elects at open (this is a track-election session — the tier is set by the elected track; default to `governance` for the election + cleanup, then re-declare when a build track is chosen).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" still holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-22-sage-reflect-stage-b-build-close.md`.
**Predecessor decision-log entries:** `D-SAGE-REFLECT-STAGE-B-BUILD-WIRED-VERIFIED-2026-05-22`; `D-SAGE-REFLECT-STAGE-B-METERING-FIX-AND-LIVE-VERIFICATION-2026-05-22`.

## Where we are
Sage Reflect is **Live / Verified (gated)** as of 2026-05-22. The Calling → Reasoning → Assent → **Reflect** loop is closed — the fourth Sage Practice product is shipped. `POST /api/practice/reflect` is live in production behind `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` is set in Vercel. The full live smoke test passed end-to-end (auth modes, a Q1→Q6 walk on real Sonnet calls with FD-R1 + FD-R3 firing, the Sage Assent profile read-back, the Zone-3 boundary). No build work is half-finished; nothing is blocked.

## Pre-conditions (confirm at open)
1. The decision-log entry `D-SAGE-REFLECT-STAGE-B-METERING-FIX-AND-LIVE-VERIFICATION-2026-05-22` is committed + pushed (the code fixes were already pushed for the verification).
2. Production: `SAGE_REFLECT_ENABLED=true`; substrate A7 Verified; A10 Live + Verified; Sage Calling Live (gated); Layer-3 + R20a substrate gates UNSET.
3. **Pending founder cleanup (not blocking):** in Supabase, `SELECT` then `DELETE FROM sage_reflect_sessions WHERE session_id LIKE 'smoke-reflect-%';`; revoke the `agent_smoketest_v1` and `agent_reflect_smoke_v1` `atl_write` test credentials via the admin route; optionally delete the local `smoke-test-reflect.sh`.

## Part A — open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. The predecessor Stage B close (above).
4. `/operations/decision-log.md` — the last 2 entries (the two Stage B entries).
5. Then the deliverable-of-the-day for whichever track is elected (named in Part B).

Confirm at open: tier; hold-point (P0 0h active); model selection per the cache; status vocabulary; signals/risk class.

## Part B — Track election (founder picks one or more; AI surfaces options + tiers, does not prescribe)

**A. Sage Reflect PR7 follow-ons** (refinements to the now-live product):
- **A1 — Cross-session context faithful population.** The live endpoint passes `prior_sessions=[]` + `sage_assent_agreement_streak=0`, so FD-R2 / Q1-3-null / FD-R4-deference don't fire from cross-session data yet. Needs a complexity measure (likely a new column) + a calibration-history read. *code-elevated; deliverable: a short design note then the build.*
- **A2 — Precise R5 cost-health tracking.** The integer-cents loop bill rounds sub-cent Sonnet costs to 0; a microcent-precise accumulator (the substrate's `incrementCostTracker` pattern) gives a faithful R5 2x signal for Sage Reflect. *code-elevated.*
- **A3 — Zone-3 harm-flag carrier field.** Confirm/define the canonical harm signal (Stage B reads `safety_signal.harm_flagged` OR `acts_blocked[].category==='harm'` — a founder-ack interpretation). *governance/design; PR6 if it touches the boundary.*
- **A4 — Q5 sandwich-escalation.** The optional 5th Layer-1 call when the deterministic Q5 read is ambiguous. *code-elevated.*

**B. K-category human-surface migration.** Migrate `/api/reflect` + `/api/mentor/private/reflect` onto the translation-sandwich substrate (the two-front-ends-one-substrate pattern; Sage Reflect is now the proven agent substrate). *code-critical — touches existing user-facing functionality.*

**C. ATL → Sage Assent rename.** The cross-cutting code/docs/registry rename; includes reconciling the SR-15 Sage-Reflect-side per-domain proximity with any future native field. *governance + code; dedicated session.*

**D. Lawyer engagement.** Retention value (90-day) + TOS/liability — on the critical path per ST2 Stage 1 close. *governance/external.*

**E. Sage Calling PR7 follow-ons** (carried from the Sage Calling LIVE close).

**F. Cleanup pass.** The smoke-row deletion + credential revocation above, done together as a quick `schema`/`governance` open. *Standard.*

## Part C — anticipated session shape
Depends on the election. A PR7 refinement (A1/A2/A4) is ~1 build session (Elevated). The K-category migration (B) is Critical and likely multi-session (full Critical Change Protocol per touched endpoint). The rename (C) and lawyer engagement (D) are their own arcs. Cleanup (F) is ~20–30 min.

## Rollback / safety note
Sage Reflect remains reversible at any time by unsetting `SAGE_REFLECT_ENABLED` (→ 503, no redeploy). Any Critical track (B, or A3 if it touches the Zone-3 boundary — PR6) requires the full Critical Change Protocol visible before deploy.

## Forecast
With the agent Sage Practice loop complete and live, the natural next arcs are (i) hardening the live product (A1/A2), (ii) extending the substrate to the human surfaces (B — the largest remaining product value), and (iii) the pre-launch governance/legal track (C/D) feeding the P1 business-plan review. The founder sets the order.

*End of prompt. Opens as a track-election session; re-declare tier once a track is chosen. Sage Reflect is Live / Verified (gated) — stable known-good baseline.*
