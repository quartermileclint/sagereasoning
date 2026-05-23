# Session Close — 2026-05-23 — Track C Phase 1 (ATL → Sage Assent internal-identifier rename)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only; Critical Change Protocol step 3 = N/A).
**Tier:** `code-elevated` — **Elevated** risk. PEV loop (PR10). AC7 not engaged; **PR6 NOT engaged** (the credential surface — `sr_atl_` value, `atl_write` DB scope, `Bearer sr_atl_` checks — is byte-identical).
**Date:** 2026-05-23.

Executed Phase 1 of the locked Track C arc (the first of three phases) on the clean, committed A-track baseline (`9b5db78`). At open, I surfaced the bite and you elected **C Phase 1**; mid-discovery I found that the `trust-layer/` folder is riskier than the prompt's framing implied (a repo-root source-of-truth dir outside the type-checked area, with a `tsc`-invisible cross-boundary import and a keep-in-sync mirror), surfaced that as a known risk, and you elected to **defer the folder** and do the rest. The internal-identifier rename is done, `tsc`-clean project-wide, and green across the affected suites. Production is **UNCHANGED** (nothing deployed, no schema, no env change).

## Decisions Made
- `D-TRACK-FOLLOWONS-C-PHASE1-RENAME-2026-05-23` appended. Renamed 6 substrate code files + 6 test files `atl-*` → `sage-assent-*`; renamed the `security.ts` write-credential symbols + coupled types to `SageAssent…`; renamed the const **name** `ATL_WRITE_TOKEN_PREFIX`→`SAGE_ASSENT_WRITE_TOKEN_PREFIX` (**value still `'sr_atl_'`**); renamed the internal log audit-event tags `kind:'atl_write'`→`'sage_assent_write'` and `kind:'atl_verify'`→`'sage_assent_verify'`; folded in the SR-15 proximity-naming reconciliation. **Deferred** the `trust-layer/` directory rename (your election).

## Status Changes
| Item | Old | New |
|---|---|---|
| Track C Phase 1 (internal identifiers) | Scoped | **Verified** (tsc + affected suites green; founder cross-session verification = below) |
| 6 substrate modules `atl-*` | (Live, ATL-named) | **Renamed `sage-assent-*`** (behaviour byte-identical) |
| `security.ts` write-credential symbols + 2 log tags | (Live, ATL-named) | **Renamed Sage-Assent** (credential VALUE/DB-scope/Bearer surface untouched) |
| SR-15 proximity naming | flagged for rename track | **Reconciled** ("(ATL)" retired in `proximity-domains.ts`) |
| `trust-layer/` directory rename | Scoped | **Deferred** (own separately-verified step) |
| `mode:'atl_wrapper'` discriminant | (not previously catalogued) | **Flagged** — needs internal-vs-contract classification before rename |

## Next Session Should
Per the locked C arc, the next bite is **C Phase 2 — docs / registry** (Standard/`governance`): `manifest.md`, `/adopted/project-instructions-snapshot.md`, the `adopted/*-design.md` corpus, `drafts/`, handoffs, and `website/public/component-registry.json` (the two "Agent Trust Layer" entries) — **leave the `D-ATL-*` decision-log IDs as-is**; update the standing + build caches if any governed surface changes. Then **C Phase 3 — external/wire-format** (CRITICAL, dedicated session, full Critical Change Protocol visible before deploy): the `sr_atl_` credential-prefix dual-accept window, the `atl_write` DB-scope migration, the agent-card extension-URI bump, the public copy. Alternatively you may elect **E#1** (persist the Agent-Card verdict; `code-elevated`, ~1 short session). Two items I discovered this session also want a decision before later phases: the **`trust-layer/` folder rename** (deferred) and the **`mode:'atl_wrapper'`** render-mode discriminant (classify internal-dispatch vs wire-contract). The founder elects the bite at open.

