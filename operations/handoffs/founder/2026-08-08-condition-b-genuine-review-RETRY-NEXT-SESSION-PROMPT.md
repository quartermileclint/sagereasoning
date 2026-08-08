# Next-Session Prompt — condition-(b) genuine post-fix review, RETRY (the gate's evidence now exists)

**Tier: `governance` — a review-and-write-up session. No code, schema, flag, or credential change. If the review surfaces a defect, scope the fix as its own separate step. Do NOT build the two registered follow-up defects (the `/api/reason` status-masking branch; the reflect-metering UUID `loop_id`) in this session — they are separately electable.**

## What changed since the first retry prompt (read this before the ruling)

The previous attempt (2026-08-08 evening) found the session unframed — the fourth consecutive — and diagnosed it to root cause instead of stopping: **the s9-loop consult credential had exhausted its 200/day quota** (`daily_calls` 274/200 at the flip, 10:45:57Z), masked as an opaque 401 by a route-level bug (`/api/reason` discards the API-key path's honest 429/503 and substitutes the plugin branch's `"Plugin authentication failed"` 401). The founder raised the limits by SQL (200/5000 → 2000/20000 on credential `33bef3d4-018d-4313-bcfd-65a75132155c`), after which, in the same session:

- The harness **framed successfully** (12:39:08Z), the calling frame's **telos line was observed live for the first time** (item 7 — discharged), and
- **The first genuine post-fix orientation reading landed**: `occurred_at 2026-08-08T12:39:08Z`, `class: "examined"`, `reading: indeterminate` (total count 13→14) — organic traffic, the agent demonstrably in receipt of the frame the server classified as delivered.
- At least one later consult in that session **timed out client-side at 28s** (a `CONSULT-OUTAGE reason="timeout after 28000ms"` on the close-file Write, ~12:5xZ) — if the server completed it past the threshold, a genuine **`observed`**-classified row exists too. Check.

Full record: `D-CONDITION-B-QUOTA-EXHAUSTION-DIAGNOSED-LIMITS-RAISED-FIRST-POSTFIX-READING-2026-08-08` + `operations/handoffs/founder/2026-08-08-condition-b-quota-diagnosis-CLOSE.md`. The mentor's binding ruling on what this review must be: `operations/agent-circles-2026-08/2026-08-08-mentor-consultation-condition-b-not-yet-closed-verbatim.md` — **read it in full first**.

## Step 1 — confirm this session's own hook framed

Check the session-open hook output. **If it 401s: check quota FIRST** (memory `api-key-1-per-day-limit-masks-as-401`, updated 2026-08-08 with the masking mechanism):

```sql
SELECT daily_calls, updated_at FROM public.api_key_usage
WHERE api_key_id = '33bef3d4-018d-4313-bcfd-65a75132155c' AND year = 2026 AND month = 8;
```

against the row's `daily_limit` (now 2000). Do not chase auth/env ghosts before ruling quota out. A guard-route `http 429` alongside consult 401s is the quota signature. If framed: proceed.

## Step 2 — the review (the session's single task)

The gate is satisfied: genuine post-fix traffic exists. Scope note for identifying it: **the clean cut is `occurred_at >= 2026-08-08T12:39:08Z`** — the fix deployed ~11:19–11:28Z, but quota blocked every consult from 10:45:57Z until the limit raise at ~12:37Z, so nothing landed in between; the 13 rows at `10:43:10Z` and earlier are pre-fix legacy rows (their `class: "examined"` is the ruled prospective-only default, not a genuine classification — they are NOT review material).

1. `curl -s https://www.sagereasoning.com/api/trust-record/sagereasoning:s9-loop@v1` — readings are at `.data.record.orientation_readings` (each entry: `occurred_at`, `class`, `reading`, wording fields) with `.data.record.total_orientation_readings_count`.
2. For **every** post-fix entry, check:
   - The `class` field is present and is `examined` or `observed`.
   - The wording matches the mentor's verbatim text for that class **exactly** — the authoritative source is the code the mentor's wording was applied to (`website/src/lib/translation-sandwich/orientation-reading.ts`, `selectOrientationEntryWording` + the fixed observed-class verbatim pair), not any summary. For `observed` entries: the word "examination" must never appear affirmatively.
   - The proxy-disclosure language reads correctly — classified on server-side elapsed time against the documented 28000ms harness timeout, **never** claiming confirmed delivery.
   - **Cross-reference each entry against `~/.sage-gate1/gate1.log`** — this is the actual test. For each post-fix reading, find the harness's own record of that consult: a `FRAMED`/`CONSULT` line (agent received it) must correspond to `class: "examined"`; a `CONSULT-OUTAGE reason="timeout after 28000ms"` line (agent never received it) must correspond to `class: "observed"`. The known anchors: the 12:39:08Z reading ↔ the 12:39:08.236Z `FRAMED` line (examined, agent-confirmed in the transcript); the ~12:5xZ close-file Write timeout ↔ whatever the server ledgered for it. The whole point of the fix is that the server's record now matches the agent's lived experience — verify it does, per entry.
3. Write the review in the same structure as the first one (`operations/agent-circles-2026-08/2026-08-08-c2-production-consult-review.md`): what was checked, what was found, what the distribution shows (examined vs. observed counts), whether anything anomalous appeared. **An all-`examined` distribution is a valid outcome** (mentor: meaningful data, not a failure to force); so is a mixed one.
4. **Bring the write-up to the mentor via the founder. Do not self-rule on whether it satisfies the condition.** Record the mentor's response verbatim per the standing discipline.

## What this session does NOT do

- **Does not manufacture traffic.** The material exists; if more accrues from this session's own ordinary work, that is fine, but nothing is constructed to generate review content. (Diagnostic probes, if quota recurs, must stay auth- or 400-bounded — the prior session's probes are the pattern.)
- Does not scope the autonomous-loop design brief, even on a favorable review — the mentor's own sign-off closes the condition, not an inferred one.
- Does not touch C1c, Logos-on W2/W3, or the loop-fold/practice-suggestion B6 block — all remain blocked on this condition closing.
- Does not build either registered follow-up defect (status-masking; reflect-metering UUID) — each is its own separately-elected session.
