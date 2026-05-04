# Next-Session Prompt — Sub-session E5: /api/score-document deep-depth wiring via Pattern A1 (Group B first consumer)

**Stream:** founder.
**Tier:** code-elevated.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E4-close.md`.
**Predecessor decision-log entries:** `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04`; `D-CONSUMER-WIRING-LIFT-2026-05-04`; `D-SCORE-RAG-WIRED-2026-05-04`; `D-REASON-RAG-WIRED-2026-05-04`; `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04`.
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality). Critical Change Protocol NOT engaged.

## Why this session matters

After E4, all five consumers in Group A are wired with Pattern A2 on the shared substrate (`/lib/rag/helpers.ts` + `/lib/rag/load-layer1-with-fallback.ts`). E5 introduces **Pattern A1** — direct injection of the formatted passage block into the route's own `client.messages.create` system message array, bypassing the engine. Pattern A1 is ADR-001's deferred dimension. The session opens with the AI proposing an **ADR-001 amendment** describing Pattern A1; the founder approves the amendment before any wiring begins. After approval, `/api/score-document` deep depth is wired via Pattern A1.

After E5, the rollout has both pattern dimensions proven on real consumers — Pattern A2 (engine-managed; five consumers) and Pattern A1 (route-managed; one consumer). E6 then wires the second Group B consumer (`/api/score-scenario` — to be confirmed at E5 session open) using Pattern A1 against the now-amended ADR-001.

## Pre-conditions

1. Founder pushed Sub-session E4's five artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Founder ran the E4 harness independently and confirmed `SUMMARY: 75 / 75 checks passed`. (Verifies the E4 wiring introduced no regression on the shared substrate before E5 builds a new pattern dimension on top.)
3. Founder availability for ~2.5–3.5 hours. (Heavier than E4 due to ADR amendment + new pattern dimension + bespoke harness shape.)

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; `code-elevated` row engages).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E4-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-SCORE-SOCIAL-RAG-WIRED-2026-05-04`) — read in full; previous entry (`D-CONSUMER-WIRING-LIFT-2026-05-04`) — re-read §"Files touched" + §"Open questions" only.
4. `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` — re-read in full. Pay particular attention to §"Pattern A2" + §"Pattern A1 (deferred)". This is the document that gets amended at the start of this session.
5. `/website/src/app/api/score-document/route.ts` — read in full. Note: this route calls `client.messages.create` directly (not `runSageReason`); Layer 1 currently lands as the second system block via `getStoicBrainContext('deep')`; cache_control on the first system block (`scoringPrompt`); deep depth via `MODEL_DEEP`; max_tokens depends on `mode` ('policy' = 3072, default = 2048); already passes R20a distress check.
6. `/website/src/lib/rag/load-layer1-with-fallback.ts` — re-read; the wrapper Group A uses. E5 may produce a sibling wrapper for Pattern A1, or extend the existing wrapper's return shape — design decision at session open.
7. `/website/src/lib/sage-reason-engine.ts` — read the `formatRetrievedPassagesAsBlock` export only (the function that turns `RetrievedPassage[]` into the system-message string). Pattern A1 calls this directly.
8. `/website/scripts/verify-reason-rag.ts` — re-read the V2 `runConsumerWiringPhase` helper. E5's harness extension is bespoke (Pattern A1 isn't engine-mediated, so `runConsumerWiringPhase` may not apply directly — design at session open).

Confirm at session open per cache:

