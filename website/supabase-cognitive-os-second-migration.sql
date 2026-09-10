-- ============================================================================
-- COGNITIVE OS - SECOND MIGRATION (decisions, handoffs, dependency graph)
--
-- Successor to supabase-cognitive-os-core-migration.sql, which created the four
-- core-slice tables (cognitive_contexts, cognitive_events, cognitive_claims,
-- cognitive_belief_states) and is LIVE on TEST and production as of 2026-09-09.
--
-- AUTHORED 2026-09-10. NOT APPLIED. The founder walks §PRE / §APPLY / §VERIFY
-- on TEST, then the same sequence on production. The AI performs no Supabase
-- operation.
--
-- ----------------------------------------------------------------------------
-- WHAT THIS PERSISTS, AND WHAT IT DELIBERATELY DOES NOT
-- ----------------------------------------------------------------------------
-- Derived from the LIBRARY, not from the spec (the discipline that worked for
-- the core slice). The three deferred shapes named in the core close's §10 are
-- still the right set, but they are FOUR tables, not three: dependency-graph.ts
-- has nodes AND edges, and `addEdge` THROWS on an unknown endpoint, which is a
-- foreign key rather than a convention.
--
--   cognitive_decisions        - belief-revision.ts  DecisionRecord
--   cognitive_handoffs         - handoff-envelope.ts HandoffEnvelope
--   cognitive_dependency_nodes - dependency-graph.ts DependencyNode
--   cognitive_dependency_edges - dependency-graph.ts DependencyEdge
--
-- NOT PERSISTED, and each for a reason read out of the library:
--
--   * NO epistemic_debt_score column, on either decisions or handoffs.
--     Both shapes carry the score as a REQUIRED field in TypeScript
--     (DecisionRecord.epistemic_debt_score; HandoffEnvelope.epistemic_debt.score),
--     and it is re-derived on read instead. See "THE DERIVABILITY ARGUMENT".
--
--   * NO status column on cognitive_decisions. `deriveDecisionStatus` computes
--     COMMITTED / REVIEW_REQUIRED / SUPERSEDED / UNKNOWN from the event log by
--     latest-wins on `seq`, and belief-revision.ts says so in terms: "No stored
--     status field exists to drift from this." cognitive_events already carries
--     `decision_id` and both COMMIT and REVIEW event types, so the derivation
--     survives persistence with nothing added here. A status column would be a
--     second source of truth that can silently disagree with the log - the same
--     reason truth-maintenance.ts is not persisted at all.
--
--   * NO identity_state_id, identity_coherence_score, adversarial_test_results,
--     identity_relevance or interpretive_context. C6 / Q8: Phase 1 builds no
--     identity state and no adversarial service, and a present-but-empty column
--     would read as "no identity tension found" / "adversarial testing performed
--     and clean". Both are false claims. OMITTED, not null-filled.
--
-- ----------------------------------------------------------------------------
-- THE DERIVABILITY ARGUMENT - why "no score column" is SAFE here, not merely
-- stated, and what the founder elected to make it so
-- ----------------------------------------------------------------------------
-- The core slice could persist no scalar trivially: nothing it stored had one.
-- These two shapes DO, so the rule needs an argument rather than an assertion.
--
-- deriveEpistemicDebtScore (belief-state.ts) is the sum of five array lengths:
-- unresolved_claims, unsupported_assumptions, contradictions, stale_evidence,
-- pending_revisions. cognitive_belief_states persists exactly those five as
-- columns, and - decisively - it is VERSIONED:
--
--     CONSTRAINT cognitive_belief_states_version_unique
--       UNIQUE (context_id, belief_state_id, version)
--
-- Both DecisionRecord and HandoffEnvelope carry belief_state_id AND
-- belief_state_version, which join to exactly that key. So the score at the
-- moment of commitment is recoverable, exactly, from data already at rest.
--
-- BUT ONLY IF THE REFERENCE IS GUARANTEED. Without a constraint, a decision may
-- name a belief-state version that was never persisted (or that the retention
-- sweep has since removed), and its score becomes silently unrecoverable. Under
-- C6/Q8 an unrecoverable score must then read as ABSENT, never as 0 - which is
-- the caller_class error in a third costume.
--
-- FOUNDER ELECTION 2026-09-10: a COMPOSITE FOREIGN KEY on both tables,
--   (context_id, belief_state_id, belief_state_version)
--     REFERENCES cognitive_belief_states (context_id, belief_state_id, version)
-- so that a decision or handoff whose debt score could not be re-derived is
-- UNSTORABLE rather than silently score-less. Chosen over plain columns.
--
-- The cost is real and is stated rather than buried: a writer MUST persist the
-- belief-state version before the decision or handoff that cites it. That is a
-- genuine ordering requirement on every future writer, and store.ts says so at
-- its own write boundary.
--
-- ON DELETE CASCADE on that FK is deliberate, and has a consequence worth naming
-- plainly: when a belief-state row is swept at its retain_until, the decisions
-- and handoffs resting on it go with it, even if their own retain_until has not
-- yet passed. That is the correct direction. A decision whose evidential basis
-- has been erased cannot have its debt score derived, so retaining it would
-- manufacture exactly the unrecoverable-score state this FK exists to prevent.
-- In practice rows created together expire together (all default to 90 days), so
-- this is an invariant-preserving edge case rather than a routine event.
--
-- ----------------------------------------------------------------------------
-- THE TWO OPEN-ENDED JSONB CONTAINERS - what a CHECK can and cannot reach
-- ----------------------------------------------------------------------------
-- The R9/R10 reconciliation §5.6(i) named HandoffEnvelope.payload as its own
-- R17 surface. Reading the library for this migration found a SECOND container
-- of the same class that §5.6(i) does not name:
--
--     HandoffEnvelope.payload      Readonly<Record<string, unknown>>
--     DecisionRecord.stoic_evaluation  Readonly<Record<string, unknown>>
--
-- Both bypass the store battery's §7 pin identically. That pin reads COLUMN
-- NAMES, so a score inside a JSONB document passes it cleanly. "No score column"
-- and "no score at rest" are not the same claim once a free-form container is
-- persisted, and the difference is exactly where Q9 would stop being
-- machine-enforced.
--
-- FOUNDER ELECTION 2026-09-10: persist both, with a CHECK, and NARROW §5.6(i)
-- rather than claim to close it.
--
-- WHAT THE CHECK REACHES (via cognitive_os_jsonb_has_internal_scalar):
--   * a TOP-LEVEL KEY named epistemic_debt_score or identity_coherence_score
--   * a TOP-LEVEL VALUE that is an object whose `kind` is one of those
--     - this second case is the REALISTIC leak shape, because the library's own
--       scalars ARE wrapper objects ({kind, value}), so a key-name-only check
--       would miss the very thing most likely to be stored
--
-- WHAT IT DOES NOT REACH, stated rather than left to be assumed:
--   * anything NESTED below the top level. A CHECK constraint may not contain an
--     aggregate, so a recursive walk is not expressible in one. This is the same
--     disclosed limit already carried by cognitive_belief_states'
--     debt_contradictions constraint, and it is disclosed here for the same
--     reason.
--   * a drift in the function itself. A function-based CHECK is NOT re-validated
--     against existing rows if the function is later replaced. The function is
--     therefore documented as append-only in spirit: widen it, never narrow it,
--     and re-validate explicitly if it is ever narrowed.
--
-- THE DEEP CASE IS DESIGNED TO BE CLOSED AT THE WRITE BOUNDARY, NOT HERE, BUT
-- IS NOT YET WIRED TO ANY WRITER. ** CAUGHT BY PR19: ** an earlier version of
-- this comment claimed the deep case "IS closed", present tense. It is not -
-- Phase 1 has no writer at all. store.ts exports `assertNoInternalScalarAtRest`
-- (reusing `scanForEgress` from permissions.ts - the library's existing
-- full-depth, cycle-safe scanner, which already matches both key names and
-- `kind` wrappers at any depth and REFUSES containers it cannot exhaustively
-- read; PR15, reused rather than re-derived), and the function is correct and
-- battery-proven (store.test.ts §13.16). But no insert path exists anywhere in
-- `src/` that calls it - there is no actor, and this migration persists no data
-- of its own. The function is staged for whichever future writer needs it, not
-- currently load-bearing. ANY WRITER ADDED LATER MUST CALL IT before inserting
-- into stoic_evaluation or payload, or this section's claim becomes false
-- again.
--
-- So the division is: the database catches what SQL can reach, the typed writer
-- catches the rest, and both halves are stated. Neither is presented as the
-- whole.
--
-- ----------------------------------------------------------------------------
-- WHY `supersedes` CARRIES NO FOREIGN KEY - a deliberate omission
-- ----------------------------------------------------------------------------
-- DecisionRecord.supersedes points BACKWARD at an earlier decision, so the
-- target always pre-exists and an FK would be satisfiable. It is still omitted,
-- because every available ON DELETE action is wrong here:
--
--   RESTRICT  - blocks the retention sweep on any superseded decision.
--   CASCADE   - destroys the SUPERSEDING decision when the superseded one is
--               swept. Exactly backwards: the newer record is the live one.
--   SET NULL  - silently rewrites history. supersededDecisions() builds its set
--               from this field, so nulling it turns a SUPERSEDED decision into
--               one that derives as COMMITTED. That is a false status, which is
--               the C6 honesty failure the whole ruling set is built against.
--
-- Without an FK, a swept target leaves a dangling id, which reads honestly as
-- "the superseded decision is no longer retained" and cannot promote anything to
-- a status it does not hold. An indexed plain column is the honest choice.
--
-- ----------------------------------------------------------------------------
-- RETENTION - the existing sweep, not a third flag
-- ----------------------------------------------------------------------------
-- All four tables FK to cognitive_contexts, the single scoping root the founder
-- elected on 2026-09-09, and carry the same 90-day retain_until default and the
-- same semantics as the core slice.
--
-- They are therefore swept by the EXISTING sweep behind the EXISTING flag,
-- SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED - by extending CHILD_TABLES in store.ts,
-- not by adding a third flag. Reasoning, stated because the mandate asks for it
-- either way: a separate flag would let half of one logical system's retention be
-- enforced while the other half was not, which is a worse state than either
-- extreme, and there is no activation timeline on which these tables would want a
-- different answer from the tables they cascade from. The flag remains UNSET;
-- nothing enforces retention until the founder sets it, on either slice.
--
-- ORDERING NOTE, load-bearing: CHILD_TABLES drives deletion, and decisions and
-- handoffs MUST be visited BEFORE cognitive_belief_states. Deleting belief
-- states first would cascade them away, and the explicit delete that follows
-- would then count 0 - under-reporting a real erasure while reporting success.
-- Edges must likewise precede nodes. Pinned in the store battery.
--
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER cross-check RUN 2026-09-10 (mandate step 5)
-- ----------------------------------------------------------------------------
-- Re-run rather than cited from the core migration's header, because a session
-- may have added a migration since - and because a verification claim in a
-- comment that quotes a command it did not run is the exact defect PR19 found
-- twice on this project (PR25).
--
-- The commands that produce these numbers, run from the REPOSITORY ROOT:
--
--   grep -rn  "SECURITY DEFINER" --include="*.sql" . | grep -v node_modules
--   grep -rln "SECURITY DEFINER" --include="*.sql" . | grep -v node_modules
--   grep -rln "SECURITY DEFINER" --include="*.sql" . | grep -v node_modules \
--     | xargs grep -l "cognitive_"
--
-- ** CAUGHT BY PR19, THE SAME CLASS THIS SECTION EXISTS TO PREVENT. ** An
-- earlier version of this header quoted 25 hits / 13 files and said "the third
-- command returns only the core migration itself" - numbers computed BEFORE
-- this file existed, then left uncorrected as the file grew around them. The
-- corrected, actually-reproducing figures:
--
-- Results on 2026-09-10 (re-run against the FINISHED file): raw command 1
-- returns 33 hits; command 2 returns 14 files. Command 3 (files matching BOTH
-- "SECURITY DEFINER" and "cognitive_") returns TWO files, not one:
-- supabase-cognitive-os-core-migration.sql AND THIS FILE. That is expected, not
-- a leak: this file necessarily matches its own raw grep, because it discusses
-- SECURITY DEFINER in prose (this very cross-check) and mentions cognitive_
-- tables throughout its own documentation. A file that documents its own
-- absence of a thing will always match a naive grep for that thing.
--
-- SO THE RAW GREP IS NOT THE REAL CHECK. It cannot distinguish a genuine
-- function definition from a comment or a COMMENT ON ... IS string literal
-- discussing one, and both migration files' headers are exactly that discussion.
-- The check that actually matters - and the one enforced, not merely
-- described - strips BOTH `--` comment lines AND `COMMENT ON ... IS '...'`
-- string literals before matching (the store battery's `executableOf` /
-- `stripCommentOnLiterals`, §1.13f and §13.6b), and on THAT check both migration
-- files return zero real definitions. NO SECURITY DEFINER FUNCTION TOUCHES ANY
-- cognitive_ TABLE - proven by the battery, which re-derives this at every run
-- rather than trusting this header. Do not re-quote the raw numbers above as a
-- security claim; they are provenance for how the comment-stripped check was
-- built, nothing more.
--
-- THIS MIGRATION CREATES ONE FUNCTION AND IT IS NOT SECURITY DEFINER:
-- cognitive_os_jsonb_has_internal_scalar is a plain IMMUTABLE SQL function, so
-- it runs as invoker and can reach nothing its caller could not already reach.
-- The store battery re-runs this whole sweep (it does not trust this header).
-- ============================================================================


