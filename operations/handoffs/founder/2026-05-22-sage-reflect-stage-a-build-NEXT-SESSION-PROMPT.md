# Next-Session Prompt — Sage Reflect Build: Stage A (deterministic engine + store + Sage Assent feed)

**Stream:** founder.
**Tier:** `code-elevated` (Stage A is Elevated — new modules + additive schema; no auth/endpoint/LLM surface). Stage B (the endpoint) is a separate Critical session.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users").
**Predecessor session close:** `/operations/handoffs/founder/2026-05-22-sage-reflect-design-lock-build-scope-close.md`.
**Predecessor decision-log entries:** `D-SAGE-REFLECT-DESIGN-LOCKED-2026-05-22`; `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21`.
**Operative deliverables (read in full):** `/adopted/sage-reflect-product-design.md` (LOCKED) + `/drafts/sage-reflect-build-staging-plan.md` (Stage A section).
**Risk classification:** **Elevated** under 0d-ii. Critical Change Protocol NOT engaged this session (no auth/endpoint/env-flag/R20a surface — those are Stage B). PR1 + PR2 + KG1 + KG7 engaged.

## Why this session matters
Sage Reflect's design is LOCKED and adopted. Stage A builds the part that needs no perimeter: the deterministic six-question engine, the Sage Reflect-owned additive store, the (new) `evaluated_actions` table, the SR-15 per-domain proximity store, and the Sage Assent feed that recomputes `agent_accreditation` via the existing aggregator/grade-engine. Proving this in isolation first is PR1 discipline — Stage B's endpoint wires onto a Verified engine, not an unproven one.

## Pre-conditions (confirm at open)
1. The 2026-05-22 lock commit is pushed + Vercel green (**founder-confirmed 2026-05-22**); the stale `.git/index.lock` was removed; the design is LOCKED at `/adopted/sage-reflect-product-design.md` (status line reads "LOCKED 2026-05-22"; SR-15 present).
2. Production unchanged: Sage Calling Live (gated); substrate A7 Verified; A10 Live + Verified; `SUBSTRATE_LAYER3_ENABLED` + `SUBSTRATE_R20A_GATE_ENABLED` UNSET; Layer 1 schema v3.
3. Sage Calling smoke-test cleanup status (surface; don't block).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. This predecessor close.
4. `/operations/decision-log.md` — the last 2 entries.
5. `/adopted/sage-reflect-product-design.md` (LOCKED) + `/drafts/sage-reflect-build-staging-plan.md` Stage A — **in full**.

Confirm at open: tier (`code-elevated`); hold-point (P0 0h active); status vocab (Sage Reflect = Designed/LOCKED → building to Scaffolded/Wired/Verified this session); signals/risk class. PR4: no LLM in Stage A (the engine is deterministic) — confirm model selection is N/A for Stage A and Sonnet for Stage B's Layer 1. PR15: SR-4 reuse posture is the default; the only bespoke element is the SR-15 per-domain computation (already justified at lock).

## Part B — Procedure (Stage A)
### Step 1 — The deterministic engine
Q1→Q6 step function over response history; branching only at Q5/Q6; FD-R1..R4 (all deterministic; FD-R1 gates the profile update; FD-R3 mandatory); RS-1..RS-4 exit routing + the RS-4 supporting-question ladder; the Sage Calling trigger payload assembly. No LLM, no randomness.

### Step 2 — The additive store (KG7) + R17 posture
Sage Reflect-owned tables/columns keyed by `(agent_id, session_id)`: `phantasia_distortion_log`, `synkatathesis_failure_log`, `horme_pattern_log`, `kathekon_quality_log`, `circle_need_log`. JSONB arrays written directly. App-level encryption for the intimate fields; 90-day retention; genuine deletion (SR-12). Idempotent migration.

### Step 3 — `evaluated_actions` table migration (A-3) + SR-15 per-domain store (A-4)
Extract the `evaluated_actions` DDL from `trust-layer/schema/trust-layer-schema-REVIEW.sql`; create `public.evaluated_actions` (additive, idempotent, RLS consistent with `agent_accreditation`). Add the SR-15 per-domain proximity store. **Confirm at kickoff:** the aggregator consumes persisted rows unchanged (vs in-memory only).

### Step 4 — The Sage Assent feed (SR-4)
Write Q4 kathekon as `EvaluatedAction`-shaped records → call `computeWindowSnapshot(actions: EvaluatedAction[])` → `grade-transition-engine` → recompute `agent_accreditation`. Do NOT write `senecan_grade`/`typical_proximity` directly (preserve hysteresis). Compute the SR-15 per-domain proximity (KP-04 unity rule) and write it Sage-Reflect-side. Cross-product flags written.

### Step 5 — Verify (PR1 + PR2)
Single-endpoint-proof discipline; build-to-wire-immediate (grep for *calls* of the FD gates + the Sage Assent feed in the execution path, not definitions). Tests with `tsx` per `/CLAUDE.md`: plain `npx tsx <path>`; `npx tsx --env-file=.env.local <path>` for Supabase-importing tests; run one at a time. KG1 (await all DB writes; no fire-and-forget).

### Step 6 — Append decision-log entry (lean form) + Step 7 — Session close (lean form)
Per `/adopted/standing-protocol-cache.md`. Write the Stage B (Critical) next-session prompt.

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Part A — caches + closes + deliverables | 20–25 min |
| Step 1 — engine | 45–70 min |
| Step 2 — store | 30–45 min |
| Step 3 — migrations | 30–45 min |
| Step 4 — Sage Assent feed | 40–60 min |
| Step 5 — verify | 30–45 min |
| Decision-log + close | 20–30 min |
| **Total** | **~3.5–4.5 hr** (likely split across sessions on time budget, per Rule B) |

## Rollback path
Stage A is additive: new modules (revert the commit) + idempotent additive schema (`DROP TABLE evaluated_actions`, drop the Sage-Reflect tables/columns). No existing table modified; no production endpoint touched; nothing user-facing changes. The engine is unreachable until Stage B wires the endpoint behind `SAGE_REFLECT_ENABLED`.

## Forecast
After Stage A: the Sage Reflect engine + store + Sage Assent feed are **Wired → Verified** in isolation, with the rolling window now durably persisted. Stage B (Critical) then wires `POST /api/practice/reflect`, the translation-sandwich Q1–Q4 scoring, the R20a/Zone-3 boundary, and the R18d suite — behind the kill switch.

*End of prompt. Opens under Part A as a `code-elevated` build session. The endpoint and all safety/auth surfaces are Stage B (Critical), not this session.*