- **Tier:** code-elevated.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** confirm against the cache table — `/api/score-document` runs at deep depth with `MODEL_DEEP`; per the cache row "Standard / deep assessment → Sonnet". This matches AC1 + the existing route. Document model selection in the entry.
- **Status vocabulary targets:** end-of-session — ADR-001 amended (Pattern A1 section moves from "deferred" to "adopted"); `/api/score-document` deep-depth Layer 1 wiring → **Wired** then **Verified** (founder runs the harness — extended with Phase G, shape TBD); harness Phase G → **Wired** pre-run, **Verified** on harness pass; Phase-2 pass-1 inventory adds an "E5 consumer" item.
- **KGs engaged at minimum:** KG1 rule 4 (per-request `Map` cache) + KG6 (composition order — Pattern A1 places the formatted block in the route's own system array, position TBD per amendment).

## Part B — Procedure

### Step 1 — Propose ADR-001 amendment + confirm consumer + path

The AI produces a draft ADR-001 amendment as the first deliverable of the session. The amendment must address:

1. Pattern A1's wiring shape — where the formatted passage block lands in the route's system array (replace `stoicBrainContext` second-block; preserve `cache_control` on first block which is the scoring prompt).
2. KG6 composition order under Pattern A1 — the route makes the placement decision; the formatted block should land in the same logical slot as the predecessor `getStoicBrainContext('deep')` (second system block, no cache_control since content varies per request).
3. AC-12 narrowness — Pattern A1 introduces no new LLM call; the existing `client.messages.create` is unchanged in count, only its system blocks change. AC-12 narrowness preserved.
4. Fallback semantics — same as Pattern A2: try/catch around D6 + D7 + format step; on failure, fall back to `getStoicBrainContext('deep')`; logged via `console.warn`.
5. Cache shape — per-request `Map<string, RetrieveResult>` declared inside POST (KG1 rule 4); same as Pattern A2.
6. Wrapper choice — open question at amendment time: extend `loadLayer1WithFallback` to return a third shape (`{ retrievedPassagesBlock: string }`) suitable for Pattern A1 callers, OR introduce a sibling wrapper `loadLayer1BlockWithFallback`. Founder decides at the amendment review.

Founder reads the proposed amendment + confirms/overrides:

- **Amendment approved as drafted.** Proceed to Step 2.
- **Amendment with changes.** Founder names the changes; AI redrafts; founder re-reviews.
- **Amendment rejected.** Pause E5; revisit at a later session.

Default plan: amendment approved as drafted; proceed to Step 2.

Also confirm at session open:
- **E5 = `/api/score-document` deep depth.** (Default; alternative is `/api/score-scenario` if founder prefers.)
- **E6 = the other Group B consumer.** Names the second consumer and locks the rollout end.

Risk reclassification check: any of the amendment's points (1–6) that touch auth, session, encryption, R20a perimeter, deletion, or deployment configuration would reclassify upward to Critical. Default expectation: none of (1–6) touch those surfaces; Elevated remains.

### Step 2 — Wire `/api/score-document` per Pattern A1 (per amendment)

Implement per the approved amendment. Expected shape (subject to amendment review):

1. Add imports: `type RetrieveResult` from `@/lib/rag`; the chosen wrapper from `@/lib/rag/...` (per Step 1's wrapper-choice decision).
2. Inside POST: declare `const ragCache = new Map<string, RetrieveResult>()` (KG1 rule 4 — never module-level).
3. Add D6 + D7 retrieval + format step (or call the new wrapper) at deep depth. The result is either a formatted block string (success path) or the compiled-string path (fallback).
4. Replace the `system: [..., { type: 'text', text: stoicBrainContext }]` second block's text source from `stoicBrainContext` (currently `getStoicBrainContext('deep')`) to the wrapper's output.
5. Update the route's header comment with E5 wiring documentation referencing the amended ADR-001 + this session's decision-log entry.
6. Compile check: `npx tsc --noEmit -p .` (must be clean).

Risk: Elevated. If the wiring touches anything beyond the Layer 1 source swap (e.g., changes to the scoring prompt cache_control, the user-message construction, or the model selection), reclassify and revisit.

### Step 3 — Extend the harness with Phase G (bespoke shape — design at session open)

Pattern A1 doesn't go through `runSageReason`, so the V2 `runConsumerWiringPhase` helper's comparison axis (which compares OLD `getStoicBrainContext` vs NEW `formatRetrievedPassagesAsBlock` output) still applies, but the consumer-attribution semantics shift. Design choices at session open:

- **Option G1.** Reuse `runConsumerWiringPhase('G', 'deep', ...)` with `consumerDescription: '/api/score-document deep-depth wiring (E5; Pattern A1)'`. Re-tests the substrate at deep depth (same as Phase E for `/api/score-conversation`). Marginal value (substrate continuity); 16 additional checks; 75 → 91.
- **Option G2.** Bespoke Pattern-A1 phase: assert that the formatted-block string is non-empty + contains the `STOIC BRAIN — RETRIEVED PASSAGES` header + every `[<source_citation>]` in expected positions. Tests the route's system-array construction at the function-call boundary, not via HTTP. Different shape from Phase B/D/E/F.
- **Option G3.** Both: G1 for substrate continuity + G2 for Pattern-A1-specific surface. Total ~30 additional checks; ~105.

Default plan: Option G3 (most coverage; modest cost). Founder decides at session open.

### Step 4 — Founder-performable verification

Founder runs from Mac Terminal:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx -y tsx scripts/verify-reason-rag.ts 2>&1 | tee ../operations/migrations/2026-05-XX-verify-reason-rag-output-E5.log
```

Expected: `SUMMARY: N / N checks passed` (N depends on Step 3 option; e.g., 91 for G1, ~89 for G2 alone, ~105 for G3) followed by `ALL CHECKS PASSED`. AI states the expected number explicitly in the decision-log entry once the option is chosen.

### Step 5 — Append decision-log entry

Two entries this session (or one combined entry — AI's call):

- Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".
- Entry name candidates: `D-ADR-001-AMENDMENT-PATTERN-A1-2026-05-XX` (the amendment) and `D-SCORE-DOCUMENT-RAG-WIRED-2026-05-XX` (the wiring). One combined entry titled `D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-XX` is also acceptable if the AI chooses brevity.
- Cross-reference E4's entry (Group A complete) + ADR-001 (the document amended).

### Step 6 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory with "E5 consumer wired (`/api/score-document` Group B first member; Pattern A1 first surface)".

### Step 7 — Next-session prompt

E6 — the second Group B consumer (default `/api/score-scenario`; confirm at E5 session open) deep depth via Pattern A1 against the now-amended ADR-001. The session is lighter than E5 (no ADR amendment work); shape mirrors E4 in scope but uses Pattern A1.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-001 + `/api/score-document` source read | 25–40 min |
| Step 1 — ADR-001 amendment draft + founder review + consumer/path confirmation | 30–50 min |
| Step 2 — wiring per amendment | 30–50 min |
| Step 3 — harness Phase G (G1 + G2 if Option G3 chosen) | 30–60 min |
| Step 4 — founder-performable verification | 25–50 min |
| Steps 5–7 (decision-log + close + next-session prompt) | 30–50 min |
| **Total** | **~2.5–3.5 hours** |

## Rollback path

Two layers:

1. **ADR-001 amendment rollback.** If the amendment turns out to be flawed, the prior version is recoverable from git history. The amendment itself doesn't change runtime behaviour; only documentation.
2. **Wiring rollback.** `git revert` of the wiring commit removes (1) `/api/score-document`'s D6/D7 + format call site (restoring the prior `getStoicBrainContext('deep')` source for the second system block), and (2) the harness Phase G. The shared wrapper (if extended) needs the extension reverted separately if the wrapper change was a separate commit. The route's `client.messages.create` shape (system array, model, max_tokens) is unchanged by E5; only the source of the second-block text changes.

The try/catch fallback inside the new wrapper (or the route, depending on amendment) means runtime retrieval failures don't break user-facing responses — they fall back to the compiled-string path silently.

## Forecast

**On clean completion:** Pattern A1 introduced via ADR-001 amendment; six consumers Verified. Group B has its first member wired (`/api/score-document`). Phase-2 pass-1 readiness inventory records both pattern dimensions proven on real consumers — Pattern A2 (engine-managed; five consumers) + Pattern A1 (route-managed; one consumer).

**Next-next session:** E6 — second Group B consumer (default `/api/score-scenario`) deep depth via Pattern A1. Session is lighter than E5 (no ADR amendment); shape mirrors E4 in scope.

End of prompt.
