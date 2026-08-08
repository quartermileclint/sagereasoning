-- ============================================================================
-- Trust Layer — Agent-circles C1c orientation-reading vocabulary widening
-- (2026-08-08)
-- ============================================================================
--
-- WHAT THIS DOES (one section):
--   §A  agent_trust_events.event_type CHECK: 18 → 21 (adds
--       orientation-reading-toward, orientation-reading-away,
--       orientation-reading-indeterminate — the C2/C1c scope's §4, both
--       2026-08-06 rulings: Option A storage [reuse agent_trust_events, the
--       stoa-declaration-diverges-from-calling 'flag' precedent] and
--       virtue_domain NULL [the reflect-completed-honest agent-wide
--       precedent]; scope document:
--       operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-
--       and-c1c-trust-event-scope.md).
--
--   NO artifact_kind change: the orientation reading derives from the SAME
--   signed Layer-2 assessment class every credential/justice event uses —
--   artifact_kind 'signed_layer2_assessment' applies unchanged (scope §4.4).
--   NO virtue_domain CHECK change: the events carry virtue_domain NULL, which
--   the existing CHECK admits (NULL passes a CHECK by SQL semantics — the
--   reflect-completed-honest rows prove it in production).
--
-- SAFETY / ORDER:
--   • ADDITIVE (a CHECK that admits strictly MORE values). No existing row can
--     be invalidated: §PRE proves the current data is inside the old
--     vocabulary, and old-vocabulary writes remain valid by construction.
--   • Deploy order is SAFE in both directions: the emitting code
--     (emitOrientationReadingTrustEvent) is dark behind BOTH
--     SUBSTRATE_TRUST_CORE_ENABLED and the NEW
--     SUBSTRATE_ORIENTATION_READING_ENABLED — this migration MUST land before
--     the orientation flag is set, or an emission would be rejected by the old
--     CHECK and surface as a loud store failure (fail-honest, never silent
--     fabrication — the S9b/Stoa precedent).
--   • EMISSION-PATH NOTE (load-bearing, enforced in code not the DB): the
--     orientation events are NULL-domain, and the generic emitTrustEvents
--     routes NULL-domain events to the reflect-timestamp fold
--     (applyReflectAcrossDomains) — which would grant half-rate decay from an
--     orientation reading. The events are therefore emitted ONLY via the
--     insert-only emitLedgerOnlyTrustEvents (trust-core-store.ts), and the
--     reflect fold refuses non-reflect event types (defence in depth). The
--     idempotency index (uq_ate_correlation) covers NULL domains via
--     COALESCE(virtue_domain, '__agent_wide__') — no index change needed.
--   • 'flag' effect — a genuine no-op on trust state; the reading can never
--     move a domain level (trust-transition.ts EVENT_EFFECT, battery-pinned).
--
-- RUN ORDER: TEST project first (iwdtrvuphogkwmovhnvz), verify, then prod.
-- Idempotent: safe to re-run (DROP CONSTRAINT IF EXISTS + ADD).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- §PRE  Pre-flight — prove no existing row sits outside the OLD vocabulary
--       (expected: 0).
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
  'stoa-claim-contradicted-oversight', 'stoa-claim-contradicted-dikaiosyne',
  'stoa-declaration-diverges-from-calling'
);
-- Expected: 0

-- ---------------------------------------------------------------------------
-- §A  WIDEN agent_trust_events.event_type (18 → 21).
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
    'stoa-claim-contradicted-oversight',
    'stoa-claim-contradicted-dikaiosyne',
    'stoa-declaration-diverges-from-calling',
    -- Agent-circles C1c (2026-08-08): the circle-5 orientation reading.
    'orientation-reading-toward',
    'orientation-reading-away',
    'orientation-reading-indeterminate'
  ));

-- ---------------------------------------------------------------------------
-- §VERIFY  (run after apply; compare to Expected).
-- ---------------------------------------------------------------------------
SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
FROM   pg_constraint con
JOIN   pg_class rel ON rel.oid = con.conrelid
WHERE  rel.relname = 'agent_trust_events'
AND    con.conname = 'agent_trust_events_event_type_check';
-- Expected: event_type lists TWENTY-ONE values ending with the three
--           orientation-reading types.

-- Behavioural probe (TEST ONLY — insert + delete three probe rows proving the
-- new vocabulary is accepted with a NULL virtue_domain; run inside one
-- transaction):
--   BEGIN;
--   INSERT INTO public.agent_trust_events
--     (agent_id, event_type, artifact_kind, artifact_ref, virtue_domain, payload)
--   VALUES
--     ('sagereasoning:orient-probe@v1', 'orientation-reading-toward',
--      'signed_layer2_assessment', 'orient-probe:artifact-1', NULL, '{}'::jsonb),
--     ('sagereasoning:orient-probe@v1', 'orientation-reading-away',
--      'signed_layer2_assessment', 'orient-probe:artifact-2', NULL, '{}'::jsonb),
--     ('sagereasoning:orient-probe@v1', 'orientation-reading-indeterminate',
--      'signed_layer2_assessment', 'orient-probe:artifact-3', NULL, '{}'::jsonb);
--   DELETE FROM public.agent_trust_events WHERE agent_id = 'sagereasoning:orient-probe@v1';
--   COMMIT;
-- Expected: INSERT 0 3 then DELETE 3 (and a §PRE-style count stays 0 after).
-- Then verify NO agent_trust_state row was created for the probe agent (the
-- insert-only discipline means the DB alone never folds — this probe writes
-- the ledger directly, so state must stay empty):
--   SELECT count(*) FROM public.agent_trust_state
--   WHERE agent_id = 'sagereasoning:orient-probe@v1';
-- Expected: 0

-- ---------------------------------------------------------------------------
-- ROLLBACK (reversible ONLY while no row uses the new values — i.e., while
-- the orientation flag stays unset):
--   re-ADD the CHECK with the original 18 values (drop first).
-- ---------------------------------------------------------------------------
