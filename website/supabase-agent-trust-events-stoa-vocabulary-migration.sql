-- ============================================================================
-- Trust Layer — Stoa Q5c/Q13a vocabulary widening (2026-08-04)
-- ============================================================================
--
-- WHAT THIS DOES (two independent, individually-reversible sections):
--   §A  agent_trust_events.event_type CHECK: 15 → 18 (adds
--       stoa-claim-contradicted-oversight, stoa-claim-contradicted-dikaiosyne,
--       stoa-declaration-diverges-from-calling — the 2026-08-02/08-04 mentor
--       verdicts on Q5(c) + Q13(a), verbatim record wins:
--       operations/connective-layer-2026-08/2026-08-04-mentor-consultation-
--       stoa-followups-verbatim.md).
--   §B  agent_trust_events.artifact_kind CHECK: 4 → 5 (adds
--       stoa_examined_artifact — the curator-paired examined-use artifact
--       backing the two Q5(c) contradiction events; the Q13(a) divergence
--       event reuses the EXISTING calling_record kind, per the mentor's
--       "shares the calling record as a data source" ruling — no new kind
--       needed there).
--
-- SAFETY / ORDER:
--   • Both sections are ADDITIVE (a CHECK that admits strictly MORE values).
--     No existing row can be invalidated: §PRE proves the current data is
--     inside the old vocabulary, and old-vocabulary writes remain valid under
--     the new CHECKs by construction.
--   • Deploy order is SAFE in both directions: the emitting code (the new
--     derivers + the admin flag-intake route) is itself dark behind BOTH
--     SUBSTRATE_TRUST_CORE_ENABLED and the NEW
--     SUBSTRATE_STOA_TRUST_EVENTS_ENABLED — this migration MUST land before
--     either flag is set, or an emission would be rejected by the old CHECK
--     and surface as a loud store failure (fail-honest, never silent
--     fabrication — the S9b precedent).
--   • Domain-by-content, never severity (mentor, verbatim): "oversight here
--     is not a severity escalation over dikaiosyne. It is a different domain
--     of concern." Both contradiction events may fire from one root cause —
--     no dedup between them, and none is introduced by this migration.
--   • The divergence event's virtue_domain MUST be 'oversight', never NULL —
--     a NULL-domain event routes to reflect-specific fold machinery
--     (trust-core-store.ts applyReflectAcrossDomains) that would silently
--     slow decay across every domain from a coherence discrepancy. This is
--     enforced in the deriver (derive-trust-events.ts), not the DB — the DB
--     CHECK on virtue_domain already admits 'oversight' (VIRTUE_TRUST_DOMAINS
--     predates this migration).
--
-- RUN ORDER: TEST project first (iwdtrvuphogkwmovhnvz), verify, then prod.
-- Idempotent: safe to re-run (DROP CONSTRAINT IF EXISTS + ADD).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- §PRE  Pre-flight — prove no existing row sits outside the OLD vocabulary
--       (expected: both counts = 0 rows returned).
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
  'delegation-reflection-case-3',
  'calling-completed', 'reflect-screened-honest', 'self-screen-absent'
);
-- Expected: 0

SELECT count(*) AS artifact_kind_outside_old_vocab
FROM   public.agent_trust_events
WHERE  artifact_kind NOT IN (
  'signed_layer2_assessment', 'reflect_completion',
  'calling_record', 'reflect_screened_persist'
);
-- Expected: 0

-- ---------------------------------------------------------------------------
-- §A  WIDEN agent_trust_events.event_type (15 → 18).
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
    'calling-completed',
    'reflect-screened-honest',
    'self-screen-absent',
    -- Stoa Q5c/Q13a (2026-08-04):
    'stoa-claim-contradicted-oversight',
    'stoa-claim-contradicted-dikaiosyne',
    'stoa-declaration-diverges-from-calling'
  ));

-- ---------------------------------------------------------------------------
-- §B  WIDEN agent_trust_events.artifact_kind (4 → 5).
-- ---------------------------------------------------------------------------
ALTER TABLE public.agent_trust_events
  DROP CONSTRAINT IF EXISTS agent_trust_events_artifact_kind_check;

ALTER TABLE public.agent_trust_events
  ADD CONSTRAINT agent_trust_events_artifact_kind_check
  CHECK (artifact_kind IN (
    'signed_layer2_assessment',
    'reflect_completion',
    'calling_record',
    'reflect_screened_persist',
    -- Stoa Q5c (2026-08-04): the admin-curated examined-use artifact backing
    -- a claim-contradicted event. The evidentiary standard (mentor, verbatim):
    -- "a reader examining both the artifact and the entry text would find the
    -- contradiction without requiring inference or interpretation."
    'stoa_examined_artifact'
  ));

-- ---------------------------------------------------------------------------
-- §VERIFY  Both sections (run after apply; compare to Expected).
-- ---------------------------------------------------------------------------
SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
FROM   pg_constraint con
JOIN   pg_class rel ON rel.oid = con.conrelid
WHERE  rel.relname = 'agent_trust_events'
AND    con.conname IN (
  'agent_trust_events_event_type_check',
  'agent_trust_events_artifact_kind_check'
);
-- Expected: event_type lists EIGHTEEN values ending with the three Stoa
--           types; artifact_kind lists FIVE values ending with
--           stoa_examined_artifact.

-- Behavioural probe (TEST ONLY — insert + delete three probe rows proving the
-- new vocabulary is accepted; run inside one transaction):
--   BEGIN;
--   INSERT INTO public.agent_trust_events
--     (agent_id, event_type, artifact_kind, artifact_ref, virtue_domain, payload)
--   VALUES
--     ('sagereasoning:stoa-probe@v1', 'stoa-claim-contradicted-oversight',
--      'stoa_examined_artifact', 'stoa-probe:artifact-1', 'oversight', '{}'::jsonb),
--     ('sagereasoning:stoa-probe@v1', 'stoa-claim-contradicted-dikaiosyne',
--      'stoa_examined_artifact', 'stoa-probe:artifact-2', 'dikaiosyne', '{}'::jsonb),
--     ('sagereasoning:stoa-probe@v1', 'stoa-declaration-diverges-from-calling',
--      'calling_record', 'stoa-probe:calling-1', 'oversight', '{}'::jsonb);
--   DELETE FROM public.agent_trust_events WHERE agent_id = 'sagereasoning:stoa-probe@v1';
--   COMMIT;
-- Expected: INSERT 0 3 then DELETE 3 (and a §PRE-style count stays 0 after).

-- ---------------------------------------------------------------------------
-- ROLLBACK (each section independent; reversible ONLY while no row uses the
-- new values — i.e., while both flags stay unset / the derivers unwired):
--   §A: re-ADD the CHECK with the original 15 values (drop first).
--   §B: re-ADD with the original 4 values.
-- ---------------------------------------------------------------------------
