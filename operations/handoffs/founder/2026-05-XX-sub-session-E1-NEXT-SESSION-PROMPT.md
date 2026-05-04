# Next-Session Prompt — Sub-session E1: Second consumer-route wiring (PR1 rollout begins)

**Stream:** founder.
**Tier:** code-elevated by default. Reclassifies to **code-critical** if Step 1 selects Candidate B (V3 mentor reflection route — R20a perimeter; PR6 + AC5 engage).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-D-close.md`.
**Predecessor decision-log entries:** `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04`; `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04`; `D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04`.
**Risk classification:** **Elevated** under 0d-ii by default (changes to existing user-facing functionality). May reclassify to **Critical** if Candidate B is chosen.

## Why this session matters

Sub-session D proved the wiring pattern on Candidate C — a new dedicated `/api/internal/retrieve` route with no production users. PR1's discipline is now satisfied at the structural level: the wiring composes D6 + D7 + per-request cache + BM25 query reformulation correctly; ADR-001 documents the pattern; the verification harness ran 25/25 against real Supabase + OpenAI. **E1 is the first rollout — replacing the existing `stoic-brain-compiled.ts` constants read in a real consumer route with a live D6/D7 call.**

After this session, one production route reads its philosophical content from the indexed corpus instead of a compile-time constant. Founder verifies the route still produces the expected outputs end-to-end (not just retrieval shape) — meaning the comparison is "old prompt composition with constants" vs "new prompt composition with retrieved passages." The PR1 rollout begins here; Sub-sessions E2–E4 follow with the remaining consumers.

## Pre-conditions

1. Founder pushed Sub-session D's nine artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push (admin-only `/api/internal/retrieve` route deployed; no public-facing change).
2. PR5 knowledge-gap register entry from D's open question #1 ("verification harnesses must copy baseline filter sets verbatim, not re-derive from spec") added between sessions or queued as a parallel-track action at E1 open.
3. Founder availability for ~2–4 hours.

*Sub-session D's ADR-001 amendment was completed in-session — see ADR-001 changelog. No pre-session amendment work required.*

## Part A — Open under the protocol (cache-driven)

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; the code-elevated row engages by default).
2. `/operations/handoffs/founder/2026-05-04-sub-session-D-close.md` (~5 min — predecessor close).
3. `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` — ADR-001 in full. The pattern E1 follows.
4. The chosen consumer route's existing source file (per Step 1 below) — read in full to understand the existing context-loading shape being replaced.
5. `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6) — re-read §"Per-mechanism call patterns" only.
6. `/operations/decision-log.md` last 2 entries (`D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04`; `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04`).

Confirm at session open per cache:

- **Tier:** code-elevated by default; reclassifies to code-critical if Candidate B is chosen.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** confirm against the cache table — the chosen consumer's existing model (Haiku for `/api/reason` quick-depth; Sonnet for V3 mentor reflection) is unchanged by this session. The new D6 query embedding (OpenAI `text-embedding-3-small`) adds to the per-request cost. Cite each row.
- **Status vocabulary targets:** end-of-session — chosen consumer route's D6/D7 wiring reaches **Wired** then **Verified** (founder runs comparison test); Phase-2 pass-1 inventory adds an "E1 consumer" item between substrate-Verified and full-rollout-Verified.
- **KGs engaged at minimum:** KG1 rule 4 (per-request cache `Map` declared inside route handler — same as Sub-session D); KG6 (composition order — **first real test of how D6 output flows into existing prompt composition**); KG7 only if the consumer writes JSONB.

## Part B — Procedure

### Step 1 — Choose the second consumer route (founder decision)

Three candidates, per the original Sub-session D prompt's framing applied to the post-D state:

- **Candidate A:** `/api/reason` quick-depth path. Pro: highest-traffic Haiku route; Elevated risk; the natural next step. Con: real production traffic; comparison test required to confirm non-regression.
- **Candidate B:** V3 mentor reflection route (`/api/mentor/private/reflect`). Pro: highest-value route. Con: **Critical risk** under PR6 + AC5 + AC7; reclassifies session to full Critical Change Protocol; significant heavier than E1's intended shape.
- **Candidate D:** another route the founder names (e.g., a less-trafficked `/api/score-*` route to extend the safety margin one step further before A).

The AI proposes one with reasoning; the founder confirms (or overrides) before code is written. **Recommendation: Candidate A.** It's the cleanest first-rollout (Elevated, not Critical; uses Haiku so no model-collision concerns; existing context-loading shape is well-documented in the route's header comments). Decision recorded in the session's decision-log entry.

### Step 2 — Read the chosen route's existing context-loading shape

For Candidate A: `/website/src/app/api/reason/route.ts` already documents the context-loading shape in its header (Layer 1 Stoic Brain, Layer 2 Practitioner Context, Layer 3 Project Context — all loaded in parallel via `Promise.all`). The replacement scope: **Layer 1** (the `getStoicBrainContext(depth)` call) reads from `stoic-brain-compiled.ts` constants today; this is what E1 replaces with a D6/D7 call. Layer 2 + Layer 3 are unaffected.

