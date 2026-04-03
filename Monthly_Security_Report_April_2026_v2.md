# SageReasoning Monthly Security Report — April 2026

**Date:** April 3, 2026
**Scope:** Full 10-check security audit
**Previous report:** April 1, 2026 (partial — npm only)

---

## Summary Dashboard

| Check | Area | Status |
|-------|------|--------|
| 1 | npm Dependency Vulnerabilities | ⚠️ WARNING — 12 vulnerabilities (10 high, 2 moderate) |
| 2 | Secrets in Git History | ✅ PASS |
| 3 | Outdated Packages | ⚠️ WARNING — Next.js 2 major versions behind |
| 4 | Supabase Row-Level Security (RLS) | ✅ PASS — All tables have RLS enabled |
| 5 | API Key System Integrity | ✅ PASS — SHA-256 hashing, tier enforcement intact |
| 6 | Rate Limiter Configuration | ⚠️ WARNING — Still in-memory only |
| 7 | CORS Configuration | ✅ PASS |
| 8 | Security Headers (CSP, XSS, etc.) | ✅ PASS — All headers present |
| 9 | Public Endpoint Exposure | ⚠️ WARNING — 6 new endpoints since last check, some public without rate limiting |
| 10 | SSL Certificate & Site Availability | ℹ️ INFO — Manual spot-check reminder |

---

## Detailed Findings

### CHECK 1: npm Dependency Vulnerabilities

**Status: ⚠️ WARNING — 12 vulnerabilities (10 high, 2 moderate)**

This is largely unchanged from the April 1 report. Here's what's going on:

**HIGH severity issues:**

1. **Next.js (v14.2.35) — 4 separate vulnerabilities.** Your website framework has known issues that could let an attacker crash your site or smuggle malicious requests past your security. The fix requires upgrading to Next.js 16, which is a major version jump and will need code changes.

2. **d3-color (used by react-simple-maps) — 1 vulnerability.** The world map component uses an old charting library that can be slowed down by crafted input. The fix requires downgrading react-simple-maps to v1, which would break the map.

3. **glob (used by eslint-config-next) — 1 vulnerability.** A command injection issue in a development tool. Only affects your build process, not your live site. Fixed by upgrading eslint-config-next to v16.

4. **picomatch — 4 vulnerabilities.** A file-matching utility with regex denial-of-service issues. Can be auto-fixed.

**MODERATE severity issues:**

5. **@anthropic-ai/sdk (v0.80.0) — 1 vulnerability.** The Anthropic SDK has a sandbox escape issue in its Memory Tool path validation. Fix requires upgrading to v0.82.0 (breaking change).

6. **brace-expansion — 1 vulnerability.** A utility that can hang on crafted input. Auto-fixable.

**What you can auto-fix right now:**
Run `npm audit fix` in the website folder. This patches picomatch and brace-expansion without breaking anything.

**What needs manual upgrades (breaking changes):**
- Next.js 14 → 16 (most important — fixes 4 high vulns + glob + eslint)
- @anthropic-ai/sdk 0.80.0 → 0.82.0 (fixes 1 moderate vuln)
- react-simple-maps needs monitoring for a newer version

---

### CHECK 2: Secrets in Git History

**Status: ✅ PASS**

- Scanned the last 20 commits for patterns resembling API keys, passwords, tokens, or secrets.
- **No real secrets found.** The only `sr_live_` patterns detected are placeholder/documentation strings like `sr_live_YOUR_KEY` and `sr_live_<your_key>` in example code — these are intentional and safe.
- `.gitignore` correctly blocks `.env`, `.env.local`, and `.env.production`.
- The `.env.local` files exist on disk but are **not tracked by git** (confirmed with `git ls-files`). Only `.env.example` is committed, which is correct.
- Two temporary lock files (`~$SageReasoning_BreakEven_Analysis.xlsx` and `~$geReasoning_Deep_Market_Research_v2.docx`) were committed in the most recent commit. These are Microsoft Office lock files and don't contain secrets, but they shouldn't be in the repo. Consider adding `~$*` to `.gitignore`.

---

### CHECK 3: Outdated Packages

**Status: ⚠️ WARNING — Several packages are 1+ major versions behind**

