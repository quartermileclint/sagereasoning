# Snapshot — `/api/reason` Pre-Alt-3 As-Built Behaviour

**Status:** Snapshot (documentary).
**Date:** 2026-05-02.
**Stream:** founder.
**Purpose:** Per D24 §"Snapshots needed" + §"Route 6 — `/api/reason`" — a documentary record of the universal reasoning layer end-to-end behaviour as it stands today, before the alt-3 deterministic engine substitution lands at Phase-2 pass 3 (conversation surface migration). This snapshot is the comparison reference for post-build verification when `/api/reason` migrates to the Layer 1 → engine → Layer 3 sandwich (AC-12). Mirrors the shape of the companion snapshot at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`.

**Route source as of this snapshot:** `/website/src/app/api/reason/route.ts` (155 lines). Engine source: `/website/src/lib/sage-reason-engine.ts` (612 lines). Git ref: `0820b1d` (working tree clean at session open; `13414ad component registry` is the v1.4.0 registry-update commit immediately preceding this snapshot session). Page-side callers: `/website/src/app/private-mentor/page.tsx`, `/website/src/app/mentor-hub/page.tsx`, `/website/src/app/ops-hub/page.tsx`, `/website/src/app/mentor-index/page.tsx`.

**Cross-references:**
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture; AC-12 / AC-13 / AC-17 / AC-19 — the substitution this snapshot precedes).
- `/adopted/rag-mentor-alt3/migration-plan.md` (D21 — Phase-2 pass 3 sequencing; the snapshot is pass-3 verification reference).
- `/adopted/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — Route 6 §"Server-side workflow", §"Caller A–H", §"As-built rollback baseline pointer", which named this snapshot the highest-priority of the perimeter).
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 — Tables 1, 2 project `/api/reason` standard-depth and deep-depth shapes onto the canonical 9+1 mechanism set).
- `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md` (the companion snapshot — same shape, sister surface).
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (the existing mentor-pipeline snapshot — partial coverage of `/api/reason` as the proximity-ring refresh call; this snapshot is the dedicated full-shape coverage).
- `/manifest.md` AC1 (model reliability boundaries — Haiku for `quick`, Sonnet for `standard`/`deep`), AC2 (safety system latency budget — R20a two-stage classifier), AC4 (invocation testing for safety functions — `enforceDistressCheck(detectDistressTwoStage(input))` is the canonical call pattern), AC5 (R20a perimeter — Route 6 of 8), AC6 (four-layer context architecture), AC7 (Session 7b standing constraint — not engaged this snapshot), KG1 (Vercel five rules — particularly rule 2 await all DB writes; route is stateless, so KG1 rule 2 N/A at the route level — the cache write is in-process, not DB), KG2 (Haiku reliability boundary — depth-based model selection enforces this), KG3 (hub-label end-to-end contract — N/A this route; no `mentor_interactions` writes), KG5 (token-count method — Anthropic `usage` ground truth available), R3 (R3 disclaimer in every evaluative response), R4 (system prompts server-side only), R6a–R6e (methodology rules — engine is the canonical 9+1 mechanism implementation per D2), R7 (source fidelity — full prompts captured below), R8a (Greek identifiers in API responses), R20a (vulnerable user detection — Step 4 below).

---

## Plain-language summary

The `/api/reason` route is the universal reasoning layer and the engine entry point for SageReasoning. It is the most architecturally central of the eight R20a perimeter routes per D24: it accepts both authenticated user sessions (JWT) **and** API-key callers (agent developers using SageReasoning as a service), and it serves three depths — `quick` (3 mechanisms — Haiku per KG2), `standard` (5 mechanisms — Sonnet), `deep` (6 mechanisms — Sonnet). Most other R20a perimeter routes call into the same engine via `runSageReason`; the routes are wrappers that add domain-specific framing. `/api/reason` is the wrapper-free entry point.

The route validates and authenticates (dual-mode), runs R20a distress detection on the primary input field, validates depth, loads the practitioner context (if a user JWT is present) and project context (always — at `'condensed'` level) in parallel, then invokes `runSageReason` with the Stoic Brain context (Layer 1) sized to the requested depth. The engine assembles a system block (depth-specific system prompt) plus an optional Stoic Brain block, builds the user message (`Apply the Stoic reasoning mechanisms to the following input. Input: <input>` plus optional `context`, `domain_context`, practitioner context, project context, urgency context), checks an in-process cache, calls Claude (Haiku for `quick`; Sonnet for `standard` / `deep`), parses JSON with one retry-on-failure (quick escalates Haiku → Sonnet — KG2 conformant — standard / deep retry same model), validates required fields per depth, generates a reasoning receipt via `extractReceipt`, caches the result, and returns the canonical evaluation envelope. No database write occurs at the route or engine layer — the route is stateless evaluation with in-process cache.

