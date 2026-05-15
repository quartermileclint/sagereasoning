# Session Close — 2026-05-15 — ATL Wrapper Session 7: step 6a — the Badge / Accreditation foundation

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Tier:** `schema` + `code-elevated` — **Elevated** risk under 0d-ii. Lean + Elevated additions template.
**Date:** 2026-05-15.
**Operative session prompt:** ATL Wrapper Session 7 next-session prompt (step 6 — the badge).

---

## What this session did

ATL Wrapper spec **Component 3 — the badge / accreditation** — built as **step 6a** (the recommended split scope: schema + persistence + ported badge library, **no public route**; the public verification endpoint is held to step 6b under the full Critical Change Protocol, per PR1). **After this session every ATL Wrapper component except the public route (step 6b) is real.**

**Part A — opened under the protocol.** Read both caches, the predecessor close, the ATL Wrapper spec **in full**, the DRAFT 5-table schema, the two un-ported `/trust-layer/` badge files, the ported `accreditation-record.ts` + types + `grade-transition-engine.ts`, `atl-wrapper.ts`, `trust-layer-bridge.ts`, the existing `/api/badge/[id]` route, the `/api/public-key` + `/api/receipts` reference routes, `supabase-server.ts`, a house migration file, manifest §R4 / §R18a–e / §AC7 / §AC8 / §KG1 / §KG7, and the last two decision-log entries. **PR15 consult done** — `.claude/skills/anthropic/` (17 skills) + the canonical-primitive list carry nothing that substitutes for a Next.js-route + Supabase persistence layer; `mcp-builder` is a forward pointer for R18c interoperability but not this session; bespoke is correct. **PR11:** no `/inbox/` files dated since the predecessor (newest 2026-05-13); the agentic-commerce findings tracker carries no F-finding targeting the badge session.

**Step 0 + Step 2 — founder pre-elected.** Per the session prompt's "Proceed accepting the recommended options," the founder pre-elected the **6a split scope** (Step 0) and pre-approved the **five Step 2 design decisions** as recommended: (1) schema subset = `agent_accreditation` + `grade_history` only; (2) port `public-endpoint.ts` + `accreditation-card.ts` as KEEP-IN-SYNC mirrors; (3) persistence layer = `atl-accreditation-store.ts` (pure mappers + async store functions, `lookupAccreditationRecord` as the `lookupFn` seam); (4) retire `trust-layer-bridge.ts`; (5) route reconciliation = a new `/api/accreditation/[agent_id]` in 6b, `/api/badge/[id]` untouched.

**Step 1 survey finding — the dependency closure is clean.** Both badge files import only `../types/accreditation` + `./accreditation-record`, both already in the ported closure — `authority-mapper.ts` is **not** needed. No new dependency files ported.

**Steps 3–4 — built and verified.** Produced the runnable migration `website/supabase-agent-accreditation-migration.sql` (the approved subset, with `DROP POLICY IF EXISTS` guards added so the whole script is re-runnable); ported the two badge files verbatim under KEEP-IN-SYNC banners; built `atl-accreditation-store.ts` (five pure mappers + four async store functions over `supabaseAdmin`); wrote `atl-accreditation-store.test.ts` — **79 assertions**. `tsc --noEmit` clean; the new suite 79/0; all nine prior-arc regressions green and unchanged.

Five new files + the migration, imported by no route; no env flag; no production surface touched. `trust-layer-bridge.ts` retirement: disposition decided, deletion delegated to the founder's `git rm` (the sandbox mount blocks `unlink`).

## Decisions Made

- **`D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15`** appended (lean + Elevated additions form). The badge foundation built + Verified; the five Step 2 decisions recorded with reasoning; spec open question 2 (schema disposition) resolved.

## Status Changes

