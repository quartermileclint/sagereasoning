> **SPENT 2026-07-08** — executed as `D-TRUST-LAYER-S1-TRUST-CORE-BUILT-DARK-REVIEW-FOLDED`. Founder elections: E1 *also wire justice-surface*, E2 *TEST → prod-inert*, E3 *lazy-on-read*. Built dark + gate-green + first-hand reviewed (the Workflow hit the account session limit). Close: `2026-07-08-trust-layer-S1-trust-state-CLOSE.md`. Carried founder-walked: apply the migration (TEST → prod-inert) + the flag-on TEST walk. Next: S2 (`2026-07-08-trust-layer-S2-evidence-weighting-NEXT-SESSION-PROMPT.md`).

# Next-Session Prompt — Trust Layer S1: trust state + event vocabulary + decay (the trust core, MEASURE mode — schema + write half)

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-critical` — Critical risk under 0d-ii (**new schema + data-deletion functionality**). The full Critical Change Protocol (0c-ii) governs; use the **full** templates per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions", not the lean forms. **Build DARK + flag-gated**; flag-off byte-identical (test-asserted). The **schema migration + any flag activation are founder-walked steps** (PR17/AC7) — the AI performs no Supabase/Vercel/git/mint op; it guides + verifies + makes repo edits.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md`).
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 — **read §2, §3 rows 1/3, §5 A3/A8/A9, §6, §8 in full**; this slice implements Spec 1 state + Spec 3 dynamics/decay + A3 + the A8/A9 event rows + the R18f-parallel rule).
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S1.
**Binding methodology:** `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` (A3 decay is the load-bearing numeric spec; A8/A9 fix the orchestrator/delegation events).
**Predecessor close:** `operations/handoffs/founder/2026-07-08-trust-layer-S0b-ADR-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S0B-ADR-ADOPTED`.

## Why this session matters

Phase 0 is complete (S0a Live, S0b ADR Adopted). S1 opens Phase 1 — the server-side trust core in **MEASURE mode**. It is the persistence + vocabulary foundation every later slice reads: the per-`(agent_id, virtue-domain)` **trust state**, the append-only **trust-event ledger** with the mentor's typed event vocabulary, and **decay per A3** (volatility-rated onset, floor at the profile prior, reflect-modulation capped at half-rate). It is built **dark** — it records; it gates nothing (the intervention engine is S4; enforcement is S11). The load-bearing invariant is the **R18f-parallel rule: no trust event is written without a verifiable examination artifact** (a signed Layer-2 assessment or an R18f-cleared accreditation write) — trust state is consumer-unforgeable, server-composed, exactly as accreditation is provenance-gated today. Getting the schema + the event/decay engine + the data-rights coverage right here is what makes S2 (confidence), S3 (combiner), and S4 (intervention) buildable on solid ground.

## Pre-conditions
1. S0b is committed + pushed + deployed green (done 2026-07-08 — the S0b commit is on `origin/main`).
2. No API credits strictly required (the build + TEST verification is deterministic; the adversarial review is a Workflow fan-out — **check the credit balance before launching it**, per the S0b credit-exhaustion incident; if low, run the review first-hand per the §4 precedent).
3. TEST Supabase reachable for the schema dry-run; a TEST admin `profiles` row exists (memory `test-admin-needs-profiles-row`).

## Part A — Open under the protocol (full reads for code-critical)

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model N/A unless a review runs, risk class, signals, the Critical-session template pointer)
2. `operations/handoffs/founder/2026-07-08-trust-layer-S0b-ADR-CLOSE.md` (the state S1 builds on)
3. `adopted/adr/2026-07-08-sage-trust-layer.md` — §2, §3, §5 (A3/A8/A9), §6, §8 **in full** (the binding design)
4. `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **A3 in full** (the exact decay numbers); A8, A9 (the event semantics)
5. `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S1 + §"Standing gates"
6. The manifest's relevant rules first-hand: R0 (append-only/immutability posture), R17/R17c/R17i (data rights — the erase/export/delete surfaces this slice extends), R18f (the provenance-gate pattern this slice parallels), AC5 (perimeter — confirm S1 adds NO human-facing route), AC7 (Critical protocol)
7. Existing patterns to reuse (PR15 — do NOT rebuild): `website/src/lib/substrate/agent-assessment-history-store.ts` (the append-ledger + `retain_until` + purge pattern), `website/supabase-*-migration.sql` (the idempotent additive-migration convention), `website/src/lib/consumer-erasure.ts` + `/api/user/delete` + `/api/user/export` (the data-rights wiring points), the accreditation write boundary's R18f provenance check (the artifact-verification pattern to parallel)
8. `/operations/decision-log.md` — last 2 entries

Confirm at open: tier (Critical — full templates); hold-point (P0 0h active); model selection (N/A for the build; if a review Workflow runs, cite AC1); status vocabulary; signals; risk class. Then **resolve the three design elections below via AskUserQuestion before building.**

