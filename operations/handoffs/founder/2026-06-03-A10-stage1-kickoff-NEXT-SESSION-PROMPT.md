# Next-Session Prompt — A10 Stage-1 Kickoff (Per-Agent Credentials + Revocation)

**Paste this whole file into a new session to proceed.** This is the single canonical A10 kickoff prompt (it replaces any earlier same-day draft).

**Stream:** founder.
**Tier:** `code-critical` by **surface** (A10 is authentication / access-control — PR6 + AC7 engage the moment auth code is written or deployed), but **scoped this session as DESIGN + TOKEN-FORMAT ADR + a single-endpoint scaffold — no production deploy is planned.** If the founder elects to deploy in-session, the full Critical Change Protocol (0c-ii) runs visibly before any push.
**Engaged process rules:** PR1 (single-endpoint proof before rollout), PR2 (build-to-wire verification immediate), PR7 (record any deferral), PR15 (consult Anthropic-canonical primitives + the agentic-commerce findings before the token-format decision), PR17 (walk any founder-performed step live).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/substrate-plugin-staging-plan.md` (the A10 item + Stage-1 sequencing).
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-0h-criterion1-live-test-close.md`.
**Predecessor decision-log entries:** `D-0H-CRITERION1-LIVE-TEST-2026-06-03`; `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the *already-Live* accreditation-path credential mechanism — the foundation, not the target); `D-CAPABILITY-INVENTORY-FIRST-PASS-2026-05-29` (gap #10).

---

## Where this sits (one paragraph)

The founder is driving the substrate **Stage 1** to completion before re-opening the P0–P7 roadmap. The verification floor under Stage 1 is now confirmed — the 2026-06-03 live-data test founder-Verified the human-facing safety + privacy surface, and the founder determined **0h exit criterion 1 is MET for the Stage-1 dependency**. Per the reconciled build-status snapshot (`/operations/build-status-snapshot-2026-05-31.md` §3), **A10 — Per-agent credentials + revocation — is "Not started, Critical" and is the next item on the Stage-1 critical path.** A11, A12, A13, A15, and A19 all depend on it. This session opens A10.

## The "two A10s" — clarified once, so it isn't re-litigated

- **Foundation (Live, do not rebuild):** the 2026-05-21 work (`D-ATL-A10-BUILD-WIRED-VERIFIED`) built per-agent `sr_assent_` credentials for the **accreditation write path** (`POST /api/accreditation/[agent_id]`) — mint/revoke, `credential_audit`, scope, orphan auto-revocation, `SUBSTRATE_WRITE_PATH_ENABLED` kill-switch. The *mechanism* exists and is reusable.
- **Target (this arc):** the staging-plan A10 generalises that mechanism across the **plugin-auth surface** — replace the single `PLUGIN_AUTH_SECRET` with per-install token issuance; per-token `identity_type` (human | agent), `install_id`, `scope` (assessment-only | mentor-also | admin); a **revocation list checked at every authenticated call**; an admin revocation API + runbook; and a **token-format ADR adopted before implementation**.

The first real step is to write the **delta** between the two so the build targets only the gap.

## Why this session matters

A10 is the identity keystone for the rest of Stage 1. The **token format** is the highest-leverage decision in the arc — it shapes every downstream consumer (A11b/A12/A13/A15a/A19) and is named as A10's pre-condition and an open question. Resolving scope + format, then proving the chosen approach on one endpoint (PR1), means the Critical implementation session that follows is grounded rather than speculative.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. **Production unchanged** from the 2026-06-03 close: four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (`/api/substrate/layer3` → 503); `SUBSTRATE_WRITE_PATH_ENABLED` `true` (accreditation surface Live, zero live credentials); `ADMIN_USER_ID` set. 2026-06-03 governance committed + pushed; Vercel green.
2. **A5 (Layer 3 service) Verified** — the staging plan's stated dependency ("A10 depends on A5 wired"). Confirm via the A5 close referenced in `/CLAUDE.md`.
3. **No staging-plan-A10 implementation has begun** since 2026-05-21 — confirm by scanning the decision log for any per-install-token / `identity_type` / universal-revocation entry after `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`.

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table incl. "prescribe-before-grounding").
2. `/adopted/build-sessions-protocol-cache.md` (the "no current users" note — CCP step 3 is N/A while it holds).
3. `/operations/handoffs/founder/2026-06-03-0h-criterion1-live-test-close.md` (predecessor close — production state).
4. `/operations/handoffs/founder/2026-05-21-A10-build-close.md` + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the foundation mechanism to reuse).
5. `/adopted/substrate-plugin-staging-plan.md` — the A10 item (target) + the Stage-1 dependency map + indicative packaging (sessions 11–12) + **Risk 9** (A10 may broaden the R20a perimeter under AC5).
6. `/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (the K1 credential-scope ADR — the composite identity key + `coverage_status`; the token-format ADR builds on this, it does not re-derive identity).
7. `/operations/build-status-snapshot-2026-05-31.md` §3 (Stage-1 status) + `/operations/decision-log.md` last 2–3 entries.

Confirm at open: tier (`code-critical` by surface; design/ADR/scaffold scope — no deploy planned); hold-point status (P0 0h active; criterion 1 founder-determined MET for the Stage-1 dependency, 2026-06-03); model selection per the cache; status vocabulary; signals + risk class; PR15 + PR17 engaged. Narrate before substantive work: where we are in the arc; what's queued (A11–A19 behind A10); what's awaiting the founder vs the AI.

