# Deliverable 24 — Consumer Workflow Audit (R20a Perimeter)

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-01.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** Audit precondition for AC-7 (Phase-1 conversation surface scope) and AC-12 (translation-sandwich architecture). Verifies whether Option 1 (AC-18 scoping correction adopted 2026-05-01) is sufficient across the entire R20a perimeter, or whether further per-surface scoping refinements are needed before Phase-1 session 2 begins.
**Critical path posture:** This deliverable is **not on the critical path** alongside D2/D3/D8. It is a precondition for Phase-1 session 2 (which is blocked on both critical-path approval and this audit). The audit can be drafted while critical-path approval is pending; Phase-1 session 2 cannot begin without both being settled.

**Cross-references:**
- `/manifest.md` AC5 (R20a enforcement perimeter — the eight POST routes named); AC3 (Zone 2 clinical adjacency domains); AC4 (invocation testing for safety functions); R20a–R20d.
- `/operations/handoffs/founder/2026-05-01-rag-phase1-alt3-drafts-close.md` (predecessor session close, including the Option 1 + path-(b) addendum).
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture brief — AC-1 through AC-19).
- `/drafts/rag-mentor-alt3/canonical-framework.md` (Deliverable 2, with Option 1 amendment to Table 4).
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (Deliverable 3).
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (Deliverable 8).
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-2026-05-01, D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29, D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29, D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29.
- `/operations/knowledge-gaps.md` KG3 (hub-label end-to-end contract — directly relevant); KG1, KG2, KG6 (relevant for any flow that traces through context loaders).
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (existing rollback baseline for the conversation surface).
- `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` (founder-hub-scoped reference, parked).

---

## Plain-language summary

The SageReasoning website serves human practitioners through a small set of human-facing tools. Eight specific server routes carry safety wiring (vulnerable-user detection per R20a). Those eight routes are the *R20a perimeter*. The alt-3 architecture eventually replaces or transforms most of these routes' internal reasoning behaviour, so understanding what each one does today — at the workflow level, not just the registry level — is the precondition for designing the Phase-2 builds with confidence.

This audit walks each of the eight perimeter routes end-to-end at the depth of the evening-reflection walkthrough produced in the 2026-05-01 session. For each route the audit captures: what happens on the server, what happens on the page, whether the surface serves more than one practitioner flow on the same code path, whether AC-18 (the no-shareable-artifact constraint) needs to scope to that surface, whether AC-13 (three-tier intake clarification) has a natural trigger condition, whether AC-17 (the two acknowledged residual seams) applies, and how the existing output shape projects onto the canonical framework's 9+1 mechanism set.

The audit is deliberately not a redesign session. Findings and recommendations are surfaced for the founder to review. Design changes follow founder approval; nothing in the alt-3 design (AC-12 through AC-19), in Deliverables 2 / 3 / 8, or in the manifest is edited as a result of this audit alone.

The eight routes per AC5 are:

1. `/api/score` — single-action scorer.
2. `/api/score-decision` — multi-option decision comparator.
3. `/api/score-document` — long-form document evaluator.
4. `/api/score-scenario` — ethical-scenario reasoning practice.
5. `/api/score-social` — pre-publish filter for social posts.
6. `/api/reason` — universal reasoning layer (the engine entry point).
7. `/api/reflect` — public daily-reflection endpoint.
8. `/api/mentor/private/reflect` — founder-only private-mentor reflect endpoint.

Routes 4, 5, and 8 had their server source read in the 2026-05-01 session; this audit references that work and adds page-side and flow-distinction analysis where missing. Routes 1, 2, 3, 6, and 7 are audited fresh in this session.

## Glossary (terms used in this document)

- **Surface** — a user-facing endpoint or page (the `/api/score-social` page on the website is one surface; the API endpoint behind it is a different surface for an agent caller).
- **Workflow** — the sequence of operations that runs from button-press (or POST request) to rendered result (or returned JSON), including persistence and analytics side-effects.
- **Flow distinction** — a case where one route serves more than one practitioner intention on the same code path. The canonical example is `/api/mentor/private/reflect` serving both the daily-reflection ritual and the deferral-resolution surface; Option 1 (adopted 2026-05-01) scoped AC-18 to the deferral-resolution flow only.
- **AC-13 trigger** — a structural condition in the input that should fire one of the three tiers of intake clarification (Tier 1 force / Tier 2 soft / Tier 3 OPEN_DEFERRAL).
- **AC-17 seam** — a place where the engine's output depends on either practitioner self-report (`SELF_REPORT_DEPENDENT`) or longitudinal evidence (`CONFIDENCE_WEIGHTED`). These are acknowledged philosophical residues, not engineering gaps.
- **AC-18 surface** — a surface where the no-shareable-artifact constraint should apply. After Option 1, AC-18 is scoped to the deferral-resolution surface specifically.
- **Projection** — a mapping from canonical engine output to a surface-specific shape. Documented in D2 Tables 1–5.
- **R20a perimeter** — the eight POST routes named in AC5 that carry distress-detection wiring (`detectDistressTwoStage` + `enforceDistressCheck`).

## Audit method (per route)

For each route, the audit records the following items in the same order:

**1. Plain-language description of the surface.** What is the practitioner doing when they use this surface? Who is the audience? What does success look like?

**2. Server-side workflow.** Numbered steps from request entry to response return. Format follows the predecessor session's evening-reflection walkthrough: each step covers one logical operation (rate limit, auth, body parse, R20a guard, context load, LLM call, persistence, analytics, response build).

**3. Page-side workflow.** Numbered steps from button-press to rendered result. Where the route has no page-side caller, the audit names that explicitly and identifies the agent / API caller pattern.

**4. Flow distinctions.** Does this surface serve more than one practitioner flow on the same code path? If yes, name each flow and what distinguishes them.

**5. AC-18 shape.** Does this surface produce visible output to the practitioner? If yes, identify which fields and whether AC-18-shaped scoping treatment is needed.

**6. AC-13 shape.** Does this surface need intake clarification (Tier 1 force / Tier 2 soft / Tier 3 OPEN_DEFERRAL) before the engine proceeds? Where would the natural trigger conditions live?

**7. AC-17 shape.** Does this surface produce outputs that depend on `SELF_REPORT_DEPENDENT` or `CONFIDENCE_WEIGHTED` data?

**8. Phase-3+ migration projection.** How does this consumer's existing output shape project onto the canonical framework's 9+1 mechanism set? Reference D2 mapping tables 1–5 where applicable; flag any output fields not yet covered.

**9. As-built rollback baseline pointer.** Does this consumer have an existing snapshot? If not, name what a snapshot would capture so it can be produced before any future migration.

The depth target is the depth of the 2026-05-01 evening-reflection walkthrough. The audit is workflow-level — not implementation-level. Line numbers and exact code are out of scope; observable behaviour and architectural implications are in scope.

---

## Route 1 — `/api/score`

### 1. Plain-language description

The `/api/score` route is the single-action scorer. A practitioner enters one specific action they have taken (or are considering) and receives back a Stoic evaluation of that action: where it sits on the proximity scale (reflexive / habitual / deliberate / principled / sage_like), which passions are detected, what false judgements are operative, what virtues are engaged, and a brief philosophical reflection. The page-side caller is `/score` (the "Evaluate an Action" page on the website). The route is also exposed to API-key callers as part of the public API surface for agent developers.

The operative question the practitioner is answering: "Was this the right thing to do, and if not, what was operative in my reasoning that led me to do it?"

### 2. Server-side workflow

**Step 1 — Rate-limit gate.** The server applies the scoring rate limit (`RATE_LIMITS.scoring`). If the caller has exceeded their per-window allowance, the request is rejected immediately with a 429-shaped response. Rate limiting is the cheapest layer; it runs before any auth or LLM work.

**Step 2 — Authentication gate.** The server enforces `requireAuth(request)`. The score endpoint is **user-auth only** (no API-key fallback at this route — see Route 6 for the API-key-friendly path). Non-authenticated requests are rejected with the auth-error response.

**Step 3 — Body parse.** The server parses JSON body fields: `action`, `context`, `relationships`, `emotional_state`, and an optional `prior_feedback` object (previous_action, previous_proximity, passions_identified, false_judgements, sage_reflection — used for iterative refinement chains). Empty `action` returns 400.

**Step 4 — Text-length validation.** `action` is bounded to `TEXT_LIMITS.short`. `context` is bounded to `TEXT_LIMITS.medium`. Length violations return 400.

**Step 5 — R20a vulnerable-user detection.** Before any LLM call, the server runs `await enforceDistressCheck(detectDistressTwoStage(action))`. The two-stage classifier (regex pre-screen + Haiku adjudication for borderline cases per AC2) returns a `SafetyGate`. If `gate.shouldRedirect` is true, the route returns a `distress_detected: true` response with severity and redirect message. **No LLM evaluation runs and no row is persisted on the distress-redirect path.**

**Step 6 — Domain-context construction.** The route assembles a free-text `domainContext` string describing the request as an action evaluation, optionally appending the practitioner's `relationships`, `emotional_state`, and (if present) the structured `prior_feedback` block for deliberation context. This is a per-endpoint domain-specific instruction layered on top of the engine's generic system prompt.

**Step 7 — Parallel context loading.** The server loads in parallel: `getPractitionerContext(auth.user.id)` (Layer 2b, user-specific mentor profile and signals), and `getProjectContext('condensed')` (Layer 3, project phase + recent decisions at compressed depth). Both are awaited. Stoic Brain (Layer 1) is loaded synchronously via `getStoicBrainContext('standard')`.

**Step 8 — Engine call.** The server calls `runSageReason({ input: action.trim(), context, depth: 'standard', domain_context, stoicBrainContext, practitionerContext, projectContext })`. The shared engine handles the LLM call (Sonnet at standard depth — five mechanisms: control_filter, passion_diagnosis, oikeiosis, value_assessment, kathekon_assessment), prompt-cache headers, and structured output validation.

**Step 9 — Output normalisation.** The engine returns a result whose top-level shape doesn't quite match what the `/score` page expects. The route's `normalizeScoreResult` function bridges the gap: it ensures `virtue_quality` is a nested object containing `katorthoma_proximity`, `ruling_faculty_state`, and `virtue_domains_engaged`; ensures `oikeiosis_context` is a flat string derived from the engine's nested `oikeiosis` object; ensures `kathekon_assessment.quality` has a default of `'moderate'` if absent. This is a thin Layer-3-shaped projection happening at the route, not at the engine.

**Step 10 — Response envelope build.** `buildEnvelope(...)` packages the normalised result with metadata (endpoint, model, latency, max_tokens, composability hints — recommended next-steps that vary by detected proximity). The envelope is the standard outer shape for all R20a-perimeter scoring endpoints.

**Step 11 — Response return.** The server returns `NextResponse.json(envelope, { headers: corsHeaders() })`. CORS preflight is handled by the OPTIONS export.

**Note on persistence.** The route itself does **not** persist the evaluation. The page-side handler chooses whether to save (cloud or local storage mode); see step 5 of the page-side workflow below.

### 3. Page-side workflow (`/score/page.tsx`)

**Step 1 — Initial state and storage choice.** On mount, the page reads the authenticated user from Supabase. If the user has not chosen between cloud and local storage modes for action evaluations, the page shows the storage-setup screen first. The choice is persisted in `localStorage` under `action_storage_<user.id>`.

**Step 2 — Form capture.** The page renders a form with fields: `action` (the action being evaluated), `context` (situational context), `relationships` (people involved), `emotional_state` (felt experience). The practitioner fills out as much as is relevant.

**Step 3 — Outbound POST.** On submit (`handleEvaluate`), the page calls `authFetch('/api/score', { method: 'POST', body: JSON.stringify({ action, context, relationships, emotional_state }) })`. Loading state is set; previous result and distress redirect cleared.

**Step 4 — Response handling and distress branch.** On a non-OK response, the page throws and surfaces a generic "Evaluation failed" alert. On a successful response, the page reads `envelope.result ?? envelope` to unwrap the response shape. **If `data.distress_detected` is true**, the page sets `distressRedirect` state with severity and message; the result is not rendered, and the rest of the handler short-circuits. Otherwise the evaluation result is set into state.

**Step 5 — Analytics and persistence.** The page emits a `trackEvent({ event_type: 'evaluate_action', ... })` analytics call. If the user is authenticated and storage mode is `'cloud'`, the result is inserted into `action_evaluations_v3` directly via the Supabase client (route does not persist; page does). If storage mode is `'local'`, the page sets `saved` true without server persistence (local storage is page-managed only).

**Step 6 — Render.** The page renders the proximity level, virtue domains engaged, ruling faculty state, passions detected (with sub-species and false judgements), philosophical reflection, and improvement path. The `proximityDisplay` helpers convert the canonical proximity ID into English label and visual treatment per R8c.

### 4. Flow distinctions

The `/api/score` route serves **one practitioner flow** on its current code path: single-action evaluation with optional iteration. The `prior_feedback` parameter introduces an iterative-refinement variant (the practitioner is iterating on a previous action and wants the engine to acknowledge whether the new action addresses previously identified passions and false judgements), but this is the *same flow* with richer context, not a distinct flow. The deliberation context is layered on through `domainContext`; it does not change the fundamental shape of the request or the response.

There is no second practitioner intention being served on the same code path. The flow distinction surfaced for `/api/mentor/private/reflect` (daily-reflection ritual vs deferral-resolution) does not apply here.

### 5. AC-18 shape

`/api/score` produces visible output to the practitioner: proximity level, virtue domains, passions detected (with sub-species and false judgements), philosophical reflection, improvement path. This is the foundational output shape for the website's scoring surfaces, and it is the *intended* practitioner experience for this surface. The whole point of `/score` is for the practitioner to see what the evaluation says.

**AC-18 does not apply to `/api/score`.** AC-18's architectural argument (no shareable artefact, virtue requires no external witness) attaches specifically to the deferral-resolution surface, where the deferred question is the question the engine deterministically withheld at scoring time because the practitioner was best served by sitting with it. `/api/score` is the opposite surface: the practitioner has come to the surface specifically to receive an evaluation, and the evaluation is the reason for the visit. Producing visible output here is the architectural intention.

The `/score` page does need to be honest about what the evaluation is and is not — it produces a Stoic philosophical evaluation, not a clinical or therapeutic assessment, and the R3 disclaimer must remain on the surface. But the visibility itself is preserved.

### 6. AC-13 shape

The Tier 1 / Tier 2 / Tier 3 intake-clarification model (AC-13) has clear natural trigger conditions on this surface:

