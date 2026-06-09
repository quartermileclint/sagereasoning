# Next-Session Prompt — Pre-Launch S5 (dense): A10 per-agent identity + metering production go-live (the agent front door) + agent-discovery verify + code hygiene + A19 two-detector rollout (clean separate step)

Paste this whole file into a new session to proceed.

This is **Session 5** of the pre-launch completion plan (`/operations/pre-launch-completion-plan-2026-06-07.md`, adopted 2026-06-07). S4 (A11b injection-defence) is done and Live in production. S5 turns on **A10 per-install plugin authentication + metering** — the agent front door — which is already built and **Verified-live on TEST** (mint → authenticate → revoke → re-call, 2026-06-03) and deployed **inert** in production behind one unset flag (`PLUGIN_INSTALL_AUTH_ENABLED`).

A10 is the auth/access-control surface for external agent callers of `/api/reason`. The production change is a single Vercel env flag + redeploy (no migration this session — the `plugin_install` table already exists; confirm at open). What raises the care level is that **flipping the flag changes the auth path on the live `/api/reason` route**: the verification must prove a per-install credential is accepted **and** that the existing JWT/session callers (the `/admin/test-reason` page, the human-facing hub pages) still work unchanged.

Stream: founder. Tier: **`code-critical`** — Critical under 0d-ii (deployment-config env-flag activation on the live `/api/reason` auth path). **AC7 — confirm disposition at open** (A10 adds a per-install auth path to `/api/reason`; check whether AC7 engages). **PR6 not engaged** (A10 does not touch the R20a distress classifier or its wrappers — confirm by read). No schema/migration this session (the `plugin_install` migration is already Verified on TEST; confirm it is also present in production, or fold its creation in as a clearly-separated migration step if not). Full Critical Change Protocol (0c-ii), walked live (PR17). Governing frame: `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + `/adopted/build-sessions-protocol-cache.md`.

Predecessor closes: `/operations/handoffs/founder/2026-06-08-prelaunch-S4-injection-defence-activation-close.md` (S4; most recent — A11b injection-defence Live), `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md` (the authoritative A10 build + revocation reference — read in full at open). Predecessor decision-log entries: `D-PRELAUNCH-S4-INJECTION-DEFENCE-ACTIVATION-2026-06-08`, `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`, `D-A10-CRITICAL-IMPL-WIRING-REVOCATION-2026-06-03`. Plan context: `/operations/pre-launch-completion-plan-2026-06-07.md` (this is its S5).

## Why this session matters

A10 is the gate that lets an external agent authenticate and be metered on `/api/reason` via a per-install `sr_inst_` credential, with mint/revoke administered by the founder. It is the precondition that made A11b/A12/A13/A15a/A19 possible, and it is the MVP "agent front door." Until `PLUGIN_INSTALL_AUTH_ENABLED` is on in production, external agents cannot authenticate/meter — the agent path is verified-but-dark. Turning it on (after a production-parity verification) is a major pre-launch enabler. Because it sits on the live `/api/reason` auth path, the activation must not change how existing human callers authenticate.

## Decisions to settle at open (founder elects; AI presents with a recommendation)

**Decision 1 — Confirm A10 as the S5 spine.** Per the completion-plan sequence (S5 = A10 metering). Recommendation: yes.

**Decision 2 — Metering scope: live pre-launch, or only at first onboarding?** (The completion plan flags this as a genuine founder call.) Two readings: (a) activate `PLUGIN_INSTALL_AUTH_ENABLED` now so the metered agent path is provably live end-to-end pre-launch (matches the "finished product that works" goal); or (b) keep it inert until the first external agent onboards (less live surface to monitor before there's traffic). Recommendation: **(a) activate now** — the whole pre-launch thesis is "verify it works in production before exposure," and A10 is the agent front door; one metered self-test call demonstrates it without real external traffic. AI presents the trade-off; founder elects.

**Decision 3 — A19 two-detector rollout as a clean separate step this session?** The carried-forward A19 structural-detector (`systematic_enumeration`, `rapid_input_variation`) TEST pass + production rollout (`SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED`) was deferred from S3/S4. A10 is not a PR6 safety-perimeter spine, so bundling is permissible **if** run as a clearly separated second activation after the A10 spine reaches verified-disposition. Recommendation: **yes — run the A10 spine to full verified-disposition first, then the A19 rollout as a separate, clearly-labelled step** (TEST pass of the two detectors, then `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED=true` in production + verify). If the founder prefers a clean A10-only session, defer A19 to S6/S7.

## Pre-conditions (AI verifies by read at open; founder confirms)

1. Working tree clean; no `.git/index.lock` (if present: `rm -f .git/index.lock`; founder runs git, AI does read-only git inspection only).
2. `main` up to date with `origin/main`; Vercel green (founder confirmed at the S4 close push).
3. **S4 is done** — A11b Live in production (`SUBSTRATE_INJECTION_DEFENCE_ENABLED=true`); R20a distress invariant preserved. AI confirms by reading the S4 close + `D-PRELAUNCH-S4-INJECTION-DEFENCE-ACTIVATION-2026-06-08`.
4. **A10 is Verified-live on TEST + deployed inert in production.** AI confirms by read: the gate `PLUGIN_INSTALL_AUTH_ENABLED` is applied in `website/src/app/api/reason/route.ts` (default UNSET → OFF → existing auth path unchanged); the per-install token format is per `/adopted/adr/2026-06-03-a10-token-format.md`; mint/revoke admin endpoint + `plugin_install` table exist; revocation runbook at `/operations/runbooks/plugin-install-credential-revocation.md`.
5. **Migration disposition.** A10's `plugin_install` migration was Verified on TEST. AI confirms at open whether the table exists in the **production** Supabase project (`jdbefwkonfbhjquozgxr`); if not present, the production migration is a clearly-separated Elevated step **before** the flag flip (founder-run in the production SQL editor, walked live). If already present, no migration this session.
6. **The existing-caller regression is the load-bearing check.** AI reproduces, from the A10 close, exactly how the flag-ON path treats (i) a per-install `sr_inst_` credential and (ii) an existing JWT/session caller — and confirms the OFF→ON change is *additive* (adds the plugin-auth path) and does not restrict existing callers.
7. Hosts: production is served at `www.sagereasoning.com` (apex 307-redirects to `www`); any production curl targets `www.`. Production Supabase ref `jdbefwkonfbhjquozgxr`; TEST ref `iwdtrvuphogkwmovhnvz` (for the TEST-parity smoke via `npm run dev` + `.env.development.local`).
8. The AI does no Vercel, git, or Supabase operations — the founder performs the TEST-parity smoke, any production migration, the env-flag change + redeploy (Vercel), the token mint/revoke, and the commit (GitHub Desktop), each walked live (PR17). A10 **does** involve minting a per-install credential (founder mints; AI never sees it).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — Critical tier; §"Critical-risk sessions"; signals; AI-failure-modes table incl. prescribe-before-grounding + PR17.
2. `/operations/pre-launch-completion-plan-2026-06-07.md` — this session is its S5; confirm the agent-front-door framing + the two scope confirmations.
3. `/operations/handoffs/founder/2026-06-08-prelaunch-S4-injection-defence-activation-close.md` — most-recent production state.
4. `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md` + the smoke-test entry `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03` — the A10 build, the mint/authenticate/revoke flow, the existing-caller treatment (read in full).
5. `website/src/app/api/reason/route.ts` — confirm the `PLUGIN_INSTALL_AUTH_ENABLED` gate, the dual-auth precedence (JWT/session vs per-install token), and the OFF-path byte-identity. Plus the admin mint/revoke endpoint + `/adopted/adr/2026-06-03-a10-token-format.md`.
6. `/manifest.md` — targeted: the A10/AC7 auth-surface rows; R-codes for per-agent identity + metering; confirm PR6 boundary (A10 does not touch R20a).
7. `/operations/decision-log.md` last 3 entries.

Confirm at open (narrate before any action): where we are in the arc (S5 of the completion plan; A10 Verified-live on TEST, deployed inert; S4/A11b Live); what's queued behind; what's awaiting the founder vs the AI; tier = Critical; **AC7 disposition** stated explicitly; PR6 not engaged (stated explicitly); PR17 engaged; status vocabulary; model selection N/A for the auth gate (deterministic); PR15 (no Anthropic-canonical primitive substitutes for a Vercel flag flip — state explicitly).

## Part B — Procedure

Order: confirm migration disposition → TEST-parity smoke (mint → authenticate → revoke → re-call, **plus** an existing-JWT-caller regression) → (if needed) production migration → set the flag in Vercel Production → redeploy → verify in production (metered per-install call **and** existing-caller regression) → then the A19 rollout (clean separate step, if elected) → then low-risk fill (discovery verify + code hygiene) → decision log → close.

**Step 0 — Confirm current production state (AI read-only + founder one check).** AI confirms by read: `PLUGIN_INSTALL_AUTH_ENABLED` UNSET → OFF; existing `/api/reason` auth unchanged. Founder baseline: one authenticated benign `/api/reason` via `/admin/test-reason` (JWT/session path) → normal assessment. This is the flag-OFF "existing caller" reference.

**Step 1 — Critical Change Protocol brief (AI completes visibly before the founder runs anything) — 0c-ii.** (1) What is changing: `PLUGIN_INSTALL_AUTH_ENABLED=true` (Vercel Production) + redeploy; the per-install plugin-auth path becomes active on `/api/reason`. (2) What could break: the load-bearing risk is the existing JWT/session caller — if the change were restrictive rather than additive, the founder's own `/admin/test-reason` page and the human hub pages would fail to authenticate; bounded by the existing-caller regression check (Steps 2 + 4). Metering of a per-install call is additive. (3) Existing sessions: confirm whether any human session/cookie behaviour changes (expected: none — additive auth path). (4) Rollback: unset `PLUGIN_INSTALL_AUTH_ENABLED` + redeploy → `/api/reason` auth byte-identical to flag-OFF; revoke any test credential per the runbook. (5) Verification: Step 2 (TEST smoke + regression) + Step 4 (production metered call + regression). (6) Explicit approval: founder says "OK / go ahead" specific to the named existing-caller risk before Step 3.

**Step 2 — TEST-parity smoke (founder, walked live).** On `npm run dev` against `.env.development.local` (TEST ref `iwdtrvuphogkwmovhnvz`; set `PLUGIN_INSTALL_AUTH_ENABLED=true` in that file only): (a) mint a per-install `sr_inst_` credential via the admin endpoint; (b) authenticate `/api/reason` with it → past the auth gate (the A10 close documents the exact expected response); (c) confirm an existing JWT/session call to `/api/reason` still succeeds (the regression); (d) revoke the credential → the same token is rejected (401). Remove the TEST flag at teardown. (AI supplies the exact mint/call/revoke commands from the A10 close.)

**Step 3 — (If needed) production migration, then set the flag + redeploy (founder, walked live).** If `plugin_install` is absent in production, run the migration in the production SQL editor (ref `jdbefwkonfbhjquozgxr`, confirmed before running) as a clearly-separated Elevated step. Then vercel.com → SageReasoning → Settings → Environment Variables → add `PLUGIN_INSTALL_AUTH_ENABLED` = `true`, Environments = Production only → Save. Then Deployments → latest Production → ⋯ → Redeploy → wait green.

**Step 4 — Verify the activation in PRODUCTION (Critical verification step).** Against `www.sagereasoning.com`: (a) mint a per-install credential and make a metered `/api/reason` call with it → accepted + metered (confirm the metering record per the A10 design); (b) the existing-caller regression — an authenticated `/api/reason` via `/admin/test-reason` (JWT/session) still returns a normal assessment unchanged; (c) revoke the test credential → rejected (401). Disposition: A10 → Live (production).

**Step 5 — (If elected, Decision 3) A19 two-detector rollout — clean separate step.** TEST pass of `systematic_enumeration` + `rapid_input_variation` (the deferred TEST proof), then `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED=true` in Vercel Production + redeploy + verify `/api/abuse/evaluate` runs all three detectors with no false positives (`abuse_signals` still empty). Detection-only (standing election). One-flag rollback.

**Step 6 — (Fill, low-risk) Verify the agent-discovery surface.** Confirm `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, and `website/public/openapi.yaml` are served in production and internally consistent with the now-live A10 auth + `/api/reason` contract (MVP discovery criterion). Note any drift for correction; no redesign.