-- ============================================================================
-- §PRE - run BEFORE applying. TEST first, then production. Read every output.
-- ============================================================================
--
-- P1. The four NEW tables must NOT already exist. Expect ZERO rows.
--
--   SELECT table_name
--     FROM information_schema.tables
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_decisions', 'cognitive_handoffs',
--                         'cognitive_dependency_nodes',
--                         'cognitive_dependency_edges')
--    ORDER BY table_name;
--
--   If any row comes back, STOP. A partial prior application is a different
--   situation from a clean create and must be diagnosed, not overwritten.
--
-- P2. The core slice must ALREADY be applied - this migration FKs into it.
--     Expect exactly 4 rows.
--
--   SELECT table_name
--     FROM information_schema.tables
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_contexts', 'cognitive_events',
--                         'cognitive_claims', 'cognitive_belief_states')
--    ORDER BY table_name;
--
--   Fewer than 4 rows means the core migration is not (fully) applied. STOP.
--
-- P3. The composite FK target must exist as a UNIQUE constraint. A composite FK
--     can only reference a unique or primary key, so this is a hard
--     precondition, not a nicety. Expect exactly 1 row.
--
--   SELECT conname
--     FROM pg_constraint
--    WHERE conrelid = 'public.cognitive_belief_states'::regclass
--      AND conname  = 'cognitive_belief_states_version_unique'
--      AND contype  = 'u';
--
--   Zero rows means the core migration was applied in a modified form. STOP.
--
-- P4. The function name must be free. Expect ZERO rows.
--
--   SELECT p.proname
--     FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname = 'public'
--      AND p.proname = 'cognitive_os_jsonb_has_internal_scalar';
--
-- P5. Record the pre-state so VERIFY can prove nothing else was touched.
--
--   SELECT count(*) AS public_tables_before
--     FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================================================


