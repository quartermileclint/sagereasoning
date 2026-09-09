-- ============================================================================
-- Cognitive OS - the CORE SLICE table step (Phase 1 state persistence)
--
-- Authored 2026-09-09 (dated from `date`, not from conversation context).
-- Tier: code-critical, founder-walked. AC7 engages. AUTHOR ONLY - DO NOT APPLY
-- from a session. Application is TEST first, then production, with every
-- section VERIFY output read.
--
-- ----------------------------------------------------------------------------
-- WHAT THIS PERSISTS, AND WHY EACH
-- ----------------------------------------------------------------------------
-- Determined by reading `website/src/lib/cognitive-os/` (nine components), not
-- the spec. Not everything needs a table:
--
--   PERSISTED here (the core slice, founder-elected 2026-09-09):
--     * cognitive_contexts      - the OWNERSHIP ROOT. See "the ownership axis".
--     * cognitive_events        - event-store.ts. The authoritative history.
--                                 Decision status is DERIVED from this log
--                                 (the 3.4(b) ruling: "status derived from the
--                                 event log, record never edited"), so the log
--                                 is the one thing that cannot be recomputed.
--     * cognitive_claims        - claim.ts. Durable entities referenced by
--                                 belief states, decisions and envelopes.
--     * cognitive_belief_states - belief-state.ts. Carries the AUTHORITATIVE
--                                 epistemic_debt COMPONENTS (Constraint 4).
--
--   DEFERRED to a second walked migration (founder-elected: core slice first):
--     * decisions (belief-revision.ts DecisionRecord)
--     * handoffs (handoff-envelope.ts HandoffEnvelope)
--     * dependency nodes + edges (dependency-graph.ts)
--
--   DELIBERATELY NOT PERSISTED, AT ALL:
--     * types.ts            - pure types and pure functions. Nothing to store.
--     * truth-maintenance.ts - StalenessAnalysis / AffectedItem / ReExamination
--                             are DERIVED analyses, recomputed from the graph
--                             and the event log on demand. Persisting a derived
--                             analysis would create a second source of truth
--                             that can silently disagree with the log.
--     * permissions.ts      - PERMISSION_GRANTS is a static table IN CODE.
--                             Persisting it would make the permission model
--                             runtime-mutable, which directly undermines Q10
--                             (an agent must not be able to write the scores
--                             that route it) and Q9 (machine-enforced, not
--                             convention). Grants stay in code on purpose.
--
-- ----------------------------------------------------------------------------
-- THE OWNERSHIP AXIS - WHY THIS MIGRATION INTRODUCES ONE
-- ----------------------------------------------------------------------------
-- The Phase-1 library carries NO ownership field. Not a weak one: none.
-- `Claim.provenance.created_by` and `CognitiveEvent.caused_by` are free-form
-- service strings ("analysis-service", "evidence-intake", "tms"). There is no
-- owner_user_id, no credential_ref and no tenant anywhere in the nine
-- components. R17's four routes all key on one or the other, so the table step
-- must INTRODUCE the axis. That is precisely what the Q-R6 ruling ("this must
-- be on the table step's opening surface, not discovered after the migration is
-- written") exists to force, and it was found by designing the data-rights
-- wiring BEFORE the schema.
--
-- FOUNDER ELECTION 2026-09-09: a SINGLE SCOPING ROOT. `cognitive_contexts`
-- carries owner_user_id + credential_ref; every other table FKs to it with
-- ON DELETE CASCADE. Chosen over repeating the two identity columns on each
-- table because it makes the R17 obligation STRUCTURAL: a future eighth
-- cognitive-os table cannot silently miss data-rights, since it cannot exist
-- without a context FK.
--
-- ** THE CASCADE IS A BACKSTOP, NEVER THE MECHANISM. ** This project's standing
-- discipline is that "erasure is verified by query, never inferred from a
-- cascade" (the watching-delete precedent). `store.ts` therefore deletes every
-- child table EXPLICITLY and counts the rows, and the FK cascade only catches
-- what an explicit delete would have missed.
--
-- The identity CHECK (`cognitive_contexts_identity_present`) requires at least
-- one of the two identity columns. That makes "every persisted cognitive-os row
-- is reachable by at least one R17 path" a STRUCTURAL property rather than a
-- convention - the same discipline Q9 demands for its own boundary, and the
-- class of defect this project was bitten by four times on 2026-08-16.
-- DISCLOSED CONSEQUENCE: a genuinely ownerless system-internal context cannot be
-- created. If one is ever needed, that is a deliberate, reviewed schema change,
-- not a silent NULL. Conservative direction, chosen on purpose.
--
-- ----------------------------------------------------------------------------
-- WHAT IS NOT HERE, AND WHY - NO COGNITIVE OS SCALAR IS PERSISTED
-- ----------------------------------------------------------------------------
-- There is NO epistemic_debt_score column, and no identity_coherence_score
-- column, anywhere in this migration. Three rulings converge on that:
--
--   Q-R7 (2026-09-09): EpistemicDebtScore is ORDINAL, not cardinal, at Phase 2;
--     "prefer persisting the structured components and re-deriving the summary".
--     The five debt COMPONENT columns on cognitive_belief_states are exactly
--     those components; `deriveEpistemicDebtScore` recomputes the summary.
--
--   Q9 (2026-09-08): the internal-only scalars must be MACHINE-ENFORCED
--     internal - "not internal-by-convention while being accessible via an API
--     route a consumer could call". /api/user/export IS such a route, and this
--     project's standing export pattern is select('*') on whole raw rows. A
--     persisted score would therefore have been handed back through R17.
--     Persisting no scalar closes that BY CONSTRUCTION: there is nothing at
--     rest to leak, so the export needs no projection it could later forget.
--
--   Q7 (2026-09-08): no Cognitive OS scalar may be combined with a proximity
--     rank. A column that does not exist cannot be combined with anything.
--
-- C3 IS ENCODED STRUCTURALLY, NOT DOCUMENTED: `cognitive_claims.confidence` is
-- TEXT with a CHECK over the five ordinal ranks plus not_yet_assessed. A
-- cardinal [0,1] confidence is not merely discouraged - it CANNOT BE STORED.
--
-- C6 IS ENCODED BY ABSENCE: there is no identity_relevance column and no
-- interpretive_context column. Not null-filled, not 0.0, not a placeholder.
-- Absent, per the caller_class lesson. They arrive at Phase 3 or not at all.
--
-- ----------------------------------------------------------------------------
-- THE Q1 HARD CONSTRAINT IS ENCODED IN THE SCHEMA
-- ----------------------------------------------------------------------------
-- `cognitive_events_execute_names_external_executor` makes an EXECUTE row
-- unstorable unless it names the EXTERNAL party that performed the act. The
-- loop proposes; it never executes - and an EXECUTE event is a record OF an
-- outside act, never an authorisation of one. A procedural rule can be
-- forgotten; a CHECK constraint cannot.
--
-- ----------------------------------------------------------------------------
-- RLS, GRANTS, AND SECURITY DEFINER
-- ----------------------------------------------------------------------------
-- Service-role-only, in the shape proven by the four 2026-08-16 lockdowns:
-- RLS ENABLED with ZERO permissive policies, PLUS explicit REVOKE ALL from
-- PUBLIC, anon and authenticated. Both halves are required. A policy whose NAME
-- says service role while its SQL says USING (true) with no TO clause applies to
-- every role - that is exactly how founder_conversations leaked 2,201 rows to
-- any anon-key holder. There are no policies here to get that wrong.
--
-- SECURITY DEFINER cross-check RUN 2026-09-09 (mandate step 5).
--
-- ** THE COMMAND BELOW IS THE ONE THAT REPRODUCES THESE NUMBERS. ** An earlier
-- draft of this header quoted a narrower path list than the sweep actually used,
-- so re-running it as written returned a different, smaller answer - caught by
-- independent review. Recorded honestly rather than corrected silently, because
-- a stated piece of evidence that does not reproduce is worse than none.
--
--   grep -rn  "SECURITY DEFINER" --include="*.sql" .   # hits
--   grep -rln "SECURITY DEFINER" --include="*.sql" .   # files
--
-- Excluding THIS file (which discusses the phrase and so matches it), the sweep
-- returns 18 hits across 12 .sql files - among them
-- increment_structured_observation_count (mentor_profiles),
-- revoke_atl_credentials_on_profile_delete (api_keys), and one in
-- supabase-v3-migration.sql.
--
-- THE LOAD-BEARING RESULT: of those 12 files, ZERO mention any cognitive_ table
--   grep -rl "SECURITY DEFINER" --include="*.sql" . | xargs grep -l "cognitive_"
-- returns only this file. None could write one in any case, since these tables
-- do not exist until this migration runs.
--
-- THIS MIGRATION CREATES NO SECURITY DEFINER FUNCTION: the append-only trigger
-- function below is deliberately plain, so it runs as invoker and a table-level
-- REVOKE is not invisible to it - the mentor_profiles RPC defect of 2026-08-16.
--
-- ----------------------------------------------------------------------------
-- RETENTION
-- ----------------------------------------------------------------------------
-- Every table carries a 90-day retain_until, on the footing collaboration_records
-- and the trust core already use. The sweep is
-- GET /api/cron/cognitive-os-retention-sweep, gated by its OWN kill-switch
-- (SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED). It is deliberately NOT folded into the
-- trust-core sweep: that would make cognitive-os retention depend on a
-- trust-layer flag, and "a shared base flag makes dark a per-flag claim, not a
-- per-feature claim" is a lesson this project has already paid for.
-- FOR CREDENTIAL-KEYED CONTEXTS WITH NO OWNER, THE SWEEP IS THE ONLY AUTOMATIC
-- DELETION MECHANISM - those rows are unreachable by the user-JWT paths.
--
-- ----------------------------------------------------------------------------
-- PROPERTIES
-- ----------------------------------------------------------------------------
-- Additive (creates only; alters nothing existing), idempotent (safe to re-run),
-- reversible (see the INVERSE section). Applying it changes NO existing table,
-- NO existing route and NO existing behaviour: until store.ts is called, these
-- tables are empty and inert, and the always-on data-rights reads treat a
-- missing table as benign so they are safe BEFORE this lands as well as after.
--
-- NOTE ON NON-ASCII: every SQL STRING LITERAL below is pure ASCII on purpose.
-- The Supabase SQL editor has corrupted non-ASCII on paste before (an em dash
-- arriving as three characters). Section markers in `--` comments are cosmetic
-- and safe; stored literals are not.
-- ============================================================================


-- ============================================================================
-- §PRE - run BEFORE applying. TEST first, then production. Read every output.
-- ============================================================================
--
-- P1. The four tables must NOT already exist. Expect ZERO rows.
--
--   SELECT table_name
--     FROM information_schema.tables
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_contexts', 'cognitive_events',
--                         'cognitive_claims', 'cognitive_belief_states')
--    ORDER BY table_name;
--
--   If any row comes back, STOP. A partial prior application is a different
--   situation from a clean create and must be diagnosed, not overwritten.
--
-- P2. `profiles` must exist (the ownership FK target). Expect exactly 1.
--
--   SELECT count(*) AS profiles_table_present
--     FROM information_schema.tables
--    WHERE table_schema = 'public' AND table_name = 'profiles';
--
-- P3. gen_random_uuid() must be available. Expect one uuid value.
--
--   SELECT gen_random_uuid() AS uuid_available;
--
-- P4. Record the pre-state so VERIFY can prove nothing else was touched.
--
--   SELECT count(*) AS public_tables_before
--     FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================================================


-- ============================================================================
-- §APPLY
-- ============================================================================

-- ----------------------------------------------------------------------------
-- §1  cognitive_contexts - the ownership root
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cognitive_contexts (
  context_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The R17 ownership axis. Introduced HERE because the library has none.
  -- owner_user_id  -> the human/operator account (profiles.id).
  -- credential_ref -> 'api_key:<id>' | 'install:<id>' for agent-created work.
  -- Keyed by credential_ref EXACTLY, never by agent_id (the reflect precedent's
  -- disclosed shared-agent_id overreach).
  owner_user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref  TEXT,

  -- Free-text handle for humans reading the table. Never load-bearing.
  label           TEXT NOT NULL DEFAULT '',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- Every row must be reachable by at least one R17 path. See the header.
  CONSTRAINT cognitive_contexts_identity_present
    CHECK (owner_user_id IS NOT NULL OR credential_ref IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_cc_owner
  ON public.cognitive_contexts (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cc_credential
  ON public.cognitive_contexts (credential_ref)
  WHERE credential_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cc_retain_until
  ON public.cognitive_contexts (retain_until);

-- ----------------------------------------------------------------------------
-- §2  cognitive_events - the append-only authoritative history
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cognitive_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id      UUID NOT NULL
                    REFERENCES public.cognitive_contexts(context_id) ON DELETE CASCADE,

  -- The library's own identifier (event-store.ts EventId), unique per context.
  event_id        TEXT NOT NULL,

  -- THE AUTHORITATIVE ORDERING. `occurred_at` is descriptive and is never
  -- compared (AE-2 precedent: a wall clock cannot be trusted to order events).
  seq             BIGINT NOT NULL,

  event_type      TEXT NOT NULL CHECK (event_type IN (
                    'OBSERVE', 'RETRIEVE', 'INFER', 'COMMUNICATE', 'CORRECT',
                    'CHALLENGE', 'RETRACT', 'REINSTATE', 'COMMIT', 'EXECUTE',
                    'REVIEW'
                  )),

  -- DESCRIPTIVE ONLY. Never an ordering key. Named occurred_at rather than
  -- `timestamp` so no quoting is needed and the descriptive role is legible.
  occurred_at     TIMESTAMPTZ,

  -- A PERMISSION SCOPE, not an actor (C2). Phase 1 instantiates no actors.
  -- Q-R2 (2026-09-09) ruled TWO vocabularies: these stay permission-scope
  -- identifiers and are NOT unified with the twelve-environment room names.
  scope           TEXT NOT NULL CHECK (scope IN (
                    'Laboratory', 'Attic', 'Archive', 'Threshold'
                  )),

  -- Free-form service/agent string for traceability (Constraint 10). NOT an
  -- ownership axis - that is cognitive_contexts.
  caused_by       TEXT NOT NULL,

  claim_id        TEXT,
  decision_id     TEXT,

  previous_state_version INTEGER,
  new_state_version      INTEGER,

  reason              TEXT NOT NULL,
  causal_dependencies TEXT[] NOT NULL DEFAULT '{}',

  -- Required on EXECUTE and only meaningful there. See the CHECK below.
  external_executor   TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  CONSTRAINT cognitive_events_event_id_unique UNIQUE (context_id, event_id),

  -- seq is the authoritative ordering, so it must be unique within a context.
  CONSTRAINT cognitive_events_seq_unique UNIQUE (context_id, seq),

  -- THE Q1 HARD CONSTRAINT, MADE STRUCTURAL. An EXECUTE row records an act
  -- performed OUTSIDE this system and must name the external party that
  -- performed it. Without a named executor the row would read as the loop
  -- having executed something, which it never does.
  CONSTRAINT cognitive_events_execute_names_external_executor
    CHECK (event_type <> 'EXECUTE' OR external_executor IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_ce_context_seq
  ON public.cognitive_events (context_id, seq);

CREATE INDEX IF NOT EXISTS idx_ce_claim
  ON public.cognitive_events (context_id, claim_id)
  WHERE claim_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ce_retain_until
  ON public.cognitive_events (retain_until);

-- APPEND-ONLY. UPDATE is forbidden by trigger, mirroring agent_trust_events.
-- DELETE is deliberately ALLOWED: it is how R17c erasure and the retention
-- sweep do their work, and forbidding it would make the table undeletable.
-- Plain function, NOT SECURITY DEFINER - so it runs as invoker and cannot
-- become the kind of privilege hole a table-level REVOKE is blind to.
CREATE OR REPLACE FUNCTION public.cognitive_events_forbid_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'cognitive_events is append-only; UPDATE is forbidden (the authoritative history from which decision status is derived)';
END;
$$;

DROP TRIGGER IF EXISTS trg_ce_forbid_update ON public.cognitive_events;
CREATE TRIGGER trg_ce_forbid_update
  BEFORE UPDATE ON public.cognitive_events
  FOR EACH ROW EXECUTE FUNCTION public.cognitive_events_forbid_update();

-- ----------------------------------------------------------------------------
-- §3  cognitive_claims
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cognitive_claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id      UUID NOT NULL
                    REFERENCES public.cognitive_contexts(context_id) ON DELETE CASCADE,

  claim_id        TEXT NOT NULL,
  content         TEXT NOT NULL,

  epistemic_status TEXT NOT NULL CHECK (epistemic_status IN (
                    'asserted', 'defeasible', 'under_challenge', 'retracted',
                    'reinstated', 'superseded', 'stale'
                  )),

  -- C3 ENCODED STRUCTURALLY: ORDINAL, never cardinal. A [0,1] confidence
  -- cannot be stored in this column. 'not_yet_assessed' is NOT a rank - it is
  -- the explicit non-measurement, distinct from 'unsupported' (which means
  -- provenance WAS examined and supports nothing).
  confidence      TEXT NOT NULL CHECK (confidence IN (
                    'unsupported', 'weak', 'moderate', 'strong', 'established',
                    'not_yet_assessed'
                  )),

  -- The ordinal uncertainty band. ABSENT when confidence is not measured:
  -- a band around an unmeasured value would itself be a false measurement.
  uncertainty_lower TEXT CHECK (uncertainty_lower IN (
                      'unsupported', 'weak', 'moderate', 'strong', 'established'
                    )),
  uncertainty_upper TEXT CHECK (uncertainty_upper IN (
                      'unsupported', 'weak', 'moderate', 'strong', 'established'
                    )),

  -- Provenance is the ONLY input to confidence (C4). created_by is recorded for
  -- traceability and is NEVER an input to confidence.
  provenance_source_ids TEXT[] NOT NULL DEFAULT '{}',
  -- EvidenceRef[]: evidence_id, verification, attested_by{verifier_id, kind}.
  -- Phase 1 ships NO verifier, so every attestation is kind
  -- 'unverified_phase1' - the absence of verification stays legible in the row
  -- rather than being indistinguishable from a verified one.
  provenance_evidence   JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by            TEXT NOT NULL,
  provenance_created_at TIMESTAMPTZ NOT NULL,

  dependency_graph_id  TEXT NOT NULL,
  belief_state_id      TEXT NOT NULL,
  belief_state_version INTEGER NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- C6: NO identity_relevance column and NO interpretive_context column.
  -- Absent, not null-filled, not 0.0. They arrive at Phase 3 or not at all.

  CONSTRAINT cognitive_claims_claim_id_unique UNIQUE (context_id, claim_id),

  -- The band is present EXACTLY when confidence is measured. Verified against
  -- both library paths that produce a claim (createClaim and withProvenance):
  -- deriveUncertaintyBand returns undefined if and only if the confidence is
  -- not measured, so this biconditional cannot block a legitimate write.
  CONSTRAINT cognitive_claims_band_iff_measured
    CHECK ((confidence = 'not_yet_assessed') = (uncertainty_lower IS NULL)),

  CONSTRAINT cognitive_claims_band_both_or_neither
    CHECK ((uncertainty_lower IS NULL) = (uncertainty_upper IS NULL)),

  -- The band never inverts. array_position is IMMUTABLE, so it is legal in a
  -- CHECK, and this encodes the ordinal ORDER rather than merely the vocabulary.
  CONSTRAINT cognitive_claims_band_ordered
    CHECK (
      uncertainty_lower IS NULL
      OR array_position(
           ARRAY['unsupported','weak','moderate','strong','established']::text[],
           uncertainty_lower
         )
         <= array_position(
              ARRAY['unsupported','weak','moderate','strong','established']::text[],
              uncertainty_upper
            )
    )
);

CREATE INDEX IF NOT EXISTS idx_ccl_context
  ON public.cognitive_claims (context_id);

CREATE INDEX IF NOT EXISTS idx_ccl_belief_state
  ON public.cognitive_claims (context_id, belief_state_id, belief_state_version);

CREATE INDEX IF NOT EXISTS idx_ccl_retain_until
  ON public.cognitive_claims (retain_until);

-- ----------------------------------------------------------------------------
-- §4  cognitive_belief_states - the versioned fold, debt COMPONENTS only
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cognitive_belief_states (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id      UUID NOT NULL
                    REFERENCES public.cognitive_contexts(context_id) ON DELETE CASCADE,

  belief_state_id TEXT NOT NULL,
  version         INTEGER NOT NULL,

  -- Descriptive only, like cognitive_events.occurred_at. `version` orders.
  occurred_at     TIMESTAMPTZ,

  revision_events     TEXT[] NOT NULL DEFAULT '{}',
  active_dependencies TEXT[] NOT NULL DEFAULT '{}',

  -- THE AUTHORITATIVE EPISTEMIC DEBT (Constraint 4), stored as its five
  -- COMPONENTS. There is deliberately NO score column: Q-R7 prefers persisting
  -- the components and re-deriving the summary, and persisting no scalar also
  -- closes the Q9-vs-R17-export collision by construction. Callers recompute
  -- the summary with deriveEpistemicDebtScore.
  debt_unresolved_claims       TEXT[] NOT NULL DEFAULT '{}',
  debt_unsupported_assumptions TEXT[] NOT NULL DEFAULT '{}',
  -- Pairs of contradicting claim ids: [["claim-a","claim-b"], ...].
  debt_contradictions          JSONB  NOT NULL DEFAULT '[]'::jsonb,
  debt_stale_evidence          TEXT[] NOT NULL DEFAULT '{}',
  debt_pending_revisions       TEXT[] NOT NULL DEFAULT '{}',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  CONSTRAINT cognitive_belief_states_version_unique
    UNIQUE (context_id, belief_state_id, version),

  CONSTRAINT cognitive_belief_states_version_nonnegative
    CHECK (version >= 0),

  -- Contradictions are PAIRS of claim ids: [["claim-a","claim-b"], ...].
  --
  -- DISCLOSED LIMIT (PR19, 2026-09-09): this CHECK constrains the TOP-LEVEL
  -- shape only. It does not verify that each element is a two-string array,
  -- because a per-element check needs an aggregate over jsonb_array_elements and
  -- a CHECK constraint may not contain one. The element shape therefore rests on
  -- the typed pure library being the only writer (EpistemicDebt.contradictions
  -- is `readonly (readonly [ClaimId, ClaimId])[]`). IF A LATER SLICE EVER
  -- ACCEPTS THIS FIELD FROM OUTSIDE THAT LIBRARY, the element shape needs its
  -- own enforcement - an IMMUTABLE validator function, or validation at the
  -- write boundary. Named rather than left to be assumed.
  CONSTRAINT cognitive_belief_states_contradictions_is_array
    CHECK (jsonb_typeof(debt_contradictions) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_cbs_context
  ON public.cognitive_belief_states (context_id);

CREATE INDEX IF NOT EXISTS idx_cbs_retain_until
  ON public.cognitive_belief_states (retain_until);

-- ----------------------------------------------------------------------------
-- §5  RLS - service-role-only, in the 2026-08-16 proven shape
-- ----------------------------------------------------------------------------
-- RLS ENABLED with ZERO permissive policies, PLUS explicit REVOKEs. Both halves.
-- The service role bypasses RLS and is the only reader/writer (store.ts and the
-- data-rights routes). No practitioner and no agent reaches these tables
-- directly - all access is mediated by a route.

ALTER TABLE public.cognitive_contexts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_claims        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_belief_states ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cognitive_contexts      FROM PUBLIC;
REVOKE ALL ON public.cognitive_contexts      FROM anon;
REVOKE ALL ON public.cognitive_contexts      FROM authenticated;

REVOKE ALL ON public.cognitive_events        FROM PUBLIC;
REVOKE ALL ON public.cognitive_events        FROM anon;
REVOKE ALL ON public.cognitive_events        FROM authenticated;

REVOKE ALL ON public.cognitive_claims        FROM PUBLIC;
REVOKE ALL ON public.cognitive_claims        FROM anon;
REVOKE ALL ON public.cognitive_claims        FROM authenticated;

REVOKE ALL ON public.cognitive_belief_states FROM PUBLIC;
REVOKE ALL ON public.cognitive_belief_states FROM anon;
REVOKE ALL ON public.cognitive_belief_states FROM authenticated;

GRANT ALL ON public.cognitive_contexts      TO service_role;
GRANT ALL ON public.cognitive_events        TO service_role;
GRANT ALL ON public.cognitive_claims        TO service_role;
GRANT ALL ON public.cognitive_belief_states TO service_role;

-- ----------------------------------------------------------------------------
-- §6  In-schema documentation
-- ----------------------------------------------------------------------------

COMMENT ON TABLE public.cognitive_contexts IS
  'Cognitive OS core slice (2026-09-09): the OWNERSHIP ROOT for all cognitive-os '
  'state. The Phase-1 library carries no ownership field, so the axis is '
  'introduced here (founder election: single scoping root). Every other '
  'cognitive_* table FKs to this one ON DELETE CASCADE, which makes the R17 '
  'data-rights obligation structural - a new cognitive-os table cannot exist '
  'without an ownership path. The cascade is a BACKSTOP: store.ts deletes every '
  'child explicitly and counts rows, because erasure is verified by query and '
  'never inferred from a cascade. R17 lifecycle: 90-day retain_until plus '
  'genuine deletion via /api/user/delete and /api/credential/erase.';

COMMENT ON CONSTRAINT cognitive_contexts_identity_present ON public.cognitive_contexts IS
  'Every row must be reachable by at least one R17 path. Requiring an identity '
  'makes that a structural property, not a convention. A genuinely ownerless '
  'system-internal context is therefore not creatable; if one is ever needed '
  'that is a deliberate reviewed schema change, not a silent NULL.';

COMMENT ON TABLE public.cognitive_events IS
  'Cognitive OS core slice (2026-09-09): the APPEND-ONLY authoritative history. '
  'Decision status is DERIVED from this log and the record is never edited, so '
  'UPDATE is forbidden by trigger while DELETE stays available for R17c erasure '
  'and the retention sweep. seq is the authoritative ordering; occurred_at is '
  'descriptive and is never compared (AE-2 precedent).';

COMMENT ON CONSTRAINT cognitive_events_execute_names_external_executor ON public.cognitive_events IS
  'The Q1 hard constraint made structural: the loop proposes, it never executes. '
  'An EXECUTE row records an act performed OUTSIDE this system and must name the '
  'external party that performed it. A procedural rule can be forgotten; this '
  'cannot.';

COMMENT ON COLUMN public.cognitive_events.scope IS
  'A PERMISSION SCOPE, never an actor (C2). Q-R2 (2026-09-09) ruled TWO '
  'vocabularies: these four names stay permission-scope identifiers and are NOT '
  'unified with the twelve-environment room names, because a shared name across '
  'different trust postures produces false impressions.';

COMMENT ON TABLE public.cognitive_claims IS
  'Cognitive OS core slice (2026-09-09): durable claims. Confidence is ORDINAL '
  'and derived from provenance only (C3, C4) - a cardinal [0,1] value cannot be '
  'stored. identity_relevance and interpretive_context are ABSENT rather than '
  'null-filled (C6, the caller_class lesson). Phase 1 ships no verifier, so '
  'every attestation in provenance_evidence is kind unverified_phase1.';

COMMENT ON COLUMN public.cognitive_claims.confidence IS
  'ORDINAL (C3). not_yet_assessed is the explicit NON-measurement and is not a '
  'rank; unsupported means provenance was examined and supports nothing. The '
  'two are different facts and must not be conflated.';

COMMENT ON TABLE public.cognitive_belief_states IS
  'Cognitive OS core slice (2026-09-09): the versioned belief-state fold. Stores '
  'the AUTHORITATIVE epistemic debt as its five COMPONENTS and deliberately '
  'stores NO summary score. Q-R7 prefers components with the summary re-derived; '
  'persisting no Cognitive OS scalar also closes the Q9-vs-R17-export collision '
  'by construction, since there is nothing at rest for an export to leak.';


-- ============================================================================
-- §VERIFY - run AFTER applying. TEST first; all green before production.
-- ============================================================================
--
-- V1. All four tables exist. Expect exactly 4 rows.
--
--   SELECT table_name
--     FROM information_schema.tables
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_contexts', 'cognitive_events',
--                         'cognitive_claims', 'cognitive_belief_states')
--    ORDER BY table_name;
--
-- V2. RLS is ENABLED on all four AND there are ZERO policies. BOTH halves
--     matter: an "enabled" table with a permissive USING (true) policy is the
--     founder_conversations defect. Expect relrowsecurity = true four times,
--     and policy_count = 0 four times.
--
--   SELECT c.relname, c.relrowsecurity,
--          (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count
--     FROM pg_class c
--     JOIN pg_namespace n ON n.oid = c.relnamespace
--    WHERE n.nspname = 'public'
--      AND c.relname IN ('cognitive_contexts', 'cognitive_events',
--                        'cognitive_claims', 'cognitive_belief_states')
--    ORDER BY c.relname;
--
-- V3. GRANTS. ** THE CHECK IS A NEGATIVE ONE. ** Expect ZERO rows.
--
--     CORRECTED 2026-09-09, mid-walk: an earlier version of this step listed ALL
--     grantees and said "expect ONLY service_role rows". THAT WAS WRONG and would
--     make a correctly-locked-down table look broken. `postgres` is the table
--     OWNER, and an owner's privileges are implicit and always reported here; they
--     cannot meaningfully be revoked (the owner can re-grant at will, and revoking
--     would break migrations). Owner grants are ALSO not an exposure path: PostgREST
--     connects as `authenticator` and SET ROLEs to anon/authenticated/service_role -
--     never to `postgres`.
--
--     So the question is not "who appears" but "do the API roles appear". All three
--     prior lockdown migrations (impulse, founder_conversations, open-insert) ask it
--     exactly this way; this step now matches them.
--
--   SELECT table_name, grantee, privilege_type
--     FROM information_schema.role_table_grants
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_contexts', 'cognitive_events',
--                         'cognitive_claims', 'cognitive_belief_states')
--      AND grantee IN ('anon', 'authenticated', 'PUBLIC')
--    ORDER BY table_name, grantee, privilege_type;
--
--   ANY row is a failure - the REVOKE did not take. Zero rows is the pass.
--
--   Optionally, to confirm the POSITIVE half separately (expect 4 rows, one per
--   table, each with the full privilege list):
--
--   SELECT table_name, string_agg(privilege_type, ',' ORDER BY privilege_type) AS privs
--     FROM information_schema.role_table_grants
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_contexts', 'cognitive_events',
--                         'cognitive_claims', 'cognitive_belief_states')
--      AND grantee = 'service_role'
--    GROUP BY table_name ORDER BY table_name;
--
-- V4. The ownership FK exists and CASCADES. Expect one row, confdeltype = 'c'.
--
--   SELECT conname, confdeltype
--     FROM pg_constraint
--    WHERE conrelid = 'public.cognitive_contexts'::regclass AND contype = 'f';
--
-- V5. The three child FKs exist and CASCADE. Expect three rows, all 'c'.
--
--   SELECT conrelid::regclass AS child, conname, confdeltype
--     FROM pg_constraint
--    WHERE confrelid = 'public.cognitive_contexts'::regclass AND contype = 'f'
--    ORDER BY child;
--
-- V6. The append-only trigger exists.
--
--   SELECT tgname FROM pg_trigger
--    WHERE tgrelid = 'public.cognitive_events'::regclass AND NOT tgisinternal;
--
-- V7. NO score column anywhere. Expect ZERO rows. This is the Q9/Q-R7 check and
--     it is the one a future session is most likely to skip.
--
--   SELECT table_name, column_name
--     FROM information_schema.columns
--    WHERE table_schema = 'public'
--      AND table_name LIKE 'cognitive\_%'
--      AND (column_name LIKE '%debt_score%'
--        OR column_name LIKE '%coherence_score%'
--        OR column_name LIKE '%identity_relevance%'
--        OR column_name LIKE '%interpretive_context%');
--
-- V8. Confidence cannot be cardinal. ** EXPECT SEVEN ROWS. **
--
--     CORRECTED 2026-09-09, mid-walk: the phrase "the six allowed string values"
--     below refers to the six VALUES inside the confidence CHECK, not to a row
--     count, and was read as a row count during the TEST walk. Seven rows is the
--     correct and expected result. They are:
--       4 inline column CHECKs - epistemic_status, confidence, uncertainty_lower,
--         uncertainty_upper (Postgres auto-names these)
--       3 named table CHECKs  - cognitive_claims_band_iff_measured,
--         cognitive_claims_band_both_or_neither, cognitive_claims_band_ordered
--     NOT NULL does not appear here: it is contype 'n' (or attnotnull), and this
--     query filters contype = 'c'.
--
--     WHAT TO ACTUALLY READ, since a row count proves nothing on its own: find the
--     `confidence` CHECK and confirm its definition lists exactly these six string
--     values - unsupported, weak, moderate, strong, established, not_yet_assessed -
--     and that the column is TEXT. That is what makes a cardinal [0,1] confidence
--     unstorable, and it is the substance of this step. V9d then proves it
--     behaviourally.
--
--   SELECT conname, pg_get_constraintdef(oid)
--     FROM pg_constraint
--    WHERE conrelid = 'public.cognitive_claims'::regclass AND contype = 'c'
--    ORDER BY conname;
--
-- V9. BEHAVIOURAL PROOFS - four probes on TEST ONLY. Each must FAIL as shown.
--     Run these on TEST and read the error code; do NOT run them on production.
--
--   V9a. Identity CHECK. Expect 23514 (check_violation):
--
--     INSERT INTO public.cognitive_contexts (label) VALUES ('no identity');
--
--   V9b. EXECUTE without an external executor. Expect 23514. First create a
--        context, then attempt the event (substitute the context_id returned):
--
--     INSERT INTO public.cognitive_contexts (credential_ref, label)
--     VALUES ('api_key:verify-probe', 'verify probe') RETURNING context_id;
--
--     INSERT INTO public.cognitive_events
--       (context_id, event_id, seq, event_type, scope, caused_by, reason)
--     VALUES ('<context_id>', 'ev-1', 1, 'EXECUTE', 'Threshold', 'probe', 'probe');
--
--   V9c. Append-only. Insert a legal event, then UPDATE it. Expect P0001 with
--        the append-only message:
--
--     INSERT INTO public.cognitive_events
--       (context_id, event_id, seq, event_type, scope, caused_by, reason)
--     VALUES ('<context_id>', 'ev-2', 2, 'OBSERVE', 'Laboratory', 'probe', 'probe');
--
--     UPDATE public.cognitive_events SET reason = 'rewritten'
--      WHERE context_id = '<context_id>' AND event_id = 'ev-2';
--
--   V9d. Cardinal confidence is unstorable. Expect 23514:
--
--     INSERT INTO public.cognitive_claims
--       (context_id, claim_id, content, epistemic_status, confidence,
--        provenance_created_at, created_by, dependency_graph_id,
--        belief_state_id, belief_state_version)
--     VALUES ('<context_id>', 'cl-1', 'probe', 'asserted', '0.85',
--             now(), 'probe', 'dg-1', 'bs-1', 1);
--
--   TEARDOWN for V9 (TEST only) - the cascade removes the child rows:
--
--     DELETE FROM public.cognitive_contexts WHERE credential_ref = 'api_key:verify-probe';
--
--     ** THE SQL EDITOR WILL PRINT "Success. No rows returned" HERE, AND ON A
--        DELETE THAT MEANS NOTHING. ** It is the editor's message for "the
--        statement ran and produced no result set" - identical whether the DELETE
--        removed one row or zero. On a SELECT the same phrase genuinely means an
--        empty result (which is why it is the PASS on V3); on a DELETE it is not
--        evidence of anything. This project has been misled by exactly that
--        before. So the count below is not belt-and-braces - it is the only thing
--        that actually confirms the teardown, and the only thing that confirms the
--        cascade reached the children.
--
--     CONFIRM by query (never infer a cascade - the standing discipline):
--
--     SELECT (SELECT count(*) FROM public.cognitive_events)        AS events_left,
--            (SELECT count(*) FROM public.cognitive_claims)        AS claims_left,
--            (SELECT count(*) FROM public.cognitive_belief_states) AS states_left,
--            (SELECT count(*) FROM public.cognitive_contexts)      AS contexts_left;
--
-- V10. Nothing else was touched. Re-run PRE-P4; the count should be exactly
--      four higher than before, and no other table should have changed.
-- ============================================================================


-- ============================================================================
-- §INVERSE - full rollback. Restores the pre-migration state exactly.
-- ============================================================================
--
-- Safe while the tables are empty and inert (that is, before store.ts writes
-- anything in production). AFTER real data exists this DESTROYS it - which is a
-- deliberate act, not a rollback, and needs its own decision.
--
-- Children first, then the parent, then the trigger function. Dropping the
-- tables removes their triggers, indexes, constraints and policies with them.
--
--   DROP TABLE IF EXISTS public.cognitive_belief_states;
--   DROP TABLE IF EXISTS public.cognitive_claims;
--   DROP TABLE IF EXISTS public.cognitive_events;
--   DROP TABLE IF EXISTS public.cognitive_contexts;
--   DROP FUNCTION IF EXISTS public.cognitive_events_forbid_update();
--
-- After this the always-on data-rights paths keep working: store.ts treats a
-- missing table as benign (and a missing COLUMN as NEVER benign), so
-- /api/user/export and /api/user/delete return honestly rather than erroring.
-- ============================================================================
