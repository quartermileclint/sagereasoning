# Next-Session Prompt — Post-A13-activation: Stage-1 build continuation (founder elects at open)

Paste this whole file into a new session to proceed. Canonical prompt for the session after **A13 was activated in production** on 2026-06-06 (cost-health detection Live + verified; automated delivery deferred by founder election).

**Stream:** founder.
**Tier:** set by the elected item (see menu) — `code-elevated` for A19; `governance` for the reconciliation/R17c-reconcile items; `code-critical` for the A13 delivery follow-on or any other production-activation. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — Critical Change Protocol step 3 = N/A; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-06-A13-production-activation-close.md`.
**Predecessor decision-log entries:** `D-A13-PRODUCTION-ACTIVATION-2026-06-06` (today's activation); `D-A13-COST-HEALTH-ALERTS-COMPLETION-VERIFIED-LIVE-2026-06-06`; `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` (the R17c finding below).

---

## ⚠ Grounding finding carried in — read before scoping anything R17c/A15a

While preparing this prompt the AI found a **documentation drift**: the manifest (and the staging plan's A15a line) say R17c is a **"placeholder 503 / replaces the 503 placeholder."** That is **stale.** The actual endpoint `website/src/app/api/user/delete/route.ts` is a **real, complete deletion implementation**, and `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` records **R17c genuine deletion → Verified-live** (all 10 intimate tables seeded → `DELETE /api/user/delete` → 0 rows). The "manifest R17c '503 stub' drift" is a recurring carried-forward item in the decision-log open-questions.

**Implication:** do **not** scope a from-scratch "A15a build the deletion endpoint" session — that work is essentially done. What genuinely remains for R17c is small: (a) **reconcile the stale manifest/staging-plan note**, and (b) **re-confirm the delete endpoint returns `200` on production** (the 2026-05-29 TEST run returned `207` only because `user_locations` was absent from the TEST schema clone — a TEST artifact, not a deletion failure). This is the kind of drift the project guards against (KG-EX1 "prescribe-before-grounding"); the next session should reconcile the docs against the decision log's actual Verified states before building further.

---

## Founder elects the item at open

This prompt's default is **A19** (the substantive remaining Stage-1 build). Say so at open and the AI re-scopes to any of the below.

- **A19 — Abuse-detection + rate-limiting** (`code-elevated`; ~1 session). The substantive remaining Stage-1 build. Depends on A10 (done); consumes A12 behavioural baselines + A13's per-identity detector. **This prompt's default + recommendation.**
- **Stage-1 status reconciliation** (`governance`; short). Reconcile the staging plan + manifest against the decision log's actual Verified states — fix the R17c "503" drift, then produce an honest Stage-1 disposition (what is truly left before Stage-1 close). Given the drift found above, doing this first prevents building on stale assumptions. *Can be bundled as the opening 20–30 min of the A19 session.*
- **A13 delivery follow-on** (`code-critical`; ~1 session). The piece deferred today: a server-side daily trigger (Vercel Cron) + a notification channel (email/Slack), or Vercel Cron + a Cowork task reading `cost_alerts` via a Supabase connector — so cost-health alerts reach you automatically. Low urgency (no paid revenue / traffic yet; D1/D2 can't fire). See the deferred-decision block in `D-A13-PRODUCTION-ACTIVATION-2026-06-06`.
- **Other inert-flag production activations** (`code-critical` each). A10 (`PLUGIN_INSTALL_AUTH_ENABLED`), A11b (`SUBSTRATE_INJECTION_DEFENCE_ENABLED`), A12 (`SUBSTRATE_OTEL_ENABLED`) are all Verified-live on TEST but **inert in production** (activation deferred under PR7). Each is its own Critical activation, same shape as A13 today.
- **R17c cleanup only** (`governance`; short). Just the reconcile + production-`200` re-confirm from the finding above.

**Recommendation:** open with the **Stage-1 status reconciliation** (≤30 min — it cleans the drift just found and tells us exactly what's left), then proceed into **A19** as the build. If you'd rather press straight into building, A19 alone is a clean session.

---

## Where this sits (one paragraph)

Stage 1 of the substrate-as-plugin arc: A10 (identity), A11b (injection defence), A12 (OTel + audit + baselines), and A13 (five R5 cost-health detectors) are all **Verified-live**. **A13 is now activated in production** (detection live; delivery deferred). A10/A11b/A12 remain **Verified-live on TEST but inert in production** (their production-activation flags UNSET, deferred under PR7). R17c genuine deletion + `/api/user/export` portability were **Verified 2026-05-29**. Stage-1 close requires **all A10–A19 sub-stages Verified** — so the remaining build set (at least **A19**; plus confirm the disposition of **A14** SLOs, **A15b/c/d** SAR/rectification/portability, **A16/A17/A18** governance) must be settled first. The parallel legal/insurance (FPE) track + lawyer engagement remain startable on wall-clock whenever you choose.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. Production is green and the A13 activation holds: `cost_alerts` live; `SUBSTRATE_COST_ALERTS_ENABLED=true` + `COST_ALERTS_EVAL_TOKEN` set in Vercel; `/api/billing/cost-alerts/evaluate` returns `200` with the token; `/api/reason` byte-identical. (The interim cost-health curl is in the predecessor close.)
2. All four R20a flags remain `true`; OTel / injection-defence / Layer3 / plugin-install-auth flags remain UNSET (unchanged by today's A13 session).
3. `D-A13-PRODUCTION-ACTIVATION-2026-06-06` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table (incl. the KG-EX1 prescribe-before-grounding + PR17 one-line-hand-off redirects).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the migration/status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-06-A13-production-activation-close.md`.
4. `/adopted/substrate-plugin-staging-plan.md` — §A19 (+ §A14, §A15, §A16–A18, and the Stage-1 close gating list) for whichever item is elected. **Read against the decision log, not at face value** (drift found — see the finding above).
5. `/operations/decision-log.md` last 3–4 entries + grep the Verified-live states for A10/A11b/A12/A13/R17c to build the true Stage-1 disposition.
6. For A19 specifically: `/manifest.md` targeted (R5 rate-limit/cost guardrails; R3/R4 as relevant); the A12 baseline surface (`getIdentityCostBaseline` / `loop_billing_events`) and A13's per-identity detector (`website/src/lib/cost-alerts/cost-alert-detector.ts`) that A19 consumes.

