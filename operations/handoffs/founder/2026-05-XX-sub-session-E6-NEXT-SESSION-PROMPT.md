# Next-Session Prompt — Sub-session E6: /api/score-scenario wiring via Pattern A1 (Group B second consumer)

**Stream:** founder.
**Tier:** code-elevated.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E5-close.md`.
**Predecessor decision-log entries:** `D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04`; `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04`; `D-CONSUMER-WIRING-LIFT-2026-05-04`; `D-SCORE-RAG-WIRED-2026-05-04`; `D-REASON-RAG-WIRED-2026-05-04`; `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04`.
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality). Critical Change Protocol NOT engaged.

## Why this session matters

After E5, Pattern A1 is specified in ADR-001 and proven on its first surface (`/api/score-document` deep depth). E6 wires the second Group B consumer (`/api/score-scenario`) under the same pattern. There is **no ADR amendment work** at E6 — Pattern A1's specification is already adopted; E6 is execution-only against the now-amended ADR-001. After E6, the rollout has both pattern dimensions proven on multiple surfaces and the four-consumer Pattern A2 + two-consumer Pattern A1 wiring arc is complete for `/api/score-*`.

There is one design fork that needs founder confirmation at session open: `/api/score-scenario` has **two** `client.messages.create` call sites (a GENERATION call at `quick` depth / `MODEL_FAST` and a SCORING call at `deep` depth / `MODEL_DEEP`). Both currently use `getStoicBrainContext(<depth>)` for Layer 1. The session opens with the AI reading the route and surfacing the dual-call-site question explicitly; the founder confirms scope before any wiring.

## Pre-conditions

1. Founder pushed Sub-session E5's seven artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Founder ran the E5 harness independently and confirmed `SUMMARY: 107 / 107 checks passed`. (Verifies E5 introduced no regression on the shared substrate and that Pattern A1's first surface is solid before the second is added.)
3. Founder availability for ~1.5–2.5 hours. (Lighter than E5 — no ADR amendment work, no new substrate; mostly route changes + harness Phase H + verification.)

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; `code-elevated` row engages).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E5-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04`) — read in full.
4. `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` — re-read §"Pattern variants (named retrospectively)" + §"Pattern A1 specification" + the two strike-through entries in "What this ADR does not decide". This is the document Pattern A1 is now specified in; no further amendment expected at E6.
5. `/website/src/app/api/score-scenario/route.ts` — **read in full** (likely ~300+ lines; two `client.messages.create` call sites; the GENERATION call near line 104, the SCORING call near line 233 per the route's existing header comment). Confirm:
   - Which call sites use `getStoicBrainContext(<depth>)` and at what depth.
   - Whether each call site already passes the R20a distress check.
   - Whether `cache_control: { type: 'ephemeral' }` is on the first system block of each call (E5 confirmed this is the cache anchor; the second-block source swap doesn't affect it).
   - The route's existing `Promise.all` shape for L2 + L3 loads (the wiring follows the same shape as E5 — extend `Promise.all` to include L1 via the sibling wrapper).
6. `/website/src/lib/rag/load-layer1-block-with-fallback.ts` — re-read; the sibling wrapper E5 introduced. The wrapper is unchanged at E6.
7. `/website/src/app/api/score-document/route.ts` — re-read the wired call site (around the `Promise.all` after the `truncated` declaration). E6 mirrors this shape per call site.
8. `/website/scripts/verify-reason-rag.ts` — re-read Phase G (G1 + G2). Phase H likely mirrors G1's substrate-continuity shape with depth(s) determined by the founder's call at session open re scope.

Confirm at session open per cache:

- **Tier:** code-elevated.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** confirm against the cache table — `/api/score-scenario`'s GENERATION call uses `MODEL_FAST` (Haiku, per cache row "Quick-depth assessment" — single-mechanism); SCORING call uses `MODEL_DEEP` (Sonnet, per cache row "Standard / deep assessment"). Both match AC1 + the existing route. No change.
- **Status vocabulary targets:** end-of-session — `/api/score-scenario` Layer 1 wiring (per scope confirmed at session open) → **Wired** then **Verified**; harness Phase H → **Wired** pre-run, **Verified** on harness pass; Phase-2 pass-1 inventory adds an "E6 consumer" item (with note on call-site count).
- **KGs engaged at minimum:** KG1 rule 4 (per-request `Map` cache; ONE cache shared across BOTH call sites if both are wired — the cache key includes input + filter shape, so the two call sites' different inputs/depths produce different cache keys and don't collide); KG6 (composition order — Pattern A1 places the formatted block in each call site's own system array as the second block).

## Part B — Procedure

### Step 1 — Confirm scope (the dual-call-site fork)

The AI surfaces the design fork as the first question of the session and asks the founder to confirm **one** of:

1. **Wire both call sites under Pattern A1.** Both GENERATION (quick) and SCORING (deep) get the sibling wrapper. Two wrapper invocations from a single shared `Map<string, RetrieveResult>` cache. Maximum coverage; consistent within the route.

2. **Wire SCORING only, leave GENERATION on the compiled-string path.** Reasoning: GENERATION is creative output (not evaluative); the LLM benefits from a stable Layer 1 (caching is more effective; the user's input there is a label like "child" + a topic, not the prose-rich evaluative input the corpus was indexed against; retrieval may not produce relevant passages). Lower coverage; pragmatic.

3. **Wire GENERATION only, leave SCORING on the compiled-string path.** Unlikely choice; would invert the value proposition. Mention only for completeness.

The AI's recommendation at the time of writing this prompt: **Option 2 (SCORING only).** Reasoning: GENERATION's input shape (audience level + topic seed) doesn't match the corpus's mechanism-tagged passages in the same way SCORING's input (the user's response to the scenario) does. Retrieved passages on a generation prompt may be irrelevant or actively misleading for creative output. Option 1 maximises coverage but pays a per-request retrieval cost on every generation call for marginal value. The founder may override with reasoning.

Risk reclassification check: nothing in either call site touches auth, session, encryption, R20a perimeter, deletion, or deployment configuration. Elevated remains regardless of which option is chosen.

### Step 2 — Wire `/api/score-scenario` per the confirmed scope

Implement per the founder's Step 1 confirmation. Per call site wired:

1. Add imports (top of file): `type RetrieveResult` from `@/lib/rag`; `loadLayer1BlockWithFallback` from `@/lib/rag/load-layer1-block-with-fallback`. Remove `getStoicBrainContext` import only if no remaining call site uses it (Option 1 removes; Option 2 keeps for the GENERATION call).
2. Inside POST: declare `const ragCache = new Map<string, RetrieveResult>()` (KG1 rule 4 — never module-level). One cache for the whole request even if both call sites are wired.
3. For each wired call site: replace the `text: getStoicBrainContext(<depth>)` second-block source with `text: <wrapped-output>` where `<wrapped-output>` is the result of `await loadLayer1BlockWithFallback(<input>, <depth>, ragCache, '/api/score-scenario:<call-site-label>')`. The route name passes the call-site label (e.g., `:scoring` or `:generation`) so the `console.warn` on fallback can attribute correctly.
4. The `client.messages.create` shape is unchanged for each call site — only the source of the second-block text changes.
5. Update the route header comment to document Pattern A1 wiring + cite the amended ADR-001 + `D-SCENARIO-RAG-WIRED-2026-05-XX` (or paired entries).
6. Compile check: `npx tsc --noEmit -p .` (must be clean).

Risk: Elevated. If the wiring touches anything beyond the Layer 1 source swap on the chosen call site(s), reclassify and revisit.

### Step 3 — Extend the harness with Phase H

Phase H mirrors Phase G's structure. Two sub-phases:

- **H1 (substrate continuity).** One additional `runConsumerWiringPhase` call. Depth depends on Step 1 scope: if Option 1, run two sub-calls (H1a at quick, H1b at deep); if Option 2, run one sub-call at deep; if Option 3, run one sub-call at quick. Each adds 16 checks. Default Option 2 = 16 checks.
- **H2 (Pattern A1 wrapper surface for /api/score-scenario).** Bespoke block invoking `loadLayer1BlockWithFallback` with the depth(s) wired. Same five-assertion shape as G2: non-empty + header + bracketed citation + ceiling + parity-with-direct-format. Plus 1 cache replay per depth. Per depth = 16 checks. Default Option 2 (deep only) = 16 checks.

Default total Phase H (Option 2) = 32 checks. Total harness 107 → 139.

If Option 1 is chosen, total Phase H = 64 checks (2× depth coverage); total harness 107 → 171.
If Option 3 is chosen, total Phase H = 32 checks at quick depth; total harness 107 → 139.

The AI should compute the exact expected total and state it in the decision-log entry once scope is confirmed.

### Step 4 — Founder-performable verification

Founder runs from Mac Terminal:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx -y tsx scripts/verify-reason-rag.ts 2>&1 | tee ../operations/migrations/2026-05-XX-verify-reason-rag-output-E6.log
```

Expected: `SUMMARY: N / N checks passed` (N = 139 default; 171 if Option 1; 139 if Option 3) followed by `ALL CHECKS PASSED`. The AI states the expected number explicitly in the decision-log entry once the option is chosen.

### Step 5 — Append decision-log entry

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

Entry name: `D-SCENARIO-RAG-WIRED-2026-05-XX`. Single entry — no governance-document amendment this session.

Cross-reference E5's entry (`D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04`) + ADR-001 (the now-amended document the wiring follows verbatim).

### Step 6 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory with "E6 consumer wired (`/api/score-scenario` Group B second member; Pattern A1 second surface; <call-site-count> call site(s) wired per Step 1 confirmation)".

### Step 7 — Next-session prompt

The PR1 rollout for the `/api/score-*` family is complete after E6. The next session is **not** another consumer wiring; it is the founder's call between several candidates:

- **`/api/score-decision` loop-pattern wiring.** Multi-option design dimension previously deferred. Has its own ADR-002 candidate.
- **`/api/reason/helpers.ts` shim removal.** Standard-risk cleanup (continuity item from E3 onwards).
- **`/api/score-social` route metadata fix.** Standard-risk fix (continuity item from E4).
- **Move to a non-rollout Priority sequence item per project instructions.** Capability-matrix work, ethical safeguards, etc.

The E6 next-session prompt the AI writes will surface these candidates and ask the founder to choose at the close of E6.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-001 + `/api/score-scenario` source read | 20–35 min |
| Step 1 — scope confirmation (dual-call-site fork) | 10–20 min |
| Step 2 — wiring per scope | 20–40 min |
| Step 3 — harness Phase H (H1 + H2 per scope) | 25–50 min |
| Step 4 — founder-performable verification | 20–40 min |
| Steps 5–7 (decision-log + close + next-session prompt) | 25–40 min |
| **Total** | **~1.5–2.5 hours** |

## Rollback path

Single layer: `git revert` of the E6 wiring commit removes (1) the `/api/score-scenario` route's wired call site(s), restoring the prior `getStoicBrainContext(<depth>)` source for the affected second system block(s), and (2) the harness Phase H. The sibling wrapper (`load-layer1-block-with-fallback.ts`) and the ADR-001 amendment are untouched at E6. The wrapper's try/catch + empty-result guard means runtime retrieval failures don't break user-facing responses — they fall back to the compiled-string path silently. ADR-001 is unchanged at E6.

## Forecast

**On clean completion:** Pattern A1 second surface wired. Group B complete. Seven consumers Verified-in-place across the rollout (Candidate C internal + 4 Pattern A2 user-facing + 2 Pattern A1 user-facing). Phase-2 pass-1 readiness inventory records the `/api/score-*` family-wide PR1 rollout as complete.

**Next-next session:** Founder's choice — see Step 7 above.

End of prompt.
