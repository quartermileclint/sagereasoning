-- ============================================================
-- SageReasoning — A10: agent_accreditation extensions
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Implements Decisions 2 + 3b + 3c of /adopted/atl-a10-design.md
-- (Adopted under D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17).
-- Executed at the A10 build session (D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run.
--
-- Four nullable typical_* aggregate columns (Decision 3b/3c — exposed on
-- AccreditationPayload; aggregates only, no raw EvaluatedAction history) +
-- a nullable loop_id for downstream JOIN against loop_billing_events.loop_id
-- (Decision 2 — A10 does NOT write loop_billing_events; this is forensic
-- traceability only). Enum vocabularies are verbatim from
-- /website/src/lib/substrate/trust-layer/types/evaluation.ts.
-- ============================================================

-- ------------------------------------------------------------
-- 0. PRE-FLIGHT — run this FIRST and eyeball the current column set so the
--    additive ALTERs below introduce no surprises (the migration is idempotent
--    regardless, but this confirms the live shape per the design's instruction).
-- ------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_accreditation'
ORDER BY ordinal_position;

-- ------------------------------------------------------------
-- 1. typical_operation_class (Decision 3b)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_operation_class TEXT;

DO $$ BEGIN
  ALTER TABLE public.agent_accreditation
    ADD CONSTRAINT agent_accreditation_typical_op_class_check
    CHECK (typical_operation_class IS NULL OR
           typical_operation_class IN
           ('read', 'search', 'summarize', 'draft', 'recommend',
            'write', 'approve', 'execute', 'delete', 'unknown'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 2. typical_target_system_vendor (Decision 3b)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_target_system_vendor TEXT;

DO $$ BEGIN
  ALTER TABLE public.agent_accreditation
    ADD CONSTRAINT agent_accreditation_typical_vendor_check
    CHECK (typical_target_system_vendor IS NULL OR
           typical_target_system_vendor IN
           ('salesforce', 'microsoft', 'servicenow', 'sap', 'workday',
            'zendesk', 'hubspot', 'atlassian', 'other', 'none'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 3. typical_outcome_verification (Decision 3b)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_outcome_verification TEXT;

DO $$ BEGIN
  ALTER TABLE public.agent_accreditation
    ADD CONSTRAINT agent_accreditation_typical_outcome_check
    CHECK (typical_outcome_verification IS NULL OR
           typical_outcome_verification IN
           ('self_reported', 'system_confirmed', 'external_auditor', 'not_applicable'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 4. typical_reversibility_signal (Decision 3b)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_reversibility_signal TEXT;

DO $$ BEGIN
  ALTER TABLE public.agent_accreditation
    ADD CONSTRAINT agent_accreditation_typical_reversibility_check
    CHECK (typical_reversibility_signal IS NULL OR
           typical_reversibility_signal IN
           ('reversible', 'partially_reversible', 'irreversible', 'unknown'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 5. loop_id — nullable; downstream JOIN against loop_billing_events.loop_id.
--    A10 does NOT write loop_billing_events (Decision 2 — no integration).
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS loop_id UUID;

CREATE INDEX IF NOT EXISTS agent_accreditation_loop_id_idx
  ON public.agent_accreditation (loop_id) WHERE loop_id IS NOT NULL;

-- ============================================================
-- 6. VERIFY — paste the output back to confirm.
-- ============================================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_accreditation'
  AND column_name IN
    ('typical_operation_class', 'typical_target_system_vendor',
     'typical_outcome_verification', 'typical_reversibility_signal', 'loop_id')
ORDER BY column_name;

SELECT conname FROM pg_constraint
WHERE conrelid = 'public.agent_accreditation'::regclass
  AND conname IN
    ('agent_accreditation_typical_op_class_check',
     'agent_accreditation_typical_vendor_check',
     'agent_accreditation_typical_outcome_check',
     'agent_accreditation_typical_reversibility_check')
ORDER BY conname;

SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'agent_accreditation'
  AND indexname = 'agent_accreditation_loop_id_idx';