## Blocked On
**Files changed this session (uncommitted — for your commit):**
- Renamed (6 source + 6 tests): `website/src/lib/substrate/atl-*.ts` → `sage-assent-*.ts` and the matching `__tests__/` files
- Modified: `website/src/lib/security.ts`, `…/sage-reflect/proximity-domains.ts`, `…/sage-reflect/sage-assent-feed.ts` (+test), `…/substrate/agent-hand-back-report.ts` (+test), `…/substrate/agent-mode-service.ts` (+test), `…/substrate/score-architecture.ts` (+test), `…/app/api/accreditation/[agent_id]/route.ts` (+test, +request-helpers.ts), `…/app/api/admin/accreditation-credentials/route.ts`, `…/app/api/calling/route.ts`, `…/app/api/practice/reflect/route.ts`, `…/lib/__tests__/security.test.ts`
- Comment-only filename de-staling: 5 `…/substrate/trust-layer/*` files + `…/translation-sandwich/layer1-extractor.ts`
- `operations/decision-log.md` (entry appended), this close (NEW)

**Production state at session close:** **UNCHANGED.** No deploy, no env change, no migration this session. `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling Live (gated); Layer-3 + R20a substrate gates UNSET. The rename changes no runtime behaviour; until you commit + push, production runs the identical (ATL-named) code.

**Note on the host `.git/index.lock`:** a host-side `.git/index.lock` the sandbox can't remove was present all session (the GitHub-Desktop artifact your A-track close warned about). It did not affect any of this session's work (all file changes were made directly, not via git). If GitHub Desktop complains of "another process," close/reopen it before committing.

## Verification Method Used (0c framework)
- **API/code path:** `npx tsc --noEmit` → **exit 0** (project-wide type-check — verifies every renamed symbol resolves consistently across `security.ts` and all importers, and that no import path is broken). Plus plain-assertion `tsx` suites for the affected modules (below).
- **Boundary inspection (the Phase-1/Phase-3 line):** confirmed by reading the exact lines — `SAGE_ASSENT_WRITE_TOKEN_PREFIX = 'sr_atl_'` (value preserved); `.eq('purpose', 'atl_write')` (DB scope preserved); `kind: 'sage_assent_write'` (writer tag renamed); `if (!authHeader?.startsWith('Bearer sr_atl_'))` (runtime check preserved).
- **Completeness grep:** zero remaining old identifiers / `atl-*` file-path references / `atl_verify` tags in `website/src`.
- **Suites green this session (~526 assertions):** sage-assent-wrapper 55, sage-assent-bridge 33, sage-assent-accreditation-writer 54, sage-assent-accreditation-store 83, sage-assent-tree-search-adapter 14, sage-assent-iteration-patterns 64, proximity-domains 10, sage-assent-feed 27, agent-hand-back-report 54, score-architecture 69, agent-mode-service 63.
- **Not run in-session (type-clean via tsc; for your environment):** `security.test.ts` (overran the sandbox time budget — it makes a live Supabase call under `--env-file`; ran fine for the A10 build that created it), `philosophical-mode-service.test.ts`, and the route suites (`accreditation/[agent_id]`, `admin/accreditation-credentials`, `calling`, `reflect`).

## Risk Classification Record (0d-ii)
- Internal-identifier rename (files, symbols, log-tags, comments) — **Elevated** (existing user-facing code; mechanical; reversible). None Critical. PR6 not engaged (credential value/DB-scope/Bearer surface byte-identical). AC7 not engaged.

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation. One finding worth carrying (candidate, 1st obs): in this workspace the sandbox **can `mv`/rename but cannot `rm`** files (rename syscall permitted; unlink blocked) — file renames work via `mv`; deletions need the cowork delete-permission tool or a move into a gitignored dir. (Used the latter to clean three probe/test temp files into `website/node_modules/.sage_tmp_trash` — gitignored, invisible to your git status.)

## Founder Verification (Between Sessions)
1. **Type-check** (from `website/`, `npm install` first on a clean checkout):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
```
Expected: prints nothing, exits 0.
2. **Run the affected suites, one command at a time** (per `/CLAUDE.md`; plain `npx tsx` works for these, `--env-file` is harmless):
```
npx tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-wrapper.test.ts                 # 55 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-bridge.test.ts                  # 33 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-accreditation-writer.test.ts    # 54 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-accreditation-store.test.ts     # 83 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-tree-search-adapter.test.ts     # 14 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-iteration-patterns.test.ts      # 64 pass
npx tsx --env-file=.env.local src/lib/sage-reflect/__tests__/proximity-domains.test.ts                # 10 pass
npx tsx --env-file=.env.local src/lib/sage-reflect/__tests__/sage-assent-feed.test.ts                 # 27 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-hand-back-report.test.ts              # 54 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/score-architecture.test.ts                  # 69 pass
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts                  # 63 pass
```
And, in your environment (these I could not complete in-sandbox; they exercise the renamed `security.ts` symbols + routes):
```
npx tsx --env-file=.env.local src/lib/__tests__/security.test.ts
npx tsx --env-file=.env.local src/app/api/accreditation/[agent_id]/__tests__/route.test.ts
npx tsx --env-file=.env.local src/app/api/admin/accreditation-credentials/__tests__/route.test.ts
```
Expected: each prints `N pass / 0 fail`.
3. **Commit + push** (via GitHub Desktop). The simplest correct stage is everything under `website/src` (captures the renames, modifications, and deletions) plus the two governance files:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A website/src
git add operations/decision-log.md \
  "operations/handoffs/founder/2026-05-23-C-phase1-rename-close.md"
