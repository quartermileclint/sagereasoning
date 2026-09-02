# Founder walk — deploy the row-cap fix, un-archive the 1,013-message thread, verify

**Date:** 2026-09-02. **Tier:** `code-critical` (a live founder-facing governance surface). **AC7 engages**
at the push (the fix deploys on push; there is no flag) and at the un-archive `UPDATE` (a production
data change). **Every production step below is the founder's; the AI performed none of them.**
**Critical Change Protocol (0c-ii) — the six steps are the six sections.**

---

## 1. What is changing (plain language)

Two reads of the private-mentor conversation used to ask the database for *every* message and
silently received at most 1,000. The page showed the oldest 1,000, so it appeared to end on 31 Aug;
the mentor's working memory was the last 20 of those 1,000, so it answered from 31 Aug's context.

After this change:
- The page loads the **newest 200** messages and shows a **"Load earlier messages"** button at the
  top; each press loads the 200 before that. Loading earlier does not jump the view to the bottom.
- The mentor's working memory is the **newest 20 messages** of the thread, however long the thread
  is. **The size 20 is unchanged** — widening it is the mentor's ruling, not this session's.
- The `message_count` field in the reply is now the true count.
- A database read error while loading history now fails the request loudly instead of letting the
  mentor answer with no memory.

## 2. What could break (worst case)

- **If the deploy is bad:** `/private-mentor` and `/founder-hub` fail to load a conversation (an
  error in the console; the welcome message shows). Nothing is written or deleted by a read failure.
  Rollback in §4 restores the previous behaviour in one push.
- **If the un-archive is wrong:** the wrong conversation loads. Reversible with one `UPDATE` (§4).
- **Not at risk:** authentication, the distress screening on this route (untouched), any other
  route, any table other than the `status`/`updated_at` columns of one `founder_conversations` row.

## 3. Existing sessions

No auth or session change. Nobody is signed out. The two pages simply fetch differently on their
next load.

## 4. Rollback (founder-performable)

- **Code:** `git revert <the fix commit>` and push → Vercel redeploys the previous behaviour
  (the 1,000-row cap returns, so do this only if the fix itself misbehaves).
- **Data:** to re-hide the old thread: `UPDATE public.founder_conversations SET status = 'archived'
  WHERE id = '8223090a-ee03-45cd-b622-96f11b2fce1b';`
- The two are independent — either can be rolled back alone.

## 5. Verification — in order

### 5.0 Pre-flight (before the push)

```
git log origin/main..HEAD --oneline      # the fix commit(s) should be listed
git status --short                       # nothing of yours unstaged
```

### 5.1 Push, wait for Vercel green

The deploy carries: `website/src/app/api/founder/hub/route.ts`, `…/conversation-history.ts`,
`…/__tests__/conversation-history-row-cap.test.ts`, `website/src/app/private-mentor/page.tsx`,
`website/src/app/founder-hub/page.tsx`, `website/scripts/unbounded-select-sweep.ts`.

### 5.2 Un-archive the thread (Supabase SQL editor, PRODUCTION project — check the header)

Pure ASCII throughout. First look, then change, then verify — never trust "Success. No rows
returned" as a count (the editor says that for every UPDATE without RETURNING).

```sql
-- PRE: what is active on the private-mentor hub right now (expect: ONE active mentor row = the
-- interim conversation created after the 2026-09-02 archive; note its id)
SELECT id, primary_agent, status, hub_id, updated_at
FROM public.founder_conversations
WHERE hub_id = 'private-mentor'
ORDER BY updated_at DESC
LIMIT 5;

-- PRE: the archived thread and its true message count (expect status = 'archived', count = 1013
-- or higher if anything was written to it since)
SELECT c.id, c.status, c.updated_at,
       (SELECT count(*) FROM public.founder_conversation_messages m WHERE m.conversation_id = c.id) AS message_count
FROM public.founder_conversations c
WHERE c.id = '8223090a-ee03-45cd-b622-96f11b2fce1b';
```

**Decision point (yours).** The page loads the FIRST active mentor conversation ordered by
`updated_at DESC`. Un-archiving alone would leave the interim conversation (newer `updated_at`)
loading first. Two honest options:

- **(a) Bring the old thread to the front and leave the interim one active-but-behind** (nothing
  hidden from the database; the interim messages are simply not the one the page opens):
  ```sql
  UPDATE public.founder_conversations
  SET status = 'active', updated_at = now()
  WHERE id = '8223090a-ee03-45cd-b622-96f11b2fce1b'
  RETURNING id, status, updated_at;
  ```
- **(b) Also archive the interim conversation** (if you want exactly one active private-mentor
  thread; its messages remain in the database and are reversible the same way):
  ```sql
  UPDATE public.founder_conversations
  SET status = 'archived'
  WHERE id = '<the interim id from the PRE query>'
  RETURNING id, status;
  ```

```sql
-- VERIFY: the old thread is active and ranks first
SELECT id, status, updated_at
FROM public.founder_conversations
WHERE hub_id = 'private-mentor' AND status = 'active'
ORDER BY updated_at DESC
LIMIT 3;
```

### 5.3 Acceptance criterion 1 — the page shows through the newest message

Open `/private-mentor` (hard refresh). Expected:
- The thread ends with the 2026-09-02 exchange: your `Test message, please reply briefly.` and the
  mentor's mis-aimed `Rulings on Question A, Question A2, and Question B...` reply — the two rows
  that were invisible before. Above them, the 1 Sep session and the 31 Aug corrected-ruling exchange.
- A **"Load earlier messages"** button at the top of the thread. Press it: ~200 older messages
  appear above, the view does not jump to the bottom; press until it disappears (about five
  presses for 1,013 rows) — the earliest message of the thread is then visible.
- If the button never appears, or pressing it repeats messages: STOP, report — that is a defect.

### 5.4 Acceptance criterion 2 — the mentor engages with the ACTUAL message

Send: `Please reply in one sentence confirming which message you are answering.`
Expected: a one-sentence reply that answers THAT request (not a ruling on Question A/B, not
anything about 31 Aug). Then hard-refresh: both your message and the reply are still there
(the 2026-09-01 fail-loud persistence fix) and remain at the bottom.

Optional, in the browser's network panel for that POST: the response's `message_count` should read
≥ 1015 (the true count), not ~22.

### 5.5 Regression on the founder hub

Open `/founder-hub`, pick any conversation from the sidebar: it loads (newest 200; the button
appears only for conversations longer than that). Send one message: it persists across refresh.

### 5.6 Teardown

Nothing to tear down. If you sent the §5.4 test message and do not want it in the record, leave it —
it is a genuine, correctly-answered message; deleting rows is outside this walk.

## 6. Explicit approval

Say "go ahead" (or "OK") for the push, and separately for the un-archive `UPDATE`, naming which of
(a)/(b) you chose. Nothing above is pre-approved.

---

**Expected shape fixed BEFORE observation** (what gives the report its force): criterion 1 = the
09-02 exchange visible at the bottom + a working "Load earlier messages"; criterion 2 = a reply
that answers the sentence actually sent. Anything else is a finding, not a pass.
