# Next-Session Prompt — Sub-session E3 (or E-final / pause): Founder's call — fourth consumer wiring OR pause rollout

**Stream:** founder.
**Tier:** code-elevated (if continuing rollout) OR governance (if pausing). Founder declares at Step 1 below.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E2-close.md`.
**Predecessor decision-log entries:** `D-SCORE-RAG-WIRED-2026-05-04`; `D-REASON-RAG-WIRED-2026-05-04`; `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04`.
**Risk classification:** **Elevated** under 0d-ii (if rollout continues — changes to existing user-facing functionality). **Standard** under 0d-ii (if rollout pauses — governance-only). Critical Change Protocol NOT engaged either way.

## Why this session matters

After Sub-session E2, three consumers are wired with D6/D7 retrieval at Layer 1: Candidate C (`/api/internal/retrieve` — internal route, Sub-session D), Candidate A (`/api/reason` quick-depth, Sub-session E1), and Candidate D (`/api/score` standard-depth, Sub-session E2). The pattern is mature: ADR-001 + the wiring shape from `/api/reason/route.ts` + the verification harness pattern at `/website/scripts/verify-reason-rag.ts` form a documented, reproducible procedure. The substrate work is done.

E3 is the founder's deliberate-choice fork: continue the rollout to a fourth consumer, OR pause the rollout and pick up a different Priority sequence item. Neither choice is wrong; the framing is what matters. E2's open question #4 + #5 (Pattern S2 helper-lift + `loadLayer1WithFallback` extraction) become natural in-scope simplifications IF rollout continues — both reduce maintenance load on a third+ consumer. If the rollout pauses, those refactor candidates wait until a future rollout session.

Per the project instructions, Priorities 1–7 sit beyond P0's hold point; once the founder is satisfied that the rollout has demonstrated enough, attention shifts to other P0 0h items (the hold-point assessment) or to P1+ work. The founder calls the shape.

## Pre-conditions

1. Founder pushed Sub-session E2's six artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push (the `/api/score` standard-depth route now reads Layer 1 from the indexed corpus; if anything broke, it would surface as user-facing latency or 500s on `/api/score` traffic).
2. Founder availability for ~1–3 hours.
3. Founder has reflected (between sessions) on whether the rollout has demonstrated enough or whether continued rollout serves the wider Priority sequence.

*No knowledge-gap register entries promoted from E2 to E3; the E2 close's open questions are Phase-2 production observation candidates or in-rollout simplification candidates, not session-blocking.*

## Part A — Open under the protocol (cache-driven)

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; the code-elevated row engages by default if continuing, governance if pausing).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E2-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-SCORE-RAG-WIRED-2026-05-04`) — read the "Files touched" + "Open questions" sections in full.

If continuing rollout:

4. `/website/src/app/api/score/route.ts` — re-read in full. The wiring shape this session copies (or evolves via S2 helper-lift).
5. `/website/src/app/api/reason/route.ts` — re-read for cross-reference.
6. `/website/src/app/api/reason/helpers.ts` — re-read; decide at Step 2 whether helpers stay route-local (Pattern S1) or lift to `/website/src/lib/rag/helpers.ts` (Pattern S2; recommended at this point).
7. The chosen consumer route's existing source file (per Step 1 below) — read in full to understand the existing context-loading shape being replaced.
8. `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` — ADR-001. Re-read §"Wiring shape" + §"AC-12 narrowness preservation" only.

If pausing rollout:

4. Project instructions §"Priority 1: Business Plan Review Completion" through §"Priority 7" — identify the next Priority sequence item to pick up.
5. Any deliverable named by that priority — read in full.
6. `/adopted/standing-protocol-cache.md` §"Work categories" — confirm category for the chosen Priority work.

Confirm at session open per cache:

- **Tier:** code-elevated (continuing) OR governance (pausing).
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** confirm against the cache table per the chosen path.
- **Status vocabulary targets:** end-of-session — if continuing, chosen consumer route reaches **Wired** then **Verified** (founder runs the harness — extended again or refactored); Phase-2 pass-1 inventory adds an "E3 consumer" item. If pausing, the Priority sequence item targeted reaches whatever its native end-of-session vocabulary is.
- **KGs engaged at minimum:** if continuing, KG1 rule 4 (per-request `Map` cache) + KG6 (composition order — engine handles placement per Pattern A2; not a new KG6 surface). If pausing, KGs depend on the Priority work chosen.

