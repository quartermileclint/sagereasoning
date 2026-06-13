-- ===========================================================================
-- M4 CI-10 — loop_billing_events.surface: admit 'api_guardrail'
-- ===========================================================================
-- Date:    2026-06-13
-- Session: Mechanism-correction M4 (gate + quick-tier).
-- Item:    CI-10 — gate loop metering (X-Loop-* on /api/guardrail).
-- Risk:    Elevated (additive constraint widening on a billing table).
--
-- WHY: the original Option-D schema constrained surface to the three known
-- emitters (see api/migrations/option-d-billing-schema.sql:80):
--     surface TEXT NOT NULL CHECK (surface IN
--       ('api_reason','api_score_iterate','wrapper_internal'))
-- CI-10 adds the gate as a fourth emitter. Without this widening, a gate
-- metering insert (surface='api_guardrail') is rejected by the CHECK.
--
-- SAFETY: this only WIDENS the allowed set — no existing row can violate the
-- new constraint (every existing surface value is still permitted). Reversible
-- (re-add the three-value CHECK). The RPC (option-d-billing-rpc.sql) passes
-- p_surface through unchanged; no RPC migration is needed. p_endpoint='guardrail'
-- is already handled by the RPC's per-call counters.
--
-- PR17: run on TEST (iwdtrvuphogkwmovhnvz) first; production is a separate
-- founder-elected 0c-ii step taken at CI-10 flag activation, NOT in the build.
-- The CI-10 flag (SUBSTRATE_GATE_LOOP_METERING_ENABLED) stays UNSET until then,
-- so production never inserts 'api_guardrail' before this migration is applied
-- there.
-- Idempotent: safe to re-run.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- §0  PRE-FLIGHT — confirm the current constraint name (expected:
--     loop_billing_events_surface_check, the Postgres default for an inline
--     unnamed CHECK on the surface column). If your DB shows a different name,
--     substitute it in §1's DROP line.
-- ---------------------------------------------------------------------------
SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
FROM   pg_constraint con
JOIN   pg_class rel ON rel.oid = con.conrelid
JOIN   pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE  rel.relname = 'loop_billing_events'
AND    nsp.nspname = 'public'
AND    con.contype = 'c'
AND    pg_get_constraintdef(con.oid) ILIKE '%surface%';

-- ---------------------------------------------------------------------------
-- §1  WIDEN the CHECK to include 'api_guardrail'.
-- ---------------------------------------------------------------------------
ALTER TABLE public.loop_billing_events
  DROP CONSTRAINT IF EXISTS loop_billing_events_surface_check;

ALTER TABLE public.loop_billing_events
  ADD CONSTRAINT loop_billing_events_surface_check
  CHECK (surface IN ('api_reason', 'api_score_iterate', 'wrapper_internal', 'api_guardrail'));

-- ---------------------------------------------------------------------------
-- §2  VERIFY — the definition should now list all four surfaces.
-- ---------------------------------------------------------------------------
SELECT pg_get_constraintdef(con.oid) AS definition
FROM   pg_constraint con
JOIN   pg_class rel ON rel.oid = con.conrelid
WHERE  rel.relname = 'loop_billing_events'
AND    con.conname = 'loop_billing_events_surface_check';
-- Expected: CHECK (surface = ANY (ARRAY['api_reason', 'api_score_iterate',
--           'wrapper_internal', 'api_guardrail']::text[]))