**Step 7 — (Fill, low-risk Standard code hygiene) — own commit.** Delete the dead `V3_SOCIAL_MEDIA_PROMPT` (`website/src/lib/document-scorer.ts`); land `/api/user/export` onto the shared helper if it duplicates logic (`website/src/app/api/user/export/route.ts`). Standard-risk; verify `tsc` clean + relevant tests; keep separate from the Critical activation in the commit message.

**Step 8 — Decision-log entry (Critical form).** Append `D-PRELAUNCH-S5-A10-METERING-ACTIVATION-2026-06-DD`: the Critical-Change-Protocol record (6 points incl. the existing-caller-regression result), the AC7 disposition, the metering-scope decision (Decision 2), the migration disposition, the A19-rollout result (if run), the rollback path, and the founder-performed verification result.

**Step 9 — Session close (full Critical form) + commit.** Per the cache §"Critical-risk sessions" (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Orchestration Reminder). Provide the exact `rm -f .git/index.lock` + `git add`/commit block (the code-hygiene + any discovery-file fix + decision log + close; the flag flips already redeployed in Steps 3/5).

## What is NOT in this session

- No standalone **Layer 3** activation (`SUBSTRATE_LAYER3_ENABLED`) — its launch-scope question is an S6/S7 confirm.
- No **R20a audience-rendering / server-side gate** activation — S6 (PR6 safety perimeter, its own clean spine).
- No injection-defence change (A11b is Live as of S4).
- No enforcement on A19 (detection-only standing election).
- No `component-registry.json` reconcile — its own `sage-registry-update` run / S8 (the honest capability inventory).

