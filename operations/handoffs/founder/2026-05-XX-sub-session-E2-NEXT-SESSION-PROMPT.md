# Next-Session Prompt — Sub-session E2: Third consumer-route wiring (PR1 rollout continues)

**Stream:** founder.
**Tier:** code-elevated by default.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E1-close.md`.
**Predecessor decision-log entries:** `D-REASON-RAG-WIRED-2026-05-04`; `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04`.
**Risk classification:** **Elevated** under 0d-ii (changes to existing user-facing functionality). Not Critical — the engine signature change was completed in E1 and is now stable; E2 wires another consumer to the same already-extended engine surface without further architectural change.

## Why this session matters

E1 wired Candidate A (`/api/reason` quick-depth) — the second consumer overall and the first user-facing rollout target. Pattern A2 (additive engine signature; structured passages to engine) reached Verified status with 27/27 ALL CHECKS PASSED. The substrate work is done.

E2 is the **third consumer wiring** — applying the same pattern to a `/api/score-*` route (or another engine-internal `runSageReason` caller, founder's call). This session is materially simpler than E1 because:

1. The engine already accepts `retrievedPassages?: RetrievedPassage[]` (additive parameter; no engine change this session).
2. The shared helpers (`getCorpusMechanismsForDepth`, `RETRIEVAL_TOP_K_BY_DEPTH`, `toBm25OrShape`) exist at `/website/src/app/api/reason/helpers.ts` and can be lifted to a shared location OR re-imported.
3. The `loadLayer1WithFallback` pattern is documented in `/api/reason/route.ts`'s header and can be copied (or extracted into a shared helper).
4. The verification-harness shape is established at `/website/scripts/verify-reason-rag.ts` and can be adapted.

After this session, two production user-facing routes read Layer 1 from the indexed corpus. The PR1 rollout has matured beyond the proof phase into the rollout phase.

## Pre-conditions

1. Founder pushed Sub-session E1's eight artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push (the `/api/reason` quick-depth route now reads Layer 1 from the corpus; if anything broke, it would surface as user-facing latency or 500s).
2. Founder availability for ~1.5–3 hours.

*No knowledge-gap register entries promoted from E1 to E2; the E1 close's open questions are Phase-2 production observation candidates, not session-blocking.*

## Part A — Open under the protocol (cache-driven)

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; the code-elevated row engages by default).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E1-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-REASON-RAG-WIRED-2026-05-04`) — read the "Files touched" + "Open questions" sections in full.
4. `/website/src/app/api/reason/route.ts` — re-read in full. The `loadLayer1WithFallback` function and the `Promise.all` parallelisation are the pattern this session copies.
5. `/website/src/app/api/reason/helpers.ts` — re-read in full. Decide at Step 1 whether E2 imports these directly or whether they get lifted to a shared location.
6. The chosen consumer route's existing source file (per Step 1 below) — read in full to understand the existing context-loading shape being replaced.
7. `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` — ADR-001. Re-read §"Wiring shape" + §"AC-12 narrowness preservation" only.

Confirm at session open per cache:

- **Tier:** code-elevated by default.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** confirm against the cache table — the chosen consumer's existing model (Haiku for quick-depth scoring routes; Sonnet for standard/deep) is unchanged by this session. The new D6 query embedding (OpenAI `text-embedding-3-small`) adds to the per-request cost.
- **Status vocabulary targets:** end-of-session — chosen consumer route's D6/D7 wiring reaches **Wired** then **Verified** (founder runs the adapted harness); Phase-2 pass-1 inventory adds an "E2 consumer" item.
- **KGs engaged at minimum:** KG1 rule 4 (per-request `Map` cache inside route handler — same as E1); KG6 (composition order — engine handles placement per Pattern A2; not a new KG6 surface this session); KG7 only if the consumer writes JSONB.

## Part B — Procedure

### Step 1 — Choose the third consumer route (founder decision)

Candidates surface from the `/api/score-*` family + the assessment routes that share `runSageReason`:

| Candidate | Route | Notes |
|---|---|---|
| **D1** | `/api/score-decision` | Likely most-used scoring route; quick-depth pattern. |
| **D2** | `/api/score-document` | Document-shaped input; may want different mechanism filter. |
| **D3** | `/api/score-scenario` | Scenario-shaped input; long context. |
| **D4** | `/api/score-conversation` | Conversation-shaped input; may want different filter shape. |
| **D5** | `/api/score-social` | Social-decision input. |
| **D6** | `/api/score-iterate` | Iteration-shaped input. |
| **D7** | `/api/score` | The umbrella route. |
| **D8** | `/api/assessment/foundational` | Standard-depth; Sonnet. |
| **D9** | `/api/assessment/full` | Standard-depth; Sonnet. |

The AI proposes one with reasoning at session open; the founder confirms (or overrides) before code is written. **Default recommendation:** the simplest of the score-routes that maps cleanly to quick-depth (likely `/api/score-decision`) — proves the pattern on a second user-facing surface with minimal complexity. Decision recorded in the session's decision-log entry.

