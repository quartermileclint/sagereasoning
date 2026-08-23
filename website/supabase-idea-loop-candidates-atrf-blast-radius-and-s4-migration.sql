-- ============================================================================
-- SageReasoning -- idea_loop_candidates: the GS-ATRF-2 blast-radius columns +
-- the S4 traceability extension. ONE additive migration, ONE window.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query (TEST first, then prod --
--   each section its own founder-performed gate; the AI does no Supabase action)
-- ============================================================================
-- WHY, and what is RULED vs what this build session ELECTED (the distinction
-- matters -- do not read all six columns as equally mandated):
--
--   RULED (mentor, 2026-08-23 -- operations/agent-circles-2026-08/
--   2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md; verbatim wins):
--     * Q-B1: "The specified shape is confirmed as the migration's scope."
--       -- the shape being operations/primal-substrate-2026-08/gs-atrf-2-shape.md.
--     * Q-B1: "the target_circle column is elected ... The column is therefore
--       required, not merely preferred." Reason given: "without target_circle, a
--       persisted high is not auditable because the dikaiosyne dimension's input
--       is unrecoverable from the row. Auditability is a requirement of the
--       dikaiosyne dimension's honest operation, not an optional feature."
--     * Q-B2 x Q-D1: Q-D1 elected the PRE-GENERATION STEP, so the conditional
--       branch that binds is "the three blast-radius columns and the S4
--       watching-table extension ride one founder-walked migration window. The
--       heuristic-CHECK widening does not occur." THIS FILE IS THAT WINDOW.
--       *** The heuristic CHECK is NOT touched by this migration. ***
--     * Q-B2: "The S4 extension's column set is not specified here -- that
--       specification belongs to the build session."
--     * The manifest's own ATRF text fixes the vocabulary at three values
--       (high|medium|low) and requires TWO records, not one -- the loop's
--       indicator and "the agent's own assessment of blast radius ... recorded
--       alongside the loop's indicator for longitudinal comparison."
--
--   ELECTED BY THIS BUILD SESSION (named, with reasoning, in the decision-log
--   entry -- these are engineering decisions the rulings deliberately left open):
--     * blast_radius_basis (column 4) -- Q-B1 left basis-copy durability "with
--       the build session." Elected IN, for a reason the shape document did not
--       have: Q-A4's ruled null-plus-flag needs somewhere to put the FLAG. A bare
--       NULL blast_radius is ambiguous three ways (the proxy had no basis / the
--       runner does not compute it / the write dropped it). Only a stored
--       disclosure distinguishes them, and C11 rules the disclosure is persisted,
--       not computed at read time.
--     * traceability_check + extraction_evidence (columns 5-6) -- the S4 column
--       set, this session's to specify per Q-B2. See the per-column notes.
--
-- WHAT THIS MIGRATION DOES NOT DO:
--   * It does not touch the `heuristic` CHECK (Q-D1 elected the pre-generation
--     step; the eighth-heuristic branch did not fire).
--   * It does not touch the `cycle_outcome` CHECKs at either level.
--   * It does not touch idea_loop_cycles at all.
--   * It does not add, alter, or drop any RLS policy or grant -- both tables are
--     already service-role-only with anon/authenticated/PUBLIC revoked
--     (supabase-idea-loop-watching-migration.sql section 3), and new columns
--     inherit the table's posture with no extra work.
--   * It does not add a retain_until -- the row already has retention and
--     data-rights coverage through its cycle (FK ON DELETE CASCADE). PR24 is not
--     engaged: PR24 is conditional on a table DECLARING retain_until, and this
--     migration declares none.
--   * It mints nothing, flips no flag, and deploys nothing.
--
-- ADDITIVE + IDEMPOTENT + REVERSIBLE. Every column is nullable with NO default
-- and NO cross-column constraint, so:
--   (a) no existing row can be invalidated -- all 6 columns arrive NULL;
--   (b) a candidate write that omits every new field is byte-identical to today
--       (the paired code change omits absent fields from the insert object
--       entirely rather than sending explicit nulls -- so this migration and that
--       deploy are order-independent, and the S4 build-success criterion "a
--       candidate write with the new column absent behaves byte-identically" is
--       satisfied by construction, asserted by a test, not by inspection);
--   (c) each column can be dropped independently.
--
-- COHERENCE IS VALIDATED AT THE ROUTE, NOT IN A DB CHECK -- deliberately. The
-- house pattern on this table is that the handler 400s on an unrecognised value
-- BEFORE any DB call is made (see the `not_selected` migration's own note: "the
-- route 400s on an unrecognised value BEFORE any DB call is made -- the CHECK
-- alone would not have been sufficient"). A cross-column DB CHECK would also
-- break the independent-nullability that makes each column separately
-- droppable and separately deployable.
--
-- ORDER: this migration lands on TEST then production BEFORE the paired code
-- change is pushed. That ordering is standing discipline, not a dependency here
-- (see (b) above) -- the code is safe in either order by construction, and the
-- discipline is kept anyway.
--
-- Decision log: D-MENTOR-RULINGS-ATRF-SIXTEEN-ADOPTED-EXECUTED-2026-08-23 (the
--   rulings); this migration's own record is appended at the founder-walked close.
-- Risk classification: Critical under 0d-ii (schema change to a live table
--   carrying real production rows from the bounded validation run; founder-walked
--   0c-ii, PR17/AC7). Reversible via the section INVERSE blocks.
-- ============================================================================


-- ############################################################
-- SECTION 1 -- the three RULED GS-ATRF-2 columns
-- ############################################################

-- ------------------------------------------------------------
-- §1.PRE -- read-only. Confirm none of the three columns exists yet, and record
-- the row count the migration must leave untouched.
-- ------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'idea_loop_candidates'
  AND column_name IN ('blast_radius', 'agent_blast_radius', 'target_circle');
-- EXPECT: 0 rows (none of the three exists).

SELECT count(*) AS candidate_rows FROM public.idea_loop_candidates;
-- RECORD this number. §1.VERIFY re-reads it; it must be IDENTICAL.

-- ------------------------------------------------------------
-- §1.APPLY
-- ------------------------------------------------------------
BEGIN;

-- (1) The loop's own indicator, computed at proposal time WITHOUT task details.
--     Vocabulary fixed by manifest.md's ATRF section, not chosen here.
--     NULL is meaningful: per Q-A4 (null-plus-flag) a NULL here means the
--     four-virtue proxy HAD NO BASIS -- not that it ran and returned a middling
--     result. The disclosure that says so is stored in blast_radius_basis (§2).
ALTER TABLE public.idea_loop_candidates
  ADD COLUMN IF NOT EXISTS blast_radius TEXT;

ALTER TABLE public.idea_loop_candidates
  DROP CONSTRAINT IF EXISTS idea_loop_candidates_blast_radius_check;
ALTER TABLE public.idea_loop_candidates
  ADD CONSTRAINT idea_loop_candidates_blast_radius_check
  CHECK (blast_radius IS NULL OR blast_radius IN ('high', 'medium', 'low'));

-- (2) The AGENT's own assessment -- the second of the manifest's two required
--     records. A DIFFERENT ACTOR AT A DIFFERENT MOMENT than (1): the loop
--     assesses at proposal time, the agent after election and execution. The
--     comparison between the two IS the longitudinal signal; a single-field
--     shape can only represent one of the two things being compared.
ALTER TABLE public.idea_loop_candidates
  ADD COLUMN IF NOT EXISTS agent_blast_radius TEXT;

ALTER TABLE public.idea_loop_candidates
  DROP CONSTRAINT IF EXISTS idea_loop_candidates_agent_blast_radius_check;
ALTER TABLE public.idea_loop_candidates
  ADD CONSTRAINT idea_loop_candidates_agent_blast_radius_check
  CHECK (agent_blast_radius IS NULL OR agent_blast_radius IN ('high', 'medium', 'low'));

-- (3) target_circle -- RULED ELECTED (Q-B1), required not preferred.
--     SMALLINT 1..5 mirrors OikeiosisCircleRank (idea-loop-types.ts:41), the
--     loop's own LOCAL, closed, ordered five-rank enumeration.
--
--     *** C15 CLOSURE, DISCHARGED HERE (Q-B1: "the design document must state
--     which circle enumeration the dikaiosyne dimension counts over"). ***
--     The enumeration is the IDEA loop's own OikeiosisCircleRank (1..5) --
--     deliberately NOT the free-form OikeiosisCircle in profiles.ts used across
--     the live trust core, and NOT the layer1-extractor's string vocabulary
--     (self_preservation | household | local_community | political_community |
--     cosmopolis). Per the C15 ruling this NAMES the domain; it does not resolve
--     or reopen the coexistence of the two vocabularies, each canonical within
--     its own domain.
--
--     C16 inherited explicitly: the dikaiosyne dimension counts WHICH CIRCLES
--     ARE ENGAGED (reach), never HOW MANY INDIVIDUALS fall within one
--     (headcount). A proposal reaching circle 5 reads high because it reaches
--     the cosmopolitan circle, not because many beings are affected.
ALTER TABLE public.idea_loop_candidates
  ADD COLUMN IF NOT EXISTS target_circle SMALLINT;

ALTER TABLE public.idea_loop_candidates
  DROP CONSTRAINT IF EXISTS idea_loop_candidates_target_circle_check;
ALTER TABLE public.idea_loop_candidates
  ADD CONSTRAINT idea_loop_candidates_target_circle_check
  CHECK (target_circle IS NULL OR (target_circle >= 1 AND target_circle <= 5));

COMMIT;

-- ------------------------------------------------------------
-- §1.VERIFY
-- ------------------------------------------------------------
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'idea_loop_candidates'
  AND column_name IN ('blast_radius', 'agent_blast_radius', 'target_circle')
ORDER BY column_name;
-- EXPECT: 3 rows. is_nullable = YES on all three. column_default NULL on all three.
--   agent_blast_radius | text     | YES | (null)
--   blast_radius       | text     | YES | (null)
--   target_circle      | smallint | YES | (null)

SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_candidates'::regclass
  AND conname IN (
    'idea_loop_candidates_blast_radius_check',
    'idea_loop_candidates_agent_blast_radius_check',
    'idea_loop_candidates_target_circle_check')
ORDER BY conname;
-- EXPECT: 3 rows, each permitting NULL plus its ruled value set.

SELECT count(*) AS candidate_rows,
       count(blast_radius)       AS blast_radius_populated,
       count(agent_blast_radius) AS agent_blast_radius_populated,
       count(target_circle)      AS target_circle_populated
FROM public.idea_loop_candidates;
-- EXPECT: candidate_rows IDENTICAL to §1.PRE; all three populated counts = 0.

-- ------------------------------------------------------------
-- §1.INVERSE -- reversible. Safe unconditionally: the columns are additive and
-- nullable and no read path requires them.
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.idea_loop_candidates DROP COLUMN IF EXISTS target_circle;
-- ALTER TABLE public.idea_loop_candidates DROP COLUMN IF EXISTS agent_blast_radius;
-- ALTER TABLE public.idea_loop_candidates DROP COLUMN IF EXISTS blast_radius;
-- COMMIT;
-- (DROP COLUMN removes the attached CHECK constraints with it.)


-- ############################################################
-- SECTION 2 -- blast_radius_basis (ELECTED by this build session, not ruled)
-- ############################################################
-- Two jobs, one column, discriminated by an explicit boolean:
--
--   Shape A -- the proxy RAN. C11 ("Persisted. A high should remain auditable
--   after the derivation changes."): the four ruled GS-ATRF-1 dimensions and
--   what each was derived from, plus the standing proxy disclosure carried on
--   every reading regardless of which dimensions drove it:
--     { "assessed": true,
--       "dimensions": {
--         "circles_affected":        { ... },   -- dikaiosyne: what is owed to whom
--         "reversibility":           { ... },   -- andreia:    reversion difficulty
--         "preferred_indifferents":  { ... },   -- phronesis:  what is at stake
--         "impulse_proportionality": { ... } }, -- sophrosyne: excess over reason
--       "proxy_disclosure": "..." }
--
--   Shape B -- the proxy had NO BASIS (Q-A4's null-plus-flag; the
--   friction_detection case, which carries no targetCircle by construction).
--   The disclosure string is RULED VERBATIM at Q-A4 and must not be reworded:
--     { "assessed": false,
--       "disclosure": "loop-level blast-radius assessment not available for this
--                      candidate type; agent assessment recorded separately" }
--
-- WHY NOT A BARE BOOLEAN isProxy FLAG: it satisfies the letter of "explicit
-- proxy disclosure" and loses exactly the traceability the mentor's build-success
-- criterion asks for -- a `high` should be legible after the fact as WHICH
-- dimensions drove it, not merely flagged as approximate.
--
-- WHY JSONB AND NOT COLUMNS: the four dimensions are a structured record whose
-- internal shape the shape document deliberately left unspecified at byte level
-- ("It does not specify blastRadiusBasis's exact JSON shape ... only that it is
-- structured, persisted, names which of the four dimensions drove the reading,
-- and carries the standing proxy disclosure"). Four more typed columns would fix
-- at DDL level what was deliberately left open.
--
-- KG7 (JSONB storage format): the value is written as a JSON object by the
-- PostgREST client, never as a stringified JSON scalar. The handler validates
-- the discriminant and rejects a string-typed body value before any DB call.

-- ------------------------------------------------------------
-- §2.PRE
-- ------------------------------------------------------------
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'idea_loop_candidates'
  AND column_name = 'blast_radius_basis';
-- EXPECT: 0 rows.

-- ------------------------------------------------------------
-- §2.APPLY
-- ------------------------------------------------------------
BEGIN;

ALTER TABLE public.idea_loop_candidates
  ADD COLUMN IF NOT EXISTS blast_radius_basis JSONB;

-- The ONLY DB-level constraint is the discriminant's presence and type when the
-- column is populated at all. Everything else (dimension completeness, the ruled
-- Shape-B string, coherence with blast_radius) is validated at the route, where
-- it can return a clear 400 naming the field instead of an opaque 23514.
ALTER TABLE public.idea_loop_candidates
  DROP CONSTRAINT IF EXISTS idea_loop_candidates_blast_radius_basis_check;
ALTER TABLE public.idea_loop_candidates
  ADD CONSTRAINT idea_loop_candidates_blast_radius_basis_check
  CHECK (
    blast_radius_basis IS NULL
    OR (
      jsonb_typeof(blast_radius_basis) = 'object'
      -- COALESCE IS LOAD-BEARING, NOT DEFENSIVE NOISE. A Postgres CHECK is
      -- violated ONLY when its expression evaluates to FALSE; a NULL result
      -- PASSES. The `->` operator returns SQL NULL for an ABSENT key, and
      -- jsonb_typeof(NULL) is NULL, so the bare comparison
      --     jsonb_typeof(blast_radius_basis -> 'assessed') = 'boolean'
      -- yields NULL for exactly the input this constraint exists to reject:
      -- an object with NO discriminant at all. TRUE AND NULL = NULL,
      -- FALSE OR NULL = NULL, and the row would have been ACCEPTED.
      -- COALESCE forces the absent case to a concrete non-matching value, so
      -- it evaluates FALSE and the CHECK actually fires.
      -- (Found pre-apply 2026-08-23 by reasoning through the three-valued
      -- logic; §2.VERIFY-BEHAVIOURAL (ii) below is the probe that would
      -- otherwise have caught it at TEST — run it, do not skip it.)
      AND COALESCE(jsonb_typeof(blast_radius_basis -> 'assessed'), '<absent>') = 'boolean'
    )
  );

COMMIT;

-- ------------------------------------------------------------
-- §2.VERIFY
-- ------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'idea_loop_candidates'
  AND column_name = 'blast_radius_basis';
-- EXPECT: 1 row -- blast_radius_basis | jsonb | YES

SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_candidates'::regclass
  AND conname = 'idea_loop_candidates_blast_radius_basis_check';
-- EXPECT: 1 row.

-- §2.VERIFY-BEHAVIOURAL (TEST ONLY -- DO NOT RUN ON PRODUCTION).
-- Proves the CHECK actually fires rather than merely existing. Both statements
-- MUST fail with 23514 check_violation. If either SUCCEEDS, the CHECK is not
-- doing its job -- STOP and re-derive before continuing.
--
-- PRECONDITION, run FIRST (INDEPENDENT-REVIEW FINDING 2026-08-23, MEDIUM,
-- folded): both statements below target
-- `id = (SELECT id FROM public.idea_loop_candidates LIMIT 1)`. On an EMPTY
-- table the subquery is NULL, `id = NULL` matches nothing, and both UPDATEs
-- silently run as `UPDATE 0` -- no error, no proof either way. This probe is
-- the safety net named in the COALESCE fix's own comment above (§1.APPLY);
-- its silent vacuity would be load-bearing exactly where it matters most.
-- A `UPDATE 0` result on either statement below is a FAILED PROBE, not a
-- pass -- confirm rows exist first:
--   SELECT count(*) FROM public.idea_loop_candidates;   -- must be >= 1
--
--   -- (i) a non-object value:
--   UPDATE public.idea_loop_candidates SET blast_radius_basis = '"nope"'::jsonb
--   WHERE id = (SELECT id FROM public.idea_loop_candidates LIMIT 1);
--   -- (ii) an object missing the boolean discriminant:
--   UPDATE public.idea_loop_candidates SET blast_radius_basis = '{"dimensions":{}}'::jsonb
--   WHERE id = (SELECT id FROM public.idea_loop_candidates LIMIT 1);
-- EXPECT (both): ERROR 23514 ... violates check constraint
--   "idea_loop_candidates_blast_radius_basis_check"

-- ------------------------------------------------------------
-- §2.INVERSE
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.idea_loop_candidates DROP COLUMN IF EXISTS blast_radius_basis;
-- COMMIT;


-- ############################################################
-- SECTION 3 -- the S4 traceability extension (column set specified HERE, per
-- Q-B2: "S4 column set specified at build session")
-- ############################################################
-- The criterion (mentor, verbatim): "genuine examination produces verdicts that
-- are traceable to the specific content examined, proportionate to the actual
-- virtue domains engaged, and consistent across equivalent inputs. Simulated
-- examination produces verdicts that are confident, formulaic, and contaminated
-- by context that was not in the input."
--
-- The infrastructure consequence, verbatim: "the watching table needs to carry
-- not just the proximity verdict but the traceability evidence -- the specific
-- content from the input that generated each extraction element."
--
-- TWO COLUMNS.
--
-- (5) traceability_check -- the FOUR-valued recording vocabulary, already fixed
--     by the B7 ruling and carried in traceability-criterion.md:
--       clean          -- both readings produced, and they agree per the pass case
--       diverged       -- both produced, and one of the named signatures fired
--       not_comparable -- one side made no attempt (an honest served fallback)
--       unlabelled     -- the cycle predates the check, or the raw material is gone
--     Under B5's frozen discriminator, not_comparable behaves like unlabelled:
--     OUT OF SCOPE, NEVER INFERRED CLEAN. Inferring clean from a non-comparison
--     -- treating "the check could not be applied" as evidence of agreement -- is
--     the exact error the unlabelled category exists to prevent.
--
-- (6) extraction_evidence -- BOUNDED VERBATIM, not a derived summary. This is
--     open design point Q4-c, which the mentor did not rule; it is decided here
--     with reasoning:
--       * The criterion's first property is SOURCE-EXISTENCE -- "can a specific
--         span of the submitted text be named as this element's source?" A count
--         cannot answer that question. Only the element's own text can.
--       * The row already carries proposed_action verbatim (capped 5000), so the
--         submitted text is already present; the extraction ELEMENTS are the half
--         that is missing, and without them the first property is uncheckable
--         from the row at all.
--       * The row-growth objection is answered by BOUNDING rather than by
--         summarising: caps on elements-per-category and chars-per-element,
--         enforced at the route.
--
--     WHICH CANDIDATES MAY CARRY IT -- a tension between two source documents,
--     resolved here rather than left for a reader to hit:
--       * S4 section 4 says "Populated for the winner only, at minimum."
--       * traceability-criterion.md section 2 (LATER, and resting on the Q4-e
--         ruling) makes guardrail-internal coherence for FILTERED candidates half
--         the criterion's spine -- and that stream needs the filtered candidate's
--         guardrail extraction elements.
--     Resolution: the SCHEMA permits the column on ANY candidate row (it costs
--     nothing -- one nullable column); the POLICY of which candidates the runner
--     populates is the runner's, not the schema's. Restricting the column to
--     winners would foreclose, at DDL level, the evidence stream the later
--     ruling made half the criterion. "At minimum" is honoured; the ceiling is
--     not built into the table.
--
--     Shape (validated at the route; deliberately not fixed by a DB CHECK
--     beyond the object discriminant, for the same reason as section 2):
--       { "winner": true|false,
--         "guardrail": { "control_filter_elements": [...],
--                        "oikeiosis_circles_engaged": [...],
--                        "kathekon_factors": [...],
--                        "virtue_domains": [...], "proximity": "..." },
--         "reason":    { ...same shape, or absent when the candidate never
--                        reached /api/reason -- which is the ordinary state for
--                        every rejected_by_guardrail candidate, BY CONSTRUCTION,
--                        and is exactly why traceability_check reads
--                        not_comparable rather than clean for that class },
--         "divergence": { ... }   -- present only when traceability_check='diverged'
--       }

-- ------------------------------------------------------------
-- §3.PRE
-- ------------------------------------------------------------
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'idea_loop_candidates'
  AND column_name IN ('traceability_check', 'extraction_evidence');
-- EXPECT: 0 rows.

-- ------------------------------------------------------------
-- §3.APPLY
-- ------------------------------------------------------------
BEGIN;

ALTER TABLE public.idea_loop_candidates
  ADD COLUMN IF NOT EXISTS traceability_check TEXT;

ALTER TABLE public.idea_loop_candidates
  DROP CONSTRAINT IF EXISTS idea_loop_candidates_traceability_check_check;
ALTER TABLE public.idea_loop_candidates
  ADD CONSTRAINT idea_loop_candidates_traceability_check_check
  CHECK (traceability_check IS NULL OR traceability_check IN (
    'clean', 'diverged', 'not_comparable', 'unlabelled'
  ));

ALTER TABLE public.idea_loop_candidates
  ADD COLUMN IF NOT EXISTS extraction_evidence JSONB;

ALTER TABLE public.idea_loop_candidates
  DROP CONSTRAINT IF EXISTS idea_loop_candidates_extraction_evidence_check;
ALTER TABLE public.idea_loop_candidates
  ADD CONSTRAINT idea_loop_candidates_extraction_evidence_check
  CHECK (
    extraction_evidence IS NULL
    OR jsonb_typeof(extraction_evidence) = 'object'
  );

COMMIT;

-- ------------------------------------------------------------
-- §3.VERIFY
-- ------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'idea_loop_candidates'
  AND column_name IN ('traceability_check', 'extraction_evidence')
ORDER BY column_name;
-- EXPECT: 2 rows.
--   extraction_evidence | jsonb | YES
--   traceability_check  | text  | YES

SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_candidates'::regclass
  AND conname IN (
    'idea_loop_candidates_traceability_check_check',
    'idea_loop_candidates_extraction_evidence_check')
ORDER BY conname;
-- EXPECT: 2 rows; the traceability def lists exactly the four values.

-- ------------------------------------------------------------
-- §3.INVERSE
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.idea_loop_candidates DROP COLUMN IF EXISTS extraction_evidence;
-- ALTER TABLE public.idea_loop_candidates DROP COLUMN IF EXISTS traceability_check;
-- COMMIT;


-- ############################################################
-- SECTION 4 -- in-schema documentation (run last; pure COMMENT statements,
-- no structural effect, safe to re-run)
-- ############################################################
BEGIN;

COMMENT ON COLUMN public.idea_loop_candidates.blast_radius IS
  'GS-ATRF-2 loop-level blast-radius PROXY (RULED). The loop''s own indicator, '
  'computed at proposal time from the candidate''s virtue domains + target_circle, '
  'WITHOUT task details. Vocabulary fixed by manifest.md (high|medium|low). '
  'NOT the permission-layer blast-radius enrichment (item 16) -- same name-root, '
  'different method, producer, and moment; never shorten either to bare "blast '
  'radius". NULL means the four-virtue proxy HAD NO BASIS (Q-A4 null-plus-flag), '
  'not that it ran and returned a middling result; blast_radius_basis carries the '
  'disclosure that says so.';

COMMENT ON COLUMN public.idea_loop_candidates.agent_blast_radius IS
  'The AGENT''s own blast-radius assessment -- the second of the manifest''s two '
  'required records, "recorded alongside the loop''s indicator for longitudinal '
  'comparison". A DIFFERENT ACTOR AT A DIFFERENT MOMENT than blast_radius (loop, '
  'proposal time vs agent, post-election). The COMPARISON is the signal. Per Q-A4: '
  'a NULL blast_radius beside a populated agent_blast_radius is not a '
  'contradiction -- it reads as "the loop could not assess; the agent did", which '
  'is itself a signal about the proxy''s coverage.';

COMMENT ON COLUMN public.idea_loop_candidates.target_circle IS
  'RULED ELECTED (Q-B1) -- required, not preferred: without it a persisted '
  'blast_radius of high is not auditable, because the dikaiosyne dimension''s '
  'input is unrecoverable from the row. ENUMERATION (the C15 closure, discharged): '
  'the IDEA loop''s own LOCAL closed five-rank OikeiosisCircleRank (1..5, '
  'idea-loop-types.ts:41) -- NOT profiles.ts''s free-form OikeiosisCircle, and NOT '
  'the layer1-extractor string vocabulary. Naming the domain is what C15 requires; '
  'the coexistence of the vocabularies is neither resolved nor reopened here. '
  'C16: counts WHICH CIRCLES ARE ENGAGED (reach), never headcount within a circle.';

COMMENT ON COLUMN public.idea_loop_candidates.blast_radius_basis IS
  'ELECTED by the build session (Q-B1 left basis-copy durability to it). Two '
  'shapes, discriminated by the boolean "assessed". assessed=true: the four ruled '
  'GS-ATRF-1 dimensions (circles affected / reversibility / preferred indifferents '
  'at stake / impulse proportionality) with what each was derived from, plus the '
  'standing proxy disclosure. assessed=false: the Q-A4 RULED VERBATIM flag string '
  '"loop-level blast-radius assessment not available for this candidate type; '
  'agent assessment recorded separately" -- do not reword it. Persisted, never '
  'recomputed on read (C11): a high recorded before a derivation change stays '
  'auditable as what drove it AT THE TIME.';

COMMENT ON COLUMN public.idea_loop_candidates.traceability_check IS
  'S4 traceability criterion -- the FOUR-valued B7 recording vocabulary. '
  'clean | diverged | not_comparable | unlabelled. not_comparable behaves like '
  'unlabelled under B5''s frozen discriminator: OUT OF SCOPE, NEVER INFERRED '
  'CLEAN. A rejected_by_guardrail candidate never reaches /api/reason, so its '
  'cross-endpoint row is not_comparable BY CONSTRUCTION -- that is honest, not a '
  'defect. Nullable and non-blocking: this column must never be able to fail a '
  'cycle record.';

COMMENT ON COLUMN public.idea_loop_candidates.extraction_evidence IS
  'S4 -- the mentor''s "specific content from the input that generated each '
  'extraction element", BOUNDED VERBATIM (open design point Q4-c, decided at the '
  'build session: a count cannot answer a source-existence question, so summary '
  'alone would leave the criterion''s first property uncheckable from the row). '
  'Per-endpoint element records (control_filter_elements / oikeiosis_circles_'
  'engaged / kathekon_factors + virtue domains + proximity), caps enforced at the '
  'route. The SCHEMA permits any candidate row; WHICH candidates are populated is '
  'the runner''s policy -- winners at minimum, filtered candidates permitted so '
  'the guardrail-internal evidence stream (Q4-e) is not foreclosed at DDL level.';

COMMIT;


-- ############################################################
-- SECTION 5 -- POST-APPLY CONFIRMATION (read-only; run on BOTH environments)
-- ############################################################
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'idea_loop_candidates'
  AND column_name IN ('blast_radius', 'agent_blast_radius', 'target_circle',
                      'blast_radius_basis', 'traceability_check', 'extraction_evidence')
ORDER BY column_name;
-- EXPECT: exactly 6 rows, is_nullable = YES and column_default NULL on all six.

-- Retention + data-rights coverage confirmed BY QUERY, not by assumption
-- (S4 build-success criterion 4). The new columns live on a row whose deletion
-- is governed by its cycle's FK ON DELETE CASCADE; this confirms the FK is the
-- one we think it is and that it still cascades.
SELECT conname,
       confdeltype,   -- EXPECT 'c' (CASCADE)
       pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_candidates'::regclass
  AND contype = 'f'
  AND conname = 'idea_loop_candidates_cycle_id_fkey';
-- EXPECT: 1 row, confdeltype = 'c'.

-- RLS posture unchanged and still closed (no policy or grant was touched).
SELECT rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'idea_loop_candidates';
-- EXPECT: true.

SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'idea_loop_candidates'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY grantee, privilege_type;
-- EXPECT: 0 rows (anon/authenticated/PUBLIC were revoked at table creation and
-- this migration did not re-grant anything).
