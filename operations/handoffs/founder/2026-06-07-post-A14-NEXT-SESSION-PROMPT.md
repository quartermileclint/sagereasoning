# Next-Session Prompt — Post-A14-governance-Verified: Stage-1 build continuation (founder elects at open)

Paste this whole file into a new session to proceed. Canonical prompt for the session after the A14 SLO & error-budget policy reached Verified-live (governance half; 2026-06-07 — committed, pushed, Vercel green; documentation-only, production byte-identical). The A14 *implementation* half (live-adherence tracker) was deferred by founder election under PR7.

**Stream:** founder. **Tier:** set by the elected item (see menu) — `governance` for the confirm/housekeeping items; `code-elevated` for A18 / A19-surface-rollout; `code-critical` for A15b / A15c or any inert-flag production activation. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A14-slo-error-budget-close.md`.
**Predecessor decision-log entries:** `D-A14-SLO-ERROR-BUDGET-POLICY-2026-06-07`; `D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06`; `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06`; `D-A13-PRODUCTION-ACTIVATION-2026-06-06`.

## Carried-forward state (read before scoping)

- **A14 governance is Verified-live.** `/adopted/slo-error-budget-policy.md` defines per-surface SLOs (4 tiers; Tier 0 anchored to AC2's ≤500 ms classifier rule), error budgets (request-count + quarterly time), and the >50%-burn feature-freeze discipline. Committed + pushed 2026-06-07.
- **A14 implementation (live SLO-adherence tracker) is deferred (PR7).** Revisit when A12 OTel is activated in production and real traffic exists (≈ launch / P6), or whenever elected. Target substrate: the A12 OTel surface (`substrate_audit_events.layer1/2/3_latency_ms`) + the **Datadog** connector (PR15 — reuse before bespoke). It can't measure anything until traffic exists, which is why it waits.
- **Open approval item (governance, ~2 min):** the staging-plan §A14 status was **not** edited (in-place edit to an adopted governing doc needs explicit founder approval + a prior-version backup). The decision log records the status movement, so nothing is lost. If elected, mark `/adopted/substrate-plugin-staging-plan.md` §A14 "governance done; implementation deferred" — Elevated, with a backup taken first (same shape as the R17c reconcile).
- **A15 open governance question (from `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06`):** does the Verified-live `/api/user/export` already satisfy **A15b** (SAR / GDPR Art 15) and close **A15d** (portability / Art 20), or are a dedicated `/api/user/access` endpoint + a structured-export contract still required? Answering this *first* (read-only + governance) would scope — and possibly shrink — the Critical A15b/A15c builds.
- **Carried housekeeping:** `CLAUDE.md` "Production state (as of 2026-05-14)" block is stale — refresh in a governance pass.
- **PR5 candidate (count 1) — append-only teardown.** Seeding `substrate_audit_events` for any TEST run requires `ALTER TABLE … DISABLE TRIGGER trg_sae_no_delete` around the teardown DELETE (the table is append-only). Promote on recurrence.

## Founder elects the item at open
This prompt's default + recommendation is the **A15 governance-confirm pass** (cheap, read-only + governance, may clear A15d / shrink A15b). Say so at open; the AI re-scopes to any of the below.

- **A15 governance-confirm pass** (`governance`; ~1 session). Read the Verified `/api/user/export` (and `/api/user/delete`) against GDPR Art 15 (SAR) + Art 20 (portability) + the staging-plan §A15 contract. Produce a disposition: does export satisfy A15b/A15d as-is, or are dedicated endpoints / a structured-export contract required? Outcome scopes the remaining A15 work precisely before any Critical build. **This prompt's default.**
- **FPE / legal track kickoff** (founder-initiated; startable on wall-clock anytime). The long-pole gating A16 + A17 and therefore Stage-1 close. Not an AI build session per se — the AI helps scope the lawyer engagement, the L1 ADR, and the I1 insurance quote. Independent of the build items; can run in parallel. **Highest-leverage strategic move.**
- **A18 — onboarding + limitations governance pass** (mixed Standard/Elevated; ~1–2 sessions). R19c limitations page, R19d mirror principle in mentor prompts, R20b framework-dependence detection (PR6 applies to A18c), accessibility statement. The next clean no-lawyer build item; similar shape to A14.
- **A19 surface rollout** (`code-elevated`; ~1 session). Add the `systematic_enumeration` + `rapid_input_variation` detectors to the now-Verified A19 evaluator (PR1 surface rollout — the pattern is proven). Structural-only off `masked_context` (no raw text — R3/R17 boundary).
- **A15b / A15c** (`code-critical` each). SAR (`/api/user/access`) + rectification (`/api/user/rectify`). Recommend the A15 governance-confirm pass first.
- **A14 tracker follow-on** (`code-elevated`; deferred). Build the flag-gated inert SLO-adherence tracker off the A12 latency columns. Only worth it once A12 OTel is activated and traffic exists — low value before then.
- **Deferred Critical activations** (`code-critical` each) — A19 production activation; A13 automated-delivery follow-on; A10 / A11b / A12 production activations. Each its own Critical session, same shape as the A13 activation (2026-06-06). Low urgency (no traffic/revenue yet).

**Recommendation:** run the **A15 governance-confirm pass** (cheap, may clear A15d and shrink A15b before committing to Critical builds), and/or kick off the **FPE/legal track** on wall-clock since it gates the most remaining items. The two are independent and can run in parallel.

## Where this sits (one paragraph)
Stage 1 of the substrate-as-plugin arc. Verified-live: A10 (identity), A11b (injection defence), A12 (OTel + baselines), A13 (cost-health — also activated in production), A14 (SLOs/error-budgets — governance half), A15a (R17c deletion), A15d (portability, substantially), and A19 (abuse-detection, detection-only). A10/A11b/A12/A19 are Verified-live on TEST but inert in production (flags UNSET; activation deferred under PR7). Stage-1 close needs all A10–A19 Verified — remaining: **A15b, A15c, A16, A17, A18** (A16/A17 lawyer-coupled), plus the deferred A14 tracker — plus lawyer engagement initiated, an EU-customer plausibility decision, and the parallel FPE track (L1 ADR + I1 quote). Stage-1 close is several sessions out, not imminent.

## Pre-conditions (founder confirms at open; AI verifies by read)
1. The A14 governance commit is pushed; Vercel green; `/api/reason` byte-identical. (Last commit should reference D-A14; working tree clean.)
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / `SUBSTRATE_ABUSE_DETECTION_ENABLED` all UNSET; A13 cost-health detection Live (activated).
3. `D-A14-SLO-ERROR-BUDGET-POLICY-2026-06-07` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. No outstanding TEST seed data (A19 teardown completed; `substrate_audit_events` append-only guard re-enabled).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table (KG-EX1 prescribe-before-grounding + PR17 one-line-hand-off redirects).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-07-A14-slo-error-budget-close.md`.
4. `/adopted/substrate-plugin-staging-plan.md` — the section for the elected item (§A15 / §A18 / §A19 / Stage-1 close gating). Read against the decision log, not at face value.
5. `/operations/decision-log.md` last 4 entries (the predecessor entries above) + grep the Verified-live states for A10/A11b/A12/A13/A14/A15a/A19.
6. `/manifest.md` targeted for the elected item — for A15: R17g/h/i (SAR / rectification / portability); for A18: R19c/R19d/R20b; for A19-rollout: R3 + R17 (no-PII scope).

