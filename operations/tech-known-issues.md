---
updated: 2026-06-10
maintainer: founder
---

# Tech — Known Issues

Hand-maintained single source of truth for current and recently-resolved
system issues. Tech agent reads this file at request time via
`website/src/lib/context/tech-system-state.ts`.

**Maintenance contract:** Founder updates this file at session close when
any issue is observed, any change goes live, or any deploy fails. The AI
may propose edits but does not overwrite without approval.

**Not in scope:** This file is the operator's situational awareness layer,
not a replacement for Vercel runtime logs or the decision log. Vercel logs
are out of reach from inside the serverless runtime; the decision log
tracks reasoning, not live state.

**Severity tiers** (per PR9):

- `catastrophic` — Immediate response. Live system down or unsafe.
- `significant` — Material loss of function for some surface. Not a crisis.
- `minor` — Degraded but functioning. Steady-state maintenance.
- `cosmetic` — Visual or wording. Steady-state maintenance.

**Status values:** `open` / `investigating` / `mitigated` / `resolved`.

---

## Current Issues

*(Refreshed 2026-06-10 at the S7b close from the multidisciplinary review §3 + the S7b session; the "no known issues at 20 April" line was 51 days stale.)*

| # | Issue | Severity | Status | Notes |
|---|-------|----------|--------|-------|
| 1 | 13 npm vulnerabilities (3 moderate, 10 high) recorded May 2026, deferred | significant | open | Needs its own Elevated maintenance session before external exposure. Do NOT `npm audit fix --force` casually. |
| 2 | No CI — all tests run manually | minor | open | GitHub Actions for the pure test suite queued post-S8 (review Tier 4). |
| 3 | `supabase-server.ts` constructs its client at module load — tests importing it need `npx tsx --env-file=.env.local` | minor | open | Test-harness ergonomics, not a substrate defect. Lazy-client fix queued (Elevated, own step). |
| 4 | `/api/admin/slo-health` (A14) admin gate is Bearer-JWT only — a signed-in browser page-visit returns 401 | minor | open | Use the console-fetch snippet (get JWT from localStorage `sb-*-auth-token`, send as `Authorization: Bearer`). Friendlier access path is a future candidate fix. Found at S7b verification 2026-06-10. |
| 5 | `/api/health` response timestamp appeared ~24h stale when fetched 2026-06-10 — probable CDN/edge caching on the GET | cosmetic | open | Diagnostic-uncertain, symptom level. Worth a `Cache-Control: no-store` check some session. |
| 6 | `MENTOR_ENCRYPTION_KEY` has no rotation mechanism (version field exists; rotation unimplemented) | minor | open | Acceptable pre-launch; Critical-class work post-launch. |
| 7 | In-sandbox `git status` leaves a `.git/index.lock` the Cowork sandbox cannot unlink | minor | mitigated | Founder clears with `rm -f .git/index.lock` — first line of every commit block. PR5 candidate (2nd recurrence). |

---

## Recently Resolved (last 30 days)

| # | Issue | Severity | Resolved | Resolution |
|---|-------|----------|----------|------------|
| 1 | S7b cron self-calls to the evaluators returned 401 — Vercel Deployment Protection (Standard) walls the `*.vercel.app` URL that `VERCEL_URL` resolves to, so the self-calls hit Vercel's auth wall before the evaluator tokens were checked | significant | 2026-06-10 | Set `CRON_SELF_BASE_URL=https://www.sagereasoning.com` (Production) + redeploy; self-calls now route via the custom domain (exempt from the wall). Verified by forced-signal test: both evaluators ok, Slack delivery confirmed. Recorded in `D-PRELAUNCH-S7B-A13-DELIVERY-LIVE-2026-06-10`. |