This snapshot is the documentary record of that end-to-end behaviour. After Phase-2 pass 3 substitutes the deterministic engine for the direct Claude call (per D21 migration plan), this snapshot is the reference for verifying the substitution preserves visible output (the engine envelope) and the route's dual-auth, three-depth, agent-facing contract.

## Server-side workflow (`/api/reason/route.ts`)

### Step 1 — Rate-limit gate

`checkRateLimit(request, RATE_LIMITS.scoring)`. Standard scoring rate limit (per `/lib/security`). Same gate as Routes 1, 2, 3, 4, 5, 7, 8.

### Step 2 — Authentication gate (dual mode)

This is the **one R20a-perimeter route that accepts API-key callers in addition to user sessions** (per D24 §"Route 6 — Step 2 — Authentication gate"). The route attempts user JWT first, then falls back to API key:

```
const auth = await requireAuth(request)
const apiKey = auth.error ? await validateApiKey(request, 'other') : null
if (auth.error && (!apiKey || !apiKey.valid)) return auth.error
```

The request is rejected only if **both** auth methods fail. This dual-mode is what makes `/api/reason` the agent-developer-facing surface as well as a website-internal surface. Practitioner context (Layer 2) only loads when `auth.user?.id` is present (Step 6 below); API-key callers proceed without practitioner personalisation. KG4 is the canonical reference pattern for this dual-auth shape — the alt-3 design (Phase-2 pass 3) must preserve this contract per D24 §"Phase-1 session 2 implication".

### Step 3 — Body parse

```
const { input, context, depth: requestedDepth, domain_context, urgency_context } = body
```

Required: `input` (string, non-empty after trim).
Optional: `context` (string), `depth` (`'quick'` | `'standard'` | `'deep'` — defaults to `'standard'`), `domain_context` (string), `urgency_context` (string).

Returns 400 if `input` missing, non-string, or empty after trim.

### Step 4 — Length validation

`validateTextLength(input, 'Input', TEXT_LIMITS.medium)` plus the same gate for `context` and `domain_context`. Returns 400 with the named field on overflow.

### Step 5 — R20a vulnerable-user detection (before any LLM call)

```
const gate = await enforceDistressCheck(detectDistressTwoStage(input))
if (gate.shouldRedirect) {
  return NextResponse.json(
    { distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message },
    { status: 200, headers: corsHeaders() }
  )
}
```

R20a perimeter conformance: this is the canonical call pattern per AC4 — `enforceDistressCheck` returns a `SafetyGate` (compile-time proof that the distress classifier has been awaited before any reasoning proceeds). The route has the **third-of-eight** input-coverage profile per D24 §Audit findings item 7: distress detection runs on the primary `input` field only, not on `context`, `domain_context`, or `urgency_context`. (Routes 1, 2, 6 share this partial coverage; Routes 7, 8 have broader coverage — Route 8 scans the concatenation of `what_happened` and `how_i_responded`.) This asymmetry is logged in D24 §Audit findings as a separate triage decision; not in scope for this snapshot.

If `gate.shouldRedirect`:
- 200 response with `distress_detected: true`, severity, redirect_message.
- No engine called.
- No reasoning persisted (the route is stateless anyway — no analytics insert, no reasoning_results write).

**Page-side R20a coverage gap (D24 §Audit findings items 2 + 3):** the Ops Hub callers of `/api/reason` (`handleStoicCheck` line 45 and `handleAlertEvaluation` line 93) do not check `data.distress_detected` before rendering. If the route returns a distress redirect, the Ops Hub page would render the distress payload as if it were a reasoning result. Logged for separate triage; not in scope for this snapshot.

### Step 6 — Depth validation

```
const VALID_DEPTHS: ReasonDepth[] = ['quick', 'standard', 'deep']
const depth: ReasonDepth = requestedDepth || 'standard'
if (!VALID_DEPTHS.includes(depth)) return 400
```

Defaults to `'standard'` if omitted.

### Step 7 — Context-layer loading (parallel)

Two parallel loads via `Promise.all` (with the practitioner-context loader gated by `auth.user?.id`):