| Package | Current | Latest | Gap | Security Relevance |
|---------|---------|--------|-----|-------------------|
| next | 14.2.35 | 16.2.2 | 2 major | ⚠️ HIGH — has known vulnerabilities |
| react / react-dom | 18.3.1 | 19.2.4 | 1 major | Low — no known security issues |
| @anthropic-ai/sdk | 0.80.0 | 0.82.0 | minor | ⚠️ MODERATE — has a known vulnerability |
| @supabase/ssr | 0.5.2 | 0.10.0 | minor | Medium — auth library, stay current |
| @supabase/supabase-js | 2.99.3 | 2.101.1 | patch | Low — auto-fixable |
| eslint | 8.57.1 | 10.1.0 | 2 major | Low — dev tool only |
| tailwindcss | 3.4.19 | 4.2.2 | 1 major | Low — CSS tool only |
| typescript | 5.9.3 | 6.0.2 | 1 major | Low — dev tool only |

**Priority action:** Upgrade Next.js and @anthropic-ai/sdk first (security fixes). The rest can wait for a dedicated upgrade session.

---

### CHECK 4: Supabase Row-Level Security (RLS)

**Status: ✅ PASS — All tables have RLS enabled**

Every table that stores user data has RLS turned on. Here's the full inventory:

| Table | RLS Enabled | Policy Summary |
|-------|------------|----------------|
| profiles | ✅ | Users can view/update only their own profile |
| action_scores | ✅ | Users can view/insert only their own scores |
| user_stoic_profiles | ✅ | Users can view only their own stoic profile |
| api_keys | ✅ | No user-facing policies — all access via service role (correct) |
| api_key_usage | ✅ | No user-facing policies — all access via service role (correct) |
| deliberation_chains | ✅ | Users can view/insert/update only their own chains |
| deliberation_steps | ✅ | Users can view/insert only their own steps |
| journal_entries | ✅ | Users can view/insert only their own entries |
| baseline_assessments | ✅ | Users can view/insert their own |
| document_scores | ✅ | Users can view/insert their own |
| reflections | ✅ | Users can view/insert their own |
| milestones | ✅ | Users can view/insert their own |
| action_evaluations_v3 | ✅ | Users can view/insert their own |
| deliberation_chains_v3 | ✅ | Users can view/insert their own |
| deliberation_steps_v3 | ✅ | Users can view/insert their own |
| baseline_assessments_v3 | ✅ | Users can view/insert their own |
| progress_snapshots_v3 | ✅ | Users can view/insert their own |
| document_evaluations_v3 | ✅ | Users can view/insert their own |
| agent_foundational_assessments_v3 | ✅ | Users can view/insert their own |
| agent_full_assessments_v3 | ✅ | Users can view/insert their own |
| agent_baseline_results_v3 | ✅ | Users can view/insert their own |
| reasoning_receipts | ✅ | Users can view/insert their own |
| reasoning_patterns | ✅ | Users can view/insert their own |

The `community_map_pins` view correctly exposes only opted-in users' location and score tier, with no personal information beyond display name and city.

**No overly permissive policies detected.** All policies restrict access to `auth.uid() = user_id` (or `= id` for profiles). No wildcard SELECT or DELETE policies exist.

---

### CHECK 5: API Key System Integrity

**Status: ✅ PASS**

- **Hashing:** API keys are stored as SHA-256 hashes using Node.js `createHash('sha256')`. Plaintext keys are never stored in the database. ✅
- **Key format validation:** The code checks for the `sr_live_` prefix before processing. Keys are extracted from either `Authorization: Bearer sr_live_...` or `X-Api-Key: sr_live_...` headers. ✅
- **Tier enforcement:** Free tier gets 100 calls/month (updated from 30 in the code comments — the security.ts code enforces whatever `monthly_limit` is set in the database). Paid tier gets configurable limits (default 10,000/month, 500/day). ✅
- **Daily burst cap:** Enforced at the database level via atomic increment function. ✅
- **Chain iteration limits:** Free tier limited to 1 iteration, paid tier to 3. ✅
- **Suspended key handling:** Suspended keys return 403 with explanation. ✅

