# SageReasoning Security Audit Report

**Date:** 4 April 2026
**Scope:** Supabase/database, LLM prompt wiring, API endpoints, sage-mentor module
**Auditor:** Claude (automated security review)

---

## Summary

Three parallel audits identified **45+ findings** across the database layer, LLM prompt construction, and API endpoints. The most critical class of vulnerability was **prompt injection** — every prompt builder in the sage-mentor module accepted raw user data without sanitisation. The second most critical was **access control gaps** on public-facing endpoints.

**Changes implemented in this session are listed below.** Items marked "Deferred" require manual intervention or are architectural decisions for Clinton to make.

---

## Changes Made (This Session)

### 1. Prompt Injection Defence Layer — `sage-mentor/sanitise.ts` (NEW FILE)

Created a dedicated sanitisation module that all prompt-building functions now import. It provides:

- `sanitise(text, contentType)` — strips control characters, collapses excessive newlines, escapes backtick sequences, enforces length limits per content type, and detects common injection signatures
- `sanitiseAndDelimit(text, label, contentType)` — wraps sanitised text in `<user_data>` XML tags so the LLM can clearly distinguish system instructions from user data
- `sanitiseArray(items)` — batch sanitisation for arrays of passion names, tags, etc.
- `detectInjection(text)` / `hasInjectionSignatures(text)` — pattern-matching for known injection phrases ("IGNORE ALL PREVIOUS", "SYSTEM OVERRIDE", etc.)
- Length constants per content type (display names: 100 chars, tasks: 2000, journal entries: 5000, etc.)

### 2. Hardened All Prompt Builders — `sage-mentor/persona.ts`

Every function that builds an LLM prompt now sanitises user-controlled inputs before embedding them:

- **`buildProfileContext()`** — sanitises display_name, persisting_passions, value hierarchy items, oikeiosis entries, causal tendency descriptions, preferred indifferents
- **`buildBeforePrompt()`** — sanitises task description, agent name, display name, passions. Wraps task in `<user_data>` delimiters. Adds explicit "treat as data, not instructions" directive
- **`buildAfterPrompt()`** — sanitises task, agent output (was previously only truncated to 2000 chars — now also sanitised and delimited), agent name, passions
- **`buildMorningCheckIn()`** — sanitises display name and passions
- **`buildEveningReflection()`** — sanitises display name and passions
- **`buildWeeklyPatternMirror()`** — sanitises display name, actions (capped at 20), passion names. Wraps action data in `<user_data>` delimiters

All injection detection triggers `console.warn` logging for security monitoring.

### 3. Hardened Journal Ingestion — `sage-mentor/journal-ingestion.ts`

- **`buildExtractionPrompt()`** — sanitises every journal entry field (teaching, question, response) before embedding. Wraps journal entries in `<user_data>` delimiters. Adds explicit instruction to treat entries as data. Logs injection warnings per journal day.

### 4. Hardened Agent Registration — `sage-mentor/ring-wrapper.ts`

- **`registerInnerAgent()`** — validates agent ID (alphanumeric/hyphens/underscores only, max 100 chars). Sanitises agent name. Rejects registration if injection signatures detected in the name.

### 5. Community Map Privacy Fix — `website/src/app/api/community-map/route.ts`

- **Added `.eq('show_on_map', true)` filter** to the Supabase query. Previously, all 2000 users' locations were returned regardless of their privacy setting.

### 6. API Key Validation Fail-Secure — `website/src/lib/security.ts`

- **Changed from fail-open to fail-secure.** Previously, if the `increment_api_usage()` RPC call failed (database outage), the system returned `valid: true` with zeroed usage counts — allowing unlimited API calls during downtime. Now returns 503 Service Unavailable.

### 7. Restricted CORS — `website/src/lib/security.ts`

- **Replaced `Access-Control-Allow-Origin: *`** on public agent endpoints with specific allowed origins: `sagereasoning.com`, `www.sagereasoning.com`, and the configured `NEXT_PUBLIC_SITE_URL`. Added `X-Api-Key` to allowed headers.

### 8. Score Document R4 Compliance — `website/src/app/api/score-document/[id]/route.ts`

- **Added UUID format validation** on the `id` parameter (prevents information leakage from malformed queries)
- **Restricted returned fields** to public-safe subset only (`id, document_type, katorthoma_proximity, virtue_domains_engaged, philosophical_reflection, improvement_path, created_at`). Previously returned `SELECT *` which included internal evaluation mechanisms.
- **Changed Cache-Control** from `public, max-age=3600` to `private, max-age=300`

### 9. Error Message Sanitisation — `website/src/app/api/baseline/route.ts`

