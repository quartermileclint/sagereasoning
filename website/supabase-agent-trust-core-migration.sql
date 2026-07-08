-- Migration: supabase-agent-trust-core-migration
-- Purpose: Trust Layer S1 (Phase 1, the trust core — MEASURE mode; schema + write
--   half). Two new tables realise mentor spec 1 (trust state) + spec 3 (trust
--   dynamics) + A3 (decay), per ADR-013 (adopted/adr/2026-07-08-sage-trust-layer.md)
--   and the build plan §S1:
--
--     * agent_trust_events  — the APPEND-ONLY, IMMUTABLE typed trust-event ledger.
--         One row per (occurrence, affected virtue-domain). The audit trail of
--         every trust-relevant event, each carrying artifact_ref/artifact_kind —
--         the R18f-parallel proof that a verifiable examination artifact backs it
--         (a signed Ed25519 Layer-2 assessment, or an honest reflect completion).
--         NO trust event without a verifiable artifact — this makes trust records
--         consumer-unforgeable + server-composed, exactly as accreditation writes
--         are provenance-gated today (R18f).
--
--     * agent_trust_state   — the MATERIALIZED per-(agent_id, virtue_domain) fold.
--         The current earned trust level (proximity-scale-valued, mentor spec 4) +
--         the metadata the read path needs to apply A3 decay LAZILY (E3
--         lazy-on-read): last_domain_activity_at, volatility_rating, profile_prior
--         (the decay FLOOR), reflect_last_honest_at (decay modulation), and the
--         justice_floor_active latch (mentor spec 3: a justice surface left
--         unevaluated floors the domain at deliberate until a demonstrated
--         evaluation clears it).
--
--   MEASURE MODE: this half RECORDS trust; it gates NOTHING. The intervention
--   policy engine is S4; binding enforcement is S11 (a separate founder-walked
--   Critical activation — nothing here is pre-approved). The whole surface is DARK
--   behind SUBSTRATE_TRUST_CORE_ENABLED — flag-unset ⇒ no route emits, no row is
--   written, and these tables sit empty + inert (byte-identical, test-asserted).
--
-- DOMAIN AXIS (mentor spec 3/4; ADR-013 §3 row 1): the FOUR cardinal virtue
--   domains (phronesis, dikaiosyne, andreia, sophrosyne — engine
--   layer2-mechanisms.ts VirtueDomain), PLUS 'oversight' — the orchestrator's
--   supervisory function domain that the A8 (proceed-under-habitual-flag) and A9
--   (delegation-reflection) events target. Mentor A9 explicitly DISTINGUISHES the
--   oversight domain from dikaiosyne (case 2 reduces BOTH), so folding oversight
--   into a cardinal virtue would be unfaithful. 'oversight' is DEFINED here (the
--   CHECK admits it) but NO event is emitted to it this session — the A8/A9 events
--   need the S5–S7 collaboration record that does not exist yet.
--
--   This is NOT the A2 deployer-defined function-type taxonomy (that is S2). The
--   trust state is keyed on the virtue-domain axis; A2 domain-distance /
--   confidence-tier weighting layers on top at S2.
--
-- IDENTITY MODEL (K1-aligned; mirrors agent_assessment_history):
--   * agent_id      — the K1 declared agent_identity (namespace:name@version, or
--       the grandfathered legacy form). NOT NULL — trust is per declared agent.
--   * owner_user_id — the OPERATOR (K1 operator_account) — the credential owner
--       (a developer, never an end-user — R3). Denormalised from the credential so
--       the user-JWT data-rights paths (/api/user/delete R17c + /api/user/export
--       R17i) reach these rows. FK → profiles(id) ON DELETE CASCADE = the
--       genuine-deletion backstop. NULL for external API consumers (sr_live_ path).
--   * credential_ref — the stable per-credential handle ('api_key:<id>' |
--       'install:<id>') so consumer-erasure-by-token (/api/credential/erase, R17c)
--       reaches the null-owner external-consumer rows. NULLable.
--
-- DECAY (A3, the load-bearing numeric spec; realised R6c-faithfully as ORDINAL
--   proximity steps, NOT a continuous score):
--   * volatility_rating (low|moderate|high) → decline ONSET at 12|6|3 months of
--       DOMAIN inactivity. The earned level then steps DOWN one proximity rank per
--       onset-period of continued inactivity, FLOORED at profile_prior (never
--       below via decay — decay is loss of earned evidence, not negative evidence;
--       a trust-reducing EVENT may push below the prior, decay may not).
--   * reflect_last_honest_at drives the reflect modulation: an active honest
--       reflect practice DOUBLES the onset (the A3 half-rate cap — "3 months
--       becomes 6"; it slows decay, never stops it).
--   Decay is computed at READ time (E3): a trust read is a LIVE value, so now() is
--   correct here (unlike the signed/reproducible trajectory overlay). The stored
--   earned_level is the "as-of-last-event" value; the store realises accrued decay
--   into it at the next event.
--
-- Related: ADR-013 (design-of-record), mentor spec 1/3/4 + A3 + A8 + A9,
--   agent_assessment_history (the mirrored precedent — retain_until, RLS
--   service-role-only, missing-table-benign data rights), R17/R17c/R17i (data
--   rights extend here), R18f (the provenance-gated-write parallel), R6c
--   (qualitative proximity levels, not numeric scoring).
-- Decision log: D-TRUST-LAYER-S0B-ADR-ADOPTED (the design surface);
--   D-TRUST-LAYER-S1-... (this session).
--
-- Risk classification: Critical under 0d-ii — NEW schema + data-deletion
--   functionality. Idempotent + additive (CREATE ... IF NOT EXISTS); no existing
--   table is altered; reversible via the rollback block. Applied TEST-first, then
--   PRODUCTION INERT this session (flag unset ⇒ no writes) — the M6 precedent —
--   each its own founder-walked step (PR17/AC7). The flag activation is a LATER
--   founder-walked step, not pre-approved by this migration.
-- Idempotent: safe to re-run (CREATE TABLE / INDEX / POLICY / TRIGGER IF NOT EXISTS
--   or CREATE OR REPLACE for the function).

-- ============================================================================
-- 1. agent_trust_events — the append-only, immutable typed trust-event ledger
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (K1-aligned; see the header).
  agent_id       TEXT NOT NULL,
  owner_user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref TEXT,

  -- The affected virtue-domain. NULL for AGENT-WIDE events (reflect-completed-
  -- honest modulates decay across all of an agent's domains and is not tied to
  -- one). The four cardinal virtues + 'oversight' (A8/A9, defined-not-emitted).
  virtue_domain TEXT CHECK (virtue_domain IN (
    'phronesis', 'dikaiosyne', 'andreia', 'sophrosyne', 'oversight'
  )),

  -- The typed trust event (mentor spec 3 + A8 + A9). event_type is the single
  -- source of truth for the event's effect on trust state — the deterministic
  -- engine (trust-core/trust-transition.ts) maps type → effect; no separate,
  -- driftable 'direction' column is stored.
  --   WIRED this session (E1 founder election "also wire justice"):
  --     credential-completed, reflect-completed-honest,
  --     justice-surface-transparently-handled / -unevaluated / -violated /
  --     -indeterminate.
  --   DEFINED (vocabulary + engine) but NOT emitted this session — need a
  --   /api/reason touch or the S5–S7 collaboration record:
  --     credential-suspended-revoked, passion-unflagged-by-self-screen,
  --     orchestrator-proceeds-under-habitual-flag (A8),
  --     delegation-reflection-case-1 / -2 / -3 (A9).
  event_type TEXT NOT NULL CHECK (event_type IN (
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
    'delegation-reflection-case-3'
  )),

  -- The R18f-PARALLEL PROOF — the verifiable examination artifact backing this
  -- event. NOT NULL: no trust event without a verifiable artifact. artifact_kind
  -- names WHAT the artifact is; artifact_ref is a stable handle to it (the signing
  -- key_id for a signed assessment, or 'reflect:<session_id>' for a completion).
  artifact_kind TEXT NOT NULL CHECK (artifact_kind IN (
    'signed_layer2_assessment', 'reflect_completion'
  )),
  artifact_ref TEXT NOT NULL CHECK (length(artifact_ref) > 0),

  -- The event's signal, for S2 to refine weighting (A2 domain distance, A5
  -- confidence tiers) — e.g. demonstrated_proximity, coverage_continuous,
  -- coverage_status, obligation_status, fabrication_risk_level, context_source.
  -- JSONB (KG7 — the object is passed directly, no JSON.stringify).
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- When the trust-relevant occurrence happened (the examined action / completion
  -- time). Distinct from created_at (the ledger-write time) so replays and
  -- back-dated corrections order correctly by the real event time.
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Idempotency key: fanned per-domain rows from one occurrence share a
  -- correlation_id; the partial unique index below makes emission idempotent
  -- under retry (one row per (correlation_id, event_type, virtue_domain)). TEXT
  -- (not UUID) so it can be a deterministic content-hash of the write ('accr:<hash>'
  -- for an accreditation write, 'reflect:<session_id>' for a reflect completion) —
  -- a retry re-derives the same key and dedupes.
  correlation_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- R17c: 90-day retention (SR-12 / M6 precedent). For null-owner external-consumer
  -- rows this is the PRIMARY genuine-deletion mechanism (the trust-core retention
  -- sweep hard-deletes past retain_until). The MATERIALIZED state (below) persists
  -- independently of this window — the fold is not replayed from expired events.
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);