```
const [practitionerContext, projectContext] = await Promise.all([
  auth.user?.id ? getPractitionerContext(auth.user.id) : Promise.resolve(null),
  getProjectContext('condensed'),
])
```

- **Layer 2 (practitioner context):** loaded only if `auth.user.id` is present. `null` for API-key callers (agents have no user identity to personalise against). KG4 — Layer 2 applicability vs wiring: API-key callers are Not Applicable, not Not Wired.
- **Layer 3 (project context):** always loaded at `'condensed'` level. AC6 placement: project context lives in the user message (per AC6 the project context is dynamic per request and belongs in the user message; the engine's `runSageReason` injects it accordingly — see Step 9 below).

Plus **Layer 1 (Stoic Brain)** loaded synchronously after the parallel block:

```
const stoicBrainContext = getStoicBrainContext(depth)
```

The depth parameter sizes the Layer 1 block. AC6 placement: Stoic Brain is cached expertise and lives in the system block (the engine injects it as a second `text` block after the depth-specific system prompt — see Step 9 below).

If `getProjectContext` throws, the route returns 500 for all callers. Acceptable at single-user traffic; at scale this would warrant a try/catch with null fallback (documented in route header comments lines 60–62).

### Step 8 — Engine invocation

```
const result = await runSageReason({
  input, context, depth, domain_context, urgency_context,
  stoicBrainContext, practitionerContext, projectContext
})
return NextResponse.json(result, { headers: corsHeaders() })
```

The engine's behaviour is captured in §"Engine-internal workflow" below.

### Step 9 — Error handling (try/catch wrapper)

The body of the POST handler from Step 3 onward is wrapped in try/catch. Any thrown error returns 500 with the error message (or 'Internal server error' if the error is non-`Error`). `console.error('sage-reason API error:', error)` is logged.

### Step 10 — CORS preflight

The route exports `OPTIONS` returning `corsPreflightResponse()`. Same preflight contract as Route 8.

## Engine-internal workflow (`runSageReason` in `sage-reason-engine.ts`)

The route delegates the entire reasoning work to `runSageReason`. The engine is the single source of truth for the four-stage Stoic evaluation (lines 371–612 of the engine source).

### Engine Step 1 — Depth resolution

```
const depth: ReasonDepth = params.depth || 'standard'
const config = DEPTH_CONFIG[depth]
```

`DEPTH_CONFIG` (engine lines 348–352):

| Depth | System prompt | Max tokens | Model |
|---|---|---|---|
| `quick` | `QUICK_SYSTEM_PROMPT` (3 mechanisms) | 3072 | `MODEL_FAST` (Haiku per `model-config.ts`) |
| `standard` | `STANDARD_SYSTEM_PROMPT` (5 mechanisms) | 6000 | `MODEL_DEEP` (Sonnet per `model-config.ts`) |
| `deep` | `DEEP_SYSTEM_PROMPT` (6 mechanisms) | 8192 | `MODEL_DEEP` (Sonnet per `model-config.ts`) |

**KG2 conformance (Haiku reliability boundary):** the depth-based model selection enforces KG2. Quick depth's three-mechanism shape produces simple JSON within Haiku's reliability boundary. Standard and deep both use Sonnet because their five- and six-mechanism shapes exceed the Haiku boundary. The engine retry path (Engine Step 6 below) escalates `quick` → Sonnet on parse failure, providing a second-chance compliance with AC1's "2-retry threshold before escalating to Sonnet" budget (one retry, escalation built in).

### Engine Step 2 — User-message construction

```
let userMessage = `Apply the Stoic reasoning mechanisms to the following input.\n\nInput: ${params.input.trim()}`
if (params.context?.trim())          userMessage += `\nContext: ${params.context.trim()}`
if (params.domain_context?.trim())   userMessage += `\n\nDOMAIN CONTEXT (this reasoning request is being made in the context of a specific domain):\n${params.domain_context.trim()}`
if (params.practitionerContext)      userMessage += `\n\n${params.practitionerContext}`
if (params.projectContext)           userMessage += `\n\n${params.projectContext}`
if (params.urgency_context?.trim())  userMessage += `\n\nURGENCY CONTEXT: ${params.urgency_context.trim()}\n` +
                                       `IMPORTANT: This action is being taken under time pressure. Apply EXTRA scrutiny to the passion diagnosis. ` +
                                       `Specifically check for hasty assent (propeteia) — is the urgency itself a passion (phobos/fear) driving action ` +
                                       `without adequate examination? In your response, add a "hasty_assent_risk" field with value "high", "moderate", "low", or "none" ` +
                                       `indicating whether urgency is compromising deliberation quality.`
userMessage += '\n\nReturn only the JSON evaluation object.'
```

The user-message-side context layers (Layer 2 practitioner, Layer 3 project, Layer 4 environmental, Layer 5 mentor knowledge base) honour AC6 placement — per-request content in the user message.

### Engine Step 3 — Cache check

```
const ck = cacheKey('/api/reason', { input: params.input.trim(), context: params.context?.trim(), domain_context: params.domain_context?.trim(), depth })
const cached = cacheGet(ck)
if (cached) return { result: { ...cached, disclaimer: EVALUATIVE_DISCLAIMER }, meta: { ... ai_model: config.model, latency_ms: ... } }
```

In-process cache (per `model-config.ts`). The cache key is `(input, context, domain_context, depth)` — not `practitioner_context` or `project_context` (those vary per request but are not cached against because they vary with practitioner state and project phase respectively, which would defeat caching). On cache hit, the engine returns immediately with the cached evaluation plus the canonical disclaimer.

### Engine Step 4 — System-message assembly (AC6 — system block)

```
const systemMessages = [
  { type: 'text', text: params.systemPromptOverride || config.prompt, cache_control: { type: 'ephemeral' } },
]
if (params.stoicBrainContext)  systemMessages.push({ type: 'text', text: stoicBrainBlock })
if (params.agentBrainContext)  systemMessages.push({ type: 'text', text: params.agentBrainContext })
```

Three system blocks max:
- **Block 1:** the depth-specific system prompt (or override). Carries `cache_control: { type: 'ephemeral' }` for Anthropic prompt caching.
- **Block 2:** the Stoic Brain context (Layer 1, depth-sized). When the route caller provides it, the engine injects it. Auto-generation disabled per the engine's source comment lines 446–449 — the existing system prompts produce a specific JSON structure that consumers depend on; auto-injection would change LLM output structure and break consumers.
- **Block 3:** an optional agent-brain context (tech / growth / support / ops). Not provided by `/api/reason` route directly — used by hub-internal callers.

Layer 4 (environmental) and Layer 5 (mentor knowledge base) are appended to the user message after system assembly (engine lines 466–473) — also AC6-conformant (per-request content in user message).

### Engine Step 5 — Anthropic call

```
const message = await client.messages.create({
  model: config.model,
  max_tokens: config.maxTokens,
  temperature: 0.2,
  system: systemMessages,
  messages: [{ role: 'user', content: userMessage }],
})
const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
```

Temperature `0.2` (low — favours determinism for structured output). Direct Claude call.

### Engine Step 6 — JSON parse with retry-on-failure (KG2 escalation path)

```
try {
  evalData = extractJSON(responseText)
} catch {
  const retryModel = (depth === 'quick' && config.model === MODEL_FAST) ? MODEL_DEEP : config.model
  // retry once with retryModel; quick escalates Haiku → Sonnet; standard/deep retry same model
  try {
    const retryMessage = await client.messages.create({ model: retryModel, ... })
    evalData = extractJSON(retryText)
    actualModel = retryModel
    retried = true
  } catch (retryError) {
    // Second failure — return structured error envelope, NOT a 500
    return { result: { error: 'reasoning_parse_failure', error_detail: '...', depth, model, input_length, disclaimer }, meta: { ai_generated: false, ... } }
  }
}
```

Engine lines 487–542. Two parse failures return a graceful structured error rather than a 500. Quick depth's escalation Haiku → Sonnet honours KG2 (cost-justified retry on the harder model when the cheaper model fails to produce parseable JSON).

`extractJSON` strips markdown fences and parses (per `/lib/json-utils`).

### Engine Step 7 — Diagnostic validation (warnings, not throws)

```
if (typeof evalData !== 'object' || evalData === null || Array.isArray(evalData))
  console.warn(`sage-reason-engine: Unexpected response type '${...}' at depth '${depth}'. Response tail: ${responseTail}`)
else if (!('katorthoma_proximity' in evalData))
  console.warn(`sage-reason-engine: Missing katorthoma_proximity at depth '${depth}'. Keys present: [${...}]. Response tail: ${responseTail}`)
```

Engine lines 553–562. Catches Session-7b-style nesting regressions early without throwing.

### Engine Step 8 — Required-field validation (per depth)

```
const REQUIRED_FIELDS = {
  quick:    ['control_filter', 'passion_diagnosis', 'oikeiosis', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
  standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
  deep:     ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
}
for (const field of REQUIRED_FIELDS[depth]) {
  if (evalData[field] === undefined) throw new Error(`Reasoning engine missing field: ${field}`)
}
```

A missing required field causes a thrown error — caught by the route's try/catch (Step 9) and returned as 500.

### Engine Step 9 — Reasoning receipt

```
const receipt = extractReceipt({
  skillId: `sage-reason-${depth}`,
  input: params.input.trim(),
  evalData,
  mechanisms: DEPTH_MECHANISMS[depth] as MechanismId[],
})
evalData.reasoning_receipt = receipt
```

Per `/lib/reasoning-receipt`. Receipt skill ID encodes the depth.

### Engine Step 10 — Cache write

```
cacheSet(ck, evalData)
```

In-process only. No DB write.

### Engine Step 11 — Result assembly

```
return {
  result: { ...evalData, disclaimer: EVALUATIVE_DISCLAIMER },
  meta: {
    endpoint: '/api/reason',
    depth,
    mechanisms_applied: DEPTH_MECHANISMS[depth],
    mechanism_count: DEPTH_MECHANISMS[depth].length,
    ai_generated: true,
    ai_model: actualModel,
    latency_ms: latencyMs,
    stage_scores: stageScores,           // when present in response (Item 5)
    hasty_assent_risk: hastyAssentRisk,  // when urgency_context provided (Item 6)
    urgency_applied: !!params.urgency_context?.trim(),
  },
}
```

R3 disclaimer (`EVALUATIVE_DISCLAIMER` engine line 365) is added to every evaluation result. Mechanism list and count match the depth's `DEPTH_MECHANISMS` constant.

## Page-side workflow (multiple callers)

`/api/reason` has the most heterogeneous caller set of any R20a perimeter route per D24 §"4. Flow distinctions". The five distinct caller flows:

### Caller A — `/private-mentor/page.tsx` `fetchProximityScore` (proximity ring widget refresh)

The private-mentor page calls `/api/reason` after each ritual or mentor turn to refresh the proximity ring widget:

```
const res = await fetch('/api/reason', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: <recent message text>, depth: 'quick' })
})
```

**Known issue carried forward (D24 + existing 2026-04-29 mentor-pipeline snapshot step 24):** the proximity ring widget's displayed values are partly hard-coded in `fetchProximityScore` rather than derived from the `/api/reason` response. The call is made; the response is partially ignored on the page side. Documented as an existing issue; not in scope for this snapshot. Phase-2 pass 3's verification protocol must address whether the proximity-ring caller's effective dependency on `/api/reason` is intended to be wired through (and the page-side fixed) or whether the call should be removed.

### Caller B — `/mentor-hub/page.tsx`

Two call sites:
- Line 123 (`handleSubmit` main interaction) — calls `/api/reason` analogously to private-mentor for periodic reasoning evaluation alongside the conversation surface.
- Line 168 (proximity-update handler) — proximity-ring refresh on the mentor hub's surface.

The mentor-hub callers post user JWT (authenticated session); the engine loads Layer 2 practitioner context for these callers.

### Caller C — `/ops-hub/page.tsx`

Two call sites:
- Line 45 (`handleStoicCheck`) — generic Stoic evaluation entry; `depth: 'standard'`.
- Line 93 (`handleAlertEvaluation`) — evaluating alert text; `depth: 'quick'`.

**Page-side audit finding carried forward (D24 §Audit findings items 2 + 3):** Neither Ops Hub caller checks `data.distress_detected` before rendering. If the route returns a distress redirect, the page renders the distress payload as if it were a reasoning result. Logged for separate triage.

### Caller D — `/mentor-index/page.tsx` (skill discovery)

The mentor-index page declares `/api/reason` as the endpoint for several skill cards (lines 33, 46, 59, 74, 88, 102) but does not directly POST from the page. Each card presents a "try this skill" affordance that posts to `/api/reason` with skill-specific `domain_context`. This is the agent-developer-discovery flow rather than a practitioner-evaluation flow.

### Caller E — Internal sage-reason engine reuse (`sage-reason-engine.ts`)

The engine itself uses `/api/reason` as a cache-key prefix (engine line 428) and as the canonical endpoint name in caller envelopes. Not a runtime call — a labelling convention.

### Caller F — Skill registry (`skill-registry.ts`)

Three skill entries point to `/api/reason` with depth metadata (`quick` 3-mechanism, `standard` 5-mechanism, `deep` 6-mechanism). These are skill-discovery entries for the agent-developer-facing API surface (`/api/skills`), not runtime callers.

### Caller G — Composability hints in other routes

Routes 1, 4, 5, 7 plus `/api/baseline`, `/api/evaluate`, `/api/score-iterate`, `/api/skill/sage-classify`, `/api/skill/sage-prioritise`, `/api/patterns` all include `/api/reason` in their `composability.next_steps[]` envelope hints. Post-result recommendations to the agent caller, not direct runtime calls.

### Caller H — Skill handlers calling the engine via direct function import

Other website routes (sage-classify, sage-prioritise, baseline, evaluate, patterns, score-iterate) compose `/api/reason`'s engine into their own pipelines via direct function call to `runSageReason` (not over HTTP, per Vercel KG1 rule 1 no self-calls). These are internal compositions, not separate flows from the engine's perspective.

## System prompts (full text per R7 source fidelity)

Three system prompts, one per depth. Preserved verbatim from `sage-reason-engine.ts` at git ref `0820b1d`.

### `QUICK_SYSTEM_PROMPT` (engine lines 140–189)

> You are the sage-reason universal reasoning engine for sagereasoning.com. Apply the Stoic core triad to any decision and return structured JSON.
>
> **MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)**
> Identify what is within the agent's moral choice (eph' hemin: judgements, impulses, desires, aversions, character) and what is not. External outcomes are identified but not evaluated.
>
> **MECHANISM 2 — PASSION DIAGNOSIS**
> Which of the 4 root passions (epithumia/craving, hedone/irrational pleasure, phobos/fear, lupe/distress) distort reasoning? Identify false judgements and map them to the causal stage: impression (phantasia) → assent (synkatathesis) → impulse (horme) → action (praxis).
>
> Root passions and sub-species:
> - Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
> - Hedone: kelesis, epichairekakia, terpsis
> - Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
> - Lupe: eleos, phthonos, zelotypia, penthos, achos
>
> **MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)**
> Map the 5 expanding circles of concern: self-preservation, household, local community, political community, humanity/cosmopolis. For each relevant circle, assess obligation status and tensions. Apply Cicero's 5 questions: Is it honourable? More honourable? Advantageous? More advantageous? (Honourable prevails.)
>
> **PROXIMITY ASSESSMENT (qualitative only):**
> reflexive | habitual | deliberate | principled | sage_like
>
> Returns ONLY valid JSON shape: `control_filter`, `passion_diagnosis`, `oikeiosis`, `katorthoma_proximity`, `philosophical_reflection`, `improvement_path`, `stage_scores` (control_filter / passion_diagnosis / oikeiosis), `disclaimer`.

