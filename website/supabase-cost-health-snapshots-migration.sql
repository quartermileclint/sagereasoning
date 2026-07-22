-- ============================================================================
-- cost_health_snapshots — R5 cost-as-health-metric snapshot table
-- Closes the "named non-blocking follow-up" first found 2026-07-20 (P-GL #9
-- RLS audit, §C errored 42P01 — the table does not exist in production) and
-- repeated across three predecessor session closes without ever being scoped:
--   operations/handoffs/founder/2026-07-20-P-GL-golive-checklist-CLOSE.md
--   operations/handoffs/founder/2026-07-20-P-GL-finish-CLOSE.md
--   operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md
--   operations/agent-org-2026-07/ops-calling-v1.md §3
-- ============================================================================
-- NOT a new design. This is the exact table `api/migrations/stripe-billing-
-- schema.sql` (§4, lines ~150-171) already authored and reviewed, EXTRACTED
-- into its own standalone migration so it can be applied WITHOUT activating
-- the three genuinely Stripe-only tables that file also contains
-- (stripe_customers, stripe_subscriptions, payment_events) or its two
-- paid-tier upgrade/downgrade helper functions. Stripe activation stays
-- deliberately deferred (per CLAUDE.md: "Stripe billing — not_configured in
-- production; activation deliberately deferred") — this migration does not
-- touch that decision.
--
-- The two classifier columns below are `supabase/migrations/
-- 20260417_r20a_classifier_cost_tracking.sql`'s ALTER TABLE additions against
-- this same table, folded in here at CREATE time (that file's ALTER TABLE
-- statements against cost_health_snapshots could only ever have landed if
-- this table already existed — confirmed absent 2026-07-20, so those two
-- ALTERs almost certainly never ran either; VERIFY §1 below re-confirms this
-- directly before applying). That file's sibling `classifier_cost_log` table
-- + `get_classifier_cost_summary()` function are untouched by this migration
-- — introspect their live state first (§0) rather than assuming.
--
-- Exact shape grounded in the two live call sites that construct/consume this
-- row (read in full 2026-07-22 — both agree exactly):
--   website/src/lib/context/ops-cost-state.ts        (CostHealthSnapshotRow)
--   website/src/app/api/billing/usage-summary/route.ts (the upsert payload)
-- A third read-only call site (website/src/app/api/billing/cost-alerts/
-- evaluate/route.ts) reads sage_ops_cost_cents from the same row. All three
-- are confirmed missing-table-benign (destructure only `data`, never check
-- `error`, never throw) — this migration changes their behaviour from
-- "silently return nothing" to "return real data," never from "crash" to
-- "work."
--
-- RLS posture: this table is upserted by the app (onConflict:
-- 'period_start,period_end'), so it does NOT get the append-only /
-- forbid-mutation trigger pattern used for genuinely append-only audit logs
-- (route_errors, throttle_events). It DOES get the same ENABLE RLS + REVOKE
-- ALL FROM anon, authenticated treatment already authored (and already run
-- against its two siblings) in website/supabase-rls-audit-and-lockdown.sql
-- §C — that script's §C statements against this exact table are reproduced
-- verbatim below. Every real read/write goes through the service-role client
-- (supabaseAdmin), which bypasses RLS regardless.
--
-- ADDITIVE + IDEMPOTENT + REVERSIBLE. Run in Supabase Dashboard → SQL Editor.
-- TEST first, then Production. Founder-walked (PR17) per this project's
-- convention for every live schema-apply step, Standard classification
-- notwithstanding.
-- ============================================================================


-- ============================================================================
-- §0 — PRE-FLIGHT (run first; confirm current reality, do not assume it)
-- ============================================================================
SELECT relname, relrowsecurity FROM pg_class
 WHERE relname IN ('cost_health_snapshots', 'classifier_cost_log');
-- Expect: zero rows for cost_health_snapshots (confirms it does not exist);
-- classifier_cost_log plausibly already exists (the live R20a classifier cost
-- tracker reads/writes it) — if it does NOT exist either, stop and re-scope
-- before proceeding (this migration does not create it).

SELECT column_name, data_type FROM information_schema.columns
 WHERE table_name = 'cost_health_snapshots';
-- Expect: zero rows.

SELECT proname FROM pg_proc WHERE proname = 'get_classifier_cost_summary';
-- Informational only — confirms whether the aggregation function this
-- table's classifier columns feed already exists.


-- ============================================================================
-- §1 — CREATE TABLE (the reviewed shape from stripe-billing-schema.sql §4,
--      plus the two classifier columns from the 20260417 migration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cost_health_snapshots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start          DATE NOT NULL,
  period_end            DATE NOT NULL,
  total_revenue_cents   INTEGER NOT NULL DEFAULT 0,
  total_llm_cost_cents  INTEGER NOT NULL DEFAULT 0,
  total_api_calls       INTEGER NOT NULL DEFAULT 0,
  revenue_to_cost_ratio NUMERIC(8,2),      -- must be >= 2.0 per R5
  -- Sage Ops monthly cap tracking (R5: $100/month)
  sage_ops_cost_cents   INTEGER NOT NULL DEFAULT 0,
  alert_triggered       BOOLEAN DEFAULT false,
  alert_reason          TEXT,              -- e.g. 'ratio_below_2x', 'ops_cap_exceeded'
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- R20a classifier cost columns (from the 20260417 migration; folded in here
  -- since that migration's ALTER TABLE against this table never had a table
  -- to land on)
  classifier_cost_cents      INTEGER NOT NULL DEFAULT 0,
  classifier_to_mentor_ratio NUMERIC(6,4),

  CONSTRAINT unique_period UNIQUE (period_start, period_end)
);

COMMENT ON COLUMN public.cost_health_snapshots.classifier_cost_cents IS
  'Monthly R20a classifier spend (rule-based + Haiku LLM). ADR-R20a-01 D7-b: reopen ADR if > 20% of mentor-turn cost.';

COMMENT ON COLUMN public.cost_health_snapshots.classifier_to_mentor_ratio IS
  'classifier_cost_cents / mentor_turn_cost_cents. Alert threshold: 0.20 (20%).';

CREATE INDEX IF NOT EXISTS idx_cost_health_period
  ON public.cost_health_snapshots(period_start DESC);


-- ============================================================================
-- §2 — RLS lockdown (matches the treatment already applied to this table's
--      two siblings, translation_sandwich_comparisons + translation_sandwich_
--      cost_tracker, in website/supabase-rls-audit-and-lockdown.sql §C).
--      Service-role client (supabaseAdmin) bypasses RLS regardless — every
--      real read/write in the app already goes through it.
-- ============================================================================
ALTER TABLE public.cost_health_snapshots ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cost_health_snapshots FROM anon, authenticated;


-- ============================================================================
-- §VERIFY — run after applying
-- ============================================================================
-- V1. Table + all 13 columns present:
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'cost_health_snapshots'
 ORDER BY ordinal_position;
-- Expect 13 rows: id, period_start, period_end, total_revenue_cents,
-- total_llm_cost_cents, total_api_calls, revenue_to_cost_ratio,
-- sage_ops_cost_cents, alert_triggered, alert_reason, created_at,
-- classifier_cost_cents, classifier_to_mentor_ratio.

-- V2. Unique constraint present (matches the app's upsert onConflict key):
SELECT conname, contype FROM pg_constraint
 WHERE conrelid = 'public.cost_health_snapshots'::regclass AND contype = 'u';
-- Expect: unique_period.

-- V3. Index present:
SELECT indexname FROM pg_indexes
 WHERE tablename = 'cost_health_snapshots';
-- Expect: cost_health_snapshots_pkey, idx_cost_health_period.

-- V4. RLS enabled, zero policies (service-role-only by construction):
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.cost_health_snapshots'::regclass;
-- Expect: true.
SELECT policyname FROM pg_policies WHERE tablename = 'cost_health_snapshots';
-- Expect: zero rows.

-- V5. No anon/authenticated grants remain:
SELECT table_name, grantee, privilege_type
  FROM information_schema.role_table_grants
 WHERE table_schema = 'public' AND table_name = 'cost_health_snapshots'
   AND grantee IN ('anon', 'authenticated', 'PUBLIC');
-- Expect: zero rows.

-- V6. Empty (a true first creation, not a race with unmigrated data):
SELECT count(*) FROM public.cost_health_snapshots;
-- Expect: 0.


-- ============================================================================
-- ROLLBACK (safe — nothing else in production references this table until
-- this migration creates it; a rollback restores the exact pre-migration
-- state, not a broken one. All three read/write call sites are confirmed
-- fail-honest on a missing table.)
-- ============================================================================
-- DROP TABLE IF EXISTS public.cost_health_snapshots;
-- ============================================================================