Confirm at open (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (likely N/A unless an LLM classifier is introduced — confirm). KG scan: KG1 on any DB-write code; KG7 on JSONB writes. PR15 consult before any bespoke build (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke).

## Part B — Procedure (default: A15 governance-confirm pass)
If the A15 confirm is elected (re-scope per the staging-plan section if not):
1. **Read-only inspect.** Read `website/src/app/api/user/export/route.ts` and `website/src/app/api/user/delete/route.ts`; note exactly what `/api/user/export` returns (which tables/fields, format). Read staging-plan §A15 (A15b/A15c/A15d contracts) + manifest R17g/h/i.
2. **Map to the requirements.** For each of Art 15 (SAR — right of access) and Art 20 (portability — structured, machine-readable, commonly-used format), state whether the existing export satisfies it, partially satisfies it, or doesn't. Be honest about gaps (R18/R19).
3. **Produce a disposition** (governance deliverable): what's already covered, what (if anything) a dedicated `/api/user/access` and/or a structured-export contract must add, and the precise scope of the remaining A15b/A15c Critical builds. This shrinks or confirms the Critical work before it's committed to.
4. **Verify (0c governance):** a requirements-vs-in-place checklist the founder reads. No code/schema/production change in this pass.
5. **Decision-log entry (lean form)** + **session close (lean form)** per the standing-cache templates. Record any A15d status movement.

## What is NOT in this session
- No production activation of any inert flag (A19 / A10 / A11b / A12 / A13-delivery) unless explicitly elected — each is its own Critical session.
- No R20a / Zone 2/3 / classifier / wrapper touch (PR6 trip-wire — if any step is found to, it becomes Critical).
- No new A15b/A15c *code* in the default (governance-confirm) pass — that's a separate Critical session once scope is confirmed.
- No git operations by the AI (founder commits/pushes via GitHub Desktop).
- No edits to governing docs (manifest, staging plan, CLAUDE.md) without explicit founder approval + prior-version preservation. (The staging-plan §A14 status edit and the CLAUDE.md stale-block refresh are both available as elected housekeeping, each with a backup.)

## Rollback path
Per the elected item. The A15 governance-confirm default is documentation only → revertible via `git revert` of the uncommitted work; no production change.

## Forecast
Most likely: the A15 confirm produces an honest disposition that either (a) closes A15d and confirms `/api/user/export` largely satisfies A15b — shrinking the remaining Critical work to a thin SAR wrapper + A15c rectification — or (b) precisely scopes the dedicated endpoints needed. Either way the Critical A15 builds become smaller and better-defined. The FPE/legal track remains the long-pole gating A16/A17 and Stage-1 close, so starting it on wall-clock in parallel is the highest-leverage move regardless of which build item is elected.

End of prompt. Opens on `main`. Tier set by the elected item; if a Critical item is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
