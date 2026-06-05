# Next-Session Prompt — A12: OpenTelemetry GenAI instrumentation + call-grain audit

Paste this whole file into a new session to proceed. This is the canonical prompt for the next build-arc session after **A11b reached Verified-live across both LLM seams** (combined flag-ON TEST adversarial probe; 2026-06-03).

**Stream:** founder. **Tier:** `code-elevated` — **Elevated** under 0d-ii (instrumentation of existing user-facing functionality + a new external dependency; the lean templates + Elevated additions apply). **NOT Critical** — no auth / session / encryption / R20a-perimeter / deployment-config change. **PR6 trip-wire:** if any step is found to touch the R20a distress classifier, Zone 2/3 logic, or their wrappers, that step is reclassified **Critical** and the full Critical Change Protocol (0c-ii) applies. Engaged process rules: PR1 (single-endpoint proof — instrument `/api/reason` first and reach Verified before any rollout), PR2 (build-to-wire verification — confirm spans/logs actually emit on the live call path, not just that the code compiles — grep the call path, not the definition), PR10 (Plan→Execute→Verify with diagnostic-certainty signalling), PR15 (consult Anthropic-canonical primitives + `.claude/skills/anthropic/` + the agentic-commerce findings tracker before any bespoke build), PR17 (any founder-performed step — env vars, observability dashboard, deploy — walked live, click-by-click, never handed off as a one-liner).