The integration question: D6 returns ranked passages; how do those passages compose into the existing Layer 1 prompt slot? Two patterns:

- **Pattern A1 — passages as system block content.** D6's top-K passages concatenate into a string that replaces the existing `stoicBrainContext` parameter. Engine receives the same shape; consumer prompt unchanged.
- **Pattern A2 — passages as structured context.** D6's `RetrievedPassage[]` is passed to `runSageReason` as a new parameter; the engine decides where each passage lands. Requires engine signature change.

Pattern A1 is the lightest-touch option (preserves engine signature). The AI presents both with reasoning; founder confirms. Decision recorded.

### Step 3 — Wire D6 + D7 into the chosen consumer

Implement per Pattern A1 (or A2 if chosen). Honour:

- ADR-001 §"Wiring shape" — per-request `Map` cache inside route handler; OR-shape passed via `bm25_query`; raw query as `query`; error class → HTTP mapping.
- ADR-001 §"AC-12 narrowness" — D6 + D7 deterministic; no new LLM call introduced by the wiring (the route's existing Haiku/Sonnet call unchanged).
- Existing route patterns preserved (auth, rate limit, validation, response envelope).
- The verification harness pattern from `/website/scripts/verify-internal-retrieve.ts` adapted: copy the route's existing test fixtures verbatim (per PR5 candidate finding from D); add comparison assertions ("output with D6/D7 is non-regressive vs output with stoic-brain-compiled constants").

Risk: **Elevated** if the Layer 1 replacement keeps the engine signature stable (Pattern A1); reclassifies upward if the change touches engine internals. Confirm at Step 2's pattern decision.

### Step 4 — Founder-performable verification of wired route

Two verification axes:

- **Wiring axis:** adapt `/website/scripts/verify-internal-retrieve.ts` to the chosen consumer's call shape. Reuse the BASELINE_QUERIES verbatim per PR5 candidate finding from D.
- **Comparison axis:** run a sample of representative requests (e.g., 3 of `/api/reason` quick-depth's existing test fixtures) **with the new D6/D7 wiring** and **with the old `stoic-brain-compiled` path** (preserved via a feature flag or git-stash A/B). Compare the response shape + key fields. The wiring is non-regressive if outputs are equivalent in meaning (not necessarily byte-identical — D6/D7 may surface a different passage order; founder judges whether the shift is acceptable).

The AI produces both verification command sets; founder runs from Mac terminal; AI documents observations.

### Step 5 — Append decision-log entry

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" if Standard/Elevated; full form if Critical (engages only if Candidate B is chosen). Cross-reference D's predecessor entry + ADR-001.

### Step 6 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory: add "E1 consumer wired" between "substrate Verified" and "full rollout."

### Step 7 — Next-session prompt (Sub-session E2)

Per the live readiness inventory at session close — likely the third consumer route wiring. Pattern from this prompt template; deliverables list shrinks to the consumer's specifics.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR re-read + chosen consumer's source read | 20–30 min |
| Step 1 consumer choice + Step 2 pattern choice | 20–40 min |
| Step 3 wiring (heart of the session) | 60–120 min |
| Step 4 founder-performable verification (wiring + comparison) | 30–60 min |
| Steps 5–7 (decision-log + close + Sub-session E2 prompt) | 30–50 min |
| **Total** | **~2.5–5 hours** |

If too long for one sitting: Step 2 pattern decision is the natural split point. Wiring (Step 3) opens the next session.

## Rollback path

- Wiring breaks the chosen consumer: `git revert` of the wiring commit restores the prior behaviour. The D6/D7 modules + RPC functions remain untouched.
- Output regression (D6/D7 surfaces different passages than stoic-brain-compiled, and the founder judges the shift unacceptable): revert OR add a feature flag (`USE_RAG_RETRIEVAL=false`) that falls back to the existing stoic-brain-compiled path. Feature-flag activation rules per cache (env-flag activation = Critical risk).
- D6 surfaces an unforeseen issue at the consumer's traffic shape: revert the wiring; log the finding in the decision-log entry; treat as Phase-2 production observation candidate per D6 / D7 open questions.

## Forecast

**On clean completion:** one production consumer route reads from the indexed corpus via D6/D7 instead of stoic-brain-compiled constants; the wiring pattern is proven on real traffic shape; ADR-001 (if not already amended) is updated to Adopted; founder verification confirms non-regression. Phase-2 pass-1 readiness inventory adds "E1 consumer wired" — the rollout has begun.

**Next-next session (Sub-session E2):** apply the pattern to the third consumer (likely another `/api/score-*` or the engine-internal `runSageReason` callers). PR1 single-endpoint proof discipline complete; rollout pace set by the founder.

End of prompt.
