# Live-Test Script — 0h criterion 1: founder-verify the live safety + privacy features

**Date:** 2026-06-03. **Stream:** founder. **Tier:** verification (0c) — Elevated. **No code or config change is planned.** This exercises six already-shipped features with throwaway test data and records the result (advances P0 0h exit criterion 1).

**For:** founder, run against a **TEST** environment only (TEST Supabase project + the app pointed at it — `localhost:3000` or a TEST Vercel deploy). The Cowork sandbox cannot reach `localhost`, so you run these; I supply every exact value and the expected result, and we go step by step — you paste a step, tell me the result, I confirm before the next (PR17).

> ## ⚠ Mandatory safety caution
> **Genuine deletion is irreversible. Use throwaway test users only. Never run the delete (Feature 1) against your own account or any real data.** The distress-catch tests (Features 4–6) send benign, obviously-test inputs and observe the response — they are non-destructive.

Fill these in once and reuse them everywhere a placeholder appears:

```
TEST_SUPABASE_URL = https://<your-test-project>.supabase.co
TEST_ANON_KEY     = <test project anon/public key>
TEST_APP_URL      = http://localhost:3000        (or your TEST Vercel URL)
```

**The two reusable test inputs** (used by Features 4, 5, 6):

- **DISTRESS input** (trips the safety catch deterministically — it matches the regex stage, so it fires even if TEST has no Anthropic key):
  `I keep thinking I want to die and there's no point in living anymore.`
- **BENIGN control input** (must NOT trip the catch — proves the catch is discriminating, not firing on everything):
  `I had a frustrating meeting with a colleague today and I want to respond better next time.`

---

## What we are proving (the six features)

| # | Feature | Claim | How verified |
|---|---|---|---|
| 1 | Genuine deletion (R17c) | Complete erasure incl. intimate mentor store | Seed every intimate table → delete → confirm 0 rows |
| 2 | Data export / portability | Full intimate store, decrypted for the subject | Export → all intimate keys present + a seeded row non-empty |
| 3 | Encryption at rest (R17b) | `realtime_journal_entries` stored as ciphertext, round-trips to readable | Write via the route → raw DB row is ciphertext + prose cols NULL → feed/export show readable |
| 4 | Distress catch — human path | Synchronous + live on `/api/reason`, `/api/reflect`, `/api/mentor/private/reflect` | POST distress input → redirect fires; POST benign → passes through |
| 5 | Distress catch — agent path | `/api/calling`, `/api/practice/reflect` — **first confirm reachable** (503 kill-switches) | If reachable in TEST, POST distress input → catch fires |
| 6 | Journal distress screening | `/api/journal`, `/api/mentor/journal-feed` screen before store | POST distress entry → redirect, not stored; benign → stored |

I have **read-verified** the wiring for all six in source this session (the gate call is present and `await`-ed on every route; the two agent routes sit behind 503 kill-switches). This script turns that code-read into a *founder-run* live confirmation — which is what 0h criterion 1 requires.

---

# FEATURE 1 — Genuine deletion (R17c) · Critical surface

### Step 1.1 — Create throwaway test user A
Supabase dashboard → **Authentication → Users → Add user**. Email `test-erasure-A@example.com`, any password, tick **Auto Confirm User**. Copy the new user's **UUID** (the `id` column). Call it `UID_A`.

**Confirm:** the user appears in the Users list with a UUID. ✅ before continuing.

### Step 1.2 — Seed one row in every intimate table
Supabase → **SQL Editor** → paste, replace `UID_A_HERE` with the UUID from 1.1, **Run**:

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

**Expected:** `Success. No rows returned.` If any table errors with "column does not exist", stop and tell me — that TEST project's schema differs from the migrations I read.

### Step 1.3 — Confirm the rows exist (counts BEFORE deletion)
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

**Expected:** every `n` is **1**. Record this list. ✅ before continuing.

### Step 1.4 — Get an access token for user A
In a terminal (replace placeholders + the password you set):

