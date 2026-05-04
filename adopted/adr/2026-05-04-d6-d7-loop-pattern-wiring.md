# ADR-002 — D6 + D7 Loop-Pattern Wiring (`/api/score-decision`)

**Status:** Adopted (founder approval at Sub-session E7 Step 2, 2026-05-04 — "Approve as drafted").
**Date:** 2026-05-04.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-SCENARIO-RAG-WIRED-2026-05-04` (E6); `D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04` (E5); `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04` (Sub-session D — ADR-001 origin).
**Related deliverables:** `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — Pattern A1 + Pattern A2 specification); `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6); `/adopted/rag-mentor-alt3/re-rank-design.md` (D7).
**Engages:** PR1 (rollout arc completion for `/api/score-*` family); KG1 rules 2 + 4 (per-request lifetime; await all DB reads); KG6 (composition order); AC-12 (translation-sandwich narrowness); R7 (source fidelity); R8a (controlled vocabulary).

---

## Context

`/api/score-decision` is the only remaining unwired user-facing route in the `/api/score-*` family after Sub-session E6. Sub-sessions E1–E6 wired six rollout consumers (four under Pattern A2; two under Pattern A1) plus one internal route (Candidate C); seven consumers Verified-in-place at the close of E6.

`/api/score-decision` is distinct from every E1–E6 predecessor. Its POST handler accepts an array of 2–5 decision options and evaluates each option through the same Stoic reasoning engine. The route's existing header comment makes the design intent explicit:

> "Layer 1 (Stoic Brain) — getStoicBrainContext('standard') / Loaded ONCE (parallel), reused across every option scored."

The "loop pattern" — N-option per-request iteration — is the design dimension this ADR addresses. ADR-001's Pattern A1 specification governs the wiring shape (route-managed; manual injection; the wrapper returns a string suitable for direct system-block injection), but ADR-001 was written for single-input consumers and does not specify how Layer 1 should compose across an option-loop.

Three architectural directions were surfaced for the loop dimension:

- **Direction α — single-retrieve, one block reused.** One D6 retrieval against the decision text; one D7 rerank; one format call. The same Layer 1 block is passed into every iteration of the option-scoring loop. No new helper.
- **Direction β — per-option retrieve.** N retrievals — one per option text. Each option gets the L1 block most relevant to its specifics. Most relevant per option; most expensive: a 5-option request makes 5 D6 calls + 5 reranks + 5 format calls. Requires a new helper module.
- **Direction γ — single-retrieve, per-option rerank.** One D6 call; N rerankings (heuristic, no LLM) against each option's text. Per-option rerank ordering from a single retrieved candidate set. Requires a new helper module.

Founder direction (E7 Step 1, 2026-05-04): **Direction α**. Reasoning preserved in the decision-log entry that accompanies this ADR.

## Decision

### Loop pattern

| Decision | Choice | Alternatives considered |
|---|---|---|
| **Loop pattern** | Direction α — single-retrieve, one block reused | β (per-option retrieve); γ (single-retrieve, per-option rerank) — both require new helper modules and new harness shapes that have not earned their place under PR8 (no recurrence yet); both are revisitable if Phase-2 production data shows per-option L1 tailoring matters. |
| **Wiring pattern** | Pattern A1 (per ADR-001) | Pattern A2 rejected because `/api/score-decision` calls `runSageReason` with `stoicBrainContext` as an explicit string parameter (route-managed surface), not as engine-internal retrieval. Pattern A1 fits the route's existing API verbatim. |
| **Wrapper module** | Existing `loadLayer1BlockWithFallback` (no new module) | A new "loop wrapper" was considered for Direction α (e.g., `loadLayer1BlockOnceForLoop`) but rejected: the existing wrapper's signature is identical to what α needs (one input, one depth, one cache, one routeName, one returned string). Adding a wrapper would duplicate behaviour without adding contract. |
| **Wrapper input** | `decision.trim()` | (a) `decision + ' ' + options.join(' ')` rejected — produces a long mixed-purpose query; embeddings of long mixed text retrieve more diffusely than focused queries, reducing rerank quality. (b) `${decision} ${context || ''}` rejected — context is route-optional and may be empty; conditional input would create two retrieval shapes per request. (c) `decision.trim()` chosen — the decision is the focal subject of the request; options are sub-cases evaluated against the decision's framing; closest to the pre-E7 `getStoicBrainContext('standard')` semantics (which is option-blind too). |
| **Depth** | `'standard'` | Matches the route's pre-E7 state — `getStoicBrainContext('standard')` is what α replaces. No depth change at E7. The depth question is separately addressable (see "What this ADR does not decide" below). |
| **RouteName label** | `'/api/score-decision'` | Single call site, single label. No `:generation` / `:scoring` split (unlike `/api/score-scenario` E6) because the route has only one LLM-bound call site shape, repeated N times in a loop with the same Layer 1. |
| **Cache shape** | Single per-request `Map<string, RetrieveResult>` declared inside POST | KG1 rule 4 — never module-level. The cache is required by the wrapper's signature even though α produces only one wrapper call (the cache is unused in α's request lifecycle, but declared per the per-request lifetime convention). |
| **Wrapper call placement** | Folded into the existing `Promise.all` that loads L2 + L3 | The route already loads L2 + L3 in parallel (lines 127–130 of route source). Folding L1 into the same `Promise.all` preserves the "loaded once in parallel" intent and adds no serial latency. |

### Wiring shape

```typescript
// Imports added:
//   import { type RetrieveResult } from '@/lib/rag'
//   import { loadLayer1BlockWithFallback } from '@/lib/rag/load-layer1-block-with-fallback'
//   (and getStoicBrainContext import is removed — the wrapper consumes it on the fallback path; no other call site in this file)