### Step 2 — Decide: helpers stay route-local OR lift to shared

`/website/src/app/api/reason/helpers.ts` exposes `getCorpusMechanismsForDepth`, `RETRIEVAL_TOP_K_BY_DEPTH`, and `toBm25OrShape` re-export. E2's chosen consumer needs the same three. Two patterns:

- **Pattern S1 — Import from `/api/reason/helpers`.** Cross-route import; minimal surface change. Acceptable for E2; if E3+ also want them, lift then.
- **Pattern S2 — Lift to `/website/src/lib/rag/helpers.ts` (or similar).** Shared location; both routes import from there. Slight refactor.

Pattern S1 is the lighter-touch first move. The AI recommends S1; founder confirms. Decision recorded.

### Step 3 — Wire D6 + D7 into the chosen consumer

Implement per the established shape (copy from `/api/reason/route.ts`):

- `loadLayer1WithFallback(input, depth, ragCache)` — same signature; same try/catch fallback to `getStoicBrainContext(depth)`.
- Per-request `Map<string, RetrieveResult>` cache declared inside POST handler (KG1 rule 4).
- `Promise.all` parallelisation extending whatever Layer 2 / Layer 3 the chosen consumer already loads.
- Pass `retrievedPassages` to `runSageReason` via spread (`...layer1`).
- Preserve the consumer's existing auth, rate limit, validation, response envelope, distress check.

If the chosen consumer reads Layer 1 differently (e.g., it doesn't use `getStoicBrainContext` directly; or it uses `getStoicBrainContextForMechanisms`), the wiring shape adapts at the AI's recommendation; founder confirms.

Risk: **Elevated**. If the wiring touches anything beyond the Layer 1 swap (e.g., a route-specific custom prompt), reclassify and revisit.

### Step 4 — Founder-performable verification

Two options:

- **Option V1 — Extend `/website/scripts/verify-reason-rag.ts`** with a new fixture set for the chosen consumer. Same harness; one more block.
- **Option V2 — New harness `/website/scripts/verify-<consumer>-rag.ts`** modelled on E1's pattern.

V1 is leaner; V2 is cleaner if the fixture sets diverge meaningfully. AI recommends V1 unless the consumer's input shape forces otherwise; founder confirms.

Verification asserts (same shape as E1):
- **Phase A** — pure helpers (no change if S1; new tests if S2).
- **Phase B** — real Supabase + OpenAI: 3 representative inputs for the chosen consumer; assert non-empty top, every passage's mechanism in filter, every passage carries citation, cache replay.
- **Phase C** — comparison axis: OLD path vs NEW path Layer 1 character counts + 200-char previews.

### Step 5 — Append decision-log entry

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Cross-reference E1's entry + ADR-001.

### Step 6 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory: add "E2 consumer wired" alongside the E1 entry.

### Step 7 — Next-session prompt (Sub-session E3 or E-final)

Per the live readiness inventory at session close. After E2, the rollout has wired Candidate C + Candidate A + the E2 chosen route (3 of N consumers). The founder decides whether to continue rolling out additional `/api/score-*` consumers in E3 or to pause the rollout and proceed to other priorities.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + E1 route re-read + chosen consumer's source read | 15–25 min |
| Step 1 consumer choice + Step 2 helpers location + Step 4 harness option | 15–25 min |
| Step 3 wiring (lighter than E1 — engine already extended) | 30–60 min |
| Step 4 founder-performable verification | 20–40 min |
| Steps 5–7 (decision-log + close + E3 prompt) | 25–40 min |
| **Total** | **~1.5–3 hours** |

## Rollback path

- Wiring breaks the chosen consumer: `git revert` of the wiring commit restores prior behaviour. Engine + E1's wiring + helpers all remain untouched.
- Output regression at the chosen consumer: revert OR add a feature flag (Critical risk — defer unless necessary).
- The `loadLayer1WithFallback` pattern's try/catch fallback means runtime retrieval failures don't break user-facing responses — they fall back to compiled-string Layer 1 silently. Failure rate observable via server-side `console.warn`.

## Forecast

**On clean completion:** two user-facing routes (Candidate A + E2 choice) plus the internal Candidate C route all wired; pattern proven across diverse consumer shapes. The engine's additive `retrievedPassages` parameter has been exercised by 3 callers without breaking the 21 remaining string-only callers. Phase-2 pass-1 readiness inventory records the third rollout consumer.

**Next-next session (E3 or E-final):** founder's call. If the rollout continues, E3 is the fourth consumer and follows the same shape. If the rollout pauses, the next priority is determined by the founder per the project instructions' Priority sequence. The pattern is mature enough that a non-AI engineer could read ADR-001 + this prompt + the existing wired routes and continue the rollout independently.

End of prompt.
