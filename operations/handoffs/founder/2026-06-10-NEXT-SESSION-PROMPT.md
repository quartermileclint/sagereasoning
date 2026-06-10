# Next-Session Prompt — S7b deploy + review-informed fills (paste this whole file into a new session)

**Stream:** founder. **Tier:** `code-critical` — the spine is the S7b deploy (Vercel Cron + env vars + the commit that deploys them). Full Critical Change Protocol; step-6 approval was given at S7 and must be **re-confirmed** at open.
**Governing frame:** `/adopted/standing-protocol-cache.md`. **PR17 engaged** — every founder-performed step (Slack webhook, Vercel env vars, the commit/push) is walked live, click-by-click. **PR6 NOT engaged / AC7 NOT engaged / PR4 N/A** — confirm each by read at open exactly as the S7b prompt specifies.
**Predecessor closes:** `/operations/handoffs/founder/2026-06-09-prelaunch-S7-observability-completion-close.md` (authoritative build state) and `/operations/handoffs/founder/2026-06-10-multidisciplinary-review-close.md` (the review session).
**Predecessor decision-log entries:** `D-PRELAUNCH-S7-A13-DELIVERY-BUILT-DEPLOY-DEFERRED-2026-06-09`, `D-MULTIDISCIPLINARY-REVIEW-2026-06-10`.

## Why this session matters
A 2026-06-10 multidisciplinary review (Fable) verified production truth end-to-end: the product is live, safety-floored, and quiet; observability is the last dark corner — cost/abuse signals are detected but not delivered until this deploy. After S7b, only S8 (e2e verification + honest capability inventory) stands before the pre-lawyer readiness gate, and the Article 50 clock (applies **2026-08-02**) makes the S8 → lawyer handoff time-sensitive.

## Production truth at open (verified live 2026-06-10 — trust this over CLAUDE.md's block, which is known-stale; fixing it is fill item F1)
- **Live:** all four R20a flags (since 2026-05-31; both audiences verified at S6) · A12 OTel (`substrate_audit_events`, 6 rows, structural-only) · A19 (3 detectors; `/api/abuse/evaluate` 401 without token; `abuse_signals` 0 rows) · A10 plugin-install auth (11 `api_keys` rows incl. tombstones) · A11b injection defence · GDPR /access /rectify /delete /export · A13 detection · `/api/public-key` Ed25519 steady-state.
- **Inert by decision:** Layer 3 (`POST /api/substrate/layer3` → 503; OUT of launch scope per S7) · R20b coaching flag · Layer-2 rotation vars.
- **Built, uncommitted, undeployed (the S7b payload):** `website/vercel.json`, `/api/cron/observability` route + `src/lib/cron/`, `/api/admin/slo-health` route + `src/lib/slo/` (+ tests; 14/14 + 20/20 passing; tsc clean at S7). Both routes 404 in production (verified 2026-06-10). Stray `website/tsconfig.tsbuildinfo` modification to checkout; possible `.git/index.lock` to clear.
- **Supabase (production `jdbefwkonfbhjquozgxr`):** 75 public tables, **RLS enabled on all 75**; `vulnerability_flag` exists (0 rows); compliance logs live (0 rows); `stripe_billing: not_configured` per `/api/health`.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, signals, risk classes, AI-failure-modes table.
2. `/operations/handoffs/founder/2026-06-09-prelaunch-S7b-deploy-NEXT-SESSION-PROMPT.md` — **read in full; it is the deploy script for this session.** Its Part B steps 1–6 (Slack webhook → Root Directory check → three env vars → commit/push → verification (a)–(d) → decision-log + close) are followed exactly, walked live (PR17).
3. `/operations/handoffs/founder/2026-06-09-prelaunch-S7-observability-completion-close.md` — the build record.
4. `/operations/reviews/2026-06-10-multidisciplinary-review.md` §1–§2 + `/operations/reviews/2026-06-10-recommended-actions-and-priorities.md` Tier 1 — the review context and the elected fills.
5. `/operations/decision-log.md` — last 2 entries.

