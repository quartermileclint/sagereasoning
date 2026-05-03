# Next-Session Prompt — Sub-session D: First consumer-route wiring (PR1 single-endpoint proof)

**Stream:** founder.
**Tier:** code-elevated (becomes code-critical if the chosen consumer is a route inside the R20a perimeter — confirm at session open).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-C-bis-close.md`.
**Predecessor decision-log entries:** `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04`; `D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04`; `D-CORPUS-PASSAGES-POPULATION-2026-05-03`.
**Risk classification:** **Elevated** under 0d-ii by default (changes to existing user-facing functionality, or new external dependency surface for the chosen consumer). May reclassify to **Critical** if the chosen consumer is inside the R20a perimeter (PR6 + AC5 + AC7 may all engage). Confirm at session open before code is written.

## Why this session matters

The retrieval substrate (D6 + D7) is now Verified — the test harness confirmed the modules return the expected passages on representative query shapes. But Verified-in-isolation is not the same as Verified-in-place. PR1's single-endpoint proof discipline says: prove a new architectural pattern on one endpoint before rolling it out across more. Sub-session D is that proof — pick one consumer route, replace its existing per-mechanism context loading (or add a new retrieval call where none existed), measure the result against the existing route's behaviour, and document the lessons before generalising.

After this session, one production route reads from the indexed corpus via D6/D7 instead of from the condensed `stoic-brain-compiled.ts` constants. The migration pattern is proven on real production traffic shape (not just synthetic test queries), and the cost / latency / quality observations inform whether subsequent route wirings are routine or need pattern revision.

## Pre-conditions

1. Founder pushed Sub-session C-bis's ten artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push (no-op deploy expected — code merged but not yet imported by any deployed route).
2. D6 + D7 modules at `/website/src/lib/rag/` and the two RPC functions in production Supabase (`match_passages_bm25`, `match_passages_vector`) Live and unchanged from Sub-session C-bis.
3. The Sub-session C-bis findings are reviewed at session open:
   - **BM25 zero-results across multi-term queries** — decide whether the consumer route's queries should be reformulated (e.g., shorter; OR-shaped via `websearch_to_tsquery` syntax) or whether vector-only retrieval is acceptable for the chosen consumer.
   - **Cold latencies above D6 targets (748–3774ms vs 500ms)** — decide whether the consumer needs a server-side embedding cache (cross-request) or whether the per-call cost is acceptable.
4. Founder availability for ~3–5 hours (the session may split at the consumer-decision boundary if needed).
5. Lawyer engagement for legal review (R19c privacy policy + terms) — note from the project instructions Cross-Cutting Limitations: "Begin lawyer engagement no later than P3." Sub-session D is still inside P0/P1 territory but lawyer scheduling has lead time; surface this at session open as a parallel-track action.

## Part A — Open under the protocol (cache-driven)

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; the code-elevated row engages).
2. `/operations/handoffs/founder/2026-05-04-sub-session-C-bis-close.md` (~5 min — predecessor close).
3. `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6) — re-read §"Per-mechanism call patterns" + §"R7 / R8a / KG6 compliance" only.
4. `/adopted/rag-mentor-alt3/re-rank-design.md` (D7) — re-read §"Per-mechanism re-rank policy" only.
5. `/operations/decision-log.md` last 3 entries (`D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04`; `D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04`; `D-CORPUS-PASSAGES-POPULATION-2026-05-03`).
6. The chosen consumer route's existing source file (one of: `/website/src/app/api/reason/...`, `/website/src/app/api/mentor/private/reflect/...`, or whichever route is selected at Step 1 below) — read in full to understand the existing pattern being replaced or extended.

Confirm at session open per cache:
- **Tier:** code-elevated by default; reclassify to code-critical if the chosen consumer is inside the R20a perimeter, the auth/session perimeter, or the deployment-configuration perimeter.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** confirm against the cache table — the consumer route may run Layer 1 (Sonnet) + Layer 3 (Sonnet) + safety-critical R20a (Haiku) in addition to the new D6 query embedding (OpenAI `text-embedding-3-small`). Cite each row.
- **Status vocabulary targets:** end-of-session — chosen consumer route reaches **Wired** with new retrieval pattern (test path proven via founder-performable verification); patterns observed during the wiring documented for the next consumer.
- **KGs engaged at minimum:** KG1 (rules 1+2+4 — Vercel writes/redirects/per-request lifetime); KG6 (composition order — D6 output now flows into a real route's prompt composition); KG7 (JSONB writes if the consumer writes anything to JSONB columns).

## Part B — Procedure

### Step 1 — Choose the consumer route for the single-endpoint proof

Three candidate consumers:
- **Candidate A:** `/api/reason` quick-depth path. Pro: existing route; reads stoic-brain-compiled context constants today; quick-depth uses Haiku (per AC1) so a model collision with new embedding is unlikely. Con: production traffic — any regression affects users immediately.
- **Candidate B:** the V3 mentor reflection route (`/api/mentor/private/reflect`). Pro: existing route; uses Sonnet; precedent for Sonnet structured output. Con: inside R20a perimeter (mentor surfaces include distress detection); reclassifies to code-critical.
- **Candidate C:** a new dedicated route (e.g., `/api/internal/retrieve`). Pro: isolated; no production users at risk; easiest to reverify; PR1 single-endpoint proof in its purest form. Con: doesn't replace any existing surface; the proof is structural, not operational.

The AI proposes one with reasoning; the founder confirms (or overrides) before code is written. Recommendation candidate is **C** for the cleanest PR1 proof, but the founder's call. Decision recorded in the session's decision-log entry.

### Step 2 — Architectural decision record (ADR) for the wiring pattern

Per the project instructions Cross-Cutting Limitations: "Architecture decisions before code for R17a and R20a." Sub-session D's wiring may engage R20a if Candidate B is chosen. Even for Candidate A or C, the wiring shape (per-request cache instantiation; how D6's output flows into the prompt; how Layer 3 reads source citations) is an architectural decision worth recording as an ADR.