### `STANDARD_SYSTEM_PROMPT` (engine lines 191–259)

> You are the sage-reason universal reasoning engine for sagereasoning.com. Apply 5 Stoic mechanisms to any decision and return structured JSON.
>
> Mechanisms 1–3 as above (Control Filter / Passion Diagnosis / Oikeiosis), plus:
>
> **MECHANISM 4 — VALUE ASSESSMENT (Preferred Indifferents)**
> Identify which preferred indifferents are at stake (Life, Health, Pleasure, Beauty, Strength, Wealth, Reputation, Noble birth, and negatives: Death, Disease, Pain, Ugliness) and whether the agent confuses them with genuine goods or treats indifferents as evils.
>
> **MECHANISM 5 — KATHEKON ASSESSMENT (Appropriate Action)**
> Is this action appropriate given natural relationships, reasonable justification, and role obligations?
>
> Returns ONLY valid JSON shape: mechanisms 1–5 plus `katorthoma_proximity`, `ruling_faculty_state`, `virtue_domains_engaged`, `philosophical_reflection`, `improvement_path`, `stage_scores` (control_filter / passion_diagnosis / oikeiosis / value_assessment / kathekon_assessment), `disclaimer`.

### `DEEP_SYSTEM_PROMPT` (engine lines 261–345)