## Part B — Procedure

### Step 1 — Founder decides: continue rollout OR pause

The AI surfaces the question at session open with reasoning:

**Path 1 — Continue rollout to a fourth consumer.** Candidates surface from the `/api/score-*` family + the assessment routes that share `runSageReason`:

| Candidate | Route | Notes |
|---|---|---|
| **F1** | `/api/score-decision` | 2-5 option loop; needs design choice (per-option retrieval vs once on the decision vs synthetic combined query). Adds a new pattern dimension; ADR-001 §"Future patterns" candidate. |
| **F2** | `/api/score-document` | Document-shaped input; may want different mechanism filter. Likely close to E2's shape. |
| **F3** | `/api/score-scenario` | Scenario-shaped input; long context. |
| **F4** | `/api/score-conversation` | Conversation-shaped input; may want different filter shape. |
| **F5** | `/api/score-social` | Social-decision input. |
| **F6** | `/api/score/<existing routes already wired>` | N/A — already wired in E2. |

The AI proposes one with reasoning at session open; the founder confirms (or overrides). **Default recommendation:** the simplest of the remaining `/api/score-*` family that maps cleanly to the wiring already proven (likely `/api/score-document` or `/api/score-conversation` — both single-call patterns; founder picks). `/api/score-decision` deferred to a session that explicitly addresses the loop-pattern design dimension.

**Path 2 — Pause rollout. Pick up another Priority sequence item.**

Per project instructions, candidates beyond P0 0h:

| Priority | Item | Notes |
|---|---|---|
| P0 0h Assessment 1 | Test every component on real data | Hold-point assessment work; uses what's now wired. |
| P0 0h Assessment 5 | Startup preparation toolkit definition | Hold-point assessment work; founder-led. |
| P1 | Business Plan Review Completion | Evidence-based deliberate-choice exercise. |
| P2 | Ethical Safeguards (R17, R19, R20) | R17 + R19 + R20 build items; some are Critical-risk. |
| P3 | Agent Trust Layer + R18 honest certification | Includes adversarial evaluation. |

The AI proposes one with reasoning if the founder asks; the founder decides which Priority item is next. The decision is recorded in the session's decision-log entry as a deliberate-choice exercise per R0.

### Step 2 — If Path 1: helpers location decision

Pattern S1 from E2 (cross-route import from `/api/reason/helpers`) works fine for two consumers. With E3 making it three, the natural simplification is:

- **Pattern S2 — Lift `getCorpusMechanismsForDepth`, `RETRIEVAL_TOP_K_BY_DEPTH`, `toBm25OrShape` to `/website/src/lib/rag/helpers.ts`.** All three consumers import from `@/lib/rag/helpers`. Refactor includes updating `/api/reason/route.ts` + `/api/score/route.ts` import paths. Standard-risk refactor; verifiable via the existing harness re-run (no behaviour change).
- **Pattern S3 — Also lift `loadLayer1WithFallback`** to `/website/src/lib/rag/load-layer1-with-fallback.ts` (or alongside the helpers file). Removes the duplicate ~25-line function from `/api/reason/route.ts` + `/api/score/route.ts`. Refactor risk: the function takes a route-namespaced `console.warn` message; lift requires passing the route name as a parameter or accepting a generic message. Standard-risk if done carefully.

AI recommends **S2 (helpers lift) + S3 (function lift)** as a single in-session refactor before the new consumer's wiring; founder confirms.

If the founder prefers to defer either lift, the new consumer can keep the cross-route import (S1 extended) and copy the function (E2 pattern continued). Founder's call.

### Step 3 — If Path 1: wire chosen consumer

Implement per the established shape (copy from `/api/score/route.ts` or `/api/reason/route.ts`):

- Lift the helpers + function first if S2 + S3 are in scope; then have the new consumer + the two existing consumers all import from the shared location.
- Per-request `Map<string, RetrieveResult>` cache declared inside POST handler (KG1 rule 4).
- `Promise.all` parallelisation extending whatever Layer 2 / Layer 3 the chosen consumer already loads.
- Pass `retrievedPassages` to `runSageReason` via spread (`...layer1`).
- Preserve the consumer's existing auth, rate limit, validation, response envelope, distress check.