The AI produces a ~1-page ADR draft; founder approves before code begins. Filed at `/drafts/adr/2026-05-XX-d6-d7-consumer-wiring.md`; promoted to `/adopted/adr/` if approved.

### Step 3 — Wire D6 + D7 into the chosen consumer

Implement the wiring per the ADR. Honour:
- D6 §"Per-mechanism call patterns" — the call shape for the consumer's mechanism(s).
- D6 §"R7 / R8a / KG6 compliance" — `source_citation` flows through to Layer 3.
- D7 §"Per-mechanism re-rank policy" — heuristic default; cross_encoder + llm reserved.
- KG1 rule 4 — per-request cache `Map` instantiated inside the route handler; not module-level.
- AC-12 narrowness — the engine's deterministic logic continues to do the Stoic reasoning; D6/D7 only fetch + rank passages.
- Existing patterns in the route (auth checks, response envelope, error handling) preserved.

### Step 4 — Founder-performable verification of the wired route

The AI produces a verification command set the founder runs from the Mac terminal:
- `curl` (or equivalent) against the route with a representative request body.
- Expected response shape + key fields the founder can check against the prior behaviour.
- Latency observation (compare against pre-wiring baseline if measurable).

Founder runs; reports observations. AI documents in the decision-log entry.

### Step 5 — Append decision-log entry (lean form for Standard / Elevated; full form for Critical)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" or §"Critical-risk sessions" depending on the chosen consumer's classification.

### Step 6 — Session close (lean form for Standard / Elevated; full form for Critical)

Pattern: per `/adopted/standing-protocol-cache.md`. Updates Phase-2 pass-1 readiness inventory: substrate piece 7 of 7 (first consumer wired) reaches Wired or Verified.

### Step 7 — Next-session prompt (Sub-session E1)

Per D-CORPUS-PASSAGES-SCHEMA-2026-05-03 the sequence is C → D → E1–E4 → F → G → H. Write `/operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md` for the next sub-session. E1's exact scope per the live readiness inventory at session close — likely the second consumer route wiring (now that the pattern is proven).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + D6/D7 re-reads + chosen consumer's source read | 25–40 min |
| Step 1 consumer choice + Step 2 ADR draft | 30–45 min |
| Step 3 wiring (heart of the session) | 90–150 min |
| Step 4 founder-performable verification | 20–40 min |
| Steps 5–7 (decision-log + close + Sub-session E1 prompt) | 40–60 min |
| **Total** | **~3–5 hours** |

If too long for one sitting: Step 2 ADR completion is the natural split point. The wiring (Step 3) is the next session's opener.

## Rollback path

- Wiring breaks the chosen consumer: `git revert` of the wiring commit restores the prior behaviour. The new modules (`/website/src/lib/rag/`) and the RPC functions in Supabase remain in place but unused.
- Latency regression on the chosen consumer: revert OR add a feature flag (`USE_RAG_RETRIEVAL=false`) that falls back to the existing per-mechanism context constants. Feature-flag activation rules per cache (env-flag activation = Critical risk).
- D6/D7 surfaces an unforeseen issue at production traffic shape: revert the wiring; log the finding in the decision-log entry; treat as Phase-2 production observation candidate per D6 / D7 open questions.

## Forecast

**On clean completion:** one consumer route is wired to read corpus passages via D6/D7 instead of the condensed context constants; the wiring pattern is proven on real production traffic shape; lessons documented for subsequent consumers (E1–E4); ADR for the wiring pattern Adopted; founder verification confirms the route behaves correctly. Phase-2 pass-1 substrate piece 7 of 7 reaches Wired (or Verified if production observation confirms).

**Next-next session (Sub-session E1):** apply the proven wiring pattern to the second consumer route. PR1 single-endpoint proof discipline complete; rollout begins.

End of prompt.
