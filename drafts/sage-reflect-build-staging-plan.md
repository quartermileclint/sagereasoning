# Sage Reflect — Build-Staging Plan (DRAFT — scoping output, for founder review)

**Status:** DRAFT scoping note produced 2026-05-22 alongside the design lock (`D-SAGE-REFLECT-DESIGN-LOCKED-2026-05-22`). Not a governing plan until locked; the Sage Reflect build sessions read this as their deliverable-of-the-day. `governance`/`code-standard` (Standard) to produce; the builds it describes are Elevated (Stage A) then Critical (Stage B).
**Source of truth:** `/adopted/sage-reflect-product-design.md` (LOCKED). This note schedules that design; where they differ, the locked design wins.
**Pattern:** mirrors the Sage Calling two-stage go-live (Stage A engine+store Elevated → Stage B endpoint Critical). Ships behind `SAGE_REFLECT_ENABLED` (off by default → 503). "No current users" governing note applies (build-arc cache): Critical Change Protocol step 3 ("existing sessions") answers "N/A — only founder + test logins exist."

---

## Frame

Two stages, each a session (or more — sessions end on time budget per Rule B, not on step count). Stage A is provable in isolation with no auth/endpoint surface; Stage B is the Critical perimeter work. PR1 (single-endpoint proof before rollout) and PR2 (build-to-wire verification immediate, in the same session) govern both.

Route (locked SR-13): **`POST /api/practice/reflect`**. Auth (SR-14): reuse A10 `sr_atl_` credential, unscoped. Kill switch (SR-13): global `SAGE_REFLECT_ENABLED`, unset/`false` → 503, no code change.

---

## Stage A — deterministic engine + store + Sage Assent feed (Elevated)

No auth, no public endpoint, no LLM in the control flow. Everything here is a pure step function plus additive persistence, callable and unit-testable in isolation.

