# Mentor Context V2 — Verification Runbook
**Created:** 14 April 2026 (Session B)
**Reference:** session-handoffs/2026-04-14-session-context-loader.md
**Status:** Task 1 complete in code. Task 2 awaiting Clinton to run.

---

## Pre-flight (already confirmed)

- `session_context_snapshots` row count: **0** (no data migration required)
- `mentor_interactions` row count for Clinton's profile: **35** (Step 3 has data to project)

---

## Task 1 — Migration & Code Change (DONE in code, awaiting apply)

### What was changed in the repo

1. **New migration file:** `supabase/migrations/20260414_snapshot_type_mentor_session.sql`
2. **Code update:** `website/src/lib/context/mentor-context-private.ts` — `recordSessionContextSnapshot()` now writes `snapshot_type: 'mentor_session'` instead of `'custom'`. Doc comment updated.

Typecheck: zero errors in modified files.

### What you do — Task 1 apply

**Step 1.1 — Apply migration in Supabase**

Open Supabase → SQL Editor. Paste and run:

```sql
ALTER TABLE session_context_snapshots
  DROP CONSTRAINT IF EXISTS session_context_snapshots_snapshot_type_check;

ALTER TABLE session_context_snapshots
  ADD CONSTRAINT session_context_snapshots_snapshot_type_check
  CHECK (snapshot_type IN (
    'knowledge_context',
    'v3_scope_status',
    'business_plan',
    'custom',
    'mentor_session'
  ));
```

Expected: `Success. No rows returned.` (or similar).

**Step 1.2 — Confirm constraint accepts new value**

Run:

```sql
-- Smoke test: insert a probe row to confirm 'mentor_session' is allowed.
-- Will be deleted immediately.
INSERT INTO session_context_snapshots (user_id, snapshot_type, content_hash, summary)
VALUES (auth.uid(), 'mentor_session', 'probe', 'task1-smoke-test')
RETURNING id;
```

Copy the returned `id`, then run:

```sql
DELETE FROM session_context_snapshots WHERE summary = 'task1-smoke-test';
SELECT COUNT(*) FROM session_context_snapshots;
```

Expected: count = 0.

If the INSERT errors with `violates check constraint`, the migration didn't take — re-run Step 1.1.

**Step 1.3 — Deploy the code change**

