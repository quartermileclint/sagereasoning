-- ============================================================================
-- Trust Layer — Stoa Q5c/Q13a vocabulary widening (2026-08-04)
-- ============================================================================
--
-- WHAT THIS DOES (two independent, individually-reversible sections):
--   §A  agent_trust_events.event_type CHECK: 18 → 21 (adds
--       stoa-claim-contradicted-oversight, stoa-claim-contradicted-dikaiosyne,
--       stoa-declaration-diverges-from-calling — the 2026-08-02/08-04 mentor
--       verdicts on Q5(c) + Q13(a), verbatim record wins:
--       operations/connective-layer-2026-08/2026-08-04-mentor-consultation-
--       stoa-followups-verbatim.md — ON TOP OF the 15-original + 3
--       orientation-reading-* values a separate, unrelated 2026-08-08
--       migration already added; see the CORRECTED note below).
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
--
-- CORRECTED 2026-08-12, mid-activation-walk (Q5c/Q13a activation session):
-- this file's §A target list was STALE relative to a separate, later,
-- unrelated migration — the 2026-08-08 orientation-reading (C2/C1c)
-- activation, which independently widened this SAME event_type CHECK to add
-- 'orientation-reading-{toward,away,indeterminate}'. This file's original §A
-- CHECK (18 values: the 15 original + the 3 Stoa additions) did NOT include
-- those three, so applying it as originally written would have DROPPED
-- orientation-reading-* from the constraint — a real, additive-only
-- regression, not just a stale comment. §A below is now corrected to the
-- true target: 21 values (15 original + 3 orientation-reading + 3 Stoa).
-- §B (artifact_kind) is UNAFFECTED — the orientation-reading migration never
-- touched artifact_kind, so its original 4→5 widening was already correct.
--
-- Discovered live during the 2026-08-12 activation walk: production's
-- event_type CHECK already carried all 21 values before this walk began (an
-- earlier, unrecorded partial application — most likely this same file's §A
-- run against production by mistake in an even earlier session, not a
-- mysterious third party); production's artifact_kind CHECK was still at the
-- original 4 and was correctly widened to 5 in this walk. A companion
-- regression on the TEST project (this file's stale §A silently dropping
-- orientation-reading-* from TEST's own constraint) was found and corrected
-- in the same walk. See `D-STOA-Q5C-Q13A-MIGRATION-STALENESS-FOUND-AND-FIXED-2026-08-12`
-- (decision log) for the full account, including the two project-mix-up
-- near-misses this walk caught before acting on a false premise.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- §PRE  Pre-flight — prove no existing row sits outside the OLD vocabulary
--       (expected: both counts = 0 rows returned). CORRECTED 2026-08-12: the
--       "old vocabulary" for event_type is the 18 values live as of the
--       2026-08-08 orientation-reading migration (15 original + 3
--       orientation-reading-*), NOT the original 15 alone — this file's own
--       Stoa additions are the ONLY thing this §PRE should exclude as new.
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
  'calling-completed', 'reflect-screened-honest', 'self-screen-absent',
  'orientation-reading-toward', 'orientation-reading-away',
  'orientation-reading-indeterminate'
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
-- §A  WIDEN agent_trust_events.event_type (18 → 21). Corrected 2026-08-12 to
--     include the 3 orientation-reading-* values a separate, unrelated
--     2026-08-08 migration already added — omitting them here would DROP
--     them from the constraint, not merely fail to add the Stoa 3.
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
    -- Orientation-reading (2026-08-08, a separate migration — preserved here
    -- so this §A does not silently drop it):
    'orientation-reading-toward',
    'orientation-reading-away',
    'orientation-reading-indeterminate',
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
-- Expected: event_type lists TWENTY-ONE values, ending with the three
--           orientation-reading-* types followed by the three Stoa types;
--           artifact_kind lists FIVE values ending with
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
-- Stoa values — i.e., while both flags stay unset / the derivers unwired):
--   §A: re-ADD the CHECK with the 18 pre-Stoa values (the 15 original + the
--       3 orientation-reading-* values — NOT the bare 15; dropping
--       orientation-reading-* on rollback would invalidate the live
--       orientation-reading rows this migration must never touch). Drop
--       first.
--   §B: re-ADD with the original 4 values.
-- ---------------------------------------------------------------------------