## Rollback path

Unset `PLUGIN_INSTALL_AUTH_ENABLED` (or set ≠ `true`) + redeploy → `/api/reason` auth byte-identical to flag-OFF; revoke any test credential per `/operations/runbooks/plugin-install-credential-revocation.md`. If the A19 rollout was run: unset `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED` + redeploy → velocity-only. Code-hygiene + discovery-file edits reversible via `git revert` (docs/code-only).

## Forecast

Most likely: the migration is already in production (no DB step); the TEST smoke re-confirms mint → authenticate → revoke + the existing-JWT regression; the founder sets one Vercel flag + redeploys; in production a per-install credential makes a metered call, the existing `/admin/test-reason` JWT call is unchanged, and a revoked credential is rejected — A10 → Live (production), the agent front door open. Then (if elected) the A19 two-detector rollout flips clean, the discovery surface is verified, and the code-hygiene items land. One Critical commit (+ a separate Standard hygiene commit). After it: the agent path is authenticated + metered + injection-hardened + observable; the only remaining dark capabilities are Layer 3 rendering and the R20a rendering/gate refinements (S6), then observability completion (S7) and the end-to-end verification + capability inventory (S8 — the pre-lawyer readiness gate).

End of prompt. Opens on `main`. Critical — full Critical Change Protocol; AC7 disposition confirmed at open; PR6 not engaged; founder runs the TEST smoke, any production migration, the env-flag change + redeploy, the token mint/revoke, and the commit, each walked live (PR17). Order: confirm migration disposition → TEST smoke + regression → set flag → redeploy → verify (metered call + existing-caller regression) → A19 rollout (separate, if elected) → discovery verify + code hygiene → decision log → close. One-flag rollback.
