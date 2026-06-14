-- Migration: 20260614_m6_agent_assessment_history
-- Purpose: CI-5 (mechanism-correction M6, schema + write half) — durable
--   per-consult assessment-history for the agent path on /api/reason. One row
--   per completed examination when SUBSTRATE_TRAJECTORY_WRITE_ENABLED='true'.
--   This is the *continuity half* of the Character-Kernel claim (FX-6 / dossier
--   B5): today the agent path scores statelessly per instance (by design); what
--   was missing is a readable longitudinal trajectory keyed to the consulting
--   credential. This table accumulates that trajectory. THIS HALF ONLY WRITES —
--   the engine does NOT read it back this session (determinism is untouched);
--   M7 wires the windowed read (D17 prior-state, 90d/last-30) that feeds Rule 10
--   and makes CI-15's proximity-calibrated depth operational.
--
-- IDENTITY MODEL (founder election 2026-06-14 — "Standalone, credential-keyed";
--   the per-consult sibling of evaluated_actions, NOT a duplicate of it):
--   * credential_ref — the STABLE per-credential handle two consults on the same
--       credential share: 'api_key:<api_key_id>' (sr_live_ path) or
--       'install:<install_id>' (A10 per-install path). This is the M7 windowing
--       key. NOT NULL — a row is written only when a credential identity exists
--       (user-JWT consults carry no agent identity and write nothing).
--   * owner_user_id — the OPERATOR (K1 operator_account): the api_keys /
--       per-install credential owner (a developer, never an end-user — R3).
--       Denormalised from the credential so the existing user-JWT data-rights
--       paths (/api/user/delete R17c + /api/user/export R17i) reach these rows.
--       FK → profiles(id) ON DELETE CASCADE = genuine-deletion backstop.
--   * agent_id — the K1 declared agent_identity (namespace:name@version, or the
--       grandfathered legacy form), validated via agent-id-vocabulary.ts at the
--       write boundary. NULL when the credential declares none (the per-install
--       path today). M7 may prefer this over credential_ref when present.
--
--   DELIBERATELY decoupled from public.agent_accreditation (unlike
--   evaluated_actions, which FKs to it): a consulting credential may have no
--   accreditation row, and routing per-consult rows through agent_accreditation
--   would (a) FK-violate and (b) make them readable by Sage Reflect/Assent's
--   existing computeWindowSnapshot aggregator — an unintended read-back this
--   write-only half forbids. evaluated_actions is the reflect-close window store;
--   this is the per-consult reason-path store. Separate grains, separate tables.
--
-- ASSESSMENT PROJECTION (R17 minimisation; EvaluatedAction-shaped, structural):
--   the columns mirror evaluated_actions so M7 can reconstruct an EvaluatedAction
--   and feed computeWindowSnapshot UNCHANGED. The route projects the signed
--   Layer2Assessment via the canonical mapLayer2AssessmentToEvaluatedAction
--   bridge (PR15 reuse). Structural facts only — NOT the encrypted full
--   assessment (that is substrate_audit_narratives' job, R17b). passions_detected
--   is JSONB (KG7 — the array is passed directly, no JSON.stringify);
--   virtue_domains_engaged is a Postgres text[].
--
-- Related: FX-6 (B5), Rule 10 longitudinal inputs, D17 progression delta,
--   K1 composite-key ADR (2026-05-26), R17a (subject reads only its own — service
--   role mediates), R17c (genuine deletion — 90-day retain_until + the data-rights
--   delete path + the owner cascade), R3 (no end-user identity).
-- Decision log: D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12 (CI-5);
--   D-MECHANISM-CORRECTION-M6-... (this session).
--
-- Risk classification: schema — Standard (idempotent additive; reversible via the
--   rollback block). NOT Critical: no auth/session/R20a-perimeter change; no
--   existing table is altered.
-- Idempotent: safe to re-run (CREATE TABLE / INDEX / POLICY IF NOT EXISTS).

-- ============================================================================
-- 1. agent_assessment_history — per-consult agent trajectory (R17 lifecycle)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_assessment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Join key shared with substrate_audit_events / substrate_audit_narratives /
  -- the OTel trace and (on the API-key path) loop_billing_events. One history
  -- row per examination — UNIQUE makes the awaited write idempotent under retry.
  correlation_id UUID NOT NULL UNIQUE,

  -- Identity (credential-keyed; K1-aligned). See the header.
  credential_ref TEXT NOT NULL,
  owner_user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id       TEXT,

  -- The consult's depth tier (quick | standard | deep) — metadata for M7's
  -- proximity-calibrated depth (CI-15) and the trajectory read. Free-text +
  -- nullable on purpose (no CHECK): the route supplies a type-safe ReasonDepth,
  -- so a CHECK would never fire at runtime but would block a future depth tier.
  depth_tier TEXT,

  surface TEXT NOT NULL DEFAULT 'api_reason',

  -- The EvaluatedAction-shaped structural projection (mirrors evaluated_actions
  -- so M7 reuses rowToEvaluatedAction + computeWindowSnapshot).
  receipt_id TEXT NOT NULL,
  proximity TEXT NOT NULL CHECK (proximity IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),
  is_kathekon BOOLEAN NOT NULL,
  kathekon_quality TEXT NOT NULL CHECK (kathekon_quality IN (
    'strong', 'moderate', 'marginal', 'contrary'
  )),

  -- Passions detected (JSONB array — KG7).
  passions_detected JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Virtue domains engaged (Postgres text array).
  virtue_domains_engaged TEXT[] NOT NULL DEFAULT '{}',

  -- Oikeiosis tracking (primary relevant circle).
  oikeiosis_met BOOLEAN,
  oikeiosis_stage TEXT,

  -- Ruling faculty state.
  ruling_faculty_state TEXT NOT NULL DEFAULT '',

  -- Which surface/skill produced this evaluation ('api_reason').
  skill_id TEXT NOT NULL DEFAULT 'api_reason',

  -- Conservative deliberation-breadth baseline for a single per-consult call.
  candidates_considered INTEGER NOT NULL DEFAULT 1,

  -- Lifecycle.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- R17c: retention limit — 90 days (SR-12 / M1 precedent). For external-consumer
  -- rows (NULL owner_user_id; see that column) this is the PRIMARY genuine-deletion
  -- mechanism, so a trajectory-retention sweep that hard-deletes past retain_until
  -- is a named follow-up (mirrors the M1 narrative-sweep).
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);