### A-1 — The deterministic engine
- Q1→Q6 step function over response history; no question skipped; branching only at Q5 and Q6 (mirrors the Sage Calling engine — deterministic, auditable, no randomness, no sentiment).
- FD-R1..R4 fabrication defences (all deterministic): FD-R1 null-suspicion gate (gates the profile update); FD-R2 cross-session comparison; FD-R3 mandatory pressure-assent sub-question (fires regardless of Q2's main answer); FD-R4 Sage Assent calibration cross-check.
- Q6 response-shape classification → RS-1..RS-4 exit routing; RS-4 supporting-question ladder (deterministic) before any LLM escalation; RS-4 defaults to RS-2 if unresolved.
- Sage Calling trigger payload assembly (RS-2/RS-3): `trigger_type`, `capacity_revision`, `need_revision`, `session_learnings`, `active_passion_profile`, `fabrication_risk_level`.

### A-2 — Sage Reflect-owned additive store (KG7)
- New tables/columns keyed by `(agent_id, session_id)`, written additively, JSONB arrays passed directly (never `JSON.stringify`; expected `jsonb_typeof = 'array'`): `phantasia_distortion_log`, `synkatathesis_failure_log`, `horme_pattern_log`, `kathekon_quality_log`, `circle_need_log`.
- R17 posture (SR-12): full session persistence; 90-day retention; genuine (hard) deletion; minimisation; app-level encryption for the intimate introspective fields. Mirror the Sage Calling `discovery_sessions` posture.

### A-3 — `evaluated_actions` table migration (NEW — from the 2026-05-22 lock finding)
- The `evaluated_actions` **table is not yet migrated**: it exists only in DRAFT `trust-layer/schema/trust-layer-schema-REVIEW.sql` (marked DO NOT RUN); the live Sage Assent runs the rolling window **in-memory** from the wrapper's `CarriedProfile`. The `EvaluatedAction` **type** is fully compatible with Sage Reflect's Q4 output (no type change).
- Stage A creates `public.evaluated_actions` as an additive, idempotent migration (extract the table DDL from the review schema; `IF NOT EXISTS`; RLS service-role-write/public-read consistent with `agent_accreditation`). This lets Q4 records persist and accumulate across sessions so the rolling window is durable rather than per-process.
- **Decision to confirm at A kickoff:** persist-via-table (this) vs feed the in-memory aggregator only. The locked design assumes cross-session accumulation, which requires the table. Treat the table creation as Elevated (additive schema; reversible via `DROP TABLE`).

### A-4 — Sage-Reflect-owned per-domain proximity store (SR-15)
- Per the founder lock election: Sage Reflect computes per-virtue-domain katorthoma proximity (`phronesis/dikaiosyne/andreia/sophrosyne`) from the per-action `virtue_domains_engaged` + `proximity` it already produces at Q4, applies the KP-04 unity rule (aggregate = lowest domain), and stores it Sage-Reflect-side (Sage Assent has no field for it).
- New additive column/table for the per-domain breakdown, keyed by `agent_id`. Known-risk recorded in the design: a future native Sage Assent per-domain field must reconcile with this (rides the Sage Assent rename/enhancement track).

### A-5 — The Sage Assent feed (SR-4, reuse-not-reimplement)
- Write Q4 kathekon as `EvaluatedAction`-shaped records → call the existing pure aggregator `computeWindowSnapshot(actions: EvaluatedAction[])` → feed `grade-transition-engine` to recompute `agent_accreditation` (grade, proximity, dimensions, direction). Sage Reflect does **not** write `senecan_grade`/`typical_proximity` directly — submit evidence, let the engine decide (preserves hysteresis; no single session moves a grade).
- Cross-product flags: pressure-assent → Sage Assent scrutiny field; Sage Assent calibration discrepancy → developer note.

### A — verification (PR1 + PR2)
- Single-endpoint-proof discipline: prove the engine on its own path before any rollout/aliasing.
- Build-to-wire-immediate: confirm invocation in the execution path in the same session (grep for *calls*, not definitions), especially the FD gates and the Sage Assent feed.
- Tests: plain-assertion scripts run with `tsx` (per `/CLAUDE.md`). Use plain `npx tsx <path>` for Supabase-free units; `npx tsx --env-file=.env.local <path>` for any test transitively importing `supabase-server.ts`. Run verification commands one at a time.
- Risk: **Elevated** (new modules + additive schema). KG1 (await all DB writes; no fire-and-forget; direct imports, no self-calls). KG7 (JSONB direct).

---

## Stage B — authenticated, metered, kill-switched endpoint + translation-sandwich + safety (Critical)

Full Critical Change Protocol (0c-ii) visible in the session before deploy. PR6 (safety-touching → Critical) engaged.

### B-1 — `POST /api/practice/reflect`
- Auth: A10 `sr_atl_` Bearer, unscoped (SR-14); the three auth failure modes → 401 (no token; bad token; valid token + wrong `agent_id`); positive control → 200 (the Sage Calling smoke-test pattern).
- Metering + kill switch: `SAGE_REFLECT_ENABLED` off by default → 503 (no code change to disable).

### B-2 — translation-sandwich wiring (Q1–Q4 semantic scoring)
- Layer 1 (**Sonnet**) extracts structured features from each free-text answer → Layer 2 (deterministic) applies the Stoic Brain mechanism (passion taxonomy / value hierarchy / kathekon scoring) → Layer 3 produces the structured log entry. Layer 2 keeps the *judgement* deterministic and auditable; the LLM only extracts features.
- Q5/Q6: deterministic structural rules first; translation-sandwich escalation only if ambiguous.

### B-3 — R20a / Zone-3 boundary (SR-9)
- Deterministic boundary check before any reflection on a harm-flagged session. Sage Reflect is **not a crisis pathway**: flag the kathekon failure, update the profile, pass the developer flag; no philosophical remediation of harm. This is a safety surface → PR6 → Critical regardless of apparent scope.

### B-4 — R18d adversarial suite
- Exercise FD-R1..R4 adversarially (the clean-reflection / under-reporting fabrication vectors). "Measures observable patterns, not inner states" stated in output (R18a/d).

### B — Critical Change Protocol checklist (to complete in-session before deploy)
1. What changes (plain language). 2. What could break (auth-gate exposure; flag firing surface live; KG7 double-serialisation; R20a boundary bypass). 3. Existing sessions: **N/A — only founder + test logins** (build-arc cache). 4. Rollback: unset `SAGE_REFLECT_ENABLED` → every call 503s, no redeploy; `git revert` the endpoint commit. 5. Verification: founder smoke test (auth modes, a full Q1→Q6 pass, Supabase row checks, KG7 `jsonb_typeof='array'`). 6. Explicit founder approval specific to the named risks.
- Risk: **Critical** (auth + new public endpoint AC7 + env-flag activation + R20a boundary + R17 intimate persistence). PR6.

---

## Model selection (PR4 / AC1)

- **Layer 1 feature extraction (Q1–Q4): Sonnet** — multi-mechanism structured extraction; Haiku unreliable here (KG2). Cache row: "Layer 1 translation (alt-3) = Sonnet (DeepModel)."
- **No Haiku safety call in this product** — the distress / Zone-3 path is a *deterministic boundary check*, not an LLM classifier. (Confirm against `constraints.ts` before B-2 per PR4 — model selection is a session-opening checkpoint.)

## R5 cost

- A full six-question pass is bounded: **≤4 Layer-1 (Sonnet) calls** (Q1–Q4 semantic); Q5/Q6 deterministic-first; deterministic remainder is free.
- Cost the full pass against the R5 2x guardrail at build; emit the cost-health signal. One pass per session close → bounded volume.

## Build-priority sequence (design P0–P4, mapped to Stage A)

P0 core sequence (Q1–Q6 + branching + additive/Sage-Assent-fed updates + exit routing + trigger payload) → P1 fabrication defence (FD-R1..R4) → P2 progress tracking (delegate to grade-engine + window-aggregator; plus the SR-15 per-domain store) → P3 `opening_orientation` / `opening_note` (last to build, most significant in daily operation — the consolidation-gap mechanism) → P4 mirror-principle output (`profile_update_framing.mandatory_note`; included from P0, listed late because it affects reception not sequence).

## Open items revisited at Stage A kickoff

- `evaluated_actions` table DDL extracted from the review schema; confirm the aggregator consumes the persisted rows unchanged (A-3).
- SR-15 per-domain store shape (A-4).
- 90-day retention value — confirm against the lawyer-engagement track (SR-12).

## Cross-references
- `/adopted/sage-reflect-product-design.md` (LOCKED) — the design this schedules.
- `/adopted/purpose-discovery-product-design.md` + the Sage Calling Stage 2 closes — the two-stage go-live pattern this mirrors.
- `trust-layer/types/{evaluation,accreditation}.ts`; `website/src/lib/substrate/trust-layer/evaluation-window/window-aggregator.ts`; `trust-layer/schema/trust-layer-schema-REVIEW.sql` — the Sage Assent reuse surface.
- `/adopted/standing-protocol-cache.md`, `/adopted/build-sessions-protocol-cache.md`; `/CLAUDE.md` (tsx test-harness notes).
- Decision log: `D-SAGE-REFLECT-DESIGN-LOCKED-2026-05-22`; `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21`.

---

*End of build-staging plan. DRAFT — scoping output for founder review. The build is NOT this session; Stage A is Elevated, Stage B is Critical (full Critical Change Protocol).*
