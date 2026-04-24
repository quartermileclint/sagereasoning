# Session 5 — Continue P0 Hold Point Testing

## What happened last session

We found the TRUE root cause of the 401 bug that was failing 15 tests. Context template skills (sage-align, sage-coach, etc.) were making HTTP self-calls to `/api/reason` via the public URL. When Vercel applies a www/non-www redirect, the Fetch API strips the Authorization header — so `/api/reason` never sees the JWT and returns 401.

**Fix deployed:** context-template.ts now imports `runSageReason` directly instead of making an HTTP call. 11 of 12 context template skills confirmed working (200 with full Stoic reasoning output). Pass rate went from 72% to 89%.

## What needs to happen now

### 1. Commit and push 3 files (VERCEL_URL fix)

The execute/compose/score-document routes have the same HTTP self-call problem. I've applied a fix locally — they now prefer `VERCEL_URL` (auto-set by Vercel, no redirect) as the base URL. The files to commit:

- `website/src/app/api/execute/route.ts`
- `website/src/app/api/compose/route.ts`
- `website/src/app/api/score-document/route.ts`

Commit through GitHub Desktop, then say "vercel green" when deployed.

### 2. After deployment, re-test these:

- **Test 3.7 (execute router):** Call `/api/execute` with `{ skill_id: 'sage-score', input: { action: 'I chose to apologise to my colleague' } }` using Bearer token. Should return 200.
- **Test 3.4 (deliberation chain):** `/api/deliberation-chain/[id]` only exports GET+OPTIONS, no POST handler. Decide: add POST handler or update docs to point to `/api/score-iterate`.

### 3. Investigate sage-retro 500

sage-retro auth passes (not 401) but the handler returns 500 — internal server error. Check Vercel Runtime Logs for the error trace. Likely an issue in `runSageReason` response parsing or `extractReceipt` when processing sage-retro's debrief analysis output.

### 4. Test 4.6 (full assessment scoring)

Needs the raw API key value for the `sr_live_be9492` key. The hashed key is in Supabase `api_keys` table but the raw value (what you'd put in the X-Api-Key header) is needed.

## Key files

- **Test results:** `operations/testing/test-results-2026-04-09.md` — current scores, gap list, value demos
- **Session 4 handoff:** `operations/session-handoffs/2026-04-09_session-4-close.md` — decisions, status changes, open questions
- **context-template.ts:** `website/src/lib/context-template.ts` — the fixed file (uses direct `runSageReason` import)
- **sage-reason-engine.ts:** `website/src/lib/sage-reason-engine.ts` — the shared reasoning engine all context templates now call directly

## Current test score

57/64 passed (89%). 4 failures remain: execute router (awaiting deploy), sage-retro (500), full assessment (untested), deliberation chain (missing POST handler).

## Communication signals

- "vercel green" = deployment succeeded, start testing
- "I've decided" = execute without re-debating
- "I'm done for now" = stabilise and close
