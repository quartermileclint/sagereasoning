# Next-Session Prompt — ATL Wrapper Session 7: Component 3 — The Badge / Accreditation (spec step 6)

**Stream:** founder.
**Tier:** spans **`schema`** (the Supabase DDL — Standard) **+ `code-elevated`** (the server-side persistence layer + the ported badge library) **— and, if the public route is taken this session, `code-critical`** (a new public verification endpoint is a route + deployment surface). **The build session classifies the risk at Step 0** once the scope is elected. PR6 not engaged — the badge does not touch the R20a distress classifier, Zone 2 / Zone 3 logic, or their wrappers. PR1 engaged — the persistence layer must reach Verified as library code before any public route exposes it. **KG1** (Vercel five rules) and **KG7** (JSONB storage format) engage — the badge is the **first server-side persistence in the ATL arc**.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). **Deliverable-of-the-day:** `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — read **in full**, especially §"Component 3 — The Badge / Accreditation", §"The existing ATL build — what is already there", §"Reconciliation table" (the `AccreditationRecord` / `public-endpoint.ts` / `accreditation-card.ts` / 5-table-schema rows), §"R-rule engagement" (the **R18 a–e** rows + **R4**), and §"Open questions deferred to build" (**2** — schema disposition; **7** — onboarding; **8** — agent identity) — plus the DRAFT schema `/trust-layer/schema/trust-layer-schema-REVIEW.sql` and the two un-ported `/trust-layer/` badge files `/trust-layer/accreditation/public-endpoint.ts` + `/trust-layer/card/accreditation-card.ts`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-15-atl-iteration-patterns-close.md`.
**Predecessor decision-log entry:** `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15` (confirm at session open).

---

## Why this session matters

The ATL Wrapper spec names five components. **Four are built and Verified** — Component 1 (carried-profile mechanism) + Component 4 (trajectory awareness) in Session 5; Component 2 (the Layer 3 agent-mode rendering) in Session 3; Component 5 (the three iteration patterns) in Session 6. **Component 3 — the badge — is the last one.** It is the public face of the wrapper: the verifiable credential other humans or agents query to confirm a wrapped agent's reasoning-pattern profile. After the badge lands, every ATL Wrapper component is real, and the **trajectory-enriched developer hand-back report** becomes buildable.

The badge is also the **first server-side persistence in the ATL arc**. Components 1–5 are all wrapper-side carriage — pure, deterministic, no database. The badge changes that: a public endpoint must query *something*, so the `AccreditationRecord` has to live in Supabase. This is why the badge is higher-risk than its predecessors, and why the scope choice at Step 0 matters.

## The build state going in — a lot is already built

- **The ported `/trust-layer/` closure** (`website/src/lib/substrate/trust-layer/`, 5 files, in-tsconfig, Verified): `types/accreditation.ts` (`AccreditationRecord`, `AccreditationPayload`, `GradeChangeEvent`, `OnboardingResult`), `types/evaluation.ts`, `accreditation/accreditation-record.ts` (`createAccreditationRecord`, **`buildAccreditationPayload`** — already used by Component 5, `buildGradeChangeEvent`, `proximityToAuthority`, `isValidAgentId`, `isExpired`), `evaluation-window/window-aggregator.ts`, `grade-engine/grade-transition-engine.ts`.
- **`atl-wrapper.ts`** — Verified. The `CarriedProfile` holds the `AccreditationRecord`; `computeTrajectory` advances it. This is the record the badge persists + serves.
- **`atl-iteration-patterns.ts`** — Verified (Session 6). `runSequentialStep` / `runOrchestrationStep` produce the advanced `CarriedProfile` whose `accreditation_record` the badge will persist.
- **The two un-ported `/trust-layer/` badge files** (NOT yet ported — this session ports them): `/trust-layer/accreditation/public-endpoint.ts` (`handleAccreditationLookup` + `handleBatchLookup` + `ACCREDITATION_RESPONSE_HEADERS` — already written to take an injected `lookupFn`, so the DB query is a clean seam) and `/trust-layer/card/accreditation-card.ts` (`buildAccreditationCard` + `serializeCard` + the English display mappings — R8c).
- **The DRAFT 5-table schema** `/trust-layer/schema/trust-layer-schema-REVIEW.sql` — `STATUS: DRAFT FOR REVIEW — DO NOT RUN UNTIL APPROVED`. 326 lines, 5 tables (`agent_accreditation`, `evaluated_actions`, `grade_history`, `onboarding_results`, `progression_sessions`). **Founder approval of the relevant subset is a Step 2 gate item.**
- **An existing `/api/badge/[id]/route.ts`** — a badge route ALREADY EXISTS in the website. Whether the public verification endpoint extends that route or adds a new `/api/accreditation/[agent_id]` is a Step 2 design decision (see below).
- **`website/src/lib/trust-layer-bridge.ts`** — the pre-existing 48-line "Scaffolded" file that `await import()`s the un-ported `/trust-layer/` and references `handleAccreditationLookup` / `buildAccreditationCard`. Now that the badge ports those, **reconcile or retire it** this session (carried-forward open question).

