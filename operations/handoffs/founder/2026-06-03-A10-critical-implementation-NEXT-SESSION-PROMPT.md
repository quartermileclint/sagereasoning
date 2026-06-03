# Next-Session Prompt — A10 Critical Implementation (Per-Install Plugin-Auth Wiring + Revocation Surface)

Paste this whole file into a new session to proceed. This is the canonical prompt for **staging-plan session 12** — the Critical implementation that follows the 2026-06-03 A10 kickoff.

**Stream:** founder. **Tier:** `code-critical` — **Critical** under 0d-ii. **AC7 ENGAGED. PR6 ENGAGED.** The full **Critical Change Protocol (0c-ii)** runs visibly in the conversation before any deploy or flag flip. This is not optional and urgency does not downgrade it (AC7). **Engaged process rules:** PR1 (single-endpoint proof — wire ONE endpoint only), PR2 (build-to-wire verification immediate; grep the call path, not the import), PR6 (auth surface = Critical), PR7 (record any deferral), PR15 (consult Anthropic primitives + agentic-commerce findings before any new bespoke build), PR17 (every founder-performed step — migration, env var, flag flip, smoke tests — walked through live, click-by-click, not handed off as a one-liner). **Governing frame:** `/adopted/standing-protocol-cache.md` (Critical sessions keep the FULL templates) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — CCP step 3 answers "N/A: only founder + test logins exist") + `/adopted/substrate-plugin-staging-plan.md` (the A10 item + Risk 9). **Predecessor close:** `/operations/handoffs/founder/2026-06-03-A10-token-format-scaffold-close.md`. **Predecessor decision-log entries:** `D-A10-TOKEN-FORMAT-ADR-AND-SCAFFOLD-2026-06-03`; `D-0H-CRITERION1-MET-STAGE1-DEPENDENCY-2026-06-03`; `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the foundation mechanism). **Operative spec:** `/adopted/adr/2026-06-03-a10-token-format.md` (the Token-Format ADR — hybrid; Surface 1 only this session).

## Where this sits (one paragraph)

The 2026-06-03 kickoff decided the A10 token format (hybrid: opaque bearer for internal plugin-auth; W3C-VC/AP2-mandate portable envelope deferred under PR7) and proved the **Surface-1 credential logic as library code** — `website/src/lib/plugin-install-auth.ts`, 22/22 tests green, `tsc` clean, imported by no route. The migration `website/supabase-api-keys-plugin-install-migration.sql` is authored but not run. This session does the Critical work the kickoff deliberately deferred: **run the migration, wire the credential check into one plugin-auth endpoint behind an unset flag, build the admin revocation API, and write the revocation runbook** — each step under the full Critical Change Protocol, with production staying byte-identical until you choose to flip the flag. A10 is the identity keystone: A11b, A12, A13, A15a, A19 all wait behind it.

## Why this session matters

This is where per-install plugin authentication becomes real. The single shared `PLUGIN_AUTH_SECRET` on `/api/reason` is replaced (behind a flag) by per-install `sr_inst_` tokens carrying `identity_type` (human|agent), `install_id`, and `scope`, with an instant universal revocation check. Getting the wiring + revocation right on ONE endpoint (PR1) means the eventual rollout to other plugin-auth surfaces is mechanical rather than speculative. It also unblocks the rest of Stage 1.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The 2026-06-03 kickoff committed + pushed; Vercel green. Confirm the four files are on `main`: `adopted/adr/2026-06-03-a10-token-format.md`, `website/src/lib/plugin-install-auth.ts`, `website/supabase-api-keys-plugin-install-migration.sql`, `website/src/lib/__tests__/plugin-install-auth.test.ts`.
2. Production behaviour unchanged from that close: the new module is imported by nothing; `/api/reason` byte-identical; four R20a flags `true`; `SUBSTRATE_WRITE_PATH_ENABLED` `true` (accreditation surface Live, untouched); `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `ADMIN_USER_ID` set.
3. No A10 implementation has begun since the kickoff — confirm by scanning the decision log for any entry after `D-A10-TOKEN-FORMAT-ADR-AND-SCAFFOLD-2026-06-03`.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table).
2. `/adopted/build-sessions-protocol-cache.md` (the "no current users" note — CCP step 3 is N/A while it holds).
3. `/operations/handoffs/founder/2026-06-03-A10-token-format-scaffold-close.md` (predecessor close — production state + what's built).
4. `/adopted/adr/2026-06-03-a10-token-format.md` (the operative spec — Surface 1 only this session; Surface 2 stays deferred).
5. `/operations/handoffs/founder/2026-05-21-A10-build-close.md` + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the foundation: the admin mint/revoke endpoint + `credential_audit` + kill-switch pattern this session mirrors for `plugin_install`).
6. The live source: `website/src/lib/plugin-install-auth.ts` (this session wires it); `website/src/app/api/reason/route.ts` `checkPluginAuth` (the wiring target); `website/src/app/api/admin/accreditation-credentials/route.ts` (the admin endpoint to mirror); `website/src/lib/security.ts` (`validateSageAssentWriteToken` / `requireAdmin` patterns); `website/supabase-api-keys-plugin-install-migration.sql` (the migration to run).
7. `/operations/decision-log.md` last 2–3 entries.