**One note:** The code "fails open" if the usage increment database call fails (lines 371-386 in security.ts). This is intentional to avoid blocking valid users during a database hiccup, but it means a temporary DB outage could allow calls beyond limits. This is an acceptable trade-off for a low-traffic site but should be monitored.

---

### CHECK 6: Rate Limiter Configuration

**Status: ⚠️ WARNING — In-memory only**

**Current rate limits:**

| Category | Max Requests | Window | Used By |
|----------|-------------|--------|---------|
| scoring | 15/minute | 60 sec | Human scoring endpoints (score, compose, patterns, etc.) |
| public-agent | 30/minute | 60 sec | Public agent-facing endpoints |
| analytics | 60/minute | 60 sec | Analytics/tracking |
| admin | 30/minute | 60 sec | Admin and key management endpoints |

**429 responses:** Include `Retry-After` header and `X-RateLimit-Limit`/`X-RateLimit-Remaining` headers. ✅

**Issue: The rate limiter is in-memory only.** This means:
- Rate limits reset when the server restarts or redeploys.
- On Vercel's serverless platform, each function instance has its own counter, so the effective limit per user could be higher than configured.
- **Recommendation for production:** Move to Redis-based rate limiting (e.g., Upstash Redis, which has a Vercel integration) when traffic justifies it. For the current traffic level, in-memory limiting is acceptable but provides weaker protection.

**Cleanup:** The code runs a cleanup interval every 5 minutes to remove expired entries. ✅

---

### CHECK 7: CORS Configuration

**Status: ✅ PASS**

- **Authenticated endpoints:** Restricted to `ALLOWED_ORIGIN` which defaults to `https://sagereasoning.com` (or `NEXT_PUBLIC_SITE_URL` env var). Only `GET, POST, OPTIONS` methods allowed. Credentials allowed. ✅
- **Public agent endpoints:** Use wildcard `*` origin — this is intentional and correct for an API that agents call from any origin. Only `GET, POST, OPTIONS` methods allowed. Credentials NOT allowed (correct for wildcard). ✅
- **Preflight responses:** Both categories return proper 204 No Content for OPTIONS requests. ✅

No changes detected from last month's configuration.

---

### CHECK 8: Security Headers (CSP, XSS, etc.)

**Status: ✅ PASS — All headers present and correctly configured**

| Header | Expected | Found | Status |
|--------|----------|-------|--------|
| X-Content-Type-Options | nosniff | nosniff | ✅ |
| X-Frame-Options | DENY | DENY | ✅ |
| X-XSS-Protection | 1; mode=block | 1; mode=block | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | strict-origin-when-cross-origin | ✅ |
| Permissions-Policy | camera, mic, geo, payment disabled | camera=(), microphone=(), geolocation=(), payment=() | ✅ |
| Content-Security-Policy | Present with restrictions | Present — see details below | ✅ |

**CSP details:**
- `default-src 'self'` — good baseline
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — `unsafe-inline` and `unsafe-eval` are needed for Next.js but weaken CSP. This is a known trade-off with Next.js and is acceptable.
- `connect-src` restricted to self + Supabase + Anthropic API domains. ✅
- `frame-ancestors 'none'` — prevents clickjacking (matches X-Frame-Options: DENY). ✅
- `img-src` allows `https:` broadly — could be tightened in the future but acceptable for now.

**Image optimization:** Restricted to `sagereasoning.com` and `*.supabase.co` only. ✅

---

### CHECK 9: Public Endpoint Exposure

**Status: ⚠️ WARNING — Several new public endpoints added**

**New endpoints added since last report** (from the "openbrain prep" and "wrappers" commits):