---

## Part B — Procedure

### Step 0 — Housekeeping (Standard; do first)
Append a one-line decision-log confirmation that **0h exit criterion 1 is founder-determined MET for the Stage-1 dependency** (per the 2026-06-03 founder call: human surface Verified-live; agent-path catch code-identical + reachability-gated; private-mentor route code-identical + founder-gated). Keeps the R0 audit trail accurate; commit with this session's governance.

### Step 1 — Reconcile A10 scope (the delta) — ground before building
Produce a written **delta table**: for each staging-plan A10 sub-item (per-install issuance; `identity_type`/`install_id`/`scope` metadata; revocation-list-at-every-call; admin revocation API + runbook; token-format ADR), mark **Done (cite 2026-05-21)** / **Partial** / **Not started**, confirmed against live source (not the stale registry). Present it; **the founder confirms the A10 scope** before any design work. State the unit of analysis explicitly: the plugin-auth surface as a whole, vs the accreditation path already done.

### Step 2 — Token-format ADR (the pre-condition; the founder's decision)
The heart of the session. **PR15 first:** consult `.claude/skills/anthropic/` for relevant primitives and `/operations/agentic-commerce-findings-downstream-order.md` (esp. **F4 — AC10/AP2 mandate alignment**); summarise findings inline. Then draft an ADR comparing candidates against this project's constraints (K1 composite-identity key + `coverage_status`; R18f no-false-credential; AC7 auth surface; the existing `sr_assent_` opaque-token precedent):
- **JWT** (HMAC vs asymmetric)
- **W3C Verifiable Credentials**
- **AP2-style mandate** (scope + constraints + proof-of-approval)
- **Hybrid / extend the existing opaque token**

Present trade-offs (interop, revocation cost, identity discrimination, downstream-consumer impact, PR16 positioning/dogfood). **The founder elects** ("I've decided"). Record as an ADR in `/adopted/adr/` + a decision-log entry. If deferred, record the deferral + revisit conditions (PR7).

### Step 3 — Single-endpoint scaffold proof (PR1; no rollout)
Pick **one** endpoint as the proving ground for the chosen format (the per-install / plugin-auth path, distinct from the already-gated accreditation path). **Scaffold** the new credential-check + revocation-list-read on that one endpoint → Wired → prove to Verified in-session (tsc + tests; PR2 call-path grep, not import-only). Do **not** roll out across endpoints. If the scaffold stays behind a kill-switch / unset flag, nothing deploys and the session stays below the deploy line; if the founder elects to deploy, the **full Critical Change Protocol (0c-ii) runs visibly before any push**.

### Step 4 — Verify
Per the 0c framework + the working test forms in `/CLAUDE.md` (plain `npx tsx`; `npx tsx --env-file=.env.local` for the two Supabase-touching tests). Provide founder-runnable commands + expected output. Classify findings per PR10 diagnostic-certainty.

### Step 5 — Decision-log entry
Token-format ADR + scope reconciliation + scaffold result, plus the **R20a-perimeter impact assessment** (staging-plan Risk 9). Full Critical form only if a Critical change deployed; otherwise lean form.

### Step 6 — Session close
Full close if a Critical change deployed; lean close otherwise. State production state explicitly. Name the next session (A10 Critical implementation + revocation surface — staging-plan session 12) + its pre-conditions.

---

## What is NOT in this session
- Re-building the accreditation-path A10 (Live — read-only; do not touch `POST /api/accreditation/[agent_id]`, the admin mint/revoke route, or `credential_audit`).
- Full multi-endpoint A10 rollout (PR1: prove on one endpoint first).
- A11–A19 (they depend on A10; queued behind it).
- The optional agent-path distress-catch live run (a 0h follow-up; not Stage-1-blocking per the 2026-06-03 founder call).
- A production deploy — unless the founder explicitly elects it (then the Critical Change Protocol governs).

## Rollback path
At design/ADR/scaffold-behind-a-flag scope there is nothing in production to roll back. If a scaffold is deployed under a kill-switch, rollback = unset the flag + redeploy (the CCP supplies the exact command in-session). Any TEST `.env*.local` is gitignored (closed 2026-06-03).

## A note the founder asked be carried (not this session's work)
Lawyer engagement (privacy policy + ToS, LC#5) and the FPE legal/insurance track (incorporation, GST, insurance) have **wall-clock lag measured in weeks** and gate the eventual marketplace launch regardless of build pace. They live at "Stage 1 close" in the plan, but are worth starting in parallel whenever the founder chooses. They do not change what's next on the build (A10) — flagged so they don't bottleneck later.

## Forecast
Most likely: the delta shows much of the *mechanism* exists from 2026-05-21, with the gap being generalisation to per-install plugin-auth + identity discrimination + a universal revocation check; the token-format ADR is decided (an AP2-mandate / existing-opaque-token hybrid is a strong candidate given the K1 identity ADR and the agentic-commerce direction — but the founder elects); and the chosen approach is scaffolded + Verified on one endpoint. That leaves a clean, well-scoped Critical implementation session (staging-plan session 12) as the next step, with A11–A19 behind it.

End of prompt. Opens on `main`. Critical-tier by surface; design/ADR/scaffold by scope — no production change planned; throwaway test credentials only.
