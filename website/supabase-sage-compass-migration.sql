-- =====================================================================
-- Sage compass — human-practitioner decision-support tool
-- Remaining Principles #14 (the sage — sophos — as a regulative ideal)
-- =====================================================================
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot.
-- Creates the user-scoped table behind the /sage-compass practitioner tool: the
-- Stoic practice of asking, before a difficult decision, "what would the sage do?"
--
-- The mentor (#14) is precise that this is NOT a vague aspiration but a STRUCTURED
-- imaginative exercise: "identify the specific virtue domain the situation engages,
-- identify what complete understanding and unified virtue would produce in that
-- domain, and use that as the orientation for the current action. The exercise is
-- not claiming to be the sage. It is using the sage as a compass bearing."
--
-- The three questions, encoded as the row:
--   1. virtue_engaged      — which virtue is primarily engaged in this situation
--   2. complete_expression — what that virtue's COMPLETE expression would look like
--   3. distance            — the distance between that expression and the action
--                            you are considering
--
-- *** THE BINDING CONSTRAINT (mentor #14, load-bearing) ***
-- "The distance is NOT A VERDICT. It is a developmental orientation — the
--  practitioner can see the direction of travel even when the destination is far."
-- Therefore NOTHING in this schema or its route scores, ranks, or grades the
-- distance. `distance` is practitioner-authored free text. `distance_reading` is an
-- OPTIONAL, PRACTITIONER-SELECTED coarse reading (the mentor's own "even when the
-- destination is far") — it is CAPTURE, never a computed value. Neither is derived
-- from, compared against, or mapped onto the engine's katorthoma proximity scale
-- (reflexive → sage_like); that scale is deliberately NOT reused here, so a bearing
-- can never be mistaken for a score.
--
-- The ONE gated field is `expression_quality`, which classifies ONLY the
-- complete_expression's concreteness (the mentor's "this is not a vague
-- aspiration") — never the distance.
--
-- Human-only. This table + its /api/mentor/sage-compass route never touch
-- /api/reason, the signed assessment, or the substrate engine. They import NO
-- substrate / trust-core / kathekon-engagement / Gate-1 / reflect / sage-reflect /
-- proximity-domains module, so this is NOT in the /api/reason import graph or the
-- frozen capture set, and it leaves the 7-day false-hold measurement untouched.
-- The mentor's framing of the compass as "the positive complement to the passion
-- diagnosis" is CONCEPTUAL only — there is no code coupling to passion_events.
--
-- Mirrors the morning_preparation_entries / circle_extension_entries /
-- view_from_above_entries user-scoped pattern: uuid PK, user_id FK → auth.users
-- ON DELETE CASCADE, per-verb RLS on auth.uid() = user_id + a service_role FOR ALL
-- policy (the route uses the service-role key and scopes every query with
-- .eq('user_id', userId)).
--
-- Run in the Supabase SQL Editor (TEST first, then Production) — founder-walked
-- per PR17/AC7. Apply this migration BEFORE deploying the code: the route
-- reads/writes this table on every request.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.sage_compass_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The difficult decision before you, and the action you are considering. Kept as
  -- two fields because the mentor's third question measures the distance FROM "the
  -- action I am considering" — folding them into one blob makes "distance from
  -- what?" ambiguous.
  situation text NOT NULL,
  action_considered text NOT NULL,

  -- (1) Which virtue is PRIMARILY engaged (singular — the mentor's wording).
  -- A LOCAL plain-language vocabulary. Deliberately NOT the engine's virtue-domain
  -- enum and NOT imported from the substrate — this surface must stay outside the
  -- /api/reason import graph.
  virtue_engaged text NOT NULL
    CHECK (virtue_engaged IN ('wisdom', 'justice', 'courage', 'temperance')),

  -- (2) What complete understanding and unified virtue would produce here — the
  -- compass bearing. THIS is the gated field (see expression_quality).
  complete_expression text NOT NULL,

  -- (3) The distance between that expression and the action being considered.
  -- PRACTITIONER-AUTHORED. Never scored, ranked, graded, or computed. NOT A VERDICT.
  distance text NOT NULL,

  -- An OPTIONAL coarse reading the PRACTITIONER selects for themselves — the
  -- "direction of travel" the mentor names. Capture, never computed; nullable
  -- because the practitioner may decline to characterise it at all.
  distance_reading text
    CHECK (distance_reading IN ('far', 'some_way', 'close')),

  -- Quality-gate classification of the COMPLETE EXPRESSION ONLY. The LLM is
  -- restricted to classification; the tailored messages are deterministic. This
  -- encodes the mentor's "this is not a vague aspiration".
  --   'concrete' — a situation-anchored expression of what complete virtue would do
  --   'vague'    — a platitude ("act with integrity") not anchored to this situation
  -- NOTE (honest scope): this column is nullable, but no code path currently
  -- writes NULL — the gate fails open to 'concrete' on any outage or malformed
  -- response (route.ts classifyExpression), so an outage is recorded
  -- indistinguishably from a genuine positive classification. This matches the
  -- shipped /morning precedent's fail-open-to-positive behaviour; nullable is kept
  -- as a superset, not a claim that NULL is ever produced.
  -- It says nothing whatsoever about the distance.
  expression_quality text
    CHECK (expression_quality IN ('concrete', 'vague')),

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sage_compass_user_created
  ON public.sage_compass_entries(user_id, created_at DESC);

ALTER TABLE public.sage_compass_entries ENABLE ROW LEVEL SECURITY;

-- Per-verb owner policies + a service-role bypass (matches morning_preparation_entries).
DO $$ BEGIN
  CREATE POLICY "Users can view own sage compass entries"
    ON public.sage_compass_entries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own sage compass entries"
    ON public.sage_compass_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own sage compass entries"
    ON public.sage_compass_entries FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own sage compass entries"
    ON public.sage_compass_entries FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access to sage compass"
    ON public.sage_compass_entries FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- VERIFY (run after applying — expect all five green)
-- =====================================================================
-- V1. Columns:
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'sage_compass_entries'
--   ORDER BY ordinal_position;
--   Expect exactly 10 rows, in this order:
--     1 id                  2 user_id             3 situation
--     4 action_considered   5 virtue_engaged      6 complete_expression
--     7 distance            8 distance_reading    9 expression_quality
--    10 created_at
--   Nullable: distance_reading + expression_quality ONLY. distance_reading is
--   nullable because the practitioner may decline the coarse reading.
--   expression_quality is nullable as a superset only — the gate never actually
--   writes NULL (it fails open to 'concrete' on any outage, see the column comment
--   above); nullability is not evidence a gate ran cleanly.
--
-- V2. RLS enabled:
-- SELECT relrowsecurity FROM pg_class WHERE oid = 'public.sage_compass_entries'::regclass;
--   Expect: true
--
-- V3. Policies:
-- SELECT policyname FROM pg_policies WHERE tablename = 'sage_compass_entries';
--   Expect: the 5 policies above.
--
-- V4. CHECK constraints:
-- SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.sage_compass_entries'::regclass AND contype = 'c';
--   Expect: 3 CHECKs (virtue_engaged, distance_reading, expression_quality).
--
-- V5. Owner FK cascades (so a user delete removes these rows):
-- SELECT conname, confdeltype FROM pg_constraint
--   WHERE conrelid = 'public.sage_compass_entries'::regclass AND contype = 'f';
--   Expect: confdeltype = 'c'  (ON DELETE CASCADE)

-- =====================================================================
-- ROLLBACK (reversible — run to undo this migration)
-- =====================================================================
-- DROP TABLE IF EXISTS public.sage_compass_entries;  -- drops its policies + index too
