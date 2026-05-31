# Session Close — 2026-05-31 — First R20a Production Activation (Calling) + Journal-Distress Deployment Record

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-critical` — **Critical** risk. Two parts: Step 1 governance finalisation (Standard); Steps 2–5 the R20a activation (Critical). The highest-risk part set the tier. Full Critical Change Protocol (0c-ii) completed in chat before any Vercel change; founder approved "Go ahead" specific to the named risks. PR6 + AC5 + PR3 + PR17 engaged; AC2 paid live.
**Date:** 2026-05-31.
**Branch:** `main` (the AI did no git operations; no application code changed).
**Predecessor close:** `/operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md`.

## What this session did

1. **Opened under the protocol.** Read the standing cache, the predecessor close, the C2 live-run close, the journal + C2 decision-log entries, the gate code (`r20a-gate.ts`), and the Calling route. Confirmed: tier (`code-critical`, Critical); hold-point (P0 0h active); model (Haiku for the R20a classifier, cache AC1 row, reused); status vocabulary; signals/risk class. Code-read findings (Diagnostic-certain): all three flag readers are case-strict (`=== 'true'`); `/api/calling` gates its catch on `isCallingR20aEnabled()` and calls `enforceLayer2R20aGate({ … , overrideFlag: true })` — independent of the A7 gate (smallest blast radius).
2. **Step 1 — governance finalisation (Standard).** Appended an append-only follow-up line to `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31` recording it as deployed + live in production (pushed + Vercel green 2026-05-31); implementation status → **Verified-live (production)**, end-to-end live TEST run **waived by founder**; LC#10 **met for the journal**. Founder approved the wording before it was written.
3. **Step 2 — full Critical Change Protocol in chat.** All six points laid out for `SUBSTRATE_CALLING_R20A_ENABLED`; founder approved "Go ahead" specific to the named risks and elected **Production-only** scope.
4. **Step 3 — Vercel activation, walked through live (PR17).** Directed the env-var add (`SUBSTRATE_CALLING_R20A_ENABLED = true`, Production only) one step at a time with a save-confirmation, then the redeploy, confirming green before moving on. Not handed off as a one-liner.
5. **Step 4 — verify.** Config confirmed (env var present under Production = `true`; redeploy green). Honest finding surfaced: the catch sits after the `sr_assent_` auth gate, so a clean production probe requires minting a production write credential. Founder elected (informed waiver) to **waive the live probe**; catch behaviour rests on C2's live Haiku evidence (34/34, byte-identical code).
6. **Step 5 — decision-log entry + this close** (full Critical form).

## Decisions Made

- `D-R20A-CALLING-ACTIVATION-2026-05-31` appended (full Critical form) — first R20a production flag activated; CCP record; Production-only scope; config-verified; probe waived (informed); rollback = UNSET + redeploy.
- Follow-up line appended to `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31` — journal distress screening recorded as deployed/live (Verified-live, production; live test waived); LC#10 met for the journal.

## Status Changes

| Item | Old | New |
|---|---|---|
| `/api/calling` R20a catch (production) | Wired + Verified-live (TEST, C2) | **Live (production)** — config-verified; catch behaviour Verified-live (TEST) |
| Journal distress screening | Wired + statically Verified (not deployed) | **Verified-live (production)**; live TEST run waived |
| R20a production flags (Vercel) | four UNSET | **1 set (`SUBSTRATE_CALLING_R20A_ENABLED = true`); 3 UNSET** |
| LC#10 (journal leg) | closes on deploy | **met** |

## Verification Method Used (0c Framework)

- **Deployment-configuration (Critical):** the AI supplied the exact dashboard path + values; the founder performed the env-var add + redeploy on their machine (Vercel is outside the Cowork sandbox) and confirmed each step — env var present under Production = `true`; redeploy Ready/green.
- **Flag-reader correctness (read-only):** the AI confirmed the reader is case-strict (`r20a-gate.ts:268`, `=== 'true'`); the founder set the exact literal `true`.
- **Catch behaviour:** rests on `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30` (34/34 live Haiku, byte-identical code); no code changed since. Live production probe waived by founder (informed).
- **Governance:** decision-log entry + this close produced and cross-referenced.

## Risk Classification Record (0d-ii)

- **R20a production flag activation:** **Critical** — deployment-configuration change activating a new R20a perimeter surface. Full CCP completed in chat before activation; PR6 + PR17 engaged; AC2 paid live; PR3 (synchronous catch). Production-only scope; the other three R20a flags untouched.
- **Step 1 journal deployment-record follow-up:** **Standard** — append-only documentation; no code, no config.

## Next Session Should

Founder's pick (each its own session):

1. **Second R20a production activation** — `SUBSTRATE_REFLECT_R20A_ENABLED` (next smallest blast radius, independent) or, later, the shared-gate `SUBSTRATE_R20A_GATE_ENABLED` (largest blast radius — activate last). Each is a separate Critical session with its own full CCP + PR17 walkthrough.
2. **Batch-encrypt the three lower-severity plaintext tables** (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — batchable since the single-table encryption proof landed (PR1).

## Blocked On

**Files remaining uncommitted (commit commands below):**
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md`