The code change in `mentor-context-private.ts` ships next time you push to Vercel. If `MENTOR_CONTEXT_V2` is unset, the new write call is dormant (it's only called inside the `if (useProjection)` branch).

You can deploy this together with the verification deploy in Task 2 Step 1.

---

## Task 2 — Verification (THREE STEPS, IN SEQUENCE)

### Step 1 — Baseline (legacy mode)

**1a.** In Vercel → Project → Settings → Environment Variables, ensure `MENTOR_CONTEXT_V2` is **unset** OR set to anything other than the literal string `true`. If already unset, skip.

**1b.** Deploy the latest code (push to main, or trigger a redeploy in Vercel).

**1c.** Open Founder Hub. Send the mentor a reflection message that touches one conditional block. Suggested topic (touches action + decisions):

> "I keep putting off the conversation with [name] about the project boundaries. Should I push forward this week or wait until I have more clarity?"

**1d.** In Vercel → Logs (or `vercel logs --follow`), find the line tagged `[mentor-context-tokens]` with `"mode":"legacy"`. Copy the JSON.

**Record below:**

```
LEGACY BASELINE
  Endpoint: ___________________________
  Topic used: _________________________
  Timestamp: __________________________
  profile_tokens: _____________________
  observations_tokens: ________________
  snapshots_tokens: ___________________
  user_message_tokens (or enriched_message_tokens): ___________________
```

The number that matters most for comparison is the total (`user_message_tokens` for reflect, `enriched_message_tokens` for hub).

**Do not proceed to Step 2 until you have this number.**

---

### Step 2 — V2 Measurement

**2a.** In Vercel → Settings → Environment Variables, set `MENTOR_CONTEXT_V2 = true`. Save.

**2b.** Redeploy (Vercel auto-redeploys on env var change, but verify the deploy completed).

**2c.** Confirm flag is on: open Vercel → Deployments → latest → Functions → look for the env var, OR run a quick check by sending one mentor message and confirming the log line shows `"mode":"v2"`.

**2d.** Send the **same mentor topic** as Step 1 (paste the same wording). Use the same endpoint.

**2e.** Find the log line tagged `[mentor-context-tokens]` with `"mode":"v2"`. Copy the JSON.

**Record below:**

```
V2 MEASUREMENT
  Endpoint: ___________________________
  Topic used: _________________________ (must match Step 1)
  Timestamp: __________________________
  profile_tokens: _____________________
  recent_signals_tokens: ______________
  observations_tokens: ________________
  snapshots_tokens: ___________________
  total tokens (user_message or enriched_message): ____________________
```

**2f.** Calculate. Use the totals from Step 1 and Step 2.

```
Profile reduction:
  (legacy_profile_tokens − v2_profile_tokens) ÷ legacy_profile_tokens × 100 = ____ %

Signal addition:
  v2_recent_signals_tokens ÷ legacy_total_tokens × 100 = ____ %

Net reduction:
  (legacy_total − v2_total) ÷ legacy_total × 100 = ____ %
```

**Targets:**

| Metric | Target | Result | Met? |
|---|---|---|---|
| Profile reduction | 40–60 % | ____ % | Y / N |
| Signal addition | ≤ 15 % | ____ % | Y / N |
| Net reduction | ≥ 25 % | ____ % | Y / N |

**Decision gate:**

- **All three met → proceed to Step 3.**
- **Net reduction misses → STOP.** Report which component (profile, signals, both) is underperforming. Do not proceed until Clinton decides whether to accept, adjust, or extend.

---

### Step 3 — Functional Verification

**3a. Snapshot row written?**

In Supabase SQL Editor:

```sql
SELECT created_at, snapshot_type, summary, content_hash
FROM session_context_snapshots
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
```

**Record:**

```
Most recent row timestamp: ____________________________
snapshot_type: ________________________________________
summary format example: _______________________________
Row count: ____________________________________________
```

Expected: at least one row with `snapshot_type = 'mentor_session'` from the Step 2 call. Summary should look like `reflect/v2 profile=NNNtk signals=NNNtk total=NNNNtk` or `hub/v2 …`.

If the row is missing or `snapshot_type ≠ 'mentor_session'`, the migration or write call is broken. Stop and report.

**3b. Mentor demonstrates prior-context awareness?**

Open Founder Hub. Send a message on a topic Clinton has discussed before in his journal — something from his passion map. Suggested topics (pick one Clinton has actually journalled about):

- Reputation / how others perceive his work
- Anger or frustration with his children
- Creative impact / whether his work matters

Do **not** tell the mentor what was discussed before. Keep the message short — one paragraph at most. Example phrasing:

> "I'm sitting with that thing again. The one where I notice myself caring too much what people think when I post."

Record the mentor's response (paste below or note key phrases).

**Record:**

```
Topic sent: ____________________________________________
__________________________________________________________

Did the mentor reference or connect to a prior conversation pattern?
  [ ] Yes — referenced a specific prior pattern
  [ ] Yes — referenced a general pattern from passion map
  [ ] No — treated as a fresh topic

If yes, which pattern was referenced?
__________________________________________________________
__________________________________________________________

Did it feel natural or forced?
  [ ] Natural (woven into reasoning)
  [ ] Forced (verbatim repetition / awkward callback)
  [ ] N/A (no prior context referenced)
```

---

## Verification Summary (fill in at the end)

```
TASK 1 — MIGRATION
  snapshot_type constraint:        [ updated / failed ]
  smoke-test insert succeeded:     [ yes / no ]
  write call updated in code:      [ yes / no ]
  rows in table before migration:  0 (confirmed)
  rows in table after smoke test:  [ ___ ]

TASK 2 — TOKEN COUNTS
  Legacy total:                    [ ___ ] tokens   [ timestamp ___ ]
  V2 profile:                      [ ___ ] tokens
  V2 signals:                      [ ___ ] tokens
  V2 total:                        [ ___ ] tokens   [ timestamp ___ ]
  Profile reduction:               [ ___ ] %        target 40–60 %  [ Y / N ]
  Signal addition:                 [ ___ ] %        target ≤ 15 %   [ Y / N ]
  Net reduction:                   [ ___ ] %        target ≥ 25 %   [ Y / N ]
  Targets met:                     [ yes / no ]

TASK 2 — FUNCTIONAL
  Snapshot row written:            [ yes / no ]
  snapshot_type:                   [ mentor_session / other: ___ ]
  Mentor referenced prior context: [ yes / no ]
  Pattern referenced:              [ ___________________________ ]
  Felt natural:                    [ yes / no / n/a ]

OVERALL BUILD STATUS:              [ verified / not verified — reason: ___ ]
```

---

## Rollback Plan

**If Task 1 (migration) fails:**

```sql
ALTER TABLE session_context_snapshots
  DROP CONSTRAINT IF EXISTS session_context_snapshots_snapshot_type_check;

ALTER TABLE session_context_snapshots
  ADD CONSTRAINT session_context_snapshots_snapshot_type_check
  CHECK (snapshot_type IN (
    'knowledge_context', 'v3_scope_status', 'business_plan', 'custom'
  ));
```

Then revert the code line in `mentor-context-private.ts` (`'mentor_session'` → `'custom'`). No data loss — table still has 0 rows.

**If Task 2 Step 2 misses target:**

Leave `MENTOR_CONTEXT_V2 = false`. Report which component underperformed:

- Profile underperforming → topic signal may be over-triggering conditional blocks. Tune `detectTopicSignal()`.
- Signals over-budget → reduce limit from 7 to 5, or shorten the signal block format.

**If Task 2 Step 3 fails (mentor shows no prior-context awareness):**

Token reduction is still valid — keep the flag on if Step 2 passed. Then investigate:

```sql
-- Confirm signals were available
SELECT COUNT(*) FROM mentor_interactions
WHERE profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid())
  AND hub_id = 'founder-mentor';
```

If row count > 0 but mentor doesn't reference patterns, the issue is in how the signals are framed in the prompt — not in retrieval. The instruction line at the bottom of `getRecentInteractionsAsSignals()` may need stronger phrasing.

---

## What I cannot do from this environment

- Apply the migration to live Supabase
- Deploy code to Vercel
- Read Vercel logs
- Set environment variables
- Make live API calls
- Verify any of the numbers above

All of Task 2 requires Clinton at the keyboard. I have prepared the migration SQL, the smoke test SQL, the topic phrasing, the structured record template, and the rollback plan. The verification itself is yours to run.
