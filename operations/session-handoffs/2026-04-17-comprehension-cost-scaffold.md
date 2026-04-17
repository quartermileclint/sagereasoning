# Session Close — 17 April 2026

## Session Purpose

Two tasks assigned: (1) complete Layer 3 wiring for five allegedly unwired endpoints, (2) instrument R20a classifier cost monitoring.

## Decisions Made

- **Layer 3 wiring is already complete — no code changes needed.** Code inspection of all 80+ route.ts files confirmed every endpoint that should have Layer 3 already has it. The 5 endpoints without it (evaluate, assessment/foundational, assessment/full, baseline/agent, mentor/private/reflect) are deliberately excluded per session 7e design (agent-facing and public endpoints receive Layer 1 only). Founder confirmed: leave as designed. → Impact: None. The ops brief was based on stale gap assumptions; the 15 April session had already closed them.

- **R20a cost monitoring scaffolded despite classifier not being built yet.** Founder chose to scaffold the infrastructure now so it's ready when Phase D ships. → Impact: Four artefacts created (see below). All return zeros until the classifier exists. Usage-summary endpoint additive — existing output unchanged, new `r20a_classifier` block added.

## Status Changes

- `architectural-decisions-extract.md` gaps 3 and 4: Open → **Resolved** (code inspection confirmed project-context.json structure and migration not-run status)
- `comprehension-blocks-stoic-brain.md`: Created — four comprehension blocks for stoic-brain-compiled.ts, stoic-brain-loader.ts, sage-reason-engine.ts, guardrails.ts
- R20a cost monitoring scaffold: Not started → **Scaffolded**

## Files Created / Modified

| File | Action | Risk |
|---|---|---|
| `supabase/migrations/20260417_r20a_classifier_cost_tracking.sql` | **Created** — classifier_cost_log table, cost_health_snapshots extension (2 columns), aggregation function | Elevated (schema) |
| `website/src/lib/r20a-cost-tracker.ts` | **Created** — logClassifierRun(), getClassifierCostSummary(), checkClassifierCostThreshold() | Standard (new module) |
| `website/src/lib/stripe.ts` | **Modified** — added R20A_CLASSIFIER_MAX_MENTOR_RATIO: 0.20 to COST_HEALTH | Standard (constant) |
| `website/src/app/api/billing/usage-summary/route.ts` | **Modified** — imports cost tracker, adds classifier metrics to response, adds 20% threshold alert | Standard (additive) |
| `operations/comprehension-source/architectural-decisions-extract.md` | **Modified** — resolved gaps 3+4, added 17 April addendum | Documentation |
| `operations/comprehension-source/comprehension-blocks-stoic-brain.md` | **Created** — full comprehension blocks with session/decision references | Documentation |

## Cost Query Structure

The R20a cost monitoring follows the existing Stripe cost-health-alert pattern:

1. **Per-invocation logging:** Phase D's classifier calls `logClassifierRun()` with token counts and severity result. Cost auto-calculated from Haiku pricing model.
2. **Monthly aggregation:** SQL function `get_classifier_cost_summary()` returns totals for a given period (invocations, rule-only count, LLM invocations, total cost, flags written, severity-3 count).
3. **Threshold check:** `checkClassifierCostThreshold()` compares classifier spend to estimated mentor-turn cost. If ratio > 0.20 (20%), returns alert with message text referencing ADR-R20a-01 D7-b.
4. **Dashboard integration:** `/api/billing/usage-summary` now includes `r20a_classifier` metrics block and `r20a_classifier_max_mentor_ratio` threshold in every response.

**Mentor-turn cost estimation caveat:** Currently uses a rough estimate (~30% of API calls × $0.015 per call). This should be replaced with actual per-endpoint cost tracking when available. Noted as TODO in code.

## Next Session Should

1. **Run the migration** `20260417_r20a_classifier_cost_tracking.sql` in Supabase Studio when ready (not urgent — returns zeros until classifier ships).
2. **Begin Phase C** (r20a-rules.yml) if continuing R20a build sequence.
3. **Deploy current code** — TypeScript compiles clean. The usage-summary changes are additive and safe to deploy.

## Blocked On

- **R20a classifier cost monitoring activation** blocked on Phase D (r20a-classifier.ts). The scaffold is ready; the classifier is not.
- **Accurate mentor-turn cost estimation** blocked on per-endpoint cost tracking (not yet built — currently using rough averages).

## Open Questions

- The project_context Supabase migration (from session 7e) is still not run. It remains non-urgent but should be tracked — eventually dynamic updates will need it.
- Decision log entry for sage-reason-engine is dated 6 April 2026 in the log but was referenced as "9 April" in some intermediate handoffs. The comprehension blocks use the correct date (6 April). Minor documentation inconsistency in older handoffs, not actionable.