- **Tier 1 (force) — ELEMENT_FUSION.** When `action` and `context` are fused into a single field (the practitioner's narrative mixes what they did with the surrounding circumstances and the engine cannot extract a discrete action), the engine should ask: "Before I work through this with you — can you tell me in one sentence what specifically you did, separately from what was happening around you?"
- **Tier 1 (force) — TEMPORAL_AMBIGUITY.** When the practitioner narrates an action whose temporal axis is unclear (is this an action they took, an action they are considering, or an action they regret not having taken?), the engine cannot place the action on the 2×2 passion matrix. Tier 1 question: "Are you reflecting on something you did, considering something you might do, or noticing a pattern that's been recurring?"
- **Tier 1 (force) — SCOPE_AMBIGUITY.** When the action's target is unclear (the practitioner says "I responded to them" without specifying who they are or what role they play), mechanism 6 (oikeiosis_stage) cannot map the action to a circle. Tier 1 question: "Who else was affected by this, if anyone? And what role do they play in your life — colleague, family member, someone you don't know well?"
- **Tier 2 (soft) — STATED_OPERATIVE_CONFLICT.** When `relationships` indicates a circle higher than 1 but `emotional_state` reveals the operative concern is reputation (philodoxia at the foundational level) rather than the higher circle's obligation, the engine can offer a soft clarification rather than block the evaluation. The question can be answered or declined.
- **Tier 3 (deterministic withhold).** Praxis-level motivation classifications attached to the action's evaluation depend on `SELF_REPORT_DEPENDENT` data; if the practitioner's narrative is ambiguous about *why* they took the action (and the profile prior does not break the tie), the engine should deterministically withhold the praxis-level classification rather than guessing. The withheld field surfaces as `OPEN_DEFERRAL` flag in the evaluation record.

Today, `/api/score` does none of this. The route accepts the input as-is and the engine does its best on whatever was provided. Phase-2 design for the conversation surface (D14b deferral-resolution; D11 Layer-3 specification) is where AC-13 wiring should land for this perimeter. The score surface's AC-13 wiring is downstream of that — once the conversation surface proves the pattern, the score surfaces migrate to it in Phase 3+.

### 7. AC-17 shape

`/api/score`'s output already implicitly carries AC-17's two seams:

- `SELF_REPORT_DEPENDENT` applies to the praxis-level motivation classification. When the engine reports "the action shows weak phronesis because the practitioner inflated reputation to a genuine good," the inflation classification depends on the practitioner's narrative being honest about their own motivation. The current engine doesn't flag this dependency; it asserts the classification. AC-17 wiring would surface a flag on this output, and Layer 3 would name the dependency in the prose.
- `CONFIDENCE_WEIGHTED` applies to any eupatheia detection. If the practitioner's narrative shows a chara-shape (rational gladness in genuine good), the engine cannot confirm chara from a single instance; longitudinal evidence is required. The current engine treats eupatheia identification as a single-instance classification; AC-17 wiring would flag the classification as `CONFIDENCE_WEIGHTED: low` on a single instance, raising confidence as longitudinal patterns confirm.

Neither flag is operative on the existing `/api/score` route. Both should be added when the route migrates to the deterministic engine (Phase 3+).

### 8. Phase-3+ migration projection

The `/api/score` output projects onto the canonical framework via D2 Table 1 (5-mechanism standard depth → canonical). Specifically:

- `virtue_quality.katorthoma_proximity` → mechanism 10's `proximity_level`.
- `virtue_quality.ruling_faculty_state` → derived from mechanism 10's directional modifier.
- `virtue_quality.virtue_domains_engaged[]` → mechanism 9's `virtue_engagement[]`.
- `passion_diagnosis.passions_detected[]` → mechanisms 2 + 3 (`root_passion` from mechanism 2; `sub_species` from mechanism 3; per-passion `false_judgement` from mechanism 5).
- `passion_diagnosis.causal_stage_affected` → mechanism 4's `causal_stage_map[]`.
- `kathekon_assessment.is_kathekon` / `quality` / `justification` → composite read of mechanisms 7 + 9.
- `oikeiosis.relevant_circles[]` → mechanism 6's `circles_engaged[]` plus mechanism 7's `obligation_status[]`.
- `oikeiosis_context` → Layer 3 prose translation of mechanism 7.
- `philosophical_reflection` → Layer 3 prose translation of upstream rule outputs.
- `improvement_path` → Layer 3 prose translation of mechanism 5's `dominant_false_judgement`.

The route's `normalizeScoreResult` function is the *current* projection layer (translating between the engine's nested oikeiosis shape and the page's flat-string shape). Under alt-3 this normalisation moves into the Layer 3 projection definition for the `/api/score` consumer.

**Coverage gap surfaced by the audit:** `prior_feedback` (the iterative-refinement context block) is not represented in D2's mapping tables. It is an upstream input rather than an output, so it doesn't strictly need a canonical mapping, but the *concept* — using prior evaluation findings as deliberation context for the next evaluation — is a longitudinal-reasoning feature that may warrant explicit recognition in D2 (alongside mechanism 10's profile-derived inputs). Recommendation: add a brief D2 note that `prior_feedback` is a Layer 1 input shape used by the iterative-refinement variant, projected onto the practitioner profile's recent-interaction signals.

### 9. As-built rollback baseline pointer

There is no existing as-built snapshot for `/api/score`. The conversation-surface snapshot (`/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md`) covers the `/api/founder/hub` mentor pipeline, not the score-family endpoints. Before any Phase 3+ migration of `/api/score`, a snapshot in the same format should be produced. The snapshot should capture: the rate-limit + auth + R20a + parallel-context-load + engine-call + normalize + envelope shape; the page-side handler's distress branch and persistence-mode logic; the `prior_feedback` iteration structure; the `action_evaluations_v3` table schema as it stands at snapshot time.

Snapshot work for `/api/score` is **not urgent** before Phase-1 session 2 begins (Phase 2 pass 1 builds the deferral-resolution surface, which is `/api/mentor/private/reflect`'s deferral flow, not this route). The score-family snapshot can land alongside Phase 3+ planning.

---

## Route 2 — `/api/score-decision`

### 1. Plain-language description

The `/api/score-decision` route is the multi-option decision comparator. The practitioner enters a single decision they are facing along with two-to-five distinct options for how to respond, optionally with a description of the decision-making process they have been using. The route evaluates each option separately against the Stoic framework and returns a ranked list (proximity-sorted, sage_like first), a recommended option, optional process-quality assessment ("thorough" / "adequate" / "hasty"), and per-option plus overall reasoning receipts.

The operative question the practitioner is answering: "I have a decision to make, and I have several plausible options. Which one is most aligned with virtue, and what does the comparison reveal about my reasoning across them?"

### 2. Server-side workflow

**Step 1 — Rate-limit gate.** Same scoring rate limit as Route 1.

**Step 2 — Authentication gate.** `requireAuth(request)`. User-auth only.

**Step 3 — Body parse.** Fields: `decision` (the decision being faced — string), `options` (array of 2–5 option strings), `context` (optional situational context), `process` (optional description of the decision-making process used).

**Step 4 — Text-length validation.** `decision` is bounded to `TEXT_LIMITS.short`; `context` to `TEXT_LIMITS.medium`. The individual option strings are not length-validated separately at the route — they pass through to the engine call and inherit the engine's input limits.

**Step 5 — R20a vulnerable-user detection.** `await enforceDistressCheck(detectDistressTwoStage(decision))`. **Note:** the distress check runs against `decision` only, not against any of the option strings. This is a structural choice — the decision is the practitioner's framing of the problem, and is the canonical narrative carrier — but it is worth flagging that an option string carrying a distress signal that the decision string did not would not trigger the gate. Practical risk is low (a practitioner in acute distress is unlikely to compose 2–5 carefully-worded options without revealing the distress in the decision framing), but the audit notes the asymmetry.

**Step 6 — Options validation.** `options` must be an array of at least 2 and at most 5 strings. Outside the range returns 400.

**Step 7 — Domain-context construction.** A free-text `domainContext` describing the request as a multi-option decision evaluation. If `process` is provided, the domain context appends an instruction to also assess the *quality of the decision process itself* (returning a `process_quality` field — `"thorough"` / `"adequate"` / `"hasty"`). The architectural intent: a well-considered set of options scored at the same proximity level is *not* equivalent to the same options arrived at through hasty elimination. This maps to the Stoic concern with quality of assent.

**Step 8 — Parallel context loading.** Practitioner context (Layer 2b) and project context (Layer 3 condensed) loaded once via `Promise.all`. **Architecturally important:** the context is loaded *once* and reused across every option scored. The alternative (loading per option) would multiply cold-request latency by N. The current design is intentional and correct.

**Step 9 — Sequential engine calls per option.** A `for` loop iterates over `options`; for each option, the route calls `runSageReason({ input: option, context, depth: 'standard', domain_context, stoicBrainContext: getStoicBrainContext('standard'), practitionerContext, projectContext })` and collects the result into `scoreData`. The Stoic Brain context (Layer 1) is loaded synchronously per option from a cached function, so this is not a hot loader; it is a constant-time read.

**Step 10 — Per-option result extraction.** For each option, the route extracts `katorthoma_proximity`, `passions_detected[]` (with normalised `root_passion`, `sub_species`, `false_judgement` per item), `is_kathekon`, `kathekon_quality`, and `stoic_insight` (from the engine's `philosophical_reflection`). Defensive defaults are applied (`root_passion: 'epithumia'` if missing, `sub_species: 'unspecified'` if missing, `kathekon_quality: 'marginal'` if missing).

**Step 11 — Sort by proximity rank.** Options are ranked: `sage_like: 5, principled: 4, deliberate: 3, habitual: 2, reflexive: 1`. Sorted descending. The top option is the recommended one.

**Step 12 — Receipt generation.** A per-option reasoning receipt is generated for each option (skill ID `sage-decide`, three mechanisms cited: `control_filter`, `passion_diagnosis`, `kathekon_assessment`). An overall reasoning receipt is generated using the top-ranked option's evaluation plus all options' passions detected (flatMap), with a recommended-next field naming the recommended option.

**Step 13 — Process-quality extraction.** If `process` was provided, the route reads `process_quality` from the first option's evaluation (if the engine populated it under the domain-context's instruction). Otherwise undefined.

**Step 14 — Result assembly.** The result object includes `decision`, `options_scored[]` (with full per-option records), `recommended` (the top option's text), `process_described`, `process_quality`, `scored_at`, `reasoning_receipt`, `option_receipts[]`, and the R3 disclaimer.

**Step 15 — Analytics.** A row is inserted into `analytics_events` with event type `decision_score_v3` and metadata (`num_options`, `top_proximity`, `top_kathekon`). The insert is fire-and-forget at the route layer (`.then(() => {})`); under KG1 rule 2 this is at risk on Vercel of not completing if the response returns first. The route does not await the insert. **Audit observation:** this is a candidate KG1-rule-2 violation. Recommendation: in any future build pass, this insert should be awaited (or moved to an explicit background pattern that respects Vercel's execution-termination rule).

**Step 16 — Response envelope build.** `buildEnvelope(...)` packages the result with composability hints (next steps: `/api/score-iterate`).

**Step 17 — Response return.** JSON envelope with CORS headers.

### 3. Page-side workflow (current sole caller is `/ops-hub/page.tsx`)

The grep for callers of `/api/score-decision` returns a single page-side caller: `/ops-hub/page.tsx`. There is no dedicated `/score-decision` page on the public website.

**Step 1 — Form capture (Ops Hub Stoic decision-scoring panel).** The practitioner enters two decision options into separate text fields (`decisionOption1`, `decisionOption2`). The Ops Hub UI presents this as a binary comparator panel rather than a 2–5 option ranker.

**Step 2 — Outbound POST.** On click of the scoring button (`handleDecisionScoring`), the page calls `fetch('/api/score-decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ option1: decisionOption1, option2: decisionOption2 }) })`. **Note: this body shape does not match the route's expected schema.** The route expects `{ decision, options[] }`; the page sends `{ option1, option2 }`. The route's body-parse step will read `decision` as undefined, `options` as undefined, and return 400 with "decision is required." The page then falls into its catch branch and shows an error.

**Audit finding:** the only page-side caller of `/api/score-decision` is sending a malformed body. Either the page was written against an older route schema and never updated, or the route was updated and the page was missed. Either way, the surface is **non-functional** on its current page-side path. Practitioners who click the Ops Hub Stoic decision-scoring panel get an error, not an evaluation. This is a flow-level finding the audit surfaces; it is not a design recommendation but a current-behaviour fact.

**Step 3 — Result handling.** Even if the body were correct, the page's `setScoringResult(data)` call writes whatever the server returned into state without distress-redirect handling. The Ops Hub page does not check `data.distress_detected` or `data.result?.distress_detected` before rendering. **Second audit finding:** the page-side surface for `/api/score-decision` does not respect the R20a distress-redirect output shape. If the route ever returns a distress redirect, the page would render the distress payload as if it were a scoring result, with unpredictable visual outcome.

**Step 4 — No persistence.** The Ops Hub page does not persist the result to any table. `scoringResult` is local React state only.

### 4. Flow distinctions

`/api/score-decision` serves **one practitioner flow** at the route level: multi-option decision comparison. The route does not branch on hub_id, user role, or any other discriminator that would constitute a second flow.

However, the `process` parameter introduces a *richer variant* of the same flow (the engine is asked to assess process quality in addition to per-option proximity). This is analogous to the `prior_feedback` block on `/api/score`: same flow, richer input, additional output field.

There is no second practitioner intention served on the same code path.

### 5. AC-18 shape

`/api/score-decision` produces visible output to the practitioner: per-option proximity ranking, recommended option, optional process quality, philosophical insights per option. This is the intended practitioner experience for a decision-comparison surface. **AC-18 does not apply.** Producing visible output is the architectural intention; the practitioner is on the surface specifically to receive a comparison.

The Ops Hub page-side caller's malformed body and missing distress handling (audit findings above) are not AC-18 issues — they are page-side defects independent of the architectural commitment.

### 6. AC-13 shape

The Tier 1 / Tier 2 / Tier 3 model has natural trigger conditions on this surface, distinct from `/api/score`:

- **Tier 1 (force) — OPTION_SCOPE_INCONSISTENCY.** When the options describe actions at different oikeiosis circles (option 1 is a self-care action; option 2 is a community-affecting action), the comparison may not be apples-to-apples. The engine should ask: "These two options affect different people in your life — option 1 is mostly about [self / family / community / etc.], and option 2 is mostly about [other circle]. Are you choosing between two genuinely different paths, or do you want to focus on one circle?" This is a new AC-13 trigger not present on the single-action surfaces.
- **Tier 1 (force) — OPTION_FALSE_ALTERNATIVE.** When the options are not genuine alternatives (e.g., they could be combined, or one is a strict superset of another), the engine cannot rank them coherently. This is a structural Tier 1 trigger requiring clarification before evaluation.
- **Tier 2 (soft) — STATED_PROCESS_INCONSISTENCY.** When `process` is provided but the option set itself reveals a hasty elimination (e.g., only two options in a domain that obviously admits more), the engine can offer a soft observation rather than block.
- **Tier 3 (deterministic withhold).** Praxis-level motivation classifications across options depend on `SELF_REPORT_DEPENDENT` data; if the practitioner's framing of the decision is ambiguous about *why* one option is being preferred, the engine may withhold the recommendation rather than guess. The withheld recommendation surfaces as `OPEN_DEFERRAL`.

None of this is operative on the current route. AC-13 wiring for the decision surface is downstream of the conversation surface's AC-13 build (Phase-1 D13 + Phase-2 build).

### 7. AC-17 shape

`/api/score-decision`'s output carries AC-17's seams in two places:

- `SELF_REPORT_DEPENDENT` applies to per-option praxis-level classifications. Each option's evaluation depends on the practitioner's framing being honest about why each option appeals. The engine asserts proximity for each option without flagging the dependency.
- `CONFIDENCE_WEIGHTED` applies to *cross-option pattern detection*. If the same passion (e.g., philodoxia) is detected across multiple options, that is a longitudinal signal that the practitioner's reasoning is dominated by the passion regardless of which option is chosen. The current engine doesn't surface this; it just lists per-option detections. Phase-3+ migration could add a `cross_option_pattern` field flagged `CONFIDENCE_WEIGHTED`.

### 8. Phase-3+ migration projection

The `/api/score-decision` per-option output is the same projection as `/api/score` (D2 Table 1 — 5-mechanism standard depth → canonical) applied N times. The aggregate outputs (`recommended`, `process_quality`, sorting logic) are application-specific projections that live in this consumer's Layer 3 specification.

**Coverage gap surfaced by the audit:** D2's mapping tables do not cover *aggregate-across-options* outputs. The `recommended` field is a downstream classification rule (the highest-proximity option) and `process_quality` is a separate classification on the practitioner's framing. Neither is in the canonical 9+1 mechanism set. They live in the Layer 3 projection for this consumer. Recommendation: D2 receives a brief note that decision-comparison surfaces produce *aggregate projections* across N independent canonical evaluations, distinct from per-instance projections.

### 9. As-built rollback baseline pointer

No existing snapshot. Before Phase 3+ migration, a snapshot should capture: the route's body schema (`decision`, `options[]`, `context`, `process`), the per-option iteration with shared context, the rank ordering, the per-option vs aggregate receipt structure, and the analytics event shape. **The snapshot should also document the page-side defects identified in this audit** (malformed body, missing distress handling) so any future migration is aware of them.

Snapshot work for `/api/score-decision` is **not urgent** before Phase-1 session 2. The page-side defects are urgent enough to warrant founder attention separately — see the Findings section.

---

## Route 3 — `/api/score-document`

### 1. Plain-language description

The `/api/score-document` route is the long-form document evaluator. The practitioner pastes a document (up to ~8000 words) and receives a deep Stoic evaluation: authorial control assessment, kathekon quality, passions detected (split into authorial passions and reader-triggered passions), katorthoma proximity, virtue domains engaged, ruling faculty assessment, improvement path. The route supports two modes — default ("document": general written content) and `'policy'` (policy-document evaluation with a larger JSON schema including deliberation assessment, oikeiosis impact, and flagged clauses).

The route also generates a proximity-coloured badge URL and embeddable HTML so the practitioner can attach the evaluation to the document for sharing.

The operative question the practitioner is answering: "I have written something — a letter, a policy, an essay. Does its reasoning align with Stoic virtue, and what specifically does it reveal about the author's (my own) cognitive state?"

### 2. Server-side workflow

**Step 1 — Rate-limit gate.** Scoring rate limit.

**Step 2 — Authentication gate.** `requireAuth(request)`. User-auth only.

**Step 3 — Body parse.** Fields: `text`, `title` (optional), `mode` (optional — `'policy'` triggers the policy-mode prompt and schema). The `scoringPrompt` is selected — `V3_DOCUMENT_SCORING_PROMPT` for default mode, `V3_POLICY_SCORING_PROMPT` for policy mode.

**Step 4 — Text-length and word-count validation.** `text` bounded by `TEXT_LIMITS.document`. Word count must be ≥ 20 (under 20, the route returns 400 with "Document must be at least 20 words for a meaningful evaluation"). Documents longer than ~8000 words are truncated to 8000 words before evaluation; the truncation is silent at the API level (no warning to the caller).

**Step 5 — R20a vulnerable-user detection.** `await enforceDistressCheck(detectDistressTwoStage(text))`. The full document text is the input. **Note:** this is the most expensive R20a invocation in the perimeter (the regex pre-screen runs over the full document), but the two-stage classifier still bounds latency at ~500ms for borderline inputs per AC2.

**Step 6 — Document truncation.** `truncated = trimmed.split(/\s+/).slice(0, 8000).join(' ')` produces the bounded input for the LLM call.

**Step 7 — Manual context-layer injection.** Unlike Routes 1, 2, 6, 7 (which pass context to `runSageReason` via parameters), `/api/score-document` calls `client.messages.create` directly. Reason: the document scorer predates the shared engine and its system prompts (`V3_DOCUMENT_SCORING_PROMPT`, `V3_POLICY_SCORING_PROMPT`) embed specialised evaluation instructions that would require significant refactoring to pass through the generic engine. The route's docblock notes this as deferred consolidation tech debt. Layer 1 (Stoic Brain at deep depth) is loaded synchronously and injected as a second system block; Layer 2 (practitioner) and Layer 3 (project condensed) are loaded in parallel and appended to the user message. The injection order is: document text → practitioner → project. This matches the engine's internal injection order.

**Step 8 — Anthropic call.** Direct call to `client.messages.create({ model: MODEL_DEEP, max_tokens: 2048 (default) or 3072 (policy mode), temperature: 0.2, system: [scoringPrompt with cache_control ephemeral, stoicBrainContext], messages: [{ role: 'user', content: userContent }] })`. Sonnet at deep depth.

**Step 9 — Response parse.** The response text is stripped of markdown code fences, parsed as JSON. If direct parse fails, a fallback regex extracts the first `{...}` JSON object from the response (the LLM occasionally wraps JSON in explanatory text). Both fallbacks failing returns a 500 with "Evaluation engine returned invalid response."

**Step 10 — Required-field validation.** Seven required fields are checked: `authorial_control`, `kathekon_assessment`, `passions_detected`, `katorthoma_proximity`, `virtue_domains_engaged`, `ruling_faculty_assessment`, `improvement_path`. Missing field returns 500 naming the field.

**Step 11 — Proximity-level validation.** `katorthoma_proximity` must be one of the canonical five values; invalid returns 500.

**Step 12 — Database persistence.** A row is inserted into `document_evaluations_v3` with the full evaluation data plus mode-specific fields for policy mode (`deliberation_assessment`, `oikeiosis_impact`, `flagged_clauses[]`). The insert is awaited (KG1 rule 2 honoured here); the returned `id` is captured for badge URL construction. **DB failure does not block response** — the route logs the error and continues with a 'preview' badge ID, so the practitioner gets the score but no persistent badge. This is a deliberate honest-failure-mode pattern.

**Step 13 — Badge URL and embed HTML construction.** `badgeUrl = ${BASE_URL}/api/badge/${scoreId}`; `embedHtml = <a href="${BASE_URL}/score/${scoreId}"...><img src="${badgeUrl}"...></a>`. The badge endpoint generates a proximity-coloured SVG; the score endpoint shows the full evaluation publicly.

**Step 14 — Result assembly.** The result includes proximity, English label, virtue domains, ruling faculty, improvement path, authorial control, kathekon assessment, passions detected (split: authorial / reader-triggered / false judgements), word count, evaluated-at timestamp, badge URL, embed HTML, mode, and (for policy mode) deliberation assessment / oikeiosis impact / flagged clauses.

**Step 15 — Analytics.** Fire-and-forget insert into `analytics_events` with event type `document_evaluation_v3` and metadata. **Same KG1-rule-2 candidate violation as Route 2.**

**Step 16 — Response envelope build.** `buildEnvelope(...)` packages the result with composability hints (next steps: `/api/score-iterate`).

**Step 17 — Response return.** JSON envelope with CORS headers.

### 3. Page-side workflow (`/score-document/page.tsx` — and `/score-policy/page.tsx`)

The route has **two page-side callers** mapping to the two modes:

- `/score-document/page.tsx` — calls with default mode (no `mode` parameter set; route defaults to document).
- `/score-policy/page.tsx` — calls with `mode: 'policy'` to trigger the policy-mode prompt and larger schema.

Workflow for `/score-document/page.tsx` (the document-mode caller):

**Step 1 — Form capture.** Two fields: `title` (optional) and `text` (the document content). Word count is computed live and displayed; minimum 20 words enforced page-side.

**Step 2 — Outbound POST.** On click of the score button (`handleScore`), the page calls `authFetch('/api/score-document', { method: 'POST', body: JSON.stringify({ text: text.trim(), title: title.trim() || undefined }) })`. Note: no `mode` field, so the route defaults to document mode.

**Step 3 — Response handling and distress branch.** The page reads `envelope.result ?? envelope`. **If `data.distress_detected` is true**, the page sets `distressRedirect` state with severity and message; the result is not rendered. Otherwise the evaluation result is set into state.

**Step 4 — Render.** The page renders proximity, virtue domains engaged, ruling faculty assessment, authorial control split, kathekon assessment, passions detected (with sub-species and false judgements split into authorial vs reader-triggered), improvement path, badge embed HTML, and the document evaluative disclaimer.

Workflow for `/score-policy/page.tsx` is structurally identical except that the body sets `mode: 'policy'` and the page renders the additional policy-mode fields (deliberation assessment, oikeiosis impact, flagged clauses). Both page-side callers respect the distress-redirect output shape.

### 4. Flow distinctions

`/api/score-document` serves **two practitioner flows** on the same code path, distinguished by the `mode` parameter:

- **Document mode** (default): general document evaluation. Letters, essays, posts, blog drafts, written reasoning. Output schema: standard 7-field shape.
- **Policy mode** (`mode: 'policy'`): policy-document evaluation. Workplace policies, organisational guidelines, governance documents. Output schema: standard 7 fields plus `deliberation_assessment`, `oikeiosis_impact`, `flagged_clauses[]`.

These are genuinely distinct flows: the practitioner is doing two different things (evaluating their own writing vs evaluating an institutional document). The page-side callers (`/score-document` vs `/score-policy`) make the distinction visible to the user; the route handles both paths under one code body via the `mode` switch.

**Audit observation — flow ambiguity check:** This is a *clean* mode-switch, not a flow ambiguity. Both flows produce visible output (intended for both audiences), both flows project onto the same canonical 9+1 mechanism set (with policy mode adding a few additional projections), and AC-18 does not apply to either flow. The mode parameter is doing the right work.

### 5. AC-18 shape

Neither flow on `/api/score-document` triggers AC-18. Both flows produce visible output to the practitioner (and, via the badge / embed HTML, potentially to third parties). The visibility is the architectural intention. The badge embed is a deliberate feature: the practitioner can share the evaluation alongside the document so others can see what the Stoic framework says.

This is a **noteworthy contrast with the deferral-resolution surface**. The reflect endpoint's deferral-resolution flow produces no shareable artefact specifically because virtue requires no external witness; producing a visible reflection score would re-introduce the philodoxia mechanism. The document-evaluation surface explicitly produces a shareable artefact because the practitioner *should* be able to attach the evaluation to the document for accountability and feedback. The architectural argument is opposite, and Option 1 (AC-18 scoping) is consistent with this — AC-18 holds where the practitioner's reasoning about themselves is at stake; AC-18 does not hold where the practitioner is asking for evaluation of an external artefact.

### 6. AC-13 shape

Natural trigger conditions on this surface:

- **Tier 1 (force) — DOCUMENT_OBJECT_AMBIGUITY.** Some documents are ambiguous about who the *author* is and who the *audience* is (the engine cannot cleanly classify authorial passions vs reader-triggered passions if the document is internally split — e.g., a draft that quotes external content extensively). Tier 1 question: "Are you the sole author of this document, or is some of the content quoted or co-authored? If quoted, do you want the evaluation to focus on your authorial parts only?"
- **Tier 1 (force) — DOCUMENT_PURPOSE_AMBIGUITY.** When the document purpose is unclear (is this a personal letter, a draft for publication, an internal memo?), the kathekon assessment cannot fully fire. Tier 1 question: "What is this document for, and who is it written to?"
- **Tier 2 (soft) — POLICY_INSTITUTIONAL_DISTANCE.** In policy mode, when the practitioner is evaluating an institutional document they did not author themselves (a workplace policy they are reviewing), the second-person evaluation prohibition (R20d) becomes relevant — the framework should not be used to diagnose the institution's reasoning as if the institution were a practitioner. This is a soft clarification: "This document was written by [you / your organisation / a third party]. The Stoic evaluation works best when you are evaluating your own authorial reasoning. Do you want to focus on what you would change if you were the author, or on understanding what reasoning is operative in the document as written?"
- **Tier 3 (deterministic withhold).** Praxis-level motivation classifications attached to authorial passions depend on the practitioner's framing of why they wrote the document a particular way; if the framing is ambiguous, withhold rather than guess.

None of this is operative on the current route. The R20d boundary (no diagnosing others) is partially honoured via the `passions_detected.reader_triggered_passions` field — the surface acknowledges that *the document* may trigger passions in readers — but the audit notes that policy-mode evaluation crosses into evaluating-an-institution territory more obviously than document-mode does. Phase 3+ migration should add the institutional-distance soft clarification.

### 7. AC-17 shape

`/api/score-document`'s output carries AC-17's seams:

- `SELF_REPORT_DEPENDENT` applies to authorial-control classifications and authorial-passion attributions. The engine reads what the practitioner wrote, but the "what the author was thinking" classification depends on the practitioner's self-framing in the document and (where present) in optional context — both of which are self-report. Current engine asserts; AC-17 wiring would flag.
- `CONFIDENCE_WEIGHTED` applies less directly than on the conversation surfaces. A single document is a single artefact; longitudinal comparison across documents the same author has written would raise confidence, but the route does not currently retrieve prior documents. Phase 3+ migration could add cross-document longitudinal projection.

### 8. Phase-3+ migration projection

The document evaluation projects onto the canonical framework as follows (a hybrid of D2 Tables 1 and 5):

- `katorthoma_proximity` → mechanism 10's `proximity_level`.
- `virtue_domains_engaged[]` → mechanism 9's `virtue_engagement[]`.
- `authorial_control.within_control[]` / `outside_control[]` → mechanism 1's `prohairesis_scope[]` / `external_scope[]`.
- `kathekon_assessment.is_kathekon` / `quality` → composite of mechanisms 7 + 9.
- `passions_detected.authorial_passions[]` → mechanisms 2 + 3 (scoped to the document author).
- `passions_detected.reader_triggered_passions[]` → mechanisms 2 + 3 + 5 (scoped to the audience — analogous to `score-social.reader_triggered_passions[]` per D2 Table 5).
- `false_judgements[]` → mechanism 5.
- `ruling_faculty_assessment` → derived from mechanism 10's directional modifier.
- `improvement_path` → Layer 3 prose translation of mechanism 5's `dominant_false_judgement`.
- Policy-mode-only: `deliberation_assessment` → composite of mechanisms 6 + 7. `oikeiosis_impact` → mechanism 6. `flagged_clauses[]` → Layer 3 flagged-passage shape with per-clause projection onto canonical mechanisms.

**Coverage gap surfaced by the audit:** the policy-mode-specific fields (`deliberation_assessment`, `oikeiosis_impact`, `flagged_clauses[]`) are not represented in D2's mapping tables. `flagged_clauses[]` in particular is a structured per-passage projection that the canonical framework would need to support (each clause is itself a mini-evaluation with its own canonical-mechanism shape). Recommendation: D2 receives an addition for policy-mode shapes, possibly as a new Table 6.

### 9. As-built rollback baseline pointer

No existing snapshot. Before Phase 3+ migration, a snapshot should capture: the dual-mode prompt selection logic; the manual context-injection pattern (Layer 1 system block + Layer 2/3 user-message append); the JSON-fence-stripping fallback parser; the seven required fields validation; the `document_evaluations_v3` table schema; the badge URL / embed HTML construction; the policy-mode-specific schema additions; the page-side distress-handling pattern (correctly implemented on both `/score-document` and `/score-policy`).

Snapshot work for `/api/score-document` is **not urgent** before Phase-1 session 2. The route is architecturally distinct from the others (calls `client.messages.create` directly rather than `runSageReason`), which makes its eventual migration to alt-3 the largest of the score-family migrations. A snapshot before that migration begins is required.

---

## Route 4 — `/api/score-scenario`

### 1. Plain-language description

The `/api/score-scenario` route is the ethical-scenario reasoning practice surface. Unlike the other score-family endpoints (which evaluate something the practitioner has done or is considering), this surface presents the practitioner with a hypothetical ethical scenario — appropriate to a chosen audience level (children / teens / adults / advanced) — and asks them to write or select a response. The route then evaluates the response and returns a compact V3 evaluation with proximity, passions detected, kathekon quality, brief feedback (2–3 sentences), and a one-sentence sage saying.

The operative question the practitioner is answering: "I want to practise virtue-based reasoning on an unfamiliar dilemma. What does my response reveal about my reasoning, and how would the sage have framed it differently?"

The full server-side workflow for this route was captured in the predecessor session's audit work; this audit references that and adds page-side and flow-distinction analysis.

### 2. Server-side workflow (predecessor reference)

The server-side workflow follows the same shape as Routes 1 and 2: rate-limit gate → auth gate → body parse (`scenario`, `response`, `audience`) → text-length validation → R20a distress detection on the *response* (the practitioner's reasoning, not the scenario itself) → domain-context construction (the scenario is included in the domain context as the framing the practitioner is responding to) → parallel context loading → `runSageReason` call at standard depth → result extraction (compact V3 shape per D2 Table 5) → analytics insert → response envelope build → return. The route's body schema and output shape were enumerated in the predecessor session; the architectural fact relevant to this audit is that `/api/score-scenario` produces compact V3 shape (proximity + passions_detected with embedded sub-species and false judgement + kathekon_quality + feedback + sage_says), not the standard-depth flat shape that `/api/score` and `/api/reason` produce.

The route does not currently persist the scenario itself or the practitioner's response to a per-user history table — analytics events are recorded but the scenario/response pair is not stored for longitudinal analysis. This is a coverage observation, not a defect.

### 3. Page-side workflow (`/scenarios/page.tsx`)

**Step 1 — Audience selection (Step 'setup').** The page presents four audience levels. The practitioner picks one. The audience choice changes the scenario generation prompt (different ethical complexity for each).

**Step 2 — Scenario generation (Step 'generate').** The page calls a separate endpoint (not in the R20a perimeter — it's a scenario-generation route, not a scoring route) to produce the scenario text. The scenario appears with several pre-written response options plus an optional free-text "your own response" field.

**Step 3 — Response composition (Step 'respond').** The practitioner either selects one of the pre-written options (`selectedOption`) or writes their own (`customResponse`). The response must be at least 5 characters; otherwise an error is shown page-side without an outbound call.

**Step 4 — Outbound POST (`handleScore`).** The page calls `authFetch('/api/score-scenario', { method: 'POST', body: JSON.stringify({ scenario: scenario?.scenario, response: responseText, audience }) })` with `responseText` being the trimmed custom response or the selected option.

**Step 5 — Response handling and distress branch.** The page reads `envelope.result ?? envelope`. If `data.distress_detected` is true, the page sets `distressRedirect` state; the result is not rendered. Otherwise the result is set into state and the page advances to step 'result'.

**Step 6 — Render (Step 'result').** The page renders the compact V3 evaluation: proximity (with English label and visual treatment), passions detected (each entry with root passion, sub-species, false judgement), kathekon quality, feedback paragraph, sage saying (one sentence). The R3 disclaimer is included.

### 4. Flow distinctions

`/api/score-scenario` serves **one practitioner flow** at the route level: scenario response evaluation. The audience parameter (`children` / `teens` / `adults` / `advanced`) does not constitute a separate flow — it shifts the scenario generation difficulty upstream, but the response evaluation is the same engine path.

There is no second practitioner intention served on the same code path.

### 5. AC-18 shape

`/api/score-scenario` produces visible output to the practitioner: proximity, passions detected, feedback, sage saying. This is the intended practitioner experience for a reasoning practice surface. **AC-18 does not apply.**

A subtle architectural consideration: this surface is *practice*, not *evaluation of a real action*. The practitioner is not doing the act they are responding to — they are reasoning about a hypothetical. This is closer to a learning activity than to self-evaluation. The visible output is the learning artefact. AC-18's argument (virtue requires no external witness) does not apply to a learning surface where the artefact is *what was learned*, not *whether the practitioner is virtuous*.

### 6. AC-13 shape

Natural trigger conditions on this surface differ from the real-action surfaces:

- **Tier 1 (force) — RESPONSE_AMBIGUITY.** When the practitioner's response is too short or vague to evaluate (under 20 characters, or single-word answers), the engine cannot extract a structured response. Tier 1 question: "Can you say a bit more about how you would respond and why?"
- **Tier 2 (soft) — RESPONSE_SCENARIO_DRIFT.** When the practitioner's response addresses something other than what the scenario asked (the response drifts into adjacent territory), the engine can offer a soft observation: "Your response touches on [adjacent topic] more than on [the scenario's core question]. Do you want me to evaluate the response as written, or would you like to focus more directly on [the scenario question]?"
- **Tier 3 (deterministic withhold) — rarely fires here.** Praxis-level motivation classifications are less load-bearing on a practice surface (the practitioner is not actually facing the dilemma, so motivation is hypothetical). Withholding is less critical than on real-action surfaces. The eupatheia confidence-weighted boundary is even less applicable.

The practice nature of this surface means AC-13 wiring is *less* central than on `/api/score` or the conversation surface. The audit notes this for D13 design (the three-tier intake clarification spec) — the spec should distinguish high-AC-13-applicability surfaces from low-applicability ones.

### 7. AC-17 shape

Both `SELF_REPORT_DEPENDENT` and `CONFIDENCE_WEIGHTED` apply weakly on this surface for the same reason AC-13 is less central: the practitioner is not actually facing the situation, so self-report dependence is downstream of the hypothetical framing rather than of the practitioner's own action. Phase-3+ migration could either drop the AC-17 flags on this surface entirely or flag them at a discounted weight reflecting the hypothetical context.

### 8. Phase-3+ migration projection

The route's compact V3 output projects onto the canonical framework via D2 Table 5 (compact V3 variants → canonical):

- `katorthoma_proximity` → mechanism 10.
- `passions_detected[]` (root_passion, sub_species, false_judgement) → mechanisms 2 + 3 + 5.
- `kathekon_quality` → composite of mechanisms 7 + 9.
- `feedback` → Layer 3 prose translation of upstream rule outputs.
- `sage_says` → Layer 3 prose translation focused on mechanism 1 output.

The mapping is clean and already present in D2; no coverage gap on this surface.

### 9. As-built rollback baseline pointer

No existing snapshot. Before Phase 3+ migration, a snapshot should capture: the body schema, the scenario-generation upstream call (which is not in the R20a perimeter but is the surface's natural companion), the compact V3 output shape, the page-side multi-step state machine (setup → generate → respond → result), and the audience-parameter effect on prompting.

Snapshot work for `/api/score-scenario` is **not urgent** before Phase-1 session 2. Practice surfaces are lower-priority for migration than real-action surfaces.

---

## Route 5 — `/api/score-social`

### 1. Plain-language description

The `/api/score-social` route is the pre-publish filter for social posts. The practitioner pastes a draft social post (tweet, LinkedIn post, message, email) and selects a platform. The route returns a compact V3 evaluation specifically tuned for public-publishing contexts: poster passions (passions visible in the writing as evidence of the author's state), reader-triggered passions (passions the post would trigger in audience members), false judgements operative in the post, suggested corrections, proximity, English proximity label, and a publish recommendation (`publish` / `revise` / `reconsider`).

The operative question the practitioner is answering: "Before I publish this, what passions does it carry, and what passions will it trigger in readers? Should I publish as-is, revise, or reconsider whether to post at all?"

The full server-side workflow for this route was captured in the predecessor session's audit work; this audit references that and adds page-side and flow-distinction analysis.

### 2. Server-side workflow (predecessor reference)

The route follows the rate-limit → auth → body-parse (`text`, `platform`) → text-length validation → R20a distress detection on the post text → domain-context construction (platform-specific framing) → parallel context loading → `runSageReason` call → result extraction (`/api/score-social`'s distinctive shape per D2 Table 5) → publish-recommendation classification (a downstream rule mapping `principled` / `sage_like` → `publish`; `deliberate` → `revise`; `habitual` / `reflexive` → `reconsider`) → analytics → response envelope build → return.

The output shape's distinctive element: the split between `poster_passions[]` (author's state visible in writing) and `reader_triggered_passions[]` (effect on audience). This split is application-specific projection, not a separate canonical mechanism — both project onto mechanisms 2 + 3 + 5 with different scoping.

### 3. Page-side workflow (`/score-social/page.tsx`)

**Step 1 — Form capture.** Two fields: `text` (the draft post) and `platform` (one of `general` / `twitter` / `linkedin` / `email`). Live character count is shown.

**Step 2 — Outbound POST (`handleScore`).** The page calls `authFetch('/api/score-social', { method: 'POST', body: JSON.stringify({ text: text.trim(), platform }) })` if the trimmed text is at least 5 characters; otherwise the page shows a length-error without an outbound call.

**Step 3 — Response handling and distress branch.** The page reads `envelope.result ?? envelope`. If `data.distress_detected` is true, the page sets `distressRedirect` state with severity and message; the result is not rendered. Otherwise the result is set into state.

**Step 4 — Render.** The page renders proximity (with English label), publish recommendation (with explanatory rationale), poster passions (with root, sub-species, false judgement), reader-triggered passions, suggested corrections, and the R3 disclaimer. The page also offers a "save / share" action that produces a downloadable text file or copies to clipboard (no server persistence beyond analytics).

### 4. Flow distinctions

`/api/score-social` serves **one practitioner flow** at the route level: pre-publish filtering of a social post. The platform parameter does not constitute a separate flow — it shifts the prompting nuance (Twitter character constraints, LinkedIn professional context, email interpersonal context) but the engine path is unitary.

There is no second practitioner intention served on the same code path.

### 5. AC-18 shape

`/api/score-social` produces visible output to the practitioner: proximity, publish recommendation, passions split, suggested corrections. This is the intended practitioner experience — the surface exists specifically to surface this evaluation before publication. **AC-18 does not apply.**

The route is structurally adjacent to the deferral-resolution surface in one specific way worth flagging: both surfaces involve the practitioner reasoning about their own potential reputation-generation behaviour. The post the practitioner is about to publish is a reputation artefact; the question "should I publish this?" is a question about how reputation ought to figure in the reasoning. However, the *evaluation* the practitioner receives at this surface is not itself a reputation artefact — it is a private filter. The visible output is the practitioner's own diagnostic of the post, not a sharable evaluation badge. The compact V3 output shape is not designed to be embedded or attached to the post (unlike `/api/score-document`'s badge URL pattern). So AC-18's reputation-mechanism argument does not engage.

The audit observes that the surface's *purpose* (filtering before publication) is closely aligned with R19d (the mirror principle — examination is for one's own reasoning) and with R20d (no using the framework on others). The route is currently silent on these — the engine returns reader_triggered_passions as if they were diagnostic of the audience's actual reasoning. R20d would prefer this output to be framed as "what passions this content would invite in readers," not as "what passions the readers carry." This is a *prompt-shape* observation rather than an AC-18 finding. Recommendation: D11 (Layer 3 specification) should include a rule for the social-filter projection that frames reader_triggered_passions in invitation-language rather than diagnostic-language.

### 6. AC-13 shape

Natural trigger conditions on this surface:

- **Tier 1 (force) — POST_ELEMENT_FUSION.** When the post text mixes multiple distinct claims or tones in a way the engine cannot evaluate as a single artefact (a thread-of-thoughts pasted as one block), Tier 1 should ask the practitioner to either pick one to focus on, or confirm they want a unified evaluation.
- **Tier 2 (soft) — POST_PURPOSE_AMBIGUITY.** When the platform-context is unclear (the practitioner picked "general" and the post could be a tweet, an email, or an internal Slack message), the engine can offer a soft clarification before evaluation.
- **Tier 3 (deterministic withhold).** Praxis-level motivation classifications attached to "should I publish this?" depend on the practitioner's framing of why they want to publish. If the framing is ambiguous about motivation (philodoxia vs genuine information-sharing), withhold rather than guess.

### 7. AC-17 shape

Both AC-17 seams apply with the same shape as `/api/score`: `SELF_REPORT_DEPENDENT` on praxis-level motivation classifications, `CONFIDENCE_WEIGHTED` on eupatheia identification (rare on this surface).

### 8. Phase-3+ migration projection

D2 Table 5 covers the projection. The `publish_recommendation` is an application-specific downstream classification (the canonical proximity → English recommendation mapping) and lives in this consumer's Layer 3 specification. No coverage gap on this surface.

### 9. As-built rollback baseline pointer

No existing snapshot. Before Phase 3+ migration, a snapshot should capture: the platform-parameter-driven prompt shaping; the poster / reader passion split; the publish-recommendation downstream classification rule; the page-side share/download action (page-managed only, no server persistence beyond analytics).

Snapshot work for `/api/score-social` is **not urgent** before Phase-1 session 2.

---

## Route 6 — `/api/reason`

### 1. Plain-language description

The `/api/reason` route is the universal reasoning layer and the engine entry point. It is the most architecturally central of the eight perimeter routes: it accepts both authenticated user sessions (JWT) and API-key callers (agent developers using SageReasoning as a service), and it serves three depths (`quick` / `standard` / `deep` — three / five / six mechanisms respectively). Most of the other R20a perimeter routes call into the same engine via `runSageReason`; the routes are wrappers that add domain-specific framing. `/api/reason` is the wrapper-free entry point.

The operative question the practitioner or agent is answering: "Apply the Stoic core triad (or more, depending on requested depth) to this input. Return structured reasoning evaluation."

This route has **multiple page-side and server-side callers**. Enumerating those callers is part of the audit work for this surface.

### 2. Server-side workflow

**Step 1 — Rate-limit gate.** Scoring rate limit.

**Step 2 — Authentication gate (dual mode).** This is the one R20a-perimeter route that accepts API-key callers in addition to user sessions. The route first attempts `requireAuth(request)` (user JWT). If that fails, it falls back to `validateApiKey(request, 'other')`. The request is rejected only if both auth methods fail. This dual-mode is what makes `/api/reason` the agent-developer-facing surface as well as a website-internal surface.

**Step 3 — Body parse.** Fields: `input` (the decision / action / situation to reason about), `context`, `depth` (`quick` / `standard` / `deep`, default `standard`), `domain_context`, `urgency_context`. Empty `input` returns 400 with a descriptive error.

**Step 4 — Text-length validation.** `input`, `context`, and `domain_context` all bounded to `TEXT_LIMITS.medium`. Length violations return 400.

**Step 5 — R20a vulnerable-user detection.** `await enforceDistressCheck(detectDistressTwoStage(input))`. The distress check runs against `input` only — `context` and `domain_context` are not scanned. Practical implication: if a callers passes distress-bearing content in `context` rather than `input`, the gate would not fire. **Audit observation:** this is the same asymmetry as Route 2 (decision vs options). For agent callers in particular, who may construct request bodies programmatically, the asymmetry is a small but real R20a coverage gap. Recommendation: add a brief D11 / D14 note on whether AC-13 / AC-17 wiring should also broaden the R20a check to `context` and `domain_context` when the route migrates.

**Step 6 — Depth validation.** `depth` must be `quick`, `standard`, or `deep`. Invalid returns 400.

**Step 7 — Parallel context loading.** `practitionerContext` is loaded only if the auth path was user-session (auth.user.id present); for API-key callers, practitionerContext is `null` (KG4 — Layer 2 not applicable for API-key auth, the canonical pattern). `projectContext` is always loaded at `condensed` level. Loaded in parallel via `Promise.all`.

**Step 8 — Stoic Brain context loading.** `stoicBrainContext = getStoicBrainContext(depth)`. Loaded synchronously (cached function — constant-time read).

**Step 9 — Engine call.** `runSageReason({ input, context, depth, domain_context, urgency_context, stoicBrainContext, practitionerContext, projectContext })`. The engine handles the LLM call (Sonnet at standard / deep, Haiku at quick — though see the AC1 / KG2 note below), prompt-cache headers, and structured output validation.

**Step 10 — Direct response return.** Unlike Routes 1–5, this route does **not** wrap the engine result in `buildEnvelope`. It returns the engine's result directly with CORS headers. The engine itself produces an envelope-shaped result internally; the route exposes that envelope as-is. This is the *agent-facing* response shape — agent callers get the raw engine output without further normalisation.

**Audit observation on AC1 / KG2.** The route accepts `depth: 'quick'` which would trigger Haiku per the engine's depth-to-model selection. Per AC1 (Haiku not suitable for multi-step reasoning) and KG2 (Haiku reliability boundary), the three-mechanism quick depth is on the boundary of what Haiku can produce reliably. The R20a distress classifier (which is also Haiku) is well within the boundary because its output is a single small JSON. The reason quick depth has historically held because the three mechanisms produce a relatively compact JSON. The audit notes this as a constraint rather than a defect; any future expansion of the quick-depth output schema should re-evaluate against AC1.

### 3. Page-side and server-side callers (enumeration)

The grep for `'/api/reason'` returns **multiple distinct callers**. Each caller is a micro-flow with its own page-side or upstream-route context.

**Caller A — `/private-mentor/page.tsx` (proximity ring widget).** The private-mentor page calls `/api/reason` after each mentor turn to refresh the proximity ring widget. The call is `fetch('/api/reason', { method: 'POST', body: JSON.stringify({ input: <recent message>, depth: 'quick' }) })`. The proximity ring widget then displays values returned by that call — though the snapshot at `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` step 24 notes that the displayed values in the current build are partly hard-coded in `fetchProximityScore` rather than derived from the `/api/reason` response. **Audit observation:** this is an existing known issue, captured in the snapshot as one of four observations held for separate decision. The proximity-ring caller's effective dependency on `/api/reason` is currently broken in practice; the values shown are not the reason the call is made.

**Caller B — `/mentor-hub/page.tsx`.** Two call sites: one in the main interaction handler (line 123), one in a proximity-update handler (line 168). The mentor-hub page uses `/api/reason` analogously to private-mentor — periodic reasoning evaluation alongside the conversation surface.

**Caller C — `/ops-hub/page.tsx`.** Two call sites: `handleStoicCheck` (line 45 — generic Stoic evaluation entry, `depth: 'standard'`) and `handleAlertEvaluation` (line 93 — evaluating alert text with `depth: 'quick'`). Neither caller checks `data.distress_detected` before rendering. **Audit finding (parallel to the Route 2 finding on Ops Hub):** the Ops Hub callers of `/api/reason` do not handle the R20a distress-redirect output shape. If the route returns a distress redirect (which it can, per Step 5 above), the Ops Hub page would render the distress payload as if it were a reasoning result.

**Caller D — `mentor-index/page.tsx`.** The mentor-index page declares `/api/reason` as the endpoint for several skill cards (lines 33, 46, 59, 74, 88, 102) but does not directly POST to it from the page. The skill cards present a "try this skill" affordance that posts to `/api/reason` with skill-specific `domain_context`. This is the agent-developer-discovery flow rather than a practitioner-evaluation flow.

**Caller E — Internal sage-reason engine reuse (`sage-reason-engine.ts`).** The engine itself uses `/api/reason` as a cache-key prefix (line 428) and as the canonical endpoint name in caller envelopes. Not a runtime call — a labelling convention.

**Caller F — Skill registry (`skill-registry.ts`).** Three skill entries point to `/api/reason` with depth metadata (`quick` 3-mechanism, `standard` 5-mechanism, `deep` 6-mechanism). These are skill-discovery entries for the agent-developer-facing API surface (`/api/skills`), not runtime callers.

**Caller G — Skill handler map (`skill-handler-map.ts`).** The map links the skill ID `sage-reason` to `reasonPOST` (line 60). This is the routing layer that lets internal callers request reasoning by skill name without knowing the route path.

**Caller H — Composability hints in other routes.** Routes 1, 4, 5, 7 plus `/api/baseline`, `/api/evaluate`, `/api/score-iterate`, `/api/skill/sage-classify`, `/api/skill/sage-prioritise`, `/api/patterns` all include `/api/reason` in their `composability.next_steps[]` envelope hints. These are post-result recommendations to the agent caller, not direct runtime calls.

**Net runtime callers from page-side:** `/private-mentor`, `/mentor-hub`, `/ops-hub` (twice). The `/mentor-index` page is a discovery surface, not a runtime caller.

### 4. Flow distinctions

`/api/reason` serves **multiple practitioner / agent flows on the same code path**, distinguished by the caller context rather than by a route-side discriminator. The route itself has one body schema and one engine path; the *meaning* of a request varies by who is calling and why:

- **Flow 1 — Website internal proximity-ring refresh.** `/private-mentor` and `/mentor-hub` call with `depth: 'quick'`. The practitioner's mentor turn is being scored to update the proximity ring. The result is consumed by the page widget, not shown to the practitioner as a separate evaluation.
- **Flow 2 — Website internal Stoic-check / alert-evaluation.** `/ops-hub` calls with `depth: 'standard'` (handleStoicCheck) or `depth: 'quick'` (handleAlertEvaluation). The practitioner is asking for a Stoic evaluation of an arbitrary input. The result is rendered on the Ops Hub panel.
- **Flow 3 — Agent developer call (API-key auth).** An external agent posts arbitrary `input` and receives the raw engine envelope. This is the public-API surface for agent developers.
- **Flow 4 — Skill-handler internal routing.** Other website routes (sage-classify, sage-prioritise, baseline, evaluate, patterns, score-iterate) compose `/api/reason` into their own pipelines via direct function call to `reasonPOST` (not over HTTP). These are internal compositions, not separate flows from the engine's perspective.

The audit's flow-ambiguity check identifies one *load-bearing* flow distinction to surface for founder review:

**Flow distinction — Practitioner-facing vs agent-facing.** When `/api/reason` is called by a website page (Flows 1, 2), the practitioner is the subject of the evaluation; the call is part of the practitioner's reasoning practice. When it is called by an agent developer (Flow 3), the *agent* is the subject (or, more accurately, the agent's reasoning is being evaluated by a third-party system that uses SageReasoning as a service). The R20a distress-detection wiring is correct for both — distress in the input is distress regardless of who sent it — but the *response shape* and the *practitioner-context loading* differ:

- Flow 1/2 (user-session) → practitionerContext loaded → response includes personalisation.
- Flow 3 (API-key) → practitionerContext null → response is generic.

This is **not** an Option-1-shaped flow ambiguity (where one code path was conflating two practitioner intentions). It is a documented dual-auth pattern where the route deliberately serves both audiences with different context-loading. The audit confirms that the dual-auth pattern is intentional and architecturally correct. KG4 (Layer 2 applicability vs wiring) is the relevant knowledge-gap entry: API-key callers have Layer 2 marked Not Applicable, not Not Wired.

The Phase-1 session 2 implication: D14 / D14a / D14b should preserve `/api/reason`'s dual-auth pattern. The conversation surface (when it eventually consumes the engine) needs to be aware that the engine itself is multi-tenant and that practitioner context only flows when there is a practitioner.

### 5. AC-18 shape

`/api/reason` returns the engine's full evaluation envelope to the caller. For Flows 1, 2 (website internal), the result is consumed by the calling page, which decides what to render. For Flow 3 (agent developer), the result is the practitioner-facing payload from the agent's own product (with their own UI choices about visibility).

AC-18 does not apply at the route level. It applies at the surface level. If a consumer of `/api/reason` is the deferral-resolution surface (which it is not currently — the deferral-resolution surface is `/api/mentor/private/reflect`), then AC-18 would constrain the *visible projection* on that consumer, not the engine's output. The route itself produces the canonical engine output; AC-18 is enforced where the engine output is rendered.

For agent callers (Flow 3), the engine output is the agent's input. SageReasoning has no architectural authority over what an agent does with the result. The R18 honest-certification language and the R3 disclaimer are the operative constraints there.

### 6. AC-13 shape

`/api/reason` is the canonical entry point where AC-13 wiring should live for the engine itself. Tier 1 / Tier 2 / Tier 3 triggers are operationalised by the engine on the input it receives; the route is responsible for flowing the trigger results back to the caller with the correct shape:

- Tier 1 force → engine returns a `clarification_required: true` payload with the question text and the trigger code (`ELEMENT_FUSION` / `SCOPE_AMBIGUITY` / `TEMPORAL_AMBIGUITY`); the caller surfaces the question and re-posts with the answer.
- Tier 2 soft → engine returns the evaluation result *plus* a `soft_clarification: { question, trigger_code }` field; the caller can choose to surface the question or proceed with the result as-is.
- Tier 3 deterministic withhold → engine returns the evaluation result with specific fields nulled and an `open_deferrals[]` array naming the withheld classifications and their deferred questions; the caller surfaces the deferral as a flag in the practitioner's record.

This is the load-bearing AC-13 wiring for the entire R20a perimeter. It lives on `/api/reason` because the engine is here. Routes 1, 2, 4, 5, 7 inherit AC-13 by calling into the engine; Route 3 (`/api/score-document` direct LLM call) would need its own AC-13 implementation or migration to the engine.

### 7. AC-17 shape

`/api/reason`'s output should carry both AC-17 flags directly:

- `self_report_dependent: { fields: [...], reasoning: "..." }` on praxis-level motivation classifications.
- `confidence_weighted: { level: 'low' | 'medium' | 'high', reasoning: "..." }` on eupatheia and Senecan grade classifications.

These flags are part of the canonical engine output schema (D2 mechanism 10's outputs include `self_report_dependent` and `confidence_weighted`). Current engine does not produce them; Phase 3+ migration adds them and Layer 3 surfaces them in prose for caller-facing surfaces.

### 8. Phase-3+ migration projection

`/api/reason` is the route that *defines* the canonical projection. There is no per-route migration projection in the same sense as Routes 1–5. The route's three depths map onto the canonical framework as:

- `depth: 'quick'` (3 mechanisms — control, passion, oikeiosis) → mechanisms 1, 2/3 collapsed, 6/7 collapsed. After Phase 3+ migration, quick depth becomes mechanisms 1 + 2 + 3 + 6 (no false-judgement, no obligation, no value, no virtue, no proximity). This is a faster cheaper variant of the engine, intended for low-stakes evaluations.
- `depth: 'standard'` (5 mechanisms) → D2 Table 1.
- `depth: 'deep'` (6 mechanisms — adds iterative_refinement) → D2 Table 2 (iterative_refinement folded into mechanism 10's longitudinal projection per the Table 2 note).

**Coverage gap surfaced by the audit:** D2 does not have a dedicated projection table for `depth: 'quick'` (the three-mechanism shape). Recommendation: D2 receives a Table 0 (or equivalent) for the quick-depth mapping, since the quick-depth shape is also the proximity-ring widget consumer's input shape.

### 9. As-built rollback baseline pointer

The conversation surface snapshot (`/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md`) covers `/api/reason`'s use as the proximity-ring refresh call (step 24 of the snapshot). That coverage is partial — it documents the call shape and the broken-in-practice nature of the proximity-ring read — but it does not capture `/api/reason`'s full shape (dual-auth, three-depth, agent-facing).

A dedicated `/api/reason` snapshot is the highest-priority snapshot in the perimeter, because:

1. The engine is the point alt-3's translation-sandwich architecture transforms most directly. AC-12 lands on the engine's internal logic.
2. The dual-auth pattern, three-depth surface, and direct-engine-output return shape are not captured anywhere else.
3. Phase 2 pass 2 (conversation surface build) builds against a working engine; if `/api/reason`'s shape changes during Phase 2, downstream callers break silently.

**Recommendation:** produce an `/api/reason` snapshot before Phase-1 session 2 begins, or as the first deliverable of Phase-1 session 2 alongside D14a / D14b. This is the only snapshot the audit recommends as urgent.

---

## Route 7 — `/api/reflect`

### 1. Plain-language description

The `/api/reflect` route is the public daily-reflection endpoint. It is the "public sister" to `/api/mentor/private/reflect` — it produces the same kind of reflection evaluation (proximity, passions detected, what the practitioner did well, sage perspective, evening prompt, disclaimer) but with **no rich Layer 2/3 mentor context** and **no founder-specific persistence pipeline**. It is intended for:

- Agent developers who want to integrate daily reflection into their own products (a common API consumption pattern).
- The internal feedback loop that wires reflection findings back into the practitioner's mentor profile (passion map, rolling window — the "self-improving feedback loop" wiring from 2026-04-08, which is *implemented at this route* even though the route itself has no human-facing page).

The operative question the practitioner or agent is answering: "Capture today's reflection — what happened and how the practitioner responded. Return a Stoic evaluation suitable for journaling, longitudinal pattern detection, and feeding back into the practitioner's profile."

### 2. Server-side workflow

**Step 1 — Rate-limit gate.** Scoring rate limit.

**Step 2 — Authentication gate.** `requireAuth(request)`. User-auth only. **Note:** unlike `/api/reason`, this route does not accept API-key callers, even though it is the agent-developer-friendly reflection endpoint. Agents must use a user-bound JWT to call it. Audit observation: this is consistent with R17 (intimate data protection — reflections are intimate data and require user-bound auth) but worth flagging that the natural API consumer pattern of "agent calls reflection on behalf of practitioner" requires a delegated-auth pattern that is not currently documented.

**Step 3 — Body parse.** Fields: `what_happened` (required, the day's narrative), `how_i_responded` (optional — the practitioner's response to what happened), `user_id` (optional — when present, triggers persistence and profile-update side-effects).

**Step 4 — Text-length validation.** `what_happened` and `how_i_responded` (if present) bounded to `TEXT_LIMITS.medium`. `what_happened` must also be at least 10 characters; under that returns 400.

**Step 5 — R20a vulnerable-user detection.** `await enforceDistressCheck(detectDistressTwoStage(combinedInput))` where `combinedInput = "${what_happened} ${how_i_responded || ''}"`. **Note:** unlike Routes 1, 2, 6, the distress check on this route is correctly run against *both* fields (concatenated). This is the most defensively-wired distress check in the perimeter.

**Step 6 — Distress redirect with logging.** If the gate fires, the route inserts an `analytics_events` row with event type `distress_detected` (recording severity and indicators_found, plus `mentor_mode: 'public'` and `endpoint: '/api/reflect'`) — **and this insert is fire-and-forget (`.then(() => {})`) at the route layer**. KG1 rule 2 candidate violation: this is a safety-relevant insert that may not complete on Vercel before the response returns. **Audit finding:** this insert should be awaited. The distress-event log is part of the safety-monitoring trail and losing it silently defeats the monitoring. After logging, the route returns the distress-redirect response.

**Step 7 — Context-layer loading.** Layer 1: `getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis'])` — note this loads only two mechanisms' Stoic Brain context, not the full `getStoicBrainContext('standard')`. This is a structural choice that constrains the reflection to passion + oikeiosis mechanisms specifically. Layer 2: `getPractitionerContext(auth.user.id)`. Layer 3: `getProjectContext('minimal')` — note minimal depth, not condensed.

**Step 8 — User-message construction.** A free-text "Daily reflection: What happened: ... How I responded: ... Score my actions and give me the sage perspective." plus optional practitioner and project context appended.

**Step 9 — Anthropic call.** Direct call to `client.messages.create` (this route, like `/api/score-document`, calls Claude directly rather than going through `runSageReason`). Model: `claude-sonnet-4-6`. `max_tokens: 1024`. `temperature: 0.3`. System: `[REFLECTION_PROMPT with cache_control ephemeral, stoicBrainContext]`. The `REFLECTION_PROMPT` is the 4-stage reflection prompt — same shape as `/api/mentor/private/reflect`'s prompt at the structural level. Audit observation: this is the second route in the perimeter that bypasses the shared engine; the eventual alt-3 migration will need to address this similarly to `/api/score-document`.

**Step 10 — Response parse.** `extractJSON(responseText)` parses the response (with markdown-fence-stripping fallback handled by the helper). Parse failure returns 500.

**Step 11 — Proximity-level validation.** `katorthoma_proximity` must be one of the canonical five values; invalid returns 500.

**Step 12 — Reflection persistence.** If `user_id` was provided, the route inserts a row into `reflections` with the practitioner's narrative, response, proximity, passions, sage perspective, and evening prompt. **The insert is fire-and-forget (`.then(() => {})`) at the route layer.** KG1 rule 2 candidate violation again — the practitioner's reflection may not be persisted on Vercel before the response returns. **Audit finding:** this insert should be awaited.

**Step 13 — Receipt generation.** A reasoning receipt is generated (skill ID `sage-reflect`, two mechanisms cited: `passion_diagnosis`, `oikeiosis`).

**Step 14 — Result assembly.** The result includes `katorthoma_proximity`, `passions_detected[]`, `what_you_did_well`, `sage_perspective`, `evening_prompt`, `reasoning_receipt`, `disclaimer`, `reflected_at`.

**Step 15 — Analytics insert.** Fire-and-forget insert into `analytics_events` with event type `daily_reflection`. KG1 rule 2 candidate violation again.

**Step 16 — Profile update (self-improving feedback loop).** If `user_id` was provided, the route dynamically imports `updateProfileFromReflection` from `sage-mentor/profile-store` and calls it with the reflection findings. This updates the practitioner's passion map and rolling window. **The dynamic-import pattern is the bridge pattern from the route documentation** — used because `sage-mentor` may not be available in the website build context. The call is wrapped in try/catch so a profile-update failure does not break the reflection API. Audit observation: this is the wiring that makes the reflection feed back into the mentor profile, which then surfaces in the next mentor turn's Layer 2 context. This is the sole point in the perimeter where reflection findings persist back into longitudinal profile state.

**Step 17 — Response envelope build and return.** `buildEnvelope(...)` packages the result with composability hints (next steps: `/api/reflect`, `/api/score`).

### 3. Page-side workflow

**There is no human-facing page that POSTs to `/api/reflect`.** The grep returned no matches for `fetch('/api/reflect'` or `authFetch('/api/reflect'` from any page under `/website/src/app`. Adjacent surfaces:

- `/reflections/page.tsx` is the *history viewer* — it calls `GET /api/reflections` (the listing endpoint, plural) to retrieve previously-stored reflections. It does not call POST `/api/reflect`. The page documentation acknowledges this: "Each reflection was created via /api/mentor/private/reflect or /api/reflect."
- `/private-mentor/page.tsx` calls `/api/mentor/private/reflect` (the founder-only enriched endpoint), not `/api/reflect`.
- `/api/mentor/private/reflect/route.ts` itself is documented as "Same reflection logic as the public /api/reflect, but with richer context."
- The `/api/baseline` and `/api/mentor-journal-week` routes name `/api/reflect` in their composability hints (suggested next-steps for callers).

The audit's conclusion: **`/api/reflect` is API-only.** It exists for two consumers:

- **Agent developers** who want to integrate daily reflection into their products. The route is on the public API surface (per `/api/stoic-brain/route.ts`'s endpoint catalogue, line 76).
- **Internal callers** that want to record a reflection and trigger the profile-update feedback loop without going through the founder-specific private mentor flow. Currently no internal caller exists — but the route is wired up so that any future website surface that wants to record reflections programmatically can use it.

The absence of a page-side caller is intentional. The website's user-facing reflection surface is the private-mentor's morning/evening rituals (which post to `/api/mentor/private/reflect`); the public `/api/reflect` is the API parallel for agent consumption.

### 4. Flow distinctions

`/api/reflect` serves **two practitioner / agent flows on the same code path**, distinguished by the presence of `user_id`:

- **Flow 1 — Anonymous evaluation (no user_id).** The route evaluates the reflection and returns the result without persisting and without updating any profile. This is the agent-developer-stateless mode.
- **Flow 2 — Authenticated persistence + profile update (user_id present).** The route persists the reflection to `reflections` (currently fire-and-forget, see audit findings above) and triggers `updateProfileFromReflection` to feed the findings back into the practitioner's mentor profile. This is the website-internal-state mode.

These are **genuinely distinct flows** — same engine path, different side-effect profile. Audit observation: this is *not* an Option-1-shaped flow ambiguity, because the side effects do not affect what the practitioner sees in the response. Both flows return the same evaluation shape. The flow distinction is in the *external state* the route mutates, not in what it shows.

A mild concern worth flagging: the conditional `user_id` parameter is the discriminator for both persistence and profile-update side effects, but the auth check (Step 2) requires `auth.user.id`. The practitioner is authenticated, but the route uses a separate `user_id` from the body for persistence. This means an authenticated user could call the route without a `user_id` body field and get a stateless evaluation, or pass a *different* `user_id` than their own auth identity (the route does not check that body `user_id` matches `auth.user.id`). **Audit finding:** the route does not verify `user_id === auth.user.id` before persisting or updating profile. This is a low-likelihood but real R17 (intimate data protection) finding — an authenticated user could potentially write a reflection into another user's record. Recommendation: add `user_id === auth.user.id` check, or drop the body `user_id` parameter and use `auth.user.id` directly.

### 5. AC-18 shape

`/api/reflect` produces visible output to the API caller (and the consumer's UI presents that output to the practitioner). The output is the reflection evaluation: proximity, passions, what-you-did-well, sage perspective, evening prompt. This is the intended consumer experience.

**AC-18 does not apply to `/api/reflect`'s default (daily-reflection) flow.** The reflection evaluation is the intended output for both API consumers and any future internal page-side caller.

The audit notes one architectural connection worth surfacing: the "evening prompt" is structurally the same kind of artefact that AC-15 sub-option 1b's deferral-resolution surface produces (a question for the practitioner to sit with). On the deferral-resolution surface, the practitioner *receives* a deferred question to reflect on; on the daily-reflection surface, the practitioner *receives* a fresh question for tonight. Both are forward-looking reflective questions. The architectural difference is that the deferral-resolution question is *deterministically produced from a prior OPEN_DEFERRAL flag* (no LLM at the question-selection layer), while the daily-reflection evening prompt is LLM-composed. AC-18's argument applies to outputs that *evaluate the practitioner's reasoning about themselves* and produce a sharable artefact; both surfaces' forward-looking questions are *invitations to future reasoning*, not evaluations of past reasoning, and so are honourable on both surfaces.

### 6. AC-13 shape

Natural trigger conditions for `/api/reflect`:

- **Tier 1 (force) — REFLECTION_NARRATIVE_THIN.** When `what_happened` is under 50 characters or describes only an event without any reasoning context, the engine cannot extract structured features. Tier 1 question: "Can you say a bit more about what happened, and what you noticed in your own response to it?"
- **Tier 1 (force) — RESPONSE_FIELD_INCONSISTENCY.** When `how_i_responded` describes a response to a different event than `what_happened`, Tier 1 should reconcile.
- **Tier 2 (soft) — STATED_OPERATIVE_CONFLICT.** Same as on `/api/score`; the practitioner's stated concern may conflict with the operative concern.
- **Tier 3 (deterministic withhold).** Praxis-level motivation classifications attached to reflections depend heavily on `SELF_REPORT_DEPENDENT` data — reflections are entirely self-report. AC-17's flag is more central here than on any other surface in the perimeter except the deferral-resolution surface itself.

The two-mechanism scoping (`passion_diagnosis`, `oikeiosis`) at Step 7 is the route's structural choice about which mechanisms run. Phase 3+ migration should reconsider whether the reflection surface should run the full canonical engine or a scoped-down variant. The audit notes this as an open design question for D14a / D14b's eventual migration of the reflection surfaces.

### 7. AC-17 shape

`/api/reflect` is heavily AC-17-shaped. **Both seams apply with high salience:**

- `SELF_REPORT_DEPENDENT` is the dominant constraint — reflections are entirely self-report. Every classification produced from a reflection (proximity, passion attribution, false judgement, virtue engagement) depends on the practitioner's narrative being honest. The current route asserts; AC-17 wiring would surface flags pervasively.
- `CONFIDENCE_WEIGHTED` applies to longitudinal aspects of the reflection — particularly when the reflection touches eupatheia-shaped reasoning (the practitioner reports "I noticed I responded with rational caution, not fear" — chara / boulesis / eulabeia identification needs longitudinal evidence).

Phase 3+ migration should make this the surface where AC-17 wiring is *most prominently surfaced* in Layer 3 prose ("Your reflection suggests boulesis (rational wish) replacing epithumia in this domain — but a single reflection cannot confirm that. We'll watch for the pattern across the next several reflections."). This is the kind of architectural honesty the alt-3 design specifies.

### 8. Phase-3+ migration projection

The output projects onto the canonical framework via D2 Table 4a (the daily-reflection ritual surface, post-Option-1):

- `katorthoma_proximity` → mechanism 10.
- `passions_detected[]` → mechanisms 2 + 3 + 5.
- `what_you_did_well` → Layer 3 prose translation of mechanism 9 (positive virtue engagement).
- `sage_perspective` → Layer 3 prose translation of `improvement_path` from mechanism 5.
- `evening_prompt` → Layer 3 LLM-composed reflective question (today; under alt-3 this becomes a structured slot-fill from the canonical AC-13 question stems plus situational variables).
- `disclaimer` → R3 disclaimer in envelope.

The mapping is the same as for the daily-reflection ritual on `/api/mentor/private/reflect`'s ritual flow, with the key architectural difference that `/api/reflect` does not have the rich Layer 2 mentor-profile context that the founder-specific private endpoint has. Phase 3+ migration sees both `/api/reflect` (public) and `/api/mentor/private/reflect`'s ritual flow (founder) consuming the same canonical engine output, projected differently per consumer's Layer 3 specification.

**Audit observation:** D2 Table 4a is currently named the "ritual surface" projection. The audit confirms that `/api/reflect` is also a ritual-surface consumer (with thinner context), so D2 Table 4a's projection covers both. Recommendation: D2 Table 4a's heading could be amended to make this dual-applicability explicit.

### 9. As-built rollback baseline pointer

No existing snapshot. The conversation-surface snapshot does not cover `/api/reflect`. Before Phase 3+ migration, a snapshot should capture: the dual-flow (anonymous vs authenticated-persistence) shape; the direct `client.messages.create` call (bypassing `runSageReason`); the two-mechanism Stoic Brain scoping; the dynamic-import bridge pattern for the profile-update wiring; the four fire-and-forget inserts (distress-event log, reflection persistence, analytics, plus the awaited profile-update); the `reflections` table schema; and the `user_id`-vs-`auth.user.id` discrimination question flagged in the flow-distinctions section.

Snapshot work for `/api/reflect` is **medium urgency** before Phase-1 session 2. The route's audit findings (KG1 rule 2 candidate violations on the analytics, reflection persistence, and distress-event inserts; and the `user_id` vs `auth.user.id` finding) are independent of any Phase 1 / Phase 2 design work and could be addressed sooner if the founder prioritises them. Both are not in scope for this audit to fix; they are surfaced for the founder to decide on separately.

---

## Route 8 — `/api/mentor/private/reflect`

### 1. Plain-language description

The `/api/mentor/private/reflect` route is the founder-only private-mentor reflect endpoint. It serves the morning check-in and evening reflection rituals on the `/private-mentor` page via the same code path. Its server-side and page-side workflows were captured at the depth of the audit method in the predecessor session's evening-reflection walkthrough; this audit references that work and adds the morning-reflection symmetry.

The operative question the practitioner is answering: morning — "Today is starting; what is operative in my reasoning as I begin?"; evening — "Today has happened; how did I act, and what does the action reveal about my reasoning?"

### 2. Server-side workflow (predecessor reference + morning symmetry)

The full server-side workflow is captured in the 2026-05-01 session's evening-reflection walkthrough (steps 1–26 from button-press to mentor bubble). The route follows: rate-limit gate → `requireAuth(request)` with `FOUNDER_USER_ID` enforcement → body parse (`what_happened` always present; `how_i_responded` evening-only) → R20a distress check on combined input → context-layer loading (Layer 1 Stoic Brain at standard depth, Layer 2 practitioner context, Layer 3 project context, Layer 5 mentor knowledge base — richer context than `/api/reflect`) → direct `client.messages.create` call → response parse → proximity validation → richer persistence pipeline (mentor knowledge persistence via Haiku observation extraction; mentor interaction recording with hub_id `'private-mentor'`) → response envelope build and return.

**Morning vs evening symmetry.** The route is hardcoded to the same prompt and the same context-loading regardless of whether the call is morning or evening. The page-side `submitRitual('morning' | 'evening')` is the discriminator: morning skips the second `how_i_responded` field; evening includes it. The route reads `how_i_responded` as optional and processes whichever fields are present. The same engine call, same persistence pipeline, same output shape. The only meaningful difference is the practitioner's input shape: morning is single-field intent narrative; evening is dual-field action + response narrative.

### 3. Page-side workflow (predecessor reference + morning symmetry)

The full page-side workflow for the evening reflection ritual is captured in the predecessor session's walkthrough. The morning reflection ritual is **structurally identical** at the page level:

**Step 1 — View switch.** The practitioner navigates to either `MorningView` or `EveningView` on `/private-mentor`. Both views render their own textarea(s) and a "Share with mentor" button.

**Step 2 — Form capture.** MorningView has one textarea (`#morningReflection` or equivalent — captures the morning intentions narrative). EveningView has two textareas (`#eveningReflection` for `what_happened`; `#eveningResponseInput` for the optional `how_i_responded`).

**Step 3 — `submitRitual(type)` invocation.** The button's onClick is `() => submitRitual('morning')` or `submitRitual('evening')`. The function reads the textarea(s), validates non-empty, optionally reads the response field (evening only), and prepares the body.

**Step 4 — Outbound POST.** `authFetch('/api/mentor/private/reflect', { method: 'POST', body: JSON.stringify({ what_happened: reflection, how_i_responded: howResponded }) })`. For morning, `howResponded` is undefined and is omitted from the JSON body; for evening, it is the trimmed second field or undefined if empty.

**Step 5 — Response handling and distress branch.** The page reads `data.distress_detected || data?.result?.distress_detected` (handles both top-level and envelope-wrapped distress responses). On distress, a support message bubble is appended to the conversation surface; the textarea is cleared; loading is stopped.

**Step 6 — Render.** The page extracts `result?.sage_perspective` and constructs a formatted message bubble: `**${katorthoma_proximity}** — ${sage_perspective}` plus optionally `*${evening_prompt}*` in italics. The formatted bubble is appended to the conversation surface as an `'insight'` type message. A toast appears: "Morning check-in shared with mentor" or "Evening reflection shared with mentor" depending on type.

**Step 7 — Proximity ring refresh.** After the ritual is submitted, `fetchProximityScore()` runs (which calls `/api/reason` per the proximity-ring widget — see Caller A under Route 6).

### 4. Flow distinctions

`/api/mentor/private/reflect` serves **two practitioner flows on the same code path** — the canonical example of the flow ambiguity that prompted Option 1:

- **Daily-reflection ritual** (morning + evening). The practitioner submits the day's narrative and receives the formatted mentor response (proximity, perspective, prompt). Morning skips the response field; evening includes it. Both produce visible output.
- **Deferral-resolution surface** (alt-3's AC-15 sub-option 1b). The practitioner sees a specific deferred question from a prior OPEN_DEFERRAL flag, submits a reflection addressing it, and the engine processes deterministically. **Currently not implemented** — the deferral-resolution flow is a *future* addition that AC-15 specifies.

Today's route serves only the daily-reflection ritual flow. Phase 2 build adds the deferral-resolution flow, possibly on the same route or possibly on a separate route. D14b (deferral-resolution surface) decides which.

**The Option 1 scoping correction (adopted 2026-05-01) is the architectural fix for the flow ambiguity.** AC-18 scopes to the deferral-resolution flow only. The daily-reflection ritual flow preserves visible output. Tables 4a (ritual) and 4b (deferral) in D2 capture the canonical projection per flow. Deliverable 14a specifies the daily-reflection ritual endpoint design; Deliverable 14b specifies the deferral-resolution surface design.

### 5. AC-18 shape

The Option 1 scoping correction is operative on this route. **AC-18 holds on the deferral-resolution surface (Table 4b); AC-18 does not hold on the daily-reflection ritual surface (Table 4a).**

The audit confirms that Option 1 is sufficient as written for this surface. The architectural argument behind AC-18 (the philodoxia-as-reputation-mechanism reasoning — visible reflection score on the deferral-resolution surface re-introduces the reputation mechanism the architecture was designed to remove) applies specifically to the deferral-resolution surface, not to the daily-reflection ritual surface. Producing visible output on the daily-reflection ritual is the architectural intention; producing visible output on the deferral-resolution surface would defeat the architectural commitment.

### 6. AC-13 shape

This route is the **load-bearing AC-13 surface** in the perimeter. AC-13's three-tier intake clarification model was designed in conjunction with AC-15 sub-option 1b (the deferral-resolution surface), and the deferred question is the canonical Tier 3 OPEN_DEFERRAL output. When the engine deterministically withholds at scoring time, the withheld question is what the practitioner eventually sees on the deferral-resolution surface.

For the daily-reflection ritual flow, AC-13 wiring is the same shape as `/api/reflect` (see Route 7's AC-13 section). For the deferral-resolution flow, AC-13 wiring is the resolution mechanism itself — the practitioner has come to the surface specifically to address a deferred question.

### 7. AC-17 shape

Both AC-17 seams apply with the same shape as `/api/reflect` (see Route 7's AC-17 section). The richer Layer 2 mentor-profile context on this route means `CONFIDENCE_WEIGHTED` classifications can fire with higher confidence than on the public reflect endpoint — the longitudinal record is available.

### 8. Phase-3+ migration projection

The output projects onto the canonical framework via D2 Tables 4a (daily-reflection ritual surface) and 4b (deferral-resolution surface). The ritual flow's mapping is the same as `/api/reflect` plus the `structured_observation` field (mentor knowledge persistence pipeline output, optionally surfaced). The deferral flow's "mapping" is the explicit absence of visible output — the canonical engine output exists but is not projected to a visible artefact, only to internal state (closed OPEN_DEFERRAL flag, retrospective score adjustment on the original instance).

The audit confirms D2's coverage for this route. No coverage gap.

### 9. As-built rollback baseline pointer

The conversation surface snapshot at `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` partially covers this route (it covers the founder-hub mentor pipeline, which shares the route's underlying engine path but not the dedicated reflect endpoint). A dedicated `/api/mentor/private/reflect` snapshot is the second-highest-priority snapshot in the perimeter (after `/api/reason`):

1. Phase 2 pass 1 builds the deferral-resolution surface (D14b's specification) on this route's territory. The reflect endpoint is the load-bearing first-build surface.
2. The daily-reflection ritual surface (D14a's specification) preserves today's behaviour but with engine substitution underneath. A snapshot before substitution lets the founder verify the ritual surface continues to behave identically post-substitution.
3. The 2026-05-01 evening-reflection walkthrough is the closest existing as-built record but it lives in a session-close document, not an archive snapshot.

**Recommendation:** produce a `/api/mentor/private/reflect` snapshot before Phase-1 session 2 begins, alongside the `/api/reason` snapshot recommended above. These two snapshots together cover the load-bearing surfaces of the alt-3 build.

---

## Findings

After auditing all eight perimeter routes at the workflow level, the following findings are surfaced for founder review. They are organised by category. None of them is a design change — design changes follow founder approval.

### Flow ambiguities discovered

The audit's primary purpose was to check whether other R20a perimeter routes carry the same kind of flow ambiguity that surfaced for `/api/mentor/private/reflect` (one code path serving two practitioner flows with different architectural needs).

**Result: no other R20a perimeter route has an Option-1-shaped flow ambiguity.**

The check returned the following per-route status:

| Route | Flows on code path | Option-1-shaped ambiguity? |
|---|---|---|
| 1 — `/api/score` | One (single-action evaluation; iterative variant is same flow with richer context) | No |
| 2 — `/api/score-decision` | One (multi-option comparison; process-quality is same flow with richer input) | No |
| 3 — `/api/score-document` | Two (document mode + policy mode), distinguished by clean `mode` parameter | No (clean mode-switch, not flow ambiguity) |
| 4 — `/api/score-scenario` | One (scenario response evaluation; audience parameter shifts upstream prompting only) | No |
| 5 — `/api/score-social` | One (pre-publish filter; platform parameter shifts prompting nuance only) | No |
| 6 — `/api/reason` | Multiple (proximity-ring refresh, Stoic-check, alert-evaluation, agent-developer call) — all are *engine-level* compositions, not practitioner-flow ambiguities | No |
| 7 — `/api/reflect` | Two (anonymous evaluation vs authenticated persistence + profile update) — distinguished by `user_id` body param | Borderline — see below |
| 8 — `/api/mentor/private/reflect` | Two (daily-reflection ritual + future deferral-resolution surface) | Yes — already addressed by Option 1 |

**Borderline case — `/api/reflect`'s two flows.** The route's two flows differ only in side effects (persistence + profile update on the authenticated path; nothing on the anonymous path). Both flows return the same evaluation shape and produce the same visible output. This is *not* the Option-1-shaped ambiguity (where AC-18 needed to scope to one flow because the architectural argument applied to one flow only). The two `/api/reflect` flows have the same architectural shape — they are honestly the same flow with optional persistence — so AC-18 either applies to both or neither, and the analysis says neither (this is the daily-reflection surface, not the deferral-resolution surface).

**Conclusion:** Option 1 is sufficient for the perimeter as currently scoped. No further AC-18 scoping refinements are needed.

### AC-18 scoping refinements

None. Option 1 (adopted 2026-05-01) holds across the perimeter. The audit checked each route against the architectural argument behind AC-18 (philodoxia-as-reputation-mechanism — producing a sharable artefact at the surface where the practitioner's reasoning about themselves is at stake re-introduces the reputation mechanism the architecture was designed to remove). The argument applies specifically to the deferral-resolution surface; it does not apply to the score-family surfaces (those are evaluation-of-action surfaces, not reputation-generation surfaces) or to the document-evaluation surface (where the artefact is the document, not the practitioner's self-evaluation) or to the daily-reflection ritual surfaces (where visible output is the architectural intention).

### AC-13 trigger surfaces

Per-route Tier 1 / Tier 2 / Tier 3 trigger conditions were enumerated in each route's AC-13 section. The perimeter-wide picture:

- **High AC-13 applicability:** Routes 1, 2, 7, 8. These are real-action (or about-to-take-action) surfaces where intake clarification meaningfully changes evaluation outcome.
- **Medium AC-13 applicability:** Routes 3, 5. These surfaces evaluate artefacts (documents, posts) where the practitioner's narrative is in the artefact itself; clarification can still help but is less central.
- **Low AC-13 applicability:** Route 4. The practice surface where the practitioner is reasoning about a hypothetical, not their own action; AC-13's seams are downstream of the hypothetical framing.
- **Engine-level (load-bearing):** Route 6. AC-13 wiring lives at the engine and is inherited by Routes 1, 2, 4, 5, 7 via `runSageReason`. Route 3 (`/api/score-document`) and Route 7 (`/api/reflect`) bypass the engine for direct LLM calls; they would need their own AC-13 implementation or migration to engine-via-`runSageReason`.

The audit identifies new AC-13 trigger codes specific to particular surfaces (not present in the canonical alt-3 list of `ELEMENT_FUSION` / `SCOPE_AMBIGUITY` / `TEMPORAL_AMBIGUITY` / `STATED_OPERATIVE_CONFLICT` / `STATED_EQUANIMITY_UNVERIFIED`):

- `OPTION_SCOPE_INCONSISTENCY` (Route 2 — options at different oikeiosis circles).
- `OPTION_FALSE_ALTERNATIVE` (Route 2 — non-genuine alternatives).
- `STATED_PROCESS_INCONSISTENCY` (Route 2 — hasty option set with stated process).
- `DOCUMENT_OBJECT_AMBIGUITY` (Route 3 — sole-author vs co-authored document).
- `DOCUMENT_PURPOSE_AMBIGUITY` (Route 3 — unclear document audience).
- `POLICY_INSTITUTIONAL_DISTANCE` (Route 3 — practitioner evaluating institutional artefact).
- `RESPONSE_AMBIGUITY` (Route 4 — under-specified scenario response).
- `RESPONSE_SCENARIO_DRIFT` (Route 4 — practitioner responds to adjacent topic).
- `POST_ELEMENT_FUSION` (Route 5 — multiple distinct claims pasted as one block).
- `POST_PURPOSE_AMBIGUITY` (Route 5 — unclear platform context).
- `REFLECTION_NARRATIVE_THIN` (Route 7 — under-narrative reflection).
- `RESPONSE_FIELD_INCONSISTENCY` (Route 7 — `how_i_responded` describes different event than `what_happened`).

**Recommendation:** D13 (three-tier intake clarification specification) should expand its trigger catalogue to cover these per-surface codes, distinguishing engine-level triggers (firing on any input regardless of surface) from surface-level triggers (firing only on specific consumer surfaces). The expansion adds vocabulary to D13 but does not change its fundamental shape.

### AC-17 seams

Per-route AC-17 applicability was enumerated. Perimeter-wide picture:

- **High AC-17 salience (both seams operate centrally):** Routes 1, 2, 7, 8. Real-action and reflection surfaces where self-report and longitudinal-evidence dependencies are load-bearing.
- **Medium AC-17 salience:** Routes 3, 5. Artefact-evaluation surfaces; self-report applies to authorial-state classifications but longitudinal evidence is less directly accessible.
- **Low AC-17 salience:** Route 4. Practice surface; self-report dependencies are downstream of the hypothetical.
- **Engine-level:** Route 6. AC-17 wiring at the engine is the canonical implementation; surface consumers project the flags into Layer 3 prose differently per surface.

**Recommendation:** D19 (residual seams handling) is the deliverable that operationalises AC-17. The audit findings inform D19's per-surface flag-projection rules. D19 should specify that AC-17 flags fire at the engine (Route 6) and project differently per Layer 3 consumer (e.g., on `/api/reflect`, the prose surfaces a longitudinal-pattern observation; on `/api/score-document`, the prose surfaces an authorial-state caveat; on `/api/score-scenario`, the flags can be discounted given the hypothetical context).

### Coverage gaps in D2 mapping tables

The audit identified the following coverage gaps:

1. **`prior_feedback` (Route 1) is not represented.** Currently a Layer 1 input shape used by the iterative-refinement variant. Recommend a brief D2 note projecting it onto the practitioner profile's recent-interaction signals.
2. **Aggregate-across-options outputs (Route 2) are not represented.** The `recommended` field and `process_quality` field are decision-comparison-specific aggregate projections. Recommend a brief D2 note that decision-comparison surfaces produce *aggregate projections* across N independent canonical evaluations, distinct from per-instance projections.
3. **Policy-mode-specific fields (Route 3) are not represented.** `deliberation_assessment`, `oikeiosis_impact`, and `flagged_clauses[]` need projection mappings. Recommend a new D2 Table 6 for policy-mode shapes.
4. **`depth: 'quick'` projection (Route 6) is not represented.** D2 covers standard (Table 1) and deep (Table 2) depths; the three-mechanism quick-depth shape is not mapped. Recommend adding a quick-depth table (Table 0 or Table 1a).
5. **D2 Table 4a's dual applicability (Routes 7 + 8 ritual flow) is not made explicit.** The table is named the "ritual surface" projection; both `/api/reflect` and `/api/mentor/private/reflect`'s ritual flow project through it. Recommend a brief heading amendment to make the dual applicability explicit.

These are coverage refinements to D2 — they extend the canonical mapping tables without changing the 9+1 mechanism set or the decomposition logic. They can be folded into a D2 amendment in Phase-1 session 2 alongside the D14a / D14b design work.

### Snapshots needed

The audit recommends two snapshots before Phase-1 session 2 begins, and six snapshots before Phase 3+ migration:

| Route | Snapshot urgency | Reason |
|---|---|---|
| 1 — `/api/score` | Phase 3+ migration | Score-family migration is Phase 3+; snapshot can land then. |
| 2 — `/api/score-decision` | Phase 3+ migration | Same as Route 1; plus the page-side defects identified should be documented in the snapshot. |
| 3 — `/api/score-document` | Phase 3+ migration | Architecturally distinct (direct `client.messages.create` rather than `runSageReason`); largest of the score-family migrations. |
| 4 — `/api/score-scenario` | Phase 3+ migration | Practice surface, lower priority. |
| 5 — `/api/score-social` | Phase 3+ migration | Compact V3 surface, mapping is clean in D2. |
| 6 — `/api/reason` | **Before Phase-1 session 2** | Engine entry point; alt-3 transforms its internal logic most directly; dual-auth and three-depth shape not captured anywhere else. |
| 7 — `/api/reflect` | Medium urgency | Audit findings (KG1 rule 2 candidates, `user_id` finding) are independent of Phase 1; snapshot can land alongside founder decision on those findings. |
| 8 — `/api/mentor/private/reflect` | **Before Phase-1 session 2** | Phase 2 pass 1 builds the deferral-resolution flow (D14b) on this route's territory; ritual flow (D14a) needs snapshot for engine-substitution verification. |

The two **before-Phase-1-session-2 snapshots** are the audit's single most concrete urgency recommendation. Without them, Phase 2 pass 1 would proceed against an incomplete behavioural reference and KG3 (hub-label end-to-end contract) would have no canonical record of the existing ritual / deferral split.

### Phase-1 session-2 scope changes

The audit findings affect Phase-1 session-2 scope as follows:

1. **D14a (daily-reflection ritual endpoint).** No fundamental redesign required. The endpoint preserves today's behaviour. Audit observations to fold in: `/api/reflect` (public sister) projects through the same D2 Table 4a mapping; the endpoint's KG1 rule 2 candidate violations on `/api/reflect` (analytics insert, reflection persistence insert, distress-event insert) are the founder's separate decision. D14a should specify the per-flow side-effect profile cleanly (anonymous vs authenticated; founder-only vs public).
2. **D14b (deferral-resolution surface).** No fundamental redesign required. The audit confirms AC-18 is correctly scoped to this surface and that the architectural argument is internally consistent. D14b's specification can proceed as scoped.
3. **D11 (Layer 3 translation specification).** Add per-consumer projection rules for the route-specific shapes identified in this audit:
   - The reader_triggered_passions invitation-language framing for `/api/score-social` (R20d alignment).
   - The institutional-distance soft clarification for `/api/score-document` policy mode.
   - The AC-17-flag projection rules per surface (the per-surface-prose differentiation flagged under "AC-17 seams" above).
4. **D13 (three-tier intake clarification specification).** Expand the trigger catalogue to cover the surface-specific codes identified above (`OPTION_SCOPE_INCONSISTENCY`, `DOCUMENT_OBJECT_AMBIGUITY`, etc.). Distinguish engine-level from surface-level triggers.
5. **D9 (rule dependency map and engine sequencing logic).** No change required from this audit — the dependency map is internal to the engine, not consumer-facing.
6. **D10 (Layer 1 translation specification).** No change required.
7. **D15 (long-deferred questions handling).** No change required — the three principles (engine doesn't nag, OPEN_DEFERRAL flags visible in scoring record, mentor names pattern at next natural opportunity) are surface-agnostic.
8. **D2 amendment for coverage gaps.** Five small additions per the "Coverage gaps in D2 mapping tables" finding above. Can be folded into Phase-1 session 2 as a D2 amendment alongside the new deliverables.

The audit does **not** propose new Phase-1 deliverables. The 23 deliverables already scoped (with D14 split into 14a + 14b) are sufficient. The audit's contribution is *refinement* of those deliverables' scope.

### Audit findings on existing route behaviour (independent of Phase 1)

These findings surface defects or ambiguities in the *current* routes that are independent of Phase 1 design. They are the founder's separate decision; the audit does not propose fixes.

1. **Route 2 — Ops Hub malformed body.** `/ops-hub/page.tsx` posts `{ option1, option2 }` to `/api/score-decision`, which expects `{ decision, options[] }`. The Ops Hub Stoic decision-scoring panel is non-functional on its current page-side path. Either the page was written against an older route schema and never updated, or the route was updated and the page was missed. Decision: leave broken; fix in Ops Hub session; or make the route accept both shapes. The audit does not recommend; the founder decides.
2. **Route 2 — Ops Hub missing distress handling.** The Ops Hub callers of `/api/score-decision` and `/api/reason` do not check `data.distress_detected` before rendering. If the route returns a distress redirect, the page would render the distress payload as if it were a result. R20a perimeter conformance is route-side; page-side conformance is a parallel concern. Decision: fix in a focused page-side pass; or accept as known limitation. The audit notes this as an R20a *page-side coverage gap* — the route is conformant but the page is not.
3. **Route 6 — Ops Hub missing distress handling.** Same as item 2; affects two Ops Hub call sites.
4. **Routes 2, 7 — KG1 rule 2 candidate violations on analytics inserts.** Both routes use `.then(() => {})` fire-and-forget patterns on analytics inserts. KG1 rule 2 says Vercel terminates execution after response; fire-and-forget writes may not complete. Decision: await all analytics inserts; or accept the data loss; or move analytics to an explicit background pattern. The audit notes this is a *quasi-systematic pattern* across the codebase (the audit grep found similar fire-and-forget patterns in `/api/score-document` Step 15 and other routes); a single decision and pass would address them all.
5. **Route 7 — fire-and-forget on safety-relevant insert.** The distress-event log insert at `/api/reflect` Step 6 is fire-and-forget. Distress events are part of the safety-monitoring trail; losing them silently defeats the monitoring. **More urgent than the analytics inserts.**
6. **Route 7 — `user_id` vs `auth.user.id` discrimination.** The route persists reflections to the body-supplied `user_id` without verifying it matches `auth.user.id`. R17 (intimate data protection) finding — an authenticated user could potentially write a reflection to another user's record. **Recommendation:** add the equality check, or drop the body parameter and use `auth.user.id` directly.
7. **Routes 1, 2, 6 — partial R20a input coverage.** These routes run distress detection on the *primary input field only* (`action`, `decision`, `input`) and not on related fields (`relationships`, `emotional_state`, `context`, `domain_context`, individual option strings). Practical risk is low (a practitioner in distress is unlikely to compose a careful primary field while revealing distress only in secondary fields), but the asymmetry is a coverage gap. Decision: broaden the distress check to all user-controlled string inputs; or accept the asymmetry. Route 7 (`/api/reflect`) is already correctly broad — it scans the concatenation of `what_happened` and `how_i_responded`.

These seven findings are the audit's contribution to the *current-state* picture of the perimeter. They are not Phase 1 design changes. They are surfaced for the founder to triage and decide on outside the Phase 1 scope.

---

## Recommendations

The audit recommends:

### On Option 1 sufficiency

**Option 1 (the AC-18 scoping correction adopted 2026-05-01) is sufficient as written.** No further scoping refinements are needed across the R20a perimeter. The architectural argument behind AC-18 applies specifically to the deferral-resolution surface; the audit confirms that no other route in the perimeter triggers the same architectural concern. The Option-1-shaped flow ambiguity is unique to the daily-reflection-ritual / deferral-resolution split on `/api/mentor/private/reflect`.

### On Phase-1 session 2 scoping

**Phase-1 session 2 should proceed as scoped, with the following refinements:**

- D14a, D14b, D11, D13 receive the per-route refinements identified in the "Phase-1 session-2 scope changes" section above.
- D2 receives a coverage-gap amendment alongside the new deliverables (the five additions identified in the "Coverage gaps in D2 mapping tables" finding).
- The audit does *not* recommend adding new Phase-1 deliverables. The 23-deliverable scope (with D14 split into 14a + 14b) is sufficient.

### On snapshots before Phase-1 session 2

**The audit recommends two snapshots before Phase-1 session 2 begins:**

1. `/api/reason` snapshot — engine entry point, dual-auth pattern, three-depth surface.
2. `/api/mentor/private/reflect` snapshot — ritual flow as it stands today (so D14a's engine substitution can be verified post-build) and the architectural placeholder for the deferral-resolution flow (which D14b specifies and Phase 2 builds).

These snapshots would land in `/archive/` following the D6-A archive protocol and would update KG3 (hub-label end-to-end contract) where relevant. They are the only Phase-1-session-2-blocking work the audit identifies.

The remaining six snapshots (Routes 1, 2, 3, 4, 5, 7) can land alongside Phase 3+ migration planning. None is urgent.

### On current-state findings (independent of Phase 1)

The seven current-state findings under "Audit findings on existing route behaviour" are the founder's separate decision. The audit does not recommend a unified fix; the findings span Standard (page-side defects) to Critical (R20a / R17 perimeter) classifications and need triage:

- Items 4, 5 (KG1 rule 2 candidates including the safety-relevant distress-event log) are Standard-to-Elevated and could be addressed in a focused await-pass session.
- Item 6 (`user_id` vs `auth.user.id`) is Critical under PR6 (R17 intimate data protection perimeter) and warrants the Critical Change Protocol regardless of urgency.
- Items 1, 2, 3 (Ops Hub page-side defects) are Standard and can be addressed in an Ops Hub focused session whenever the founder prioritises that surface.
- Item 7 (partial R20a input coverage) is Elevated and warrants a perimeter-wide policy decision before any per-route fix.

### On the audit itself

The audit confirms the architectural soundness of the alt-3 design. The translation-sandwich + deterministic engine + three-tier clarification + reflect-endpoint-first build order architecture is internally consistent, AC-18 is correctly scoped under Option 1, and the eight perimeter routes can be migrated in the order Phase 2 specifies (deferral-resolution surface first, conversation surface second, score-family Phase 3+) without architectural conflict.

**The audit does not propose any code changes, design changes, or manifest edits.** Its purpose was to verify whether Phase-1 session 2 could proceed against the existing critical-path drafts (D2, D3, D8) without further scoping work. The answer is yes — with the small refinements identified above, Phase-1 session 2 has a clear path forward.

---

## Approval gate

Phase-1 session 2 does not begin until the founder has:

1. Reviewed and approved (or sent back) the critical-path drafts D2, D3, D8 — per the predecessor session's existing approval gate.
2. Reviewed and approved (or sent back) this audit deliverable's findings and recommendations.

Both must be settled before Phase-1 session 2 begins. They are independent — the founder may approve one and not the other — but both gates must clear before downstream Phase-1 work proceeds.

The audit-session close lists the founder-performable verification steps for this deliverable.

---

*End of Deliverable 24.*