> You are the sage-reason universal reasoning engine for sagereasoning.com. Apply all 6 Stoic mechanisms to any decision and return structured JSON. This is the deepest analysis available.
>
> Mechanisms 1–5 as above, plus:
>
> **MECHANISM 6 — ITERATIVE REFINEMENT (Progress Tracking)**
> Assess progress along 4 dimensions: passion reduction (frequency, intensity, duration), judgement quality (consistency of testing impressions), disposition stability (virtue under pressure), oikeiosis extension (expanding circles of concern). Senecan grades: pre_progress, grade_1, grade_2, grade_3. Direction of travel: improving | stable | declining.
>
> Returns ONLY valid JSON shape: mechanisms 1–6 plus `katorthoma_proximity`, `ruling_faculty_state`, `virtue_domains_engaged`, `philosophical_reflection`, `improvement_path`, `stage_scores` (six entries), `disclaimer`.

(Full schema specifications are preserved in `sage-reason-engine.ts` at the cited line ranges. The above captures the structural content per R7.)

The shared closing instruction across all three depths: `Return ONLY valid JSON — no markdown` (quick) / `Return ONLY valid JSON` (standard, deep). The user-message tail `Return only the JSON evaluation object.` is appended by the engine at Step 2.

## Schema reference (no DB write at this route)

