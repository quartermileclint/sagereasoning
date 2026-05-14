# Session Close — 2026-05-15 — ATL Wrapper Session 1: `/trust-layer/` Survey + the Substrate↔ATL Bridge

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Tier:** `code-standard` — **Standard** risk under 0d-ii. Lean template.
**Date:** 2026-05-15.
**Operative session prompt:** the ATL Wrapper Session 1 next-session prompt (committed as `e5292f2 atl next session prompt`).

---

## What this session did

Spec sequencing steps 1–2 of the ATL Wrapper build arc, in one session (founder elected the full scope at Step 0).

**Step 1 — surveyed the full `/trust-layer/` codebase** (all 14 files, ~4,200 lines) plus the substrate-side `Layer2Assessment`, `SignedLayer2Assessment`, and `Layer3ResponseMeta` surfaces. Key findings: the `EvaluatedAction` target type has 12 fields; 4 map cleanly from `Layer2Assessment`, 3 need a null/array derivation, and **4 are not on `Layer2Assessment` at all** (`receipt_id`, `evaluated_at`, `skill_id`, and `agent_id` — which the spec's Component 1 mapping table omits entirely). `Layer2Assessment` is idempotent by design, so those four must come from a caller-supplied context. And the **module-boundary finding** (load-bearing): `/trust-layer/` sits outside `website/`'s tsconfig root — a bridge in `website/src/` cannot import `EvaluatedAction` from `/trust-layer/`.

**Step 2 — design-decision gate** (consolidated change set; founder confirmed all three recommendations): (1) the tsconfig boundary is crossed by **mirroring** `EvaluatedAction` + its two dependency enums into `website/src`; (2) `receipt_id` is **derived from the Ed25519 signature** (SHA-256); (3) `oikeiosis_met` / `oikeiosis_stage` are taken from the **first relevant circle**.

**Step 3–4 — built and verified the bridge.** `atl-bridge.ts` — `mapLayer2AssessmentToEvaluatedAction(assessment, context)`, a pure synchronous deterministic projection — plus `deriveReceiptId` and the `BridgeContext` input type. PR1 single-endpoint proof of the substrate↔ATL bridge pattern; PR2 verified in-session (the test invokes the mapping function 31× across the assertions).

Two new files; **nothing existing was modified**; nothing is wired to a route; no production surface was touched.

## Decisions Made

- **`D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15`** appended (lean form, +~55 lines). The `Layer2Assessment → EvaluatedAction` mapping function — the bridge — built, Wired, and Verified as a new module; the Step 2 tsconfig-boundary decision (mirror the target type), the `receipt_id`-from-signature convention, and the first-circle oikeiosis selection all recorded with reasoning.

## Status Changes

| Item | Old | New |
|---|---|---|
| `atl-bridge.ts` (the bridge) | (did not exist) | **Verified** (Scaffolded → Wired → Verified in this session) |
| Substrate↔ATL bridge pattern | Designed (in the ATL Wrapper spec) | **Verified** — proven on one mapping (PR1 single-endpoint proof) |
| ATL Wrapper spec — Component 1 (the bridge / mapping function) | Designed | **Verified** for the mapping function (the carriage + accumulation parts of Component 1 remain Designed — spec step 5) |
| `/trust-layer/` codebase | unsurveyed since the 3 Apr 2026 build | **Surveyed in full** (14 files) — no status change to the code itself; it remains pre-substrate offline framework code |
| Production state | A7 Verified; flags UNSET; steady-state | **Unchanged** — no code wired to a route; no env-var, schema, auth, or R20a-perimeter change |

## Next Session Should

The founder elects ATL Wrapper **spec sequencing step 3 — the Layer 3 agent-mode rendering (Component 2)**. This is `code-standard` tier (per the original agent-mode spec's classification), and it is **where the substrate score architecture gets built** — the score vector, scalar score, kathekon-gate, gaming defences, and the `justification_source` line, all preserved in the superseded agent-mode spec and absorbed into the ATL Wrapper spec's Component 2. **Sequencing flag for the founder:** building the score architecture at step 3 resolves *two* carried-forward deferrals at once — the philosophical-mode score-sections deferral (`D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14`, PR7) **and** standard mode's score sections (which the standard-mode spec flags as depending on the same architecture). When step 3 is scoped, flag both deferrals for resolution in the same work. The next-session prompt would be drafted per the lean next-session-prompt template once the founder elects.

**`/trust-layer/` survey findings that reshape the ATL arc's remaining steps** (carry-forward):

- **The bridge signature is `(Layer2Assessment, BridgeContext) → EvaluatedAction`, not the spec's literal `(Layer2Assessment) → EvaluatedAction`.** The wrapper build (step 5) must produce a `BridgeContext` (`agent_id`, `evaluated_at`, `skill_id`, `signature`) per substrate call. `agent_id` in particular is a wrapper concern the spec's Component 1 mapping table did not name.
- **The tsconfig boundary is now a decided, standing constraint.** Every subsequent ATL session that crosses the `/trust-layer/` ↔ `website` boundary inherits the "mirror the type" decision — or consolidates the boundary properly (a shared types location / bringing `/trust-layer/` under tsconfig). The wrapper build (step 5) is the natural place to weigh consolidation, since it crosses the boundary far more than the bridge does.
- **`window-aggregator.ts` (Component 4) consumes `EvaluatedAction[]` in chronological order, oldest first, with `agent_id` and `totalLifetimeActions` passed separately** to `computeWindowSnapshot`. The wrapper's carried-profile accumulation must preserve order.
- **The 5-table schema (`trust-layer-schema-REVIEW.sql`) is still DRAFT, pending founder approval** — relevant to the badge build (step 6); the spec's reconciliation table flags `evaluated_actions` as "revisit — does the wrapper-carried profile need server-side persistence at all?".
- **The progression toolkit (9 tools, 7 pathways) has complete LLM prompt builders but no LLM wiring** — relevant to the spec's open question 1 (is the progression toolkit part of the wrapper, or a separate ATL surface?).

**Pre-conditions for the next session:** this session committed (`git log` shows the ATL bridge commit; `git status` clean); `SUBSTRATE_LAYER3_ENABLED` still UNSET in Vercel.

## Blocked On

**Files remaining uncommitted (to be committed by the founder):**

```
?? website/src/lib/substrate/atl-bridge.ts                          (new — the bridge)
?? website/src/lib/substrate/__tests__/atl-bridge.test.ts           (new — 31 tests)
 M website/tsconfig.tsbuildinfo                                     (incremental-build cache)
 M operations/decision-log.md                                      (entry appended)
?? operations/handoffs/founder/2026-05-15-atl-bridge-close.md       (this file)
```

**Production state at session close:** unchanged from session start. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/public-key` serves Ed25519 steady-state. No env-var changes, no schema migrations, no auth-surface changes, no R20a-perimeter changes. The two new files are library code, imported by no route.

## Open Questions

- **The `EvaluatedAction` type mirror is a manual-sync point.** `atl-bridge.ts` re-declares `EvaluatedAction` + `KatorthomaProximityLevel` + `RootPassionId` verbatim from `/trust-layer/types/`. Revisit condition: a later ATL session consolidates the `/trust-layer/` ↔ `website` boundary, OR `/trust-layer/`'s `EvaluatedAction` changes — in which case the mirror must be updated in the same change.
- **`.git/index.lock` — I caused this.** Running `git status` inside the build sandbox created `.git/index.lock`; the sandbox mount blocks `unlink` on it. A 0-byte stale lock, no live git process. Remove it (`rm -f .git/index.lock`) before `git add` / `git commit`. Revisit condition: none — one-time cleanup. (No `_capture-tmp.ts` this session — `git status` shows only the two intended new files plus `tsconfig.tsbuildinfo`.)
- **PR10 PEV Verify diagnostic — Diagnostic-certain.** The philosophical-mode regression fails on *import* in the build sandbox: `supabase-server.ts` constructs a Supabase client at module load and throws when `NEXT_PUBLIC_SUPABASE_URL` is absent from the process environment. Root cause identified — missing process-env Supabase vars, not a regression (this session adds new files only and modifies nothing). Confirmed 37/0 in-session by supplying dummy import-resolution env vars (the test uses a stub retrieve fn, so the real client is never called). On the founder's machine with `.env.local` resolvable, the regression runs 37/0. The new `atl-bridge.test.ts` imports neither Supabase nor retrieve-passages, so it runs clean unconditionally.

## Founder Verification (between sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 0. Clear the stale sandbox-created .git/index.lock.
#    (I caused this — running git status in the build sandbox; the mount blocks
#    unlink. One-time cleanup, same as the predecessor session.)
rm -f .git/index.lock

# 1. Verify the build (expected: tsc clean; 31/0; 37/0; 28/0; 33/33).
#    The philosophical-mode regression needs your .env.local Supabase vars
#    resolvable in the shell so supabase-server.ts constructs on import — the
#    atl-bridge test imports neither Supabase nor retrieve-passages, so it runs
#    clean regardless.
cd website
npx tsc --noEmit -p tsconfig.json
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts
npx tsx src/lib/substrate/__tests__/philosophical-mode-service.test.ts
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts
cd ..

# 2. Commit — TARGETED add (explicit paths, not `git add -A`).
git add website/src/lib/substrate/atl-bridge.ts
git add website/src/lib/substrate/__tests__/atl-bridge.test.ts
git add website/tsconfig.tsbuildinfo
git add operations/decision-log.md
git add operations/handoffs/founder/2026-05-15-atl-bridge-close.md
git commit -m "ATL Wrapper Session 1: /trust-layer/ survey + the substrate↔ATL bridge

Surveys the full /trust-layer/ codebase (14 files) and builds the
Layer2Assessment → EvaluatedAction mapping function — 'the bridge' — as a
new module. PR1 single-endpoint proof of the substrate↔ATL bridge pattern.

New files (no existing file modified; nothing wired to a route):
- website/src/lib/substrate/atl-bridge.ts — mapLayer2AssessmentToEvaluated-
  Action (pure deterministic projection), deriveReceiptId (SHA-256 of the
  Ed25519 signature), the BridgeContext input type, and the mirrored
  EvaluatedAction / KatorthomaProximityLevel / RootPassionId target types.
- website/src/lib/substrate/__tests__/atl-bridge.test.ts — 31 assertions;
  invokes mapLayer2AssessmentToEvaluatedAction (PR2).

Step 2 design-decision gate (founder-confirmed): tsconfig boundary crossed
by mirroring the target type into website/src; receipt_id derived from the
Ed25519 signature; oikeiosis_met/stage from the first relevant circle.

Decision log: D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15.
Tier code-standard, Standard risk; AC7 / PR6 / Critical Change Protocol
not engaged. tsc clean; 31/0 + philosophical 37/0 + A5 28/0 + A7 33/33."
```

Then push via GitHub Desktop. **No Vercel behaviour change** — the two new files are library code imported by no route; `SUBSTRATE_LAYER3_ENABLED` stays UNSET; `/api/reason` and `/api/substrate/layer3` are byte-identical.

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-14-philosophical-mode-build-close.md`
- Decision-log entry: `D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15`
- Predecessor decision-log entry: `D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14`
- Deliverable-of-the-day (spec): `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md`
- Survey target: `/trust-layer/` (all 14 files; `BUILD-LOG.md` is the overview)
- New files: `/website/src/lib/substrate/atl-bridge.ts`, `/website/src/lib/substrate/__tests__/atl-bridge.test.ts`
- Consumed: `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (`Layer2Assessment` shape)
- Bridged to: `/trust-layer/types/evaluation.ts` (`EvaluatedAction` — the mapping target), `/trust-layer/evaluation-window/window-aggregator.ts` (the `EvaluatedAction[]` consumer)

*End of session close. The substrate↔ATL bridge is built and Verified (31/31 tests; tsc clean; philosophical 37/0 + A5 28/0 + A7 33/33 regressions green) — the substrate↔ATL connection is proven on one mapping (PR1), and the existing `/trust-layer/` window-aggregator / grade-engine / badge infrastructure now has a substrate-fed input path. Next: spec sequencing step 3 — the Layer 3 agent-mode rendering (Component 2), where the deferred score architecture gets built. Production state unchanged; `/api/reason` byte-identical; no route imports the new module. One one-time cleanup (`.git/index.lock`) must be cleared from the founder's machine before committing — flagged "I caused this".*