-- Read an agent's domain event history, most-recent first.
CREATE INDEX IF NOT EXISTS idx_ate_agent_domain_time
  ON public.agent_trust_events (agent_id, virtue_domain, occurred_at DESC);

-- Data-rights: delete/export an operator's events.
CREATE INDEX IF NOT EXISTS idx_ate_owner
  ON public.agent_trust_events (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- Consumer-erasure-by-token: delete an external consumer's events by credential.
CREATE INDEX IF NOT EXISTS idx_ate_credential
  ON public.agent_trust_events (credential_ref)
  WHERE credential_ref IS NOT NULL;

-- Retention sweep (hard-delete past retain_until).
CREATE INDEX IF NOT EXISTS idx_ate_retain_until
  ON public.agent_trust_events (retain_until);

-- Idempotency: one row per (correlation_id, event_type, virtue_domain). Partial
-- (correlation_id NOT NULL) so events without a correlation id are unconstrained.
-- COALESCE the nullable virtue_domain so agent-wide (NULL-domain) events dedupe too.
CREATE UNIQUE INDEX IF NOT EXISTS uq_ate_correlation
  ON public.agent_trust_events (
    correlation_id, event_type, COALESCE(virtue_domain, '__agent_wide__')
  )
  WHERE correlation_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 1a. Append-only immutability — the ledger is an immutable audit trail. INSERT
--     and DELETE (retention purge + data-rights erasure) are permitted; UPDATE is
--     forbidden by a BEFORE UPDATE trigger so no event can be rewritten after the
--     fact. Genuine deletion (R17c) uses DELETE (allowed); nothing ever UPDATEs.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.agent_trust_events_forbid_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'agent_trust_events is append-only; UPDATE is forbidden (R18f-parallel audit ledger)';
END;
$$;

DROP TRIGGER IF EXISTS trg_ate_forbid_update ON public.agent_trust_events;
CREATE TRIGGER trg_ate_forbid_update
  BEFORE UPDATE ON public.agent_trust_events
  FOR EACH ROW EXECUTE FUNCTION public.agent_trust_events_forbid_update();

-- ============================================================================
-- 2. agent_trust_state — the materialized per-(agent_id, virtue_domain) fold
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_trust_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (see the header). agent_id + virtue_domain is the composite key.
  agent_id       TEXT NOT NULL,
  virtue_domain  TEXT NOT NULL CHECK (virtue_domain IN (
    'phronesis', 'dikaiosyne', 'andreia', 'sophrosyne', 'oversight'
  )),
  owner_user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref TEXT,

  -- The earned trust level (proximity-scale-valued, mentor spec 4; categorical,
  -- R6c — NOT a numeric score). This is the "as-of-last-event" value; the read
  -- path applies A3 decay lazily on top of it. New rows start at profile_prior.
  earned_level TEXT NOT NULL CHECK (earned_level IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),

  -- The decay FLOOR + the un-profiled/fully-decayed baseline (mentor spec 2 Tier-3;
  -- A6). Default 'habitual' ⇒ an unknown or fully-decayed agent lands at pause-and-
  -- examine (the safe direction; the intervention table treats habitual as
  -- pause+examine). Deployer-settable. Decay never reduces below this; a
  -- trust-reducing EVENT may.
  profile_prior TEXT NOT NULL DEFAULT 'habitual' CHECK (profile_prior IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),

  -- Deployer-rated function-type volatility → the A3 decline onset (low=12mo,
  -- moderate=6mo, high=3mo of domain inactivity). Default 'high' — the
  -- conservative default (fastest decay = trust treated as stale soonest = the
  -- safe direction in measure mode) PENDING S2/A2 per-function-type volatility.
  volatility_rating TEXT NOT NULL DEFAULT 'high' CHECK (volatility_rating IN (
    'low', 'moderate', 'high'
  )),

  -- Last time the agent OPERATED in this domain (any domain event, good or bad).
  -- Drives the A3 decay onset. NULL ⇒ no activity yet ⇒ no decay.
  last_domain_activity_at TIMESTAMPTZ,

  -- Last honest Sage Reflect completion for this agent (denormalised onto every
  -- domain row; agent-wide). Drives the A3 reflect modulation: an active honest
  -- reflect practice DOUBLES the decay onset (the half-rate cap). NULL ⇒ base rate.
  reflect_last_honest_at TIMESTAMPTZ,

  -- The mentor-spec-3 justice latch: a justice surface left unevaluated (or
  -- argued-indeterminate) CAPS the effective level at 'deliberate' until a
  -- demonstrated evaluation (a justice-surface-transparently-handled event)
  -- clears it. Applies to the dikaiosyne domain. Read-path applies the cap.
  justice_floor_active BOOLEAN NOT NULL DEFAULT false,

  -- Coverage status (mentor spec 4 confidence+coverage; informs S2 confidence).
  coverage_status TEXT CHECK (coverage_status IN (
    'continuous', 'suspended', 'resumed-unverified'
  )),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- The state IS mutable — it is a materialized fold, upserted on each event.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- R17c: 90-day retention, REFRESHED on each event (now + 90d). A dormant agent's
  -- state expires 90 days after its last event (~the high-volatility onset — by
  -- then the trust has largely decayed to the prior anyway).
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- One state row per (agent, domain) — the upsert / read key.
  CONSTRAINT uq_ats_agent_domain UNIQUE (agent_id, virtue_domain)
);