Confirm at open (narrate before any action): where we are in the arc (S7b deploy; S8 next; 0h active; P1 not started); tier Critical; PR6/AC7 dispositions confirmed by read; PR4 N/A; status vocabulary; the S7-carried step-6 approval **re-confirmed by the founder**; reconciliation per the S7b prompt's "Reconcile FIRST" block (build present + uncommitted; delivery still absent; four R20a flags true; `SUBSTRATE_LAYER3_ENABLED` stays unset).

## Part B — Spine: execute S7b exactly per its prompt
No re-design, no new code unless a deploy problem surfaces. Env vars **before** the commit/push. `CRON_SECRET` is the value recorded at S7 (regenerate per the S7b prompt §pre-conditions if lost — never paste it into chat or any repo file). Success = cron registered at `0 8 * * *`, forced-signal test posts to Slack (`?test=1` → 200, `notified:true`) and 401 without the header, A14 page returns provisional JSON. Then A13 automated delivery → **Live**; A14 tracker → **Live (provisional)**.

## Part C — Fills (Standard, AI-doable; founder elects which ride this session; none touch the Critical spine)
- **F1 — CLAUDE.md production-state refresh** (review rec 1.2): move A10, A11b, A19 structural detectors to the Live list; add A13-delivery/A14 after the deploy verifies; date the block. Founder approves the diff before commit (it rides the docs-only follow-up commit).
- **F2 — README honesty fixes** (rec 1.3): drop "world's leading reference" (R19b), the 0–100 wording (R6c), the /hiring + /therapy rows (404 live, verified 2026-06-10); re-date the status section. Founder approves wording.
- **F3 — `.env.example` completion** (rec 1.4): all env vars named with purpose; secrets as names only. Source list: the review's codebase sweep.
- **F4 (if time) — tech-known-issues.md refresh + INDEX.md dead-pointer fix** (rec Tier 4): Standard, founder approves.

## Part D — Close
Decision-log entry in **full Critical form** for the deploy (founder-verified results: cron registered; Slack message received; negative auth 401; A14 JSON) + lean entries for elected fills. Session close per the cache template, including **Production state at session close** (dated, decision-log-cited — the review's PR18 candidate discipline). Provide the commit block (the S7b prompt's Step 4 block already lists the exact paths — extend it with any fill files + the review files if not yet committed: `operations/reviews/2026-06-10-*.md`, `operations/handoffs/founder/2026-06-10-*.md`). Queue the S8 prompt as the next deliverable, carrying the review's rec 2.1 split decision (S8a/S8b) and 2.3 founder-decision list to S8's open.

## What is NOT in this session
No R20a/safety-perimeter change. No Layer 3 activation. No Stripe configuration. No registry reconcile (S8). No business-doc rewrites (post-S8). No npm-vulnerability work (own session). The review's Tier-2/3 items wait for S8 and after.

## Rollback path (deploy)
Per the S7b prompt: remove the `crons` block + redeploy (or Vercel → Cron Jobs → Disable); unset `ALERT_WEBHOOK_URL`; unset `SUBSTRATE_SLO_TRACKER_ENABLED` → A14 back to 503; `git revert <sha>` removes route + config. R20a flags and `/api/reason` untouched throughout.

## Forecast
Most likely: reconciliation confirms the 2026-06-10 review's state; the founder runs the six deploy steps walked live; the forced-signal Slack message lands; A13 delivery + A14 go Live; F1–F3 fills land as Standard docs changes; close queues S8 (with the split decision + the four founder decisions at its open). Then: S8 → lawyer engagement (Art-50 runway) + FPE-1/FPE-3 started in parallel per review rec 1.5.

End of prompt. Opens on `main` at `a47642b` + uncommitted S7 build. Critical session; PR17 walkthrough; step-6 approval re-confirmed before any Vercel action; do NOT re-attempt the Cowork-scheduled-task delivery path (sandbox egress cannot reach sagereasoning.com — re-confirmed 2026-06-10).
