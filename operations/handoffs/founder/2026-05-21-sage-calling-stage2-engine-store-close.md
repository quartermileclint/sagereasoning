# Session Close — 2026-05-21 — Sage Calling: Build Stage 2 (Engine + Store half)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users"). Stage 2 was scoped `code-critical`; the founder elected at session-open to **split** it, building the engine + store first. That half touches no auth, no endpoint, no env flag, no deployment and no user-facing surface, so this sitting is **Elevated**, not Critical. The full Critical Change Protocol is **deferred to the follow-up** (the public-surface half).
**Tier:** `code-elevated` (engine + store modules). **Elevated** risk under 0d-ii. AC7 NOT engaged this sitting. PR6 NOT engaged. Critical Change Protocol NOT engaged this sitting.
**Date:** 2026-05-21.
**Operative deliverable:** `/adopted/purpose-discovery-product-design.md` (the locked design — D-2/D-4/D-7/D-12/D-14 implemented in part here).
**Operative prompt:** `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-build-NEXT-SESSION-PROMPT.md`.
**Decision-log entry:** `D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21`.

This session built **Steps 1–2** of the Stage 2 prompt: the rule-based variant-selection engine and the `discovery_sessions` store, both Verified in-session, both wired to **nothing public**. The entire Critical surface (the `POST /api/calling` endpoint, the A10 auth gate, the Hard-Gate enforcement, the R18d adversarial suite, and the `SAGE_CALLING_ENABLED` go-live flag) is **carried forward** to the follow-up session.

## What was built

1. **The rule-based engine (D-4)** — `website/src/lib/sage-calling/engine.ts`. A pure, deterministic `nextStep(history)` step function over the agent's response history. It selects one question variant per turn by a **named epistemic-state rule**, reads **epistemic state only** (completeness gaps, over/under-claiming vs stated history, skipped tests, premature closure, avoidance) and **never preference state** (tone, agreement, apparent direction), keeps each stage's **hardest diagnostic always reachable** (Q1-D, Q2-B, Q3-B, Q4-C, Q5-C, Q6-D), and drives every transition: Q1 advance / jump-to-Q5, Q3 redirect-to-Q6, Q4 agonia-terminate, Q5 → Hard Gate, Q6 work-named → Q5, Q6 genuine null → the right clarification template. **No randomness, no sentiment analysis, no LLM, no network call** (so PR4 model selection is N/A). Honest limitation documented in the header: these are lexical/structural heuristics, not semantics — exactly the baseline D-4 elected, and exactly what the follow-up R18d suite probes (the PR7 hybrid trigger).

