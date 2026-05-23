# Next-Session Prompt — C: ATL → Sage Assent rename arc (Critical, multi-session)

**Stream:** founder.
**Tier:** opens at **`code-elevated`** (C Phase 1 — internal identifier renames, the day's default bite). Phase 2 is `governance`/Standard. **Phase 3 is `code-critical`** (external/wire-format + public copy — full Critical Change Protocol; its own dedicated session(s)). Re-declare tier per phase.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only; Critical Change Protocol step 3 = N/A).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-track-followons-A-build-close.md` (the A-track is built + pushed + Vercel-green; A1 landed before C as required).
**Predecessor decision-log entry:** `D-TRACK-FOLLOWONS-A-BUILD-2026-05-23`.
**Deliverable-of-the-day (read in full):** `/drafts/2026-05-23-track-followons-design-pack.md` **§Track C** — the impact-map + phased plan. Read the phase you're building.
**Risk classification:** Phase 1 = **Elevated** (mechanical file/symbol/import renames; no external surface). Phase 2 = **Standard** (docs/registry). **Phase 3 = Critical** (live credential prefix, persisted DB scope value, published agent-card contract — the full Critical Change Protocol applies, visible in-conversation before any deploy).

## Locked decisions (from the 2026-05-23 gate — do not re-litigate)
- **Phase 0 naming decision is RESOLVED:** **full internal + external rename — "Sage Assent" replaces "Agent Trust Layer" / "ATL" everywhere**, including the public surfaces and the wire-format contract.
- **`D-ATL-*` decision-log IDs are IMMUTABLE** — historical anchors; do **not** rename them (renaming breaks cross-references). New entries use the new name.
- C is a **Critical, multi-session arc**, sequenced **after** the A-track (done) and **before** E.

## Why this session matters
The A-track made the live Sage Reflect product faithful to its design. C is the **pre-launch positioning + wire-format cleanup**: retiring "Agent Trust Layer" for "Sage Assent" across ~140 files (~50 code, ~15 load-bearing). The safe parts (internal identifiers, docs) are phased away from the breaking parts (the `sr_atl_` credential prefix, the `atl_write` DB scope value, the published agent-card extension URI). The lowest-cost window for the breaking prefix change is **now** — production has **zero live credentials** (the test cred was revoked under Track F) — but it is still a public-contract change and stays Critical.

## Pre-conditions (confirm at open)
1. Working tree clean; predecessor A-track committed + pushed (done); Vercel green (done); no `.git/index.lock` (if GitHub Desktop complains, close/reopen it).
2. **A-track Verified:** confirm the two A migrations have been run in Supabase (`supabase-sage-reflect-cost-tracker-migration.sql`, `supabase-sage-reflect-a1-cross-session-migration.sql`) and the suite is green. *Not a hard blocker for C Phase 1 (mechanical internal renames don't depend on them), but A should be Verified before relying on its live behaviour — until the migrations run, A2 writes fail-soft and A1 reads fail-closed.*
3. Production unchanged otherwise: `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling Live (gated); Layer-3 + R20a substrate gates UNSET.
4. `cd website && npm install` if a clean checkout (tsx is a devDependency); run verification commands one at a time; the Supabase-importing tests need `npx tsx --env-file=.env.local` (per `/CLAUDE.md`).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users"; the SR-15 reconciliation note rides this arc).
3. `/operations/handoffs/founder/2026-05-23-track-followons-A-build-close.md` (predecessor — what just landed).
4. `/operations/decision-log.md` — last 2 entries (`D-TRACK-FOLLOWONS-A-BUILD-2026-05-23`, `D-TRACK-FOLLOWONS-DESIGN-PACK-2026-05-23`).
5. `/drafts/2026-05-23-track-followons-design-pack.md` §Track C — the phase being built.

Confirm at open: tier; hold-point (P0 0h active); model selection (PR4 — **C is a rename; no new LLM calls; model selection N/A**); status vocabulary; signals/risk class. **PR15 consult** (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`) before any bespoke step — for a rename the load-bearing reuse is the codebase's own identifiers; no Anthropic primitive substitutes, but record the consult. **PR16 positioning lens:** this rename is the "Character Kernel" (R18a) positioning change — flag positioning impact at each phase.

## Part B — The phased plan (per design-pack §C)
**Surface the day's bite at open** — recommended first bite is **Phase 1 only** (a clean, reversible mechanical pass). Phase 3 must be its own Critical session. The founder may instead elect **E#1** (persist the Agent-Card verification verdict — `code-elevated`, ~1 short session, the one E item worth doing pre-launch) before starting C; state the election at open.

### Phase 1 — Internal identifiers (Elevated; this session's default)
Mechanical, no external surface. Rename and update imports for:
- Files: `atl-wrapper`, `atl-bridge`, `atl-accreditation-writer`/`-store`, `atl-tree-search-adapter`, `atl-iteration-patterns`; `trust-layer/grade-engine/`, `window-aggregator.ts`, `card/accreditation-card.ts`.
- Symbols: `generateAtlWriteToken` / `validateAtlWriteToken` / `evaluateAtlWriteRow`; the **const name** `ATL_WRITE_TOKEN_PREFIX` (the NAME only — **not its value `sr_atl_`**, which is Phase 3); the internal audit-event tag `kind:'atl_write'`.
- Import-only references in `sage-reflect/sage-assent-feed.ts` + `agent-hand-back-report.ts`.
- **Do NOT touch** in Phase 1: the `sr_atl_` string value, the `atl_write` DB scope value, the published `agent-card.json`, or the `Bearer sr_atl_` runtime checks (all Phase 3).
- Fold in the **SR-15 reconciliation** naming (the `sage_reflect_proximity_domains` vs ATL aggregate `typical_proximity` naming) per the design pack.
PEV loop (PR10): after the pass, `npx tsc --noEmit` exits 0 and the full sage-reflect + substrate suites are green (single mechanical pass, no behaviour change).

### Phase 2 — Docs / registry (Standard/governance)
`manifest.md`, `/adopted/project-instructions-snapshot.md`, the `adopted/*-design.md` corpus, `drafts/`, handoffs, and `website/public/component-registry.json` (the two "Agent Trust Layer" entries). **Leave the `D-ATL-*` decision-log IDs as-is.** Update the standing + build caches if any governed surface changes (cache-drift discipline → `D-CACHE-DRIFT-…`).

### Phase 3 — External / wire-format + public copy (CRITICAL — dedicated session, full Critical Change Protocol visible before deploy)
Only after Phases 1–2. Complete the 6-step Critical Change Protocol (0c-ii) in-conversation before asking to deploy:
- **`sr_atl_` credential prefix** — dual-accept old+new during a window (lowest cost now: zero live credentials, but still a published-contract change).
- **`atl_write` DB scope value** — data migration adding the new value before removing the old; recreate the CHECK constraint (`purpose IN (...)`), the `api_keys_atl_write_requires_owner_and_agent` constraint, the `api_keys_atl_write_owner_agent_unique` index, the supporting index, and the profile-delete trigger.
- **Published agent-card** `website/public/.well-known/agent-card.json` — `tokenPrefix`, the `Bearer` example, and the **extension URI** `https://sagereasoning.com/extensions/atl-write-auth/v1` (version bump + notice).
- **Public brand copy** (R18a/R18b) — `agent-card.json:137`, `limitations/page.tsx:114`, `ops-hub/page.tsx:894`, `guardrail/route.ts:44`.

### Decision-log + close (lean per the standing cache, full for Phase 3)
Append a lean entry for Phase 1/2; the Phase 3 session uses the full Critical templates. If the session ends mid-arc, the close's "Next Session Should" names the next phase.

## Part C — Anticipated session shape (Phase 1)
| Phase | Estimate |
|---|---|
| Caches + predecessor close + design-pack §C read | 15–20 min |
| Phase 1 rename pass (files + symbols + imports + SR-15 naming) | 60–90 min |
| Verify (tsc + full suites green) | 20–30 min |
| Decision-log + close | 20–30 min |
| **Total (Phase 1)** | **~2–2.5 hours** |
Phase 2 ~1 session (Standard); Phase 3 is its own Critical session(s).

## Rollback path
Phase 1 is a mechanical rename — fully reversible by reverting the commit (no runtime behaviour change; the `sr_atl_` value + DB scope + agent-card are untouched, so issued/expected tokens are unaffected). Phase 2 is docs-only. **Phase 3 carries its own Critical rollback** (dual-accept window keeps old credentials valid; the scope migration adds-before-removes; the agent-card change is revertible) — defined in that session's Critical Change Protocol.

## Forecast
Success = "Agent Trust Layer" retired for "Sage Assent" across the internal code (Phase 1) and the docs/registry (Phase 2), with the breaking external surfaces (Phase 3) sequenced into a dedicated Critical session at the lowest-cost window (zero live credentials). After C, the remaining locked item is **E#1** (persist the Agent-Card verdict; the rest of E is effect-gated or build-blocked). The founder elects each session's bite at open. The held "something else" (the `/inbox/` "build the project room" methodology) is surfaced first if it has firmed up into something that reorders this.

End of prompt. Opens as a `code-elevated` Phase-1 rename session (re-declare to `code-critical` for Phase 3). Baseline: A-track Live/Verified (gated), Vercel green — stable known-good.