-- ============================================================================
-- §APPLY
-- ============================================================================

-- ----------------------------------------------------------------------------
-- §0  The internal-scalar guard function (plain, IMMUTABLE, NOT SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Returns true when a jsonb document carries an internal-only Cognitive OS
-- scalar AT ITS TOP LEVEL, in either of the two shapes it can take:
--   * a key named for the scalar, or
--   * a value that is one of the library's wrapper objects ({kind, value}).
--
-- TOP LEVEL ONLY. A nested occurrence is not reached - see the header for why
-- (a CHECK may not contain an aggregate) and for where the deep case is closed
-- instead (store.ts, reusing scanForEgress).
--
-- IMMUTABLE is correct here: the result depends only on the argument. It is what
-- makes the function usable in a CHECK at all.
--
-- WIDEN THIS, NEVER NARROW IT. A function-based CHECK is not re-validated
-- against existing rows when the function is replaced, so narrowing it would
-- leave previously-rejected shapes admissible with no record. If it must ever be
-- narrowed, re-validate the constraints explicitly.
CREATE OR REPLACE FUNCTION public.cognitive_os_jsonb_has_internal_scalar(doc jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM jsonb_each(COALESCE(doc, '{}'::jsonb)) AS kv(k, v)
     WHERE k IN ('epistemic_debt_score', 'identity_coherence_score')
        OR (jsonb_typeof(v) = 'object'
            AND v->>'kind' IN ('epistemic_debt_score', 'identity_coherence_score'))
  );
$$;


-- ----------------------------------------------------------------------------
-- §1  cognitive_decisions - belief-revision.ts DecisionRecord
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cognitive_decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id      UUID NOT NULL
                    REFERENCES public.cognitive_contexts(context_id) ON DELETE CASCADE,

  decision_id     TEXT NOT NULL,
  action          TEXT NOT NULL,

  -- The composite FK target. See "THE DERIVABILITY ARGUMENT" in the header:
  -- these two columns are what makes the absent score column recoverable.
  belief_state_id      TEXT    NOT NULL,
  belief_state_version INTEGER NOT NULL,

  supporting_claims    TEXT[] NOT NULL DEFAULT '{}',
  known_uncertainties  TEXT[] NOT NULL DEFAULT '{}',

  -- THERE IS DELIBERATELY NO epistemic_debt_score COLUMN. Re-derive it by
  -- joining (context_id, belief_state_id, belief_state_version) to
  -- cognitive_belief_states and calling deriveEpistemicDebtScore on the five
  -- component columns. Q9 / Q-R7, and the FK below is what guarantees the join
  -- finds a row.

  -- C5: the harness's own rank, CARRIED as a separate opaque field and never
  -- merged with any Cognitive OS figure. It is NOT an internal-only scalar
  -- (INTERNAL_ONLY_SCALAR_KINDS is epistemic_debt_score and
  -- identity_coherence_score only), so it is safe to persist and to return
  -- through R17 - it is the user's own data. Stored as the bare rank string;
  -- the {kind:'proximity_rank'} wrapper is re-applied on read.
  carried_proximity_rank TEXT,

  -- Opaque harness output. Never parsed, never combined, never interpreted.
  -- Guarded by the top-level internal-scalar CHECK below.
  stoic_evaluation       JSONB,

  commitment_event_id    TEXT NOT NULL,

  -- Descriptive only, like cognitive_events.occurred_at. The event log's `seq`
  -- orders; a wall clock never does.
  occurred_at            TIMESTAMPTZ,

  -- Intentionally NOT a foreign key. See "WHY `supersedes` CARRIES NO FOREIGN
  -- KEY" in the header: every ON DELETE action available is wrong, and SET NULL
  -- in particular would silently derive a SUPERSEDED decision as COMMITTED.
  supersedes             TEXT,

  -- THERE IS DELIBERATELY NO status COLUMN. deriveDecisionStatus reads the
  -- event log. A stored status is a second source of truth that can drift.

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  CONSTRAINT cognitive_decisions_id_unique
    UNIQUE (context_id, decision_id),

  CONSTRAINT cognitive_decisions_version_nonnegative
    CHECK (belief_state_version >= 0),

  -- The load-bearing constraint of this migration. A decision whose debt score
  -- could not be re-derived is UNSTORABLE, rather than stored and silently
  -- score-less.
  CONSTRAINT cognitive_decisions_belief_state_fk
    FOREIGN KEY (context_id, belief_state_id, belief_state_version)
    REFERENCES public.cognitive_belief_states (context_id, belief_state_id, version)
    ON DELETE CASCADE,

  CONSTRAINT cognitive_decisions_stoic_evaluation_is_object
    CHECK (stoic_evaluation IS NULL OR jsonb_typeof(stoic_evaluation) = 'object'),

  CONSTRAINT cognitive_decisions_stoic_evaluation_no_internal_scalar
    CHECK (NOT public.cognitive_os_jsonb_has_internal_scalar(stoic_evaluation))
);