Confirm at open: tier (`code-critical`; Critical); hold-point status (P0 0h active; criterion 1 MET for the Stage-1 dependency); model selection per the cache (N/A — no LLM calls in the auth path); status vocabulary; signals + risk class; PR6 + AC7 ENGAGED; PR15 + PR17 engaged. **Narrate before substantive work:** where we are in the arc; what's queued (A11b/A12/A13/A15a/A19 behind A10); what's awaiting the founder vs the AI.

## Part B — Procedure (Critical Change Protocol governs throughout)

### Step 1 — PR15 consult + design lock (no code yet)
Consult `.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md` (F4) for anything bearing on the revocation API / admin surface; summarise inline. Lock the small design decisions deferred from the kickoff: (a) `install_id` uniqueness policy (per-install vs global); (b) extend the existing `/api/admin/accreditation-credentials` route vs a new `/api/admin/plugin-install-credentials` route; (c) the new gating flag name (proposed `PLUGIN_INSTALL_AUTH_ENABLED`, default unset → byte-identical). Present; founder confirms before code.

### Step 2 — Run the migration (founder-performed; PR17 — walk it live)
Walk the founder through running `website/supabase-api-keys-plugin-install-migration.sql` in Supabase → SQL Editor → New Query, one VERIFY block at a time (7a–7e), pasting each result back. Expected: the three new columns present; the four constraints present; the index present; the widened `purpose` CHECK admits `plugin_install`; 7e returns 0. This is additive/idempotent and touches only the new `plugin_install` surface — but it is still walked click-by-click. If any VERIFY looks wrong, stop before wiring.

### Step 3 — Build the admin mint/revoke API for plugin_install (Critical)
Mirror `/api/admin/accreditation-credentials` (founder-only via `ADMIN_USER_ID`; reuses `requireAdmin`): mint a `plugin_install` credential (calls `generatePluginInstallToken`, writes the row with `identity_type`/`install_id`/`install_scope`, returns the raw `sr_inst_` token once), and revoke (sets `is_active=false` + `revoked_at` + a `credential_audit` row). PR2: factor pure logic; unit-test the decision paths in-session.

### Step 4 — Wire the check into ONE endpoint behind the unset flag (PR1; the Critical change)
In `/api/reason`'s `checkPluginAuth` branch, add an invocation of `validatePluginInstallToken` gated by `PLUGIN_INSTALL_AUTH_ENABLED`: when the flag is **unset/false**, behaviour is **byte-identical** to today (the existing `PLUGIN_AUTH_SECRET` path is untouched); when **on**, per-install tokens authenticate instead. Name the Session-7b-compatibility posture (AC7): no change to user session, cookie scope, redirect, or domain config — only the plugin-auth header branch. PR2: grep the call path to confirm the new function is actually invoked in the flagged branch, not merely imported.

