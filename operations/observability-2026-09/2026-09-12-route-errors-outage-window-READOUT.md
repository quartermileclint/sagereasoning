# Read-out — production `route_errors`, 2026-09-05 → 2026-09-13 (the "seven-day outage" week)

**Session:** `sagereasoning-d2 [6c5506]`, opened under
`operations/handoffs/founder/2026-09-13-llm-outage-classifier-account-block-NEXT-SESSION-PROMPT.md`
(O-1). **Date:** 2026-09-12 (machine `date`, AEST evening; the prompt's "09-13" filename is the
standing context-date artifact).

**Method.** A read-only `SELECT` over `public.route_errors` (no insert/update/delete/rpc), run from
the repo with `@supabase/supabase-js` and the service-role key in `website/.env.local`
(host `jdbefwkonfbhjquozgxr.supabase.co` — production; the file `.env.local.prod-backup-2026-05-24`
carries the same project ref). The founder elected this over a manual paste (AskUserQuestion,
"Run the SELECT yourself, read-only"). The two scripts lived in the session scratchpad and are not
committed; the query is reproducible in the SQL Editor:

```sql
SELECT occurred_at, route, error_type, status_code, is_llm_outage, left(message, 400) AS message, context
FROM   public.route_errors
WHERE  occurred_at >= '2026-09-05' AND occurred_at < '2026-09-13'
ORDER  BY occurred_at DESC;
```

Bounded explicitly (`.limit(1000)`, `count: 'exact'`) so a PostgREST cap could not silently
truncate; **259 rows fetched = 259 exact.** `route_errors` is metadata-only by design (no request
bodies, no user content); nothing PII-bearing was read.

## 1. The whole window, by class

Class is derived from the `message` prefix. Every one of the 259 rows carried `is_llm_outage = false`.

| rows | class (message prefix) | `error_type` recorded | route | our status |
|---:|---|---|---|---|
| 95 | `extractFeatures: high-confidence prompt-injection override detected…` (A11b reject) | `Layer1ValidationError` | `/api/practice/discernment` | 503 |
| 65 | `400 {"type":"error","error":{"type":"invalid_request_error",…usage limits…` | `Error` | `/api/reason` | 200 (masked) |
| 54 | `extractJSON: Could not extract valid JSON (N chars)…` | `Error` | `/api/practice/discernment` | 503 |
| 29 | `400 {…usage limits…}` | `Error` | `/api/practice/discernment` | 503 |
| 10 | `extractJSON: Could not extract valid JSON (N chars)…` | `Error` | `/api/reason` | 200 (masked) |
| 4 | `Invalid enum value at value_categories_at_stake[…].indifferent: "knowledge"/"freedom"` | `Layer1ValidationError` | `/api/reason` | 200 (masked) |
| 1 | A11b reject | `Layer1ValidationError` | `/api/reason` | 200 (masked) |
| 1 | `Cannot read properties of undefined (reading 'type')` | `TypeError` | `/api/practice/discernment` | 503 |

## 2. The account block — exact shape, exact span

All 94 provider rows carry the **same message**, differing only in `request_id`:

```
400 {"type":"error","error":{"type":"invalid_request_error","message":"You have reached your specified API usage limits. You will regain access on 2026-10-01 at 00:00 UTC."},"request_id":"req_011Cey…"}
```

| | |
|---|---|
| first_seen | **2026-09-12T06:07:58Z** |
| last_seen | **2026-09-12T08:27:53Z** |
| count | 94 (65 `/api/reason`, 29 `/api/practice/discernment`) |
| SDK class (from `@anthropic-ai/sdk` 0.80 `APIError.generate`, 400 →) | `BadRequestError` |
| recorded `error_type` | `Error` (no SDK class sets `.name`; the store's `name \|\| constructor.name` never reached the constructor) |

**The block lasted about 2 h 20 min on 2026-09-12 (16:07–18:27 AEST). It did not begin on
2026-09-05.** No row before 06:07Z on 09-12 carries the usage-limit message.

## 3. Per day, by class

| UTC day | A11b reject | Layer-1 JSON parse | Layer-1 enum | usage-limit 400 | other |
|---|---:|---:|---:|---:|---:|
| 2026-09-05 | 37 | 5 | | | |
| 2026-09-06 | 3 | 27 | | | 1 (TypeError) |
| 2026-09-07 | | 13 | 1 | | |
| 2026-09-08 | 36 | | 1 | | |
| 2026-09-09 | 5 | 5 | 2 | | |
| 2026-09-10 | 15 | 9 | | | |
| 2026-09-11 | | 3 | | | |
| 2026-09-12 | | 2 | | **94** | |

The `first_seen 2026-09-05` that the 2026-09-12 diagnosis read as the outage's start is the first
row of **any** class in the window — an A11b injection reject.

## 4. The engine's availability, from the window buffer itself (local file, independent of the table)

`~/.sage-gate1/false-hold-record.jsonl`, window = line 140 onward, grouped by UTC day. A consult
record with a `signals.proximity` value is a **successful** Layer-1 extraction.

| UTC day | consult records with a proximity reading | guard `outage_open` |
|---|---:|---:|
| 2026-09-06 | 3 | 1 |
| 2026-09-07 | 17 | 0 |
| 2026-09-08 | 6 | 0 |
| 2026-09-09 | 18 | 0 |
| 2026-09-10 | 34 | 0 |
| 2026-09-11 | 19 | 0 |
| 2026-09-12 | 38 | 1 |

Every day carries successful readings. The window did **not** record "an engine that could not
evaluate anything" for seven days; it recorded a working engine with a ~2 h 20 min hole on 09-12
(guard records in that hour read `pause_for_review`, the conservative fallback the buffer's token
cannot distinguish from a genuine pause).

## 5. Two further classes the single boolean flattened together (out of O-1's scope, named)

- **Layer-1 output truncation.** 64 `extractJSON` parse failures; response sizes min 5,315 /
  p50 15,146 / max 15,974 chars; 50 of 64 ≥ 14,000. `layer1-extractor.ts:2264` caps the extraction
  at `max_tokens: 4000` (~15k chars of JSON). The model's JSON is being cut mid-document on long
  composed inputs. `GUARD_RE` file; needs its own waiver session.
- **Layer-1 enum drift.** 4 rows where the extractor emitted `"knowledge"` / `"freedom"` for
  `value_categories_at_stake[].indifferent`, outside the schema enum.
- The 96 A11b rejects are the known `harness-blind-on-substrate-sessions-a11b-schema-tokens` class
  (clustered on 09-05, 09-08, 09-10 — days with substrate-file editing).

*Primary data; cite this file, not a summary of it.*
