# Next-Session Prompt — Post-A19-verified: Stage-1 build continuation (founder elects at open)

Paste this whole file into a new session to proceed. Canonical prompt for the session after **A19 `request_velocity_anomaly` reached Verified-live** (2026-06-06; detection-only, flag-gated inert in production) and the **R17c/A20 documentation drift was reconciled** (same session).

**Stream:** founder. **Tier:** set by the elected item (see menu) — `governance` for the disposition/confirm items; `code-elevated` for A14 / A19-rollout; `code-critical` for any inert-flag production activation. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-06-reconcile-A19-abuse-detection-close.md`.
**Predecessor decision-log entries:** `D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06`; `D-A19-ABUSE-DETECTION-VELOCITY-PROOF-2026-06-06`; `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06`; `D-A13-PRODUCTION-ACTIVATION-2026-06-06`.

## Carried-forward state (read before scoping)

- **A19 is Verified-live but detection-only.** The `request_velocity_anomaly` detector is proven; the surface rollout (`systematic_enumeration` + `rapid_input_variation` detectors, structural off `masked_context`) and **enforcement** (rate-limit / revoke on live traffic) are deliberately deferred. A19 is also **inert in production** (`SUBSTRATE_ABUSE_DETECTION_ENABLED` UNSET; `abuse_signals` not applied to prod) — production activation is its own Critical session.
- **PR5 candidate (count 1) — append-only teardown.** Seeding `substrate_audit_events` for a TEST run requires `ALTER TABLE … DISABLE TRIGGER trg_sae_no_delete` around the teardown DELETE (the table is append-only). Baked into the predecessor close's Step 2.8. Any future audit-seeding verification must include it. Promote on recurrence.
- **Open governance questions** (from `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06`): (a) does the Verified `/api/user/export` already satisfy A15b (SAR / Art 15) and close A15d (portability / Art 20), or are dedicated `/api/user/access` + a structured-export contract still required? (b) `CLAUDE.md` "Production state (as of 2026-05-14)" block is stale — refresh in a governance pass.

## Founder elects the item at open

This prompt's **default + recommendation is A14**. Say so at open and the AI re-scopes to any of the below.

- **A14 — SLOs + error-budget discipline** (`governance` + Elevated implementation; ~1–2 sessions). The next unbuilt Stage-1 item. Per-surface SLOs documented (e.g. `/api/reason` p95 <3s; R20a classifier p95 <500ms per AC2); error budgets; the >50%-burn feature-freeze discipline. Implementation can read latency straight off the A12 `substrate_audit_events` (`layer1/2/3_latency_ms`) — a clean synergy. **This prompt's default.**
- **A19 surface rollout** (`code-elevated`; ~1 session). Add the `systematic_enumeration` + `rapid_input_variation` detectors to the now-Verified A19 evaluator (PR1 surface rollout — the pattern is proven). Structural-only off `masked_context` (no raw text — R3/R17 boundary).
- **A15b / A15c** (`code-critical` each) — SAR (`/api/user/access`) + rectification (`/api/user/rectify`). **Recommend a short governance confirm first** of whether `/api/user/export` already covers A15b/A15d before building.
- **A18 — onboarding + limitations governance pass** (mixed Standard/Elevated) — R19c limitations page, R19d mirror principle in mentor prompts, R20b framework-dependence detection (PR6 applies to A18c), accessibility statement.
- **Deferred Critical activations** (`code-critical` each) — A19 production activation; A13 automated-delivery follow-on; A10 / A11b / A12 production activations. Each its own Critical session, same shape as the A13 activation (2026-06-06). Low urgency (no traffic/revenue yet).
- **Legal / insurance (FPE) track** — startable on wall-clock anytime; it is the **long-pole for Stage-1 close** (lawyer engagement gates A16 + A17). Not an AI build session per se; founder-initiated.

**Recommendation:** either build **A14** (clean, no lawyer dependency, advances Stage-1, reuses the A12 latency surface), or kick off the **FPE/legal track** on wall-clock since it gates the most remaining items. The two are independent and can run in parallel.

## Where this sits (one paragraph)

Stage 1 of the substrate-as-plugin arc. Verified-live: A10 (identity), A11b (injection defence), A12 (OTel + baselines), A13 (cost-health — also activated in production), A15a (R17c deletion), A15d (portability, substantially), and now **A19 (abuse-detection, detection-only)**. A10/A11b/A12/A19 are Verified-live on TEST but **inert in production** (flags UNSET; activation deferred under PR7). **Stage-1 close needs all A10–A19 Verified** — remaining: **A14, A15b, A15c, A16, A17, A18** (A16/A17 lawyer-coupled) — **plus** lawyer engagement initiated, an EU-customer plausibility decision, and the parallel FPE track (L1 ADR + I1 quote). Stage-1 close is **several sessions out**, not imminent.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A19 Verified-live commit (decision-log + corrected close) is pushed; Vercel green; `/api/reason` byte-identical.
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / **`SUBSTRATE_ABUSE_DETECTION_ENABLED`** all UNSET.
3. `D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. TEST is clean (A19 seed rows removed; `substrate_audit_events` append-only guard re-enabled; the two TEST env lines removed).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table (KG-EX1 prescribe-before-grounding + PR17 one-line-hand-off redirects).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-06-reconcile-A19-abuse-detection-close.md`.
4. `/adopted/substrate-plugin-staging-plan.md` — the section for the elected item (§A14 / §A19 / §A15 / §A18 / Stage-1 close gating). Read against the decision log, not at face value.
5. `/operations/decision-log.md` last 4 entries (the four predecessor entries above) + grep the Verified-live states for A10/A11b/A12/A13/A15a/A19.
6. `/manifest.md` targeted for the elected item — for A14: R5 + AC2 (R20a p95 <500ms); for A19-rollout: R5 + R3 (no-PII scope); for A15: R17g/h/i.

Confirm at open (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (likely N/A unless an LLM classifier is introduced — confirm). KG scan: KG1 on any DB-write code; KG7 on JSONB writes. **PR15 consult before any bespoke build** (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke).

## Part B — Procedure (default: A14)

If A14 is elected (re-scope per the staging-plan section if not):
1. **Scope confirm (read-only).** From staging plan §A14 + manifest: the per-surface SLO set (latency p95s; success-rate targets), the error-budget definitions, and the >50%-burn freeze discipline. Decide governance-only (document the SLOs + discipline) vs. governance + implementation (compute live SLO adherence off `substrate_audit_events.layer1/2/3_latency_ms`). Classify risk (documentation = Standard; any latency-instrumentation code = Elevated, additive + flag-gated inert).
2. **PR1 single-surface proof first** if implementing — prove SLO computation on one surface (`/api/reason`) before any rollout; PR2 build-to-wire verification immediate.
3. **Wire flag-gated inert** (if implementing) so production stays byte-identical until a separate activation. KG1 on any DB writes.
4. **Verify (PR10 PEV)** — sandbox unit + `tsc` clean + PR2 call-path grep; then the founder-walked live TEST pass (PR17) if there's a localhost path. State diagnostic-certainty on any finding. (Sandbox note: the repo `node_modules` carries the macOS esbuild binary, so `npx tsx` can't run in the Linux sandbox — use `tsc`-transpile + `node` in-sandbox; `npx tsx` runs natively on the founder's Mac.)
5. **Decision-log entry (lean form) + session close (lean form)** per the standing-cache templates. Record status movement.

## What is NOT in this session

- No production activation of any inert flag (A19 / A10 / A11b / A12 / A13-delivery) unless explicitly elected — each is its own Critical session.
- No R20a / Zone 2/3 / classifier / wrapper touch (PR6 trip-wire — if any step is found to, it becomes Critical).
- No A19 enforcement (rate-limit / revoke on live traffic) unless explicitly elected.
- No git operations by the AI (founder commits/pushes via GitHub Desktop).
- No edits to governing docs (manifest, staging plan, CLAUDE.md) without explicit founder approval + prior-version preservation.

## Rollback path

Per the elected item. The A14 default is governance (documentation) + optional additive flag-gated instrumentation → inert/revertible via `git revert` of uncommitted work; no production change in the default path.

## Forecast

Most likely: A14 lands the SLO documentation + (if implemented) flag-gated latency-adherence tracking reading the A12 surface, → Verified on the founder pass — clearing another Stage-1 item. The FPE/legal track, the A19 surface rollout, and the deferred Critical activations all remain available to elect. Stage-1 close stays gated on the lawyer engagement (A16/A17) regardless, so starting the FPE track on wall-clock is the highest-leverage parallel move.

End of prompt. Opens on `main`. Tier set by the elected item; if a Critical item is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