export async function POST(request: NextRequest) {
  // 1. Rate limit + auth + R20a distress check on `decision` (UNCHANGED — line 91 stays)
  // 2. Parse + validate body (UNCHANGED)
  // 3. Per-request RAG cache:
  //      const ragCache = new Map<string, RetrieveResult>()      ← KG1 rule 4
  // 4. Load L1 + L2 + L3 once in parallel (extends existing Promise.all):
  //      const [stoicBrainContext, practitionerContext, projectContext] = await Promise.all([
  //        loadLayer1BlockWithFallback(decision.trim(), 'standard', ragCache, '/api/score-decision'),
  //        getPractitionerContext(auth.user.id),
  //        getProjectContext('condensed'),
  //      ])
  // 5. Loop over options (UNCHANGED in shape):
  //      for (let i = 0; i < options.length; i++) {
  //        const reasoningResult = await runSageReason({
  //          input: option,
  //          context,
  //          depth: 'standard',
  //          domain_context: domainContext,
  //          stoicBrainContext,                                   ← variable from step 4
  //          practitionerContext,
  //          projectContext,
  //        })
  //        ...
  //      }
  // 6. Sort + receipts + envelope + analytics (UNCHANGED)
}
```

The change is local: source of `stoicBrainContext` swaps from `getStoicBrainContext('standard')` (compiled-string path) to `loadLayer1BlockWithFallback(decision.trim(), 'standard', ragCache, '/api/score-decision')` (Pattern A1 wrapper). The single wrapper call lands inside the existing `Promise.all`. Each iteration of the option loop receives the same `stoicBrainContext` string variable.

### KG1 + KG6 + AC-12 compliance

- **KG1 rule 2 (await all DB reads):** all RAG calls are awaited via `Promise.all` and `await runSageReason(...)`. No fire-and-forget.
- **KG1 rule 4 (per-request cache lifetime):** `ragCache` is declared inside POST, never module-level. The cache is passed as a parameter to the wrapper. With Direction α the cache is referenced once (one wrapper call) — the convention is preserved even though the cache is not exercised by repeated calls within the request.
- **KG6 (composition order):** Pattern A1 places the formatted block in the same logical slot as the predecessor `getStoicBrainContext('standard')` call site — passed to `runSageReason` as the `stoicBrainContext` parameter, which the engine places in its system array. The route makes a deliberate placement choice (delegated to the engine via `runSageReason`'s contract). Cache_control on the engine's system blocks is unchanged.
- **AC-12 narrowness preservation:** Pattern A1 introduces no new LLM call. The route's existing per-option `runSageReason` invocation count is unchanged (one per option, N total; N stays N). Only the source of the `stoicBrainContext` parameter changes from compiled-string to formatted-RAG-block. The R20a distress-detection LLM call at line 91 is unchanged.

### R20a + AC7 + PR6 dispositions

- **R20a (vulnerable user detection).** The route's `enforceDistressCheck(detectDistressTwoStage(decision))` at line 91 fires once per request on the `decision` text, before the wiring point. The Direction α wiring is downstream of the distress check and never bypasses it. Distress check unchanged at E7.
- **AC7 (auth / session / encryption / deployment-config standing constraint).** Not engaged — none of those surfaces is touched.
- **PR6 (safety-critical changes are always Critical risk).** Not engaged — the distress classifier, Zone 2 logic, Zone 3 redirection, and their wrappers are all unchanged. The wiring is at the second system-block source, not at the safety perimeter.

## Pattern variant — α loop pattern (named in this ADR)

Direction α is named the **α loop pattern** in this ADR for cross-reference in future sessions. It is a sub-variant of Pattern A1 (per ADR-001 §"Pattern variants"). Specification:

1. **Wiring shape.** Single wrapper call against the request's focal text (the "decision" or equivalent — the request-level subject), folded into the route's existing parallel-context `Promise.all`. The returned string is passed to N invocations of `runSageReason` (or N invocations of `client.messages.create` if a future Group-B-loop-pattern consumer emerges) as the `stoicBrainContext` parameter — the same string for every iteration.

2. **Cache discipline.** Single per-request `Map<string, RetrieveResult>` declared inside POST. The cache is unused by repeated calls within the request (because the wrapper is called once) but maintained for KG1 rule 4 convention.

3. **Wrapper choice.** Existing `loadLayer1BlockWithFallback`. No new wrapper.

4. **Fallback semantics.** Same as existing Pattern A1. On any throw in D6 + D7 + format, the wrapper returns `getStoicBrainContext(depth)` (the compiled-string path); the route never sees the failure. User sees a working response either way; failure observable via `console.warn` carrying the route name.

5. **Depth selection.** Per the route's pre-E7 state (`'standard'` for `/api/score-decision`). Loop-pattern consumers may use any depth their pre-E7 state warrants; depth-pattern reconciliation is a separate ADR question if it arises.

6. **Risk classification.** Wiring a Group B loop-pattern consumer under the α loop pattern is Elevated under 0d-ii — changes to existing user-facing functionality. AC7 not engaged. PR6 not engaged.

### Pattern variant — β + γ loop patterns (named for cross-reference; not adopted)

For future-session cross-reference if revisited:

- **β loop pattern.** Per-option retrieve. New helper module required (e.g., `loadLayer1BlocksPerOption(inputs: string[], …) => Promise<string[]>` returning N strings, one per option). New harness shape (per-option block assertions across N fixtures).
- **γ loop pattern.** Single retrieve, per-option rerank. New helper module required (e.g., `retrieveOnceRerankPerInput(decisionInput, optionInputs, …) => Promise<string[]>`). New harness shape (per-option rerank ordering assertions; D6 cache hit on iterations 2..N).

Both are revisitable. Neither is adopted at E7.

## Consequences

### Positive

- `/api/score-decision` Layer 1 wiring reaches **Wired** pre-run; reaches **Verified** on founder harness pass.
- Sibling wrapper `loadLayer1BlockWithFallback` reaches **Verified-in-place** for its third user-facing consumer (after `/api/score-document` + `/api/score-scenario`'s two call sites).
- Phase-2 pass-1 readiness inventory advances: **eight rollout consumers Verified** (Candidate C internal + 4 Pattern A2 user-facing + 3 Pattern A1 user-facing). PR1 rollout arc complete for the `/api/score-*` family across all three design dimensions: depth (quick / standard / deep), pattern (A1 / A2), and loop (α). Pattern α's contract proven on its first user-facing surface.
- Rollback is `git revert` of the wiring commit; the wrapper module remains untouched (no edit at E7).
- The route's existing "loaded once in parallel" comment is now true at the indexed-corpus surface, not just at the L2 + L3 surface.

### Negative / known costs

- Direction α's L1 cannot favour passages relevant to a specific option. The same L1 grounds every option's evaluation. Accepted at E7 per the trade-off discussion at session-open Step 2.
- Direction α's retrieval is grounded in the `decision` text. If `decision` is sparse or vague, the retrieved candidate set may be suboptimal for all options. Phase-2 production observation tracks this via the standard fallback-rate-per-route diagnostic.
- The harness adds Phase I (~32 checks) at standard depth, mirroring Phase H's structure at quick depth. Total checks 139 → 171.

### Risks named

- **`decision`-shaped input vs. corpus indexing.** A multi-option decision often phrased as a question ("Should I take the consulting offer?") is shorter and more sparse than the prose-rich F1/F2/F3 fixtures used in the harness. Topic-shape risk family — same as the GENERATION call site of `/api/score-scenario` (E6 open question #2). The harness contract test is sufficient for proving the wrapper works on known-good inputs; production observability catches decision-shape behaviour.
- **Per-option L1 tailoring trade-off.** If Phase-2 data shows specific options retrieve poorly under Direction α (because the L1 is grounded in the decision, not the option), the open question is a depth or pattern revisit — switch to β or γ, or supplement α with per-option re-rank only.
- **Cache underutilisation.** The cache is declared but unused. Future loop-pattern consumers using β or γ would exercise the cache; α does not. Documented; not a defect.

### What this ADR does not decide

- Direction β or γ. Revisitable if Phase-2 data shows per-option L1 tailoring matters (see Risks named).
- The route's depth (`'standard'` for both LLM calls). Pre-E7 state, unchanged at E7.
- HTTP-layer verification (continuity from Sub-sessions D + E1–E6). Script-based verification proves the wiring; HTTP-surface auth + rate-limit + JSON parsing + R20a distress-check on the route are unchanged.
- Whether the cache's unused-by-α status warrants a future refactor (e.g., wrapper signature without cache for single-call paths). Not in scope.

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR moves from `/drafts/adr/` to `/adopted/adr/` in this session, accompanies the wiring code.

## Changelog

- **2026-05-04 (initial Adoption)** — drafted in `/drafts/adr/`, approved verbatim by founder at Sub-session E7 Step 2, moved to `/adopted/adr/`.

---

*End of ADR-002.*
