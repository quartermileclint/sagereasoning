# Live-Test Walkthrough — R17 Erasure + Portability Completeness

**For:** founder, run against a **TEST** environment only (TEST Supabase project + the app running against it — `localhost:3000` or a TEST Vercel deploy). The Cowork sandbox cannot reach `localhost`, so you run these; I supply every exact value and the expected result (PR17).

**⚠ Never run the deletion against your own account — deletion is irreversible. Use throwaway test users only.**

This test verifies two code changes from this session:
1. `/api/user/delete` now explicitly removes the intimate mentor store (belt-and-braces; erasure no longer depends on the DB cascade).
2. `/api/user/export` now includes the full intimate store, decrypting the two encrypted tables for the data subject.

Fill these in once and reuse:

```
TEST_SUPABASE_URL = https://<your-test-project>.supabase.co
TEST_ANON_KEY     = <test project anon/public key>
TEST_APP_URL      = http://localhost:3000        (or your TEST Vercel URL)
```

---

## Part 1 — Deletion test (the Critical verification)

### Step 1 — Create throwaway test user A
Supabase dashboard → **Authentication → Users → Add user**. Email `test-erasure-A@example.com`, any password, tick **Auto Confirm User**. Copy the new user's **UUID** (the `id` column). Call it `UID_A`.

**Confirm:** the user appears in the Users list with a UUID. ✅ before continuing.

### Step 2 — Seed one row in every intimate table
Supabase dashboard → **SQL Editor** → paste, replace `UID_A_HERE` with the UUID from Step 1, **Run**:

```sql
DO $$
DECLARE
  uid uuid := 'UID_A_HERE';
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
  INSERT INTO mentor_profile_snapshots (profile_id) VALUES (pid);
END $$;
```

**Expected:** `Success. No rows returned.` If any table errors with "column does not exist", stop and tell me — it means that TEST project's schema differs from the migrations I read.

### Step 3 — Confirm the rows exist (counts BEFORE deletion)
SQL Editor → paste, replace **both** `UID_A_HERE`, **Run**:

```sql
SELECT 'mentor_profiles' t, count(*) n FROM mentor_profiles WHERE user_id='UID_A_HERE'
UNION ALL SELECT 'mentor_baseline_appendix', count(*) FROM mentor_baseline_appendix WHERE user_id='UID_A_HERE'
UNION ALL SELECT 'realtime_journal_entries', count(*) FROM realtime_journal_entries WHERE user_id='UID_A_HERE'
UNION ALL SELECT 'passion_events', count(*) FROM passion_events WHERE user_id='UID_A_HERE'
UNION ALL SELECT 'premeditatio_entries', count(*) FROM premeditatio_entries WHERE user_id='UID_A_HERE'
UNION ALL SELECT 'oikeiosis_reflections', count(*) FROM oikeiosis_reflections WHERE user_id='UID_A_HERE'
UNION ALL SELECT 'mentor_interactions', count(*) FROM mentor_interactions WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id='UID_A_HERE')
UNION ALL SELECT 'mentor_observations_structured', count(*) FROM mentor_observations_structured WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id='UID_A_HERE')
UNION ALL SELECT 'mentor_journal_refs', count(*) FROM mentor_journal_refs WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id='UID_A_HERE')
UNION ALL SELECT 'mentor_profile_snapshots', count(*) FROM mentor_profile_snapshots WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id='UID_A_HERE');
```

**Expected:** every `n` is **1**. Record this. ✅ before continuing.

### Step 4 — Get an access token for user A
In a terminal (replace the three placeholders + password):

```bash
curl -s -X POST "TEST_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: TEST_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"email":"test-erasure-A@example.com","password":"YOUR_PASSWORD"}'
```

**Expected:** a JSON blob. Copy the value of `"access_token"` (long string). Call it `TOKEN_A`.

### Step 5 — Call the delete endpoint
```bash
curl -i -X DELETE "TEST_APP_URL/api/user/delete" \
  -H "Authorization: Bearer TOKEN_A" -H "Content-Type: application/json" \
  -d '{"confirm":"DELETE"}'
```

**Expected:** `HTTP/1.1 200` and body `{"status":"deleted", ...}`.
If you get `207` / `"partial_deletion"`, copy the `errors` array and send it to me — that is the one case we want to inspect (e.g. the `support_*` audit-table `RESTRICT` edge, which a clean test user should not hit).

### Step 6 — Confirm 0 rows remain (counts AFTER deletion)
Re-run the **exact Step 3 query**.

**Expected:** every `n` is **0**. This is the headline result: the intimate store is fully erased.

---

## Part 2 — Export test

### Step 1 — Create + seed test user B
Repeat Part 1 Steps 1–2 with `test-export-B@example.com` → `UID_B`. (The encrypted tables will hold placeholder ciphertext; that is fine — the export will report a graceful `decryption_error` for those two, which still proves the table is now covered. To see real decrypted content instead, seed user B by driving the app's mentor flow rather than raw SQL.)

### Step 2 — Get token for B
Repeat Part 1 Step 4 with B's email → `TOKEN_B`.

### Step 3 — Call export
```bash
curl -s "TEST_APP_URL/api/user/export" -H "Authorization: Bearer TOKEN_B" -o export.json
```

### Step 4 — Confirm the intimate tables are now present
```bash
cat export.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(sorted(d.keys()))"
```

**Expected:** the keys include all of —
`mentor_profile, mentor_baseline_appendix, realtime_journal_entries, passion_events, premeditatio_entries, oikeiosis_reflections, founder_hub_entries, mentor_interactions, mentor_profile_snapshots, mentor_journal_refs, mentor_observations_structured, mentor_passion_map, mentor_causal_tendencies, mentor_value_hierarchy, mentor_oikeiosis_map, mentor_virtue_profile`
— in addition to the original `profile, evaluations, baseline_assessments, journal_entries, deliberation_chains, deliberation_steps, location, analytics_events`.

Spot-check a seeded table has content:
```bash
cat export.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('passion_events rows:', len(d.get('passion_events',[])))"
```
**Expected:** `passion_events rows: 1`.

### Step 5 — Clean up
Supabase → Authentication → Users → delete test user B (and A if it somehow survived).

---

## What "verified" means here
- **Deletion (Critical):** Part 1 Step 6 shows **0** in every intimate table → the explicit-delete change is **Verified-live**.
- **Export (Elevated):** Part 2 Step 4 shows the intimate keys present and a seeded row non-empty → the portability change is **Verified-live**.

Report the Step 3-vs-Step 6 counts and the Step 4 key list back to me and I'll record them in the decision-log entry.
