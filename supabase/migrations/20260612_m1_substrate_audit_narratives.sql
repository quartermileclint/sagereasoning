-- Migration: 20260612_m1_substrate_audit_narratives
-- Purpose: CI-1 + CI-17 (mechanism-correction M1) — server-side retention of the
--   Layer-3 audit narrative paired with its signed Layer2Assessment. One row per
--   completed examination on /api/reason when SUBSTRATE_L3_DEFER_ENABLED='true'
--   (election 4d: every examination — inline AND deferred). The narrative-existence
--   guarantee (Q2 / CI-17): a deferred consult's row is written 'pending' BEFORE
--   the response (awaited — KG1 rule 2) and completed by waitUntil or the
--   narrative-sweep cron backstop. "A verdict without a narrative account is a
--   classification, not an examination."
-- Related: B4 (dossier boundary row), FX-13, R17b/c/h/i (intimate-data posture —
--   founder elections 2026-06-12: 90-day retention; genuine hard deletion;
--   app-level encryption ON for assessment + narrative), R18e (Article-50 notice
--   stored with the prose), R18f (the retained signed assessment is the audit
--   pairing artifact).
-- Decision log: D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12 (CI-1/CI-17);
--   M1 session elections (founder, 2026-06-12).
--
-- DESIGN DIVERGENCE FROM substrate_audit_events (documented, deliberate): this
--   table is NOT append-only. Status transitions pending→retained/failed require
--   UPDATE; the R17c deletion path and retention expiry require hard DELETE. The
--   immutable record of the run remains substrate_audit_events; this table is the
--   retained artifact under an R17 lifecycle.
--
-- Encryption shape (ADR-ENCRYPTION-WIRING-01 §Decision 3, mirrors
--   open_deferrals / sage-reflect session-store): per encrypted field, a TEXT
--   ciphertext column + a companion JSONB encryption-meta column (plain object —
--   KG7). Key: MENTOR_ENCRYPTION_KEY (single server-side intimate-data key,
--   §Decision 2). Structural columns stay plaintext for sweep/audit queries.
--
-- Risk classification: Standard (idempotent additive schema; reversible via the
--   rollback block). NOT Critical — no auth/session/R20a-perimeter change.
-- Idempotent: safe to re-run (IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS).

-- ============================================================================
-- 1. substrate_audit_narratives — retained examination narratives (R17 lifecycle)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.substrate_audit_narratives (
  narrative_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Join key shared with substrate_audit_events, the OTel trace, and (on the
  -- API-key path) loop_billing_events. One narrative per examination.
  correlation_id    UUID NOT NULL UNIQUE,

  -- A10 per-install identity when present; NULL on user-auth. Never an
  -- end-user id (R3). Drives the R17 deletion path (delete by agent).
  agent_id          TEXT,

  surface           TEXT NOT NULL DEFAULT 'api_reason',
  consumer          TEXT NOT NULL DEFAULT 'api_reason',

  -- Lifecycle: 'pending' (assessment retained; narrative owed — written before
  -- the response on the deferred path), 'retained' (narrative generated and
  -- stored), 'failed' (generation attempts exhausted; sweep retries while
  -- attempts < 3).
  narrative_status  TEXT NOT NULL DEFAULT 'pending',
  attempts          INTEGER NOT NULL DEFAULT 0,

  -- R17b: the Layer2Assessment (signed wrapper when signing enabled) —
  -- encrypted. The audit-pairing artifact (R18f); also the sweep's input for
  -- regenerating the narrative.
  assessment_ciphertext      TEXT NOT NULL,
  assessment_encryption_meta JSONB NOT NULL,

  -- R17b: the Layer3Prose object — encrypted. NULL until retained.
  narrative_ciphertext       TEXT,
  narrative_encryption_meta  JSONB,

  -- R18e Article-50 transparency notice carried with the prose (plaintext —
  -- it is a static notice, not intimate content). Stamped at completion from
  -- R18E_ARTICLE_50_TRANSPARENCY_NOTICE.
  article50_notice  TEXT,

  -- 'llm' | 'fallback' (deterministic fallback prose). NULL until retained.
  prose_source      TEXT,

  -- Whether the narrative was generated inline (response_format 'full') or
  -- deferred out of the hot path ('assessment_first' / sweep-completed).
  generation_mode   TEXT NOT NULL DEFAULT 'inline',

  -- Deferred Layer-3 cost lands HERE, against the same correlation/loop id —
  -- the Option-D billing ledger row is never mutated (election 3, metering).
  layer3_cost_usd_microcents BIGINT,
  layer3_latency_ms          INTEGER,

  generated_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- R17c: retention limit — founder election 4a: 90 days (SR-12 precedent).
  -- The narrative-sweep hard-deletes rows past this timestamp.
  retain_until      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  CONSTRAINT san_status_valid
    CHECK (narrative_status IN ('pending', 'retained', 'failed')),

  CONSTRAINT san_prose_source_valid
    CHECK (prose_source IS NULL OR prose_source IN ('llm', 'fallback')),

  CONSTRAINT san_generation_mode_valid
    CHECK (generation_mode IN ('inline', 'deferred', 'sweep')),

  -- A retained row must actually carry its narrative + notice.
  CONSTRAINT san_retained_complete
    CHECK (
      narrative_status <> 'retained'
      OR (
        narrative_ciphertext IS NOT NULL
        AND narrative_encryption_meta IS NOT NULL
        AND article50_notice IS NOT NULL
        AND prose_source IS NOT NULL
      )
    )
);