-- Data-rights: delete/export an operator's state.
CREATE INDEX IF NOT EXISTS idx_ats_owner
  ON public.agent_trust_state (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- Consumer-erasure-by-token: delete an external consumer's state by credential.
CREATE INDEX IF NOT EXISTS idx_ats_credential
  ON public.agent_trust_state (credential_ref)
  WHERE credential_ref IS NOT NULL;

-- Retention sweep.
CREATE INDEX IF NOT EXISTS idx_ats_retain_until
  ON public.agent_trust_state (retain_until);

-- ============================================================================
-- 3. Row-Level Security — service-role only (R17a; internal trust data, no public
--    read; the subject's isolation is mediated by the service role + the
--    credential/owner-scoped queries in trust-core-store.ts). The S10 public
--    read surface is a later, separately-governed slice.
-- ============================================================================

ALTER TABLE public.agent_trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_trust_state  ENABLE ROW LEVEL SECURITY;

-- No permissive policies. The Supabase service role bypasses RLS and is the ONLY
-- reader/writer (trust-core-store.ts + the data-rights routes).
REVOKE ALL ON public.agent_trust_events FROM PUBLIC;
REVOKE ALL ON public.agent_trust_events FROM authenticated;
REVOKE ALL ON public.agent_trust_events FROM anon;
REVOKE ALL ON public.agent_trust_state FROM PUBLIC;
REVOKE ALL ON public.agent_trust_state FROM authenticated;
REVOKE ALL ON public.agent_trust_state FROM anon;

-- ============================================================================
-- 4. In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.agent_trust_events IS
  'Trust Layer S1 (2026-07-08): the APPEND-ONLY, IMMUTABLE typed trust-event '
  'ledger (mentor spec 3). One row per (occurrence, virtue_domain). Every row '
  'carries artifact_ref/artifact_kind — the R18f-parallel proof of a verifiable '
  'examination artifact (no trust event without one). UPDATE is trigger-forbidden; '
  'INSERT + DELETE (retention/erasure) only. DARK behind SUBSTRATE_TRUST_CORE_ENABLED '
  '(flag-unset ⇒ empty + inert). R17 lifecycle: 90-day retain_until + genuine '
  'deletion via /api/user/delete + /api/credential/erase + the profiles cascade.';

COMMENT ON TABLE public.agent_trust_state IS
  'Trust Layer S1 (2026-07-08): the MATERIALIZED per-(agent_id, virtue_domain) '
  'trust fold (mentor spec 1/4). earned_level is proximity-scale-valued '
  '(categorical, R6c); the read path applies A3 decay lazily (E3) from '
  'last_domain_activity_at against the volatility onset, floored at profile_prior, '
  'reflect-modulated (reflect_last_honest_at doubles the onset — the half-rate '
  'cap). justice_floor_active caps the effective level at deliberate until a '
  'demonstrated evaluation clears it. Persists independently of event retention '
  '(the fold is not replayed from expired events). DARK behind '
  'SUBSTRATE_TRUST_CORE_ENABLED.';

COMMENT ON COLUMN public.agent_trust_events.virtue_domain IS
  'The four cardinal virtues + oversight (A8/A9, defined-not-emitted). NULL for '
  'agent-wide events (reflect-completed-honest).';
COMMENT ON COLUMN public.agent_trust_events.artifact_ref IS
  'R18f-parallel: the verifiable examination artifact handle (signing key_id for a '
  'signed assessment; reflect:<session_id> for a completion). NOT NULL + non-empty.';
COMMENT ON COLUMN public.agent_trust_state.earned_level IS
  'As-of-last-event earned trust level (proximity scale). The read path applies '
  'A3 decay + the justice cap on top; the stored value is not itself decayed.';
COMMENT ON COLUMN public.agent_trust_state.profile_prior IS
  'The A3 decay floor + un-profiled baseline. Default habitual ⇒ pause-and-examine '
  'for an unknown/fully-decayed agent (safe). Decay never goes below; an EVENT may.';
COMMENT ON COLUMN public.agent_trust_state.volatility_rating IS
  'A3 decline onset: low=12mo, moderate=6mo, high=3mo. Default high (conservative) '
  'pending S2/A2 per-function-type volatility.';

-- ============================================================================
-- VERIFY — paste the output back to confirm (TEST first, then production inert at
-- its own founder-walked step).
-- ============================================================================

-- 1. Both tables exist.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('agent_trust_events', 'agent_trust_state')
ORDER BY table_name;

-- 2. Columns + types (events).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_trust_events'
ORDER BY ordinal_position;

-- 3. Columns + types (state).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_trust_state'
ORDER BY ordinal_position;

-- 4. Indexes (events: pkey, idx_ate_agent_domain_time, idx_ate_owner,
--    idx_ate_credential, idx_ate_retain_until, uq_ate_correlation).
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agent_trust_events', 'agent_trust_state')
ORDER BY tablename, indexname;

-- 5. owner_user_id FK to profiles present on both tables.
SELECT conrelid::regclass AS tbl, conname, confrelid::regclass AS references
FROM pg_constraint
WHERE conrelid IN (
    'public.agent_trust_events'::regclass, 'public.agent_trust_state'::regclass
  ) AND contype = 'f'
ORDER BY tbl;

-- 6. The append-only UPDATE trigger exists on agent_trust_events.
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.agent_trust_events'::regclass AND NOT tgisinternal;

-- 7. RLS enabled on both (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('agent_trust_events', 'agent_trust_state')
ORDER BY relname;

-- 8. Immutability behaviour check (optional — run against a scratch row on TEST):
--    INSERT one row, attempt UPDATE (expect the RAISE EXCEPTION), then DELETE.
--    (Left commented; the store never UPDATEs, so this is a belt-and-braces probe.)
-- INSERT INTO public.agent_trust_events (agent_id, event_type, artifact_kind, artifact_ref)
--   VALUES ('probe:immutability@v1', 'reflect-completed-honest', 'reflect_completion', 'reflect:probe');
-- UPDATE public.agent_trust_events SET agent_id = 'x' WHERE agent_id = 'probe:immutability@v1';  -- expect ERROR
-- DELETE FROM public.agent_trust_events WHERE agent_id = 'probe:immutability@v1';  -- expect success

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert). Flag-unset first
-- so nothing is writing, then drop.
-- ============================================================================
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.agent_trust_events;   -- drops trigger + indexes
--   DROP TABLE IF EXISTS public.agent_trust_state;
--   DROP FUNCTION IF EXISTS public.agent_trust_events_forbid_update();
-- COMMIT;