(No application-code change this session — the activation was a Vercel configuration change, already applied live.)

**Production state at session close:** `SUBSTRATE_CALLING_R20A_ENABLED = true` (Production); `/api/calling` distress catch **ON**. The other three R20a flags — `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` — remain **UNSET**. `/api/reason` byte-identical for all non-Calling paths; `/api/substrate/layer3` → 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). Journal distress screening LIVE. R17b realtime-journal encryption LIVE. AC7 not engaged.

## Open Questions

- The other three R20a production activations (one flag per future Critical session). Revisit: per-flag activation sessions.
- A production live probe for the Calling catch (waived this session) — runnable any time a production `sr_assent_` write credential is minted.
- Carried forward: the three plaintext-table encryption batch; `/api/score` single-field coverage (minor); the Jest-runner gap; manifest R17c "503 stub" drift; `mentor_profiles` schema-drift (governance pass).

## PR5 — Knowledge-Gap Carry-Forward

No concept required re-explanation this session. The flag-activation pattern followed the C2 precedent + the cache directly; the case-strict flag-reader semantics and the auth-gate-before-catch ordering were confirmed by code-read. No recurrence logged.

## Founder Verification (Between Sessions)

Confirm the activation holds and the governance records exist:
```
# In Vercel: Settings → Environment Variables — confirm SUBSTRATE_CALLING_R20A_ENABLED = true (Production), and the other three R20a flags are absent.
```
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-R20A-CALLING-ACTIVATION-2026-05-31" operations/decision-log.md
ls "operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md"
```
Expected: the env var listed under Production = `true`; the grep returns the entry header; the close file exists.

Then commit + push the two governance files:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md \
        "operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md"
git commit -m "R20a: first production activation — SUBSTRATE_CALLING_R20A_ENABLED=true (Production) in Vercel; /api/calling distress catch now ON (independent of A7 gate via overrideFlag). Config change, no application code; catch behaviour byte-identical to C2 live-verified code (34/34 real Haiku). Three remaining R20a flags UNSET; /api/reason byte-identical for non-Calling paths. Also records journal-distress change as deployed/live (LC#10 met for journal; live test waived). Critical / code-critical; full CCP + PR17 completed; live probe waived (informed). (D-R20A-CALLING-ACTIVATION-2026-05-31)"
```
Then push via GitHub Desktop. **No Vercel behaviour change on push** — the activation is already live (applied directly in the dashboard); these files are the governance record only.

## Rollback path (whole session)

Set `SUBSTRATE_CALLING_R20A_ENABLED` back to UNSET in Vercel (Settings → Environment Variables → Remove) and redeploy. No code, no schema, nothing persisted — `/api/calling` returns to its pre-activation behaviour in one redeploy.

## Orchestration Reminder

Stage by name (the two governance files above); do not `git add .`. No application-code change this session, so there is no migrate-before-push ordering concern. The activation is already live in Vercel; the commit only records it.

## Cross-references

- Decision log: `D-R20A-CALLING-ACTIVATION-2026-05-31`; follow-up on `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31`
- Activation context: `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`; `/operations/handoffs/founder/2026-05-30-C2-live-run-close.md`
- Predecessor close: `/operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md`
- Gate code: `website/src/lib/substrate/r20a-gate.ts` (`isCallingR20aEnabled`, line 268; `enforceLayer2R20aGate`)
- Route: `website/src/app/api/calling/route.ts` (catch at lines 447–455)
- Manifest: §R20a, §AC5, §AC2

*End of session close. Stabilised to a known-good state: the journal-distress change is recorded as live (LC#10 met for the journal), and the first of four R20a production flags — `SUBSTRATE_CALLING_R20A_ENABLED` — is ON in production, proven on the smallest-blast-radius surface first (PR1), config-verified with catch behaviour resting on C2's live Haiku evidence. Three R20a flags remain UNSET; `/api/reason` byte-identical for non-Calling paths. Next: the second R20a activation or the plaintext-table encryption batch — founder's pick.*