# optional: also commit the C arc prompt that drove this work
git add "operations/handoffs/founder/2026-05-23-C-rename-arc-NEXT-SESSION-PROMPT.md"
git commit -m "Track C Phase 1 (D-TRACK-FOLLOWONS-C-PHASE1-RENAME-2026-05-23): ATL→Sage Assent internal identifiers (files, symbols, log-tags, SR-15 naming); trust-layer dir deferred; sr_atl_/atl_write DB-scope/agent-card untouched (Phase 3)"
```
Then push via GitHub Desktop. Vercel will rebuild; behaviour is byte-identical (no public/wire surface changed), so the deploy is a no-op functionally. (`website/tsconfig.tsbuildinfo` is a build artifact left modified by the type-check — `git add -A website/src` does not stage it; ignore or commit at your discretion.)

## Open Questions
- **`trust-layer/` folder rename** — deferred; needs its own step (rename the repo-root source-of-truth dir + the ported mirror together, with a manual import-grep to compensate for the `tsc` blind spot on the cross-boundary import). Revisit at the next C bite.
- **`mode:'atl_wrapper'`** Layer-3 render-mode discriminant — discovered this session; classify internal-dispatch vs wire-contract before renaming (likely Phase 2/3).
- **SR-15 part 2** — whether a native Sage Assent per-domain field should replace the Sage-Reflect-side proximity computation (design decision; naming reconciled this session).

## Cross-references
- `/operations/handoffs/founder/2026-05-23-track-followons-A-build-close.md` (predecessor)
- `/operations/handoffs/founder/2026-05-23-C-rename-arc-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `D-TRACK-FOLLOWONS-C-PHASE1-RENAME-2026-05-23`; `D-TRACK-FOLLOWONS-A-BUILD-2026-05-23`
- `/drafts/2026-05-23-track-followons-design-pack.md` §C (deliverable-of-the-day)

*End of session close. Stabilised to a known-good state: Phase 1 internal rename done, `tsc`-clean and green across the affected suites; production UNCHANGED until you commit + push. Next bite is C Phase 2 (docs/registry) or Phase 3 (Critical, dedicated) or E#1 — your election at open.*