-- M7 windowed read: an agent's most-recent rows by the stable credential handle,
-- date desc, bounded by created_at (90d) + LIMIT (30).
CREATE INDEX IF NOT EXISTS idx_aah_credential_time
  ON public.agent_assessment_history (credential_ref, created_at DESC);

-- M7 read by the declared K1 agent identity, when present.
CREATE INDEX IF NOT EXISTS idx_aah_agent_time
  ON public.agent_assessment_history (agent_id, created_at DESC)
  WHERE agent_id IS NOT NULL;

-- R17c/R17i data-rights path: delete/export an operator's rows.
CREATE INDEX IF NOT EXISTS idx_aah_owner
  ON public.agent_assessment_history (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- Retention backstop (hard-delete sweep on retain_until).
CREATE INDEX IF NOT EXISTS idx_aah_retain_until
  ON public.agent_assessment_history (retain_until);

-- ============================================================================
-- 2. Row-Level Security — service-role only (R17a; internal trajectory data,
--    no public read; the subject's isolation is mediated by the service role +
--    the credential-scoped queries in agent-assessment-history-store.ts).
-- ============================================================================

ALTER TABLE public.agent_assessment_history ENABLE ROW LEVEL SECURITY;

-- No permissive policies. The Supabase service role bypasses RLS and is the ONLY
-- reader/writer (agent-assessment-history-store.ts + the data-rights routes).
REVOKE ALL ON public.agent_assessment_history FROM PUBLIC;
REVOKE ALL ON public.agent_assessment_history FROM authenticated;
REVOKE ALL ON public.agent_assessment_history FROM anon;

-- ============================================================================
-- 3. In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.agent_assessment_history IS
  'CI-5 (M6, 2026-06-14): per-consult agent assessment history on /api/reason — '
  'the continuity half of the Character-Kernel claim (FX-6). One row per '
  'examination when SUBSTRATE_TRAJECTORY_WRITE_ENABLED. Keyed to the consulting '
  'credential (credential_ref) + operator (owner_user_id) + declared K1 agent '
  'identity (agent_id). EvaluatedAction-shaped structural projection so M7 reuses '
  'computeWindowSnapshot. WRITE-ONLY this half — no engine read-back (determinism '
  'untouched); M7 wires the windowed read. R17 lifecycle: 90-day retain_until, '
  'genuine deletion via /api/user/delete + the profiles cascade. Decoupled from '
  'agent_accreditation (separate grain from evaluated_actions).';

COMMENT ON COLUMN public.agent_assessment_history.credential_ref IS
  'Stable per-credential handle (api_key:<id> | install:<id>) — the M7 windowing '
  'key two consults on the same credential share. NOT NULL.';

COMMENT ON COLUMN public.agent_assessment_history.owner_user_id IS
  'The operator (K1 operator_account) — the credential owner (a developer, never '
  'an end-user, R3). Denormalised so the user-JWT data-rights paths (/api/user/'
  'delete R17c + /api/user/export R17i) reach rows owned by a WEB user; ON DELETE '
  'CASCADE from profiles is the backstop. NULL for external API consumers (sr_live_ '
  'keys carry no profiles-backed owner and the consumer is not a JWT user) — those '
  'rows are retention-limited by retain_until, with on-demand consumer erasure a '
  'named out-of-scope follow-up.';

COMMENT ON COLUMN public.agent_assessment_history.agent_id IS
  'The K1 declared agent_identity (namespace:name@version or legacy), validated '
  'via agent-id-vocabulary.ts at the write boundary. NULL when undeclared.';

-- ============================================================================
-- VERIFY — paste the output back to confirm (TEST first, then production at its
-- own founder-elected 0c-ii step).
-- ============================================================================

-- 1. Table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agent_assessment_history';

-- 2. Columns + types.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_assessment_history'
ORDER BY ordinal_position;

-- 3. Indexes (expect: pkey, the correlation_id unique, idx_aah_credential_time,
--    idx_aah_agent_time, idx_aah_owner, idx_aah_retain_until).
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'agent_assessment_history'
ORDER BY indexname;

-- 4. owner_user_id FK to profiles present.
SELECT conname, confrelid::regclass AS references
FROM pg_constraint
WHERE conrelid = 'public.agent_assessment_history'::regclass AND contype = 'f';

-- 5. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'agent_assessment_history';

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert)
-- ============================================================================
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.agent_assessment_history;
-- COMMIT;
