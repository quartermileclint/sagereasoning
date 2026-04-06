---
name: monthly-security-check
description: Monthly security audit: npm vulnerabilities, secrets scan, outdated packages, Supabase RLS, API key integrity, rate limiter config, CORS/CSP headers, SSL, and public endpoint exposure for SageReasoning
---

Run a comprehensive monthly security audit for the SageReasoning website project. The project is a Next.js app hosted on Vercel with Supabase (PostgreSQL) for auth and data, an API key system, rate limiting, and a public API surface for AI agents.

The workspace is mounted at the standard location — look for the `sagereasoning` folder in the mounted workspace directory.

## CHECK 1: npm Dependency Vulnerabilities
- cd into the `website` folder
- Run `npm audit` and report findings
- Categorize by severity (critical, high, moderate, low)
- For each HIGH or CRITICAL issue: explain in plain English what the risk is, what package causes it, and what the fix is
- Note which issues can be auto-fixed with `npm audit fix` vs. which need manual upgrades

## CHECK 2: Secrets in Git History
- Run `git log --oneline -20` to see recent commits
- Search the last 20 commits for patterns that look like API keys, passwords, tokens, or secrets (e.g., strings starting with `sk_`, `sr_live_`, `eyJ`, long hex strings, anything resembling a Supabase key or Anthropic API key)
- Verify `.gitignore` still blocks `.env`, `.env.local`, `.env.production`, and any other sensitive files
- Check if any new files have been added that might contain secrets

## CHECK 3: Outdated Packages
- Run `npm outdated` in the website folder
- Flag packages that are 1+ major versions behind
- Highlight security-relevant packages (Next.js, Supabase libraries, etc.)

## CHECK 4: Supabase Row-Level Security (RLS)
- Read the file `api/api-keys-schema.sql` and any other SQL migration files
- Verify RLS is enabled on all tables that store user data or API keys
- Check that no tables have been added without RLS policies
- Flag any SELECT/INSERT/UPDATE/DELETE policies that seem overly permissive

## CHECK 5: API Key System Integrity
- Read `website/src/lib/security.ts` (or wherever API key validation lives)
- Verify API keys are still stored as SHA-256 hashes (never plaintext)
- Check that rate limits and tier enforcement (free vs. paid) are still in place
- Verify the key format validation (`sr_live_` prefix + 32 hex chars) hasn't been weakened

## CHECK 6: Rate Limiter Configuration
- Read the rate limiter code in `website/src/lib/security.ts`
- Report current rate limits per endpoint category (scoring, public agent, analytics, admin)
- Flag if the rate limiter is still in-memory only (recommend Redis for production)
- Check that 429 responses include proper Retry-After headers

## CHECK 7: CORS Configuration
- Read the CORS setup in security.ts and next.config.js
- Verify authenticated endpoints are still origin-restricted to sagereasoning.com
- Verify public agent endpoints intentionally use wildcard (`*`) and flag if this has changed
- Check that only expected HTTP methods are allowed

## CHECK 8: Security Headers (CSP, XSS, etc.)
- Read `next.config.js` for the security headers configuration
- Verify all of these are still present:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy (camera, microphone, geolocation, payment all disabled)
  - Content-Security-Policy
- Flag any headers that have been removed, weakened, or commented out

## CHECK 9: Public Endpoint Exposure
- Scan the `website/src/app/api/` directory for all API route files
- List every public endpoint (no auth required) vs. protected endpoint (requires JWT or API key)
- Flag any new endpoints that have been added since the last check
- Flag any endpoint that handles sensitive data but lacks authentication

## CHECK 10: SSL Certificate & Site Availability
- Note: This is an informational reminder only. Since the site is on Vercel, SSL is auto-managed. Just remind Clinton to spot-check https://sagereasoning.com loads without certificate warnings.

## OUTPUT FORMAT
Write a clear, plain-English report in markdown format. Save it to the workspace folder as `Monthly_Security_Report_[Month]_[Year].md` (e.g., `Monthly_Security_Report_May_2026.md`).

Structure the report with:
1. A summary at the top (PASS/FAIL/WARNING for each check area)
2. Detailed findings per check
3. A prioritized action items section at the bottom, sorted by urgency
4. Use simple language — the reader has zero coding experience

If any check reveals a CRITICAL or HIGH severity issue that wasn't present last month, flag it prominently at the top of the report.