Risk: **Elevated**. If the wiring touches anything beyond the Layer 1 swap (e.g., a route-specific custom prompt), reclassify and revisit.

### Step 4 — If Path 1: founder-performable verification

Two options:

- **Option V1 — Extend `/website/scripts/verify-reason-rag.ts` again** with a new fixture set / phase for the chosen consumer. Same harness; one more block. Total checks 43 → 43 + N.
- **Option V2 — Refactor harness into shared `runConsumerWiringPhase(depth, fixtures, harness)` helper** (the E3+ candidate from E2's harness header). Cleaner; reduces duplication. Lighter than V1 if the helper-extraction itself is short (<30 lines).

AI recommends V2 if Step 2's S2+S3 lift is in scope (the harness extraction follows the same simplification logic); V1 if S2/S3 deferred (consistent with the lighter-touch pattern). Founder confirms.

### Step 5 — Append decision-log entry

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Cross-reference E2's entry + ADR-001.

If Path 2 (pause): the entry records the deliberate-choice exercise (R0) and the Priority item picked up; risk class Standard.

### Step 6 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". If Path 1: updates Phase-2 pass-1 readiness inventory with an "E3 consumer wired" item alongside E1 + E2. If Path 2: documents rollout pause with revisit conditions.

### Step 7 — Next-session prompt (E4 or post-rollout)

Per the live readiness inventory at session close. If rollout continues, E4 is the fifth consumer or the rollout's natural pause point. If rollout paused at E3, the next session's prompt reflects the chosen Priority item.

## Part C — Anticipated session shape

**Path 1 (continue rollout, with S2+S3 helper-lift in scope):**

| Phase | Estimate |
|---|---|
| Cache + predecessor close + chosen consumer's source read | 15–25 min |
| Step 1 path declaration + Step 2 helper-lift decision + Step 4 harness option | 10–15 min |
| Step 2 S2+S3 helper-lift refactor (with re-run of existing harness for no-regression) | 20–40 min |
| Step 3 wiring (lighter than E2 — engine + helpers all at shared location) | 30–45 min |
| Step 4 founder-performable verification (extended or refactored harness) | 20–40 min |
| Steps 5–7 (decision-log + close + next-session prompt) | 25–40 min |
| **Total** | **~2–3 hours** |

**Path 2 (pause rollout, pick up Priority item):**

| Phase | Estimate |
|---|---|
| Cache + predecessor close + Priority item deliverable read | 15–30 min |
| Step 1 path declaration + Priority item declaration + scope confirmation | 15–25 min |
| Substantive Priority work | varies |
| Steps 5–7 (decision-log + close + next-session prompt) | 25–40 min |
| **Total** | **varies** |

## Rollback path

**Path 1:** Wiring breaks the chosen consumer: `git revert` of the wiring commit restores prior behaviour. Engine + E1's wiring + E2's wiring + helpers (if lifted) all remain untouched (the lift is reversible via revert too). Output regression at the chosen consumer: revert OR add a feature flag (Critical risk — defer unless necessary). The `loadLayer1WithFallback` pattern's try/catch fallback means runtime retrieval failures don't break user-facing responses — they fall back to compiled-string Layer 1 silently.

**Path 2:** Governance-only changes are append-only; rollback via git revert if needed. No production surface change.

## Forecast

**Path 1 on clean completion:** four consumers wired (Candidate C internal + Candidate A `/api/reason` quick-depth + Candidate D `/api/score` standard-depth + the E3 chosen route). Helpers + `loadLayer1WithFallback` lifted to `/lib/rag/` shared location (assuming S2+S3 in scope). Phase-2 pass-1 readiness inventory records the fourth rollout consumer + the helper-lift refactor. The pattern has matured to a point where additional consumers can be added by reading ADR-001 + the shared helpers + the existing wired routes.

**Path 2 on clean completion:** rollout paused at three consumers; founder shifts attention to a Priority sequence item; decision-log entry records the deliberate-choice exercise with revisit conditions. The R&D-phase rollout work has demonstrated the pattern across diverse consumer shapes (internal + user-facing quick-depth + user-facing standard-depth) — sufficient evidence for the hold-point assessment per P0 0h.

**Next-next session:** founder's call again. The pattern is mature enough that a non-AI engineer could read ADR-001 + this prompt + the existing wired routes (post-lift if S2+S3 land) and continue the rollout independently.

End of prompt.
