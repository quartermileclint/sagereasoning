# Session Close — 21 April 2026 (Context Loader Path Fix — All Five File-Based Loaders Verified on Vercel)

## Decisions Made

- **Option A (parent-directory traversal) chosen based on diagnostic evidence.** Diagnostic endpoint at `/api/debug/loader-cwd` confirmed: `process.cwd()` on Vercel resolves to `/var/task/website` (the Next.js project dir), not `/var/task` (the repo root). All ten parent-traversal paths (`path.join(process.cwd(), '..', ...)`) resolved successfully. All ten direct paths (`path.join(process.cwd(), ...)`) returned ENOENT. Option A was the cheapest correct fix — smallest diff, no file moves, no `next.config.js` plumbing needed. Options B and C were unnecessary because the Vercel bundler already ships the source files at the repo root.
- **Fix applied to all five file-based loaders in a single pass.** Each loader gained a `REPO_ROOT = path.join(process.cwd(), '..')` constant and had its path declarations updated to use `REPO_ROOT` instead of `process.cwd()`. Comments updated with the diagnostic finding and date.
- **Harnesses must run from `website/` subdirectory.** The path fix changes the directory contract: loaders expect `process.cwd()` to be the Next.js project dir (which it is on Vercel). The sandbox CWD is the repo root, so harnesses must be invoked as `cd website && node ../scripts/<harness>.mjs` to match Vercel's runtime. This is a permanent change to the harness invocation pattern.
- **D-Ops-0 through D-Ops-6 approved by founder.** Seven decision-log entries from the Ops close handoff accepted as drafted. Pending paste into `operations/decision-log.md`.
- **Four knowledge-gap register updates approved by founder.** KG1 third observation, Supabase-read-path loader (1st obs), multi-source synthesis loader (1st obs), field-level 'unknown' self-disclosure (2nd obs). Pending paste into `operations/knowledge-gaps.md`.

## Status Changes

- `website/src/lib/context/tech-system-state.ts` (Tech Channel 1): **Wired-but-stub-on-Vercel → Verified**. Live probe at `/founder-hub` confirmed: Tech persona cited actual endpoints and known-issues state from source files. No "unavailable" markers.
- `website/src/lib/context/tech-endpoint-inventory.ts` (Tech Channel 2): **Wired-but-stub-on-Vercel → Verified**. Same probe confirmed: 17 endpoints from TECHNICAL_STATE.md cited with auth, model, depth, and status details. CHECK 3 DRIFT remains expected — TECHNICAL_STATE.md §2 reconciliation is a future session.
- `website/src/lib/context/growth-actions-log.ts` (Growth Channel 1): **Wired-but-stub-on-Vercel → Verified**. Live probe confirmed: Growth persona cited the seeded 20 April 2026 positioning entry by name and date.
- `website/src/lib/context/growth-market-signals.ts` (Growth Channel 2): **Wired-but-stub-on-Vercel → Verified**. Same probe confirmed: zero signals reported, sparse-state disclosure held, no hallucinated market signals. The "Do NOT invent signals" instruction worked as designed.
- `website/src/lib/context/ops-continuity-state.ts` (Ops Channel 2): **Wired-but-stub-on-Vercel → Verified**. Live probe confirmed: Ops persona cited actual decision-log entries (D-Tech-1 through D-Tech-5, D-Growth-1 through D-Growth-5), all ten KG entries with accurate re-explanation counts, and flagged KG1 + D-Tech-5 as the live issue.
- `website/src/lib/context/ops-cost-state.ts` (Ops Channel 1): **Unchanged — remains Wired-but-stub-on-production**. The `cost_health_snapshots` table still does not exist in production Supabase. This is Track B (Critical Change Protocol session). Ops correctly noted the cost data was unavailable during the live probe.
- `website/src/app/api/debug/loader-cwd/route.ts`: **Created → Removed**. Temporary diagnostic endpoint. Served its purpose. Deleted at session close.

## What Was Changed

### Files Modified (5)