`/api/reason` is **stateless**. The route does not write to any database table. There is no `reasoning_results` table; there is no `reasoning_evaluations` table. Reasoning evaluations are computed per request and returned to the caller; the caller persists if it chooses to (Caller B — mentor-hub — persists derived state to its own profile-update path; Caller C — ops-hub — does not persist; Caller A — private-mentor — does not persist beyond the proximity-ring-widget's hard-coded display).

The engine's in-process cache (`cacheSet` engine line 587) is the only "storage" — and it is process-local (cleared on Vercel cold start; not durable across requests on different Lambda instances).

This statelessness is one of the route's load-bearing architectural facts: the engine is multi-tenant by construction (the same engine call shape serves both authenticated practitioners and anonymous API-key callers without per-tenant DB state). The alt-3 substitution (Phase-2 pass 3) must preserve this property — adding DB writes at the engine layer would change the route's contract significantly.

**KG1 rule 2 conformance:** N/A at the route level (no DB writes). The route is fully Vercel-conformant.

**KG3 conformance:** N/A at the route level (no `mentor_interactions` writes; no hub-scoped reads). The route operates outside the hub-label contract space.

## Architectural facts captured for post-build comparison

1. **Visible output shape (per depth):**
   - **`quick`:** `control_filter`, `passion_diagnosis` (collapsed root + sub-species + causal stage + false judgements + correct judgements), `oikeiosis` (collapsed stage + obligation), `katorthoma_proximity`, `philosophical_reflection`, `improvement_path`, `stage_scores` (3-entry), `reasoning_receipt`, `disclaimer`.
   - **`standard`:** quick fields plus `value_assessment`, `kathekon_assessment`, `ruling_faculty_state`, `virtue_domains_engaged`, `stage_scores` (5-entry).
   - **`deep`:** standard fields plus `iterative_refinement` (`senecan_grade`, `progress_dimensions`, `direction_of_travel`), `stage_scores` (6-entry).
   - Plus `meta` envelope: `endpoint`, `depth`, `mechanisms_applied[]`, `mechanism_count`, `ai_generated`, `ai_model`, `latency_ms`, optional `stage_scores`, optional `hasty_assent_risk`, optional `urgency_applied`.

2. **D2 mapping (per the canonical-framework D2):**
   - `STANDARD_SYSTEM_PROMPT` shape → D2 Table 1 (5-mechanism → canonical 9+1).
   - `DEEP_SYSTEM_PROMPT` shape → D2 Table 2 (6-mechanism → canonical 9+1).
   - `QUICK_SYSTEM_PROMPT` shape → **D2 has no dedicated table for this — coverage gap surfaced in D24 §"Coverage gaps in D2 mapping tables" item 4. Stream B of this session adds a quick-depth table (Table 0 or Table 1a).**

3. **Persistence shapes:** None at this route. Stateless evaluation only.

4. **Diagnostic fields surfaced:** `meta.ai_generated`, `meta.ai_model` (the actual model used post-retry-escalation if any), `meta.latency_ms`, `meta.urgency_applied`, `meta.hasty_assent_risk` (when urgency context applied), `meta.stage_scores` (when present in response).

5. **Latency profile:** dominated by the Sonnet call for `standard` (max 6000 tokens) and `deep` (max 8192 tokens); Haiku call for `quick` (max 3072 tokens). R20a two-stage classifier adds ~500ms for borderline inputs (per AC2 — accepted, not optimised). Context loading is parallel (Layer 2 + Layer 3); Layer 1 loaded synchronously after the parallel block. Cache hits return immediately (no LLM call).

6. **R20a perimeter compliance:** `enforceDistressCheck(detectDistressTwoStage(input))` is the canonical call pattern; AC4 invocation testing covers this route. Input coverage is the primary `input` field only (D24 §Audit findings item 7 — partial coverage shared with Routes 1 and 2; logged for separate triage).

7. **Dual-auth contract (D24 §"Caller A–H" + KG4 canonical reference):** the route accepts both user JWT and API key; user JWT loads Layer 2 practitioner context, API key does not. This dual-auth pattern is the engine entry point's defining architectural property and must be preserved through Phase-2 pass 3.

8. **KG2 conformance (model selection by depth):** quick → Haiku; standard / deep → Sonnet; quick retry escalates Haiku → Sonnet. The depth boundary is the architectural enforcement of KG2 at this route.

9. **AC-13 wiring (per D24 §"Route 6" — load-bearing for the perimeter):** `/api/reason` is the canonical entry point where AC-13 wiring should live for the engine itself. Tier 1 / Tier 2 / Tier 3 triggers operationalised by the engine on the input it receives; the route is responsible for flowing the trigger results back to the caller. This is the load-bearing AC-13 wiring for the entire R20a perimeter (Routes 1, 2, 4, 5, 7 inherit AC-13 by calling into the engine; Route 3 — `/api/score-document` direct LLM call — would need its own AC-13 implementation or migration to the engine).

10. **AC-17 wiring (per D24 §"Route 6"):** `/api/reason`'s output should carry both AC-17 flags (`SELF_REPORT_DEPENDENT`, `CONFIDENCE_WEIGHTED`) directly. The engine is the canonical AC-17 implementation; surface consumers project the flags into Layer 3 prose differently per surface (per D11 Refinement 3).

## Verification of this snapshot

This is a documentary snapshot. Verification is the founder reading the snapshot and confirming it captures observable behaviour from a recent `/api/reason` call. To verify:

1. From any of the page-side callers (private-mentor, mentor-hub, ops-hub), trigger a call that exercises `/api/reason`. Submit input that does not trigger R20a distress.
2. Inspect the network response in browser dev tools. Confirm the `result` envelope contains the depth-appropriate fields (Quick: 3-mechanism shape; Standard: 5-mechanism; Deep: 6-mechanism) plus `meta.endpoint === '/api/reason'`, `meta.depth`, `meta.ai_model` (Haiku for quick, Sonnet for standard/deep), `meta.mechanism_count` (3, 5, or 6).
3. Compare against the system-prompt schemas above (R7 source fidelity). Field names should match.
4. For an API-key-callable verification (agent-developer flow): send a POST to `/api/reason` with an `x-api-key` header (no JWT). Confirm the route accepts the call and returns the same envelope shape with `practitionerContext` having had no effect (Layer 2 not loaded for API-key callers).
5. Trigger a known-distress input (the audit's recommended test fixtures). Confirm the response is `{ distress_detected: true, severity, redirect_message }` and that no engine call occurred (distinguishable by absence of `result`/`meta`/`reasoning_receipt`).

If any divergence appears between the snapshot text and observed behaviour, the snapshot is updated (or annotated) before Phase-2 pass 3 begins.

## Comparison reference for Phase-2 pass 3

D21's migration plan specifies Phase-2 pass 3 as the conversation surface migration. The pass substitutes the deterministic engine for the direct Claude call inside `runSageReason`. After substitution:

1. With pre-pass-3 behaviour reproduced (rollback path) — submit a reasoning request → record the response. Output should match this snapshot's per-depth shape.
2. With pass-3 engine path — submit the same request → record the response. Output should produce the same canonical fields with semantically equivalent content; wording may differ (engine-path prose comes from Layer 3's projection per D11 / D2 mapping tables).

Pass criterion: all required fields populated in both runs per the depth's `REQUIRED_FIELDS`; structural fields canonical; semantic equivalence (no contradictory passion diagnosis or proximity verdict for the same input). The dual-auth contract preserved (API-key callers accepted with no Layer 2). The R20a perimeter call pattern preserved (`enforceDistressCheck(detectDistressTwoStage(input))` at Step 5; AC4 invocation test passing).

If the engine path's output diverges in structural shape (missing required fields; incorrect proximity values; absent depth-specific extensions like `iterative_refinement` for deep; missing `meta.mechanisms_applied` array), Phase-2 pass 3 has a regression. Rollback: revert the engine substitution; the route reverts to today's behaviour as documented in this snapshot.

---

*End of snapshot. Documentary record only — preserved at `/archive/2026-05-02_api-reason_pre-alt-3-snapshot.md` for reference during Phase-2 pass 3 verification. Companion snapshot at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md` covers Route 8 (the daily-reflection ritual surface).*
