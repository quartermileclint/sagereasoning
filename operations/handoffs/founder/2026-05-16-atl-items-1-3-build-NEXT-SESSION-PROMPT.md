# Next-Session Prompt — ATL Wrapper Items 1–3 Build (post-6b arc, step 3 of 8)

**Stream:** founder.
**Tier:** `code-elevated` — **Elevated** risk under 0d-ii. **Lean + Elevated additions** template. The Critical Change Protocol does NOT apply (no auth / session / encryption / data-deletion / deployment-config / R20a-perimeter surface). AC5 not engaged. AC7 not engaged. PR6 not engaged. PR1: this is the single build session that lands all four design decisions (A, B, C, D) per the design pass; verify before any further extension.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-elevated` row → Lean + Elevated additions) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-atl-items-1-3-design-pass-close.md` (the items 1–3 design pass).
**Predecessor decision-log entries:** `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16`; `D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16`; `D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15`.
**Build spec:** `/adopted/atl-items-1-3-design.md` — Adopted 2026-05-16 (decision) / Designed (implementation). This document is the authoritative spec for the build; the session executes against it.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — this is step 3 of 8 in the post-6b arc (6b → items 1–3 design pass → **items 1–3 build** → trajectory-enriched hand-back report → kathekon-aligned alternative design pass → kathekon-aligned alternative build → write-path → A10).

---

## Why this session matters

The 2026-05-16 design pass locked four enhancements to the ATL Wrapper. They are R0-aligned (the carried profile begins to record deliberation quality, not just outcome quality), R18a-honest (the badge gains one short observable-reasoning-pattern field), PR15-respectful (the ATL is the per-node evaluator; tree search stays agent-side or framework-side), and additive throughout (no breaking change). This session builds them.

After this build session, the carried profile carries `deliberation_breadth`, the wrapper carries live candidates with a documented shape and a known cap, agent developers have a documented contract for tree-search composition, and top-K retention is a named pattern with a small helper. That makes the trajectory-enriched developer hand-back report buildable (step 4 of the post-6b arc) — the report is much richer once it has these signals.