| Item | Old | New |
|---|---|---|
| ATL Wrapper Component 3 (the badge) — foundation | Designed (spec) | **Verified** (schema approved + persistence layer + ported badge library) |
| `agent_accreditation` + `grade_history` schema subset | DRAFT (in `trust-layer-schema-REVIEW.sql`) | **Approved** — runnable migration produced; founder runs the DDL |
| `trust-layer/accreditation/public-endpoint.ts` | un-ported (`/trust-layer/`) | **Verified** — ported KEEP-IN-SYNC mirror, in-tsconfig |
| `trust-layer/card/accreditation-card.ts` | un-ported (`/trust-layer/`) | **Verified** — ported KEEP-IN-SYNC mirror, in-tsconfig (new `card/` dir) |
| `atl-accreditation-store.ts` | — (did not exist) | **Verified** (new module; 79/0 test) |
| `trust-layer-bridge.ts` | Scaffolded | **Retired** (disposition decided; the founder's `git rm` completes the deletion) |
| Spec open question 2 (schema disposition) | Open | **Resolved** — `agent_accreditation` + `grade_history` approved; the other three tables deferred |
| ATL Wrapper build arc | Components 1, 2, 4, 5 Verified; badge open | **Badge foundation Verified** — only the step-6b public route remains |
| `atl-wrapper.ts` / `atl-iteration-patterns.ts` / `atl-bridge.ts` / `agent-mode-service.ts` / `score-architecture.ts` / ported `/trust-layer/` closure | Verified | **Unchanged** (regressions 55/0, 64/0, 31/0, 63/0, 69/0 + 28/0, 33/33, 33/0, 43/0) |
| Production state | A7 Verified; flags UNSET; steady-state | **Unchanged** — no code wired to a route; no env-var, auth, or R20a-perimeter change; the founder runs the additive DDL between sessions |

## Next Session Should

**ATL Wrapper Session 8 — step 6b: the public verification endpoint.** Wire `/api/accreditation/[agent_id]` — a new route (the spec's named surface; `/api/badge/[id]` stays untouched, per the Step 2 route-reconciliation recommendation) that plugs `lookupAccreditationRecord` straight into `handleAccreditationLookup` and serves the `AccreditationPayload` / `AccreditationCard`. This is **`code-critical`** — a new public route + deployment surface; the **full Critical Change Protocol** (0c-ii) applies, and a step-6b next-session prompt should be drafted at that session's open (it was not pre-drafted). It also wires the R18b badge-documentation link. Once 6b lands, the **trajectory-enriched developer hand-back report** becomes buildable. **Pre-conditions:** this session committed + pushed, Vercel green; the `agent_accreditation` + `grade_history` migration run (the two tables exist).

## Blocked On

**Files remaining uncommitted (to be committed by the founder — see Founder Verification):**

```
 M operations/decision-log.md                                                          (entry appended)
 M website/tsconfig.tsbuildinfo                                                         (incremental-build cache — tsc --noEmit touched it)
 D website/src/lib/trust-layer-bridge.ts                                                (RETIRED — staged via `git rm`)
?? website/supabase-agent-accreditation-migration.sql                                   (NEW — the approved DDL the founder runs)
?? website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts               (NEW — ported badge file)
?? website/src/lib/substrate/trust-layer/card/accreditation-card.ts                     (NEW — ported badge file)
?? website/src/lib/substrate/atl-accreditation-store.ts                                 (NEW — the badge persistence layer)
?? website/src/lib/substrate/__tests__/atl-accreditation-store.test.ts                  (NEW — 79 assertions)
?? operations/handoffs/founder/2026-05-15-atl-badge-schema-persistence-close.md          (this file)
```

**Production state at session close:** unchanged from session start. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/public-key` serves Ed25519 steady-state. No env-var changes, no auth-surface changes, no R20a-perimeter changes. The two new Supabase tables do not exist until the founder runs the migration; nothing in the codebase reads or writes them yet (no route). All five new files are imported by no route. AC7 not engaged.

## Open Questions

- **PR10 PEV Verify diagnostic — Diagnostic-certain (sandbox tooling).** `npx tsx` does not run as-written in the build sandbox (the founder's mounted `node_modules` carries the macOS esbuild binary; the sandbox is Linux — same root cause as the predecessor sessions). Resolved in-session by installing `tsx` to `/tmp/sage-tsx` on the sandbox's native filesystem — all ten suites pass (the new test 79/0 + nine regressions). On the founder's macOS machine `npx tsx` runs natively, so the Founder Verification commands below work as written. Revisit condition: none — changes no Verified status.
- **`trust-layer-bridge.ts` retirement — delegated to `git rm` — Diagnostic-certain (sandbox limitation).** The deletion could not be performed from the sandbox (`rm` returns "Operation not permitted" — the mount blocks `unlink`, the same limitation behind the `.git/index.lock` issue). The retirement is performed by the founder's `git rm` in the commit step below. The file is imported by no module — leaving it un-retired until then breaks nothing. Revisit condition: confirm it is gone at the next session-open.
- **The public verification endpoint is NOT wired.** `/api/accreditation/[agent_id]` is step 6b — Critical, full Critical Change Protocol, its own next-session prompt. Revisit condition: step 6b.
- **The trajectory-enriched developer hand-back report is NOT built.** Buildable once the step-6b route lands. Revisit condition: after step 6b.
- **Spec-hygiene finding (carried forward — unchanged).** The Adopted ATL Wrapper spec §"Component 2" still owes the superseded agent-mode spec's content inline. A governance-session item — founder approval + a preserve-prior-versions snapshot. Revisit condition: a governance session.
- **Deferred schema tables.** `evaluated_actions` / `onboarding_results` / `progression_sessions` remain in the DRAFT `trust-layer-schema-REVIEW.sql`, un-run. Revisit conditions: the carried-profile-persistence question, spec open question 7 (onboarding), spec open question 1 (progression toolkit).
- **Agent-identity authentication (spec open question 8) — `agent_id` remains a wrapper-supplied opaque string.** Authenticating it is A10. Revisit condition: A10.

## Founder Verification (between sessions)

Three things to do, in this order. Take them one at a time.

### 1. Run the database migration (Supabase Dashboard)

This creates the two new tables. It is additive and idempotent — it adds two empty tables and changes nothing that already exists.

1. Open the Supabase Dashboard for the SageReasoning project.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open `website/supabase-agent-accreditation-migration.sql` in your editor, copy its **entire** contents, and paste into the query box.
4. Click **Run**.
5. **Expected result:** the query returns a small table with two rows — `agent_accreditation` and `grade_history`. That confirms both tables were created. (If you run it again later, it will succeed again with the same result — that is intended.)

### 2. Verify the build (Terminal)

Run these **one line at a time** (per `/CLAUDE.md` §"Running the substrate test suite" — a pasted block can break on a prompt). The expected result is in the comment on each line.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# Defensive: clear any stale sandbox-created .git/index.lock (harmless if none
# exists — no lock was observed this session, but the predecessors' pattern
# includes this and git operations need the index unlocked).
rm -f .git/index.lock

cd website
npx tsc --noEmit -p tsconfig.json                                                            # clean, exit 0
npx tsx --env-file=.env.local src/lib/substrate/__tests__/atl-accreditation-store.test.ts     # 79 passed / 0 failed
npx tsx src/lib/substrate/__tests__/atl-iteration-patterns.test.ts                           # Total: 64  Pass: 64
npx tsx src/lib/substrate/__tests__/atl-wrapper.test.ts                                      # Total: 55  Pass: 55
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts                                       # Total: 31  Pass: 31
npx tsx src/lib/substrate/__tests__/score-architecture.test.ts                               # 69 pass / 0 fail
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts                                   # 28 pass / 0 fail
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts                                        # 33/33 pass
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts               # 33 pass / 0 fail
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts          # Total: 63  Pass: 63
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts  # Total: 43  Pass: 43
cd ..
```

### 3. Commit and push (Terminal + GitHub Desktop)

Use a **targeted** add (explicit paths, not `git add -A`). The `git rm` line is what retires `trust-layer-bridge.ts`.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

git rm website/src/lib/trust-layer-bridge.ts
git add website/supabase-agent-accreditation-migration.sql
git add website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts
git add website/src/lib/substrate/trust-layer/card/accreditation-card.ts
git add website/src/lib/substrate/atl-accreditation-store.ts
git add website/src/lib/substrate/__tests__/atl-accreditation-store.test.ts
git add website/tsconfig.tsbuildinfo
git add operations/decision-log.md
git add operations/handoffs/founder/2026-05-15-atl-badge-schema-persistence-close.md
git commit -m "ATL Wrapper Session 7: step 6a — the badge / accreditation foundation

Builds the foundation of ATL Wrapper spec Component 3 (the badge) as
the recommended 6a split scope: schema + persistence layer + ported
badge library, no public route. The public verification endpoint
(/api/accreditation/[agent_id]) is held to step 6b under the full
Critical Change Protocol (PR1 — the persistence layer reaches Verified
as library code first).

  - website/supabase-agent-accreditation-migration.sql (NEW) — the
    approved agent_accreditation + grade_history schema subset of the
    DRAFT 5-table /trust-layer/schema/trust-layer-schema-REVIEW.sql,
    as a runnable, idempotent (IF NOT EXISTS / DROP-then-CREATE),
    additive migration. DROP POLICY IF EXISTS guards added so the
    whole script is re-runnable. Run by the founder via the Supabase
    SQL Editor.
  - trust-layer/accreditation/public-endpoint.ts + trust-layer/card/
    accreditation-card.ts (NEW) — verbatim KEEP-IN-SYNC ports of the
    two un-ported /trust-layer/ badge files. Dependency closure is
    clean (only ../types/accreditation + ./accreditation-record, both
    already ported) — authority-mapper.ts not needed.
  - atl-accreditation-store.ts (NEW) — the badge persistence layer:
    five pure mappers (AccreditationRecord/GradeChangeEvent <-> the
    flat agent_accreditation/grade_history rows) + four async store
    functions over supabaseAdmin. lookupAccreditationRecord is shaped
    exactly as handleAccreditationLookup's injected lookupFn seam.
    KG1 (Vercel five-rule posture in the module header) + KG7
    (passions_persisting array passed directly, Array.isArray read
    guard) engaged — first server-side persistence in the ATL arc.
  - __tests__/atl-accreditation-store.test.ts (NEW) — 79 assertions;
    every pure mapper invoked, the persistence seam exercised via
    handleAccreditationLookup with a fake lookupFn, a compile-time
    lookupFn-assignability check, async store exports confirmed (PR2).
  - trust-layer-bridge.ts RETIRED — imported by no module; it dynamic-
    imported across the /trust-layer/ <-> website tsconfig boundary,
    the coupling the porting pattern was elected to avoid.

Step 2 design-decision gate (founder pre-approved all five as
recommended per 'Proceed accepting the recommended options'): schema
subset (agent_accreditation + grade_history; the other three deferred);
porting plan; persistence-layer shape; trust-layer-bridge.ts retire;
route reconciliation (new /api/accreditation/[agent_id] in 6b,
/api/badge/[id] untouched — recorded, not built).

Decision log: D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15.
Tier schema + code-elevated, Elevated risk; AC7 / PR6 / Critical Change
Protocol not engaged. tsc clean; atl-accreditation-store 79/0 +
atl-iteration-patterns 64/0 + atl-wrapper 55/0 + atl-bridge 31/0 +
score-architecture 69/0 + layer3-service 28/0 + r20a-gate 33/33 +
layer1-schema-additions 33/0 + agent-mode-service 63/0 +
philosophical-mode-service 43/0."
```

Then push via **GitHub Desktop**. **No Vercel behaviour change** — all five new files are imported by no route, and `trust-layer-bridge.ts` was imported by no module; `/api/reason` and `/api/substrate/layer3` are byte-identical. Vercel should build green (everything compiles clean under `tsc`).

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-15-atl-iteration-patterns-close.md`
- Operative session prompt (this session): ATL Wrapper Session 7 next-session prompt (step 6 — the badge)
- Decision-log entry: `D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15`
- Predecessor decision-log entry: `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15`
- Consumed/Verified dependencies: `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15` (the ported `/trust-layer/` closure)
- Deliverable-of-the-day: `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` §"Component 3" + §"The existing ATL build" + §"Reconciliation table" + §"R-rule engagement" + §"Open questions deferred to build" (2, 7, 8)
- Source DRAFT schema: `/trust-layer/schema/trust-layer-schema-REVIEW.sql`
- Ported source files: `/trust-layer/accreditation/public-endpoint.ts`, `/trust-layer/card/accreditation-card.ts`
- New files: `/website/supabase-agent-accreditation-migration.sql`, `/website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts`, `/website/src/lib/substrate/trust-layer/card/accreditation-card.ts`, `/website/src/lib/substrate/atl-accreditation-store.ts`, `/website/src/lib/substrate/__tests__/atl-accreditation-store.test.ts`
- Retired: `/website/src/lib/trust-layer-bridge.ts`

*End of session close. The ATL badge's foundation is real — the `agent_accreditation` + `grade_history` migration is approved and runnable, `public-endpoint.ts` + `accreditation-card.ts` are ported and in-tsconfig, and `atl-accreditation-store.ts` round-trips an `AccreditationRecord` ⇄ Supabase with `lookupAccreditationRecord` shaped as the public endpoint's `lookupFn` seam (79/0; tsc clean; all nine prior-arc regressions green). The public route is held back to step 6b under the full Critical Change Protocol, per PR1. Production state unchanged; `/api/reason` byte-identical; no route imports any new file. `trust-layer-bridge.ts` is retired via the founder's `git rm` — the sandbox mount blocks `unlink`, flagged "This is a limitation".*