| Endpoint | Auth | Rate Limit | Methods | Notes |
|----------|------|-----------|---------|-------|
| /api/compose | ✅ JWT | ✅ scoring | POST | Protected — good |
| /api/mcp/tools | ❌ None | ❌ None | GET | Public tool discovery — intentional but needs rate limiting |
| /api/patterns | ✅ JWT | ✅ scoring | POST | Protected — good |
| /api/receipts | ✅ JWT | ✅ scoring | GET | Protected — good |
| /api/skill/sage-classify | ✅ JWT | ✅ scoring | POST | Protected — good |
| /api/keys | ✅ JWT | ✅ admin | GET | Protected — good |
| /api/marketplace | ❌ None | ❌ None | GET | Public catalog — intentional |
| /api/marketplace/[id] | ❌ None | ❌ None | GET | Public catalog detail — intentional |
| /api/usage | ✅ JWT | ✅ admin | GET | Protected — good |
| /api/evaluate | ❌ None | ✅ custom (5/min) | POST | Public demo — rate limited |
| /api/execute | ✅ JWT | ✅ scoring | POST | Protected — good |
| /api/reason | ✅ JWT | ✅ scoring | POST | Protected — good |
| /api/skills | ❌ None | ❌ None | GET | Public skill registry — intentional |
| /api/skills/[id] | ❌ None | ❌ None | GET | Public skill detail — intentional |
| /api/skill/sage-* (15 skills) | ✅ JWT | ✅ scoring | POST | Protected — good |

**Full public endpoint list** (no auth required):

1. `/api/badge/[id]` — Public badge display (rate limited) ✅
2. `/api/community-map` — Public map data (no rate limit) ⚠️
3. `/api/evaluate` — Public demo (rate limited to 5/min) ✅
4. `/api/marketplace` — Public catalog (no rate limit) ⚠️
5. `/api/marketplace/[id]` — Public catalog detail (no rate limit) ⚠️
6. `/api/mcp/tools` — MCP tool discovery (no rate limit) ⚠️
7. `/api/skills` — Public skill registry (no rate limit) ⚠️
8. `/api/skills/[id]` — Public skill detail (no rate limit) ⚠️

**Concern:** Six public endpoints lack rate limiting. While they are read-only (GET) and serve public data, an attacker could abuse them to generate excessive Supabase database load. Adding basic rate limiting (e.g., `RATE_LIMITS.publicAgent` at 30/min) to all public endpoints would be a low-effort improvement.

---

### CHECK 10: SSL Certificate & Site Availability

**Status: ℹ️ INFO — Manual check reminder**

Your site is hosted on Vercel, which automatically manages SSL certificates. No action is needed on your part, but it's good practice to periodically visit https://sagereasoning.com in a browser and confirm:
- The page loads without any certificate warnings
- The padlock icon appears in the address bar
- The site responds within a few seconds

---

## Prioritised Action Items

### 🔴 High Priority (do within 2 weeks)

1. **Run `npm audit fix` in the website folder.** This is safe and automatic — it patches picomatch and brace-expansion without breaking anything. Takes 1 minute.

2. **Plan the Next.js 14 → 16 upgrade.** This is the single most impactful security improvement you can make. It fixes 4 high-severity vulnerabilities in the framework your entire site runs on. This will require a dedicated development session and testing.

3. **Upgrade @anthropic-ai/sdk from 0.80.0 to 0.82.0.** This fixes a moderate sandbox escape vulnerability. May require minor code changes (breaking change).

### 🟡 Medium Priority (do within 1 month)

4. **Add rate limiting to public read-only endpoints.** The 6 public GET endpoints (`community-map`, `marketplace`, `mcp/tools`, `skills`) should have basic rate limiting to prevent abuse. A simple one-liner per endpoint using `RATE_LIMITS.publicAgent`.

5. **Add `~$*` to `.gitignore`.** Two Office lock files were accidentally committed. Add `~$*` to `.gitignore` and remove them from tracking with `git rm --cached '~$*'`.

6. **Update @supabase/ssr from 0.5.2 to 0.10.0.** This is your auth library and staying current is important, though no specific vulnerabilities are known.

### 🟢 Low Priority (track for next quarter)

7. **Evaluate Redis-based rate limiting** (e.g., Upstash) when traffic increases. The current in-memory limiter is adequate for low traffic but won't work reliably on Vercel's serverless architecture at scale.

8. **Monitor react-simple-maps** for a new release that fixes the d3-color vulnerability without requiring a major downgrade.

9. **Plan React 18 → 19 upgrade** alongside the Next.js upgrade when ready.

10. **Consider tightening CSP `img-src`** from `https:` to specific domains if feasible.

---

*Report generated automatically by the SageReasoning monthly security audit task.*