| File | Change |
|------|--------|
| `website/src/lib/context/tech-system-state.ts` | Added `const REPO_ROOT = path.join(process.cwd(), '..')`. Changed `KNOWN_ISSUES_PATH` from `path.join(process.cwd(), 'operations', ...)` to `path.join(REPO_ROOT, 'operations', ...)`. Updated comment with diagnostic finding. |
| `website/src/lib/context/tech-endpoint-inventory.ts` | Added `const REPO_ROOT = path.join(process.cwd(), '..')`. Changed `TECH_STATE_PATH` from `path.join(process.cwd(), 'TECHNICAL_STATE.md')` to `path.join(REPO_ROOT, 'TECHNICAL_STATE.md')`. Updated comment. |
| `website/src/lib/context/growth-actions-log.ts` | Added `const REPO_ROOT = path.join(process.cwd(), '..')`. Changed `ACTIONS_LOG_PATH` from `path.join(process.cwd(), 'operations', ...)` to `path.join(REPO_ROOT, 'operations', ...)`. Removed KNOWN LIMITATION block (no longer applicable). Updated comment. |
| `website/src/lib/context/growth-market-signals.ts` | Added `const REPO_ROOT = path.join(process.cwd(), '..')`. Changed `MARKET_SIGNALS_PATH` from `path.join(process.cwd(), 'operations', ...)` to `path.join(REPO_ROOT, 'operations', ...)`. Removed KNOWN LIMITATION block. Updated comment. |
| `website/src/lib/context/ops-continuity-state.ts` | Changed `const ROOT = process.cwd()` to `const ROOT = path.join(process.cwd(), '..')`. All five downstream path constants (HANDOFFS_DIR, DECISION_LOG_PATH, KG_REGISTER_PATH, COMPLIANCE_REGISTER_PATH, D_REGISTER_PATH) inherit the fix via ROOT. Updated comment. |

### Files Created Then Removed (1)

| File | Purpose |
|------|---------|
| `website/src/app/api/debug/loader-cwd/route.ts` | Temporary diagnostic endpoint. Returned `process.cwd()`, `__dirname`, `fs.stat()` results for all source paths. Confirmed the diagnosis and Option A viability. Removed at session close. |

### Files NOT Changed

- `website/src/app/api/founder/hub/route.ts` — no changes needed. The route file calls the loaders; the loaders handle their own path resolution.
- `website/src/lib/context/ops-cost-state.ts` — not a file-based loader. Reads from Supabase. Not in scope for this fix.
- `website/next.config.js` — no `outputFileTracingIncludes` needed. Option C was unnecessary.
- All three harness scripts (`scripts/tech-wiring-verification.mjs`, `scripts/growth-wiring-verification.mjs`, `scripts/ops-wiring-verification.mjs`) — unchanged. Invocation pattern changed (run from `website/` subdirectory).
- All source data files (`operations/tech-known-issues.md`, `TECHNICAL_STATE.md`, `operations/growth-actions-log.md`, `operations/growth-market-signals.md`, and the five Ops C2 sources) — unchanged.
- No Supabase changes. No SQL. No DDL. No RLS.
- No auth, session, or cookie changes.
- No safety-critical surface touched.

## Verification Completed This Session

- **Diagnostic probe on Vercel runtime.** Founder hit `/api/debug/loader-cwd?key=<FOUNDER_USER_ID>` and returned the full JSON diagnostic. Confirmed `process.cwd()` = `/var/task/website`, all direct paths ENOENT, all parent-traversal paths exist. Recorded verbatim in session transcript.
- **TypeScript type-check.** `npx tsc --noEmit` clean after all five loader edits.
- **Tech harness.** `cd website && node ../scripts/tech-wiring-verification.mjs` — CHECK 1 GREEN, CHECK 2 GREEN, 10/10 parse assertions passed. CHECK 3 DRIFT (expected — TECHNICAL_STATE.md §2 reconciliation is a future session).
- **Growth harness.** `cd website && node ../scripts/growth-wiring-verification.mjs` — 16/16 assertions passed. `is_sparse: true` on Channel 2 is correct (no market signals recorded yet).
- **Ops harness.** `cd website && node ../scripts/ops-wiring-verification.mjs` — 40/40 assertions passed. All five Channel 2 sources reading live data (5 handoffs, 12 decisions, 10 KG entries, 24 compliance obligations, 10 D-register entries).
- **Live probe — Tech persona at `/founder-hub`.** Cited 17 endpoints from TECHNICAL_STATE.md with auth, model, depth details. Reported no known issues. No "unavailable" markers.
- **Live probe — Growth persona at `/founder-hub`.** Cited the seeded 20 April 2026 positioning entry. Reported zero market signals. Sparse-state disclosure held — no hallucinated market data. No "unavailable" markers.
- **Live probe — Ops persona at `/founder-hub`.** Cited actual decision-log entries (D-Tech-1–5, D-Growth-1–5), all ten KG entries, flagged KG1 + D-Tech-5 as live. Channel 1 correctly noted cost data unavailable (Track B). No "unavailable" markers on Channel 2.

## Diagnostic Output (Verbatim from Vercel Runtime)