```bash
curl -s -X POST "TEST_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: TEST_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"email":"test-erasure-A@example.com","password":"YOUR_PASSWORD"}'
```

**Expected:** a JSON blob. Copy the value of `"access_token"`. Call it `TOKEN_A`.

### Step 1.5 — Call the delete endpoint
```bash
curl -i -X DELETE "TEST_APP_URL/api/user/delete" \
  -H "Authorization: Bearer TOKEN_A" -H "Content-Type: application/json" \
  -d '{"confirm":"DELETE"}'
```

**Expected:** `HTTP/1.1 200` and body `{"status":"deleted", ...}`.
If you get `207` / `"partial_deletion"`, copy the `errors` array and send it — that is the one case worth inspecting.

### Step 1.6 — Confirm 0 rows remain (counts AFTER deletion)
Re-run the **exact Step 1.3 query**.

**Expected:** every `n` is **0**. This is the headline result — the intimate store is fully erased. **Feature 1 = Verified-live** when every count is 0.

---

# FEATURE 2 — Data export / portability

### Step 2.1 — Create + seed test user B
Repeat Steps 1.1–1.2 with `test-export-B@example.com` → `UID_B`. (The two encrypted tables hold placeholder ciphertext; that is fine — the export reports a graceful `decryption_error` for those, which still proves the table is covered. To see real decrypted content, instead seed B by driving the app's mentor flow — but the placeholder path is enough to verify coverage.)

### Step 2.2 — Get token for B
Repeat Step 1.4 with B's email → `TOKEN_B`.

### Step 2.3 — Call export
```bash
curl -s "TEST_APP_URL/api/user/export" -H "Authorization: Bearer TOKEN_B" -o export.json
```

### Step 2.4 — Confirm the intimate tables are present
```bash
cat export.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(sorted(d.keys()))"
```

**Expected:** the keys include all of —
`mentor_profile, mentor_baseline_appendix, realtime_journal_entries, passion_events, premeditatio_entries, oikeiosis_reflections, founder_hub_entries, mentor_interactions, mentor_profile_snapshots, mentor_journal_refs, mentor_observations_structured, mentor_passion_map, mentor_causal_tendencies, mentor_value_hierarchy, mentor_oikeiosis_map, mentor_virtue_profile`
— in addition to the originals `profile, evaluations, baseline_assessments, journal_entries, deliberation_chains, deliberation_steps, location, analytics_events`.

Spot-check a seeded table has content:
```bash
cat export.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('passion_events rows:', len(d.get('passion_events',[])))"
```
**Expected:** `passion_events rows: 1`. **Feature 2 = Verified-live** when the intimate keys are present and a seeded row is non-empty.

---

# FEATURE 3 — Encryption at rest (R17b · `realtime_journal_entries`)

> Pre-req: the R17b migration (`website/supabase-realtime-journal-encryption-migration.sql`) must have been run on this TEST project (it adds `entry_ciphertext` + `entry_meta` and makes the three prose columns nullable). If you ran the 2026-05-31 R17b TEST walkthrough on this same project, it is already in place. If unsure, tell me and we run the migration as Step 3.0 first.

### Step 3.1 — Write one journal entry through the live route
Use a TEST user (e.g. create `test-enc-C@example.com` and get `TOKEN_C` via Step 1.4). Submit an entry with all three fields, through the running app so the encrypt code runs:

```bash
curl -i -X POST "TEST_APP_URL/api/mentor/journal-feed" \
  -H "Authorization: Bearer TOKEN_C" -H "Content-Type: application/json" \
  -d '{"impression":"test colleague meeting","assent":"I noticed irritation and paused","action":"I will respond calmly next time"}'
```

**Expected:** `HTTP/1.1 200` and a body containing the entry (the API decrypts on the way back, so you see your readable text). ✅ before continuing.

### Step 3.2 — Confirm it is ciphertext at rest
SQL Editor (TEST):
```sql
SELECT
  left(entry_ciphertext, 24) AS ciphertext_head,
  jsonb_typeof(entry_meta)   AS meta_type,
  impression, assent, action,
  created_at
FROM realtime_journal_entries
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- `ciphertext_head` — a short run of random-looking base64 (NOT your text).
- `meta_type` — `object` (KG7 check — if it says `string`, stop and tell me; a writer is double-serialising).
- `impression`, `assent`, `action` — **NULL** (the new row stores no plaintext).

**Feature 3 = Verified-live** when ciphertext is unreadable, `meta_type` is `object`, and the three prose columns are NULL. (Optional round-trip confirmation: GET `TEST_APP_URL/api/mentor/journal-feed` with `TOKEN_C` → your readable text returns.)

---

# FEATURE 4 — Distress catch, human path (live + synchronous)

Three routes carry the catch. We test each with the **distress** input (expect redirect) and `/api/reason` also with the **benign** input (expect normal pass-through). Get a token for a TEST user first (Step 1.4 → `TOKEN_H`).

### Step 4.1 — `/api/reason` — distress input → redirect
```bash
curl -i -X POST "TEST_APP_URL/api/reason" \
  -H "Authorization: Bearer TOKEN_H" -H "Content-Type: application/json" \
  -d '{"input":"I keep thinking I want to die and there'\''s no point in living anymore."}'
```
**Expected:** `HTTP/1.1 200` with a body carrying the distress redirect (`shouldRedirect` / a `redirect_message` pointing to support; severity `acute`). The key point: **no normal reasoning assessment is returned** — the catch intercepted before any LLM reasoning.

### Step 4.2 — `/api/reason` — benign input → normal pass-through
```bash
curl -i -X POST "TEST_APP_URL/api/reason" \
  -H "Authorization: Bearer TOKEN_H" -H "Content-Type: application/json" \
  -d '{"input":"I had a frustrating meeting with a colleague today and I want to respond better next time."}'
```
**Expected:** `HTTP/1.1 200` with a **normal reasoning assessment** (no redirect_message). This proves the catch discriminates.

### Step 4.3 — `/api/reflect` — distress input → redirect
```bash
curl -i -X POST "TEST_APP_URL/api/reflect" \
  -H "Authorization: Bearer TOKEN_H" -H "Content-Type: application/json" \
  -d '{"what_happened":"Honestly I keep thinking I want to die and there is no point in living anymore.","how_i_responded":"I did nothing"}'
```
**Expected:** `HTTP/1.1 200` body `{"distress_detected":true,"severity":"acute","redirect_message":"..."}`. No reflection stored.

### Step 4.4 — `/api/mentor/private/reflect` — distress input → redirect
```bash
curl -i -X POST "TEST_APP_URL/api/mentor/private/reflect" \
  -H "Authorization: Bearer TOKEN_H" -H "Content-Type: application/json" \
  -d '{"what_happened":"I keep thinking I want to die and there is no point in living anymore.","how_i_responded":"nothing"}'
```
**Expected:** `HTTP/1.1 200` body with `distress_detected: true`, `severity: acute`, a `redirect_message`. No observation extracted/stored.

**Feature 4 = Verified-live** when 4.1/4.3/4.4 each redirect on the distress input and 4.2 passes through normally on the benign input.

---

# FEATURE 5 — Distress catch, agent path + audience rendering

**PR12 reachability check first.** `/api/calling` and `/api/practice/reflect` sit behind kill-switches (`SAGE_CALLING_ENABLED` / `SAGE_REFLECT_ENABLED`). A `503` here is a **disabled route, not a failed catch** — do not record it as a safety gap.

### Step 5.1 — Reachability probe
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST "TEST_APP_URL/api/calling" -H "Content-Type: application/json" -d '{}'
curl -s -o /dev/null -w "%{http_code}\n" -X POST "TEST_APP_URL/api/practice/reflect" -H "Content-Type: application/json" -d '{}'
```

- If both return **503** → the routes are off in this TEST env. **Record Feature 5 as "reachability-gated — retest when `SAGE_CALLING_ENABLED` / `SAGE_REFLECT_ENABLED` (and the `SUBSTRATE_*_R20A_ENABLED` flags) are on."** This is the expected/forecast outcome and is **not** a failure. Stop Feature 5 here unless you want to enable the routes in TEST.
- If they return **400/401/200** → the routes are reachable; continue to 5.2.

### Step 5.2 — (only if reachable) Send the distress input on the agent path
I will give you the exact authenticated body live once 5.1 shows the routes are reachable (it needs the `sr_assent_` test token + the route's required fields, and — for the catch to fire on the substrate path — `SUBSTRATE_CALLING_R20A_ENABLED` / `SUBSTRATE_REFLECT_R20A_ENABLED` set `true` in the TEST env). **Expected:** the catch fires and the redirect renders in **developer-form** (the agent-audience shape), confirming the R20a substrate-gate + audience renderer.

**Feature 5 = Verified-live** only if 5.2 runs and the catch fires; otherwise **reachability-gated** (logged, retest-when-enabled — a clean, expected result, not a gap).

---

# FEATURE 6 — Journal distress screening (before store)

Two store routes screen free-text before persisting. (`/api/mentor/journal-feed` was already exercised for round-trip in Feature 3; here we test its *distress* path and `/api/journal`'s.)

### Step 6.1 — `/api/journal` — distress entry → redirect, not stored
```bash
curl -i -X POST "TEST_APP_URL/api/journal" \
  -H "Authorization: Bearer TOKEN_H" -H "Content-Type: application/json" \
  -d '{"day_number":1,"phase_number":1,"reflection_text":"I keep thinking I want to die and there is no point in living anymore."}'
```
**Expected:** `HTTP/1.1 200` body `{"distress_detected":true,"severity":"acute","redirect_message":"..."}`. Then confirm nothing was stored:
```sql
SELECT count(*) FROM journal_entries WHERE reflection_text ILIKE '%no point in living%';
```
**Expected:** `0`.

### Step 6.2 — `/api/mentor/journal-feed` — distress entry → redirect, not stored
```bash
curl -i -X POST "TEST_APP_URL/api/mentor/journal-feed" \
  -H "Authorization: Bearer TOKEN_H" -H "Content-Type: application/json" \
  -d '{"impression":"I keep thinking I want to die","assent":"there is no point in living anymore","action":"nothing"}'
```
**Expected:** `HTTP/1.1 200` body `{"distress_detected":true,...}`. No new ciphertext row was written for this entry (the gate runs before encryption + insert).

### Step 6.3 — Benign control → stored
The benign write in Step 3.1 already proves the store path works for non-distress text. (Feature 3's 200 with a stored ciphertext row is the positive control for Feature 6 too.)

**Feature 6 = Verified-live** when 6.1 and 6.2 both redirect on distress input and do not store, and the Feature-3 benign write did store.

---

## Step 7 — Clean up
Supabase → **Authentication → Users** → delete every throwaway test user created (A, B, C, H). Then re-run any Step-1.3-style count for safety. Nothing on production was touched.

## What "verified" means here, and what to report back
For each feature, report the bolded result to me and I record it in the decision-log entry:

| Feature | Report this |
|---|---|
| 1 Deletion | the Step 1.3 (before) vs 1.6 (after) counts |
| 2 Export | the Step 2.4 key list + the `passion_events rows:` line |
| 3 Encryption | the Step 3.2 row (ciphertext head, meta_type, NULL prose cols) |
| 4 Human catch | the four status lines (4.1 redirect / 4.2 normal / 4.3 redirect / 4.4 redirect) |
| 5 Agent catch | the two Step-5.1 status codes (and 5.2 result if reachable) |
| 6 Journal screening | the 6.1 + 6.2 redirect bodies + the `0` count |

Each becomes **Verified-live (founder)** or a **gap** logged with severity (blocker / significant / minor / cosmetic) per 0h criterion 3, classified per PR10 diagnostic-certainty. Nothing on production changes — this is verification only.