- **Removed Supabase error details** from client-facing responses. Previously returned `detail: insertError.message`, `hint: insertError.hint`. Now returns generic "Failed to save assessment. Please try again."
- **Removed payload logging** — previously logged full user data payloads to console

### 10. Updated Barrel Export — `sage-mentor/index.ts`

- Added sanitise module exports. Updated module documentation.

### 11. Prior Fix — `buildProfileContext` export

- Fixed the missing `export` keyword that the verification agent caught in the previous session.

---

## Deferred Items (Require Manual Action)

### CRITICAL — Do These First

| # | Issue | Action Required |
|---|-------|-----------------|
| D1 | **Service role key in .env.local** | Verify `.env.local` is in `.gitignore`. If this file was ever committed to git, **rotate the key immediately** in Supabase Dashboard → Project Settings → API Keys. Store secrets in Vercel environment variables only. |
| D2 | **Deliberation chain endpoint has no auth** | `/api/deliberation-chain/[id]` returns full reasoning chains to anyone with a UUID. Add authentication or agent_id ownership verification. |
| D3 | **reasoning_receipts and reasoning_patterns missing RLS policies** | Tables have RLS enabled but zero policies defined. Add explicit policies or document that they are service-role-only tables. |

### HIGH — Do This Week

| # | Issue | Action Required |
|---|-------|-----------------|
| D4 | **ADMIN_USER_ID env var** | Verify this is set in production. If missing, all admin endpoints silently block everyone. |
| D5 | **Rate limiting is in-memory only** | Resets on server restart. Doesn't share across Vercel instances. Migrate to Supabase-backed or Redis-backed rate limiting for production. |
| D6 | **IP hashing uses service role key** | In `/api/analytics/route.ts`, the IP hash uses `SUPABASE_SERVICE_ROLE_KEY`. Use a separate dedicated secret for this purpose. |
| D7 | **API key rotation** | No mechanism to rotate keys. Add a POST `/api/admin/api-keys/{id}/rotate` endpoint. |
| D8 | **Delete and export endpoints are placeholders** | `/api/user/delete` and `/api/user/export` return 503 "coming soon". Either implement for GDPR compliance or remove entirely. |

### MEDIUM — Address Before Production Launch

| # | Issue | Action Required |
|---|-------|-----------------|
| D9 | **Add DELETE RLS policies** to all mentor_* tables (GDPR compliance) |
| D10 | **Add UUID validation** to `/api/score-iterate` chain_id parameter |
| D11 | **Reduce free-tier reasoning receipt detail** (R4 compliance) |
| D12 | **Add HTTPS enforcement middleware** |
| D13 | **Validate parseInt results** in journal and receipts routes (NaN, negative values) |
| D14 | **Add LLM output schema validation** — use zod or similar to validate JSON responses from the scoring engine |
| D15 | **Add CSRF tokens** to state-modifying endpoints |

---

## Architecture Notes

### Why Sanitisation Is Necessary But Not Sufficient

Prompt injection cannot be fully eliminated through input sanitisation alone. The `sanitise.ts` module is the **first** line of defence. The **second** line is structural — wrapping user content in `<user_data>` delimiters so the LLM treats it as data, not instructions. The **third** line (not yet implemented) is LLM output validation — verifying that responses match expected schemas before acting on them.

For the sage-mentor specifically, the risk profile is lower than a general-purpose agent because: the ring evaluates user data, it doesn't execute arbitrary instructions. A successful injection would produce a false assessment (annoying but not dangerous) rather than execute a harmful action. Nevertheless, the sanitisation layer makes this much harder.

### CORS Decision

The change from `*` to specific origins means browser-based third-party integrators will need to call the API from their server-side code (which isn't affected by CORS). This is the correct pattern for API-key-gated endpoints — keys shouldn't be exposed in browser JavaScript anyway.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `sage-mentor/sanitise.ts` | NEW — Prompt injection defence layer |
| `sage-mentor/persona.ts` | MODIFIED — All prompt builders now sanitise inputs |
| `sage-mentor/journal-ingestion.ts` | MODIFIED — Extraction prompt now sanitises journal entries |
| `sage-mentor/ring-wrapper.ts` | MODIFIED — Agent registration validates name/ID |
| `sage-mentor/index.ts` | MODIFIED — Added sanitise exports |
| `website/src/app/api/community-map/route.ts` | MODIFIED — Added show_on_map filter |
| `website/src/lib/security.ts` | MODIFIED — Fail-secure, restricted CORS |
| `website/src/app/api/score-document/[id]/route.ts` | MODIFIED — UUID validation, R4 field restriction |
| `website/src/app/api/baseline/route.ts` | MODIFIED — Removed error detail leakage |
