# Session Close — 9 April 2026, Session 4

## Decisions Made

- **Direct import over HTTP self-call:** Replaced `fetch(SAGE_REASON_URL)` in context-template.ts with `import { runSageReason } from '@/lib/sage-reason-engine'`. This eliminates the HTTP roundtrip, the auth forwarding problem, and the redirect risk. The reasoning engine was always designed as a shared module — calling it directly is the architecturally correct pattern. → Impact: 11 of 12 context template skills now work.

- **VERCEL_URL for remaining internal calls:** execute/route.ts, compose/route.ts, and score-document/route.ts still make HTTP self-calls to skill endpoints (because they route to any skill dynamically, not just sage-reason). Changed these to prefer `process.env.VERCEL_URL` (auto-set by Vercel, points directly to the deployment with no redirects) over `NEXT_PUBLIC_SITE_URL`. → Impact: Should fix execute router 401. NOT YET DEPLOYED.

- **Previous "requireAuth hangs" diagnosis was wrong:** `requireAuth()` does NOT hang. It cleanly returns a 401 NextResponse. The actual cause was the Fetch API stripping Authorization headers on cross-origin redirects during HTTP self-calls. This was confirmed by Vercel Runtime Logs showing both the Supabase auth call AND the /api/reason call appearing for sage-align requests — proving auth passed but the downstream call failed.

## Status Changes

| Component | Old Status | New Status | Evidence |
|-----------|-----------|------------|----------|
| context-template.ts auth | Wired (broken — 401) | **Verified** | 11/12 skills return 200 with full reasoning output. Deployed commit confirmed working |
| sage-retro | Wired (broken — 401) | **Wired (broken — 500)** | Auth passes but internal server error. Not an auth issue |
| execute/route.ts | Wired (broken — 401) | **Wired (fix ready)** | VERCEL_URL fix applied locally. Not deployed |
| compose/route.ts | Wired | **Wired (fix ready)** | VERCEL_URL fix applied locally. Not deployed |
| score-document/route.ts | Wired | **Wired (fix ready)** | VERCEL_URL fix applied locally. Not deployed |
| Test pass rate | 72% (46/64) | **89% (57/64)** | 11 context template skills flipped from FAIL to PASS |

## Next Session Should

1. **Commit and push** the 3 files with VERCEL_URL fix (execute, compose, score-document). Use GitHub Desktop — the changed files are: `website/src/app/api/execute/route.ts`, `website/src/app/api/compose/route.ts`, `website/src/app/api/score-document/route.ts`

2. **Test execute router** after deployment using the test command in the test results file

3. **Investigate sage-retro 500** — auth passes but the handler throws an internal error. Check Vercel Runtime Logs for the error trace. May be a response parsing issue in extractReceipt or buildEnvelope when processing sage-retro's debrief analysis output

4. **Test 4.6 (full assessment scoring)** — needs the raw API key value for the sr_live_be9492 key. The hashed key is in Supabase but the raw value is needed to test

5. **Consider: should execute/compose/score-document also use direct imports?** The VERCEL_URL fix is pragmatic but the execute router still makes HTTP self-calls. A cleaner architecture would have the execute router import skill handlers directly, but this requires more refactoring

## Blocked On

- **VERCEL_URL fix deployment** — founder needs to commit and push 3 files
- **Test 4.6** — needs sr_live_ API key raw value (not the hash)
- **sage-retro investigation** — needs Vercel Runtime Logs or a console.log added to trace the 500

## Open Questions

- **Is VERCEL_URL available in all Vercel environments?** It should be (it's a System Environment Variable), but if the project has a custom domain that changes routing behavior, this might need verification
- **Should the execute router be refactored to avoid HTTP self-calls entirely?** The VERCEL_URL approach is a quick fix. The long-term solution might be to import skill handlers directly, like we did for context-template.ts
- **What's the plan for deliberation-chain POST handler?** (Test 3.4) — Chain creation works via score-iterate, but the API endpoint for starting a chain directly is missing. Either add a POST handler or document the score-iterate entry point