CREATE INDEX IF NOT EXISTS idx_cd_context
  ON public.cognitive_decisions (context_id);

CREATE INDEX IF NOT EXISTS idx_cd_belief_state
  ON public.cognitive_decisions (context_id, belief_state_id, belief_state_version);

-- supersedes carries no FK, so this index is what makes supersededDecisions()
-- cheap to reconstruct from storage.
CREATE INDEX IF NOT EXISTS idx_cd_supersedes
  ON public.cognitive_decisions (context_id, supersedes)
  WHERE supersedes IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cd_retain_until
  ON public.cognitive_decisions (retain_until);


-- ----------------------------------------------------------------------------
-- §2  cognitive_handoffs - handoff-envelope.ts HandoffEnvelope
-- ----------------------------------------------------------------------------
-- NOTE, carried from handoff-envelope.ts's own header so it is not rediscovered:
-- this is NOT `agent_handoffs`. That table is the ORGANISATIONAL INBOX, with
-- source_agent/target_agent constrained to tech/growth/support/ops/founder. It
-- shares a word with this envelope and nothing else. DO NOT CONFLATE THEM.
CREATE TABLE IF NOT EXISTS public.cognitive_handoffs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id      UUID NOT NULL
                    REFERENCES public.cognitive_contexts(context_id) ON DELETE CASCADE,

  handoff_id      TEXT NOT NULL,

  -- C2 / Q-R2: PERMISSION SCOPES, not actors. The two vocabularies are kept
  -- distinct in code and are kept distinct here. Same CHECK vocabulary as
  -- cognitive_events.scope.
  from_scope      TEXT NOT NULL CHECK (from_scope IN (
                    'Laboratory', 'Attic', 'Archive', 'Threshold')),
  to_scope        TEXT NOT NULL CHECK (to_scope IN (
                    'Laboratory', 'Attic', 'Archive', 'Threshold')),

  belief_state_id      TEXT    NOT NULL,
  belief_state_version INTEGER NOT NULL,

  claims          TEXT[] NOT NULL DEFAULT '{}',
  events          TEXT[] NOT NULL DEFAULT '{}',

  -- HandoffEnvelope.epistemic_debt has TWO members. The `score` is NOT stored
  -- (re-derived - see the header); `relevant_items` IS, because it is a
  -- caller-supplied selection that no join can reconstruct, and it is a list of
  -- item ids rather than a scalar, so Q9 does not reach it.
  debt_relevant_items TEXT[] NOT NULL DEFAULT '{}',

  -- C5, as on decisions: carried alongside, never merged.
  carried_proximity_rank TEXT,

  -- The §5.6(i) surface. Guarded by the top-level internal-scalar CHECK below
  -- and, at full depth, by scanForEgress at the store's write boundary.
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,

  occurred_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  CONSTRAINT cognitive_handoffs_id_unique
    UNIQUE (context_id, handoff_id),

  CONSTRAINT cognitive_handoffs_version_nonnegative
    CHECK (belief_state_version >= 0),

  CONSTRAINT cognitive_handoffs_belief_state_fk
    FOREIGN KEY (context_id, belief_state_id, belief_state_version)
    REFERENCES public.cognitive_belief_states (context_id, belief_state_id, version)
    ON DELETE CASCADE,

  CONSTRAINT cognitive_handoffs_payload_is_object
    CHECK (jsonb_typeof(payload) = 'object'),

  CONSTRAINT cognitive_handoffs_payload_no_internal_scalar
    CHECK (NOT public.cognitive_os_jsonb_has_internal_scalar(payload))
);