Confirm at open (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (likely N/A for A19's detection logic unless an LLM classifier is introduced — confirm). KG scan: **KG1** engages on any DB-write code; **KG7** if JSONB writes.

**PR15 consult (before any bespoke build):** check `.claude/skills/anthropic/` for a relevant SKILL.md pattern and `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding whose target session matches; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke; record the justification in the decision-log entry if bespoke is elected.

---

## Part B — Procedure (recommended default: reconciliation → A19)

### Step 0 — Stage-1 status reconciliation (governance; ≤30 min; optional-but-recommended)
Build the true Stage-1 disposition table (sub-stage → claimed status in staging plan → actual status per decision log → delta). Correct the manifest/staging-plan R17c "503 placeholder" note to reflect Verified deletion (governing-doc edit → **founder approval required before editing**; preserve the prior version). Output: an accurate "what's left before Stage-1 close" list.

### Step 1 — A19 scope confirmation (read-only)
From staging plan §A19 + the manifest: confirm exactly what abuse-detection + rate-limiting covers (per-identity request-rate limits; anomaly/abuse signals off the A12 baselines + A13 per-identity detector; the response posture). Classify each piece's risk (additive detection = Elevated; any change to an existing user-facing limit = Elevated; nothing here should touch R20a — confirm, PR6 boundary check).

### Step 2 — Single-endpoint proof first (PR1)
Prove the new abuse/rate-limit pattern on one endpoint to Verified before any surface rollout. Build-to-wire verification immediate (PR2): confirm invocation in the execution path, not just correct output.

### Step 3 — Wire + flag-gate (inert)
Additive, flag-gated behind an UNSET flag so production stays byte-identical until a separate activation session (same discipline as A10–A13). KG1 on DB writes.

### Step 4 — Verify (PR10 PEV)
Sandbox unit + `tsc` clean + PR2 call-path grep; then the founder-walked live TEST pass (the localhost half Cowork can't reach — walked step-by-step, PR17) against the **TEST** Supabase project via `website/.env.development.local`, throwaway test login, never `.env.local`/production. State diagnostic-certainty on any finding.

### Step 5 — Decision-log entry (lean Elevated form) + session close (lean form)
Per the standing-cache templates. Record status movement to Wired (inert) → Verified-live on the founder pass.

*(If a `code-critical` item is elected instead — A13 delivery follow-on or an inert-flag activation — switch to the full Critical Change Protocol + full templates, as in today's A13 activation session.)*

---

## What is NOT in this session
- No production-activation of A10/A11b/A12 flags unless explicitly elected (each is its own Critical session).
- No R20a / Zone 2/3 / classifier touch (PR6 trip-wire — if any step is found to, it becomes Critical).
- No bundling of the manifest R17c reconcile into a build step without explicit founder approval (governing-doc edit).
- No git operations by the AI (founder commits/pushes via GitHub Desktop).

## Rollback path
A19 is additive + flag-gated → inert; rollback is `git revert` of the uncommitted work (nothing reaches production until a separate activation). The reconciliation is documentation; prior versions preserved. No production change in the default path.

## Forecast
Most likely: a short reconciliation produces an accurate Stage-1 disposition (and clears the R17c drift), then A19 lands Wired-inert + sandbox-verified, → Verified-live on the founder's TEST pass — leaving Stage-1 close within reach once the remaining sub-stages (A14/A15b–d/A16–18 disposition) are confirmed. The A13 delivery follow-on, the A10/A11b/A12 production activations, and the legal/insurance (FPE) track all remain available to elect.

End of prompt. Opens on `main`. Tier set by the elected item; if a Critical item is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