**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/substrate-plugin-staging-plan.md` §A12.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md`.
**Predecessor decision-log entry:** `D-A11B-COMBINED-FLAG-ON-TEST-PROBE-VERIFIED-LIVE-2026-06-03` (closes the two A11b seam entries; builds behind `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`, whose per-install identity A12's per-identity tracking uses).

## Founder elects the item at open

A11b is Verified-live; the Stage-1 critical path now runs through A12. This prompt is scoped to A12 (the recommended next item). If you'd rather take a different item this session, say so at open and the AI re-scopes:

- **A12 — OpenTelemetry GenAI instrumentation + call-grain audit** (Elevated; ~1–2 sessions) — this prompt's default. Pre-condition A10 wired (met).
- **A15a — R17c genuine deletion endpoint** (Critical; ~1 session) — replaces the 503 placeholder; depends on A10's identity discrimination.
- **A19 — abuse-detection + rate-limiting** (Elevated; ~1 session) — depends on A10.

Recommendation: **A12 next** — it instruments the substrate path before Stage 2 broadens exposure to many consumers, and its per-call audit + cost/identity telemetry are the precondition for A13 (cost alerts), A16 (DPIA/privacy), and A19 (behavioural baselines). Then A15a.

## Where this sits (one paragraph)

A10 (per-install credentials + revocation + identity discrimination) is Verified-live; A11b (prompt-injection defence at the Layer 1 + Layer 3 LLM seams) is now Verified-live across both seams. A12 adds **observability** over the same `/api/reason` substrate path: OpenTelemetry GenAI semantic conventions, trace propagation across Layer 1 → Layer 2 → Layer 3 → the Supabase write, per-call audit logging (with masked sensitive data + immutable storage), and per-identity cost + behavioural baselines (built on A10's identity surface). A12 depends on A10 (met) and precedes Stage 2 K-category migration. Per the staging plan, A12 **folds in agentic-commerce finding F4 (AC10/AP2 alignment)** at session-open per the findings tracker.

## Why this session matters

Observability is the load-bearing precondition for three downstream items: A13 (R5 cost-as-health-metric alerts), A16 (DPIA / privacy governance — the call-grain audit log is the DPIA's evidence surface), and A19 (abuse detection needs per-identity behavioural baselines). Instrumenting now, on a single endpoint, before Stage 2 broadens substrate exposure, proves the telemetry contract while it only has to cover one consumer (PR1) — rather than retrofitting it across many migrated consumers later.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. A11b committed + pushed; Vercel green. (Confirmed at the 2026-06-03 A11b probe close.) Confirm `D-A11B-COMBINED-FLAG-ON-TEST-PROBE-VERIFIED-LIVE-2026-06-03` is in `/operations/decision-log.md`.
2. A10 wired (met) — per-install identity available for per-identity tracking.
3. Production unchanged: `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET; `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (`/api/substrate/layer3` → 503); `/api/reason` byte-identical.
4. No work has begun after the A11b probe entry — scan the decision log for any entry after `D-A11B-COMBINED-FLAG-ON-TEST-PROBE-VERIFIED-LIVE-2026-06-03`.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table incl. the PR17 one-line-hand-off redirect).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context; the "no current users" note).
3. `/operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md` (predecessor close — production state; what's Verified-live; the deferred items).
4. `/adopted/substrate-plugin-staging-plan.md` §A12 + the Stage-1 dependency lines + the Stage-1 risk profile.
5. **PR15 consult (before any design):**
   - `.claude/skills/anthropic/` — scan for a relevant pattern (`claude-api`, `mcp-builder`, `frontend-design`; check for any observability/OpenTelemetry skill) matching the session scope.
   - `/operations/agentic-commerce-findings-downstream-order.md` §F4 — the AC10/AP2-alignment finding A12 folds in; fold at the named point per the findings document.
   - Anthropic SDK / developer docs — check for built-in OpenTelemetry or instrumentation support before electing any bespoke instrumentation (PR12 negative-finding discipline if a search returns nothing).
6. The live source A12 instruments (read to design the contract accurately): `website/src/app/api/reason/route.ts` (the request path + the existing per-layer cost-microcents handling); `website/src/lib/translation-sandwich/parallel-run.ts` (`runSandwichInner` — the Layer 1 → Layer 2 → Layer 3 sequence + where to thread correlation IDs); `website/src/lib/loop-cost-tracker.ts` (the existing per-loop cost accumulator A12 extends for per-call / per-identity tracking); and the A9 cost-monitoring deliverable.
7. `/operations/decision-log.md` last 2–3 entries.

Confirm at open: tier (`code-elevated`); hold-point status (P0 0h active); model selection (the instrumentation itself is **not** an LLM call; the instrumented Layer-1 + Layer-3 calls are **Sonnet** per the cache AC1 rows); status vocabulary; signals + risk class; **KG scan — KG1** (Vercel five rules — A12 adds DB writes for audit logs) and **KG7** (JSONB storage format — if audit events are stored as JSONB) engage; PR1 / PR2 / PR10 / PR15 / PR17 engaged. Narrate before substantive work: where we are in the arc (A10 + A11b Verified-live; A12 adds observability on the proof endpoint); what's queued (A13 → Stage-1 close; A15a/A19); what's awaiting the founder vs the AI.

## Part B — Procedure (design-first; Elevated lean templates + additions)

### Step 1 — Plan + PR15 consult
State whether an Anthropic-canonical primitive or an existing dependency delivers the instrumentation before electing a bespoke OpenTelemetry wiring; record the F4 fold-in. Name the change, what could break, the rollback path, and the verification step (lean PEV per PR10). If bespoke is elected, justify in the decision-log "Reasoning" naming the primitive considered.

### Step 2 — Design the telemetry contract (Design, not Build, unless the founder signals "Build this")
- OpenTelemetry GenAI semantic conventions for the substrate operations.
- Trace propagation Layer 1 → Layer 2 → Layer 3 → Supabase write (correlation IDs threaded through `runSandwichInner`).
- Per-call audit-log shape: decision event + context + **masked** sensitive data + immutable storage. (Masking is the safety/privacy-relevant element — coordinate with the R17 surface; if masking logic is found to read the R20a signal path, PR6 trip-wire applies.)
- Per-identity cost + behavioural-baseline metrics (uses A10 identity).

### Step 3 — Single-endpoint proof (PR1)
Instrument `/api/reason` only; prove spans + the audit-log row emit on the live call path (PR2 — grep the call path + a TEST run), **additive** (no change to the `/api/reason` response shape). Do not roll out to other routes this session.

### Step 4 — Verify
Founder-performable (walked live, PR17 — likely a TEST run reaching `localhost`, which the Cowork sandbox cannot): a TEST call that emits a trace + an audit-log row; AI shows the row; founder confirms. Verify masking — no raw intimate/free-text data in the stored log.

### Step 5 — Decision-log entry (lean + Elevated additions)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean decision-log entry", plus the Elevated rollback-path + verification-step detail.

### Step 6 — Session close (lean + Elevated additions)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean session close". State production state explicitly (expected UNCHANGED — additive instrumentation, nothing flipped in production this session). Name the next session (A13, then Stage-1 close work; A15a/A19 available) + pre-conditions.

## What is NOT in this session
- Rollout of instrumentation to endpoints beyond `/api/reason` (PR1 — only after the single-endpoint proof reaches Verified).
- A13 cost-alert thresholds (separate Elevated item; depends on A12).
- Production activation of `SUBSTRATE_INJECTION_DEFENCE_ENABLED` (its own future Critical step; do not bundle).
- A15a / A19 (queue behind A12 unless the founder elects one as this session's item instead).

## Rollback path
Instrumentation is additive and, where feasible, flag-gated. If a span/log path misbehaves, disable the instrumentation flag (or revert the commit) and `/api/reason` returns to its current behaviour. The exact path is specified in the session's Plan step (Step 1).

## Forecast
Most likely: the telemetry contract is designed against the OpenTelemetry GenAI conventions and proven on `/api/reason` (single-endpoint, additive), with a per-call audit row + per-identity cost baseline emitting in TEST and F4 folded in — taking A12 to Verified on the proof endpoint. Next: A13 cost alerts, then Stage-1 close work; A15a/A19 also available. The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting on wall-clock whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

End of prompt. Opens on `main`. Elevated-tier; PR1 single-endpoint proof on `/api/reason`; any step found to touch the R20a classifier or its wrappers reclassifies that step to Critical (PR6) and the full Critical Change Protocol applies.