CREATE INDEX IF NOT EXISTS idx_ch_context
  ON public.cognitive_handoffs (context_id);

CREATE INDEX IF NOT EXISTS idx_ch_belief_state
  ON public.cognitive_handoffs (context_id, belief_state_id, belief_state_version);

CREATE INDEX IF NOT EXISTS idx_ch_retain_until
  ON public.cognitive_handoffs (retain_until);


-- ----------------------------------------------------------------------------
-- §3  cognitive_dependency_nodes - dependency-graph.ts DependencyNode
-- ----------------------------------------------------------------------------
-- C7 (Q10), carried from dependency-graph.ts: this graph holds NO score field of
-- any kind and exposes no setter for one. Routing-relevant figures are DERIVED
-- from structure on demand (unresolvedDependents), so there is nothing here for
-- an agent to write that could influence its own routing. That is a Phase-1
-- design constraint, not a Phase-6 problem, and the schema keeps it: there is no
-- score column below and there must never be one.
CREATE TABLE IF NOT EXISTS public.cognitive_dependency_nodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id      UUID NOT NULL
                    REFERENCES public.cognitive_contexts(context_id) ON DELETE CASCADE,

  node_id         TEXT NOT NULL,

  kind            TEXT NOT NULL CHECK (kind IN (
                    'evidence', 'claim', 'assumption',
                    'derived_claim', 'decision', 'action')),

  -- DependencyNode.ref_id is optional in the library ("the claim/decision/
  -- evidence this node stands for, WHEN IT HAS ONE"), so NULL here means
  -- "this node stands for nothing recorded", not "unknown".
  ref_id          TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- The edge FK below references this key, so it must be unique.
  CONSTRAINT cognitive_dependency_nodes_id_unique
    UNIQUE (context_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_cdn_context
  ON public.cognitive_dependency_nodes (context_id);

CREATE INDEX IF NOT EXISTS idx_cdn_kind
  ON public.cognitive_dependency_nodes (context_id, kind);

CREATE INDEX IF NOT EXISTS idx_cdn_retain_until
  ON public.cognitive_dependency_nodes (retain_until);


-- ----------------------------------------------------------------------------
-- §4  cognitive_dependency_edges - dependency-graph.ts DependencyEdge
-- ----------------------------------------------------------------------------
-- An edge means: `from_node` SUPPORTS `to_node`. Invalidating `from_node`
-- therefore threatens `to_node`, and impact analysis follows edges FORWARD.
--
-- BOTH ENDPOINTS ARE FOREIGN KEYS BECAUSE THE LIBRARY THROWS. addEdge() raises
-- on an unknown endpoint, with its own stated reason: "a dependency on an
-- unknown node would make impact analysis silently incomplete, which is the
-- failure mode this whole component exists to prevent". A plain column would
-- let storage hold a graph the library would have refused to build, so the
-- constraint is encoded rather than documented.
CREATE TABLE IF NOT EXISTS public.cognitive_dependency_edges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id      UUID NOT NULL
                    REFERENCES public.cognitive_contexts(context_id) ON DELETE CASCADE,

  from_node       TEXT NOT NULL,
  to_node         TEXT NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- The graph stores each direction of a pair once: forward/backward are two
  -- Sets, so a duplicate addEdge is idempotent in memory and must be here too.
  CONSTRAINT cognitive_dependency_edges_unique
    UNIQUE (context_id, from_node, to_node),

  CONSTRAINT cognitive_dependency_edges_from_fk
    FOREIGN KEY (context_id, from_node)
    REFERENCES public.cognitive_dependency_nodes (context_id, node_id)
    ON DELETE CASCADE,

  CONSTRAINT cognitive_dependency_edges_to_fk
    FOREIGN KEY (context_id, to_node)
    REFERENCES public.cognitive_dependency_nodes (context_id, node_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cde_context
  ON public.cognitive_dependency_edges (context_id);

CREATE INDEX IF NOT EXISTS idx_cde_from
  ON public.cognitive_dependency_edges (context_id, from_node);

CREATE INDEX IF NOT EXISTS idx_cde_to
  ON public.cognitive_dependency_edges (context_id, to_node);

CREATE INDEX IF NOT EXISTS idx_cde_retain_until
  ON public.cognitive_dependency_edges (retain_until);


-- ----------------------------------------------------------------------------
-- §5  RLS - service-role-only, in the 2026-08-16 proven shape
-- ----------------------------------------------------------------------------
-- RLS ENABLED with ZERO POLICIES, plus an explicit REVOKE from the API roles and
-- a GRANT to service_role. No policy exists that could be mis-written as
-- USING (true) - the founder_conversations defect, where a policy NAMED for
-- service role applied to every role and returned real rows to an unauthenticated
-- anon-key request.
ALTER TABLE public.cognitive_decisions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_handoffs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_dependency_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_dependency_edges ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cognitive_decisions        FROM PUBLIC;
REVOKE ALL ON public.cognitive_decisions        FROM anon;
REVOKE ALL ON public.cognitive_decisions        FROM authenticated;

REVOKE ALL ON public.cognitive_handoffs         FROM PUBLIC;
REVOKE ALL ON public.cognitive_handoffs         FROM anon;
REVOKE ALL ON public.cognitive_handoffs         FROM authenticated;

REVOKE ALL ON public.cognitive_dependency_nodes FROM PUBLIC;
REVOKE ALL ON public.cognitive_dependency_nodes FROM anon;
REVOKE ALL ON public.cognitive_dependency_nodes FROM authenticated;

REVOKE ALL ON public.cognitive_dependency_edges FROM PUBLIC;
REVOKE ALL ON public.cognitive_dependency_edges FROM anon;
REVOKE ALL ON public.cognitive_dependency_edges FROM authenticated;

GRANT ALL ON public.cognitive_decisions        TO service_role;
GRANT ALL ON public.cognitive_handoffs         TO service_role;
GRANT ALL ON public.cognitive_dependency_nodes TO service_role;
GRANT ALL ON public.cognitive_dependency_edges TO service_role;

-- The guard function is called from CHECK constraints evaluated as the writing
-- role, so it must be executable by service_role. It is NOT granted to the API
-- roles, which have no reason to call it and no access to these tables anyway.
REVOKE ALL ON FUNCTION public.cognitive_os_jsonb_has_internal_scalar(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cognitive_os_jsonb_has_internal_scalar(jsonb) TO service_role;


-- ----------------------------------------------------------------------------
-- §6  In-schema documentation
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.cognitive_decisions IS
  'Cognitive OS DecisionRecord (belief-revision.ts). Frozen and never edited. '
  'NO epistemic_debt_score column and NO status column: the score is re-derived '
  'by joining the composite FK to cognitive_belief_states five debt components, '
  'and the status is derived from the event log by deriveDecisionStatus. Both '
  'omissions are load-bearing (Q9 / Q-R7 and no-second-source-of-truth).';

COMMENT ON CONSTRAINT cognitive_decisions_belief_state_fk ON public.cognitive_decisions IS
  'Guarantees the absent epistemic_debt_score is re-derivable: a decision whose '
  'belief-state version is not persisted is unstorable rather than silently '
  'score-less. ON DELETE CASCADE is deliberate - a decision must not outlive the '
  'evidential basis its debt score is derived from.';

COMMENT ON COLUMN public.cognitive_decisions.supersedes IS
  'Deliberately NOT a foreign key. RESTRICT would block the retention sweep, '
  'CASCADE would destroy the superseding (newer) decision, and SET NULL would '
  'silently derive a SUPERSEDED decision as COMMITTED. A dangling id reads '
  'honestly as "no longer retained" and cannot promote a false status.';

COMMENT ON COLUMN public.cognitive_decisions.stoic_evaluation IS
  'Opaque harness output, never parsed or combined. Guarded at the TOP LEVEL '
  'only by cognitive_os_jsonb_has_internal_scalar; nested occurrences are '
  'refused at the write boundary by scanForEgress, not here.';

COMMENT ON TABLE public.cognitive_handoffs IS
  'Cognitive OS HandoffEnvelope (handoff-envelope.ts). NOT agent_handoffs, which '
  'is the unrelated organisational inbox. epistemic_debt.score is NOT stored '
  '(re-derived via the composite FK); epistemic_debt.relevant_items IS, because '
  'it is a caller-supplied selection no join can reconstruct.';

COMMENT ON COLUMN public.cognitive_handoffs.payload IS
  'The open-ended R17 surface named at reconciliation 5.6(i). Guarded at the TOP '
  'LEVEL only by cognitive_os_jsonb_has_internal_scalar (a CHECK may not contain '
  'an aggregate, so no recursive walk is expressible); the deep case is closed at '
  'the store write boundary by scanForEgress. NARROWED, not closed.';

COMMENT ON TABLE public.cognitive_dependency_nodes IS
  'Cognitive OS DependencyNode (dependency-graph.ts). C7 / Q10: this graph holds '
  'no score field of any kind and must never gain one - routing-relevant figures '
  'are derived from structure on demand, so there is nothing an agent could write '
  'to influence its own routing.';

COMMENT ON TABLE public.cognitive_dependency_edges IS
  'Cognitive OS DependencyEdge: from_node SUPPORTS to_node. BOTH endpoints are '
  'foreign keys because addEdge() throws on an unknown endpoint - storage must '
  'not be able to hold a graph the library would have refused to build, or impact '
  'analysis becomes silently incomplete.';

COMMENT ON FUNCTION public.cognitive_os_jsonb_has_internal_scalar(jsonb) IS
  'True when a jsonb document carries an internal-only Cognitive OS scalar at its '
  'TOP LEVEL, as either a key name or a {kind,value} wrapper object. Plain and '
  'IMMUTABLE, NOT SECURITY DEFINER. WIDEN, NEVER NARROW: a function-based CHECK '
  'is not re-validated against existing rows when the function is replaced.';


-- ============================================================================
-- §VERIFY - run AFTER applying. TEST first; all green before production.
-- ============================================================================
--
-- V1. All four new tables exist. Expect exactly 4 rows.
--
--   SELECT table_name
--     FROM information_schema.tables
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_decisions', 'cognitive_handoffs',
--                         'cognitive_dependency_nodes',
--                         'cognitive_dependency_edges')
--    ORDER BY table_name;
--
-- V2. RLS is ENABLED on all four AND there are ZERO policies. BOTH halves
--     matter: an "enabled" table with a permissive USING (true) policy is the
--     founder_conversations defect. Expect relrowsecurity = true four times and
--     policy_count = 0 four times.
--
--   SELECT c.relname, c.relrowsecurity,
--          (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count
--     FROM pg_class c
--     JOIN pg_namespace n ON n.oid = c.relnamespace
--    WHERE n.nspname = 'public'
--      AND c.relname IN ('cognitive_decisions', 'cognitive_handoffs',
--                        'cognitive_dependency_nodes',
--                        'cognitive_dependency_edges')
--    ORDER BY c.relname;
--
-- V3. GRANTS. ** THE CHECK IS A NEGATIVE ONE. ** Expect ZERO rows.
--
--     Asked in the negative form the four prior lockdown migrations use, and for
--     the reason the core migration recorded after getting it wrong mid-walk:
--     `postgres` is the table OWNER, its privileges are implicit and always
--     reported, cannot meaningfully be revoked, and are not an exposure path
--     (PostgREST connects as `authenticator` and SET ROLEs to
--     anon/authenticated/service_role, never to `postgres`). The question is not
--     "who appears" but "do the API roles appear".
--
--   SELECT table_name, grantee, privilege_type
--     FROM information_schema.role_table_grants
--    WHERE table_schema = 'public'
--      AND table_name IN ('cognitive_decisions', 'cognitive_handoffs',
--                         'cognitive_dependency_nodes',
--                         'cognitive_dependency_edges')
--      AND grantee IN ('anon', 'authenticated', 'PUBLIC')
--    ORDER BY table_name, grantee, privilege_type;
--
--   ANY row is a failure - the REVOKE did not take. Zero rows is the pass.
--
-- V4. The composite foreign keys exist and point where they should.
--     Expect 4 rows: decisions and handoffs to cognitive_belief_states, and
--     both edge endpoints to cognitive_dependency_nodes.
--
--   SELECT con.conname,
--          rel.relname  AS on_table,
--          fref.relname AS references_table,
--          con.confdeltype
--     FROM pg_constraint con
--     JOIN pg_class rel  ON rel.oid  = con.conrelid
--     JOIN pg_class fref ON fref.oid = con.confrelid
--    WHERE con.contype = 'f'
--      AND con.conname IN ('cognitive_decisions_belief_state_fk',
--                          'cognitive_handoffs_belief_state_fk',
--                          'cognitive_dependency_edges_from_fk',
--                          'cognitive_dependency_edges_to_fk')
--    ORDER BY con.conname;
--
--   confdeltype must be 'c' (CASCADE) on all four.
--
-- V5. ** NO SCORE COLUMN EXISTS ANYWHERE UNDER cognitive_. ** Expect ZERO rows.
--     Asked against the LIVE schema, not against this file, because a schema can
--     drift without this file changing. This is the same question the store
--     battery's §7 pin asks of the source.
--
--   SELECT table_name, column_name
--     FROM information_schema.columns
--    WHERE table_schema = 'public'
--      AND table_name LIKE 'cognitive_%'
--      AND (column_name LIKE '%debt_score%'
--        OR column_name LIKE '%coherence_score%'
--        OR column_name IN ('epistemic_debt_score', 'identity_coherence_score',
--                           'identity_relevance', 'interpretive_context'))
--    ORDER BY table_name, column_name;
--
--   ANY row is a failure. If one appears, the fix is an explicit export
--   projection - never relaxing the check.
--
-- V6. No status column crept onto decisions. Expect ZERO rows.
--
--   SELECT column_name FROM information_schema.columns
--    WHERE table_schema = 'public' AND table_name = 'cognitive_decisions'
--      AND column_name = 'status';
--
-- V7. The guard function exists, is IMMUTABLE, and is NOT SECURITY DEFINER.
--     Expect exactly 1 row with provolatile = 'i' and prosecdef = false.
--
--   SELECT p.proname, p.provolatile, p.prosecdef
--     FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname = 'public'
--      AND p.proname = 'cognitive_os_jsonb_has_internal_scalar';
--
-- V8. CHECK constraint inventory on the four new tables.
--
--     ** EXPECT THREE ROWS, NOT FOUR. ** cognitive_dependency_edges has ZERO
--     check constraints, and a GROUP BY returns no row for it at all. A missing
--     fourth row is the PASS here, not a failure.
--
--       cognitive_decisions         3  (version_nonnegative,
--                                       stoic_evaluation_is_object,
--                                       stoic_evaluation_no_internal_scalar)
--       cognitive_handoffs          5  (from_scope and to_scope inline, plus
--                                       version_nonnegative, payload_is_object,
--                                       payload_no_internal_scalar)
--       cognitive_dependency_nodes  1  (kind, inline)
--       cognitive_dependency_edges  -  no row returned; it has none
--
--     COUNT NOTE, written to prevent the misreading the core migration's own V8
--     suffered - and then made again in this file's first draft, which listed
--     three constraints for cognitive_decisions and wrote "4" beside them:
--     this counts CONSTRAINT ROWS of contype 'c', not the number of allowed
--     values inside any one of them. NOT NULL is a different contype and does
--     not appear. Inline column CHECKs DO appear, under generated names.
--     The figures above were counted mechanically from this file's own §APPLY
--     block with comment lines stripped, not from recollection.
--
--   SELECT rel.relname, count(*) AS check_constraints
--     FROM pg_constraint con
--     JOIN pg_class rel ON rel.oid = con.conrelid
--     JOIN pg_namespace n ON n.oid = rel.relnamespace
--    WHERE n.nspname = 'public'
--      AND con.contype = 'c'
--      AND rel.relname IN ('cognitive_decisions', 'cognitive_handoffs',
--                          'cognitive_dependency_nodes',
--                          'cognitive_dependency_edges')
--    GROUP BY rel.relname
--    ORDER BY rel.relname;
--
--   Read the actual numbers against the list above; if they differ, list the
--   constraints by name (add con.conname and drop the GROUP BY) and reconcile
--   before proceeding. Do not proceed on an unexplained difference.
--
-- V9. Nothing else was touched. Compare with P5.
--
--   SELECT count(*) AS public_tables_after
--     FROM information_schema.tables WHERE table_schema = 'public';
--
--   Expect exactly P5 + 4.
-- ============================================================================


-- ============================================================================
-- §VERIFY-BEHAVIOURAL - TEST ONLY. Destructive. NEVER run on production.
-- ============================================================================
--
-- Each probe must FAIL with the error code named. A probe that SUCCEEDS is a
-- failure of the migration. Run them in order; the teardown at the end is not
-- optional.
--
-- Set up one disposable context and one belief-state version to hang the probes
-- from. Substitute the returned ids where the probes say <ctx>.
--
--   INSERT INTO public.cognitive_contexts (owner_user_id, credential_ref)
--     VALUES (NULL, 'second-migration-probe')
--     RETURNING context_id;
--
--   INSERT INTO public.cognitive_belief_states
--          (context_id, belief_state_id, version)
--     VALUES ('<ctx>', 'bs-probe', 1);
--
-- B1. A decision naming a belief-state version that does not exist must FAIL
--     with 23503 (foreign_key_violation). THIS IS THE LOAD-BEARING PROBE of
--     this migration: it is what makes "the debt score is always re-derivable"
--     a property rather than a hope.
--
--   INSERT INTO public.cognitive_decisions
--          (context_id, decision_id, action, belief_state_id,
--           belief_state_version, commitment_event_id)
--     VALUES ('<ctx>', 'dec-probe', 'probe', 'bs-probe', 99, 'ev-probe');
--
-- B2. A handoff carrying an internal-only scalar in its payload must FAIL with
--     23514 (check_violation) - both as a key name and as a wrapper object.
--     Run BOTH; the second is the realistic leak shape.
--
--   INSERT INTO public.cognitive_handoffs
--          (context_id, handoff_id, from_scope, to_scope, belief_state_id,
--           belief_state_version, payload)
--     VALUES ('<ctx>', 'ho-probe-a', 'Laboratory', 'Threshold', 'bs-probe', 1,
--             '{"epistemic_debt_score": 7}'::jsonb);
--
--   INSERT INTO public.cognitive_handoffs
--          (context_id, handoff_id, from_scope, to_scope, belief_state_id,
--           belief_state_version, payload)
--     VALUES ('<ctx>', 'ho-probe-b', 'Laboratory', 'Threshold', 'bs-probe', 1,
--             '{"anything": {"kind": "epistemic_debt_score", "value": 7}}'::jsonb);
--
-- B2c. THE DISCLOSED LIMIT, PROVEN RATHER THAN ASSERTED. A NESTED score must
--      SUCCEED - the CHECK reaches the top level only. This probe exists so the
--      limit is demonstrated, not merely written down. It is the one probe here
--      that is expected to INSERT.
--
--   INSERT INTO public.cognitive_handoffs
--          (context_id, handoff_id, from_scope, to_scope, belief_state_id,
--           belief_state_version, payload)
--     VALUES ('<ctx>', 'ho-probe-c', 'Laboratory', 'Threshold', 'bs-probe', 1,
--             '{"outer": {"inner": {"kind": "epistemic_debt_score"}}}'::jsonb);
--
--   EXPECT SUCCESS. This is why store.ts refuses the same document at the write
--   boundary with scanForEgress. If this probe ever FAILS, the function has been
--   widened to recurse and this comment is stale.
--
-- B3. An unknown permission scope must FAIL with 23514.
--
--   INSERT INTO public.cognitive_handoffs
--          (context_id, handoff_id, from_scope, to_scope, belief_state_id,
--           belief_state_version)
--     VALUES ('<ctx>', 'ho-probe-d', 'Laboratory', 'Basement', 'bs-probe', 1);
--
-- B4. An edge whose endpoint is not a node must FAIL with 23503 - the encoded
--     form of addEdge()'s throw.
--
--   INSERT INTO public.cognitive_dependency_nodes (context_id, node_id, kind)
--     VALUES ('<ctx>', 'n1', 'claim');
--
--   INSERT INTO public.cognitive_dependency_edges (context_id, from_node, to_node)
--     VALUES ('<ctx>', 'n1', 'n-does-not-exist');
--
-- B5. An unknown node kind must FAIL with 23514.
--
--   INSERT INTO public.cognitive_dependency_nodes (context_id, node_id, kind)
--     VALUES ('<ctx>', 'n2', 'speculation');
--
-- B6. THE CASCADE, PROVEN NOT ASSUMED. Insert a valid decision, then delete the
--     belief-state version it rests on, then confirm the decision is gone.
--
--   INSERT INTO public.cognitive_decisions
--          (context_id, decision_id, action, belief_state_id,
--           belief_state_version, commitment_event_id)
--     VALUES ('<ctx>', 'dec-ok', 'probe', 'bs-probe', 1, 'ev-probe');
--
--   DELETE FROM public.cognitive_belief_states
--    WHERE context_id = '<ctx>' AND belief_state_id = 'bs-probe' AND version = 1;
--
--   SELECT count(*) AS decisions_remaining
--     FROM public.cognitive_decisions WHERE context_id = '<ctx>';
--
--   Expect 0. A non-zero count means the FK cascade is not what this migration
--   claims, and the derivability argument in the header does not hold.
--
-- TEARDOWN. Delete the context; every table here cascades from it.
--
--   DELETE FROM public.cognitive_contexts WHERE context_id = '<ctx>';
--
--   ** "Success. No rows returned" IS NOT EVIDENCE ON A DELETE. ** (On a SELECT
--   it is the correct pass for V3; on a DELETE it says nothing.) This project has
--   been misled by that exact phrase before. The count below is the only thing
--   that confirms the teardown:
--
--   SELECT
--     (SELECT count(*) FROM public.cognitive_contexts        WHERE credential_ref = 'second-migration-probe') AS contexts,
--     (SELECT count(*) FROM public.cognitive_decisions)        AS decisions_total,
--     (SELECT count(*) FROM public.cognitive_handoffs)         AS handoffs_total,
--     (SELECT count(*) FROM public.cognitive_dependency_nodes) AS nodes_total,
--     (SELECT count(*) FROM public.cognitive_dependency_edges) AS edges_total;
--
--   On TEST, with no other cognitive data present, expect all five to be 0.
-- ============================================================================


-- ============================================================================
-- §INVERSE - full rollback. Restores the pre-migration state exactly.
-- ============================================================================
--
-- Safe while the tables are empty and inert. AFTER real data exists this
-- DESTROYS it - a deliberate act, not a rollback, needing its own decision.
--
-- Children first, then their parents, then the function. Dropping the tables
-- removes their indexes and constraints with them. The function must go LAST,
-- because the CHECK constraints that call it are dropped with their tables.
--
--   DROP TABLE IF EXISTS public.cognitive_dependency_edges;
--   DROP TABLE IF EXISTS public.cognitive_dependency_nodes;
--   DROP TABLE IF EXISTS public.cognitive_decisions;
--   DROP TABLE IF EXISTS public.cognitive_handoffs;
--   DROP FUNCTION IF EXISTS public.cognitive_os_jsonb_has_internal_scalar(jsonb);
--
-- This leaves the core slice untouched: cognitive_contexts, cognitive_events,
-- cognitive_claims and cognitive_belief_states are NOT dropped here.
--
-- After this the always-on data-rights paths keep working: store.ts treats a
-- missing table as benign (and a missing COLUMN as NEVER benign), so
-- /api/user/export and /api/user/delete return honestly rather than erroring.
-- ============================================================================