## The genuine design problems — Step 2 gate

1. **Schema approval + scope (spec open question 2).** The DRAFT 5-table schema needs founder approval. The badge needs **`agent_accreditation`** (the public endpoint must query it) and **`grade_history`** (the audit trail of grade changes — fed by `buildGradeChangeEvent`). It likely does **not** need `evaluated_actions` — Component 5 kept the carried profile wrapper-side (`D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15`), so the raw action list has no server-side home and need not get one for the badge. `onboarding_results` (open question 7) and `progression_sessions` (open question 1) are out of scope. **Recommendation: approve + run only `agent_accreditation` + `grade_history` this session; defer the other three.** The DDL is run by the founder via the Supabase SQL Editor (the `schema` category — idempotent, `CREATE TABLE IF NOT EXISTS`). KG7 engages — `passions_persisting JSONB`.
2. **Route reconciliation.** `/api/badge/[id]/route.ts` already exists. Does the public verification endpoint extend that route, or add a new `/api/accreditation/[agent_id]/route.ts`? The build session reads the existing route at Step 1 and recommends. (Likely: a new `/api/accreditation/[agent_id]` route — the spec's named surface — keeping the existing `/api/badge/[id]` untouched unless it is already serving this exact concern.)
3. **Porting + the persistence seam.** Port `public-endpoint.ts` + `accreditation-card.ts` into `website/src/lib/substrate/trust-layer/` as KEEP-IN-SYNC mirrors (the established pattern). Check the dependency closure — `authority-mapper.ts` is likely NOT needed (`proximityToAuthority` is already in the ported `accreditation-record.ts`); confirm at Step 1. Then build the **persistence layer** — `AccreditationRecord` ⇄ Supabase `agent_accreditation` read/upsert + `grade_history` append — as library code, with `handleAccreditationLookup`'s injected `lookupFn` as the clean seam.
4. **Scope choice — full badge vs split (the Step 0 gate; recommendation below).**

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class (note the `schema` + `code-elevated` + `code-critical` rows), signals, lean + **full** templates (Critical work uses the full template), KG1 + KG7, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the "no current users" governing note (the Critical Change Protocol's step 3 is moot for the build arc); the K-category.
3. `/operations/handoffs/founder/2026-05-15-atl-iteration-patterns-close.md` (~4 min) — predecessor close; the carried-forward findings (the trajectory-enriched hand-back report, the `trust-layer-bridge.ts` reconciliation, the spec-hygiene finding, the DRAFT schema, open questions 1/2/7/8) and the corrected verification-tooling form.
4. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — **in full** (~12 min). Especially §"Component 3", §"The existing ATL build", §"Reconciliation table", §"R-rule engagement" (R18 a–e + R4), §"Open questions deferred to build" (2, 7, 8).
5. `/trust-layer/schema/trust-layer-schema-REVIEW.sql` — **in full** (~6 min) — the DRAFT 5-table schema; focus on `agent_accreditation` + `grade_history`.
6. `/trust-layer/accreditation/public-endpoint.ts` + `/trust-layer/card/accreditation-card.ts` (~6 min) — the two files this session ports.
7. `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` (~4 min) — the already-ported builder closure the badge consumes (`buildAccreditationPayload`, `buildGradeChangeEvent`, `isValidAgentId`, `isExpired`).
8. `/website/src/lib/substrate/atl-wrapper.ts` + `/website/src/lib/substrate/atl-iteration-patterns.ts` (~6 min, targeted) — where the `AccreditationRecord` the badge persists comes from.
9. `/website/src/lib/trust-layer-bridge.ts` (~2 min) — the 48-line file to reconcile or retire.
10. `/website/src/app/api/badge/[id]/route.ts` + one reference route doing Supabase reads (e.g. `/website/src/app/api/public-key/route.ts` or `/website/src/app/api/receipts/route.ts`) + `/website/src/lib/supabase-server.ts` (~6 min) — the route shape + the Supabase access pattern.
11. one existing migration file (e.g. `/website/supabase-v3-agent-assessment-migration.sql`) (~2 min) — the house DDL style.
12. `/manifest.md` §R18 (a–e), §R4, §AC7, §KG1, §KG7 (targeted).
13. `/operations/decision-log.md` — last 3 entries (`D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15`, `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`, `D-PHILOSOPHICAL-MODE-SCORE-WIRED-VERIFIED-2026-05-15`).
14. **PR15 consult — before electing any bespoke build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching the scope (`mcp-builder` is worth a glance for R18c interoperability — could the verification surface later be an MCP server? — but the badge this session is a Next.js route + Supabase, for which no Anthropic primitive substitutes); `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session. **PR11 inbox scan:** `/inbox/` for files dated since the predecessor session — summarise inline or state none.

**Confirm at session open:** tier (per the elected scope — see Step 0); hold-point status (P0 0h active); model selection — confirm N/A (the badge persists + serves deterministic records; it makes no LLM call); status vocabulary; signals + risk classification; KG1 + KG7 engagement; PR11 inbox-scan result.

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)

**Recommend: split the badge into 6a + 6b — and this session is 6a.**

- **6a (recommended for this session) — schema + persistence + ported badge library, NO route.** Approve + produce the `agent_accreditation` + `grade_history` DDL (founder runs it via the Supabase SQL Editor); port `public-endpoint.ts` + `accreditation-card.ts` into `website/src/lib/substrate/trust-layer/`; build the persistence layer (`AccreditationRecord` ⇄ `agent_accreditation` read/upsert + `grade_history` append) as library code; reconcile or retire `trust-layer-bridge.ts`; write the test suite. **Stays `schema` + `code-elevated`** — no public route, no deployment-config surface, AC7 not engaged. This follows **PR1** (prove the persistence library to Verified before any route exposes it) and keeps the session bounded (~3–3.5 hr).
- **6b (its own follow-on session) — the public verification endpoint.** Wire `/api/accreditation/[agent_id]` (route reconciliation per Step 2), the Critical-classified route + deployment, R18b badge-documentation link. Gets its own next-session prompt + the **full Critical Change Protocol**.
- **Alternative — full badge in one session.** Everything above in one ~4.5–5 hr session. Workable given the build-arc "no current users" note (the Critical Change Protocol's step 3 is moot), but it puts a Critical route surface in the same session as the schema + persistence build, against PR1's single-endpoint-proof discipline.

Founder elects. The rest of Part B is written for **6a (the recommended scope)**; if the founder elects the full badge, the build session folds the Critical route work in under the full Critical Change Protocol and re-classifies.

### Step 1 — Survey the badge surface (~25–35 min)

Read the ported-target files + the DRAFT schema + the existing `/api/badge/[id]` route + the Supabase access pattern. Output (~12–15 lines in-chat): the dependency closure of `public-endpoint.ts` + `accreditation-card.ts` (does `authority-mapper.ts` need porting, or is `proximityToAuthority` already covered?); the `agent_accreditation` ⇄ `AccreditationRecord` field mapping (incl. the JSONB `passions_persisting` — KG7); the `grade_history` shape vs `buildGradeChangeEvent`'s `GradeChangeEvent`; the route-reconciliation finding (extend `/api/badge/[id]` or add `/api/accreditation/[agent_id]`); the `trust-layer-bridge.ts` disposition (reconcile or retire); the persistence-layer module location + shape.

### Step 2 — Design-decision gate (consolidated; founder approval; ~20 min)

Surface as one consolidated change set: (1) the **schema subset + the DDL** for founder approval (`agent_accreditation` + `grade_history` only — recommend; the founder approves the exact DDL text before running it); (2) the **porting plan** (which `/trust-layer/` files, KEEP-IN-SYNC banners); (3) the **persistence-layer module location + shape** (e.g. `website/src/lib/substrate/atl-accreditation-store.ts` — read/upsert `agent_accreditation`, append `grade_history`, with `handleAccreditationLookup`'s `lookupFn` seam); (4) the **`trust-layer-bridge.ts` disposition**; (5) the **route reconciliation recommendation** (carried into 6b, not built this session, but recorded now). Recommend each with reasoning; the founder elects.

### Step 3 — Build (PR1; PR2; ~70–90 min)

Per the Step 2 decisions: port the two badge files; build the persistence layer as library code (KG1 — Vercel five rules apply to the Supabase reads/writes; KG7 — the `passions_persisting` JSONB round-trip); reconcile/retire `trust-layer-bridge.ts`. **No route wired this session** (6a). PR1: the persistence layer is the single-endpoint proof of the badge-storage pattern — keep it isolated and Verified before 6b's route consumes it. PR2: the test invokes the new module in-session.

### Step 4 — Verify

Write the badge persistence-layer test suite. Run `tsc --noEmit` and the prior-arc regressions. **Use the corrected verification form per `/CLAUDE.md` §"Running the substrate test suite"** — plain `npx tsx` for the Supabase-free tests; `npx tsx --env-file=.env.local` for the tests that transitively construct a Supabase client (the new persistence-layer test almost certainly needs `--env-file` — it imports `supabase-server.ts`); run one line at a time. PR10 PEV Verify step — classify any diagnostic finding's certainty. **Note for the build session:** the in-sandbox tooling caveat from `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15` (the founder's macOS `node_modules` esbuild binary vs the Linux sandbox) — install `tsx` on the sandbox's native `/tmp` filesystem if running in-sandbox; on the founder's machine `npx tsx` works as written.

### Step 5 — Append decision-log entry (lean form, + the schema record)

Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested: `D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-YYYY-MM-DD`. Record the Step 2 decisions — especially the **schema subset approved + the DDL run** (with the founder's approval noted), the porting, the persistence-layer build, and the `trust-layer-bridge.ts` disposition. Rules served expected: 0a, 0c, 0d-ii, 0f, R4, R18 (a–e), AC8, KG1, KG7, PR1, PR2, PR10, PR11, PR15.

### Step 6 — Session close (lean form)

`/operations/handoffs/founder/YYYY-MM-DD-atl-badge-schema-persistence-close.md` per the lean session-close template. **Use the corrected Founder Verification form.** "Next Session Should" names **ATL Wrapper Session 8 — step 6b: the public verification endpoint** (`/api/accreditation/[agent_id]`, Critical-classified, the full Critical Change Protocol, its own next-session prompt drafted at that session's open). Carry forward: the trajectory-enriched developer hand-back report (buildable once 6b lands); the spec-hygiene finding (§Component 2 still owes the superseded agent-mode spec's content inline); the deferred schema tables (`evaluated_actions` / `onboarding_results` / `progression_sessions`); the progression-toolkit relationship (spec open question 1); the onboarding 55-assessment framework (spec open question 7); agent-identity authentication (spec open question 8 → A10); R18d adversarial evaluation (Priority 3.3d — its own work item).

## Part C — Anticipated session shape (6a scope)

| Phase | Estimate |
|---|---|
| Caches + predecessor close + ATL Wrapper spec + DRAFT schema + ported-target files + decision log + PR15 consult (Part A) | 40–50 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey the badge surface | 25–35 min |
| Step 2 — design-decision gate (incl. schema approval) | 20 min |
| Step 3 — build (port + persistence layer + bridge reconciliation) | 70–90 min |
| Step 4 — verify (incl. the new test suite) | 25–35 min |
| Step 5 — decision-log entry | 15 min |
| Step 6 — session close | 15 min |
| **Total** | **~3.5–4 hr** |

If the founder elects the full badge (6a + 6b in one), add ~60–90 min for the Critical route + the full Critical Change Protocol.

## Pre-conditions

1. **The predecessor session is committed + pushed; Vercel green.** `git log --oneline -2 origin/main` shows the ATL Wrapper Session 6 (Component 5) commit; `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock`.
2. **`D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15` is in `/operations/decision-log.md`.** Confirm at session open.
3. **The prior ATL build outputs are Verified** — `atl-iteration-patterns.ts`, `atl-wrapper.ts`, `agent-mode-service.ts`, `atl-bridge.ts`, `score-architecture.ts`, the ported `/trust-layer/` closure. Run the verification suite as a session-open regression check (see §"Verification commands" below).
4. **Production state unchanged** — substrate at A7 Verified; all substrate env flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503.
5. **Founder commits to a ~3.5–4 hr bounded build session** (6a scope) and is available to (a) approve the schema DDL text at Step 2 and (b) run that DDL via the Supabase SQL Editor between sessions.

## What this session does — and does NOT do (6a scope)

**Does:** read the ATL Wrapper spec §"Component 3" + the DRAFT schema + the two ported-target files in full; run the PR15 consult; run the Step 2 design-decision gate (schema subset + DDL approval, porting plan, persistence-layer shape, `trust-layer-bridge.ts` disposition, route-reconciliation recommendation); produce the `agent_accreditation` + `grade_history` DDL for the founder to run; port `public-endpoint.ts` + `accreditation-card.ts`; build the persistence layer as **library code**; reconcile or retire `trust-layer-bridge.ts`; write a test suite (PR2); run the prior-arc regressions; append a lean decision-log entry; write a lean session close.

**Does NOT:**
- **Wire the public verification endpoint.** `/api/accreditation/[agent_id]` is **step 6b** — a Critical-classified route + deployment surface with its own next-session prompt and the full Critical Change Protocol. If the founder elects the full badge at Step 0, this folds in under that protocol.
- **Build the trajectory-enriched developer hand-back report** — it waits for 6b (it draws on the served `AccreditationCard`).
- Run the `evaluated_actions` / `onboarding_results` / `progression_sessions` tables (deferred — spec open questions 1, 2, 7).
- Touch the **onboarding 55-assessment framework** (spec open question 7), the **progression toolkit** (spec open question 1), `/api/reason`, env vars, the R20a perimeter, or any auth surface.
- Build **R18d adversarial evaluation** — Priority 3.3d, its own work item.

## Verification commands (session-open regression check + Step 4)

Run from `website/`, one line at a time (per `/CLAUDE.md` §"Running the substrate test suite"):

```
npx tsc --noEmit -p tsconfig.json                                               # clean, exit 0
npx tsx src/lib/substrate/__tests__/atl-iteration-patterns.test.ts              # 64/0
npx tsx src/lib/substrate/__tests__/atl-wrapper.test.ts                         # 55/0
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts                          # 31/0
npx tsx src/lib/substrate/__tests__/score-architecture.test.ts                  # 69/0
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts                      # 28/0
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts                           # 33/33
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts  # 33/0
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts          # 63/0
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts  # 43/0
# + the new badge persistence-layer test (likely needs --env-file — it imports supabase-server.ts)
```

## Rollback path (6a scope)

The DDL is idempotent (`CREATE TABLE IF NOT EXISTS`) and additive — it adds two new tables, modifies no existing table; rollback is `DROP TABLE public.grade_history; DROP TABLE public.agent_accreditation;` via the SQL Editor (no data loss — the tables are new and empty until 6b writes to them). The code changes add new library module(s) in `website/src/lib/substrate/` (imported by no route) + a test, and reconcile `trust-layer-bridge.ts`; rollback is `git revert <commit>` and push via GitHub Desktop. `/api/reason`, `/api/substrate/layer3`, and the rest of the ported `/trust-layer/` closure are unaffected. No production behaviour change; no user impact.

## Forecast

A successful 6a session makes the **badge's foundation real** — the `agent_accreditation` + `grade_history` tables exist, the persistence layer can read + upsert an `AccreditationRecord`, and the ported `public-endpoint.ts` + `accreditation-card.ts` are in-tsconfig and Verified — with the public route held back to 6b under the full Critical Change Protocol (PR1). After 6b, every ATL Wrapper component is real and the trajectory-enriched developer hand-back report becomes buildable. Reading the spec + the DRAFT schema in full may surface findings that reshape the schema subset or the persistence-layer shape — captured in the close. Proceed accepting the recommended options (the 6a split scope; the `agent_accreditation` + `grade_history`-only schema subset; the recommended porting + persistence-layer + bridge-reconciliation decisions). Verified and committed between sessions and Vercel green.

End of prompt.
