-- =====================================================================
-- Impulse — the primal-impulse examination tool (human practitioners)
-- Mentor synthesis Heading 7, ruled 2026-08-11 (B2, B3, B4, C1, C12, C13)
-- =====================================================================
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot.
-- Creates the user-scoped table behind the /impulse practitioner tool.
--
-- WHAT THE TOOL IS. The existing practice activities are "oriented toward
-- virtue aspiration" and are "less well-developed for the examination of
-- primal substrate — surfacing the specific impulse, tracing it to its passion
-- sub-species, and examining the false judgement underneath it." This tool
-- closes that gap: the practitioner names which primal impulse is most active
-- for them right now, and the committed examination runs from there.
--
-- The reframe it makes usable: "A practitioner who notices competitive
-- anxiety, territorial defensiveness about their work, or status-seeking in
-- how they present ideas to collaborators is not failing — they are generating
-- examination material."
--
-- =====================================================================
-- THE EXAMINATION IS THE COMMITTED SEQUENCE (mentor rulings A1 / C1)
-- =====================================================================
-- The five questions ARE `DIAGNOSTIC_SEQUENCE` (stoic-brain.ts:595-601, from
-- passions.json > diagnostic_use), entered from a trait — NOT a new taxonomy:
--   1 impression        — "Was the impression of the situation distorted?"
--   2 false_belief      — "Which false belief drove the assent?"
--   3 impulse_exceeded  — "Did the impulse exceed what reason warranted?"
--   4 sub_species       — "Which specific sub-species was operative?"
--   5 correct_judgement — "What is the corresponding correct judgement?"
--
-- =====================================================================
-- TWO MODES, AND WHY (mentor ruling B4)
-- =====================================================================
-- Three of the four v1 pathways resolve to a committed passion sub-species.
-- The fourth — Reciprocity / Conditional Cooperation — DOES NOT: it is not a
-- passion sub-species at all, it is a question about the GROUND of an action
-- that may be outwardly correct either way. Forcing it into the sub-species
-- shape would either invent a sub-species (an R7 source-fidelity violation) or
-- silently drop the pathway. So it is a DISTINCT MODE with the mentor's own
-- two-question set, anchored on the corpus's own `praxis` failure mode
-- (stoic-brain.ts:588): "Action from passion — externally correct behaviour
-- driven by wrong reasons."
--
-- `mode` is therefore a real structural discriminator, not a label: the
-- impulse_entries_mode_fields_check CHECK below enforces that each mode's own
-- fields are present and the other mode's are absent. The application derives
-- `mode` from the trait server-side and never reads it from the request body.
--
-- =====================================================================
-- THE ENUM VOCABULARIES, AND THE EXTENSIBILITY DECISION (C12 / C13)
-- =====================================================================
-- Every enum below carries a CHECK. The vocabularies mirror
-- `src/app/api/mentor/impulse/vocabulary.ts`, which defines them LOCALLY
-- rather than importing `stoic-brain.ts` — that file is imported directly by
-- api/guardrail/route.ts and guardrail-sandwich.ts, so this human surface must
-- not enter its import graph. C12 ruled: "Accept the duplication and add a
-- drift pin. The boundary test reads stoic-brain.ts as text — imports nothing
-- — and asserts the local IDs are a subset."
--
-- ** `trait` admits ALL ELEVEN committed traits, while only FIVE carry a v1
--    examination pathway. ** That is the deliberate resolution of C13 ("design
--    the trait vocabulary so the remaining seven can be added without a schema
--    change") against the sibling requirement that every enum be CHECKed: the
--    CHECK is real and spans the committed taxonomy, so adding a further
--    pathway is a CODE-ONLY change with no migration. A trait with no pathway
--    is rejected by the route with an honest 400, not by this constraint.
--
--    Five wired traits for four ruled pathways: the mentor's first mapping is
--    written "competition/hierarchy → philodoxia", and the research names
--    Competition and Hierarchy / Dominance as two DISTINCT traits. Both are
--    selectable and both route to the philodoxia pathway rather than being
--    merged into an invented trait name.
--
-- ** `sub_species` admits the 20 committed sub-species. ** Counted first-hand
--    in ROOT_PASSIONS (stoic-brain.ts:311-364): epithumia 6, hedone 3,
--    phobos 6, lupe 5. (The S7 scope document says "25" — that figure is
--    wrong; its per-id line citations are all correct. Recorded rather than
--    silently corrected, per the standing primary-data lesson.)
--
-- =====================================================================
-- *** INSIDE THE R20a DISTRESS PERIMETER — A RULED DEPARTURE (B3, AC5) ***
-- =====================================================================
-- Every sibling Remaining-Principles tool sits OUTSIDE the R20a human-distress
-- perimeter. THIS ONE IS INSIDE IT, by mentor ruling, because it deliberately
-- elicits shame (`aischyne` — "fear of ill-repute") and dread (`agonia` —
-- "fear of an uncertain outcome") in the practitioner's own words, beside
-- grief, envy and jealousy, and its design premise is that the practitioner
-- should NOT suppress that material — "which means the tool is doing exactly
-- what the perimeter exists to catch when it fires genuinely."
--
-- AC5 requires the departure and its reason to be recorded; it is recorded
-- here, at the head of src/app/api/mentor/impulse/r20a.ts, in the route, and
-- in the decision-log entry — because every sibling records the OPPOSITE
-- decision, so a future reader would otherwise read this one as an error.
--
-- The distress check is a ROUTE-level concern, gated behind
-- SUBSTRATE_IMPULSE_R20A_ENABLED. Nothing in this schema encodes it, and no
-- distress signal is ever persisted to this table.
--
-- =====================================================================
-- Human-only. This table and its /api/mentor/impulse route never touch
-- /api/reason, /api/guardrail, the signed assessment, or the substrate engine.
-- The link to /passion-log is PAGE PROSE ONLY — there is NO code coupling and
-- no foreign key to passion_events (mentor ruling B2: `passion_events` feeds
-- the live Phase-2 in-session practice suggestion, so it is not touched).
--
-- Mirrors the sage_compass_entries / morning_preparation_entries /
-- circle_extension_entries user-scoped pattern: uuid PK, user_id FK →
-- auth.users ON DELETE CASCADE, per-verb RLS on auth.uid() = user_id + a
-- service_role FOR ALL policy (the route uses the service-role key and scopes
-- every query with .eq('user_id', userId)).
--
-- Run in the Supabase SQL Editor (TEST first, then Production) — founder-walked
-- per PR17/AC7. Apply this migration BEFORE deploying the code: the route
-- reads/writes this table on every request.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.impulse_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- THE ENTRY POINT: which primal impulse is most active for the practitioner
  -- right now. The mentor's requirement is "not generic virtue aspiration but
  -- targeted examination of the specific primal impulse that is most active
  -- for the practitioner in their current context."
  --
  -- All ELEVEN committed traits are admitted (see the extensibility note in
  -- the header); the route rejects a trait with no v1 pathway with an honest
  -- 400. Ids mirror vocabulary.ts PRIMAL_TRAITS; the traits are cited BY NAME
  -- in every user-facing surface, never by number — the research is unnumbered.
  trait text NOT NULL
    CHECK (trait IN (
      'competition',
      'hierarchy_dominance',
      'territoriality',
      'resource_acquisition',
      'mate_competition',
      'kin_preference',
      'reciprocity',
      'threat_avoidance',
      'behavioral_flexibility',
      'social_monitoring',
      'deception_manipulation'
    )),

  -- Which examination ran. DERIVED from the trait by the application; never
  -- accepted from the request body. See the mode-fields CHECK at the foot.
  mode text NOT NULL
    CHECK (mode IN ('diagnostic_sequence', 'reciprocity')),

  -- Step 1 — the specific impression. Required in BOTH modes, and THE ONLY
  -- GATED FIELD (see impression_specificity). This is where Heading 4's
  -- specificity requirement lands: "Not 'I felt competitive' but 'I felt
  -- competitive when X said Y, because I interpreted it as a threat to Z.'
  -- The specificity is the evidence of genuine examination rather than
  -- formulaic self-report."
  impression text NOT NULL,

  -- ---- DIAGNOSTIC_SEQUENCE mode only (NULL in reciprocity mode) ----

  -- Step 2 — the false belief that drove the assent.
  false_belief text,

  -- Step 3 — "Did the impulse exceed what reason warranted?" 'uncertain' is a
  -- first-class answer: an honest "I cannot yet tell" is a better record than
  -- a forced yes/no, and nothing downstream reads this column.
  impulse_exceeded text
    CHECK (impulse_exceeded IN ('yes', 'no', 'uncertain')),

  -- Step 3, in the practitioner's own words. Optional in DIAGNOSTIC_SEQUENCE
  -- mode (adversarial review, 2026-08-12: this comment previously said
  -- "optional in both directions" — WRONG. impulse_entries_mode_fields_check
  -- below FORCES this NULL in reciprocity mode, and the route always inserts
  -- null for it there; there is no functional gap, only a doc/CHECK mismatch,
  -- now corrected).
  impulse_note text,

  -- Step 4 — which specific sub-species was operative. The 20 committed
  -- sub-species (ROOT_PASSIONS, stoic-brain.ts:311-364; Stobaeus Ecl. 2.88-92,
  -- DL 7.110-116), transcribed locally and guarded by the drift pin.
  --
  -- The trait NARROWS the candidates the page surfaces first; it does not
  -- restrict them. The committed question asks which sub-species WAS
  -- operative, and the honest answer is sometimes not the expected one — a
  -- practitioner examining a competitive impulse may find `phthonos` (envy)
  -- rather than `philodoxia` underneath it, and the schema must let them say so.
  sub_species text
    CHECK (sub_species IN (
      -- epithumia (6)
      'orge', 'eros', 'pothos', 'philedonia', 'philoplousia', 'philodoxia',
      -- hedone (3)
      'kelesis', 'epichairekakia', 'terpsis',
      -- phobos (6)
      'deima', 'oknos', 'aischyne', 'thambos', 'thorybos', 'agonia',
      -- lupe (5)
      'eleos', 'phthonos', 'zelotypia', 'penthos', 'achos'
    )),

  -- Step 5 — the correct judgement that would replace the false one.
  --
  -- *** NEVER CLASSIFIED, SCORED, RANKED, OR GRADED. *** This is the
  -- practitioner's own philosophy. Assessing it would make the tool an
  -- assessor of their reasoning about what is good, which no sibling does and
  -- which /sage-compass's binding "not a verdict" constraint rules out by
  -- analogy. There is deliberately NO quality column for this field, and the
  -- gate function does not take it as a parameter — pinned at the signature
  -- AND at both call sites in the boundary test, both mutation-verified.
  correct_judgement text,

  -- ---- Reciprocity mode only (NULL in diagnostic_sequence mode) ----

  -- The mentor's first question (B4, verbatim): "is this cooperation grounded
  -- in recognition of the other as a rational being, or in expected return?"
  -- Captured as a choice AND in the practitioner's own words. Neither is scored.
  cooperation_ground text
    CHECK (cooperation_ground IN ('rational_being', 'expected_return', 'both', 'uncertain')),
  cooperation_ground_note text,

  -- The mentor's second question (B4, verbatim): "What would the action look
  -- like if the expected return were removed?" This is a COUNTERFACTUAL, not a
  -- diagnosis — it has no analogue in the other three pathways, which is
  -- exactly why this mode genuinely differs from the sequence.
  counterfactual text,

  -- ---- The single gate ----

  -- Classification of the IMPRESSION ONLY: does it name a moment, or is it a
  -- general description? The LLM is restricted to classification; the tailored
  -- messages are deterministic and authored in the route.
  --   'specific' — names the occasion, what was said or done, and what it was
  --                taken to mean
  --   'general'  — a mood, disposition or summary with no anchoring moment
  --
  -- NOTE (honest scope): this column is nullable, but no code path currently
  -- writes NULL — the gate fails open to 'specific' on any outage or malformed
  -- response, so an outage is recorded indistinguishably from a genuine
  -- positive classification. This matches the shipped /morning and
  -- /sage-compass fail-open-to-positive behaviour; nullable is kept as a
  -- superset, not a claim that NULL is ever produced.
  --
  -- It says nothing whatsoever about the impulse, the false belief, the
  -- sub-species, or the correct judgement.
  impression_specificity text
    CHECK (impression_specificity IN ('specific', 'general')),

  created_at timestamptz NOT NULL DEFAULT now(),

  -- The mode is a structural discriminator, so the row shape is constrained to
  -- match it. Without this, a bug in the route could persist a half-shaped
  -- examination (e.g. a reciprocity entry carrying a sub-species, which would
  -- be a source-fidelity violation written into the data rather than the code).
  --
  -- Keyed on MODE, not on trait, so it stays compatible with C13's
  -- extensibility: adding a further trait to an existing mode needs no change
  -- here.
  CONSTRAINT impulse_entries_mode_fields_check CHECK (
    (mode = 'diagnostic_sequence'
       AND false_belief            IS NOT NULL
       AND impulse_exceeded        IS NOT NULL
       AND sub_species             IS NOT NULL
       AND correct_judgement       IS NOT NULL
       AND cooperation_ground      IS NULL
       AND cooperation_ground_note IS NULL
       AND counterfactual          IS NULL)
    OR
    (mode = 'reciprocity'
       AND cooperation_ground      IS NOT NULL
       AND cooperation_ground_note IS NOT NULL
       AND counterfactual          IS NOT NULL
       AND false_belief            IS NULL
       AND impulse_exceeded        IS NULL
       AND impulse_note            IS NULL
       AND sub_species             IS NULL
       AND correct_judgement       IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_impulse_user_created
  ON public.impulse_entries(user_id, created_at DESC);

ALTER TABLE public.impulse_entries ENABLE ROW LEVEL SECURITY;

-- Per-verb owner policies + a service-role bypass (matches sage_compass_entries).
DO $$ BEGIN
  CREATE POLICY "Users can view own impulse entries"
    ON public.impulse_entries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own impulse entries"
    ON public.impulse_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own impulse entries"
    ON public.impulse_entries FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own impulse entries"
    ON public.impulse_entries FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access to impulse entries"
    ON public.impulse_entries FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- VERIFY (run after applying — expect all six green)
-- =====================================================================
-- V1. Columns:
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'impulse_entries'
--   ORDER BY ordinal_position;
--   Expect exactly 15 rows, in this order:
--     1  id                       2  user_id                 3  trait
--     4  mode                     5  impression              6  false_belief
--     7  impulse_exceeded         8  impulse_note            9  sub_species
--    10  correct_judgement       11  cooperation_ground     12  cooperation_ground_note
--    13  counterfactual          14  impression_specificity 15  created_at
--   NOT NULL: id, user_id, trait, mode, impression, created_at.
--   Every other column is nullable AT THE COLUMN LEVEL because each belongs to
--   exactly one mode — their real required-ness is enforced per mode by
--   impulse_entries_mode_fields_check (V4), not by column nullability.
--
-- V2. RLS enabled:
-- SELECT relrowsecurity FROM pg_class WHERE oid = 'public.impulse_entries'::regclass;
--   Expect: true
--
-- V3. Policies:
-- SELECT policyname FROM pg_policies WHERE tablename = 'impulse_entries';
--   Expect: the 5 policies above.
--
-- V4. CHECK constraints:
-- SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.impulse_entries'::regclass AND contype = 'c';
--   Expect: 7 CHECKs — trait, mode, impulse_exceeded, sub_species,
--   cooperation_ground, impression_specificity, and the named
--   impulse_entries_mode_fields_check.
--
-- V5. Owner FK cascades (so a user delete removes these rows):
-- SELECT conname, confdeltype FROM pg_constraint
--   WHERE conrelid = 'public.impulse_entries'::regclass AND contype = 'f';
--   Expect: confdeltype = 'c'  (ON DELETE CASCADE)
--
-- V6. The mode CHECK actually bites (behavioural, TEST ONLY — do NOT run on
--     production). Both statements must FAIL with a check-violation; if either
--     succeeds, the constraint is not doing its job:
--
--   -- (a) a reciprocity row carrying a sub-species must be rejected:
--   -- INSERT INTO public.impulse_entries
--   --   (user_id, trait, mode, impression, cooperation_ground,
--   --    cooperation_ground_note, counterfactual, sub_species)
--   -- VALUES ('00000000-0000-0000-0000-000000000000', 'reciprocity',
--   --   'reciprocity', 'x', 'expected_return', 'x', 'x', 'philodoxia');
--
--   -- (b) a diagnostic row missing the correct judgement must be rejected:
--   -- INSERT INTO public.impulse_entries
--   --   (user_id, trait, mode, impression, false_belief, impulse_exceeded,
--   --    sub_species)
--   -- VALUES ('00000000-0000-0000-0000-000000000000', 'competition',
--   --   'diagnostic_sequence', 'x', 'x', 'yes', 'philodoxia');
--
--   (Both will also fail the user_id FK on a real database — run them with a
--    genuine TEST user id if you want to isolate the CHECK specifically.)

-- =====================================================================
-- ROLLBACK (reversible — run to undo this migration)
-- =====================================================================
-- DROP TABLE IF EXISTS public.impulse_entries;  -- drops its policies + index too