```json
{
  "process_cwd": "/var/task/website",
  "__dirname": "/var/task/website/.next/server/app/api/debug/loader-cwd",
  "cwd_listing": [".next", "___next_launcher.cjs", "node_modules", "operations", "package.json", "src"],
  "parent_listing": ["TECHNICAL_STATE.md", "___vc", "compliance", "operations", "package.json", "sage-mentor", "stoic-brain", "website"],
  "direct_path_checks": "ALL 10 ENOENT (except website/operations/ dir exists but wrong one)",
  "parent_path_checks": "ALL 10 EXIST"
}
```

Key finding: `website/operations/` exists on Vercel but is NOT the repo-root `operations/` — it contains build artifacts, not the source markdown files. This is a subtle trap: a naive existence check on the `operations/` directory would pass, but file reads would still ENOENT.

## Decision Log Entries — Proposed (Founder Approval Required)

```
## 2026-04-21 — D-Fix-1: Vercel path resolution — Option A (parent-directory traversal) chosen

**Decision:** Fix all five file-based context loaders by adding `const REPO_ROOT = path.join(process.cwd(), '..')` and resolving all source paths from REPO_ROOT. Option A chosen over Option B (file-move) and Option C (outputFileTracingIncludes).

**Reasoning:** Diagnostic endpoint confirmed `process.cwd()` = `/var/task/website` on Vercel runtime. All parent-traversal paths resolved successfully. All direct paths returned ENOENT. Option A is the smallest diff (one constant + path update per loader), requires no file moves or Next.js config changes, and the bundler already ships the source files at the repo root. Options B and C solve the same problem with more complexity and more rollback surface.

**Alternatives considered:** Option B (file-move) — rejected; unnecessary since files are already accessible via `..`. Introduces source-of-truth ambiguity for files referenced from outside the loaders. Option C (outputFileTracingIncludes) — rejected; unnecessary since the bundler already ships the files.

**Revisit condition:** If a future Vercel runtime change prevents parent-directory traversal (e.g., sandboxing the function to its project directory), revisit with Option C.

**Rules served:** KG1 resolution, PR2 (verified in same session), PR5/PR8 (KG1 promoted at third recurrence).

**Impact:** Five loaders move from Wired-but-stub-on-Vercel to Verified. Tech, Growth, and Ops file-based channels all reading live data on production.

**Status:** Adopted.
```

```
## 2026-04-21 — D-Fix-2: Harness invocation pattern changed — run from website/ subdirectory

**Decision:** All three wiring verification harnesses must now be invoked from the `website/` subdirectory: `cd website && node ../scripts/<harness>.mjs`. This matches Vercel's runtime where `process.cwd()` = the Next.js project dir.

**Reasoning:** The path fix changes the directory contract. Loaders now expect `process.cwd()` to be the Next.js project dir (not the repo root). Running harnesses from the repo root would cause loaders to resolve paths incorrectly (one level too high). Running from `website/` matches Vercel's runtime and all three harnesses pass.

**Alternatives considered:** Modify harnesses to `cd` internally — rejected; harnesses are founder-verification tools and should match the production runtime faithfully. Add a `process.chdir()` to each harness — rejected; changes harness semantics and breaks other assertions that rely on repo-root paths.

**Revisit condition:** If harnesses are refactored for other reasons, consider embedding the directory contract.

**Rules served:** PR2 (build-to-wire verification is immediate).

**Impact:** Harness invocation command changes. Anyone running harnesses must use the new pattern.

**Status:** Adopted.
```

## Knowledge-Gap Register Updates — Proposed (Founder Approval Required)

### KG1 — RESOLUTION (Promotion under PR5 and PR8)

The following text should **replace** the existing KG1 entry and the "Carry-Forward Notes — Growth Wiring Session" KG1 note at the bottom of `operations/knowledge-gaps.md`:

```
## KG1 — Vercel Serverless Execution Model

**Re-explanations:** 4 (Sessions: 9 Apr redirect header stripping, 12 Apr fire-and-forget writes, 9 Apr Session 4 Fetch API behaviour, 17 Apr execution termination)

**Why it caused confusion:** Platform constraints were discovered one at a time through incidents rather than being documented as a set. Each session treated its discovery as a new fact rather than a known constraint.

**Plain-language resolution:** Vercel serverless functions have five rules that affect everything we build:

1. **No self-calls.** An API route cannot call another API route on the same deployment using fetch/HTTP. The www/non-www redirect strips Authorization headers. Use direct function imports instead.
2. **Await all database writes.** Vercel terminates execution after the response is sent. Any Supabase write that isn't awaited before the response may never complete. No fire-and-forget.
3. **Headers can be stripped on redirects.** If Vercel redirects a request (e.g., www → non-www), custom headers including Authorization may be lost.
4. **Execution terminates after response.** Background processing does not work. If the function returns a response, anything still running is killed.
5. **`process.cwd()` resolves to the Next.js project directory, not the repo root.** On Vercel, `process.cwd()` = `/var/task/website`. Files at the repo root are accessible via `path.join(process.cwd(), '..')`. All file-based context loaders must use this parent-traversal pattern. Confirmed by diagnostic probe on 21 April 2026 across all five loaders (Tech C1+C2, Growth C1+C2, Ops C2). Fix: `const REPO_ROOT = path.join(process.cwd(), '..')`.

**Observation history for rule 5:** Tech (1st, 20 April 2026 morning), Growth (2nd, 20 April 2026 afternoon), Ops (3rd, 20 April 2026 evening). Promoted under PR5 (re-explanation threshold) and PR8 (third recurrence). Fix landed 21 April 2026.

**When this matters:** Any time a new endpoint is designed, any time database writes are added, any time one endpoint needs to call another, any time a loader reads files from outside the `website/` directory.
```

### Growth Carry-Forward Note — Remove

The "Carry-Forward Notes — Growth Wiring Session (20 April 2026) → KG1 — Second observation" section can be removed from the bottom of `operations/knowledge-gaps.md`. Its content is now absorbed into the KG1 resolution entry above (rule 5 and observation history).

## Next Session Should

The founder has the following queued tasks. Recommended sequence:

**1. Apply the approved D-Ops-0 through D-Ops-6 entries to `operations/decision-log.md`.**
Seven entries from the Ops close, approved this session. Copy-paste from `operations/handoffs/ops-wiring-fix-close.md` §"Decision Log Entries — Proposed".

**2. Apply the D-Fix-1 and D-Fix-2 entries to `operations/decision-log.md`.**
Two entries from this session's close (above). Copy-paste from this file.

**3. Apply the KG1 resolution and KG register updates to `operations/knowledge-gaps.md`.**
Replace the existing KG1 entry with the resolution version. Remove the Growth carry-forward KG1 note. Add the three new candidate patterns from the Ops close (Supabase-read-path loader 1st obs, multi-source synthesis loader 1st obs, field-level 'unknown' 2nd obs).

**4. Track B — `cost_health_snapshots` migration to production Supabase (Critical).**
Unblocks Ops Channel 1. Full Critical Change Protocol (0c-ii) applies. Dedicated session.

**5. TECHNICAL_STATE.md §2 reconciliation.**
Tech CHECK 3 DRIFT detected 7 routes in code not in the inventory and 4 in inventory not in code. Queued from the Tech close.

**6. Carry-forwards from prior sessions:**
- Mentor memory architecture ADR
- Journal scoring page Option A/B/C
- Defensive-reader disposition
- `operations/handoffs/` vs `operations/session-handoffs/` directory-duplication reconciliation
- What job writes cost_health_snapshots rows, and on what schedule (surfaced at Ops close)

## Blocked On

- **`cost_health_snapshots` table migration.** Blocks Ops Channel 1 from reaching Verified. Track B (Critical Change Protocol session).
- **Founder paste of decision-log entries.** D-Ops-0 through D-Ops-6 (approved, pending paste) + D-Fix-1, D-Fix-2 (proposed above, pending approval and paste).
- **Founder paste of KG1 resolution.** Proposed above, pending approval and paste.

## Open Questions

- **Should the harness invocation pattern (`cd website && node ../scripts/...`) be documented somewhere other than this close handoff?** Candidates: a README in `scripts/`, or a comment at the top of each harness, or both. Currently it's only in this close handoff and the D-Fix-2 decision log entry.
- **The `website/operations/` directory on Vercel is a subtle trap.** It exists but contains build artifacts, not source markdown. Should this be documented as a KG entry, or is the KG1 rule 5 resolution sufficient?

## Process-Rule Citations

- **PR1 — respected.** Fix applied to the five file-based loaders only. No other endpoints or persona branches touched.
- **PR2 — respected.** All five loaders verified in the same session they were fixed: harnesses GREEN, live probes clean, status advanced to Verified.
- **PR5 — respected.** KG1 reached its promotion threshold. Resolution entry drafted for founder approval.
- **PR7 — applied twice.** D-Fix-1 and D-Fix-2 drafted with alternatives considered and revisit conditions.
- **PR8 — one promotion completed.** KG1's `process.cwd()` pattern reached third recurrence (Tech → Growth → Ops) and is promoted to a full resolution entry with the fix as the documented resolution.

---

*End of session close.*
