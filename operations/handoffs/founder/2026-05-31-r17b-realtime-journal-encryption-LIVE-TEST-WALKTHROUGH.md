# Live-Test Walkthrough — R17b realtime_journal_entries encryption-at-write

**Date:** 2026-05-31. **Stream:** founder. **Tier:** `code-critical`.
**Decision-log entry:** `D-R17B-REALTIME-JOURNAL-ENCRYPTION-2026-05-31`.
**Purpose:** the founder-run verification for the R17b change (per PR17 — walked
through step by step, not handed off as a one-liner). Run on the **TEST**
Supabase project, never production, until you are satisfied.

This is the script. We run it **live together** when you're ready — you paste
each step, tell me the result, and I confirm before we move to the next. Do not
run it as one block.

---

## What you are proving

That a real-time journal entry's three prose fields (impression / assent /
action) are now stored **scrambled (encrypted)** in the database, but still come
back as **readable text** when you view the journal or export your data.

---

## Step 0 — Pre-check (where the change lives)

The code change is committed but **nothing is deployed and no database column
exists yet** until you run Step 1. So before Step 1, the live site is unchanged.

---

## Step 1 — Run the migration (Supabase SQL Editor, TEST project)

1. Open the Supabase dashboard → your **TEST** project → **SQL Editor** → **New query**.
2. Open the file `website/supabase-realtime-journal-encryption-migration.sql`,
   copy its whole body, paste it into the editor.
3. Click **Run**.

**Expected:** "Success. No rows returned." The table now has two new columns
(`entry_ciphertext`, `entry_meta`) and the three prose columns are now nullable.
The migration is idempotent — re-running it is safe.

**Confirm to me:** "migration ran clean" (or paste any error).

---

## Step 2 — Write one journal entry through the live route

This must go through the running app so the encrypt code runs. Two ways:

- **(a) Through the UI** on a TEST-pointed local dev server (`npm run dev` with a
  throwaway `.env.development.local` pointed at TEST — same override pattern as
  the 2026-05-29 export test; production `.env.local` untouched, override deleted
  after). Sign in as a test user, open the real-time journal feed, submit an
  entry with all three fields filled in.
- **(b) Through a token + curl** if you'd rather not use the UI — I'll give you
  the exact command live, against the running TEST route.

Either way: submit `impression`, `assent`, `action` you'll recognise (e.g.
impression "test colleague meeting").

**Expected on screen / in the response:** the entry saves and displays the
**readable text you typed** (the API decrypts on the way back).

**Confirm to me:** "entry saved, shows readable text".

---

## Step 3 — Confirm it is ciphertext at rest (SQL Editor, TEST)

Paste this query:

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
- `meta_type` — `object` (this is the KG7 check — if it says `string`, stop and
  tell me; a writer is double-serialising).
- `impression`, `assent`, `action` — **NULL** (the new row stores no plaintext).
- `created_at` — present.

**Confirm to me:** paste the row (the prose columns should be NULL and the
ciphertext unreadable).

---

## Step 4 — Confirm the feed round-trips to readable text

Reload the journal feed (GET `/api/mentor/journal-feed`) for that test user.

**Expected:** the entry you wrote in Step 2 shows your **original readable text**
for impression / assent / action. The lag/stats numbers still appear (the stats
view reads only timestamps, so it was never affected).

**Confirm to me:** "feed shows my readable text".

---

## Step 5 — Confirm the data export decrypts

Call `GET /api/user/export` as that test user (download the JSON).

**Expected:** the `realtime_journal_entries` section contains your entry with
**readable** impression / assent / action (decrypted for you, the data subject),
and no `entry_ciphertext` / `entry_meta` fields.

**Confirm to me:** "export shows readable journal text".

---

## If anything looks wrong

Tell me which step and paste what you saw. Rollback of the code is one command
I'll walk you through (`git revert` + push). The added DB columns are harmless to
leave in place. Do **not** run the migration on production until all five steps
pass on TEST and you say so.

---

## Production deployment (separate, only on your "ship")

When TEST is green and you choose to ship:
1. Run `website/supabase-realtime-journal-encryption-migration.sql` in the
   **production** Supabase SQL Editor (same steps as Step 1).
2. Commit + push the code (the session close has the exact commands); Vercel
   redeploys.
3. Re-run Steps 2–5 against production with a test login to confirm.

Order matters: the migration (columns) must exist **before** the new code goes
live, or a write would fail. Running the migration first is safe for the old
code too (the columns are additive and the old code ignores them).