The session is bounded but substantial. Plan ~3.5–4.5 hr. Expect mid-session founder input at the Step 2 design-decision gate (a few small implementation choices the design didn't lock) and at the Verify step.

---

## What's been decided — DO NOT re-litigate

Read these from `/adopted/atl-items-1-3-design.md` at session open; they are the frame for the build, not items to revisit:

- **Decision A — `deliberation_breadth`.** Field on `EvaluatedAction`, supplied via a new fifth `BridgeContext` field `candidates_considered: number` (wrapper-supplied; no agent-declared fallback). Layer2Assessment stays idempotent. A `DeliberationBreadth` enum (`intuited` / `deliberated` / `multi_branch_deliberated`) is derived at aggregation time using N=1 / N=2 / N≥3 thresholds. `WindowSnapshot` gains `deliberation_breadth_distribution` + `typical_deliberation_breadth`. `AccreditationRecord` + `AccreditationPayload` gain `typical_deliberation_breadth`.
- **Decision B — `carried_candidates`.** NEW persistent slot on `CarriedProfile`, top-K capped (K from D). Shape: `{ layer1_input, layer2_assessment, rank, considered_at }[]`. Becomes a fifth wrapper-populated optional `Layer1Schema` field — versioned change to the open Layer 1 contract; Rule A (licensing gate) noted (handled inside this session — no separate gate session).
- **Decision C — tree-search composition.** Doc + small helper. New file `atl-tree-search-adapter.ts` exposes `createSubstrateEvaluator(callSubstrate, bridgeContextProvider)`. New section in `agent-trust-layer-wrapper-spec.md` with MCTS / BFS / ToT pseudocode + multi-agent-orchestration distinction.
- **Decision D — top-K retention.** Helper + doc. `pruneToTopK(candidates, k, comparator?)` + `defaultCarriedCandidateComparator(objectiveFunctionDeclaration)`. Default K = 5, agent-overridable. Applies to `carried_candidates`.

The design document specifies field shapes, function signatures, enum thresholds, and file locations. The build session has discretion within those constraints on test structure and a few small implementation choices the design left open (e.g., `pruneToTopK` file location — `atl-iteration-patterns.ts` or a sibling).

---

## Pre-conditions

1. **The design pass commit is pushed; Vercel green.** Founder confirmed Vercel green after the design-pass push. `git log --oneline -3 origin/main` shows the design-pass commit.
2. **The founder has reviewed `/adopted/atl-items-1-3-design.md`** and confirms the four locked summaries match the session-open elections of the design pass. If anything reads wrong, append a `D-ATL-ITEMS-1-3-DESIGN-REVISED-YYYY-MM-DD` superseding entry before opening this session.
3. **Production state unchanged from the design pass close:** substrate at A7 Verified; flags UNSET; `/api/reason` byte-identical; `/api/accreditation/[agent_id]` Live; `agent_accreditation` + `grade_history` tables exist and are empty in production.
4. **No env-var changes; no auth-surface changes; no R20a-perimeter changes** anticipated this session.
5. **Founder commits to a ~3.5–4.5 hr bounded build session.** Mid-session founder input at Step 2 (small implementation choices the design left open) and at the Verify step.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`code-elevated`), risk class (Elevated), Lean + Elevated additions template, AC1 model selection row (N/A this session — no LLM calls).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the "no current users" governing note applies (Critical Change Protocol step 3 would be N/A if engaged; it is NOT engaged this session).
3. `/operations/handoffs/founder/2026-05-16-atl-items-1-3-design-pass-close.md` (~5 min) — the design pass close.
4. **`/adopted/atl-items-1-3-design.md` — read in FULL.** This is the spec; the build executes against it.
5. `/operations/decision-log.md` — last 2 entries (the design pass + 6b).
6. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — targeted: §"Component 1" + §"Component 5" + §"Layer 1 implications" + §"Open questions deferred to build."
7. The code files that will be touched — read targeted sections only:
   - `/website/src/lib/substrate/atl-bridge.ts` — `BridgeContext` shape; the idempotence-rationale module header (do not break it).
   - `/website/src/lib/substrate/atl-wrapper.ts` — `CarriedProfile` shape; `accumulate` / `computeTrajectory` / `toCarriedProfilePayload` / `toProfileProvenancePayload` signatures.
   - `/website/src/lib/substrate/atl-iteration-patterns.ts` — `runSequentialStep` / `accumulateChosen` / `evaluateInParallel` / `runOrchestrationStep` signatures; `MAX_ORCHESTRATION_DEPTH`; `PEER_AGENT_ASSESSMENT_SCHEMA`.
   - `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — `EvaluatedAction` + `WindowSnapshot` shapes (both extend in this session).
   - `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — `AccreditationRecord` + `AccreditationPayload` shapes (both extend).
   - `/website/src/lib/substrate/atl-accreditation-store.ts` — `rowToAccreditationRecord` (read path; new column flows through).
   - `/website/src/lib/translation-sandwich/layer1-extractor.ts` — `Layer1Schema` shape (gains `carried_candidates` field); the four existing wrapper-populated optional fields the new one joins.
   - `/website/src/lib/substrate/trust-layer/evaluation-window/window-aggregator.ts` — `computeWindowSnapshot`; extend to compute `deliberation_breadth_distribution` + `typical_deliberation_breadth`.
   - `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — `buildAccreditationPayload`; extend to project the new field.
   - `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` — confirm no breakage from the new EvaluatedAction field (the grade engine should not read `candidates_considered`).
8. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16. Read any that look relevant to the build. F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` — confirm none target this session.
9. **PR15 consult** — `.claude/skills/anthropic/` review focused on Decision C: confirm the multi-agent-orchestration finding from `atl-iteration-patterns.ts` still holds; check `mcp-builder` for any R18c interoperability implication on the new helper file; check for new Anthropic primitive that might substitute for `atl-tree-search-adapter.ts` (unlikely — it is a thin contract surface, not a primitive).