### Step 5 — Write the revocation runbook
Author the revocation runbook (mirroring the A4 rotation runbook) — how to revoke a per-install credential, what the universal revocation check guarantees (instant; `is_active=false` → next call 401), and the audit trail. Store under `/adopted/` or `/operations/` per the rotation-runbook's location.

### Step 6 — Critical Change Protocol (visible, before any deploy/flag flip)
Complete all six 0c-ii steps in the conversation: (1) what is changing in plain language; (2) what could break — specific failure modes (e.g. "if the flag is flipped before a credential is minted, plugin calls 401"); (3) existing sessions — "N/A, no current users" per the build cache; (4) rollback plan — exact steps (unset `PLUGIN_INSTALL_AUTH_ENABLED` + redeploy; the migration is additive so no DB rollback needed; the `PLUGIN_AUTH_SECRET` path is preserved); (5) verification step — the founder's smoke tests; (6) explicit founder approval specific to the named risks. **Default is no deploy with the flag on** — commit the wiring inert (flag unset), exactly like the 2026-05-21 foundation. The founder elects whether/when to mint a test credential and flip the flag.

### Step 7 — Verify
Per the 0c framework + the working test forms in `/CLAUDE.md` (plain `npx tsx` for the Supabase-free tests; `--env-file=.env.local` for any that touch the client). `tsc --noEmit` clean. PR2 call-path grep. If the founder flips the flag in a TEST env, the smoke tests: mint → authenticate → revoke → 401. Classify findings per PR10 diagnostic-certainty.

### Step 8 — Decision-log entry (full Critical form)
Includes the R20a-perimeter impact assessment (Risk 9 / AC5) — the admin revocation API is a new authenticated surface; assess whether it broadens the perimeter and classify accordingly.

### Step 9 — Session close (full Critical form)
Per the predecessor encryption-wiring close: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. State production state explicitly. Name the next session (A11b prompt-injection defence, or A12 — founder elects) + its pre-conditions.

## What is NOT in this session
- Surface 2 (W3C-VC/AP2-mandate portable envelope) — deferred under PR7; do not build.
- Rollout to plugin-auth surfaces beyond the one endpoint (PR1 — prove on one first).
- A11b–A19 (they queue behind A10 Verified).
- Touching the accreditation write path (`POST /api/accreditation/[agent_id]`, the admin accreditation-credentials route, `credential_audit` schema) except to mirror its pattern for the new `plugin_install` admin route — the accreditation surface itself stays read-only.
- Retiring `PLUGIN_AUTH_SECRET` — it stays as the fallback until the per-install path is Verified-live and the founder elects to remove it (a later step).

## Rollback path
The wiring lands inert (flag unset) → nothing to roll back at commit. If the flag is flipped and anything misbehaves: unset `PLUGIN_INSTALL_AUTH_ENABLED` + redeploy (restores the `PLUGIN_AUTH_SECRET` path exactly). The migration is additive/idempotent — no DB rollback required; revoked credentials are inert tombstones. The CCP supplies the exact commands in-session.

## Forecast
Most likely: the migration runs clean (additive); the admin mint/revoke route + the flagged `/api/reason` invocation are built and Verified in-session (tsc + tests + call-path grep), committed inert; the revocation runbook is written; and the founder optionally mints a test credential and exercises mint→authenticate→revoke→401 in a TEST env. That leaves A10 Verified (or Verified-pending-founder-smoke-tests), unblocking A11b/A12/A13/A15a/A19. The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting in parallel whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

End of prompt. Opens on `main`. Critical-tier; the full Critical Change Protocol governs any deploy or flag flip; throwaway test credentials only.
