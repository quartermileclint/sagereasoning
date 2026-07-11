-- ============================================================================
-- Trust Layer S9b — the practice-completion vocabulary widening (2026-07-11)
-- ============================================================================
--
-- WHAT THIS DOES (five independent, individually-reversible sections):
--   §A  agent_trust_events.event_type CHECK: 12 → 15 (adds calling-completed,
--       reflect-screened-honest, self-screen-absent — ADR-013 §11 / the
--       2026-07-11 mentor verdicts, verbatim record wins).
--   §B  agent_trust_events.artifact_kind CHECK: 2 → 4 (adds calling_record,
--       reflect_screened_persist — the R18f-parallel artifact classes for the
--       new events; honest naming: a screened persist is NOT a completion).
--   §C  agent_trust_state: ADD COLUMN reflect_last_screened_at (nullable,
--       additive — the G2 quarter-rate decay modulator timestamp; the deployed
--       code writes it only when non-null, so pre-§C deploys never name it).
--   §E  collaboration_records: ADD COLUMN purpose_acknowledgement (nullable,
--       additive — the G1b spawn acknowledgement; the calling-completed
--       event's server-persisted artifact).
--   §D  loop_billing_events.surface CHECK: + 'api_practice_discernment'
--       (the S9b election-2 bundle — closes the S8/S9 named follow-up: the
--       discernment surface's Sonnet consumption becomes meterable; the CI-10
--       guardrail widening is the precedent and the pattern).
--
-- SAFETY / ORDER:
--   • Every section is ADDITIVE (a CHECK that admits strictly MORE values; a
--     nullable column). No existing row can be invalidated: §PRE proves the
--     current data is inside the old vocabulary, and old-vocabulary writes
--     remain valid under the new CHECKs by construction.
--   • Deploy order is SAFE in both directions: the deployed code emits the new
--     event types only from the S9b derivers, which are themselves inert until
--     their call sites' flags are on; if an emission races ahead of this
--     migration the insert is REJECTED by the old CHECK and surfaced as a loud
--     store failure (fail-honest, never silent fabrication).
--   • MEASURE posture unchanged: none of the three new event types can RAISE
--     the oversight domain ('calling' raises only dikaiosyne, and only on the
--     agent-stated mismatch arm; the other two never raise anything) — the A7
--     AND-guard premise (oversight is increase-unreachable) is preserved
--     (the PA-6 standing note's required re-audit, discharged in this change).
--
-- RUN ORDER: TEST project first (iwdtrvuphogkwmovhnvz), verify, then prod.
-- Idempotent: safe to re-run (DROP CONSTRAINT IF EXISTS + ADD; ADD COLUMN IF
-- NOT EXISTS).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- §PRE  Pre-flight — prove no existing row sits outside the OLD vocabulary
--       (expected: all three counts = 0 rows returned).
-- ---------------------------------------------------------------------------
SELECT count(*) AS event_type_outside_old_vocab
FROM   public.agent_trust_events
WHERE  event_type NOT IN (
  'credential-completed', 'reflect-completed-honest',
  'justice-surface-transparently-handled', 'justice-surface-unevaluated',
  'justice-surface-violated', 'justice-surface-indeterminate',
  'credential-suspended-revoked', 'passion-unflagged-by-self-screen',
  'orchestrator-proceeds-under-habitual-flag',
  'delegation-reflection-case-1', 'delegation-reflection-case-2',
  'delegation-reflection-case-3'
);
-- Expected: 0

SELECT count(*) AS artifact_kind_outside_old_vocab
FROM   public.agent_trust_events
WHERE  artifact_kind NOT IN ('signed_layer2_assessment', 'reflect_completion');
-- Expected: 0

SELECT count(*) AS surface_outside_old_vocab
FROM   public.loop_billing_events
WHERE  surface NOT IN ('api_reason', 'api_score_iterate', 'wrapper_internal', 'api_guardrail');
-- Expected: 0

-- ---------------------------------------------------------------------------
-- §A  WIDEN agent_trust_events.event_type (12 → 15).
-- ---------------------------------------------------------------------------
ALTER TABLE public.agent_trust_events
  DROP CONSTRAINT IF EXISTS agent_trust_events_event_type_check;

ALTER TABLE public.agent_trust_events
  ADD CONSTRAINT agent_trust_events_event_type_check
  CHECK (event_type IN (
    'credential-completed',
    'reflect-completed-honest',
    'justice-surface-transparently-handled',
    'justice-surface-unevaluated',
    'justice-surface-violated',
    'justice-surface-indeterminate',
    'credential-suspended-revoked',
    'passion-unflagged-by-self-screen',
    'orchestrator-proceeds-under-habitual-flag',
    'delegation-reflection-case-1',
    'delegation-reflection-case-2',
    'delegation-reflection-case-3',
    -- S9b (ADR-013 §11):
    'calling-completed',
    'reflect-screened-honest',
    'self-screen-absent'
  ));

-- ---------------------------------------------------------------------------
-- §B  WIDEN agent_trust_events.artifact_kind (2 → 4).
-- ---------------------------------------------------------------------------
ALTER TABLE public.agent_trust_events
  DROP CONSTRAINT IF EXISTS agent_trust_events_artifact_kind_check;

ALTER TABLE public.agent_trust_events
  ADD CONSTRAINT agent_trust_events_artifact_kind_check
  CHECK (artifact_kind IN (
    'signed_layer2_assessment',
    'reflect_completion',
    -- S9b: a SERVER-persisted calling/acknowledgement row (collaboration_records
    -- purpose_acknowledgement or an approved discovery_sessions calling session):
    'calling_record',
    -- S9b: the agent_stated verbatim persist on a sage_reflect_sessions row:
    'reflect_screened_persist'
  ));

-- ---------------------------------------------------------------------------
-- §C  agent_trust_state — the screened-reflect modulator timestamp (nullable).
-- ---------------------------------------------------------------------------
ALTER TABLE public.agent_trust_state
  ADD COLUMN IF NOT EXISTS reflect_last_screened_at TIMESTAMPTZ;

COMMENT ON COLUMN public.agent_trust_state.reflect_last_screened_at IS
  'S9b G2: last agent_stated screened-reflect persist (quarter-rate decay '
  'modulation — SCREENED_REFLECT_MODULATION_FACTOR 4/3 onset multiplier; the '
  'full reflect_last_honest_at signal wins when both are active).';

-- ---------------------------------------------------------------------------
-- §E  collaboration_records — the spawn purpose-acknowledgement (nullable,
--     additive; S9b G1b). Written best-effort by the selection seam; the
--     calling-completed emission gates on the write landing, so pre-§E deploys
--     simply read ack-not-persisted (no event, record + boundary unaffected).
-- ---------------------------------------------------------------------------
ALTER TABLE public.collaboration_records
  ADD COLUMN IF NOT EXISTS purpose_acknowledgement JSONB;

COMMENT ON COLUMN public.collaboration_records.purpose_acknowledgement IS
  'S9b G1b: the scoped spawn purpose-acknowledgement (schema '
  'trust-purpose-acknowledgement-v1) — the deterministic function-type fit-check '
  'of the chosen candidate against the delegation scope; the calling-completed '
  'trust event''s artifact.';

-- ---------------------------------------------------------------------------
-- §D  WIDEN loop_billing_events.surface (+ api_practice_discernment).
--     (S9b election 2 — bundled; the CI-10 guardrail widening is the pattern.)
-- ---------------------------------------------------------------------------
ALTER TABLE public.loop_billing_events
  DROP CONSTRAINT IF EXISTS loop_billing_events_surface_check;

ALTER TABLE public.loop_billing_events
  ADD CONSTRAINT loop_billing_events_surface_check
  CHECK (surface IN (
    'api_reason', 'api_score_iterate', 'wrapper_internal', 'api_guardrail',
    'api_practice_discernment'
  ));

-- ---------------------------------------------------------------------------
-- §VERIFY  All five sections (run after apply; compare to Expected).
-- ---------------------------------------------------------------------------
SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
FROM   pg_constraint con
JOIN   pg_class rel ON rel.oid = con.conrelid
WHERE  rel.relname = 'agent_trust_events'
AND    con.conname IN (
  'agent_trust_events_event_type_check',
  'agent_trust_events_artifact_kind_check'
);
-- Expected: event_type lists FIFTEEN values ending with the three S9b types;
--           artifact_kind lists FOUR values.

SELECT column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  table_schema = 'public'
AND    table_name = 'agent_trust_state'
AND    column_name = 'reflect_last_screened_at';
-- Expected: one row — timestamp with time zone, YES.

SELECT pg_get_constraintdef(con.oid) AS definition
FROM   pg_constraint con
JOIN   pg_class rel ON rel.oid = con.conrelid
WHERE  rel.relname = 'loop_billing_events'
AND    con.conname = 'loop_billing_events_surface_check';
-- Expected: five surfaces, ending 'api_practice_discernment'.

-- Behavioural probe (TEST ONLY — insert + delete a probe row proving the new
-- vocabulary is accepted; run inside one transaction):
--   BEGIN;
--   INSERT INTO public.agent_trust_events
--     (agent_id, event_type, artifact_kind, artifact_ref, virtue_domain, payload)
--   VALUES
--     ('sagereasoning:s9b-probe@v1', 'reflect-screened-honest',
--      'reflect_screened_persist', 'reflect:probe', NULL, '{}'::jsonb);
--   DELETE FROM public.agent_trust_events WHERE agent_id = 'sagereasoning:s9b-probe@v1';
--   COMMIT;
-- Expected: INSERT 0 1 then DELETE 1 (and a §PRE-style count stays 0 after).

-- ---------------------------------------------------------------------------
-- ROLLBACK (each section independent; §A/§B/§D reversible ONLY while no row
-- uses the new values — i.e., while the three event types are unemitted and the
-- discernment surface unmetered; §C's column may be dropped anytime, the
-- deployed code never names it when null):
--   §A: re-ADD the CHECK with the original 12 values (drop first).
--   §B: re-ADD with the original 2 values.
--   §C: ALTER TABLE public.agent_trust_state DROP COLUMN IF EXISTS reflect_last_screened_at;
--   §E: ALTER TABLE public.collaboration_records DROP COLUMN IF EXISTS purpose_acknowledgement;
--   §D: re-ADD with the original 4 surfaces.
-- ---------------------------------------------------------------------------