CREATE INDEX IF NOT EXISTS idx_san_status_created
  ON public.substrate_audit_narratives (narrative_status, created_at)
  WHERE narrative_status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS idx_san_agent_id
  ON public.substrate_audit_narratives (agent_id)
  WHERE agent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_san_retain_until
  ON public.substrate_audit_narratives (retain_until);

-- ============================================================================
-- 2. Row-Level Security — service-role only (no client read or write; the
--    public retrieval surface is deliberately deferred — R17a auth design is
--    its own later session)
-- ============================================================================

ALTER TABLE public.substrate_audit_narratives ENABLE ROW LEVEL SECURITY;

-- No permissive policies. The Supabase service role bypasses RLS and is the
-- ONLY reader/writer (narrative-retention.ts + the narrative-sweep cron).

REVOKE ALL ON public.substrate_audit_narratives FROM PUBLIC;
REVOKE ALL ON public.substrate_audit_narratives FROM authenticated;
REVOKE ALL ON public.substrate_audit_narratives FROM anon;

-- ============================================================================
-- 3. In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.substrate_audit_narratives IS
  'CI-1/CI-17 (M1, 2026-06-12): retained Layer-3 audit narratives paired with '
  'their signed Layer2Assessments. One row per examination when '
  'SUBSTRATE_L3_DEFER_ENABLED. Narrative-existence guarantee (Q2): pending rows '
  'are written before the response and completed by waitUntil or the '
  'narrative-sweep cron. R17 lifecycle: 90-day retention (retain_until), hard '
  'deletion, app-level encryption (MENTOR_ENCRYPTION_KEY) on assessment + '
  'narrative. NOT append-only by design — the immutable run record is '
  'substrate_audit_events.';

COMMENT ON COLUMN public.substrate_audit_narratives.correlation_id IS
  'Join key with substrate_audit_events / loop_billing_events / the OTel trace. '
  'UNIQUE — one narrative per examination.';

COMMENT ON COLUMN public.substrate_audit_narratives.layer3_cost_usd_microcents IS
  'Deferred Layer-3 cost recorded against the loop WITHOUT mutating the Option-D '
  'billing ledger (M1 election 3): the loop''s full cost is reconstructable by '
  'joining loop_billing_events to this table on correlation_id.';

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert)
-- ============================================================================
--
-- PRECONDITION (M1 activation, 2026-06-15): if SUBSTRATE_L3_DEFER_ENABLED is
--   live, UNSET it in Vercel + redeploy FIRST (so no retention write is in
--   flight), confirm no new rows are landing, and only THEN run the DROP.
--   Dropping while the defer flag is on silently loses retention writes — the
--   route's insertPendingNarrative/insertRetainedNarrative would fail-honest
--   (ok:false), so the consult still 200s but the CI-17 narrative is lost.
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.substrate_audit_narratives;
-- COMMIT;
