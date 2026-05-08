# Next-Session Prompt — Sub-session M1-CP6: Cutover — `/api/reason` switches to translation-sandwich

**Stream:** founder.
**Tier:** code-critical (with optional governance lead-in — see Pre-conditions §3 below).
**Governing frame:** /adopted/standing-protocol-cache.md (operative reference); the Critical Change Protocol (project instructions §0c-ii) governs this session in full — the cache supplements but does not replace the full protocol for code-critical sessions.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-08-return-to-M1-CP5-prime-prime-close.md`.
**Predecessor decision-log entries:** `D-RETURN-TO-M1-CP5-PRIME-PRIME-RUBRIC-REFRESH-2026-05-08` (this session's authorisation — Branch A elected; 39/40 prose verdict; hard miss closed; F4 soft miss accepted as known limitation post-cutover); `D-M1-CP5f-LAYER3-AMENDMENT-4-2026-05-07` (the Layer 3 module + ADR-007 state being made user-facing); `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` (the seven Revisions adopted — the prose-template foundation cutover commits to).
**Risk classification:** **Critical under 0d-ii.** This is the cutover commit per ADR-004 §10 row M1-CP6. Engages: AC5 (R20a perimeter preservation), AC7 (standing-Critical surface — the route's authentication/distress check is touched at the perimeter; the cutover commit must preserve `enforceDistressCheck` invocation at line 144), AC4 (invocation testing for safety functions), PR6 (safety-critical changes are always Critical risk). External API consumers see breaking schema change per A-2 full redesign — R10 announcement required at least 14 days before cutover per ADR-004 §10. **Critical Change Protocol (project instructions §0c-ii) applies in full.**

## Why this session matters

This is the M1 arc completion. Three rubric refreshes (RTM1-CP5 → RTM1-CP5-prime → RTM1-CP5-prime-prime) confirmed the translation-sandwich engine is ready to become the sole user-facing path on `/api/reason`. The Layer 3 module is Verified at 39/40 prose micro-checks with the F4 soft miss accepted as a known limitation. The cutover commit removes the bundled-depth call from the route; translation-sandwich becomes the sole user-facing path; the bundled engine remains in `/website/src/lib/sage-reason-engine.ts` as scaffolding for M2/M3/M4 consumers. After cutover: Layer 3 module status moves from **Verified** → **Live**; M1 arc completes; M2 (next consumer migration — `/api/journal/...` or `/api/mentor/...`) becomes the next major arc.

The risks are real and named: external agent developers consuming `/api/reason` will see the schema change at cutover (the response shape moves from bundled `{ result, meta }` to sandwich `{ version, extraction, assessment, prose, meta }` per ADR-004 §2.1). The R20a perimeter must be preserved (the `enforceDistressCheck` call at line 144 fires before any engine; this is non-negotiable per AC5). The cutover is reversible via `git revert` but the schema revert is itself a breaking change going the other way — public communication required if rollback occurs.

## Pre-conditions

1. **All M1-CP5 + M1-CP5-prime + M1-CP5-prime-prime files committed and pushed.** Vercel green; production behaviour unchanged (parallel-run dormant in production per ADR-004 §6.3 until this cutover commits).
2. **F4 soft miss accepted as known-limitation post-cutover.** Captured in the predecessor decision-log entry (D-RETURN-TO-M1-CP5-PRIME-PRIME-RUBRIC-REFRESH-2026-05-08); founder reaffirms at session-open if conditions have changed.
3. **R10 announcement status — load-bearing election at session-open.** Per ADR-004 §10 the deprecation notice + migration guide for `/api/reason` API consumers must be published **at least 14 days before cutover**. Founder elects at session-open one of:
   - **3a — Run M1-CP6 as the announcement-only sub-session.** Downscale to Elevated tier (under 0d-ii: changes to existing user-facing functionality — the docs page acquires a deprecation banner; the API endpoint itself is untouched). Draft + publish R10 announcement + migration guide. Start the 14-day window. The actual cutover commit is deferred to a subsequent session at least 14 days hence.
   - **3b — R10 announcement was already published 14+ days ago.** Confirm date + cite the announcement artefact (URL or file path). Proceed with the full Critical-tier cutover commit per Part B Steps 4–9 below.
   - **3c — Skip R10 (no external agent developers known).** Founder explicitly declines R10 on the grounds that no external consumers exist (e.g., the only known consumer is sagereasoning.com itself). Document the reasoning in the decision-log entry. Proceed with the full Critical-tier cutover commit. **Note: this is a deliberate trade-off** — if external consumers do exist (the agent_card.json + llms.txt agent discovery surface implies some), they are not warned. AI flags the trade-off; founder owns the call.

   The AI does not pre-decide between 3a / 3b / 3c — this is an explicit founder election at session-open per the project instructions' decision-authority preferences.
4. **Cache + predecessor close + decision-log + ADR-004 §10 (CP6 row) + ADR-007 (full state post-Amendment 4) + parallel-run.ts + /api/reason/route.ts read at session-open.** Particular attention to ADR-004 §6.3 (failure isolation guarantee — preserved through cutover via the route's catch path returning a fallback), §8 (R20a perimeter preservation), §9 (fallback semantics — preserved post-cutover), §10.2 CP6 row (rollback path).
5. **Founder available for full Critical Change Protocol approval cycle.** This is non-negotiable per project instructions §0c-ii — the founder must explicitly approve the cutover specific to the named risks before the deployment-config change is made.
6. **Schema-vs-prompt drift carry-forward applies (Q5, 2nd recurrence).** Before issuing any SQL or path reference, verify against the relevant migration files + module source + Supabase clock per the strengthened standing process improvement.
7. **Founder has 14-day calendar slot booked for the R10 lead time** (if 3a is elected). The cutover commit subsequent session is gated on this window completing.

## Critical Change Protocol — required before cutover deployment

Per project instructions §0c-ii. AI completes these visibly in the conversation before the founder approves the cutover commit:

1. **What is changing — plain language.** "The /api/reason endpoint will stop using the bundled-depth engine and start using the translation-sandwich engine for the user-facing response. From the user's point of view: when they hit /api/reason, they receive a response with a different shape — the new shape carries explicit Layer 1 extraction + Layer 2 deterministic assessment + Layer 3 prose, instead of the bundled-depth single-call shape. The bundled engine code remains in the codebase for use by other endpoints (M2/M3/M4); it just stops being called from /api/reason."
2. **What could break — specific worst case.** Named risks: (a) external agent developers parsing `/api/reason` responses against the bundled-depth shape will see breaking change at cutover — their parsers fail on the new shape; (b) the route's distress-check perimeter at line 144 must remain inviolate (AC5 + PR6) — a wiring error could allow the engine to be called before the perimeter fires; (c) Layer 1 / Layer 3 LLM failures during cutover are routed through the existing fallback path (ADR-004 §9) — but if the fallback wiring is wrong, users see errors instead of fallback prose; (d) the F4 soft miss persists post-cutover — known acceptable per founder's Branch A election.
3. **What happens to existing sessions.** Auth/session unaffected — the cutover does not touch authentication, session cookies, or session-bridge state. The translation-sandwich engine sits POST-perimeter (per ADR-004 §8); existing user sessions continue with the new response shape on subsequent /api/reason calls. No session invalidation required.
4. **Rollback plan.** `git revert` of the cutover commit + push to main. Vercel rebuild restores bundled-depth as user-facing path. **Rollback is itself a breaking change going the other way** for any external consumers who adopted the new schema during the cutover window — this is why R10 announcement matters. If rollback occurs, founder publishes a "rollback in effect" notice. Verification step: hit `/api/reason` post-rollback; expect bundled-depth shape (`{ result: { katorthoma_proximity, ... }, meta }`) in the response.
5. **Verification step (founder-performable).** After cutover commit + push + Vercel green:
   - Hit `/api/reason` via `/admin/test-reason` with one fixture (e.g., F2 — the row whose hard-miss closure was the load-bearing test). Confirm response carries the new translation-sandwich shape (`{ version: 'translation-sandwich-v1', extraction: {...}, assessment: {...}, prose: {...}, meta: {...} }`) — NOT the bundled-depth shape (`{ result: {...}, meta: {...} }`).
   - Confirm `prose.philosophical_reflection` + `prose.improvement_guidance` + `prose.summary` populated.
   - Confirm assessment-side fields (`assessment.passion_diagnosis`, `assessment.kathekon_assessment`, `assessment.iterative_refinement.direction_of_travel`, `assessment.katorthoma_proximity`) are sourced from Layer 2's deterministic engine, not from the bundled engine's LLM output.
   - Confirm R20a perimeter still fires: hit `/api/reason` with a distress-flagged input (predecessor harness has a distress fixture); confirm the redirect response is returned WITHOUT either engine being called (per AC5).
   - Confirm no errors in Vercel logs around cutover commit deploy.
6. **Explicit founder approval specific to named risks.** Founder confirms — using the exact form "OK, proceed with cutover" or equivalent — having read the named risks (especially the R10 / external-consumer risk if 3c was elected). Approval is for THIS commit, not blanket approval for the M1 arc.

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min — confirms tier code-critical, full protocol form, model selection, status vocabulary, signals).
2. **Project instructions §0c-ii — Critical Change Protocol** (~2 min — the six-step protocol must be visible in this session's conversation).
3. **`/operations/handoffs/founder/2026-05-08-return-to-M1-CP5-prime-prime-close.md`** (~5 min — predecessor close; Branch A election authorisation; status changes).
4. **`/operations/decision-log.md` last 3 entries** — `D-RETURN-TO-M1-CP5-PRIME-PRIME-RUBRIC-REFRESH-2026-05-08` (verdict + Branch A election); `D-M1-CP5f-LAYER3-AMENDMENT-4-2026-05-07` (the Layer 3 module state being shipped); `D-RETURN-TO-M1-CP5-PRIME-RUBRIC-REFRESH-2026-05-07` (predecessor verdict context).
5. **`/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md`** §6 (cutover mechanics) + §8 (R20a perimeter preservation) + §9 (fallback semantics) + §10 (checkpoint table — CP6 row + §10.2 CP6 rollback row) — read in full.
6. **`/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md`** §3 + Amendment + Amendment 2 + Amendment 3 + Amendment 4 — read in full (the cumulative Layer 3 spec being made user-facing).
7. **`/website/src/lib/translation-sandwich/parallel-run.ts`** — read in full. The `runParallelSandwich` function becomes load-bearing for the cutover (the orchestrator is what the route will now call).
8. **`/website/src/app/api/reason/route.ts`** — read in full. This is the file the cutover commit modifies. Particular attention to: line 144 (distress check perimeter — must be preserved verbatim); the bundled-depth call site (which the cutover removes); the response composition (which the cutover changes from bundled-shape to sandwich-shape).
9. **`/manifest.md`** — re-read **AC5 + AC7 + R10 + R20a + R0** in full per the cache's Element 2 guidance for code-critical sessions.

Confirm at session open per cache + governance protocol:

- **Tier:** `code-critical` (or downscaled to `code-elevated` if 3a — announcement-only — is elected). State the election + reasoning.
- **Hold-point:** P0 0h active; M1-CP6 cutover does not exit P0 (M1 arc completion is a step within P0; P1 follows independently per project instructions §P0 → §P1).
- **Model selection:** Sonnet retained for Layer 1 + Layer 3 per AC1 + cache Element 6. No model change at cutover.
- **Status vocabulary:** Layer 3 module currently *Verified* (39/40); after cutover commit + verified-in-production: *Live*. ADR-007 + ADR-004 currently *Adopted*; remain *Adopted* post-cutover.
- **Engaged rules:** R0, R5, R7, R8a, R8c, R10 (announcement), R20a (preserved through perimeter), AC1, AC4, AC5, AC7, AC8, KG1, KG6, KG7, PR1, PR3, PR4, PR6, PR8 (in-place ADR amendment pattern not engaged this session — cutover commit, not amendment). All AC4/AC5/AC7/PR6 ENGAGED — Critical Change Protocol applies.

## Part B — Procedure

### Step 1 — Election: 3a / 3b / 3c (per Pre-conditions §3)

Founder elects at session-open. AI captures election + reasoning in the decision-log entry to be drafted at Step 9.

If 3a (announcement-only): tier downscales to Elevated. Skip Steps 4–7. Proceed via Steps 2 (announcement drafting) → 3 (publishing) → 8 (decision-log entry capturing the announcement + 14-day window start) → 9 (session close + draft of M1-CP6b cutover next-session prompt).

If 3b or 3c: proceed with full Critical-tier cutover via Steps 2 → 4 → 5 → 6 → 7 → 8 → 9.

### Step 2 — R10 announcement drafting (engaged in 3a + 3b + 3c paths)

For 3a + 3b: draft (or confirm previously drafted) the deprecation notice + migration guide content. Notice content per ADR-004 §10:
- Plain-language summary of the change ("The /api/reason endpoint is migrating from bundled-depth to a new layered engine. The response shape changes — see migration guide.")
- Specific cutover date (14+ days from announcement publication)
- Migration guide: side-by-side mapping of the old shape (`{ result.katorthoma_proximity, result.philosophical_reflection, ... }`) to the new shape (`{ assessment.katorthoma_proximity, prose.philosophical_reflection, ... }`)
- Where to ask questions (founder's contact channel)

For 3c: skip Step 2; document in the decision-log entry that R10 is declined with founder's reasoning.

### Step 3 — R10 announcement publishing (3a + 3b paths only; skipped for 3c)

For 3a: publish the notice + migration guide (founder posts on relevant channels — `/api/reason` docs page, `agent-card.json`, `llms.txt`, any external comms). The 14-day window begins on this publication. Capture the publication date in the decision-log entry. Session ends after Step 9 — actual cutover deferred to a subsequent session at least 14 days hence.

For 3b: confirm the previous publication date and that 14+ days have elapsed. Document in the decision-log entry.

### Step 4 — Cutover commit drafting (3b + 3c paths only)

AI drafts the changes to `/website/src/app/api/reason/route.ts`. Specifically:

- The bundled-depth call (`runSageReason(...)`) is removed from the route's main path.
- The translation-sandwich engine becomes the user-facing call (`runSandwichForHarness` adapted into the route, OR `runParallelSandwich` mode flipped from "parallel observe" to "sole engine").
- The response shape changes from `{ result, meta }` to `{ version, extraction, assessment, prose, meta }` per ADR-004 §2.1.
- The `enforceDistressCheck` call at line 144 is preserved verbatim (AC5 — non-negotiable).
- The fallback path (ADR-004 §9.3) is preserved — Layer 3 LLM failure routes to `generateFallbackProse`; Layer 1 LLM failure returns a structured error with the fallback shape.
- `parallel-run.ts` may need a one-flag change: instead of "parallel observe", the orchestrator becomes the sole path. This may mean refactoring `runParallelSandwich` into `runSandwich` (no bundled-depth coordination) OR keeping `runParallelSandwich` but flipping a config flag — choose at session-open per founder direction; whichever is the simpler diff.
- The comparison-log table (`translation_sandwich_comparisons`) — discussion at session-open: continue writing rows post-cutover for ongoing audit, OR retire the parallel-write since there's no longer a bundled engine to compare against. Founder elects.

AI presents the diff in the conversation BEFORE the founder approves the commit. Diff visible in chat (not just file contents).

### Step 5 — Critical Change Protocol (six steps; visible in the conversation)

AI completes the six-step Critical Change Protocol explicitly in the conversation. Founder reads + responds before Step 6.

### Step 6 — Founder approval specific to named risks

Founder confirms (exact form: "OK, proceed with cutover" or equivalent) having read the named risks. **No deployment without this step.**

### Step 7 — Cutover deployment

After founder approval:
1. AI applies the diff via Edit tool (no Write — the route file is being modified, not created).
2. Founder commits + pushes via Terminal + GitHub Desktop.
3. Vercel rebuilds (~2–3 minutes).
4. Founder runs the Step 5 verification queries from the Critical Change Protocol (hit `/api/reason` via `/admin/test-reason`; verify new shape; verify R20a perimeter still fires on distress input).
5. Founder confirms verification passed; OR initiates rollback per the named rollback plan.

### Step 8 — Append decision-log entry (FULL form for code-critical)

Pattern: per project instructions §0c-ii Critical Change Protocol record + the existing full decision-log template (NOT the lean form). ID: `D-M1-CP6-CUTOVER-2026-05-XX` (date filled at session-execution time). Entry MUST capture: election (3a/3b/3c) + reasoning; full Critical Change Protocol record (six steps verbatim); diff applied (summary + reference to commit hash); verification step results; explicit founder approval record; status changes; rules served + risk classification; cross-references.

For 3a path: entry captures the announcement publication only. Date `D-M1-CP6a-R10-ANNOUNCEMENT-2026-05-XX`.

### Step 9 — Session close (FULL form for code-critical) + draft next-session prompt

Pattern: per the existing full session-close template (NOT lean). Includes the additional sections per the predecessor encryption-wiring close: Verification Method Used (0c framework), Risk Classification Record (0d-ii), PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder.

Next-session prompt:
- **For 3a path:** the next-session prompt is for **M1-CP6b cutover** (the actual cutover commit after the 14-day window). At `/operations/handoffs/founder/2026-05-XX-M1-CP6b-NEXT-SESSION-PROMPT.md` where XX = announcement date + 14 days.
- **For 3b + 3c path:** the next-session prompt is for **post-cutover verification + M2 scoping**. Post-cutover watch items (Q3 F8 SCOPE_AMBIGUITY non-fire investigation; Q4 L3 latency creep monitoring; F4 soft miss tracking; identified_value_errors null audit; causal-stage sample bias monitoring) are captured. M2 (next consumer migration) is scoped at this session or deferred to a separate scoping session per founder election.

## Part C — Anticipated session shape

| Phase | Estimate (3a path) | Estimate (3b/3c path) |
|---|---|---|
| Cache + predecessor close + ADRs + manifest reads | 30–40 min | 30–40 min |
| Step 1 — Election | 5–10 min | 5–10 min |
| Step 2 — R10 announcement drafting | 30–45 min | 0 (3b: pre-existing; 3c: skipped) |
| Step 3 — R10 publishing | 15–20 min | 0 (3b: confirmed pre-existing; 3c: skipped) |
| Step 4 — Cutover commit drafting | — | 60–90 min |
| Step 5 — Critical Change Protocol | — | 20–30 min |
| Step 6 — Founder approval | — | 5–10 min |
| Step 7 — Cutover deployment + verification | — | 30–60 min |
| Step 8 — Decision-log entry (full form) | 30–45 min | 45–60 min |
| Step 9 — Session close (full form) + next-session prompt | 30–45 min | 45–60 min |
| **Total** | **~2.5–3.5 hours** | **~4–5.5 hours** |

For 3a path: ~2.5–3.5 hours; M1-CP6b cutover follows in a subsequent session ~14 days hence (~4–5 hours).
For 3b path: assumes R10 announcement was published 14+ days ago.
For 3c path: assumes founder explicitly declined R10.

## Rollback path

Per ADR-004 §10.2 CP6 row.

For 3a path: rollback = `git revert` of the announcement commit. Removes the deprecation notice. No production impact (announcement-only, no behavior change). 14-day window resets.

For 3b + 3c path: rollback = `git revert` of the cutover commit + push to main. Vercel rebuild restores bundled-depth as user-facing path. **Rollback is itself a breaking change going the other way** for any external consumers who adopted the new schema during the cutover window. If rollback occurs, founder publishes a "rollback in effect" notice. Verification step: hit `/api/reason` post-rollback; expect bundled-depth shape in the response. Comparison-log table (`translation_sandwich_comparisons`) is preserved through rollback (it's a DB write that doesn't reverse with `git revert`).

## Forecast

**3a path (announcement-only):** session lands the R10 announcement; 14-day window begins; M1-CP6b cutover follows ~14 days hence as a separate Critical session.

**3b + 3c paths (full cutover):** session lands the cutover commit; Layer 3 module status moves from **Verified** → **Live**; M1 arc completes. Post-session: M2 scoping becomes the next major arc (likely `/api/journal/...` or `/api/mentor/...`). Watch items carried forward: Q3 (F8 SCOPE_AMBIGUITY non-fire investigation — Layer 1/2 detector concern); Q4 (L3 latency creep watch threshold 20,000 ms); F4 soft miss (track for generalisation); `value_assessment.identified_value_errors` null observation (Layer 2/3 audit); causal-stage sample bias.

The architectural pattern across the M1 arc — Layer 1 extracts, Layer 2 deterministically assesses, Layer 3 produces prose — proven on `/api/reason` becomes the inheritable template for M2 + M3 + M4. The Stoic mechanism application becomes visible, auditable, and revisable per ADR-004's Positive consequences (R0 oikeiosis intent realised at the canonical reasoning step).

End of prompt.