**Confirm at open:** tier (`code-elevated`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live` for implementation; `Adopted / Under review / Superseded` for decisions); signals + risk classification per 0d-ii; AC5/AC7/PR6/Critical Change Protocol NOT engaged.

---

## Part B — Procedure

### Step 0 — Scope confirm + risk gate (~5 min)

State scope: build all four design decisions (A, B, C, D) in this single session per PR1 single-build proof. Confirm NOT in scope: changing any of the four locked design summaries; touching the kathekon-aligned alternative; touching the write-path into `agent_accreditation`; touching A10. The Layer 1 schema version bump (Decision B) is IN scope — coordinated with Rule A (licensing gate) inside this session. Founder confirms.

### Step 1 — Decision A surface survey + design-decision gate (~20–30 min)

Output ~15 lines covering: the BridgeContext extension; the EvaluatedAction extension; the DeliberationBreadth enum location (in `trust-layer/types/evaluation.ts` per the design); the aggregation-time derivation function location (in `window-aggregator.ts` per the design); the WindowSnapshot extension; the AccreditationRecord + AccreditationPayload extension; the `buildAccreditationPayload` extension; the Supabase column addition (additive, idempotent); the wrapper supplier sites (`runSequentialStep` supplies 1; `accumulateChosen` supplies `candidates.length`; `runOrchestrationStep` supplies 1). Surface the few small implementation choices the design didn't lock (e.g., whether the aggregation-time derivation is a pure helper or inlined; whether the enum thresholds are constants or magic numbers). Founder elects.

### Step 2 — Decision A build (~30–40 min)

Execute:
- Extend `BridgeContext` in `atl-bridge.ts`. Update `mapLayer2AssessmentToEvaluatedAction` to write `candidates_considered`. Update the bridge test for the new field.
- Extend `EvaluatedAction` in `trust-layer/types/evaluation.ts` (+ add `DeliberationBreadth` enum).
- Extend `WindowSnapshot` in `trust-layer/types/evaluation.ts` with `deliberation_breadth_distribution` + `typical_deliberation_breadth`.
- Update `computeWindowSnapshot` in `window-aggregator.ts` to compute the distribution and the typical-* field (mirror `proximity_distribution` / `typical_proximity` patterns).
- Extend `AccreditationRecord` + `AccreditationPayload` in `trust-layer/types/accreditation.ts`. Update `buildAccreditationPayload` to project the new field.
- Update `accumulate` / `runSequentialStep` / `accumulateChosen` / `runOrchestrationStep` to thread `candidates_considered` from the wrapper's perspective.
- Update `atl-accreditation-store.ts` `rowToAccreditationRecord` for the new column (read path).

### Step 3 — Decision B build (~40–50 min)

Execute:
- Add `CarriedCandidate` type (in `atl-wrapper.ts` or `atl-iteration-patterns.ts` per the design — build-session choice).
- Extend `CarriedProfile` with `carried_candidates: readonly CarriedCandidate[]` slot. Update `createCarriedProfile` to initialise to `[]`.
- Update `evaluateInParallel` and `accumulateChosen` to populate `carried_candidates` with the N−1 unchosen candidates and call `pruneToTopK` (Decision D helper from Step 5).
- Extend `Layer1Schema` in `layer1-extractor.ts` with a new fifth optional wrapper-populated field `carried_candidates`. Update the `validateLayer1Schema` per-entry checks. Bump the schema version constant.
- Update `toCarriedProfilePayload` to project `carried_candidates` into the Layer 1 input payload alongside the existing four optional fields.
- **Layer 1 versioning bump:** record the bump in the session close + the items 1–3 build decision-log entry (Rule A surfaces it at the Stage 1 licensing gate without requiring a separate gate session).

### Step 4 — Decision C build (~30–40 min)

Execute:
- Create `/website/src/lib/substrate/atl-tree-search-adapter.ts` with `createSubstrateEvaluator(callSubstrate, bridgeContextProvider)` per the design.
- Add new section "Tree-search composition" to `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` with the per-node contract documentation + MCTS / BFS / ToT pseudocode + the in-process-vs-multi-agent distinction (retain the PR15 finding from `atl-iteration-patterns.ts`).

### Step 5 — Decision D build (~20–30 min)

Execute:
- Add `pruneToTopK<T>(candidates: readonly T[], k: number, comparator?: (a: T, b: T) => number): T[]` + `defaultCarriedCandidateComparator(objectiveFunctionDeclaration)` (location elected at Step 1's gate — likely `atl-iteration-patterns.ts` for proximity to its `accumulateChosen` consumer).
- Wire `accumulateChosen` to call `pruneToTopK(carried_candidates, K, defaultCarriedCandidateComparator(...))` after adding the N−1 unchosen candidates. Default K = 5; agent override via `CarriedProfile.window_config` (or a new `pruning_config` field — Step 1 gate decision).

### Step 6 — Supabase migration (~10–15 min)

Write `/website/supabase-agent-accreditation-typical-deliberation-breadth-migration.sql` — additive `ALTER TABLE public.agent_accreditation ADD COLUMN IF NOT EXISTS typical_deliberation_breadth text not null default 'intuited';`. Idempotent. Founder runs it in Supabase SQL Editor (Founder Verification section). Empty-table-safe.

### Step 7 — Tests (~30–45 min)

Add or extend tests:
- `atl-bridge.test.ts` — assertions for the new `candidates_considered` field on `EvaluatedAction`.
- `atl-wrapper.test.ts` — assertions for `carried_candidates` slot initialization + propagation.
- `atl-iteration-patterns.test.ts` — assertions for `candidates_considered` wrapper-supply at each pattern; `carried_candidates` after `accumulateChosen` (N−1 unchosen retained, top-K capped); `pruneToTopK` unit tests; `defaultCarriedCandidateComparator` unit tests.
- `atl-tree-search-adapter.test.ts` (NEW) — assertions for `createSubstrateEvaluator` calling the substrate with the bridge-context-provider's output; deterministic mapping; no I/O internal to the helper.
- `atl-accreditation-store.test.ts` — assertions for the new column on the read path; `Array.isArray` guard still passes.
- `score-architecture.test.ts` / `layer3-service.test.ts` / `agent-mode-service.test.ts` — confirm no breakage from the new EvaluatedAction / WindowSnapshot / AccreditationPayload fields (existing assertions should still pass; the new fields are additive).

### Step 8 — Verify (~20–30 min)

PR10 PEV Verify step. Run:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit -p tsconfig.json
npx tsx --env-file=.env.local 'src/app/api/accreditation/[agent_id]/__tests__/route.test.ts'
npx tsx --env-file=.env.local src/lib/substrate/__tests__/atl-accreditation-store.test.ts
npx tsx src/lib/substrate/__tests__/atl-iteration-patterns.test.ts
npx tsx src/lib/substrate/__tests__/atl-wrapper.test.ts
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts
npx tsx src/lib/substrate/__tests__/atl-tree-search-adapter.test.ts
npx tsx src/lib/substrate/__tests__/score-architecture.test.ts
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts
```

Classify the Verify outcome per the PR10 diagnostic-certainty signals. The end-to-end Supabase round-trip (the new column on the live URL) is verified between sessions — see Founder Verification.

### Step 9 — Append decision-log entry (lean + Elevated additions)

`D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-YYYY-MM-DD`. Lean form per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" with Elevated additions: name the rollback path explicitly; name what could break under the new column / new field / new schema bump. Rules served expected: 0a, 0c, 0d-ii, 0f, R0 (deliberation_breadth signal serves oikeiosis), R4 (the IP boundary holds; engine internals stay closed), R18a (Character Kernel observable credential), R18c (additive schema versioning), AC8, KG1 (Vercel five rules — new helper file + extended modules; posture statement in headers), KG7 (the new `typical_deliberation_breadth` text column — no JSONB this session; KG7 confirmed N/A for the new column), PR1 (single-build proof — all four decisions land in one session; PR1 cleared once Verified), PR2 (invocation testing immediate), PR7 (deferred items named — Trajectory-enriched hand-back report, kathekon-aligned alternative design pass, Layer 1 multiple-choice, write-path, A10), PR10 (PEV — Plan was the design pass, Execute is this session, Verify is Step 8 + the founder's between-session Supabase column check), PR11 (inbox scan), PR15 (Anthropic-primitive consult — confirm multi-agent-orchestration finding; mcp-builder forward pointer carried).

### Step 10 — Session close (lean + Elevated additions)

`/operations/handoffs/founder/YYYY-MM-DD-atl-items-1-3-build-close.md` per the lean template + Elevated additions (the rollback path; what could break; the explicit Supabase migration step in Founder Verification). "Next Session Should" names the **trajectory-enriched developer hand-back report** — step 4 of the post-6b arc. The hand-back report is the natural next step: it consumes `deliberation_breadth` + `carried_candidates` + the existing `WindowSnapshot` and `AccreditationRecord` to produce the human-readable developer-view rendering specified in the Wrapper spec §"The report the agent hands back to the developer."

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + design-pass close + design document + spec sections + code files + PR11 + PR15 (Part A) | 25–35 min |
| Step 0 — scope confirm + risk gate | 5 min |
| Step 1 — Decision A surface survey + design-decision gate | 20–30 min |
| Step 2 — Decision A build | 30–40 min |
| Step 3 — Decision B build (incl. Layer 1 versioning bump) | 40–50 min |
| Step 4 — Decision C build | 30–40 min |
| Step 5 — Decision D build | 20–30 min |
| Step 6 — Supabase migration | 10–15 min |
| Step 7 — Tests | 30–45 min |
| Step 8 — Verify | 20–30 min |
| Step 9 — decision-log entry | 25–35 min |
| Step 10 — session close | 25–35 min |
| **Total** | **~4.5–5.5 hr** |

This is a longer build session than the recent ATL Wrapper steps (5, 6a, 6b were each ~2.5–3.5 hr). The reason is PR1: the design pass elected a single-build proof for all four decisions together. If the session runs long, the natural pause point is at the end of Step 3 (Decisions A + B Verified; C + D + the migration deferred to a same-day continuation). The founder elects whether to take that pause if it comes up.

---

## Rollback path

**Code rollback:** `git revert HEAD --no-edit` + push via GitHub Desktop. After Vercel rebuild (~2 min), all extended types revert to their pre-session shape. The new helper file (`atl-tree-search-adapter.ts`) is removed. The new test files are removed. `/api/reason`, `/api/substrate/layer3`, `/api/accreditation/[agent_id]`, and `/api/public-key` are byte-identical. The Wrapper spec's new "Tree-search composition" section is removed.

**Supabase migration rollback:** `ALTER TABLE public.agent_accreditation DROP COLUMN IF EXISTS typical_deliberation_breadth;` via the SQL Editor. The column is empty-on-add (tables are empty in production until the write-path lands in step 7 of the post-6b arc), so dropping it is data-loss-free.

**Layer 1 schema version rollback:** the version constant reverts with the code rollback. Because the new field is optional + nullable, third-party Layer 1 reference distributions that already have the bumped version are forward-compatible with un-bumped consumers (the field is `null` for un-bumped data).

The build session is reversible in both senses (code + schema) within ~5 min of founder action.

---

## What could break (Elevated additions)

1. **Existing tests fail** because the additive `EvaluatedAction` / `WindowSnapshot` / `AccreditationRecord` / `AccreditationPayload` fields are required somewhere a test fixture didn't supply them. Mitigation: make all new fields required by the build, supply defaults at every construction site in the existing test fixtures, run `tsc --noEmit` + full test suite at Step 8.
2. **The Supabase migration fails** because of a constraint or default mismatch. Mitigation: the migration is `ADD COLUMN IF NOT EXISTS ... NOT NULL DEFAULT 'intuited'` — idempotent, defaulted, runs against an empty table.
3. **The Layer 1 schema bump breaks an existing consumer.** Mitigation: the new field is OPTIONAL (nullable); existing Layer 1 inputs without it remain valid. Bump is additive + backward-compatible per the design.
4. **`pruneToTopK` mutates its input** by mistake (using `.sort()` in place). Mitigation: the design specifies "stable for tied scores — input order survives where the comparator returns 0"; the implementation must use `[...candidates].sort(...)` not `candidates.sort(...)`; the test asserts the input array is unmodified.
5. **`accumulateChosen` adds the chosen candidate to `carried_candidates`** by mistake. Mitigation: only N−1 unchosen candidates are carried; the chosen candidate is the one that feeds `evaluated_actions[]` via the existing path; the test asserts both invariants.

---

## Forecast

A successful build session produces:
- The four design decisions executed end-to-end.
- All ATL Wrapper components extended additively (no breaking change to anything Verified at 6b).
- The Supabase `agent_accreditation` table extended with one column, ready for the write-path session (step 7 of the post-6b arc).
- The Layer 1 schema bumped by one version (additive); Rule A (licensing gate) sees the bump for the Stage 1 open-source release.
- The Wrapper spec gains a "Tree-search composition" section.
- All existing tests pass; new tests cover every new field and every new helper.
- Vercel green; `/api/reason` byte-identical; `/api/accreditation/[agent_id]` byte-identical until the write-path session populates the new column.

After this session, the trajectory-enriched developer hand-back report is buildable — that is the "Next Session Should." After the hand-back report, the kathekon-aligned alternative design pass kicks off (steps 5–6 of the post-6b arc).

*End of prompt.*