2. **The `discovery_sessions` store (D-7)** — `website/src/lib/sage-calling/session-store.ts`. Create/read/advance a session row; **JSONB arrays written directly** (KG7 — never `JSON.stringify`'d); **all I/O awaited with errors surfaced** (KG1, lazy admin client so unit tests need no env); **R17i-minimised** insert; **R17h genuine hard-delete** by `session_id` and by `agent_id`; and the **90-day retention sweep**. A `SelectionAudit` per engine decision is recorded in `signals_detected` so "every selection traces to a named rule" (D-4 / R0).

## Decisions Made
- `D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21` appended. Engine + store built + Verified in-session; → Verified (full) stands on the in-session tsc + tests (no migration needed — the table already exists from Stage 1).
- Founder decisions at open: **split** the session after engine + store; **reuse the A10 `atl_write` credential as-is** (D-6, no separate discovery scope) — wired in the follow-up; **retention 90 days** (AI-recommended, founder-confirmable); **bump Layer 1 `version` → v3** — to be executed in the follow-up at Step 4 (handoff wiring), with one AI concern noted (open-source Layer 1 contract / Rule A licensing gate; verify no consumer compares the version literally).

## Status Changes
| Item | Old | New |
|---|---|---|
| Sage Calling — Stage 2 engine (`engine.ts`, D-4) | Designed | **Verified** (in-session: tsc + engine test 41/0) |
| Sage Calling — Stage 2 store (`session-store.ts`, D-7) | Designed | **Verified** (in-session: tsc + store test 30/0; pure helpers + KG7 invariant) |
| Sage Calling — Stage 2 public surface (endpoint, A10 gate, Hard Gate enforcement, R18d, `SAGE_CALLING_ENABLED`) | Designed | **Scoped** (carried to the follow-up) |

## Verification Method Used (0c framework)
- **Engine logic** → AI authored + ran a plain-assertion `tsx` test: **41/0**. Covers content lookup, cold open, reachability of every B/C/D (each stage's hardest-diagnostic explicitly), advancement, all special transitions, clarification-template selection by termination cause, determinism (identical history → identical output), the preference-state-invariance discipline (appended tone text changes nothing), and bounded termination for both a "good" and a "null" agent.
- **Store logic** → AI authored + ran a plain-assertion `tsx` test: **30/0**. Covers the pure helpers, the KG7 JS-array invariant (precondition for `jsonb_typeof='array'`), retention-cutoff arithmetic, and engine-composition across a run. The **live Supabase round-trip is a founder post-deploy smoke test in the follow-up** (nothing writes the table until the endpoint exists).
- **Whole project** → `npx tsc --noEmit` clean project-wide. Stage 1 regression green (question-library 90/0; layer1-schema-additions 50/0).
- **PR2 (build-to-wire)** → every engine path and every pure store helper is invoked by the tests. Endpoint-path invocation (auth gate, global flag, Hard Gate, metering actually called in the request path) is the follow-up's PR2 step, since no endpoint exists yet.

## Risk Classification Record (0d-ii)
- `engine.ts` + its test — Standard (new module / new test; no auth/endpoint/flag).
- `session-store.ts` + its test — Standard (new module; references the already-live table but deploys nothing, exposes nothing).
- Session set to **Elevated** (conservative — the store is the data layer for the forthcoming Critical surface, and the founder split this off a Critical-scoped stage). No Critical surface this sitting.

## PR5 — Knowledge-Gap Carry-Forward
No concept required re-explanation. KG1 (await all DB I/O; lazy client; no fire-and-forget) and KG7 (JSONB written as arrays/objects, never `JSON.stringify`'d) were engaged and are enforced + asserted in the store + its test. Standing harness note re-confirmed: these `tsx` tests run from `website/`; the new engine/store tests import no Supabase chain, so plain `npx tsx` works (no `--env-file` needed).

## Next Session Should
**Sage Calling — Stage 2, the Critical public-surface half (~3–4 hr; full Critical Change Protocol).** Wire `POST /api/calling` (D-2) over the verified engine + store; the A10 auth gate reusing `validateAtlWriteToken` (D-6, reuse-as-is decided); the per-stage Option D metering (D-8, no double-bill on resume — `loop-cost-tracker`'s `(api_key_id, loop_id)` uniqueness handles this); the Hard Gate enforcement + `discovered_purpose` five-spec mapping (D-14/D-5) — and execute the **Layer 1 `version` → v3 bump here (Step 4)** after confirming no consumer compares it literally; the D-12 clarification re-entry (timeout + new-context detection); the optional `agent_card_url` (D-13, fetch-and-verify, decline `available_tools`); and the **R18d adversarial suite** (manipulation, covert framing, poisoned/spoofed Agent Cards). Go Live gated by `SAGE_CALLING_ENABLED` (the `SUBSTRATE_WRITE_PATH_ENABLED` analogue). The follow-up prompt is written: `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-NEXT-SESSION-PROMPT.md`.

## Blocked On
**Files to commit + push via GitHub Desktop (only these — do NOT blanket `git add .`):**
- `website/src/lib/sage-calling/engine.ts` (new)
- `website/src/lib/sage-calling/__tests__/engine.test.ts` (new)
- `website/src/lib/sage-calling/session-store.ts` (new)
- `website/src/lib/sage-calling/__tests__/session-store.test.ts` (new)
- `operations/decision-log.md` (entry appended)
- `operations/handoffs/founder/2026-05-21-sage-calling-stage2-engine-store-close.md` (this close)
- `operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-NEXT-SESSION-PROMPT.md` (follow-up prompt)

**Side-effect I caused (cleanup):** running `tsc` regenerated the tracked build cache `website/tsconfig.tsbuildinfo`. It's a generated incremental-build artefact — leave it out of the commit, or discard it with `git restore website/tsconfig.tsbuildinfo`.

**Production state at session close:** **UNCHANGED — nothing deployed.** No public Sage Calling surface exists; the two new modules are not imported anywhere yet (no endpoint), so a Vercel rebuild on push compiles them but changes no runtime behaviour. `SAGE_CALLING_ENABLED` does not exist yet (no code reads it). `discovery_sessions` exists (Stage 1) but is empty and unread. A10 Live + Verified. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. Option D Live. The optional Layer 1 `discovered_purpose` field remains inert (unbumped version until the follow-up Step 4).

## Open Questions
- **Layer 1 `version` → v3** — founder-elected; execute at follow-up Step 4 (handoff wiring) after confirming no consumer compares the version literally; flag for the Rule A licensing gate.
- **Retention window 90 days** — proceeding on the AI recommendation; founder may change to 30 (one-line edit to `RETENTION_WINDOW_DAYS` + the migration comment) — lawyer-track item.
- **`outcome` enum `'found' | 'null_result'`** — unchanged (matches the live CHECK constraint); confirm at follow-up for R10 consistency.
- **D-12 timeout value + "new context arrives" detection** — endpoint-level; deferred to follow-up Step 5. The engine already enforces no-loop-to-Q1 + once-and-precisely.

## Founder Verification (between sessions)
**1. Re-run the in-session checks (from `website/`):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/sage-calling/__tests__/engine.test.ts
npx tsx src/lib/sage-calling/__tests__/session-store.test.ts
```
Expected: `tsc` exits 0 (no output); engine prints `41 pass / 0 fail`; store prints `30 pass / 0 fail`.

**2. Commit + push (GitHub Desktop):** stage the seven files listed under "Blocked On" (and discard `tsconfig.tsbuildinfo`), paste the commit message below, commit, then push.
```
Sage Calling Stage 2 (engine + store) — deterministic engine + discovery_sessions store

Rule-based variant-selection engine (D-4): pure nextStep(history); epistemic
state only, never preference state; each stage's hardest-diagnostic reachable;
no randomness/sentiment/LLM. discovery_sessions store (D-7): KG1 awaited I/O,
KG7 direct JSONB arrays, R17h hard-delete (session_id + agent_id), R17i
minimisation, 90d retention sweep. tsc clean; engine 41/0; store 30/0; Stage 1
regression green.

Elevated (new modules; nothing public, nothing deployed, no flag). The Critical
public surface (endpoint, A10 gate, Hard Gate, R18d, SAGE_CALLING_ENABLED) is the
follow-up. Per D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21.
```
A Vercel rebuild compiles the new modules; runtime behaviour is unchanged (nothing imports them yet).

## Cross-references
- `/operations/handoffs/founder/2026-05-21-sage-calling-stage1-build-close.md` (predecessor close — Stage 1)
- `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-build-NEXT-SESSION-PROMPT.md` (the operative Stage 2 prompt)
- `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-NEXT-SESSION-PROMPT.md` (the follow-up prompt — the Critical public-surface half)
- `/adopted/purpose-discovery-product-design.md` (the locked design)
- `D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21` + `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21` + `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (decision-log)
- `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`

*End of session close. Stabilised to a known-good state: two new modules Verified in-session (engine 41/0; store 30/0; tsc clean; Stage 1 regression green), nothing imported anywhere, nothing deployed, production byte-identical. Seven files await commit + push. The Critical public-surface half is scoped and prompted for the follow-up.*