## Part B — Founder elections at open (surface via AskUserQuestion, with these recommendations)

**E1 — Emission scope this session.** Which trust events does S1 wire to actually write (behind the flag, from verifiable artifacts), vs define-in-vocabulary-only?
- **(Recommended) Wire the two clean, already-verifiable sources**: `credential-completed` (from the accreditation write, which already clears the live R18f gate) and `reflect-completed-honest` (from the Sage Reflect completion). Both carry R18f-verifiable artifacts at a single surface. **Define but do NOT yet emit** the justice-surface events (derivable from a consult's live `obligation_assessment`, but emitting them touches `/api/reason` — bigger blast radius) and the orchestrator (A8) + delegation (A9) events (they require the S5–S7 collaboration record that does not exist yet). This gives S1 a real end-to-end write path from genuine artifacts while keeping A8/A9 for their proper slice.
- (Alt) Also wire the justice-surface events from the live signed assessment now (larger `/api/reason` touch).
- (Alt) Store + engine only — defer ALL emission to S8 (leaves S1 with no live write path to test end-to-end).

**E2 — Schema application.** 
- **(Recommended) TEST-only this session**: apply the migration to TEST, run the full end-to-end write/read/decay/erase walk on TEST, adversarially review, then the **production migration + flag activation is its own founder-walked step** (a clean dark build; matches measure-first caution).
- (Alt) TEST → prod-inert same session (the M6 precedent — schema on prod, flag unset, byte-identical), if the founder wants the migration landed while the review is fresh.

**E3 — Decay computation.** 
- **(Recommended) Lazy-on-read**: decay is computed at trust-read time from `now() − last_domain_activity` against the A3 onset (12/6/3 months by volatility), floored at the profile prior, reflect-modulation capped at half-rate. No cron. (Note the honest distinction: decay reads use `now()` — that is correct here, because a trust read is a *live* value, not a signed/reproducible artifact like the trajectory overlay; document it explicitly.)
- (Alt) Lazy-on-read + a nightly materialization sweep (adds a cron; only if the founder wants pre-computed state rows).

## Part C — Procedure

### Step 0 — Critical Change Protocol statement (visible, in-session)
State plainly: (1) what is changing — a new trust-state schema + event ledger + a dark deterministic engine + data-rights extension; (2) what could break — nothing while the flag is unset (byte-identical); the migration is additive/idempotent/reversible; (3) existing sessions — unaffected (no live route behaviour changes flag-off); (4) rollback — flag unset + `DROP` the new tables (reversible); (5) verification — below; (6) explicit founder approval of the named risks (the migration + any activation). Get approval before the migration.

### Step 1 — Schema design + migration (idempotent, additive, reversible)
Design the event-sourced pair (reuse the `agent_assessment_history` conventions — `retain_until`, indexes, RLS service-role-only, K1 identity):
- **`agent_trust_events`** — append-only, immutable (R0): `(event_id, agent_id, virtue_domain, event_type, proximity_scale_value, artifact_ref [signed-assessment or accreditation provenance ref], credential_ref, occurred_at, retain_until, …)`. `event_type` CHECK over the mentor vocabulary (§3 row 3 + A8/A9). The **domain axis is the four cardinal virtue domains** (phronesis/dikaiosyne/andreia/sophrosyne) — determined by Spec 3 ("domain trust levels updated only by domain-relevant evidence"), **not** the A2 function-type taxonomy (that is S2 evidence-weighting, not trust state).
- **`agent_trust_state`** — the materialized per-`(agent_id, virtue_domain)` projection: `current_trust_level` (proximity-scale-valued), `last_domain_activity_at`, `volatility_rating` (deployer-set, default per A3), `profile_prior`, `reflect_practice_active` (the decay modulator), `floored_until` (the justice-surface-unevaluated `deliberate` floor). Write the migration file `website/supabase-agent-trust-core-migration.sql` (additive, `IF NOT EXISTS`, CHECK constraints, reversible footer). **Founder applies to TEST** (§VERIFY green). Prod per E2.

### Step 2 — The deterministic trust engine (pure library, dark)
`website/src/lib/substrate/trust-core/…` — pure, no I/O:
- **event → state transition**: each event type's effect on the domain's trust level per §3 row 3 (credential-completed ∝ domain match × coverage continuity; reflect-completed-honest weights stability; justice-surface-transparently-handled = the highest single positive; justice-surface-unevaluated **floors the domain at `deliberate` until a demonstrated evaluation**; passion-unflagged reduces; A8 orchestrator degrade; A9 cases 1/2/3 capacity-proportional). Conflicts never average (§6). 
- **decay** per A3 exactly: volatility onset 12/6/3 months (low/moderate/high), **floor at the profile prior, never below**, reflect-modulation **≤ half the base rate** (a bound, not a stop). 
- **aggregation** per §6: aggregate trust = the **minimum** across the per-domain trust levels, weighted by coverage continuity + source confidence, conflicts→pause (the cross-domain-trust minimum — distinct from the within-examination proximity minimum). Cover with a `tsx` battery (mirror `trajectory-overlay.test.ts` style): event-transition fixtures, decay fixtures (each volatility band + the reflect-modulation cap + the profile-prior floor), the justice-floor persistence, the aggregation minimum. **Instrument-fidelity shaped, never beats-bare** (KG-EX1).

### Step 3 — Emission wiring (per E1, behind the flag) + the R18f-parallel guard
New flag **`SUBSTRATE_TRUST_CORE_ENABLED`** (UNSET everywhere ⇒ no event written, no state read ⇒ byte-identical, test-asserted). Wire the E1-elected sources to emit an event **only after verifying the examination artifact** (parallel the accreditation R18f gate: a `credential-completed` event requires the write that just cleared R18f; a `reflect-completed-honest` event requires the completed reflect session's signed feed). **No event without a verifiable artifact** — assert this as an INV in the battery. Emission is awaited + fail-honest (never fail-closed on a live route; a trust-write failure must not 500 the consult/accreditation/reflect response — MEASURE mode).

### Step 4 — Data-rights extension (the Critical half — data deletion)
Extend genuine erasure + export to the two new tables (R17c/R17i): `/api/user/delete`, `/api/credential/erase` (the `consumer-erasure.ts` path), `/api/user/export`, and a `retain_until` purge (reuse the trajectory-sweep pattern; own kill-switch or fold into an existing sweep — founder election in-session). Trust records are per-agent_id/per-credential PII-adjacent; erasure must reach them. Missing-table-benign, fail-honest.

### Step 5 — Verify (TEST, founder-walked where live)
- Flag-off byte-identity: the touched live routes (accreditation write / reflect complete / the erase-export routes) produce byte-identical responses with the flag unset — assert via the established INV/source-grep + a response-shape test.
- `tsc` 0; `npm run build` 0 (any `route.ts`/`page.tsx` touch gates on build, not just tsc — memory `nextjs-route-export-validation`).
- The Step-2 engine battery green; a flag-on TEST end-to-end walk: emit → state materializes → decay behaves per A3 fixtures → erase removes the rows → export includes them.
- The `--env-file` rule for any test importing the Supabase chain (memory / cache §"Running the substrate test suite").

### Step 6 — Adversarial review
A Workflow fan-out (PR15) OR first-hand per the §4 precedent **if credits are low** (check first — S0b's review died on Fable-5 exhaustion). Dimensions: flag-off byte-identity; the R18f-parallel guard (can any event be written without a verifiable artifact?); decay correctness vs A3 (each band, the floor, the half-rate cap); data-rights completeness (does erase/export reach both tables?); fail-honest (can a trust-write failure break a live route?); schema/migration reversibility + no prod-data invalidation. Fold every confirmed finding; refuters on load-bearing claims.

### Step 7 — Records (full Critical templates)
Full decision-log entry (`D-TRUST-LAYER-S1-TRUST-STATE-BUILT-…`) + full Critical close (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification / Orchestration Reminder) + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the S2 prompt (evidence weighting + the seven confidence tiers, `code-elevated`, pure lib). If the schema/flag went live (E2 alt / an activation), record it in the Live list.

## Part D — Anticipated session shape
| Phase | Estimate |
|---|---|
| Full code-critical reads (cache + close + ADR §§ + A3 + plan + patterns) | 40–55 min |
| E1–E3 elections + CCP statement | 10–15 min |
| Step 1 schema + migration (+ founder TEST apply) | 40–60 min |
| Step 2 engine + battery | 60–90 min |
| Step 3 emission wiring + R18f-parallel guard | 40–60 min |
| Step 4 data-rights extension | 30–45 min |
| Step 5 verify (TEST walk) | 30–45 min |
| Step 6 adversarial review + folds | 45–75 min |
| Step 7 records | 30–45 min |
| **Total** | **~5–7 h** (a full Critical build) |

## Rollback path
Flag `SUBSTRATE_TRUST_CORE_ENABLED` unset ⇒ byte-identical (no-op until set). `DROP TABLE agent_trust_events, agent_trust_state` (reversible; TEST-only unless E2-alt applied prod). `git revert` the build commit. No production behaviour changes flag-off; the schema is additive; no existing table is altered.

## Forecast
Ends with the trust core's persistence + vocabulary + decay engine built dark, TEST-verified end-to-end, data-rights-complete, adversarially reviewed — the foundation S2/S3/S4 read. **Next: S2** (evidence weighting + the seven confidence tiers A5, `code-elevated`, pure lib) and **S3** (the multi-source combiner A1) — both parallelizable after S1. Enforcement stays gated on S11; weights BLOCKED; the 0h call remains the founder's.

End of prompt.
