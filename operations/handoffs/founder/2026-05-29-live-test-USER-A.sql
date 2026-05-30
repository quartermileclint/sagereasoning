-- ============================================================================
-- R17 Erasure live test — TEST environment only. Test user A.
-- user_id = 9e1c4ea3-b1a1-4440-823b-a20727d62099
--
-- Open this file in a text editor, copy each numbered block into the Supabase
-- SQL editor, run it, and check the expected result. Copy from THIS file (not
-- the chat) so nothing gets reformatted.
-- ============================================================================


-- ─── BLOCK 1: SEED (run once) ───────────────────────────────────────────────
-- Expected: "Success. No rows returned."
DO $$
DECLARE
  uid uuid := '9e1c4ea3-b1a1-4440-823b-a20727d62099';
  pid uuid;
  pe  uuid;
BEGIN
  INSERT INTO mentor_profiles (user_id, encrypted_profile, encryption_meta)
    VALUES (uid, 'PLACEHOLDER',
            '{"iv":"x","authTag":"x","algorithm":"AES-256-GCM","version":1}'::jsonb)
    RETURNING id INTO pid;
  INSERT INTO mentor_baseline_appendix (user_id, submitted_at, encrypted_payload, encryption_meta)
    VALUES (uid, now(), 'PLACEHOLDER',
            '{"iv":"x","authTag":"x","algorithm":"AES-256-GCM","version":1}'::jsonb);
  INSERT INTO realtime_journal_entries (user_id, impression, assent, action)
    VALUES (uid, 'test impression', 'test assent', 'test action');
  INSERT INTO passion_events (user_id, passion_type, intensity, caught_before_assent, false_judgement)
    VALUES (uid, 'fear', 3, true, 'test false judgement') RETURNING id INTO pe;
  INSERT INTO premeditatio_entries (user_id, anticipated_event, false_impression, correct_judgement, linked_passion_event_id)
    VALUES (uid, 'test event', 'test impression', 'test judgement', pe);
  INSERT INTO oikeiosis_reflections (user_id, quarter, year, stage, action_description, linked_passion_event_id)
    VALUES (uid, 1, 2026, 'self', 'test action', pe);
  INSERT INTO mentor_interactions (profile_id, interaction_type, description)
    VALUES (pid, 'reflect', 'test interaction');
  INSERT INTO mentor_observations_structured (profile_id, observation_date, observation, category, source_context)
    VALUES (pid, current_date,
            'This is a fifty-plus character test observation row used only for the erasure verification run.',
            'progress_signal', 'test');
  INSERT INTO mentor_journal_refs (profile_id, passage_id, journal_phase, journal_day, summary)
    VALUES (pid, 'p1', 'phase1', 1, 'test summary');
END $$;


-- ─── BLOCK 2: COUNT (run BEFORE delete, and again AFTER delete) ──────────────
-- Expected BEFORE delete: every value = 1.
-- Expected AFTER delete:  every value = 0.
SELECT
  (SELECT count(1) FROM mentor_profiles WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099') AS mentor_profiles,
  (SELECT count(1) FROM mentor_baseline_appendix WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099') AS mentor_baseline_appendix,
  (SELECT count(1) FROM realtime_journal_entries WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099') AS realtime_journal_entries,
  (SELECT count(1) FROM passion_events WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099') AS passion_events,
  (SELECT count(1) FROM premeditatio_entries WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099') AS premeditatio_entries,
  (SELECT count(1) FROM oikeiosis_reflections WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099') AS oikeiosis_reflections,
  (SELECT count(1) FROM mentor_interactions WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099')) AS mentor_interactions,
  (SELECT count(1) FROM mentor_observations_structured WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099')) AS mentor_observations_structured,
  (SELECT count(1) FROM mentor_journal_refs WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099')) AS mentor_journal_refs;


-- ─── BLOCK 3: DELETE (run ONCE, between the before-count and the after-count) ─
-- This runs the SAME deletes the /api/user/delete endpoint runs for the
-- intimate store, in the same foreign-key-safe order. Deleting mentor_profiles
-- cascade-removes its profile_id-scoped children automatically.
-- Expected: a series of "DELETE N" / "Success" messages.
DELETE FROM premeditatio_entries     WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099';
DELETE FROM oikeiosis_reflections    WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099';
DELETE FROM passion_events           WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099';
DELETE FROM realtime_journal_entries WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099';
DELETE FROM mentor_baseline_appendix WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099';
DELETE FROM mentor_profiles          WHERE user_id='9e1c4ea3-b1a1-4440-823b-a20727d62099';

-- Then re-run BLOCK 2. Expected: every value = 0.
