-- ============================================================================
-- Trust Layer — Logos-on W2 enforcement-class vocabulary widening (2026-09-12)
-- ============================================================================
--
-- WHAT THIS DOES (one section):
--   §A  agent_trust_events.event_type CHECK: 21 → 22 (adds enforcement-outcome
--       — the logos-on plan §3 W2 item 1, mentor verdicts L5 + L7:
--       operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-
--       circles-logos-on-verbatim.md; design of record:
--       operations/agent-circles-2026-08/2026-09-12-W2-record-honesty-DESIGN.md).
--
--   THE SCHEMA ELECTION (plan §3 W2 item 4, decided at build): a SEPARATE step,
--   not a ride on C1c's CHECK widening. The original build-plan C1c (first-
--   circle event classes) is unbuilt and unscheduled (decision log: "confirmed
--   as a distinct, separately-outstanding item"); W2 is a hard flip component
--   (S11 register §F W3-d) and cannot wait on work nobody has elected. This
--   widening is additive and idempotent, so a later C1c widening simply lists
--   22 values instead of 21.
--
--   NO artifact_kind change: the enforcement entry is backed by the guardrail's
--   own signed Layer-2 assessment — artifact_kind 'signed_layer2_assessment'
--   applies unchanged. NO virtue_domain CHECK change: the entry carries
--   virtue_domain NULL (it is evidence for no domain — the reflect-completed-
--   honest / orientation-reading agent-wide precedent).
--
-- SAFETY / ORDER:
--   • ADDITIVE (a CHECK that admits strictly MORE values). No existing row can
--     be invalidated: §PRE proves the current data is inside the old
--     vocabulary, and old-vocabulary writes remain valid by construction.
--   • Deploy order is SAFE in both directions: the emitting code
--     (emitEnforcementOutcomeTrustEvent, trust-core/enforcement-record.ts) is
--     dark behind BOTH SUBSTRATE_TRUST_CORE_ENABLED and the NEW
--     SUBSTRATE_ENFORCEMENT_RECORD_ENABLED — this migration MUST land before
--     that flag is set, or an emission would be rejected by the old CHECK and
--     surface as a loud store failure (fail-honest, never silent fabrication —
--     the S9b/Stoa/orientation precedent).
--   • EFFECT: 'flag' (trust-transition.ts EVENT_EFFECT, battery-pinned) — a
--     genuine no-op on trust state in either direction (mentor L5: "a distinct
--     enforcement class that moves no domain level"). PA-6 re-run in the same
--     change: the entry cannot raise oversight or any other domain.
--   • EMISSION PATH (enforced in code, not the DB): INSERT-ONLY via
--     emitLedgerOnlyTrustEvents — a NULL-domain event through the generic
--     emitTrustEvents would stamp the reflect timestamp (see the orientation
--     migration's note). The idempotency index (uq_ate_correlation) covers the
--     NULL domain via COALESCE — no index change needed.
--   • RETENTION: the table's existing retain_until (90d) + the live
--     trust-core retention sweep cover the new rows (PR24 parity, no new
--     wiring).
--
-- RUN ORDER: TEST project first (iwdtrvuphogkwmovhnvz), verify, then prod.
-- Idempotent: safe to re-run (DROP CONSTRAINT IF EXISTS + ADD).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- §PRE  Pre-flight — prove no existing row sits outside the OLD (21) vocabulary
--       (expected: 0). ALSO re-derive the CURRENT constraint before applying:
--         SELECT pg_get_constraintdef(con.oid) FROM pg_constraint con
--         JOIN pg_class rel ON rel.oid = con.conrelid
--         WHERE rel.relname = 'agent_trust_events'
--         AND con.conname = 'agent_trust_events_event_type_check';
--       If it does NOT list exactly the 21 values below, STOP — a later,
--       unrelated widening has landed and this file is stale against it (the
--       2026-08-12 Stoa lesson: a migration file's own vocabulary list is not
--       ground truth; the live constraint is).
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
  'stoa-declaration-diverges-from-calling',
  'orientation-reading-toward', 'orientation-reading-away',
  'orientation-reading-indeterminate'
);
-- Expected: 0

-- ---------------------------------------------------------------------------
-- §A  WIDEN agent_trust_events.event_type (21 → 22).
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
    'orientation-reading-toward',
    'orientation-reading-away',
    'orientation-reading-indeterminate',
    -- Logos-on W2 (2026-09-12): the enforcement class (mentor L5/L7).
    'enforcement-outcome'
  ));

-- ---------------------------------------------------------------------------
-- §VERIFY  (run after apply; compare to Expected).
-- ---------------------------------------------------------------------------
SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
FROM   pg_constraint con
JOIN   pg_class rel ON rel.oid = con.conrelid
WHERE  rel.relname = 'agent_trust_events'
AND    con.conname = 'agent_trust_events_event_type_check';
-- Expected: event_type lists TWENTY-TWO values ending with 'enforcement-outcome'.

-- Behavioural probe (TEST ONLY — insert + delete one probe row proving the new
-- value is accepted with a NULL virtue_domain; run inside one transaction).
-- NEVER paste the statements below into a production editor as a runnable
-- block (the 2026-08-31 near-miss: DDL/DML in a runnable block during a live
-- walk). They are commented on purpose.
--   BEGIN;
--   INSERT INTO public.agent_trust_events
--     (agent_id, event_type, artifact_kind, artifact_ref, virtue_domain, payload)
--   VALUES
--     ('sagereasoning:enforce-probe@v1', 'enforcement-outcome',
--      'signed_layer2_assessment', 'enforce-probe:artifact-1', NULL,
--      '{"regime":"logos-on-enforcement"}'::jsonb);
--   DELETE FROM public.agent_trust_events WHERE agent_id = 'sagereasoning:enforce-probe@v1';
--   COMMIT;
-- Expected: INSERT 0 1 then DELETE 1 (and a §PRE-style count stays 0 after).
-- Then verify NO agent_trust_state row was created for the probe agent:
--   SELECT count(*) FROM public.agent_trust_state
--   WHERE agent_id = 'sagereasoning:enforce-probe@v1';
-- Expected: 0

-- ---------------------------------------------------------------------------
-- ROLLBACK (reversible ONLY while no row uses the new value — i.e., while
-- SUBSTRATE_ENFORCEMENT_RECORD_ENABLED stays unset): re-ADD the CHECK with
-- the 21 §PRE values (drop first).
-- ---------------------------------------------------------------------------
